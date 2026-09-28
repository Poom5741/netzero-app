/**
 * Identity Resolver
 *
 * Resolves farmer identity from LIFF profile or query parameters.
 * Prevents farmers from uploading documents for other farmers.
 */

export interface IdentityResolutionResult {
  success: boolean;
  farmerId?: string;
  error?: string;
}

/**
 * Resolve farmer identity from LIFF context.
 *
 * Resolution order:
 * 1. LIFF profile userId → lookup farmer_id from line_links table
 * 2. Query parameter farmer_id (for testing without LIFF)
 * 3. Error if neither available
 *
 * Security: Server-side resolution prevents client from spoofing farmer_id.
 *
 * @param db - D1 database instance
 * @param liffUserId - LINE user ID from LIFF profile (optional)
 * @param queryFarmerId - farmer_id from query parameter (optional, for testing)
 * @returns IdentityResolutionResult with farmer_id or error message in Thai
 *
 * @example
 * ```typescript
 * const result = await resolveFarmerIdentity(db, liffProfile.userId, null);
 * if (!result.success) {
 *   return c.json({ error: result.error }, 401);
 * }
 * const farmerId = result.farmerId;
 * ```
 */
export async function resolveFarmerIdentity(
  db: D1Database,
  liffUserId: string | null | undefined,
  queryFarmerId: string | null | undefined,
): Promise<IdentityResolutionResult> {
  // Try LIFF profile first (authenticated)
  if (liffUserId) {
    const link = await db
      .prepare("SELECT farmer_id FROM line_links WHERE line_user_id = ?")
      .bind(liffUserId)
      .first<{ farmer_id: string }>();

    if (link) {
      return {
        success: true,
        farmerId: link.farmer_id,
      };
    }

    // LIFF user exists but no farmer link
    return {
      success: false,
      error: "ไม่พบข้อมูลเกษตรกรที่ผูกกับบัญชี LINE นี้",
    };
  }

  // Fallback to query parameter (for testing without LIFF)
  if (queryFarmerId) {
    // Verify farmer exists
    const farmer = await db
      .prepare("SELECT id FROM farmers WHERE id = ?")
      .bind(queryFarmerId)
      .first<{ id: string }>();

    if (farmer) {
      return {
        success: true,
        farmerId: farmer.id,
      };
    }

    return {
      success: false,
      error: "ไม่พบข้อมูลเกษตรกรในระบบ",
    };
  }

  // No identity available
  return {
    success: false,
    error: "ไม่พบข้อมูลเกษตรกร",
  };
}

/**
 * Verify that a farmer_id belongs to the authenticated LINE user.
 *
 * This prevents farmers from uploading documents for other farmers.
 *
 * @param db - D1 database instance
 * @param liffUserId - LINE user ID from LIFF profile
 * @param farmerId - Farmer ID to verify
 * @returns true if farmer_id belongs to liffUserId, false otherwise
 */
export async function verifyFarmerOwnership(
  db: D1Database,
  liffUserId: string,
  farmerId: string,
): Promise<boolean> {
  const link = await db
    .prepare("SELECT farmer_id FROM line_links WHERE line_user_id = ? AND farmer_id = ?")
    .bind(liffUserId, farmerId)
    .first<{ farmer_id: string }>();

  return link !== null;
}
