export type EstimateExportRow = {
  plot_id: string;
  plot_code: string;
  area_rai: number;
  farmer_name: string;
  province: string;
  season_id: string;
  version: number;
  status: string;
  total_offset_tco2e: number | null;
  sf_w: number | null;
  sf_p: number | null;
  sf_o: number | null;
  nitrogen_total_kg_per_rai: number | null;
  baseline_ch4: number | null;
  project_ch4: number | null;
  baseline_n2o: number | null;
  project_n2o: number | null;
  baseline_co2: number | null;
  project_co2: number | null;
  burning_emissions: number | null;
  verification_label: string;
};

const NOT_VERIFIED = "estimate — not yet verified";

/**
 * Fetch all carbon estimates with plot/farmer context for export.
 */
export async function getAllEstimates(db: D1Database): Promise<EstimateExportRow[]> {
  const { results } = await db
    .prepare(
      `SELECT
        ce.plot_id,
        p.plot_code,
        p.area_rai,
        f.full_name AS farmer_name,
        f.addr_province AS province,
        ce.season_id,
        ce.version,
        ce.status,
        ce.total_offset_tco2e,
        ce.sf_w,
        ce.sf_p,
        ce.sf_o,
        ce.nitrogen_total_kg_per_rai,
        ce.baseline_ch4,
        ce.project_ch4,
        ce.baseline_n2o,
        ce.project_n2o,
        ce.baseline_co2,
        ce.project_co2,
        ce.burning_emissions
      FROM carbon_estimates ce
      JOIN plots p ON p.id = ce.plot_id
      JOIN farmers f ON f.id = p.farmer_id
      ORDER BY f.addr_province, p.plot_code, ce.season_id, ce.version`,
    )
    .bind()
    .all<EstimateExportRow>();

  const rows = results ?? [];
  return rows.map((row) => ({ ...row, verification_label: NOT_VERIFIED }));
}

const CSV_HEADERS = [
  "plot_id",
  "plot_code",
  "area_rai",
  "farmer_name",
  "province",
  "season_id",
  "version",
  "status",
  "total_offset_tco2e",
  "sf_w",
  "sf_p",
  "sf_o",
  "nitrogen_total_kg_per_rai",
  "baseline_ch4",
  "project_ch4",
  "baseline_n2o",
  "project_n2o",
  "baseline_co2",
  "project_co2",
  "burning_emissions",
  "verification_label",
] as const;

/**
 * Convert estimate rows to CSV string.
 */
export function estimatesToCSV(rows: EstimateExportRow[]): string {
  const header = CSV_HEADERS.join(",");
  const lines = rows.map((row) => CSV_HEADERS.map((h) => String(row[h] ?? "")).join(","));
  return [header, ...lines].join("\n");
}
