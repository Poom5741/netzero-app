import { Hono } from "hono";
import type { ClassifyResult } from "../vision/classifier";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
};

export const photoRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Fake classifier for testing — reads hints from form fields.
 * In production this will be replaced by the real bake-off winner strategy.
 * ponytail: ceiling is injectable strategy via env binding; add when real model is wired.
 */
function classifyFromRequest(
  formData: FormData,
): ClassifyResult | null {
  const hint = formData.get("__classifier_result") as string | null;
  if (!hint) return null; // no hint → real classifier would run

  switch (hint) {
    case "reject":
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0.1,
        reason: "ไม่พบท่อวัด กรุณาถ่ายให้เห็นท่อ",
      };
    case "flag":
      return {
        valid: true,
        water_state: "flooded",
        confidence: 0.55,
        reason: "ภาพไม่ชัดเจน — เจ้าหน้าที่จะตรวจสอบ",
      };
    case "pass":
      return {
        valid: true,
        water_state: "flooded",
        confidence: 0.95,
        reason: "เห็นน้ำขังชัดเจน",
      };
    default:
      return null;
  }
}

type Verdict = "refused" | "flagged" | "pre_verified" | "queued";

photoRoutes.post("/photo/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("photo");
  const plotId = formData.get("plot_id");
  const seasonId = formData.get("season_id");
  const gpsLat = Number(formData.get("gps_lat"));
  const gpsLng = Number(formData.get("gps_lng"));
  const gpsAccuracy = formData.get("gps_accuracy");
  const takenAt = formData.get("taken_at") as string;
  const photoType = formData.get("photo_type") as string | null;

  if (!(file instanceof File) || !plotId || !seasonId) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  if (!photoType || !["prepare", "wetdry", "harvest"].includes(photoType)) {
    return c.json({ error: "photo_type is required (prepare, wetdry, harvest)" }, 400);
  }

  // Kill switch check
  const killSwitch = formData.get("__kill_switch") === "true";

  // Screening for wetdry only
  if (photoType === "wetdry" && !killSwitch) {
    const classification = classifyFromRequest(formData);

    if (classification) {
      // Refused: invalid photo, don't persist
      if (!classification.valid && classification.confidence < 0.4) {
        return c.json({
          verdict: "refused" as Verdict,
          reason: classification.reason,
          photo_type: photoType,
        });
      }

      // Flagged: borderline confidence
      if (classification.confidence < 0.8) {
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const key = `evidence/${photoId}.jpg`;
        await c.env.R2.put(key, file);

        await c.env.DB.prepare(
          `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, ai_label, ai_reason, ai_confidence, admin_status, photo_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'flag', ?, ?, ?, 'pending', ?)`,
        )
          .bind(
            photoId,
            plotId,
            seasonId,
            key,
            gpsLat,
            gpsLng,
            gpsAccuracy ?? null,
            takenAt,
            classification.reason,
            classification.reason,
            classification.confidence,
            photoType,
          )
          .run();

        return c.json({
          id: photoId,
          verdict: "flagged" as Verdict,
          photo_url: key,
          photo_type: photoType,
          water_state: classification.water_state,
          ai_confidence: classification.confidence,
        }, 201);
      }

      // Pre-verified: high confidence pass
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const key = `evidence/${photoId}.jpg`;
      await c.env.R2.put(key, file);

      await c.env.DB.prepare(
        `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, ai_label, ai_reason, ai_confidence, admin_status, photo_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pass', ?, ?, ?, 'pending', ?)`,
      )
        .bind(
          photoId,
          plotId,
          seasonId,
          key,
          gpsLat,
          gpsLng,
          gpsAccuracy ?? null,
          takenAt,
          classification.reason,
          classification.reason,
          classification.confidence,
          photoType,
        )
        .run();

      return c.json({
        id: photoId,
        verdict: "pre_verified" as Verdict,
        photo_url: key,
        photo_type: photoType,
        water_state: classification.water_state,
        ai_confidence: classification.confidence,
      }, 201);
    }
  }

  // Default: queue for human review (prepare, harvest, or kill-switch wetdry)
  const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const key = `evidence/${photoId}.jpg`;
  await c.env.R2.put(key, file);

  await c.env.DB.prepare(
    `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, admin_status, photo_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
  )
    .bind(photoId, plotId, seasonId, key, gpsLat, gpsLng, gpsAccuracy ?? null, takenAt, photoType)
    .run();

  return c.json({
    id: photoId,
    photo_url: key,
    verdict: "queued" as Verdict,
    photo_type: photoType,
  }, 201);
});
