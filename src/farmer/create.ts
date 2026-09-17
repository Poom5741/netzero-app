/**
 * Farmer and Plot creation — CRUD for onboarding new farmers.
 *
 * Farmers are identified by phone number (phone = identity).
 * Plots are auto-assigned a code based on province + sequence.
 */

export interface FarmerCreateInput {
  full_name: string;
  phone: string;
  gender?: "male" | "female" | "unspecified";
  addr_province?: string;
  addr_district?: string;
  addr_subdistrict?: string;
  addr_village?: string;
  national_id_enc?: string;
}

export interface FarmerCreateResult {
  success: boolean;
  farmer_id?: string;
  error?: string;
}

export interface PlotCreateInput {
  farmer_id: string;
  deed_no: string;
  area_rai: number;
  doc_type?: "chanote" | "ns3k" | "spk" | "rental";
  tenure?: "owner" | "tenant" | "proxy";
  addr_province?: string;
  centroid_lat?: number;
  centroid_lng?: number;
}

export interface PlotCreateResult {
  success: boolean;
  plot_id?: string;
  plot_code?: string;
  error?: string;
}

/**
 * Province abbreviation mapping (Thai province name → 3-letter code).
 */
const PROVINCE_CODES: Record<string, string> = {
  สุพรรณบุรี: "SPB",
  กรุงเทพมหานคร: "BKK",
  เชียงใหม่: "CNX",
  ขอนแก่น: "KKN",
  อุบลราชธานี: "UBN",
  นครราชสีมา: "NKM",
  สุราษฎร์ธานี: "SRT",
  ชลบุรี: "CBI",
  ภูเก็ต: "HKT",
  สงขลา: "SKA",
};

/**
 * Generate a plot code from province abbreviation + random suffix.
 */
function generatePlotCode(province?: string): string {
  const prefix = province ? (PROVINCE_CODES[province] ?? "PLT") : "PLT";
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `${prefix}-${seq}`;
}

/**
 * Create a new farmer record.
 */
export async function handleFarmerCreate(
  db: D1Database,
  input: FarmerCreateInput,
  createdBy?: string,
): Promise<FarmerCreateResult> {
  const fullName = input.full_name?.trim() ?? "";
  if (!fullName) return { success: false, error: "full_name is required" };
  if (fullName.length > 100) return { success: false, error: "full_name is too long" };

  if (!input.phone?.trim()) return { success: false, error: "phone is required" };
  const phone = input.phone.replace(/[-\s]/g, "");
  if (!/^0\d{9}$/.test(phone)) {
    return { success: false, error: "Phone number must be 10 digits starting with 0" };
  }

  const gender = input.gender ?? "unspecified";
  if (!["male", "female", "unspecified"].includes(gender)) {
    return { success: false, error: "gender is invalid" };
  }

  const address = [
    ["addr_province", input.addr_province],
    ["addr_district", input.addr_district],
    ["addr_subdistrict", input.addr_subdistrict],
    ["addr_village", input.addr_village],
  ] as const;
  const normalizedAddress: Record<string, string | null> = {};
  for (const [field, value] of address) {
    const normalized = value?.trim() || null;
    if (normalized && normalized.length > 50) {
      return { success: false, error: `${field} is too long` };
    }
    normalizedAddress[field] = normalized;
  }

  const existing = await db
    .prepare("SELECT id FROM farmers WHERE phone = ?")
    .bind(phone)
    .first<{ id: string }>();
  if (existing) return { success: false, error: "Phone number already exists" };

  const farmerId = `farmer_${crypto.randomUUID()}`;
  const farmerInsert = db
    .prepare(
      `INSERT INTO farmers (
        id, full_name, gender, phone,
        addr_province, addr_district, addr_subdistrict, addr_village,
        national_id_enc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      farmerId,
      fullName,
      gender,
      phone,
      normalizedAddress.addr_province,
      normalizedAddress.addr_district,
      normalizedAddress.addr_subdistrict,
      normalizedAddress.addr_village,
      input.national_id_enc ?? null,
    );

  const auditInsert = createdBy
    ? db
        .prepare(
          `INSERT INTO automation_audit_log (
            id, actor_type, actor_id, action, entity_type, entity_id, created_at
          ) VALUES (?, 'admin', ?, 'farmer.create', 'farmer', ?, datetime('now'))`,
        )
        .bind(`audit_${crypto.randomUUID()}`, createdBy, farmerId)
    : null;

  try {
    const dbWithBatch = db as D1Database & {
      batch?: (statements: D1PreparedStatement[]) => Promise<unknown>;
    };
    if (auditInsert && dbWithBatch.batch) {
      await dbWithBatch.batch([farmerInsert, auditInsert]);
    } else {
      await farmerInsert.run();
      if (auditInsert) {
        try {
          await auditInsert.run();
        } catch (error) {
          await db.prepare("DELETE FROM farmers WHERE id = ?").bind(farmerId).run();
          throw error;
        }
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (message.includes("unique") || message.includes("constraint")) {
      return { success: false, error: "Phone number already exists" };
    }
    return { success: false, error: "Farmer creation failed" };
  }

  return { success: true, farmer_id: farmerId };
}

/**
 * Create a new plot record with auto-generated plot_code.
 */
export async function handlePlotCreate(
  db: D1Database,
  input: PlotCreateInput,
): Promise<PlotCreateResult> {
  // Validate required fields
  if (!input.farmer_id?.trim()) {
    return { success: false, error: "farmer_id is required" };
  }
  if (!input.deed_no?.trim()) {
    return { success: false, error: "deed_no is required" };
  }
  if (!input.area_rai || input.area_rai <= 0) {
    return { success: false, error: "area_rai must be greater than 0" };
  }

  // Check farmer exists
  const farmer = await db
    .prepare("SELECT id FROM farmers WHERE id = ?")
    .bind(input.farmer_id)
    .first<{ id: string }>();
  if (!farmer) {
    return { success: false, error: "Farmer not found" };
  }

  // Generate plot code
  const plotCode = generatePlotCode(input.addr_province);

  // Create plot
  const plotId = `plot_${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO plots (
        id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai,
        centroid_lat, centroid_lng
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      plotId,
      input.farmer_id,
      plotCode,
      input.deed_no.trim(),
      input.doc_type ?? null,
      input.tenure ?? null,
      input.area_rai,
      input.centroid_lat ?? null,
      input.centroid_lng ?? null,
    )
    .run();

  return { success: true, plot_id: plotId, plot_code: plotCode };
}
