import { writeAuditEntry } from "./audit-log";

type ReviewResult = { success: boolean; error?: string; promoted?: boolean };

const VALID_STATUSES = ["verified", "rejected"] as const;
type AdminStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(status: string): status is AdminStatus {
  return (VALID_STATUSES as readonly string[]).includes(status);
}

export async function reviewPhoto(
  db: D1Database,
  photoId: string,
  adminStatus: string,
  reason: string,
): Promise<ReviewResult> {
  if (!isValidStatus(adminStatus)) {
    return { success: false, error: `Invalid admin_status: ${adminStatus}` };
  }

  const photo = await db
    .prepare("SELECT id, pre_verified, audit_sample FROM photo_evidence WHERE id = ?")
    .bind(photoId)
    .first<{ id: string; pre_verified?: number; audit_sample?: number }>();

  if (!photo) {
    return { success: false, error: "Photo not found" };
  }

  // Supersede: admin rejects a pre-verified photo
  if (adminStatus === "rejected" && photo.pre_verified === 1) {
    await db
      .prepare(
        `UPDATE photo_evidence
         SET superseded = 1, pre_verified = 0
         WHERE id = ?`,
      )
      .bind(photoId)
      .run();

    await writeAuditEntry(db, {
      photoId,
      actorType: "admin",
      action: "superseded",
      confidence: null,
      reason,
    });
  }

  // Promote: admin confirms an audit-sampled photo → human-verified
  const promoted =
    adminStatus === "verified" && photo.audit_sample === 1 && photo.pre_verified === 1;

  if (promoted) {
    await writeAuditEntry(db, {
      photoId,
      actorType: "admin",
      action: "promoted",
      confidence: null,
      reason,
    });
  } else if (!(adminStatus === "rejected" && photo.pre_verified === 1)) {
    // Normal admin decision (not already logged as superseded)
    await writeAuditEntry(db, {
      photoId,
      actorType: "admin",
      action: adminStatus,
      confidence: null,
      reason,
    });
  }

  await db
    .prepare(
      `UPDATE photo_evidence
       SET admin_status = ?, admin_reason = ?
       WHERE id = ?`,
    )
    .bind(adminStatus, reason, photoId)
    .run();

  return { success: true, promoted };
}
