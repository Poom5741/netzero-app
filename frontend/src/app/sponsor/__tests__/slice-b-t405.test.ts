/**
 * T-405 — Tier-1 assertions, slice B (SP-AUTH + SP-OV + SP-AREA + SP-REPORT),
 * 017-admin-sponsor-design-parity (R-006, R-020-R-023, R-028, R-029).
 *
 * Technique (feedback-loop.md §2, as the T-310 slice-A suites): readFileSync on
 * the raw page sources + exact string/regex assertions. NO jsdom cascade or
 * computed-style assertions, NO rendered DOM (R-009). Assertions cover: artifact
 * Thai copy VERBATIM (R-028 incl. the R-002 เอกสาร label-only divider semantics,
 * asserted against the sponsor-design-spec §5 NAV block + the artifact JSON),
 * artifact geometry values (sizes/tokens/grids), preserved live wiring
 * (R-025/R-026), the R-027 no-wind-farm-img rule, and hex-cleanliness of all
 * four touched sources (R-006) with a non-vacuity break-check.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // src/app/sponsor/__tests__
const SPONSOR_DIR = resolve(HERE, "..");
const REPO_ROOT = resolve(HERE, "../../../../..");

const LOGIN_SRC = readFileSync(join(SPONSOR_DIR, "login/page.tsx"), "utf8");
const OVERVIEW_SRC = readFileSync(join(SPONSOR_DIR, "page.tsx"), "utf8");
const AREAS_SRC = readFileSync(join(SPONSOR_DIR, "areas/page.tsx"), "utf8");
const REPORTS_SRC = readFileSync(join(SPONSOR_DIR, "reports/page.tsx"), "utf8");

const SPEC_SRC = readFileSync(
  join(REPO_ROOT, "specs", "017-admin-sponsor-design-parity", "sponsor-design-spec.md"),
  "utf8",
);
const ARTIFACT = JSON.parse(
  readFileSync(
    join(REPO_ROOT, "specs", "017-admin-sponsor-design-parity", "sponsor-artifact.json"),
    "utf8",
  ) as string,
) as {
  additionalFindings: { keyFinding_documentsNavItem: string };
};

// Same corrected HEX_RAW detector shape as literal-freedom.test.ts.
const HEX_RAW =
  /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar])/g;

function hexFindings(src: string): string[] {
  return Array.from(src.matchAll(HEX_RAW), (m) => m[0]);
}

describe("T-405 slice B — detector non-vacuity", () => {
  it("HEX_RAW regex actually fires on a planted literal (not a no-op)", () => {
    const planted = "style={{ color: " + JSON.stringify("#52ECCA") + " }}";
    expect(hexFindings(planted)).toEqual(["#52ECCA"]);
  });
});

describe("T-405 — R-006 literal-freedom across the four sponsor screens", () => {
  it("all four touched sources are hex-clean", () => {
    for (const [name, src] of [
      ["login", LOGIN_SRC],
      ["overview", OVERVIEW_SRC],
      ["areas", AREAS_SRC],
      ["reports", REPORTS_SRC],
    ] as const) {
      expect(hexFindings(src), name + " carries raw hex").toEqual([]);
    }
  });
});

describe("T-405 — SP-AUTH /sponsor/login (T-401)", () => {
  it("two-column artifact split 1.05fr/.95fr, minHeight 100vh", () => {
    expect(LOGIN_SRC).toContain("gridTemplateColumns: \"1.05fr 0.95fr\"");
    expect(LOGIN_SRC).toContain("minHeight: \"100vh\"");
  });

  it("sponsor token variants: eyebrow Sponsor Portal on --teal-300 + --tracking-eyebrow", () => {
    expect(LOGIN_SRC).toContain("Sponsor Portal");
    expect(LOGIN_SRC).toContain("color: \"var(--teal-300)\"");
    expect(LOGIN_SRC).toContain("letterSpacing: \"var(--tracking-eyebrow)\"");
  });

  it("GradientRule 120px replaces the hand-rolled gradient (R-006 migration)", () => {
    expect(LOGIN_SRC).toContain("import { GradientRule } from \"@/components/ui/gradient-rule\"");
    expect(LOGIN_SRC).toMatch(/<GradientRule width=\{120\} \/>/);
    expect(LOGIN_SRC).not.toContain("linear-gradient(90deg");
  });

  it("sponsor Thai copy verbatim (R-028): headline, description, footer, sub copy", () => {
    expect(LOGIN_SRC).toContain("พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน");
    expect(LOGIN_SRC).toContain(
      "ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน ตามสิทธิ์ที่แอดมินตั้งค่าไว้"
    );
    expect(LOGIN_SRC).toContain("ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด");
    expect(LOGIN_SRC).toContain("บัญชีบริษัทผู้สนับสนุน · ขอบเขตกำหนดโดยแอดมิน");
  });

  it("headline geometry: 48px (--text-4xl), --weight-light, --tracking-display; description rgba .82 at 18px/1.7", () => {
    expect(LOGIN_SRC).toContain("fontSize: \"48px\"");
    expect(LOGIN_SRC).toMatch(/<h1[\s\S]*?fontWeight: "var\(--weight-light\)"[\s\S]*?<\/h1>/);
    expect(LOGIN_SRC).toContain("letterSpacing: \"var(--tracking-display)\"");
    expect(LOGIN_SRC).toContain("rgba(255,255,255,.82)");
    expect(LOGIN_SRC).toContain("lineHeight: 1.7");
  });

  it("right form panel: white bg, centred at artifact 392px; form header 30px light", () => {
    expect(LOGIN_SRC).toMatch(/bg-white/);
    expect(LOGIN_SRC).toContain("maxWidth: \"392px\"");
    expect(LOGIN_SRC).toContain("fontSize: \"30px\"");
    expect(LOGIN_SRC).toContain("เข้าสู่ระบบ");
  });

  it("R-027: NO wind-farm img tag, gap documented, no placeholder asset fabricated", () => {
    expect(LOGIN_SRC).not.toMatch(/<img/);
    expect(LOGIN_SRC).toContain("documented designer gap"); // gap named in the R-027 comment, never rendered
    expect(LOGIN_SRC).toContain("R-027");
    expect(LOGIN_SRC).toContain("var(--gradient-deep)");
  });

  it("auth/session wiring preserved verbatim (R-026)", () => {
    expect(LOGIN_SRC).toContain("sessionStorage.removeItem(\"nzc_admin_email\")");
    expect(LOGIN_SRC).toContain("fetch(\"/sponsor-login\"");
    expect(LOGIN_SRC).toContain("redirect: \"manual\"");
    expect(LOGIN_SRC).toContain("credentials: \"include\"");
    expect(LOGIN_SRC).toContain("router.push(\"/sponsor\")");
    expect(LOGIN_SRC).toContain("type=\"sponsor\"");
  });
});

describe("T-405 — R-002 sponsor NAV + เอกสาร label-only divider semantics", () => {
  it("spec section 5 NAV defines เอกสาร as divider:true with NO screen id (label-only)", () => {
    expect(SPEC_SRC).toContain("{ label: \"เอกสาร\",  divider: true }");
    // The divider render branch renders label-only section-header text —
    // non-interactive, intentional (no document-management screen exists).
    expect(SPEC_SRC).toContain("entries render as non-interactive section-header text");
    expect(ARTIFACT.additionalFindings.keyFinding_documentsNavItem).toContain("เอกสาร");
  });

  it("sponsor pages keep the live 3-route nav and fabricate NO divider screen", () => {
    for (const src of [OVERVIEW_SRC, AREAS_SRC, REPORTS_SRC]) {
      expect(src).toContain("รายงานและใบรับรอง");
      expect(src).not.toContain("/sponsor/documents");
      // The R-002 semantics are carried as the documented comment (nav-definition
      // parity lands with T-501 — DashboardSidebar has no divider branch).
      expect(src).toContain("R-002");
      expect(src).toContain("label-only");
    }
  });
});

describe("T-405 — SP-OV /sponsor (T-402)", () => {
  it("artifact PageTitle copy verbatim + page-local pattern (eyebrow --text-accent, title 38px light)", () => {
    expect(OVERVIEW_SRC).toContain("eyebrow=\"Sponsor Portal\"");
    expect(OVERVIEW_SRC).toContain("title=\"พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน\"");
    expect(OVERVIEW_SRC).toContain(
      "sub=\"โครงการทำนาลดโลกร้อน · ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01\""
    );
    expect(OVERVIEW_SRC).toContain("color: \"var(--text-accent)\"");
    expect(OVERVIEW_SRC).toContain("fontSize: \"38px\"");
  });

  it("FilterBar in the artifact chrome with live filter state + option sources preserved (R-025)", () => {
    expect(OVERVIEW_SRC).toContain("import { FilterBar } from \"@/components/ui/filter-bar\"");
    expect(OVERVIEW_SRC).toContain("<FilterBar");
    expect(OVERVIEW_SRC).toContain("value: filterProvince");
    expect(OVERVIEW_SRC).toContain("value: filterSeason");
    expect(OVERVIEW_SRC).toContain("onChange: setFilterProvince");
    expect(OVERVIEW_SRC).toContain("onChange: setFilterSeason");
    expect(OVERVIEW_SRC).toContain("ทุกจังหวัด");
    expect(OVERVIEW_SRC).toContain("ทุกฤดู");
    // live CSV export retained in the actions slot
    expect(OVERVIEW_SRC).toContain("handleExport");
    expect(OVERVIEW_SRC).toContain("generateExportCSV(groups)");
    expect(OVERVIEW_SRC).toContain("ส่งออกรายงาน");
  });

  it("PdpaNote (existing component) present", () => {
    expect(OVERVIEW_SRC).toContain("<PdpaNotice />");
  });

  it("hero grid 1.35fr 1fr 1fr with CreditHero + 2 artifact StatTiles", () => {
    expect(OVERVIEW_SRC).toContain("gridTemplateColumns: \"1.35fr 1fr 1fr\"");
    expect(OVERVIEW_SRC).toContain("เครดิตที่รับรองแล้ว (ทวนสอบแล้ว)");
    expect(OVERVIEW_SRC).toContain("title=\"พื้นที่ที่สนับสนุน\"");
    expect(OVERVIEW_SRC).toContain("title=\"ครัวเรือนที่ได้รับประโยชน์\"");
  });

  it("CreditHero geometry: gradient-deep, 60px light value, Badge + GradientRule width=100% thickness 2", () => {
    expect(OVERVIEW_SRC).toContain("background: \"var(--gradient-deep)\"");
    expect(OVERVIEW_SRC).toContain("fontSize: \"60px\"");
    expect(OVERVIEW_SRC).toMatch(/<Badge tone="success">รอบ 2568 \(นาปี \+ นาปรัง\) · ออกใบรับรองครบแล้ว<\/Badge>/);
    expect(OVERVIEW_SRC).toMatch(/<GradientRule width="100%" thickness=\{2\} \/>/);
    expect(OVERVIEW_SRC).toContain("rgba(255,255,255,.74)");
  });

  it("CreditChart Section = labelled DEFERRED frame (R-015), artifact title/sub, minHeight 190", () => {
    expect(OVERVIEW_SRC).toContain("data-deferred=\"R-015\"");
    expect(OVERVIEW_SRC).toContain("DEFERRED — CREDIT CHART");
    expect(OVERVIEW_SRC).toContain("เครดิตรายฤดูของพื้นที่ท่าน");
    expect(OVERVIEW_SRC).toContain("หน่วย tCO₂eq · ประมาณการเทียบกับที่รับรองแล้ว");
    expect(OVERVIEW_SRC).toContain("minHeight: \"190px\"");
  });

  it("GHG Section: artifact title/sub verbatim + live 4-column DataTable (showBaseline=false disclosure)", () => {
    expect(OVERVIEW_SRC).toContain("ที่มาของส่วนต่าง · ปี 2569");
    expect(OVERVIEW_SRC).toContain("ส่วนต่างเกือบทั้งหมดมาจากมีเทน — ปุ๋ยเท่ากันทั้งสองฝั่งโดยเจตนา");
    expect(OVERVIEW_SRC).toContain("header: \"แหล่งการปล่อย\"");
    expect(OVERVIEW_SRC).toContain("header: \"กรณีฐาน (tCO2eq)\"");
    expect(OVERVIEW_SRC).toContain("header: \"โครงการ (tCO2eq)\"");
    expect(OVERVIEW_SRC).toContain("header: \"ส่วนต่าง (tCO2eq)\"");
    // season bars = 2 per season, no baseline bar (sponsor-design-spec :998)
    expect(OVERVIEW_SRC).toContain("2 แท่งต่อฤดู (ไม่แสดงกรณีฐาน)");
    expect(OVERVIEW_SRC).toContain("label=\"ประมาณการ ER\"");
    expect(OVERVIEW_SRC).toContain("label=\"ทวนสอบแล้ว\"");
  });

  it("milestone ProgressBars carry the artifact labels verbatim", () => {
    expect(OVERVIEW_SRC).toContain("แปลงที่แจ้งวันหว่าน");
    expect(OVERVIEW_SRC).toContain("ภาพหลักฐาน 4 รอบ/ครอป");
    expect(OVERVIEW_SRC).toContain("ข้อมูลปัจจัยการผลิตครบ");
    expect(OVERVIEW_SRC).toContain("import { ProgressBar } from \"@/components/ui/progress-bar\"");
  });

  it("outcome Section: artifact title + 4 verbatim KPI labels in a repeat(4, 1fr) grid", () => {
    expect(OVERVIEW_SRC).toContain("ผลลัพธ์ร่วมของพื้นที่ที่ท่านสนับสนุน");
    expect(OVERVIEW_SRC).toContain("ลดมีเทนจากนาข้าว");
    expect(OVERVIEW_SRC).toContain("ลดการใช้น้ำ");
    expect(OVERVIEW_SRC).toContain("เชื้อเพลิงที่เพิ่มขึ้น");
    expect(OVERVIEW_SRC).toContain("ปริมาณปุ๋ย");
    expect(OVERVIEW_SRC).toContain("gridTemplateColumns: \"repeat(4, 1fr)\"");
  });

  it("live wiring preserved: all five endpoints + sidebar/header + LiveCalc (R-025/R-026)", () => {
    expect(OVERVIEW_SRC).toContain("/sponsor/summary");
    expect(OVERVIEW_SRC).toContain("/sponsor/farmers");
    expect(OVERVIEW_SRC).toContain("/sponsor/ghg-sources");
    expect(OVERVIEW_SRC).toContain("/sponsor/season-credits");
    expect(OVERVIEW_SRC).toContain("/sponsor/me");
    expect(OVERVIEW_SRC).toContain("<DashboardSidebar");
    expect(OVERVIEW_SRC).toContain("<DashboardHeader");
    expect(OVERVIEW_SRC).toContain("<LiveCalc");
    expect(OVERVIEW_SRC).toContain("ยังไม่มีข้อมูลคาร์บอนเครดิตในระบบ");
  });
});

describe("T-405 — SP-AREA /sponsor/areas (T-403)", () => {
  it("artifact PageTitle copy verbatim + PdpaNote", () => {
    expect(AREAS_SRC).toContain("eyebrow=\"พื้นที่ของท่าน\"");
    expect(AREAS_SRC).toContain("title=\"รายแปลงย่อยในพื้นที่ที่บริษัทของท่านสนับสนุน\"");
    expect(AREAS_SRC).toContain("sub=\"ระบุด้วย CPA code และรหัสแปลงย่อยเท่านั้น · ไม่มีชื่อ ไม่มีเลขโฉนด\"");
    expect(AREAS_SRC).toContain("<PdpaNotice />");
  });

  it("one pad={false} Section per province with the live stats sub", () => {
    expect(AREAS_SRC).toContain("pad={false}");
    expect(AREAS_SRC).toContain("<ProvinceSection key={group.province} group={group} />");
    expect(AREAS_SRC).toContain("แปลง · ");
    expect(AREAS_SRC).toContain("ไร่ · ER ");
    expect(AREAS_SRC).toContain(" tCO₂eq");
  });

  it("DataTable live-set columns: CPA code / แปลงย่อย / ไร่ / ภาพหลักฐาน / ER (tCO₂eq)", () => {
    expect(AREAS_SRC).toContain("header: \"CPA code\"");
    expect(AREAS_SRC).toContain("header: \"แปลงย่อย\"");
    expect(AREAS_SRC).toContain("header: \"ไร่\", align: \"right\"");
    expect(AREAS_SRC).toContain("header: \"ภาพหลักฐาน\"");
    expect(AREAS_SRC).toContain("header: \"ER (tCO₂eq)\", align: \"right\"");
    // cpa mono 12px semibold; plot mono 11.5px
    expect(AREAS_SRC).toContain("fontFamily: \"var(--font-mono, monospace)\"");
    expect(AREAS_SRC).toContain("fontSize: \"12px\"");
    expect(AREAS_SRC).toContain("fontSize: \"11.5px\"");
    // rai 2dp right; er 3dp right
    expect(AREAS_SRC).toContain("(p.area_rai ?? 0).toFixed(2)");
    expect(AREAS_SRC).toContain("(p.total_offset_tco2e ?? 0).toFixed(3)");
  });

  it("omitted columns (rice / sfw) are disclosed, not mocked (R-025/R-015)", () => {
    expect(AREAS_SRC).toContain("พันธุ์ข้าว");
    expect(AREAS_SRC).toContain("ตัวปรับการจัดการน้ำ");
    expect(AREAS_SRC).toContain("OMITTED (disclosed)");
  });

  it("photo pills: 4 rounds, 24x18px radius 3px, 9px/700, artifact phase inks + grey empties, Thai labels", () => {
    expect(AREAS_SRC).toContain("width: \"24px\"");
    expect(AREAS_SRC).toContain("height: \"18px\"");
    expect(AREAS_SRC).toContain("borderRadius: \"3px\"");
    expect(AREAS_SRC).toContain("fontSize: \"9px\"");
    expect(AREAS_SRC).toContain("fontWeight: \"var(--weight-bold)\"");
    expect(AREAS_SRC).toContain("var(--navy-600)");
    expect(AREAS_SRC).toContain("var(--teal-600)");
    expect(AREAS_SRC).toContain("var(--grey-200)");
    expect(AREAS_SRC).toContain("var(--grey-500)");
    expect(AREAS_SRC).toContain("เปียก");
    expect(AREAS_SRC).toContain("แห้ง");
    // live fill source: provenance counts capped at the 4 artifact rounds
    expect(AREAS_SRC).toContain("Math.min(4, machine + human)");
    // live water-state tallies kept as microcopy
    expect(AREAS_SRC).toContain("น้ำขัง:");
  });

  it("photo gallery Section: artifact copy + 4-col grid + gradient-simulated tiles (R-027, disclosed R-025)", () => {
    expect(AREAS_SRC).toContain("ภาพถ่ายแปลงจากพื้นที่ของท่าน");
    expect(AREAS_SRC).toContain("CU-02 · ผูกภาพถ่ายแปลงเข้ากับตัวเลขเครดิต · ภาพไม่ระบุตัวบุคคล");
    expect(AREAS_SRC).toContain("gridTemplateColumns: \"repeat(4, 1fr)\"");
    expect(AREAS_SRC).toContain("gap: \"var(--space-3)\"");
    expect(AREAS_SRC).toContain("aspectRatio: \"4 / 3\"");
    expect(AREAS_SRC).toContain("padding: \"7px 9px\"");
    expect(AREAS_SRC).toContain("borderRadius: \"var(--radius-sm)\"");
    expect(AREAS_SRC).toContain("data-deferred=\"R-027\"");
    expect(AREAS_SRC).toContain("รอบที่ 1 · เปียก");
    expect(AREAS_SRC).toContain("รอบที่ 2 · แห้ง");
    expect(AREAS_SRC).not.toMatch(/<img/);
  });

  it("live wiring preserved: fetchers + /sponsor/me + withCredentials + empty state (R-025)", () => {
    expect(AREAS_SRC).toContain("xhr.withCredentials = true;");
    expect(AREAS_SRC).toContain("/sponsor/me");
    expect(AREAS_SRC).toContain("fetchSponsorData()");
    expect(AREAS_SRC).toContain("ยังไม่มีแปลงเกษตรในพื้นที่ที่ท่านรับผิดชอบ");
  });
});

describe("T-405 — SP-REPORT /sponsor/reports (T-404)", () => {
  it("artifact PageTitle copy verbatim + PdpaNote (every sponsor screen)", () => {
    expect(REPORTS_SRC).toContain("eyebrow=\"รายงาน\"");
    expect(REPORTS_SRC).toContain("title=\"ไฟล์ที่บริษัทของท่านดาวน์โหลดได้\"");
    expect(REPORTS_SRC).toContain("sub=\"ขอบเขตจำกัดอยู่ที่พื้นที่ที่ท่านสนับสนุน · ทุกไฟล์ใช้ CPA code แทนชื่อ\"");
    expect(REPORTS_SRC).toContain("<PdpaNotice />");
  });

  it("available-reports DataTable: name+note, Tag tone=teal format, scope, right-aligned outline download Button", () => {
    expect(REPORTS_SRC).toContain("header: \"รายงาน\"");
    expect(REPORTS_SRC).toContain("header: \"รูปแบบ\"");
    expect(REPORTS_SRC).toContain("header: \"ขอบเขต\"");
    expect(REPORTS_SRC).toContain("header: \"\", align: \"right\"");
    expect(REPORTS_SRC).toMatch(/<Tag tone="teal">/);
    expect(REPORTS_SRC).toMatch(/<Button variant="outline" size="sm" onClick=\{handleDownload\}>/);
    expect(REPORTS_SRC).toContain("ดาวน์โหลด");
    // live report truth: EX-2042 + artifact name verbatim
    expect(REPORTS_SRC).toContain("EX-2042");
    expect(REPORTS_SRC).toContain("สรุปเครดิตประมาณการรายฤดู");
    expect(REPORTS_SRC).toContain("รายพื้นที่ · รายฤดู");
  });

  it("issued-certificates DataTable: id, season, tCO₂eq right, status Badge, issued date", () => {
    expect(REPORTS_SRC).toContain("header: \"เลขที่ใบรับรอง\"");
    expect(REPORTS_SRC).toContain("header: \"ฤดู\"");
    expect(REPORTS_SRC).toContain("header: \"tCO₂eq\", align: \"right\"");
    expect(REPORTS_SRC).toContain("header: \"สถานะ\"");
    expect(REPORTS_SRC).toContain("header: \"วันที่ออก\"");
    expect(REPORTS_SRC).toMatch(/<Badge tone=\{certBadgeTone\(cert.status\)\}>/);
    expect(REPORTS_SRC).toContain("CERT_STATUS[cert.status]?.label ?? cert.status");
  });

  it("live wiring preserved: /sponsor/certificates + /sponsor/me + EX-2042 download + empty state (R-025)", () => {
    expect(REPORTS_SRC).toContain("/sponsor/certificates");
    expect(REPORTS_SRC).toContain("/sponsor/me");
    expect(REPORTS_SRC).toContain("/sponsor/reports/EX-2042/download");
    expect(REPORTS_SRC).toContain("validateApiUrl");
    expect(REPORTS_SRC).toContain("ยังไม่มีใบรับรอง");
    expect(REPORTS_SRC).toContain("ใบรับรอง TVER จะปรากฏเมื่อคาร์บอนเครดิตได้รับการตรวจสอบและออกใบรับรองแล้ว");
  });
});
