/**
 * T-310 — Tier-1 assertions, slice A part 2 (AD-REV + AD-FAR),
 * 017-admin-sponsor-design-parity (R-006, R-025, R-028).
 *
 * Technique (as slice-a-t310-part1.test.ts): readFileSync on the raw page
 * sources + exact string assertions. NO jsdom cascade/computed-style, NO
 * rendered DOM (R-009).
 *
 * The hex detector here is deliberately simple: a plain "#+3..8 hexdigit"
 * scan (RegExp built from a backslash-free string) asserting that BOTH
 * part-2 sources are fully token-based (R-006). The refined repo-wide
 * detector and its exactly-2 baseline (sponsor/login:76,:85) remain owned
 * by components/__tests__/literal-freedom.test.ts (expected RED until the
 * Phase 3/4 migrations). A planted-literal break-check proves this scan
 * is not a no-op.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // src/app/admin/__tests__
const ADMIN_DIR = resolve(HERE, "..");
const EVIDENCE_SRC = readFileSync(join(ADMIN_DIR, "evidence/page.tsx"), "utf8");
const FARMERS_SRC = readFileSync(join(ADMIN_DIR, "farmers/page.tsx"), "utf8");

const DQ = String.fromCharCode(34); // double-quote character

const HEX_SCAN = new RegExp("#[0-9a-fA-F]{3,8}", "g");

function hexFindings(src: string): string[] {
  return src.match(HEX_SCAN) ?? [];
}

describe("T-310 slice A part 2 — detector non-vacuity", () => {
  it("HEX_SCAN actually fires on a planted literal (not a no-op)", () => {
    const planted = "style={{ background: " + DQ + "#9FC7E8" + DQ + " }}";
    expect(hexFindings(planted)).toEqual(["#9FC7E8"]);
  });
});

describe("T-310 — AD-REV /admin/evidence (T-303)", () => {
  it("PageTitle is page-local (DECIDED O-6) with artifact copy verbatim (R-028)", () => {
    expect(EVIDENCE_SRC).toContain("function PageTitle(");
    expect(EVIDENCE_SRC).toContain("AD-01 · คิวตรวจภาพหลักฐาน");
    expect(EVIDENCE_SRC).toContain("ตรวจภาพท่อวัดระดับน้ำและ metadata");
    expect(EVIDENCE_SRC).toContain(
      "หนึ่งครอปต้องมี 4 ภาพ — เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน · ครบทั้ง 4 จึงใช้ SF_w = 0.55 ได้"
    );
    expect(EVIDENCE_SRC).toContain("color: " + DQ + "var(--teal-600)" + DQ);
    expect(EVIDENCE_SRC).toContain("letterSpacing: " + DQ + "var(--tracking-eyebrow)" + DQ);
    expect(EVIDENCE_SRC).toContain("fontSize: " + DQ + "38px" + DQ);
  });

  it("queue DataTable: dense, artifact column headers verbatim, live set (R-025)", () => {
    expect((EVIDENCE_SRC.match(/<DataTable/g) ?? []).length).toBe(2);
    expect(EVIDENCE_SRC).toContain("รหัสภาพ");
    expect(EVIDENCE_SRC).toContain("แปลงย่อย");
    expect(EVIDENCE_SRC).toContain("รอบ");
    expect(EVIDENCE_SRC).toContain("ระดับน้ำที่กรอก");
    expect(EVIDENCE_SRC).toContain("พิกัด");
    expect(EVIDENCE_SRC).toContain("อายุคำร้อง");
    expect(EVIDENCE_SRC).toContain("ผล");
  });

  it("completeness DataTable: live-derived count + round chips + 4-photo rule", () => {
    expect(EVIDENCE_SRC).toContain("จำนวนภาพ");
    expect(EVIDENCE_SRC).toContain("รอบภาพ");
    expect(EVIDENCE_SRC).toContain("ครบ 4 ภาพ");
    expect(EVIDENCE_SRC).toContain("complete: arr.length >= 4");
    expect(EVIDENCE_SRC).not.toContain(DQ + "SF_w ที่ใช้จริง" + DQ);
  });

  it("photo viewer: 4/3 aspect, --photo-scene token, pipe 30x132 at 50%/22%, cited rgba", () => {
    expect(EVIDENCE_SRC).toContain("aspectRatio: " + DQ + "4 / 3" + DQ);
    expect(EVIDENCE_SRC).toContain("background: " + DQ + "var(--photo-scene)" + DQ);
    expect(EVIDENCE_SRC).toContain("width: " + DQ + "30px" + DQ);
    expect(EVIDENCE_SRC).toContain("height: " + DQ + "132px" + DQ);
    expect(EVIDENCE_SRC).toContain("left: " + DQ + "50%" + DQ);
    expect(EVIDENCE_SRC).toContain("top: " + DQ + "22%" + DQ);
    expect(EVIDENCE_SRC).toContain("borderRadius: " + DQ + "4px" + DQ);
    expect(EVIDENCE_SRC).toContain("rgba(56,120,160,.72)");
    expect(EVIDENCE_SRC).toContain(DQ + "4% 0 0 0" + DQ);
    expect(EVIDENCE_SRC).toContain(DQ + "58% 0 0 0" + DQ);
    expect(EVIDENCE_SRC).toContain("rgba(0,0,0,.6)");
    expect(EVIDENCE_SRC).toContain("fontSize: " + DQ + "10px" + DQ);
    expect(EVIDENCE_SRC).toContain("padding: " + DQ + "3px 7px" + DQ);
    expect(EVIDENCE_SRC).toContain("borderRadius: " + DQ + "5px" + DQ);
  });

  it("metadata panel: 7 artifact rows verbatim, row geometry 9px 12px", () => {
    expect(EVIDENCE_SRC).toContain("ใช้กล้องระบบ");
    expect(EVIDENCE_SRC).toContain("อยู่ในขอบเขต");
    expect(EVIDENCE_SRC).toContain("เวลาถ่าย");
    expect(EVIDENCE_SRC).toContain("ระดับน้ำ");
    expect(EVIDENCE_SRC).toContain("สอดคล้อง");
    expect(EVIDENCE_SRC).toContain("อยู่ในช่วง");
    expect(EVIDENCE_SRC).toContain("padding: " + DQ + "9px 12px" + DQ);
    expect(EVIDENCE_SRC).toContain("border: " + DQ + "1px solid var(--border-subtle)" + DQ);
  });

  it("reject flow: 7 verbatim REJECT_REASONS + checkboxes + textarea + cancel/submit", () => {
    expect(EVIDENCE_SRC).toContain("มองไม่เห็นขีดระดับน้ำในท่อ");
    expect(EVIDENCE_SRC).toContain("ภาพเบลอ / มืดเกินไป");
    expect(EVIDENCE_SRC).toContain("พิกัดตกนอกขอบเขตแปลง");
    expect(EVIDENCE_SRC).toContain("เวลาถ่ายไม่อยู่ในช่วงกำหนดของรอบนี้");
    expect(EVIDENCE_SRC).toContain("รอบแห้งแต่ในภาพน้ำยังเต็มท่อ (หรือกลับกัน)");
    expect(EVIDENCE_SRC).toContain("ไม่ใช่ท่อวัดระดับน้ำของแปลงนี้");
    expect(EVIDENCE_SRC).toContain("ส่งภาพจากคลังภาพ ไม่ได้ถ่ายผ่านกล้องของระบบ");
    expect(EVIDENCE_SRC).toContain("<Checkbox");
    expect(EVIDENCE_SRC).toContain("<textarea");
    expect(EVIDENCE_SRC).toContain("เหตุผลในการปฏิเสธ");
    expect(EVIDENCE_SRC).toContain("ยกเลิก");
    expect(EVIDENCE_SRC).toContain("ส่งการปฏิเสธ");
    expect(EVIDENCE_SRC).toContain("background: " + DQ + "var(--status-danger-soft)" + DQ);
    expect(EVIDENCE_SRC).toContain("border: " + DQ + "1px solid var(--status-danger-border)" + DQ);
  });

  it("approve row: two outline buttons ตีกลับ / อนุมัติและส่งเข้าคำนวณ", () => {
    expect(EVIDENCE_SRC).toContain("ตีกลับ");
    expect(EVIDENCE_SRC).toContain("อนุมัติและส่งเข้าคำนวณ");
    expect((EVIDENCE_SRC.match(/variant="outline"/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it("AD-REV grid geometry: minmax(0, 1fr) 420px, gap --space-6", () => {
    expect(EVIDENCE_SRC).toContain("gridTemplateColumns: " + DQ + "minmax(0, 1fr) 420px" + DQ);
    expect(EVIDENCE_SRC).toContain("gap: " + DQ + "var(--space-6)" + DQ);
  });

  it("live wiring preserved (R-025): queue/precision fetches + 3 review actions + gate", () => {
    expect(EVIDENCE_SRC).toContain("getReviewQueue()");
    expect(EVIDENCE_SRC).toContain("getPrecisionStat()");
    expect(EVIDENCE_SRC).toContain("reviewPhoto(id, " + DQ + "verified" + DQ + ")");
    expect(EVIDENCE_SRC).toContain("reviewPhoto(id, " + DQ + "rejected" + DQ + ", reason)");
    expect(EVIDENCE_SRC).toContain("reviewPhoto(id, " + DQ + "retake" + DQ + ", reason)");
    expect(EVIDENCE_SRC).toContain("useAdminSessionGate()");
    expect(EVIDENCE_SRC).toContain("if (authed === null) return null;");
    expect(EVIDENCE_SRC).toContain("handleBatchToggle");
    expect(EVIDENCE_SRC).toContain("ไม่สามารถโหลดข้อมูลได้");
  });

  it("hex-clean source (R-006)", () => {
    expect(hexFindings(EVIDENCE_SRC)).toEqual([]);
  });
});


describe("T-310 — AD-FAR /admin/farmers (T-304)", () => {
  it("PageTitle is page-local with artifact copy verbatim (R-028)", () => {
    expect(FARMERS_SRC).toContain("function PageTitle(");
    expect(FARMERS_SRC).toContain("ทะเบียนเกษตรกร");
    expect(FARMERS_SRC).toContain("ดูราย CPA code · รายพื้นที่ · รายบริษัทผู้สนับสนุน");
    expect(FARMERS_SRC).toContain("color: " + DQ + "var(--teal-600)" + DQ);
    expect(FARMERS_SRC).toContain("fontSize: " + DQ + "38px" + DQ);
    expect(FARMERS_SRC).toContain("fontWeight: " + DQ + "var(--weight-light)" + DQ);
  });

  it("outline artifact actions + live create action + PdpaNote verbatim", () => {
    expect(FARMERS_SRC).toContain("นำเข้าเป็นชุด (AD-13)");
    expect(FARMERS_SRC).toContain("ส่งออกราย CPA code");
    expect(FARMERS_SRC).toContain("variant=" + DQ + "outline" + DQ);
    expect(FARMERS_SRC).toContain(
      "ตารางนี้แสดงชื่อได้เพราะเป็นบัญชีแอดมิน · ทุกไฟล์ที่ส่งออกและทุกหน้าที่ลูกค้าเห็น ใช้ CPA code แทนชื่อเสมอ (PDPA · CS-02)"
    );
    expect(FARMERS_SRC).toContain("background: " + DQ + "var(--status-info-soft)" + DQ);
    expect(FARMERS_SRC).toContain("padding: " + DQ + "var(--space-4) var(--space-5)" + DQ);
    expect(FARMERS_SRC).toContain("borderRadius: " + DQ + "var(--radius-md)" + DQ);
  });

  it("DataTable: live column set (R-025) with CPA mono 12px bold; artifact-only cols omitted", () => {
    expect(FARMERS_SRC).toContain("CPA code");
    expect(FARMERS_SRC).toContain("ชื่อ-นามสกุล");
    expect(FARMERS_SRC).toContain("พื้นที่");
    expect(FARMERS_SRC).toContain("แปลงย่อย");
    expect(FARMERS_SRC).toContain("ความน่าเชื่อถือ");
    expect(FARMERS_SRC).toContain("fontSize: " + DQ + "12px" + DQ);
    expect(FARMERS_SRC).toContain("fontWeight: " + DQ + "var(--weight-bold)" + DQ);
    expect(FARMERS_SRC).toContain("align: " + DQ + "right" + DQ);
    expect(FARMERS_SRC).not.toContain("ER tCO₂eq");
    expect(FARMERS_SRC).not.toContain("function TrustBadge");
  });

  it("drawer: overlay rgba(6,30,92,.42), min(760px, 94vw), --surface-sunken, --shadow-xl", () => {
    expect(FARMERS_SRC).toContain("rgba(6,30,92,.42)");
    expect(FARMERS_SRC).toContain("width: " + DQ + "min(760px, 94vw)" + DQ);
    expect(FARMERS_SRC).toContain("background: " + DQ + "var(--surface-sunken)" + DQ);
    expect(FARMERS_SRC).toContain("boxShadow: " + DQ + "var(--shadow-xl)" + DQ);
  });

  it("drawer header: --gradient-deep, mono teal-300 CPA, 24px light white name, 4 live stats", () => {
    expect(FARMERS_SRC).toContain("background: " + DQ + "var(--gradient-deep)" + DQ);
    expect(FARMERS_SRC).toContain("padding: " + DQ + "var(--space-6) var(--space-8)" + DQ);
    expect(FARMERS_SRC).toContain("color: " + DQ + "var(--teal-300)" + DQ);
    expect(FARMERS_SRC).toContain("fontSize: " + DQ + "24px" + DQ);
    expect(FARMERS_SRC).toContain("แปลงย่อย");
    expect(FARMERS_SRC).toContain("เอกสาร");
    expect(FARMERS_SRC).toContain("ภาพหลักฐาน");
  });

  it("drawer tabs: 5 verbatim labels, 13px 11px buttons, 2px teal-600 active, --teal-700 text", () => {
    expect(FARMERS_SRC).toContain("แปลงและเอกสาร");
    expect(FARMERS_SRC).toContain("การคำนวณเครดิต");
    expect(FARMERS_SRC).toContain("ที่มาของไนโตรเจน");
    expect(FARMERS_SRC).toContain("ภาพหลักฐาน");
    expect(FARMERS_SRC).toContain("ประวัติการแก้ไข");
    expect(FARMERS_SRC).toContain("padding: " + DQ + "13px 11px" + DQ);
    expect(FARMERS_SRC).toContain("borderBottom: " + DQ + "2px solid " + DQ + " + (active ? " + DQ + "var(--teal-600)" + DQ + " : " + DQ + "transparent" + DQ + ")");
    expect(FARMERS_SRC).toContain("color: active ? " + DQ + "var(--teal-700)" + DQ + " : " + DQ + "var(--text-muted)" + DQ);
    expect(FARMERS_SRC).toContain("padding: " + DQ + "0 var(--space-8)" + DQ);
  });

  it("tab content padding --space-6 --space-8 --space-16; photo grid repeat(4, 1fr) gap --space-3", () => {
    expect(FARMERS_SRC).toContain("padding: " + DQ + "var(--space-6) var(--space-8) var(--space-16)" + DQ);
    expect(FARMERS_SRC).toContain("gridTemplateColumns: " + DQ + "repeat(4, 1fr)" + DQ);
    expect(FARMERS_SRC).toContain("gap: " + DQ + "var(--space-3)" + DQ);
  });

  it("photo tiles: 4/3 on --photo-scene, pipe overlay with cited water rgba, badge states", () => {
    expect(FARMERS_SRC).toContain("aspectRatio: " + DQ + "4 / 3" + DQ);
    expect(FARMERS_SRC).toContain("background: " + DQ + "var(--photo-scene)" + DQ);
    expect(FARMERS_SRC).toContain("rgba(56,120,160,.72)");
    expect(FARMERS_SRC).toContain(DQ + "4% 0 0 0" + DQ);
    expect(FARMERS_SRC).toContain(DQ + "58% 0 0 0" + DQ);
    expect(FARMERS_SRC).toContain("อนุมัติแล้ว");
    expect(FARMERS_SRC).toContain("รอตรวจ");
  });

  it("live wiring preserved (R-025): getFarmers/createFarmer/getFarmerDetail + gate + form", () => {
    expect(FARMERS_SRC).toContain("getFarmers()");
    expect(FARMERS_SRC).toContain("createFarmer({ ...form, phone })");
    expect(FARMERS_SRC).toContain("getFarmerDetail(farmerId)");
    expect(FARMERS_SRC).toContain("useAdminSessionGate()");
    expect(FARMERS_SRC).toContain("if (authed === null) return null;");
    expect(FARMERS_SRC).toContain("function CreateFarmerForm(");
    expect(FARMERS_SRC).toContain("เพิ่มเกษตรกรเรียบร้อยแล้ว");
    expect(FARMERS_SRC).toContain("ไม่สามารถโหลดข้อมูลได้");
  });

  it("TrustBadge restyled onto ui/badge with identical 70/40 thresholds", () => {
    expect(FARMERS_SRC).toContain("function trustBadge(");
    expect(FARMERS_SRC).toContain("pct >= 70");
    expect(FARMERS_SRC).toContain("pct >= 40");
    expect(FARMERS_SRC).toContain("import { Badge } from " + DQ + "@/components/ui/badge" + DQ);
  });

  it("hex-clean source (R-006)", () => {
    expect(hexFindings(FARMERS_SRC)).toEqual([]);
  });
});
