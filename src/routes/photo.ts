import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
};

export const photoRoutes = new Hono<{ Bindings: Bindings }>();

photoRoutes.post("/photo/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("photo");
  const plotId = formData.get("plot_id");
  const seasonId = formData.get("season_id");
  const gpsLat = Number(formData.get("gps_lat"));
  const gpsLng = Number(formData.get("gps_lng"));
  const gpsAccuracy = formData.get("gps_accuracy");
  const takenAt = formData.get("taken_at") as string;

  if (!(file instanceof File) || !plotId || !seasonId) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const key = `evidence/${photoId}.jpg`;

  await c.env.R2.put(key, file);

  const photoUrl = key;
  await c.env.DB.prepare(
    `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, admin_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
  )
    .bind(photoId, plotId, seasonId, photoUrl, gpsLat, gpsLng, gpsAccuracy ?? null, takenAt)
    .run();

  return c.json({ id: photoId, photo_url: photoUrl }, 201);
});
