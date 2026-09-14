export type PlotSummary = {
  plot_id: string;
  plot_code: string;
  area_rai: number;
  cpa_code: string;
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
  cpa_code: string;
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
        f.cpa_code,
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
    .all<PlotBase>();

  const rows = results ?? [];
  const enriched = await batchEnrichPlots(db, rows);

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

type PlotBase = Omit<PlotSummary, "water_state_tallies" | "provenance_counts">;

/**
 * H2 fix: Batch-enrich plots with water-state tallies and provenance counts.
 * Replaces N+1 per-plot queries with 2 batch queries using WHERE plot_id IN (...).
 */
async function batchEnrichPlots(db: D1Database, rows: PlotBase[]): Promise<PlotSummary[]> {
  if (rows.length === 0) return [];

  // Collect unique (plot_id, season_id) pairs that have a season
  const plotSeasons = rows
    .filter((r) => r.latest_season_id)
    .map((r) => ({ plot_id: r.plot_id, season_id: r.latest_season_id! }));

  if (plotSeasons.length === 0) {
    return rows.map((r) => ({
      ...r,
      water_state_tallies: { flooded: 0, dry: 0 },
      provenance_counts: { machine: 0, human: 0 },
    }));
  }

  const plotIds = [...new Set(plotSeasons.map((ps) => ps.plot_id))];
  const placeholders = plotIds.map(() => "?").join(", ");

  // Batch query 1: water-state tallies grouped by plot_id
  const { results: talliesRows } = await db
    .prepare(
      `SELECT plot_id, water_state, COUNT(*) as count
       FROM photo_evidence
       WHERE plot_id IN (${placeholders})
         AND photo_type = 'wetdry' AND water_state IS NOT NULL
       GROUP BY plot_id, water_state`,
    )
    .bind(...plotIds)
    .all<{ plot_id: string; water_state: string; count: number }>();

  // Build lookup: plot_id -> { flooded, dry }
  const talliesMap = new Map<string, { flooded: number; dry: number }>();
  for (const row of talliesRows ?? []) {
    let entry = talliesMap.get(row.plot_id);
    if (!entry) {
      entry = { flooded: 0, dry: 0 };
      talliesMap.set(row.plot_id, entry);
    }
    if (row.water_state === "flooded") entry.flooded = row.count;
    else if (row.water_state === "dry") entry.dry = row.count;
  }

  // Batch query 2: provenance counts grouped by plot_id
  const { results: provRows } = await db
    .prepare(
      `SELECT plot_id,
        CASE
          WHEN pre_verified = 1 AND superseded = 0 THEN 'machine'
          WHEN admin_status = 'verified' THEN 'human'
        END as provenance_type,
        COUNT(*) as count
       FROM photo_evidence
       WHERE plot_id IN (${placeholders})
         AND (
           (pre_verified = 1 AND superseded = 0)
           OR admin_status = 'verified'
         )
       GROUP BY plot_id, provenance_type`,
    )
    .bind(...plotIds)
    .all<{ plot_id: string; provenance_type: string; count: number }>();

  // Build lookup: plot_id -> { machine, human }
  const provMap = new Map<string, { machine: number; human: number }>();
  for (const row of provRows ?? []) {
    let entry = provMap.get(row.plot_id);
    if (!entry) {
      entry = { machine: 0, human: 0 };
      provMap.set(row.plot_id, entry);
    }
    if (row.provenance_type === "machine") entry.machine = row.count;
    else if (row.provenance_type === "human") entry.human = row.count;
  }

  // Merge enrichments into plot rows
  return rows.map((r) => ({
    ...r,
    water_state_tallies: talliesMap.get(r.plot_id) ?? { flooded: 0, dry: 0 },
    provenance_counts: provMap.get(r.plot_id) ?? { machine: 0, human: 0 },
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
        f.cpa_code,
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
  seasonId: string | null,
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
  seasonId: string | null,
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
  /** Sponsor-scoped: total rai under management */
  totalAreaRai: number;
  /** Sponsor-scoped: unique CPA households */
  totalHouseholds: number;
};

export type SponsorFarmerRow = {
  farmer_id: string;
  cpa_code: string;
  province: string;
  plotCount: number;
  totalTCO2e: number;
  progressPercent: number;
};

/**
 * Build a WHERE clause + bind values for area-scoping.
 * When areas is null/empty, returns no filter (backward-compat for admin callers).
 */
export type SponsorFilters = { province?: string; areaCode?: string; season?: string };

function areaFilter(areas: string[] | null, filters: SponsorFilters = {}): { clause: string; values: string[] } {
  const clauses: string[] = [];
  const values: string[] = [];
  if (areas && areas.length > 0) {
    clauses.push(`AND f.addr_province IN (${areas.map(() => "?").join(", ")})`);
    values.push(...areas);
  }
  if (filters.province) {
    clauses.push("AND f.addr_province = ?");
    values.push(filters.province);
  }
  if (filters.areaCode) {
    clauses.push("AND f.addr_province = ?");
    values.push(filters.areaCode);
  }
  return { clause: clauses.join(" "), values };
}

/** Fetch the `areas` JSON column for a sponsor user. Returns parsed array or null. */
export async function getSponsorAreas(db: D1Database, userId: string): Promise<string[] | null> {
  const row = await db
    .prepare("SELECT areas FROM users WHERE id = ?")
    .bind(userId)
    .first<{ areas: string | null }>();
  if (!row?.areas) return null;
  try {
    const parsed = JSON.parse(row.areas);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function getSponsorSummary(
  db: D1Database,
  areas?: string[] | null,
  filters: SponsorFilters = {},
): Promise<SponsorSummary> {
  const af = areaFilter(areas ?? null, filters);
  const joinClause =
    af.values.length > 0
      ? `JOIN plots p ON ce.plot_id = p.id JOIN farmers f ON f.id = p.farmer_id`
      : "";
  const whereClause = af.clause;

  const [co2Row, plotsRow, farmersRow, methodRows, areaRow, hhRow] = await Promise.all([
    db
      .prepare(
        `SELECT SUM(coalesce(ce.total_offset_tco2e, 0)) as total_co2 FROM carbon_estimates ce ${joinClause} WHERE 1=1 ${whereClause}`,
      )
      .bind(...af.values)
      .all<{ total_co2: number | null }>(),
    db
      .prepare(
        `SELECT COUNT(DISTINCT p.id) as total_plots FROM plots p JOIN farmers f ON f.id = p.farmer_id WHERE 1=1 ${whereClause}`,
      )
      .bind(...af.values)
      .all<{ total_plots: number }>(),
    db
      .prepare(
        `SELECT COUNT(DISTINCT f.id) as total_farmers FROM farmers f WHERE 1=1 ${whereClause}`,
      )
      .bind(...af.values)
      .all<{ total_farmers: number }>(),
    db
      .prepare(
        `SELECT si.water_management, COUNT(*) as cnt
       FROM season_inputs si
       JOIN plots p ON p.id = si.plot_id
       JOIN farmers f ON f.id = p.farmer_id
       WHERE 1=1 ${whereClause}
       GROUP BY si.water_management`,
      )
      .bind(...af.values)
      .all<{ water_management: string | null; cnt: number }>(),
    db
      .prepare(
        `SELECT COALESCE(SUM(p.area_rai), 0) as total_rai FROM plots p JOIN farmers f ON f.id = p.farmer_id WHERE 1=1 ${whereClause}`,
      )
      .bind(...af.values)
      .all<{ total_rai: number }>(),
    db
      .prepare(
        `SELECT COUNT(DISTINCT f.id) as total_hh FROM farmers f JOIN plots p ON p.farmer_id = f.id WHERE 1=1 ${whereClause}`,
      )
      .bind(...af.values)
      .all<{ total_hh: number }>(),
  ]);

  const totalCO2Tons = co2Row.results?.[0]?.total_co2 ?? 0;
  const totalPlots = plotsRow.results?.[0]?.total_plots ?? 0;
  const totalFarmers = farmersRow.results?.[0]?.total_farmers ?? 0;
  const totalAreaRai = areaRow.results?.[0]?.total_rai ?? 0;
  const totalHouseholds = hhRow.results?.[0]?.total_hh ?? 0;

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
    totalAreaRai,
    totalHouseholds,
    paymentEstimateUSD: totalCO2Tons * CARBON_PRICE_USD_PER_TON,
    methodologyBreakdown: {
      awd: pct("AWD"),
      biochar: pct("Biochar"),
      fertilization: pct("Fertilization"),
    },
  };
}

export async function getSponsorFarmers(
  db: D1Database,
  areas?: string[] | null,
  filters: SponsorFilters = {},
): Promise<SponsorFarmerRow[]> {
  const af = areaFilter(areas ?? null, filters);
  const whereClause = af.clause;

  const { results } = await db
    .prepare(
      `SELECT
        f.id AS farmer_id,
        f.cpa_code,
        f.addr_province AS province,
        COUNT(DISTINCT p.id) AS plot_count,
        COALESCE(SUM(ce.total_offset_tco2e), 0) AS total_tco2e,
        COUNT(CASE WHEN pe.admin_status = 'verified' THEN 1 END) AS verified_photos,
        COUNT(pe.id) AS total_photos
      FROM farmers f
      JOIN plots p ON p.farmer_id = f.id
      LEFT JOIN carbon_estimates ce ON ce.plot_id = p.id
      LEFT JOIN photo_evidence pe ON pe.plot_id = p.id
      WHERE 1=1 ${whereClause}
      GROUP BY f.id, f.cpa_code, f.addr_province
      ORDER BY total_tco2e DESC`,
    )
    .bind(...af.values)
    .all<{
      farmer_id: string;
      cpa_code: string;
      province: string;
      plot_count: number;
      total_tco2e: number;
      verified_photos: number;
      total_photos: number;
    }>();

  return (results ?? []).map((r) => ({
    farmer_id: r.farmer_id,
    cpa_code: r.cpa_code,
    province: r.province,
    plotCount: r.plot_count,
    totalTCO2e: r.total_tco2e,
    progressPercent:
      r.total_photos > 0 ? Math.round((r.verified_photos / r.total_photos) * 100) : 0,
  }));
}

// ─── Area-scoped plots by province ───

export async function getPlotsByProvinceScoped(
  db: D1Database,
  areas?: string[] | null,
  filters: SponsorFilters = {},
): Promise<ProvinceGroup[]> {
  const af = areaFilter(areas ?? null, filters);
  const whereClause = af.clause;

  const { results } = await db
    .prepare(
      `SELECT
        p.id AS plot_id,
        p.plot_code,
        p.area_rai,
        f.cpa_code,
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
      WHERE 1=1 ${whereClause}
      ORDER BY f.addr_province, p.plot_code`,
    )
    .bind(...af.values)
    .all<PlotBase>();

  const rows = results ?? [];
  const enriched = await batchEnrichPlots(db, rows);

  return groupByProvince(enriched);
}

// ─── GHG emission source table ───

export type GhgSourceRow = {
  source: string;
  baseline: number;
  project: number;
  reduction: number;
};

export async function getGhgSourceBreakdown(
  db: D1Database,
  areas?: string[] | null,
  filters: SponsorFilters = {},
): Promise<GhgSourceRow[]> {
  const af = areaFilter(areas ?? null, filters);
  const joinClause =
    af.values.length > 0
      ? `JOIN plots p ON ce.plot_id = p.id JOIN farmers f ON f.id = p.farmer_id`
      : "";
  const whereClause = af.clause;

  const { results } = await db
    .prepare(
      `SELECT
        COALESCE(SUM(ce.baseline_ch4), 0) as baseline_ch4,
        COALESCE(SUM(ce.project_ch4), 0) as project_ch4,
        COALESCE(SUM(ce.baseline_n2o), 0) as baseline_n2o,
        COALESCE(SUM(ce.project_n2o), 0) as project_n2o,
        COALESCE(SUM(ce.baseline_co2), 0) as baseline_co2,
        COALESCE(SUM(ce.project_co2), 0) as project_co2
      FROM carbon_estimates ce
      ${joinClause}
      WHERE 1=1 ${whereClause}`,
    )
    .bind(...af.values)
    .all<{
      baseline_ch4: number;
      project_ch4: number;
      baseline_n2o: number;
      project_n2o: number;
      baseline_co2: number;
      project_co2: number;
    }>();

  const row = (results ?? [])[0];
  if (!row) return [];

  return [
    {
      source: "CH\u2084 (มีเทน)",
      baseline: row.baseline_ch4,
      project: row.project_ch4,
      reduction: row.baseline_ch4 - row.project_ch4,
    },
    {
      source: "N\u2082O (ไนตรัสออกไซด์)",
      baseline: row.baseline_n2o,
      project: row.project_n2o,
      reduction: row.baseline_n2o - row.project_n2o,
    },
    {
      source: "CO\u2082 (คาร์บอนไดออกไซด์)",
      baseline: row.baseline_co2,
      project: row.project_co2,
      reduction: row.baseline_co2 - row.project_co2,
    },
  ];
}

// ─── TVER Certificates ───

export type Certificate = {
  id: string;
  certificate_number: string;
  season_id: string;
  volume_tco2e: number;
  status: string;
  issued_at: string;
};

/**
 * List TVER certificates scoped to sponsor's areas.
 * If the carbon_credits table does not exist, returns an empty array gracefully.
 */
export async function getCertificates(
  db: D1Database,
  areas?: string[] | null,
): Promise<Certificate[]> {
  const af = areaFilter(areas ?? null);
  const joinClause =
    af.values.length > 0
      ? `JOIN plots pl ON cc.plot_id = pl.id JOIN farmers f ON f.id = pl.farmer_id`
      : "";
  const whereClause = af.clause;

  try {
    const { results } = await db
      .prepare(
        `SELECT
          cc.id,
          cc.certificate_number,
          cc.season_id,
          cc.volume_tco2e,
          cc.status,
          cc.issued_at
        FROM carbon_credits cc
        ${joinClause}
        WHERE 1=1 ${whereClause}
        ORDER BY cc.issued_at DESC`,
      )
      .bind(...af.values)
      .all<Certificate>();

    return (results ?? []).map((r) => ({
      id: r.id,
      certificate_number: r.certificate_number,
      season_id: r.season_id,
      volume_tco2e: r.volume_tco2e,
      status: r.status,
      issued_at: r.issued_at,
    }));
  } catch {
    // Table does not exist yet — return empty
    return [];
  }
}

// ─── Season credit data for chart ───

export type SeasonCreditRow = {
  season_id: string;
  season_name: string;
  estimated_tco2e: number;
  verified_tco2e: number;
};

export async function getSeasonCredits(
  db: D1Database,
  areas?: string[] | null,
  filters: SponsorFilters = {},
): Promise<SeasonCreditRow[]> {
  const af = areaFilter(areas ?? null, { ...filters, season: undefined });
  const seasonClause = filters.season ? " AND ce.season_id = ?" : "";
  if (filters.season) af.values.push(filters.season);
  const joinClause =
    af.values.length > 0
      ? `JOIN plots p ON ce.plot_id = p.id JOIN farmers f ON f.id = p.farmer_id`
      : "";
  const whereClause = af.clause;

  const { results } = await db
    .prepare(
      `SELECT
        ce.season_id,
        s.name as season_name,
        SUM(CASE WHEN ce.status IN ('draft', 'final') THEN ce.total_offset_tco2e ELSE 0 END) as estimated_tco2e,
        SUM(CASE WHEN ce.status = 'final' THEN ce.total_offset_tco2e ELSE 0 END) as verified_tco2e
      FROM carbon_estimates ce
      JOIN seasons s ON s.id = ce.season_id
      ${joinClause}
      WHERE 1=1 ${whereClause}${seasonClause}
      GROUP BY ce.season_id, s.name
      ORDER BY s.start_date DESC`,
    )
    .bind(...af.values)
    .all<SeasonCreditRow>();

  return (results ?? []).map((r) => ({
    season_id: r.season_id,
    season_name: r.season_name,
    estimated_tco2e: r.estimated_tco2e,
    verified_tco2e: r.verified_tco2e,
  }));
}
