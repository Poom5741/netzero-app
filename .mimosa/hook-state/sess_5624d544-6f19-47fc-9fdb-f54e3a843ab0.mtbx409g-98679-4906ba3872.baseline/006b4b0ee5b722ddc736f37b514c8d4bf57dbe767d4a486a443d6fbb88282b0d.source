/**
 * Issue #120 — Farmer trust score schema and bootstrap.
 * Simple trust score based on farmer's history.
 */

export interface FarmerTrust {
  farmer_id: string;
  trust_score: number; // 0-1
  total_photos: number;
  verified_count: number;
  rejected_count: number;
}

/**
 * Get farmer trust score from database.
 * Returns default trust of 0.5 for new farmers.
 */
export async function getFarmerTrust(
  db: D1Database,
  farmerId: string,
): Promise<FarmerTrust> {
  const result = await db
    .prepare("SELECT * FROM farmer_trust WHERE farmer_id = ?")
    .bind(farmerId)
    .first<FarmerTrust>();

  if (!result) {
    // Default trust for new farmers
    return {
      farmer_id: farmerId,
      trust_score: 0.5,
      total_photos: 0,
      verified_count: 0,
      rejected_count: 0,
    };
  }

  return result;
}

/**
 * Update farmer trust score based on admin decision.
 */
export async function updateFarmerTrust(
  db: D1Database,
  farmerId: string,
  verified: boolean,
): Promise<void> {
  const current = await getFarmerTrust(db, farmerId);
  
  const newTotal = current.total_photos + 1;
  const newVerified = current.verified_count + (verified ? 1 : 0);
  const newRejected = current.rejected_count + (verified ? 0 : 1);
  
  // Trust score = verified / total (with Bayesian smoothing)
  const newTrust = (newVerified + 1) / (newTotal + 2);

  await db
    .prepare(
      `INSERT INTO farmer_trust (farmer_id, trust_score, total_photos, verified_count, rejected_count)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(farmer_id) DO UPDATE SET
         trust_score = excluded.trust_score,
         total_photos = excluded.total_photos,
         verified_count = excluded.verified_count,
         rejected_count = excluded.rejected_count`,
    )
    .bind(farmerId, newTrust, newTotal, newVerified, newRejected)
    .run();
}
