import { Hono } from "hono";
import { writeAuditEntry } from "../admin/audit-log";
import type { ClassifyResult } from "../vision/classifier";
import { type PreVerifyConfig, shouldAuditSample } from "../vision/preverify";
import { CLIPClassifier } from "../vision/clip-classifier";
import { clipInference } from "../vision/clip-inference";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getFarmerTrust } from "../trust/farmer-trust";
import { evaluateAutoVerify } from "../vision/auto-verify";
import { composeRetakeMessage } from "../vision/retake-message";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
};

export const photoRoutes = new Hono<{ Bindings: Bindings }>();

// Lazy-loaded CLIP classifier (cached after first load)
let clipClassifier: CLIPClassifier | null = null;
let clipLoadAttempted = false;

async function getCLIPClassifier(): Promise<CLIPClassifier | null> {
  if (clipLoadAttempted) return clipClassifier;
  clipLoadAttempted = true;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const bakeoffDir = resolve(__dirname, "../vision/bakeoff");
    clipClassifier = await CLIPClassifier.load(bakeoffDir);
  } catch (err) {
    console.error("Failed to load CLIP classifier:", err);
    clipClassifier = null;
  }
  return clipClassifier;
}

function toClassifyResult(clipResult: { label: string; confidence: number; reason: string }): ClassifyResult {
  return {
    valid: clipResult.label !== "invalid",
    water_state: clipResult.label === "invalid" ? "not-applicable" : clipResult.label,
    confidence: clipResult.confidence,
    reason: clipResult.reason,
  };
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
    // Use CLIP classifier for real inference
    const classifier = await getCLIPClassifier();
    let classification: ClassifyResult | null = null;

    if (classifier) {
      try {
        const imageBuffer = Buffer.from(await file.arrayBuffer());
        const clipResult = await clipInference(classifier, imageBuffer);
        classification = toClassifyResult(clipResult);
      } catch (err) {
        console.error("CLIP inference failed:", err);
        classification = null;
      }
    }

    if (classification) {
      // Get farmer trust score (derive farmer_id from plot_id for now)
      const farmerId = `farmer_${plotId}`;
      const farmerTrust = await getFarmerTrust(c.env.DB, farmerId);
      
      // Evaluate auto-verify rules
      const autoVerifyResult = evaluateAutoVerify({
        confidence: classification.confidence,
        trustScore: farmerTrust.trust_score,
        valid: classification.valid,
      });

      const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const key = `evidence/${photoId}.jpg`;

      if (autoVerifyResult.decision === "auto_verify") {
        // Auto-verify: pre_verified=1, admin_status='verified'
        await c.env.R2.put(key, file);
        const isAudit = shouldAuditSample(photoId, config.auditSampleRate);

        await c.env.DB.prepare(
          `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, ai_label, ai_reason, ai_confidence, admin_status, photo_type, water_state, pre_verified, audit_sample)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pass', ?, ?, ?, 'verified', ?, ?, 1, ?)`,
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
            classification.water_state,
            classification.reason,
            classification.confidence,
            photoType,
            classification.water_state,
            isAudit ? 1 : 0,
          )
          .run();

        await writeAuditEntry(c.env.DB, {
          photoId,
          actorType: "machine",
          action: "pre_verified",
          confidence: classification.confidence,
          reason: autoVerifyResult.reason,
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
      } else if (autoVerifyResult.decision === "auto_reject") {
        // Auto-reject: ai_status='reject', admin_status='rejected'
        await c.env.R2.put(key, file);

        await c.env.DB.prepare(
          `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, ai_label, ai_reason, ai_confidence, admin_status, photo_type, water_state, pre_verified, audit_sample)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'reject', ?, ?, ?, 'rejected', ?, ?, 0, 0)`,
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
            classification.water_state,
            classification.reason,
            classification.confidence,
            photoType,
            classification.water_state,
          )
          .run();

        await writeAuditEntry(c.env.DB, {
          photoId,
          actorType: "machine",
          action: "rejected",
          confidence: classification.confidence,
          reason: autoVerifyResult.reason,
        });

        // Send retake notification to farmer
        const retakeMsg = composeRetakeMessage(classification.reason);
        const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await c.env.DB.prepare(
          `INSERT INTO farmer_messages (id, farmer_id, message_type, raw_text, locale)
           VALUES (?, ?, ?, ?, ?)`,
        )
          .bind(msgId, farmerId, retakeMsg.message_type, retakeMsg.raw_text, retakeMsg.locale)
          .run();

        return c.json(
          {
            id: photoId,
            verdict: "refused" as Verdict,
            photo_url: key,
            photo_type: photoType,
            reason: autoVerifyResult.reason,
          },
          200,
        );
      } else {
        // Queue for admin: ai_status='flag', admin_status='pending'
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
            classification.water_state,
            classification.reason,
            classification.confidence,
            photoType,
            classification.water_state,
          )
          .run();

        await writeAuditEntry(c.env.DB, {
          photoId,
          actorType: "machine",
          action: "flagged",
          confidence: classification.confidence,
          reason: autoVerifyResult.reason,
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
