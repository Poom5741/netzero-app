type ReviewResult = { success: boolean; error?: string };

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
    .prepare("SELECT id FROM photo_evidence WHERE id = ?")
    .bind(photoId)
    .first<{ id: string }>();

  if (!photo) {
    return { success: false, error: "Photo not found" };
  }

  await db
    .prepare(
      `UPDATE photo_evidence
       SET admin_status = ?, admin_reason = ?
       WHERE id = ?`,
    )
    .bind(adminStatus, reason, photoId)
    .run();

  return { success: true };
}
