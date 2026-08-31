/**
 * Chat guard — block non-approved farmers from AI chat.
 */

type GuardResult = {
  allowed: boolean;
  reason?: string;
};

export async function checkFarmerApproved(
  farmerId: string,
  db: D1Database,
): Promise<GuardResult> {
  const farmer = await db
    .prepare("SELECT id, status FROM farmers WHERE id = ?")
    .bind(farmerId)
    .first<{ id: string; status: string }>();

  if (!farmer) {
    return { allowed: false, reason: "farmer not found" };
  }

  if (farmer.status !== "approved") {
    return { allowed: false, reason: `farmer status: ${farmer.status}` };
  }

  return { allowed: true };
}
