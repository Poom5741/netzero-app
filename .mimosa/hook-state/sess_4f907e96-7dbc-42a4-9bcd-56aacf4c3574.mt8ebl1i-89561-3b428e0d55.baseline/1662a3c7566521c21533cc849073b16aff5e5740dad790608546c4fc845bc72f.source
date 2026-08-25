type ScreenResult = {
  ai_status: "pass" | "flag" | "reject";
  ai_label: string;
  ai_reason: string | null;
  ai_confidence: number;
};

/**
 * Screen a photo using AI vision and write results to photo_evidence.
 */
export async function screenPhoto(
  db: D1Database,
  photoId: string,
  label: string,
  confidence: number,
): Promise<ScreenResult> {
  let aiStatus: ScreenResult["ai_status"];
  let reason: string | null = null;

  if (confidence >= 0.8) {
    aiStatus = "pass";
  } else if (confidence >= 0.4) {
    aiStatus = "flag";
    reason = "low confidence — manual review recommended";
  } else {
    aiStatus = "reject";
    reason = "very low confidence — likely invalid photo";
  }

  await db
    .prepare(
      "UPDATE photo_evidence SET ai_status = ?, ai_label = ?, ai_reason = ?, ai_confidence = ? WHERE id = ?",
    )
    .bind(aiStatus, label, reason, confidence, photoId)
    .run();

  return {
    ai_status: aiStatus,
    ai_label: label,
    ai_reason: reason,
    ai_confidence: confidence,
  };
}
