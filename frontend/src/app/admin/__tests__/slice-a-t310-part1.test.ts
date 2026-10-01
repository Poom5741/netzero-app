/**
 * T-310 — Tier-1 assertions, slice A part 1 (AD-AUTH + AD-OV),
 * 017-admin-sponsor-design-parity (R-006, R-028, R-029).
 *
 * Technique (feedback-loop.md §2, as the other Tier-1 suites):
 * readFileSync on the raw page sources + exact string/regex assertions.
 * NO jsdom cascade/computed-style, NO rendered DOM (R-009). Assertions
 * cover: artifact Thai copy VERBATIM (R-028), artifact geometry values
 * (sizes/tokens), preserved live wiring (R-025/R-026), and
 * hex-cleanliness of both touched sources (R-006) with a non-vacuity
 * break-check proving the hex detector is not a no-op.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // src/app/admin/__tests__
const ADMIN_DIR = resolve(HERE, "..");
const LOGIN_SRC = readFileSync(join(ADMIN_DIR, "login/page.tsx"), "utf8");
const OVERVIEW_SRC = readFileSync(join(ADMIN_DIR, "page.tsx"), "utf8");

// Same corrected HEX_RAW detector shape as literal-freedom.test.ts:
// 3-8 digit hex not inside var()/url() and not preceded/followed by a
// hex-or-identifier char.
const HEX_RAW =
  /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar])/g;

function hexFindings(src: string): string[] {
  return Array.from(src.matchAll(HEX_RAW), (m) => m[0]);
}

describe("T-310 slice A part 1 — detector non-vacuity", () => {
  it("HEX_RAW regex actually fires on a planted literal (not a no-op)", () => {
    const planted = "style={{ color: \"#52ECCA\" }}";
    expect(hexFindings(planted)).toEqual(["#52ECCA"]);
  });
});

describe("T-310 — AD-AUTH /admin/login (T-301)", () => {
  it("two-column artifact split 1.05fr/.95fr, minHeight 100vh", () => {
    expect(LOGIN_SRC).toContain("gridTemplateColumns: \"1.05fr 0.95fr\"");
    expect(LOGIN_SRC).toContain("minHeight: \"100vh\"");
  });

  it("GradientRule 120px replaces the hand-rolled hex gradient", () => {
    expect(LOGIN_SRC).toContain("import { GradientRule } from \"@/components/ui/gradient-rule\"");
    expect(LOGIN_SRC).toMatch(/<GradientRule width=\{120\} \/>/);
    expect(LOGIN_SRC).not.toContain("linear-gradient(90deg, #52ECCA");
  });

  it("eyebrow Admin Console on --teal-300 with --tracking-eyebrow", () => {
    expect(LOGIN_SRC).toContain("Admin Console");
    expect(LOGIN_SRC).toContain("color: \"var(--teal-300)\"");
    expect(LOGIN_SRC).toContain("letterSpacing: \"var(--tracking-eyebrow)\"");
  });

  it("artifact Thai copy verbatim (R-028): headline, description, footer", () => {
    expect(LOGIN_SRC).toContain("โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน");
    expect(LOGIN_SRC).toContain(
      "ตรวจภาพหลักฐาน อนุมัติใบสมัคร คำนวณเครดิต และส่งออกรายงานสำหรับขึ้นทะเบียน Premium T-VER"
    );
    expect(LOGIN_SRC).toContain("ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด");
  });

  it("headline geometry: artifact --text-4xl = 48px, --weight-light, --tracking-display", () => {
    expect(LOGIN_SRC).toContain("fontSize: \"48px\"");
    expect(LOGIN_SRC).toMatch(/<h1[\s\S]*?fontWeight: "var\(--weight-light\)"[\s\S]*?<\/h1>/);
    expect(LOGIN_SRC).toContain("letterSpacing: \"var(--tracking-display)\"");
  });

  it("form header: เข้าสู่ระบบ at artifact --text-2xl = 30px + subheading verbatim", () => {
    expect(LOGIN_SRC).toContain("เข้าสู่ระบบ");
    expect(LOGIN_SRC).toContain("fontSize: \"30px\"");
    expect(LOGIN_SRC).toContain("บัญชีเจ้าหน้าที่ NZC · เข้าถึงได้ทุกพื้นที่และทุกเมนู");
  });

  it("right form panel: white bg, centred at artifact 392px max-width", () => {
    expect(LOGIN_SRC).toMatch(/bg-white/);
    expect(LOGIN_SRC).toContain("maxWidth: \"392px\"");
  });

  it("left brand panel keeps --gradient-deep", () => {
    expect(LOGIN_SRC).toContain("background: \"var(--gradient-deep)\"");
  });

  it("auth/session logic + LoginForm wiring preserved (R-026)", () => {
    expect(LOGIN_SRC).toContain("sessionStorage.removeItem(\"nzc_admin_email\")");
    expect(LOGIN_SRC).toContain("sessionStorage.removeItem(\"nzc_admin_pass\")");
    expect(LOGIN_SRC).toContain("await fetch(\"/login\"");
    expect(LOGIN_SRC).toContain("window.location.href = \"/admin\"");
    expect(LOGIN_SRC).toMatch(/<LoginForm[\s\S]*?type="admin"[\s\S]*?onSubmit={handleLogin}[\s\S]*?\/>/);
  });

  it("hex-clean source (R-006)", () => {
    expect(hexFindings(LOGIN_SRC)).toEqual([]);
  });
});

describe("T-310 — AD-OV /admin (T-302)", () => {
  it("PageTitle pattern is page-local (DECIDED O-6), not a shared import", () => {
    expect(OVERVIEW_SRC).toContain("function PageTitle(");
    expect(OVERVIEW_SRC).toContain("function Section(");
    expect(OVERVIEW_SRC).not.toMatch(/from "@\/components\/ui\/page-title"/);
    expect(OVERVIEW_SRC).not.toMatch(/from "@\/components\/ui\/section"/);
  });

  it("PageTitle geometry: --teal-600 eyebrow, 38px light title, --tracking-eyebrow", () => {
    expect(OVERVIEW_SRC).toContain("color: \"var(--teal-600)\"");
    expect(OVERVIEW_SRC).toContain("letterSpacing: \"var(--tracking-eyebrow)\"");
    expect(OVERVIEW_SRC).toContain("fontSize: \"38px\"");
    expect(OVERVIEW_SRC).toContain("fontWeight: \"var(--weight-light)\"");
    expect(OVERVIEW_SRC).toContain("maxWidth: \"72ch\"");
    expect(OVERVIEW_SRC).toContain("marginLeft: \"auto\"");
  });

  it("artifact PageTitle Thai copy verbatim (R-028)", () => {
    expect(OVERVIEW_SRC).toContain("ภาพรวมโครงการ");
    expect(OVERVIEW_SRC).toContain("โครงการทำนาลดโลกร้อน — ทุกพื้นที่");
    expect(OVERVIEW_SRC).toContain(
      "ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี และ จ.ชัยนาท · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01 · แนวทางการประเมินที่ 3 (ค่าแนะนำ)"
    );
  });

  it("KPI row: 4 restyled KpiCards, credits tile on tone=dark, icons preserved", () => {
    expect(OVERVIEW_SRC).toContain("import { KpiCard } from \"@/components/sponsor/kpi-card\"");
    expect(OVERVIEW_SRC).toContain("tone=\"dark\"");
    expect(OVERVIEW_SRC).toMatch(/icon="group"/);
    expect(OVERVIEW_SRC).toMatch(/icon="landscape"/);
    expect(OVERVIEW_SRC).toMatch(/icon="pending_actions"/);
    expect(OVERVIEW_SRC).toMatch(/icon="co2"/);
    expect((OVERVIEW_SRC.match(/<KpiCard/g) ?? []).length).toBe(4);
  });

  it("work queue: artifact section title + artifact card titles verbatim (R-028)", () => {
    expect(OVERVIEW_SRC).toContain("คิวงานที่ต้องดำเนินการ");
    expect(OVERVIEW_SRC).toContain("ใบสมัครรอตรวจ (AD-10)");
    expect(OVERVIEW_SRC).toContain("ภาพหลักฐานรอตรวจ");
    expect(OVERVIEW_SRC).toContain("แปลงที่หลักฐานยังไม่ครบ 4 ภาพ");
    expect(OVERVIEW_SRC).toContain("แปลงที่ถอยไปใช้ SF_w = 0.71");
  });

  it("live API wiring preserved (R-025): all 5 getters + session gate + season filter", () => {
    expect(OVERVIEW_SRC).toContain("getOverviewKpis(seasonFilter || undefined)");
    expect(OVERVIEW_SRC).toContain("getWorkQueueAlerts()");
    expect(OVERVIEW_SRC).toContain("getCreditChart()");
    expect(OVERVIEW_SRC).toContain("getGhgSources()");
    expect(OVERVIEW_SRC).toContain("getProvinceTable()");
    expect(OVERVIEW_SRC).toContain("useAdminSessionGate()");
    expect(OVERVIEW_SRC).toContain("useState<string>(\"\")");
    expect(OVERVIEW_SRC).toContain("setSeasonFilter(e.target.value)");
    expect(OVERVIEW_SRC).toContain("if (authed === null) return null;");
  });

  it("CreditChart = explicitly-labelled DEFERRED placeholder (R-015), no chart code", () => {
    expect(OVERVIEW_SRC).toContain("data-deferred=\"R-015\"");
    expect(OVERVIEW_SRC).toContain("DEFERRED — CREDIT CHART");
    expect(OVERVIEW_SRC).toContain("กราฟเปรียบเทียบเครดิตรายฤดูกาลยังไม่ดำเนินการ (R-015 deferred placeholder)");
    expect(OVERVIEW_SRC).toContain("กราฟสรุปเครดิต");
    expect(OVERVIEW_SRC).not.toContain("estimatedHeight");
    expect(OVERVIEW_SRC).not.toContain("verifiedHeight");
    expect(OVERVIEW_SRC).not.toContain("bg-gradient-to-t");
  });

  it("GHG DataTable: dense, live 2-column shape, ui/data-table import", () => {
    expect(OVERVIEW_SRC).toContain("import { DataTable } from \"@/components/ui/data-table\"");
    expect(OVERVIEW_SRC).toContain("แหล่งที่มา");
    expect(OVERVIEW_SRC).toContain("ปริมาณ (tCO2e)");
    expect(OVERVIEW_SRC).toMatch(/ghgSources\.map\(\(src\) => \(\{ source: src\.source, value: src\.value\.toFixed\(2\) \}\)\)/);
  });

  it("Province DataTable: row click navigates to /admin/farmers (spec :311)", () => {
    expect(OVERVIEW_SRC).toContain("จังหวัด");
    expect(OVERVIEW_SRC).toContain("ผู้สนับสนุน");
    expect(OVERVIEW_SRC).toContain("router.push(\"/admin/farmers\")");
    expect(OVERVIEW_SRC).toMatch(/onRowClick=\{\(\) => router\.push\("\/admin\/farmers"\)\}/);
  });

  it("Section chrome: surface-card / border-subtle / radius-card / shadow-xs", () => {
    expect(OVERVIEW_SRC).toContain("background: \"var(--surface-card)\"");
    expect(OVERVIEW_SRC).toContain("border: \"1px solid var(--border-subtle)\"");
    expect(OVERVIEW_SRC).toContain("borderRadius: \"var(--radius-card)\"");
    expect(OVERVIEW_SRC).toContain("boxShadow: \"var(--shadow-xs)\"");
  });

  it("hex-clean source (R-006)", () => {
    expect(hexFindings(OVERVIEW_SRC)).toEqual([]);
  });
});
