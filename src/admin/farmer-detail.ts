/**
 * Admin farmer detail — 5-tab panel data aggregation.
 * Tabs: Plots & Documents, Credit Calculation (CalcTrace), Nitrogen Source, Photo Evidence, Audit Log.
 */

type FarmerRow = {
  id: string;
  full_name: string;
  phone: string;
  addr_province: string | null;
  addr_district: string | null;
  cpa_code: string | null;
  trust_score: number | null;
};

type PlotRow = {
  id: string;
  plot_code: string;
  deed_no: string;
  area_rai: number;
  rice_variety: string | null;
  doc_type: string | null;
  season_name: string | null;
  carbon_total: number | null;
};

type DocRow = {
  id: string;
  doc_type: string;
  review_status: string;
  submitted_at: string;
};

type EstimateRow = {
  baseline_ch4: number | null;
  project_ch4: number | null;
  baseline_n2o: number | null;
  project_n2o: number | null;
  baseline_co2: number | null;
  project_co2: number | null;
  burning_emissions: number | null;
  total_offset_tco2e: number | null;
  sf_w: number | null;
  sf_p: number | null;
  sf_o: number | null;
  nitrogen_total_kg_per_rai: number | null;
};

type FertilizerRow = {
  step: string;
  formula: string;
  rate_kg_per_rai: number;
  nitrogen_kg_per_rai: number;
};

type PhotoRow = {
  id: string;
  photo_type: string | null;
  water_state: string | null;
  ai_status: string;
  admin_status: string;
  taken_at: string;
};

type AuditRow = {
  id: string;
  action: string;
  actor_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export type FarmerDetail = {
  id: string;
  full_name: string;
  phone: string;
  province: string;
  district: string;
  cpa_code: string | null;
  trust_score: number;
  plots: Array<{
    id: string;
    plot_code: string;
    deed_no: string;
    area_rai: number;
    rice_variety: string | null;
    doc_type: string | null;
    season_name: string | null;
    carbon_total: number | null;
  }>;
  documents: Array<{
    id: string;
    doc_type: string;
    review_status: string;
    submitted_at: string;
  }>;
  carbonTrace: Array<{
    step: number;
    label: string;
    value: string;
  }>;
  nitrogenEntries: Array<{
    step: string;
    formula: string;
    rate_kg_per_rai: number;
    nitrogen_kg_per_rai: number;
  }>;
  photos: Array<{
    id: string;
    photo_type: string | null;
    water_state: string | null;
    ai_status: string;
    admin_status: string;
    taken_at: string;
  }>;
  auditLog: Array<{
    id: string;
    action: string;
    actor_type: string;
    field_name: string | null;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
  }>;
};

/**
 * Build CalcTrace — 12-step formula display from carbon estimate data.
 * Matches the T-VER-P-METH-13-08 credit methodology.
 */
function buildCalcTrace(est: EstimateRow): FarmerDetail["carbonTrace"] {
  const ch4Reduction = (est.baseline_ch4 ?? 0) - (est.project_ch4 ?? 0);
  const n2oReduction = (est.baseline_n2o ?? 0) - (est.project_n2o ?? 0);
  const co2Reduction = (est.baseline_co2 ?? 0) - (est.project_co2 ?? 0);
  const _totalGhgReduction = ch4Reduction + n2oReduction + co2Reduction;

  return [
    { step: 1, label: "CH4 Baseline", value: `${est.baseline_ch4 ?? 0} tCO2e` },
    { step: 2, label: "CH4 Project", value: `${est.project_ch4 ?? 0} tCO2e` },
    { step: 3, label: "CH4 Reduction", value: `${ch4Reduction.toFixed(2)} tCO2e` },
    { step: 4, label: "N2O Baseline", value: `${est.baseline_n2o ?? 0} tCO2e` },
    { step: 5, label: "N2O Project", value: `${est.project_n2o ?? 0} tCO2e` },
    { step: 6, label: "N2O Reduction", value: `${n2oReduction.toFixed(2)} tCO2e` },
    { step: 7, label: "CO2 Baseline", value: `${est.baseline_co2 ?? 0} tCO2e` },
    { step: 8, label: "CO2 Project", value: `${est.project_co2 ?? 0} tCO2e` },
    { step: 9, label: "CO2 Reduction", value: `${co2Reduction.toFixed(2)} tCO2e` },
    { step: 10, label: "SF_w (Water Management)", value: `${est.sf_w ?? "N/A"}` },
    { step: 11, label: "SF_p (Perennial)", value: `${est.sf_p ?? "N/A"}` },
    { step: 12, label: "SF_o (Other)", value: `${est.sf_o ?? "N/A"}` },
  ];
}

export async function getFarmerDetail(
  db: D1Database,
  farmerId: string,
): Promise<FarmerDetail | null> {
  // 1) Farmer base info
  const farmer = await db
    .prepare(
      `SELECT id, full_name, phone, addr_province, addr_district, cpa_code,
              COALESCE(
                (SELECT trust_score FROM farmer_trust WHERE farmer_id = farmers.id),
                0.5
              ) as trust_score
       FROM farmers WHERE id = ?`,
    )
    .bind(farmerId)
    .first<FarmerRow>();

  if (!farmer) return null;

  // 2) Plots with latest season info
  const { results: plotRows } = await db
    .prepare(
      `SELECT p.id, p.plot_code, p.deed_no, p.area_rai, p.rice_variety, p.doc_type,
              s.name as season_name,
              (SELECT ce.total_offset_tco2e FROM carbon_estimates ce
               WHERE ce.plot_id = p.id ORDER BY ce.created_at DESC LIMIT 1) as carbon_total
       FROM plots p
       LEFT JOIN seasons s ON s.plot_id = p.id AND s.status = 'active'
       WHERE p.farmer_id = ?`,
    )
    .bind(farmerId)
    .all<PlotRow>();

  // 3) Application documents
  const { results: docRows } = await db
    .prepare(
      "SELECT id, doc_type, review_status, submitted_at FROM application_documents WHERE farmer_id = ? ORDER BY submitted_at ASC",
    )
    .bind(farmerId)
    .all<DocRow>();

  // 4) Carbon estimates for CalcTrace (latest per plot)
  const { results: estRows } = await db
    .prepare(
      `SELECT ce.*
       FROM carbon_estimates ce
       JOIN plots p ON p.id = ce.plot_id
       WHERE p.farmer_id = ?
       ORDER BY ce.created_at DESC
       LIMIT 1`,
    )
    .bind(farmerId)
    .all<EstimateRow>();

  // 5) Nitrogen / fertilizer entries
  const { results: fertRows } = await db
    .prepare(
      `SELECT fe.step, fe.formula, fe.rate_kg_per_rai, fe.nitrogen_kg_per_rai
       FROM fertilizer_entries fe
       JOIN plots p ON p.id = fe.plot_id
       WHERE p.farmer_id = ?
       ORDER BY fe.created_at ASC`,
    )
    .bind(farmerId)
    .all<FertilizerRow>();

  // 6) Photo evidence
  const { results: photoRows } = await db
    .prepare(
      `SELECT pe.id, pe.photo_type, pe.water_state, pe.ai_status, pe.admin_status, pe.taken_at
       FROM photo_evidence pe
       JOIN plots p ON p.id = pe.plot_id
       WHERE p.farmer_id = ?
       ORDER BY pe.taken_at ASC`,
    )
    .bind(farmerId)
    .all<PhotoRow>();

  // 7) Audit log
  const { results: auditRows } = await db
    .prepare(
      `SELECT a.id, a.action, a.actor_type, a.field_name, a.old_value, a.new_value, a.created_at
       FROM automation_audit_log a
       WHERE a.entity_type = 'farmer' AND a.entity_id = ?
       ORDER BY a.created_at ASC`,
    )
    .bind(farmerId)
    .all<AuditRow>();

  const latestEstimate = estRows?.[0] ?? null;

  return {
    id: farmer.id,
    full_name: farmer.full_name,
    phone: farmer.phone,
    province: farmer.addr_province ?? "-",
    district: farmer.addr_district ?? "-",
    cpa_code: farmer.cpa_code,
    trust_score: farmer.trust_score ?? 0.5,
    plots: (plotRows ?? []).map((r) => ({
      id: r.id,
      plot_code: r.plot_code,
      deed_no: r.deed_no,
      area_rai: r.area_rai,
      rice_variety: r.rice_variety,
      doc_type: r.doc_type,
      season_name: r.season_name,
      carbon_total: r.carbon_total,
    })),
    documents: (docRows ?? []).map((r) => ({
      id: r.id,
      doc_type: r.doc_type,
      review_status: r.review_status,
      submitted_at: r.submitted_at,
    })),
    carbonTrace: latestEstimate ? buildCalcTrace(latestEstimate) : [],
    nitrogenEntries: (fertRows ?? []).map((r) => ({
      step: r.step,
      formula: r.formula,
      rate_kg_per_rai: r.rate_kg_per_rai,
      nitrogen_kg_per_rai: r.nitrogen_kg_per_rai,
    })),
    photos: (photoRows ?? []).map((r) => ({
      id: r.id,
      photo_type: r.photo_type,
      water_state: r.water_state,
      ai_status: r.ai_status,
      admin_status: r.admin_status,
      taken_at: r.taken_at,
    })),
    auditLog: (auditRows ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      actor_type: r.actor_type,
      field_name: r.field_name,
      old_value: r.old_value,
      new_value: r.new_value,
      created_at: r.created_at,
    })),
  };
}

export async function getFarmerAuditLog(
  db: D1Database,
  farmerId: string,
): Promise<FarmerDetail["auditLog"]> {
  const { results } = await db
    .prepare(
      `SELECT a.id, a.action, a.actor_type, a.field_name, a.old_value, a.new_value, a.created_at
       FROM automation_audit_log a
       WHERE a.entity_type = 'farmer' AND a.entity_id = ?
       ORDER BY a.created_at ASC`,
    )
    .bind(farmerId)
    .all<AuditRow>();

  return (results ?? []).map((r) => ({
    id: r.id,
    action: r.action,
    actor_type: r.actor_type,
    field_name: r.field_name,
    old_value: r.old_value,
    new_value: r.new_value,
    created_at: r.created_at,
  }));
}
