type RetakeResult = {
  message_type: "chat";
  raw_text: string;
} | null;

export async function generateRetakeMessage(
  db: D1Database,
  photoId: string,
): Promise<RetakeResult> {
  const photo = await db
    .prepare(
      "SELECT pe.farmer_id, pe.ai_status, pe.ai_reason, f.id as farmer_id FROM photo_evidence pe JOIN farmers f ON pe.plot_id IN (SELECT id FROM plots WHERE farmer_id = f.id) WHERE pe.id = ?",
    )
    .bind(photoId)
    .first<{ farmer_id: string; ai_status: string; ai_reason: string | null }>();

  if (photo?.ai_status !== "reject") return null;

  const reason = photo.ai_reason ?? "ไม่ผ่านการตรวจสอบ";
  const raw_text = `ภาพถ่ายถูกตีกลับ: ${reason}\nกรุณาถ่ายภาพใหม่ตามคำแนะนำ`;

  await db
    .prepare(
      "INSERT INTO farmer_messages (id, farmer_id, raw_text, message_type) VALUES (?, ?, ?, 'chat')",
    )
    .bind(`msg_${crypto.randomUUID()}`, photo.farmer_id, raw_text)
    .run();

  return { message_type: "chat", raw_text };
}
