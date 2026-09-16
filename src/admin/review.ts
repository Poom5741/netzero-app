import { updateFarmerTrust } from "../trust/farmer-trust";
import { writeAuditEntry } from "./audit-log";

type ReviewResult = { success: boolean; error?: string; promoted?: boolean; lineUserId?: string };

const VALID_STATUSES = ["verified", "rejected", "retake"] as const;
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
    .prepare("SELECT id, plot_id, season_id, step_code, pre_verified, audit_sample FROM photo_evidence WHERE id = ?")
    .bind(photoId)
    .first<{ id: string; plot_id: string; season_id: string; step_code?: string; pre_verified?: number; audit_sample?: number }>();

  if (!photo) {
    return { success: false, error: "Photo not found" };
  }

  // Resolve the plot's actual owner for trust scoring
  const plot = await db
    .prepare("SELECT farmer_id FROM plots WHERE id = ?")
    .bind(photo.plot_id)
    .first<{ farmer_id: string }>();

  // Resolve farmer's LINE user ID for push notification
  const lineLink = plot?.farmer_id
    ? await db
        .prepare("SELECT line_user_id FROM line_links WHERE farmer_id = ? AND status = 'verified' LIMIT 1")
        .bind(plot.farmer_id)
        .first<{ line_user_id: string }>()
    : null;

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

  if (adminStatus === "verified" && photo.step_code) {
    await db
      .prepare(
        `UPDATE season_steps
         SET status = 'completed', photo_evidence_id = ?, completed_at = datetime('now')
         WHERE step_code = ?
           AND season_input_id IN (SELECT id FROM season_inputs WHERE plot_id = ? AND season_id = ?)` ,
      )
      .bind(photoId, photo.step_code, photo.plot_id, photo.season_id)
      .run();
  }

  // Update farmer trust score based on admin decision.
  // Trust is auxiliary — a trust-write failure must never fail the review action.
  if (plot?.farmer_id) {
    try {
      await updateFarmerTrust(db, plot.farmer_id, adminStatus === "verified");
    } catch (err) {
      console.error("Trust score update failed (non-fatal):", err);
    }
  }

  return { success: true, promoted, lineUserId: lineLink?.line_user_id };
}
