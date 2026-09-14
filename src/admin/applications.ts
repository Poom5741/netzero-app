/**
 * Admin application review — real data from line_links + farmers + application_documents.
 * Handles approve/reject with CPA code generation.
 */

type ApplicationRow = {
  id: string;
  farmer_id: string;
  line_user_id: string;
  full_name: string;
  phone: string;
  addr_province: string | null;
  addr_district: string | null;
  status: string;
  created_at: string;
  doc_count: number;
  consent_count: number;
};

type ApplicationItem = {
  id: string;
  farmer_id: string;
  line_user_id: string;
  farmer_name: string;
  phone: string;
  province: string;
  district: string;
  status: string;
  doc_count: number;
  docs_needed: number;
  consent_count: number;
  created_at: string;
  /** T070 — days since application was submitted (AD-APP-02) */
  age_days: number;
  /** T077 — placeholder label when OCR/automation data is unavailable */
  placeholder_label?: string;
};

const DOCS_NEEDED = 3; // DOC-01, DOC-03, DOC-06

// T091 — Holding-type-specific document rules per AD-APP-02
const HOLDING_DOC_RULES: Record<string, { code: string; label: string }[]> = {
  owner: [
    { code: "DOC-01", label: "โฉนด/หนังสือรับรองที่ดิน" },
    { code: "DOC-03", label: "บัตรประชาชน" },
    { code: "DOC-06", label: "หนังสือยินยอมเข้าร่วมโครงการ" },
  ],
  "co-owner": [
    { code: "DOC-01", label: "โฉนด/หนังสือรับรองที่ดิน" },
    { code: "DOC-02", label: "เอกสารรับรองสิทธิร่วม" },
    { code: "DOC-03", label: "บัตรประชาชน" },
    { code: "DOC-06", label: "หนังสือยินยอมเข้าร่วมโครงการ" },
  ],
  tenant: [
    { code: "DOC-01", label: "โฉนด/หนังสือรับรองที่ดิน (เจ้าของ)" },
    { code: "DOC-04", label: "สัญญาเช่า" },
    { code: "DOC-03", label: "บัตรประชาชน" },
    { code: "DOC-06", label: "หนังสือยินยอมเข้าร่วมโครงการ" },
  ],
  representative: [
    { code: "DOC-01", label: "โฉนด/หนังสือรับรองที่ดิน" },
    { code: "DOC-03", label: "บัตรประชาชนเกษตรกร" },
    { code: "DOC-05", label: "หนังสือมอบอำนาจ" },
    { code: "DOC-03R", label: "บัตรประชาชนผู้รับมอบอำนาจ" },
    { code: "DOC-06", label: "หนังสือยินยอมเข้าร่วมโครงการ" },
  ],
};

export function getRequiredDocs(holdingType: string): { code: string; label: string }[] {
  return HOLDING_DOC_RULES[holdingType] ?? HOLDING_DOC_RULES["owner"];
}

// T092 — Document checklist categorization per AD-APP-03
export type DocChecklistItem = {
  code: string;
  label: string;
  status: "required" | "received" | "missing" | "invalid";
};

export function buildDocChecklist(
  holdingType: string,
  receivedDocs: { doc_type: string; review_status: string }[],
): DocChecklistItem[] {
  const required = getRequiredDocs(holdingType);
  const receivedMap = new Map(receivedDocs.map((d) => [d.doc_type, d.review_status]));

  return required.map((doc) => {
    const received = receivedMap.get(doc.code);
    if (!received) return { ...doc, status: "missing" as const };
    if (received === "rejected") return { ...doc, status: "invalid" as const };
    return { ...doc, status: "received" as const };
  });
}

export async function getApplications(
  db: D1Database,
  statusFilter?: string,
): Promise<ApplicationItem[]> {
  // H1 fix: single query with correlated subqueries instead of N+1
  let query = `
    SELECT ll.id, ll.farmer_id, ll.line_user_id, ll.status, ll.created_at,
           f.full_name, f.phone, f.addr_province, f.addr_district,
           COALESCE((SELECT COUNT(*) FROM application_documents ad
                     WHERE ad.farmer_id = ll.farmer_id AND ad.review_status != 'rejected'), 0) AS doc_count,
           COALESCE((SELECT COUNT(*) FROM consent_log cl
                     WHERE cl.farmer_id = ll.farmer_id AND cl.accepted = 1), 0) AS consent_count
    FROM line_links ll
    JOIN farmers f ON f.id = ll.farmer_id
  `;
  const conditions: string[] = [];
  const bindValues: unknown[] = [];

  if (statusFilter) {
    conditions.push("ll.status = ?");
    bindValues.push(statusFilter);
  } else {
    conditions.push("ll.status = 'pending'");
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY ll.created_at DESC";

  const { results: appRows } = await db
    .prepare(query)
    .bind(...bindValues)
    .all<ApplicationRow>();

  if (!appRows || appRows.length === 0) return [];

  return appRows.map((row) => {
    const createdAtMs = Date.parse(row.created_at);
    const ageDays = Number.isFinite(createdAtMs)
      ? Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60 * 24))
      : 0;
    return {
      id: row.id,
      farmer_id: row.farmer_id,
      line_user_id: row.line_user_id,
      farmer_name: row.full_name,
      phone: row.phone,
      province: row.addr_province ?? "-",
      district: row.addr_district ?? "-",
      status: row.status,
      doc_count: row.doc_count,
      docs_needed: DOCS_NEEDED,
      consent_count: row.consent_count,
      created_at: row.created_at,
      age_days: ageDays,
      placeholder_label: "OCR unavailable — sample data",
    };
  });
}

type ApproveResult = {
  success: boolean;
  cpa_code?: string;
  error?: string;
};

export async function approveApplication(
  db: D1Database,
  linkId: string,
): Promise<ApproveResult> {
  // 1) Look up the line_link
  const link = await db
    .prepare("SELECT id, farmer_id FROM line_links WHERE id = ?")
    .bind(linkId)
    .first<{ id: string; farmer_id: string }>();

  if (!link) {
    return { success: false, error: "Application not found" };
  }

  // 2) Generate CPA code with retry to handle concurrent approvals (C3 fix).
  //    Use D1 batch to atomically assign CPA code + update line_link status.
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const cpaCount = await db
      .prepare("SELECT COUNT(*) as cnt FROM farmers WHERE cpa_code IS NOT NULL")
      .bind()
      .first<{ cnt: number }>();

    const nextNum = (cpaCount?.cnt ?? 0) + 1 + attempt;
    const cpaCode = `CPA${String(nextNum).padStart(4, "0")}`;

    try {
      const farmerStmt = db
        .prepare("UPDATE farmers SET cpa_code = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(cpaCode, link.farmer_id);
      const linkStmt = db
        .prepare("UPDATE line_links SET status = 'verified', verified_by = 'admin', updated_at = datetime('now') WHERE id = ?")
        .bind(linkId);

      const results = await db.batch([farmerStmt, linkStmt]);
      // Verify the farmer UPDATE actually changed a row across runtime/test result shapes.
      const first = results[0] as unknown as { changes?: number; meta?: { changes?: number } } | undefined;
      const farmerChanges = first?.changes ?? first?.meta?.changes ?? 0;
      if (farmerChanges > 0) {
        return { success: true, cpa_code: cpaCode };
      }
    } catch {
      // UNIQUE constraint violation on cpa_code — collision, retry
      continue;
    }
  }

  return { success: false, error: "CPA code assignment failed after retries" };
}

type RejectResult = {
  success: boolean;
  error?: string;
};

export async function holdApplication(
  db: D1Database,
  linkId: string,
  reason: string,
): Promise<RejectResult> {
  if (!reason || reason.trim().length === 0) {
    return { success: false, error: "Hold reason is required" };
  }
  const link = await db.prepare("SELECT id FROM line_links WHERE id = ?").bind(linkId).first<{ id: string }>();
  if (!link) return { success: false, error: "Application not found" };
  await db.prepare("UPDATE line_links SET status = 'hold', review_reason = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(reason.trim(), linkId).run();
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.prepare(
    `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, old_value, new_value, created_at)
     VALUES (?, NULL, 'admin', 'hold_application', ?, 'line_link', ?, 'pending', 'hold', datetime('now'))`,
  ).bind(auditId, reason.trim(), linkId).run();
  return { success: true };
}

export async function rejectApplication(
  db: D1Database,
  linkId: string,
  reason: string,
): Promise<RejectResult> {
  if (!reason || reason.trim().length === 0) {
    return { success: false, error: "Rejection reason is required" };
  }

  // 1) Look up the line_link
  const link = await db
    .prepare("SELECT id FROM line_links WHERE id = ?")
    .bind(linkId)
    .first<{ id: string }>();

  if (!link) {
    return { success: false, error: "Application not found" };
  }

  // 2) Update line_link: status → rejected
  await db
    .prepare("UPDATE line_links SET status = 'rejected', updated_at = datetime('now') WHERE id = ?")
    .bind(linkId)
    .run();

  // 3) Write audit log entry
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db
    .prepare(
      `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, old_value, new_value, created_at)
       VALUES (?, NULL, 'admin', 'reject_application', ?, 'line_link', ?, 'pending', 'rejected', datetime('now'))`,
    )
    .bind(auditId, reason, linkId)
    .run();

  return { success: true };
}

// T093 — Request additional documents from farmer per AD-APP-04
export async function requestDocuments(
  db: D1Database,
  linkId: string,
  reason: string,
): Promise<RejectResult> {
  if (!reason || reason.trim().length === 0) {
    return { success: false, error: "Request reason is required" };
  }
  const link = await db.prepare("SELECT id FROM line_links WHERE id = ?").bind(linkId).first<{ id: string }>();
  if (!link) return { success: false, error: "Application not found" };
  await db.prepare("UPDATE line_links SET status = 'documents_requested', review_reason = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(reason.trim(), linkId).run();
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.prepare(
    `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, created_at)
     VALUES (?, NULL, 'admin', 'request_documents', ?, 'line_link', ?, datetime('now'))`,
  ).bind(auditId, reason.trim(), linkId).run();
  return { success: true };
}
