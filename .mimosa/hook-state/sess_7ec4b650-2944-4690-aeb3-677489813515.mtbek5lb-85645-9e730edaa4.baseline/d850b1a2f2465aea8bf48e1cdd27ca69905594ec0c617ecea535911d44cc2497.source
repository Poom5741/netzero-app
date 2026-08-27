type ValidateInput = {
  fileHash: string;
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number;
  db: D1Database;
};

type ValidationResult = {
  isValid: boolean;
  reason?: string;
};

const GPS_ACCURACY_THRESHOLD = 50;

export async function validatePhoto(input: ValidateInput): Promise<ValidationResult> {
  const accuracyCheck = checkGpsAccuracy(input.gpsAccuracy);
  if (!accuracyCheck.isValid) return accuracyCheck;

  const dupCheck = await checkDuplicate(input.fileHash, input.db);
  if (!dupCheck.isValid) return dupCheck;

  return { isValid: true };
}

function checkGpsAccuracy(accuracy: number): ValidationResult {
  if (accuracy > GPS_ACCURACY_THRESHOLD) {
    return { isValid: false, reason: "GPS accuracy ต่ำกว่าเกณฑ์ (>50m)" };
  }
  return { isValid: true };
}

async function checkDuplicate(fileHash: string, db: D1Database): Promise<ValidationResult> {
  const existing = await db
    .prepare("SELECT id FROM photo_evidence WHERE photo_url LIKE ?")
    .bind(`%${fileHash}%`)
    .first();
  if (existing) {
    return { isValid: false, reason: "รูปภาพซ้ำ — ถ่ายใหม่หรือตรวจสอบรูปเดิม" };
  }
  return { isValid: true };
}
