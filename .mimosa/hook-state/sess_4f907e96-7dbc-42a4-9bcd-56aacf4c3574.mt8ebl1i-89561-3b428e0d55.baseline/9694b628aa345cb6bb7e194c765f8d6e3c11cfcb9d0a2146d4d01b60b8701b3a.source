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
    .all<PlotSummary>();

  const rows = results ?? [];
  return groupByProvince(rows);
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
    .all<PlotDetail>();

  const row = (results ?? [])[0];
  if (!row) return null;
  return { ...row, verification_label: NOT_VERIFIED };
}
