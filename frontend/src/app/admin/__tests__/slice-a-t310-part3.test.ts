/**
 * T-310 — Tier-1 assertions, slice A part 3 (AD-APP + AD-REPORT +
 * AD-SPONSOR + AD-SETTINGS), 017-admin-sponsor-design-parity
 * (R-006, R-016, R-017, R-018, R-019, R-025, R-028).
 *
 * Technique (as parts 1-2): readFileSync on the raw page sources + exact
 * string assertions. NO jsdom cascade/computed-style, NO rendered DOM
 * (R-009). The hex detector here is deliberately simple (a plain
 * "#+3..8 hexdigit" scan built from a backslash-free string) asserting
 * that ALL FOUR part-3 sources are fully token-based (R-006). The
 * refined repo-wide detector and its exactly-2 baseline
 * (sponsor/login:76,:85) remain owned by
 * components/__tests__/literal-freedom.test.ts. A planted-literal
 * break-check proves this scan is not a no-op.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // src/app/admin/__tests__
const ADMIN_DIR = resolve(HERE, "..");
const APP_SRC = readFileSync(join(ADMIN_DIR, "applications/page.tsx"), "utf8");
const REPORT_SRC = readFileSync(join(ADMIN_DIR, "reports/page.tsx"), "utf8");
const SPONSOR_SRC = readFileSync(join(ADMIN_DIR, "sponsors/page.tsx"), "utf8");
const SETTINGS_SRC = readFileSync(join(ADMIN_DIR, "settings/page.tsx"), "utf8");

const DQ = String.fromCharCode(34); // double-quote character

const HEX_SCAN = new RegExp("#[0-9a-fA-F]{3,8}", "g");

function hexFindings(src: string): string[] {
  return src.match(HEX_SCAN) ?? [];
}

describe("T-310 slice A part 3 — detector non-vacuity", () => {
  it("HEX_SCAN actually fires on a planted literal (not a no-op)", () => {
    const planted = "style={{ background: " + DQ + "#9FC7E8" + DQ + " }}";
    expect(hexFindings(planted)).toEqual(["#9FC7E8"]);
  });
});

describe("T-310 — AD-APP /admin/applications (T-305)", () => {
  it("PageTitle is page-local (DECIDED O-6) with artifact copy verbatim (R-028)", () => {
    expect(APP_SRC).toContain("function PageTitle(");
    expect(APP_SRC).toContain("function Section(");
    expect(APP_SRC).toContain("AD-10 · ใบสมัครรอตรวจ");
    expect(APP_SRC).toContain("ตรวจและอนุมัติใบสมัครเข้าร่วมโครงการ");
    expect(APP_SRC).toContain(
      "ชุดเอกสารที่บังคับเปลี่ยนตามสถานะการถือครอง (R-09) — เจ้าของ · เจ้าของร่วม · ผู้เช่า · ผู้รับมอบอำนาจ"
    );
    expect(APP_SRC).toContain("color: " + DQ + "var(--teal-600)" + DQ);
    expect(APP_SRC).toContain("letterSpacing: " + DQ + "var(--tracking-eyebrow)" + DQ);
    expect(APP_SRC).toContain("fontSize: " + DQ + "38px" + DQ);
  });

  it("2-column split: left DataTable + 400px detail panel (spec :397, :403)", () => {
    expect(APP_SRC).toContain("gridTemplateColumns: " + DQ + "minmax(0, 1fr) 400px" + DQ);
    expect((APP_SRC.match(/<DataTable/g) ?? []).length).toBe(1);
    expect(APP_SRC).toContain("เลขที่ใบสมัคร");
    expect(APP_SRC).toContain("CPA code");
    expect(APP_SRC).toContain("ชื่อ-นามสกุล");
    expect(APP_SRC).toContain("ตำบล");
    expect(APP_SRC).toContain("สถานะการถือครอง");
    expect(APP_SRC).toContain("ไร่");
    expect(APP_SRC).toContain("เอกสาร");
    expect(APP_SRC).toContain("ค้าง");
    expect(APP_SRC).toContain("สถานะ");
  });

  it("detail panel: header + 8-row metadata list + approval checklist", () => {
    expect(APP_SRC).toContain("เช็กลิสต์ก่อนอนุมัติ");
    expect(APP_SRC).toContain("เอกสารครบตามที่กำหนด (");
    expect(APP_SRC).toContain("ความยินยอมครบ 4 รายการ (");
    expect(APP_SRC).toContain("padding: " + DQ + "9px 12px" + DQ);
  });

  it("live wiring + tabs + approve/reject behaviour preserved verbatim (R-016/R-025/R-026)", () => {
    expect(APP_SRC).toContain("useAdminSessionGate");
    expect(APP_SRC).toContain("getApplications(status)");
    expect(APP_SRC).toContain("approveApplication(id)");
    expect(APP_SRC).toContain("rejectApplication(id, rejectReason)");
    expect(APP_SRC).toContain("const tabs: { key: TabKey; label: string }[] = [");
    expect(APP_SRC).toContain("รอตรวจสอบ");
    expect(APP_SRC).toContain("อนุมัติแล้ว");
    expect(APP_SRC).toContain("ปฏิเสธแล้ว");
    expect(APP_SRC).toContain("ทั้งหมด");
    expect(APP_SRC).toContain("อนุมัติ");
    expect(APP_SRC).toContain("ปฏิเสธ");
    expect(APP_SRC).toContain("ยืนยันปฏิเสธ");
    expect(APP_SRC).toContain("เหตุผลที่ปฏิเสธ");
    expect(APP_SRC).toContain("พร้อมอนุมัติ");
    expect(APP_SRC).toContain("เอกสารไม่ครบ");
  });
});

describe("T-310 — AD-REPORT /admin/reports (T-306)", () => {
  it("PageTitle with artifact copy verbatim (R-028; spec :416-417)", () => {
    expect(REPORT_SRC).toContain("function PageTitle(");
    expect(REPORT_SRC).toContain("AD-07 · ส่งออกรายงาน");
    expect(REPORT_SRC).toContain("รายงานและไฟล์สำหรับยื่นขึ้นทะเบียน");
  });

  it("report DataTable: 4 artifact columns (:421) + 380px right panel (:413)", () => {
    expect(REPORT_SRC).toContain("gridTemplateColumns: " + DQ + "minmax(0, 1fr) 380px" + DQ);
    expect((REPORT_SRC.match(/<DataTable/g) ?? []).length).toBe(1);
    expect(REPORT_SRC).toContain("รายงาน");
    expect(REPORT_SRC).toContain("รูปแบบ");
    expect(REPORT_SRC).toContain("ขอบเขต");
    expect(REPORT_SRC).toContain("ใครดาวน์โหลดได้");
  });

  it("T-VER panel: 3 ProgressBars + warning banner + download buttons + locked submit (:423)", () => {
    expect((REPORT_SRC.match(/<ProgressBar/g) ?? []).length).toBe(3);
    expect(REPORT_SRC).toContain("value={71}");
    expect(REPORT_SRC).toContain("value={88}");
    expect(REPORT_SRC).toContain("ชุดยื่น T-VER");
    expect(REPORT_SRC).toContain("ยื่นชุดขึ้นทะเบียน");
    expect((REPORT_SRC.match(/variant="outline"/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(REPORT_SRC).toContain("background: " + DQ + "var(--status-warning-soft)" + DQ);
  });

  it("detail: 5 live kv pairs + LIVE download wiring preserved (R-025)", () => {
    expect(REPORT_SRC).toContain("getReports()");
    expect(REPORT_SRC).toContain("downloadReport(reportId)");
    expect(REPORT_SRC).toContain("รหัสรายงาน");
    expect(REPORT_SRC).toContain("ชื่อรายงาน");
    expect(REPORT_SRC).toContain("รูปแบบไฟล์");
    expect(REPORT_SRC).toContain("คำอธิบาย");
    expect(REPORT_SRC).toContain("สถานะ");
    expect(REPORT_SRC).toContain("พร้อมดาวน์โหลด");
    expect(REPORT_SRC).toContain("ยังไม่พร้อม");
  });
});

describe("T-310 — AD-SPONSOR /admin/sponsors (T-307)", () => {
  it("PageTitle with artifact copy verbatim (R-028; :434-436)", () => {
    expect(SPONSOR_SRC).toContain("function PageTitle(");
    expect(SPONSOR_SRC).toContain("F-65 · สิทธิ์ของลูกค้า");
    expect(SPONSOR_SRC).toContain("บริษัทผู้สนับสนุนและขอบเขตที่มองเห็นได้");
    expect(SPONSOR_SRC).toContain("แอดมินเป็นผู้กำหนดว่าบัญชีลูกค้าเห็นพื้นที่ใดได้ · ลูกค้าไม่เห็นพื้นที่ของผู้สนับสนุนรายอื่น");
  });

  it("one Section per sponsor + two-column checkbox groups (:436)", () => {
    expect(SPONSOR_SRC).toContain("function Section(");
    expect(SPONSOR_SRC).toContain("sponsors.map((sponsor)");
    expect((SPONSOR_SRC.match(/<Checkbox/g) ?? []).length).toBeGreaterThanOrEqual(1);
    expect(SPONSOR_SRC).toContain("พื้นที่จังหวัดที่เห็นได้");
    expect(SPONSOR_SRC).toContain("ระดับการมองเห็น");
    expect(SPONSOR_SRC).toContain("DEFERRED — VISIBILITY LEVELS");
  });

  it("stats header on LIVE fields; province options from LIVE getProvinceTable (R-025)", () => {
    expect(SPONSOR_SRC).toContain("getSponsors()");
    expect(SPONSOR_SRC).toContain("getProvinceTable()");
    expect(SPONSOR_SRC).toContain("sponsor.plot_count");
    expect(SPONSOR_SRC).toContain("sponsor.credit_total.toFixed(2)");
    expect(SPONSOR_SRC).toContain("checked={areas.includes(province)}");
  });
});

describe("T-310 — AD-SETTINGS /admin/settings (T-308)", () => {
  it("PageTitle with artifact copy verbatim (R-028; screens/8 copy)", () => {
    expect(SETTINGS_SRC).toContain("function PageTitle(");
    expect(SETTINGS_SRC).toContain("function Section(");
    expect(SETTINGS_SRC).toContain("ตั้งค่าระบบ");
    expect(SETTINGS_SRC).toContain("ตั้งค่าแอปและระดับสิทธิ์ของบัญชี");
    expect(SETTINGS_SRC).toContain("ทุกการเปลี่ยนแปลงในหน้านี้ถูกบันทึกลง audit log พร้อมค่าก่อน-หลัง (AD-11)");
  });

  it("5 tabs with artifact labels; keys/state preserved", () => {
    expect(SETTINGS_SRC).toContain("สิทธิ์การเข้าถึง");
    expect(SETTINGS_SRC).toContain("บัญชีผู้ใช้");
    expect(SETTINGS_SRC).toContain("ค่าคงที่การคำนวณ");
    expect(SETTINGS_SRC).toContain("การแจ้งเตือน");
    expect(SETTINGS_SRC).toContain("ทั่วไป");
    expect(SETTINGS_SRC).toContain("type TabKey = " + DQ + "permissions" + DQ + " | " + DQ + "users" + DQ + " | " + DQ + "constants" + DQ + " | " + DQ + "notifications" + DQ + " | " + DQ + "general" + DQ + ";");
  });

  it("role cards: 5 across, repeat(5,1fr), artifact names verbatim", () => {
    expect(SETTINGS_SRC).toContain("gridTemplateColumns: " + DQ + "repeat(5, 1fr)" + DQ);
    expect(SETTINGS_SRC).toContain("ผู้ดูแลระบบ");
    expect(SETTINGS_SRC).toContain("เจ้าหน้าที่ทวนสอบ");
    expect(SETTINGS_SRC).toContain("เจ้าหน้าที่ภาคสนาม");
    expect(SETTINGS_SRC).toContain("บัญชีลูกค้า");
    expect(SETTINGS_SRC).toContain("ผู้ประเมินภายนอก");
    expect(SETTINGS_SRC).toContain("settings.users.filter((u) => u.role === role.id).length");
  });

  it("permissions matrix: 15 artifact rows x 5 role columns (:446), geometry :715-717", () => {
    expect(SETTINGS_SRC).toContain("padding: " + DQ + "11px 14px" + DQ);
    expect(SETTINGS_SRC).toContain("padding: " + DQ + "9px 14px" + DQ);
    expect(SETTINGS_SRC).toContain("marginLeft: " + DQ + "7px" + DQ);
    expect(SETTINGS_SRC).toContain("ดูแดชบอร์ดรวมทุกพื้นที่");
    expect(SETTINGS_SRC).toContain("ดูเฉพาะพื้นที่ที่ได้รับมอบหมาย");
    expect(SETTINGS_SRC).toContain("เห็นชื่อ เบอร์ เลขบัตร เลขโฉนด");
    expect(SETTINGS_SRC).toContain("ตรวจและอนุมัติภาพหลักฐาน");
    expect(SETTINGS_SRC).toContain("ตรวจและอนุมัติใบสมัคร");
    expect(SETTINGS_SRC).toContain("กรอกข้อมูลแทนเกษตรกร (BL-14)");
    expect(SETTINGS_SRC).toContain("ตอบแชตแทนบอต (AD-12)");
    expect(SETTINGS_SRC).toContain("นำเข้าข้อมูลเป็นชุด (AD-13)");
    expect(SETTINGS_SRC).toContain("สั่งคำนวณเครดิตใหม่ (calc_run)");
    expect(SETTINGS_SRC).toContain("แก้ค่าคงที่และตารางค้นค่า");
    expect(SETTINGS_SRC).toContain("ส่งออกรายงานรายเกษตรกร");
    expect(SETTINGS_SRC).toContain("ส่งออกชุดยื่น Premium T-VER");
    expect(SETTINGS_SRC).toContain("ดูและส่งออกรายงานของตัวเอง");
    expect(SETTINGS_SRC).toContain("ดู audit log ทั้งระบบ");
    expect(SETTINGS_SRC).toContain("ตั้งค่าสิทธิ์ของบัญชีอื่น");
    expect((SETTINGS_SRC.match(/ARTIFACT_PERMISSIONS: Array/g) ?? []).length).toBe(1);
  });

  it("matrix cells: live binding only where a live key exists (R-025)", () => {
    expect(SETTINGS_SRC).toContain("liveKey: " + DQ + "overview" + DQ);
    expect(SETTINGS_SRC).toContain("liveKey: " + DQ + "review" + DQ);
    expect(SETTINGS_SRC).toContain("liveKey: " + DQ + "applications" + DQ);
    expect(SETTINGS_SRC).toContain("liveKey: " + DQ + "reports" + DQ);
    expect(SETTINGS_SRC).toContain("liveKey: " + DQ + "audit" + DQ);
    expect(SETTINGS_SRC).toContain("(settings.permissions[role.id] ?? []).includes(perm.liveKey)");
    expect(SETTINGS_SRC).toContain("ยังไม่มีข้อมูลสิทธิ์นี้จากระบบจริง");
  });

  it("constants tab: TWO DataTables (Group A live + Group B artifact lookups)", () => {
    expect((SETTINGS_SRC.match(/<DataTable/g) ?? []).length).toBe(2);
    expect(SETTINGS_SRC).toContain("กลุ่ม A — ค่าคงที่การคำนวณ (ค่าระบบ)");
    expect(SETTINGS_SRC).toContain("กลุ่ม B — ตารางค้นพฤติกรรม (ค่าอ้างอิง)");
    expect(SETTINGS_SRC).toContain("SF_P");
    expect(SETTINGS_SRC).toContain("SF_W");
    expect(SETTINGS_SRC).toContain("CFOA");
    expect((SETTINGS_SRC.match(/LOOKUP_ROWS: Array/g) ?? []).length).toBe(1);
    expect(SETTINGS_SRC).toContain("ค่าอ้างอิงจาก artifact — ยังไม่มี API เชื่อมต่อ");
  });

  it("constants + general edit/save wiring preserved verbatim (R-025)", () => {
    expect(SETTINGS_SRC).toContain("updateSettings(" + DQ + "constants" + DQ + ", local)");
    expect(SETTINGS_SRC).toContain("updateSettings(" + DQ + "general" + DQ + ", local)");
    expect(SETTINGS_SRC).toContain("getSettings()");
    expect(SETTINGS_SRC).toContain("บันทึก");
  });

  it("notifications: toggle rows with --space-4 padding (:719), display-only (R-025)", () => {
    expect(SETTINGS_SRC).toContain("settings.notifications.map((notif, i)");
    expect(SETTINGS_SRC).toContain("padding: " + DQ + "var(--space-4)" + DQ);
    expect(SETTINGS_SRC).toContain("เปิด");
    expect(SETTINGS_SRC).toContain("ปิด");
  });
});

describe("T-310 slice A part 3 — R-006 hex freedom (parts 3 sources)", () => {
  it("all four part-3 sources are token-based: zero raw hex literals", () => {
    expect(hexFindings(APP_SRC)).toEqual([]);
    expect(hexFindings(REPORT_SRC)).toEqual([]);
    expect(hexFindings(SPONSOR_SRC)).toEqual([]);
    expect(hexFindings(SETTINGS_SRC)).toEqual([]);
  });
});
