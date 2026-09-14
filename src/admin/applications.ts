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
};

const DOCS_NEEDED = 3; // DOC-01, DOC-03, DOC-06

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

  return appRows.map((row) => ({
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
  }));
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
      `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, created_at)
       VALUES (?, NULL, 'admin', 'reject_application', ?, 'line_link', ?, datetime('now'))`,
    )
    .bind(auditId, reason, linkId)
    .run();

  return { success: true };
}
