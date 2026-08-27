import { Hono } from "hono";
import { writeAuditEntry } from "../admin/audit-log";
import type { ClassifyResult } from "../vision/classifier";
import { type PreVerifyConfig, shouldAuditSample, shouldPreVerify } from "../vision/preverify";

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
function classifyFromRequest(formData: FormData): ClassifyResult | null {
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

/**
 * Read pre-verification config from form fields (test overrides) or defaults.
 * ponytail: ceiling is env-based config table; add when system_config table exists.
 */
function getConfig(formData: FormData): PreVerifyConfig {
  const threshold = formData.get("__threshold");
  const sampleRate = formData.get("__sample_rate");
  return {
    confidenceThreshold: threshold ? Number(threshold) : 0.85,
    auditSampleRate: sampleRate ? Number(sampleRate) : 0.1,
    enabled: true,
  };
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
  const config = getConfig(formData);
  if (killSwitch) config.enabled = false;

  // Screening for wetdry only
  if (photoType === "wetdry" && config.enabled) {
    const classification = classifyFromRequest(formData);

    if (classification) {
      // Refused: invalid photo, don't persist
      if (!classification.valid && classification.confidence < 0.4) {
        // Audit trail: machine refused
        await writeAuditEntry(c.env.DB, {
          photoId: `refused_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          actorType: "machine",
          action: "refused",
          confidence: classification.confidence,
          reason: classification.reason,
        });
        return c.json({
          verdict: "refused" as Verdict,
          reason: classification.reason,
          photo_type: photoType,
        });
      }

      // Flagged: borderline confidence (below threshold but not refused)
      if (!shouldPreVerify(classification.confidence, config, classification.valid)) {
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const key = `evidence/${photoId}.jpg`;
        await c.env.R2.put(key, file);

        await c.env.DB.prepare(
          `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, ai_label, ai_reason, ai_confidence, admin_status, photo_type, water_state, pre_verified, audit_sample)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'flag', ?, ?, ?, 'pending', ?, ?, 0, 0)`,
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
            classification.confidence,
            photoType,
            classification.water_state,
          )
          .run();

        // Audit trail: machine flagged
        await writeAuditEntry(c.env.DB, {
          photoId,
          actorType: "machine",
          action: "flagged",
          confidence: classification.confidence,
          reason: classification.reason,
        });

        return c.json(
          {
            id: photoId,
            verdict: "flagged" as Verdict,
            photo_url: key,
            photo_type: photoType,
            water_state: classification.water_state,
            ai_confidence: classification.confidence,
          },
          201,
        );
      }

      // Pre-verified: high confidence pass — apply stamp + audit sampling
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const key = `evidence/${photoId}.jpg`;
      await c.env.R2.put(key, file);

      const isAudit = shouldAuditSample(photoId, config.auditSampleRate);

      await c.env.DB.prepare(
        `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, ai_label, ai_reason, ai_confidence, admin_status, photo_type, water_state, pre_verified, audit_sample)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          "pass",
          classification.water_state,
          classification.reason,
          classification.confidence,
          "pending",
          photoType,
          classification.water_state,
          1,
          isAudit ? 1 : 0,
        )
        .run();

      // Audit trail: machine pre-verified
      await writeAuditEntry(c.env.DB, {
        photoId,
        actorType: "machine",
        action: "pre_verified",
        confidence: classification.confidence,
        reason: classification.reason,
      });

      return c.json(
        {
          id: photoId,
          verdict: "pre_verified" as Verdict,
          photo_url: key,
          photo_type: photoType,
          water_state: classification.water_state,
          ai_confidence: classification.confidence,
          pre_verified: true,
          audit_sample: isAudit,
        },
        201,
      );
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

  return c.json(
    {
      id: photoId,
      photo_url: key,
      verdict: "queued" as Verdict,
      photo_type: photoType,
    },
    201,
  );
});
