/**
 * LIFF Registration Form API — validates R-01..R-14 fields and submits
 * registration data to the database.
 *
 * Fields (per artifact):
 * R-01: full_name (ชื่อ-นามสกุล)
 * R-02: gender (เพศ)
 * R-03: phone (เบอร์โทรศัพท์)
 * R-04: national_id (เลขบัตร ปชช.)
 * R-05: addr_province (จังหวัด)
 * R-06: addr_district (อำเภอ)
 * R-07: addr_subdistrict (ตำบล)
 * R-08: addr_village (หมู่)
 * R-09: deed_no (เลขที่โฉนด)
 * R-10: deed_type (ประเภทโฉนด) — chanote, ns3k, spk, rental
 * R-11: holding_status (สถานะการถือครอง) — owner, tenant, proxy, renter
 * R-12: area_rai (พื้นที่/ไร่)
 * R-13: centroid_lat (ละติจูด)
 * R-14: centroid_lng (ลองจิจูด)
 */

export interface RegistrationFormData {
  full_name: string;
  gender: string;
  phone: string;
  national_id: string;
  addr_province: string;
  addr_district: string;
  addr_subdistrict: string;
  addr_village: string;
  deed_no: string;
  deed_type: string;
  holding_status: string;
  area_rai: number;
  centroid_lat: number;
  centroid_lng: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const VALID_DEED_TYPES = ["chanote", "ns3k", "spk", "rental"];
const VALID_HOLDING_STATUSES = ["owner", "tenant", "proxy", "renter"];

/**
 * Validate a registration form submission.
 * Checks required fields, phone format, deed type, and holding status.
 */
export function validateRegistrationForm(data: RegistrationFormData): ValidationResult {
  if (!data.full_name?.trim()) {
    return { valid: false, error: "full_name is required" };
  }

  if (!data.phone?.trim()) {
    return { valid: false, error: "phone is required" };
  }

  // Validate Thai phone: 10 digits starting with 0
  const phoneClean = data.phone.replace(/[-\s]/g, "");
  if (!/^0\d{9}$/.test(phoneClean)) {
    return { valid: false, error: "phone must be a valid 10-digit Thai number" };
  }

  if (!data.national_id?.trim()) {
    return { valid: false, error: "national_id is required" };
  }

  if (!data.addr_province?.trim()) {
    return { valid: false, error: "addr_province is required" };
  }

  if (!data.addr_district?.trim()) {
    return { valid: false, error: "addr_district is required" };
  }

  if (!data.addr_subdistrict?.trim()) {
    return { valid: false, error: "addr_subdistrict is required" };
  }

  if (!data.addr_village?.trim()) {
    return { valid: false, error: "addr_village is required" };
  }

  if (!data.deed_no?.trim()) {
    return { valid: false, error: "deed_no is required" };
  }

  if (!VALID_DEED_TYPES.includes(data.deed_type)) {
    return {
      valid: false,
      error: `deed_type must be one of: ${VALID_DEED_TYPES.join(", ")}`,
    };
  }

  if (!VALID_HOLDING_STATUSES.includes(data.holding_status)) {
    return {
      valid: false,
      error: `holding_status must be one of: ${VALID_HOLDING_STATUSES.join(", ")}`,
    };
  }

  if (!data.area_rai || data.area_rai <= 0) {
    return { valid: false, error: "area_rai must be greater than 0" };
  }

  return { valid: true };
}

/**
 * Get the list of valid deed types for the form select.
 */
export function getDeedTypes(): Array<{ value: string; label: string }> {
  return [
    { value: "chanote", label: "โฉนดที่ดิน (น.ส. 4)" },
    { value: "ns3k", label: "หนังสือรับรองการทำประโยชน์ (น.ส. 3 ก.)" },
    { value: "spk", label: "ส.ป.ก. 4-01" },
    { value: "rental", label: "สัญญาเช่า" },
  ];
}

/**
 * Get the list of valid holding statuses for the form select.
 */
export function getHoldingStatuses(): Array<{ value: string; label: string }> {
  return [
    { value: "owner", label: "เจ้าของที่ดิน" },
    { value: "tenant", label: "ผู้เช่า (ระยะยาว)" },
    { value: "proxy", label: "ผู้รับมอบอำนาจ" },
    { value: "renter", label: "ผู้เช่าช่วง" },
  ];
}
