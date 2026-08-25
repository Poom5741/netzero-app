export type PhoneMatchResult = {
  status: "pending" | "not_found" | "duplicate";
  farmerId?: string;
};

/**
 * Create a phone matcher that links LINE users to farmers.
 * Each instance maintains its own dedup state.
 */
export function createPhoneMatcher(db: D1Database) {
  const seenLinks = new Map<string, string>();

  return async (phone: string, lineUserId: string): Promise<PhoneMatchResult> => {
    const key = `${phone}:${lineUserId}`;
    if (seenLinks.has(key)) {
      return { status: "duplicate" };
    }

    const row = await db
      .prepare("SELECT id, phone FROM farmers WHERE phone = ?")
      .bind(phone)
      .first<{ id: string; phone: string }>();

    if (!row) {
      return { status: "not_found" };
    }

    const linkId = `link_${crypto.randomUUID()}`;
    await db
      .prepare(
        "INSERT INTO line_links (id, farmer_id, line_user_id, status) VALUES (?, ?, ?, 'pending')",
      )
      .bind(linkId, row.id, lineUserId)
      .run();

    seenLinks.set(key, linkId);

    return { status: "pending", farmerId: row.id };
  };
}
