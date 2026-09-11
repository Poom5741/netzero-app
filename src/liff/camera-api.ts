/**
 * LIFF Camera API — photo capture with GPS and water depth.
 *
 * Handles the LF-04 camera flow:
 * - Compose prompt messages for WET/DRY rounds
 * - Validate photo submissions
 * - Compose confirmation messages
 */

export interface CameraPromptInput {
  roundLabel: string;
  stepCode: string;
  plotName: string;
  dayAfterSow: number;
  deadline: string;
  daysLeft: number;
  isWet: boolean;
}

export interface PhotoConfirmationInput {
  roundLabel: string;
  photoId: string;
  gpsLat: number;
  gpsLng: number;
  takenAt: string;
  waterDepthCm: number | null;
}

export interface PhotoSubmissionInput {
  plot_id: string;
  season_id: string;
  photo_type: string;
  gps_lat: number;
  gps_lng: number;
  water_depth_cm?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Compose the camera prompt message for a photo round.
 * Matches the design system's photo submission flow.
 */
export function composeCameraPrompt(input: CameraPromptInput): string {
  const lines: string[] = [];

  lines.push(`${input.roundLabel} · ${input.stepCode}`);
  lines.push("");
  lines.push(`รอบที่ ${input.roundLabel.split("-")[0]} · ช่วง${input.isWet ? "เปียก" : "แห้ง"}`);
  lines.push("");
  lines.push(`ถึงเวลารายงานแล้วครับ 🌾`);
  lines.push(`${input.plotName} · วันที่ ${input.dayAfterSow} หลังหว่าน`);
  lines.push("");
  lines.push("ส่งได้ถึง");
  lines.push(`${input.deadline} · เหลือ ${input.daysLeft} วัน`);

  if (input.daysLeft <= 2) {
    lines.push("");
    lines.push("⚠️ ด่วน! เกือบครบกำหนด");
  }

  lines.push("");
  lines.push("สิ่งที่ต้องส่ง");

  if (input.isWet) {
    lines.push("ภาพท่อ PVC ตอนน้ำเต็มระดับผิวดิน");
    lines.push("ยืนห่างประมาณ 1 เมตร");
    lines.push("ระบบจะจับพิกัดและเวลาให้อัตโนมัติ ต้องเปิด GPS");
  } else {
    lines.push("ภาพท่อ + ระดับน้ำต่ำกว่าผิวดิน (ซม.)");
    lines.push("อ่านจากขีดบนท่อ");
    lines.push("ยืนห่างประมาณ 1 เมตร");
  }

  return lines.join("\n");
}

/**
 * Compose the photo confirmation message after successful upload.
 */
export function composePhotoConfirmation(input: PhotoConfirmationInput): string {
  const lines: string[] = [];

  lines.push(`${input.roundLabel}`);
  lines.push("");
  lines.push(`${input.gpsLat}, ${input.gpsLng} · ${input.takenAt}`);

  if (input.waterDepthCm !== null && input.waterDepthCm !== undefined) {
    lines.push(`${input.waterDepthCm} ซม.`);
  }

  return lines.join("\n");
}

/**
 * Validate a photo submission before upload.
 */
export function validatePhotoSubmission(input: PhotoSubmissionInput): ValidationResult {
  if (!input.plot_id?.trim()) {
    return { valid: false, error: "plot_id is required" };
  }
  if (!input.season_id?.trim()) {
    return { valid: false, error: "season_id is required" };
  }
  if (!input.gps_lat || !input.gps_lng) {
    return { valid: false, error: "GPS coordinates are required" };
  }
  if (!input.photo_type) {
    return { valid: false, error: "photo_type is required" };
  }

  return { valid: true };
}
