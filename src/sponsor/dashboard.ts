export type PlotSummary = {
  plot_id: string;
  plot_code: string;
  area_rai: number;
  farmer_name: string;
  province: string;
  district: string;
  total_offset_tco2e: number | null;
  latest_season_id: string | null;
  estimate_status: string | null;
  water_state_tallies?: { flooded: number; dry: number };
  provenance_counts?: { machine: number; human: number };
};

export type PlotDetail = {
  plot_id: string;
  plot_code: string;
  area_rai: number;
  farmer_name: string;
  province: string;
  district: string;
  season_id: string | null;
  water_management: string | null;
  estimate_status: string | null;
  total_offset_tco2e: number | null;
  sf_w: number | null;
  sf_p: number | null;
  sf_o: number | null;
  nitrogen_total_kg_per_rai: number | null;
  verification_label: string;
  water_state_tallies: {
    flooded: number;
    dry: number;
  };
  provenance_counts: {
    machine: number;
    human: number;
  };
};

export type ProvinceGroup = {
  province: string;
  plots: PlotSummary[];
};

const NOT_VERIFIED = "estimate — not yet verified";

/**
 * Query D1 for all plots with their latest carbon estimate,
 * then group by province.
 */
export async function getPlotsByProvince(db: D1Database): Promise<ProvinceGroup[]> {
  const { results } = await db
    .prepare(
      `SELECT
        p.id AS plot_id,
        p.plot_code,
        p.area_rai,
        f.full_name AS farmer_name,
        f.addr_province AS province,
        f.addr_district AS district,
        ce.total_offset_tco2e,
        ce.season_id AS latest_season_id,
        ce.status AS estimate_status
      FROM plots p
      JOIN farmers f ON f.id = p.farmer_id
      LEFT JOIN carbon_estimates ce
        ON ce.plot_id = p.id
        AND ce.version = (
          SELECT MAX(c2.version)
          FROM carbon_estimates c2
          WHERE c2.plot_id = p.id
        )
      ORDER BY f.addr_province, p.plot_code`,
    )
    .bind()
    .all<Omit<PlotSummary, "water_state_tallies" | "provenance_counts">>();

  const rows = results ?? [];

  // Enrich each plot with water-state tallies and provenance counts
  const enriched: PlotSummary[] = await Promise.all(
    rows.map(async (row) => {
      const [tallies, provenance] = await Promise.all([
        getWaterStateTallies(db, row.plot_id, row.latest_season_id),
        getProvenanceCounts(db, row.plot_id, row.latest_season_id),
      ]);
      return { ...row, water_state_tallies: tallies, provenance_counts: provenance };
    }),
  );

  return groupByProvince(enriched);
}

function groupByProvince(rows: PlotSummary[]): ProvinceGroup[] {
  const map = new Map<string, PlotSummary[]>();

  for (const row of rows) {
    const province = row.province ?? "Unknown";
    const existing = map.get(province) ?? [];
    existing.push(row);
    map.set(province, existing);
  }

  return Array.from(map.entries()).map(([province, plots]) => ({
    province,
    plots,
  }));
}

/**
 * Fetch a single plot with its latest carbon estimate and season inputs.
 */
export async function getPlotDetail(db: D1Database, plotId: string): Promise<PlotDetail | null> {
  const { results } = await db
    .prepare(
      `SELECT
        p.id AS plot_id,
        p.plot_code,
        p.area_rai,
        f.full_name AS farmer_name,
        f.addr_province AS province,
        f.addr_district AS district,
        ce.season_id,
        si.water_management,
        ce.status AS estimate_status,
        ce.total_offset_tco2e,
        ce.sf_w,
        ce.sf_p,
        ce.sf_o,
        ce.nitrogen_total_kg_per_rai
      FROM plots p
      JOIN farmers f ON f.id = p.farmer_id
      LEFT JOIN carbon_estimates ce
        ON ce.plot_id = p.id
        AND ce.version = (
          SELECT MAX(c2.version)
          FROM carbon_estimates c2
          WHERE c2.plot_id = p.id
        )
      LEFT JOIN season_inputs si
        ON si.plot_id = p.id AND si.season_id = ce.season_id
      WHERE p.id = ?`,
    )
    .bind(plotId)
    .all<Omit<PlotDetail, "verification_label" | "water_state_tallies" | "provenance_counts">>();

  const row = (results ?? [])[0];
  if (!row) return null;

  // Fetch water-state tallies for this plot-season
  const waterStateTallies = await getWaterStateTallies(db, plotId, row.season_id);
  
  // Fetch provenance counts for this plot-season
  const provenanceCounts = await getProvenanceCounts(db, plotId, row.season_id);

  return { 
    ...row, 
    verification_label: NOT_VERIFIED,
    water_state_tallies: waterStateTallies,
    provenance_counts: provenanceCounts,
  };
}

/**
 * Get water-state tallies (flooded/dry counts) for a plot-season.
 */
async function getWaterStateTallies(
  db: D1Database, 
  plotId: string, 
  seasonId: string | null
): Promise<{ flooded: number; dry: number }> {
  if (!seasonId) {
    return { flooded: 0, dry: 0 };
  }

  const { results } = await db
    .prepare(
      `SELECT water_state, COUNT(*) as count
       FROM photo_evidence
       WHERE plot_id = ? AND season_id = ? AND photo_type = 'wetdry' AND water_state IS NOT NULL
       GROUP BY water_state`,
    )
    .bind(plotId, seasonId)
    .all<{ water_state: string; count: number }>();

  const tallies = { flooded: 0, dry: 0 };
  for (const row of results ?? []) {
    if (row.water_state === "flooded") {
      tallies.flooded = row.count;
    } else if (row.water_state === "dry") {
      tallies.dry = row.count;
    }
  }
  return tallies;
}

/**
 * Get provenance counts (machine vs human stamps) for a plot-season.
 */
async function getProvenanceCounts(
  db: D1Database,
  plotId: string,
  seasonId: string | null
): Promise<{ machine: number; human: number }> {
  if (!seasonId) {
    return { machine: 0, human: 0 };
  }

  const { results } = await db
    .prepare(
      `SELECT 
        CASE 
          WHEN pre_verified = 1 AND superseded = 0 THEN 'machine'
          WHEN admin_status = 'verified' THEN 'human'
        END as provenance_type,
        COUNT(*) as count
       FROM photo_evidence
       WHERE plot_id = ? AND season_id = ?
         AND (
           (pre_verified = 1 AND superseded = 0)
           OR admin_status = 'verified'
         )
       GROUP BY provenance_type`,
    )
    .bind(plotId, seasonId)
    .all<{ provenance_type: string; count: number }>();

  const counts = { machine: 0, human: 0 };
  for (const row of results ?? []) {
    if (row.provenance_type === "machine") {
      counts.machine = row.count;
    } else if (row.provenance_type === "human") {
      counts.human = row.count;
    }
  }
  return counts;
}

// ─── Sponsor summary & farmers aggregation ───

// ponytail: POC carbon price constant. Upgrade: move to env var or config table when pricing becomes dynamic.
const CARBON_PRICE_USD_PER_TON = 200;

export type SponsorSummary = {
  totalCO2Tons: number;
  totalPlots: number;
  totalFarmers: number;
  paymentEstimateUSD: number;
  methodologyBreakdown: { awd: number; biochar: number; fertilization: number };
};

export type SponsorFarmerRow = {
  farmer_id: string;
  farmer_name: string;
  province: string;
  plotCount: number;
  totalTCO2e: number;
  progressPercent: number;
};

export async function getSponsorSummary(db: D1Database): Promise<SponsorSummary> {
  const [co2Row, plotsRow, farmersRow, methodRows] = await Promise.all([
    db.prepare(`SELECT SUM(coalesce(ce.total_offset_tco2e, 0)) as total_co2 FROM carbon_estimates ce`).bind().all<{ total_co2: number | null }>(),
    db.prepare(`SELECT COUNT(DISTINCT p.id) as total_plots FROM plots p`).bind().all<{ total_plots: number }>(),
    db.prepare(`SELECT COUNT(DISTINCT f.id) as total_farmers FROM farmers f`).bind().all<{ total_farmers: number }>(),
    db.prepare(
      `SELECT si.water_management, COUNT(*) as cnt FROM season_inputs si GROUP BY si.water_management`,
    ).bind().all<{ water_management: string | null; cnt: number }>(),
  ]);

  const totalCO2Tons = (co2Row.results?.[0]?.total_co2) ?? 0;
  const totalPlots = plotsRow.results?.[0]?.total_plots ?? 0;
  const totalFarmers = farmersRow.results?.[0]?.total_farmers ?? 0;

  // Methodology breakdown: compute percentages from season_inputs water_management values
  const methodCounts = methodRows.results ?? [];
  const total = methodCounts.reduce((s, r) => s + r.cnt, 0);
  const pct = (key: string) => {
    if (total === 0) return 0;
    const row = methodCounts.find((r) => r.water_management === key);
    return Math.round(((row?.cnt ?? 0) / total) * 100);
  };

  return {
    totalCO2Tons,
    totalPlots,
    totalFarmers,
    paymentEstimateUSD: totalCO2Tons * CARBON_PRICE_USD_PER_TON,
    methodologyBreakdown: {
      awd: pct("AWD"),
      biochar: pct("Biochar"),
      fertilization: pct("Fertilization"),
    },
  };
}

export async function getSponsorFarmers(db: D1Database): Promise<SponsorFarmerRow[]> {
  const { results } = await db
    .prepare(
      `SELECT
        f.id AS farmer_id,
        f.full_name AS farmer_name,
        f.addr_province AS province,
        COUNT(DISTINCT p.id) AS plot_count,
        COALESCE(SUM(ce.total_offset_tco2e), 0) AS total_tco2e,
        COUNT(CASE WHEN pe.admin_status = 'verified' THEN 1 END) AS verified_photos,
        COUNT(pe.id) AS total_photos
      FROM farmers f
      JOIN plots p ON p.farmer_id = f.id
      LEFT JOIN carbon_estimates ce ON ce.plot_id = p.id
      LEFT JOIN photo_evidence pe ON pe.plot_id = p.id
      GROUP BY f.id, f.full_name, f.addr_province
      ORDER BY total_tco2e DESC`,
    )
    .bind()
    .all<{
      farmer_id: string;
      farmer_name: string;
      province: string;
      plot_count: number;
      total_tco2e: number;
      verified_photos: number;
      total_photos: number;
    }>();

  return (results ?? []).map((r) => ({
    farmer_id: r.farmer_id,
    farmer_name: r.farmer_name,
    province: r.province,
    plotCount: r.plot_count,
    totalTCO2e: r.total_tco2e,
    progressPercent: r.total_photos > 0 ? Math.round((r.verified_photos / r.total_photos) * 100) : 0,
  }));
}
