type PhotoDetail = {
  id: string;
  plot_id: string;
  season_id: string;
  photo_url: string;
  gps_lat: number;
  gps_lng: number;
  gps_accuracy: number | null;
  taken_at: string;
  ai_status: string | null;
  ai_label: string | null;
  ai_reason: string | null;
  ai_confidence: number | null;
  admin_status: string | null;
  admin_reason: string | null;
};

export async function getPhotoDetail(db: D1Database, photoId: string): Promise<PhotoDetail | null> {
  const row = await db
    .prepare(
      `SELECT id, plot_id, season_id, photo_url,
              gps_lat, gps_lng, gps_accuracy, taken_at,
              ai_status, ai_label, ai_reason, ai_confidence,
              admin_status, admin_reason
       FROM photo_evidence WHERE id = ?`,
    )
    .bind(photoId)
    .first<PhotoDetail>();

  return row ?? null;
}
