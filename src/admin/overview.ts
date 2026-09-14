/**
 * Admin overview dashboard — KPI queries, work queue alerts, charts, and tables.
 */

type KpiFilters = { season?: string; province?: string };

type OverviewKpis = {
  totalFarmers: number;
  totalPlots: number;
  totalAreaRai: number;
  pendingReviews: number;
  totalCredits: number;
};

type WorkQueueAlerts = {
  pendingApplications: number;
  photoQueue: number;
  missingPhotos: number;
  sfwFallback: number;
  /** T075 — urgency levels for work queue items (AD-OV-03) */
  urgentApplications: number;
  urgentPhotos: number;
};

type CreditChartItem = {
  season: string;
  estimated: number;
  verified: number;
};

type GhgSourceItem = {
  source: string;
  value: number;
};

type ProvinceTableItem = {
  province: string;
  sponsor: string;
  plots: number;
  credits: number;
};

export async function getOverviewKpis(
  db: D1Database,
  filters: KpiFilters = {},
): Promise<OverviewKpis> {
  let whereClause = "";
  const conditions: string[] = [];
  const bindValues: unknown[] = [];

  if (filters.season) {
    conditions.push("ce.season_id = ?");
    bindValues.push(filters.season);
  }
  if (filters.province) {
    conditions.push("f.addr_province = ?");
    bindValues.push(filters.province);
  }
  if (conditions.length > 0) {
    whereClause = " WHERE " + conditions.join(" AND ");
  }

  const provinceFilter = filters.province ? ` WHERE addr_province = '${filters.province}'` : "";

  const farmerCountRow = await db
    .prepare(`SELECT COUNT(*) as cnt FROM farmers${provinceFilter}`)
    .bind()
    .first<{ cnt: number }>();

  const plotCountRow = await db
    .prepare(`SELECT COUNT(*) as cnt FROM plots p JOIN farmers f ON p.farmer_id = f.id${provinceFilter ? " WHERE f.addr_province = ?" : ""}`)
    .bind(...(filters.province ? [filters.province] : []))
    .first<{ cnt: number }>();

  const areaRow = await db
    .prepare(`SELECT COALESCE(SUM(p.area_rai), 0) as total FROM plots p JOIN farmers f ON p.farmer_id = f.id${provinceFilter ? " WHERE f.addr_province = ?" : ""}`)
    .bind(...(filters.province ? [filters.province] : []))
    .first<{ total: number }>();

  const pendingReviewRow = await db
    .prepare("SELECT COUNT(*) as cnt FROM photo_evidence WHERE admin_status = 'pending'")
    .bind()
    .first<{ cnt: number }>();

  const creditRow = await db
    .prepare(
      `SELECT COALESCE(SUM(ce.total_offset_tco2e), 0) as total
       FROM carbon_estimates ce${whereClause}`,
    )
    .bind(...bindValues)
    .first<{ total: number }>();

  return {
    totalFarmers: farmerCountRow?.cnt ?? 0,
    totalPlots: plotCountRow?.cnt ?? 0,
    totalAreaRai: areaRow?.total ?? 0,
    pendingReviews: pendingReviewRow?.cnt ?? 0,
    totalCredits: creditRow?.total ?? 0,
  };
}

export async function getWorkQueueAlerts(db: D1Database): Promise<WorkQueueAlerts> {
  const pendingAppsRow = await db
    .prepare(
      `SELECT COUNT(DISTINCT ll.id) as cnt
       FROM line_links ll
       LEFT JOIN farmers f ON f.cpa_code IS NOT NULL AND f.id = ll.farmer_id
       WHERE ll.status = 'pending' AND f.id IS NULL`,
    )
    .bind()
    .first<{ cnt: number }>();

  const photoQueueRow = await db
    .prepare("SELECT COUNT(*) as cnt FROM photo_evidence WHERE admin_status = 'pending'")
    .bind()
    .first<{ cnt: number }>();

  const missingPhotosRow = await db
    .prepare(
      `SELECT COUNT(DISTINCT si.id) as cnt
       FROM season_inputs si
       LEFT JOIN photo_evidence pe ON pe.plot_id = si.plot_id AND pe.season_id = si.season_id
       WHERE si.status = 'open' AND pe.id IS NULL`,
    )
    .bind()
    .first<{ cnt: number }>();

  const sfwFallbackRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt
       FROM carbon_estimates
       WHERE sf_w IS NULL OR sf_w < 0.5`,
    )
    .bind()
    .first<{ cnt: number }>();

  // T075 — urgent items: applications pending > 3 days, photos pending > 2 days (AD-OV-03)
  const urgentAppsRow = await db
    .prepare(
      `SELECT COUNT(DISTINCT ll.id) as cnt
       FROM line_links ll
       LEFT JOIN farmers f ON f.cpa_code IS NOT NULL AND f.id = ll.farmer_id
       WHERE ll.status = 'pending' AND f.id IS NULL
         AND datetime(ll.created_at, '+3 days') < datetime('now')`,
    )
    .bind()
    .first<{ cnt: number }>();

  const urgentPhotosRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM photo_evidence
       WHERE admin_status = 'pending'
         AND datetime(created_at, '+2 days') < datetime('now')`,
    )
    .bind()
    .first<{ cnt: number }>();

  return {
    pendingApplications: pendingAppsRow?.cnt ?? 0,
    photoQueue: photoQueueRow?.cnt ?? 0,
    missingPhotos: missingPhotosRow?.cnt ?? 0,
    sfwFallback: sfwFallbackRow?.cnt ?? 0,
    urgentApplications: urgentAppsRow?.cnt ?? 0,
    urgentPhotos: urgentPhotosRow?.cnt ?? 0,
  };
}

export async function getCreditChart(db: D1Database): Promise<CreditChartItem[]> {
  const { results } = await db
    .prepare(
      `SELECT
         si.season_id as season,
         COALESCE(SUM(ce.total_offset_tco2e), 0) as estimated,
         COALESCE(SUM(CASE WHEN ce.status = 'final' THEN ce.total_offset_tco2e ELSE 0 END), 0) as verified
       FROM seasons s
       LEFT JOIN season_inputs si ON si.season_id = s.id
       LEFT JOIN carbon_estimates ce ON ce.season_id = s.id
       GROUP BY s.id
       ORDER BY s.start_date ASC`,
    )
    .bind()
    .all<{ season: string; estimated: number; verified: number }>();

  return (results ?? []).map((r) => ({
    season: r.season,
    estimated: r.estimated ?? 0,
    verified: r.verified ?? 0,
  }));
}

export async function getGhgSourceTable(db: D1Database): Promise<GhgSourceItem[]> {
  const { results } = await db
    .prepare(
      `SELECT
         'CH4 (มีเทน)' as source,
         COALESCE(SUM(baseline_ch4 - project_ch4), 0) as value
       FROM carbon_estimates
       UNION ALL
       SELECT
         'N2O (ไนตรัสออกไซด์)' as source,
         COALESCE(SUM(baseline_n2o - project_n2o), 0) as value
       FROM carbon_estimates
       UNION ALL
       SELECT
         'CO2 (คาร์บอนไดออกไซด์)' as source,
         COALESCE(SUM(baseline_co2 - project_co2), 0) as value
       FROM carbon_estimates`,
    )
    .bind()
    .all<{ source: string; value: number }>();

  return (results ?? []).map((r) => ({
    source: r.source,
    value: r.value ?? 0,
  }));
}

export async function getProvinceTable(db: D1Database): Promise<ProvinceTableItem[]> {
  const { results } = await db
    .prepare(
      `SELECT
         f.addr_province as province,
         COALESCE(u.name, '-') as sponsor,
         COUNT(DISTINCT p.id) as plots,
         COALESCE(SUM(ce.total_offset_tco2e), 0) as credits
       FROM farmers f
       LEFT JOIN plots p ON p.farmer_id = f.id
       LEFT JOIN carbon_estimates ce ON ce.plot_id = p.id
       LEFT JOIN users u ON u.sponsor_id = f.id
       WHERE f.addr_province IS NOT NULL
       GROUP BY f.addr_province, u.name
       ORDER BY credits DESC`,
    )
    .bind()
    .all<{ province: string; sponsor: string; plots: number; credits: number }>();

  return (results ?? []).map((r) => ({
    province: r.province,
    sponsor: r.sponsor ?? "-",
    plots: r.plots ?? 0,
    credits: r.credits ?? 0,
  }));
}
