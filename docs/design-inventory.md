# Design Source Inventory — Issue #142

Part of [#141](https://github.com/netzerocarbon/app/issues/141) · Source-only task, no implementation changes.

> **Complete artifact map:** See [`claude-design-artifact-map.md`](./claude-design-artifact-map.md) for the labeled page/component mapping across all extracted HTML bundles. This inventory describes the source graph; the map describes how to use it as a reference.

**Commit baseline:** `3f61136`
**Date:** 2026-09-15

---

## 1. Source Provenance

### Claude Design Artifacts

| Surface | Artifact ID | URL | Extracted tree |
|---------|------------|-----|----------------|
| LINE OA | `19c446b9-e2f5-4e09-a118-fca56ec0c0c8` | [claude.ai/code/artifact/19c446b9…](https://claude.ai/code/artifact/19c446b9-e2f5-4e09-a118-fca56ec0c0c8) | `visual-qa-screenshots/line-oa-extracted/` |
| Admin Console | `161f2305-35de-42f8-83ed-7c90ab4da5a6` | [claude.ai/code/artifact/161f2305…](https://claude.ai/code/artifact/161f2305-35de-42f8-83ed-7c90ab4da5a6) | `visual-qa-screenshots/admin-extracted/` |
| Sponsor Dashboard | `0de23b7a-9fb3-433e-8930-7eff56a39e45` | [claude.ai/code/artifact/0de23b7a…](https://claude.ai/code/artifact/0de23b7a-9fb3-433e-8930-7eff56a39e45) | `visual-qa-screenshots/sponsor-extracted/` |

### File Manifest (app-specific JS only)

Shared bundles (identical across all three trees, excluded from this manifest):
- Babel standalone (~3.1 MB)
- React 18.3.1 dev (~1.1 MB)
- NetZeroCarbon Design System (`window.NetZeroCarbonDesignSystem_f3e7a8`, ~408 KB)
- Third-party library bundle (~356 KB)
- Design system components (~110 KB)

#### Admin Console (`admin-extracted/`)

| File | Size | Content |
|------|------|---------|
| `9482f706-…9810.js` | 13 KB | **LoginScreen** + **ConsoleShell** + **PageTitle** + **Section** + **PdpaNote** + **CreditChart** |
| `1e8c88ce-…90d2.js` | 20 KB | **OverviewScreen** (AD-08/AD-17) + **ReviewScreen** (AD-01/AD-02/AD-04) |
| `8c07477b-…472b.js` | 29 KB | **FarmersScreen** (AD-15/AD-18) + **CalcTrace** + **ReportsScreen** (AD-07) + **SponsorsScreen** (F-65) |
| `f24453af-…4985.js` | 19 KB | **ApplicationsScreen** (AD-10) + **ImportScreen** (AD-13/LF-07) + **MapScreen** (AD-16) + **ChatModeScreen** (AD-12) |
| `20301eef-…3c60.js` | 16 KB | **SettingsScreen** (5 tabs: roles, accounts, constants, notifications, general) |
| `80e8634d-…1e25.js` | 33 KB | **ChartsScreen** + chart components: Gauge, Donut, Bubbles, Treemap, BarSeries |
| `7fa43fba-…fc3.js` | 12 KB | CPA code identifiers, data constants (FARMERS, PLOTS, PROVINCES, GHG_2569, etc.) |
| `3ee05776-…bf3.js` | 10 KB | AWD credit calculation engine (`computePlotSeason`, methodology constants) |

#### Sponsor Portal (`sponsor-extracted/`)

| File | Size | Content |
|------|------|---------|
| `a350f295-…38da.js` | 13 KB | **LoginScreen** (identical to admin, role="sponsor") |
| `7ccc65fc-…35bb.js` | 18 KB | **SponsorOverview** + **SponsorAreas** + **SponsorReports** |
| `b836f80d-…30b.js` | 12 KB | CPA code identifiers (sponsor-scoped) |
| `97820dda-…d03c.js` | 10 KB | AWD credit calculation engine |

#### LINE OA (`line-oa-extracted/`)

| File | Size | Content |
|------|------|---------|
| `5a25b866-…28.js` | 20 KB | **SCRIPT** (10 scenes, 43 steps) + **CHAPTERS** + **RICH_MENU** |
| `30fbaadd-…1677.js` | 40 KB | **LiffShell** + **Panel** + 8 LIFF pages: LiffRegister, LiffDocs, LiffCamera, LiffCalendar, LiffSummary, LiffFields, LiffContact, LiffBaseline |

### Font Inventory

59 WOFF2 font files (`.bin` extension, UUID filenames) per tree. All identical across trees.
- **Fira Sans** — weights 300/400/500/600/700 + italic 400
- **Fira Mono** — weights 400/500
- **Noto Sans Thai** — weights 300/400/500/700

### Missing Assets

No image files in any extraction. Referenced externally:
- `../../assets/logos/NZC-Mark-Full.png` — NZC logo mark
- `../../assets/imagery/renewables-wind-farm.png` — login background

### Design Reference PNGs

| File | Size | Note |
|------|------|------|
| `design-admin-full.png` | 356 KB | Historical capture — repeated Claude wrapper frames, not pixel-accurate |
| `design-sponsor-full.png` | 358 KB | Same caveat |
| `design-line-oa-full.png` | 219 KB | Same caveat |

---

## 2. Design Token Extraction

### 2.1 Color Palette (Source)

#### Teal Scale (Primary Brand)

| Token | Value | Usage |
|-------|-------|-------|
| `--teal-50` | `#E7FCF7` | Surface accent soft, selected row bg |
| `--teal-100` | `#C6F9EE` | — |
| `--teal-200` | `#8FF3DE` | Approved photo border |
| `--teal-300` | `#52ECCA` | Eyebrow text on dark, gradient mark start |
| `--teal-400` | `#24C4B2` | Chart accent |
| `--teal-500` | `#0AA8A3` | Status success, sidebar count badge, focus ring |
| `--teal-600` | `#028E91` | **Action primary**, accent text, active tab border |
| `--teal-700` | `#027276` | Primary hover, heading on dark, gradient deep end |
| `--teal-800` | `#01565F` | Primary active, result text on accent bg |
| `--teal-900` | `#013B45` | — |
| `--teal-950` | `#012730` | — |

#### Navy Scale (Secondary/Heading)

| Token | Value | Usage |
|-------|-------|-------|
| `--navy-50` | `#EEF2FB` | Status info soft, bot message bg |
| `--navy-100` | `#D6E0F4` | PdpaNote border |
| `--navy-200` | `#AEC2E8` | — |
| `--navy-300` | `#7C9AD8` | — |
| `--navy-400` | `#5279CB` | — |
| `--navy-500` | `#2C5EB8` | — |
| `--navy-600` | `#1C489F` | Status info, wet-round photo badge |
| `--navy-700` | `#123787` | — |
| `--navy-800` | `#0B2A72` | Gradient deep mid, PdpaNote text |
| `--navy-900` | `#061E5C` | **Heading text, surface inverse, sidebar bg**, gradient deep start |
| `--navy-950` | `#030E2E` | — |

#### Grey Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--grey-50` | `#F2F2F2` | Surface sunken, page bg |
| `--grey-100` | `#EDEFF3` | Table row border, placeholder bg |
| `--grey-200` | `#DDE1E8` | Border subtle, chart baseline bar |
| `--grey-300` | `#C2C8D2` | Border default |
| `--grey-400` | `#9AA3B2` | Border strong |
| `--grey-500` | `#737E91` | Text subtle |
| `--grey-600` | `#566277` | **Text muted** |
| `--grey-700` | `#3C4A5C` | — |
| `--grey-800` | `#273343` | **Text body** |
| `--grey-900` | `#1B2330` | — |
| `--grey-950` | `#141414` | NZC black |

#### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--status-success` | `#0AA8A3` | Approved badges, positive delta |
| `--status-success-soft` | `var(--teal-50)` | — |
| `--status-warning` | `#E2A33C` | Pending, incomplete |
| `--status-warning-soft` | `#FCF2E0` | Warning card bg |
| `--status-danger` | `#C8464F` | Rejected, fallback |
| `--status-danger-soft` | `#FBECEC` | Danger card bg, rejection panel |
| `--status-info` | `var(--navy-600)` | — |
| `--status-info-soft` | `var(--navy-50)` | PdpaNote bg |

#### Semantic Tokens

| Token | Value |
|-------|-------|
| `--text-heading` | `var(--navy-900)` = `#061E5C` |
| `--text-body` | `var(--grey-800)` = `#273343` |
| `--text-muted` | `var(--grey-600)` = `#566277` |
| `--text-subtle` | `var(--grey-500)` = `#737E91` |
| `--text-accent` | `var(--teal-600)` = `#028E91` |
| `--surface-page` | `var(--white)` |
| `--surface-sunken` | `var(--grey-50)` = `#F2F2F2` |
| `--surface-card` | `var(--white)` |
| `--surface-inverse` | `var(--navy-900)` = `#061E5C` |
| `--surface-accent-soft` | `var(--teal-50)` |
| `--border-subtle` | `var(--grey-200)` |
| `--border-default` | `var(--grey-300)` |
| `--border-accent` | `var(--teal-600)` |
| `--action-primary` | `var(--teal-600)` |
| `--action-primary-hover` | `var(--teal-700)` |

#### LINE OA Specific

| Token | Value | Usage |
|-------|-------|-------|
| `--line-green` | `#06C755` | LINE brand |
| `--line-green-dark` | `#04A344` | — |
| `--line-bubble-me` | `#A9E86B` | Farmer message bubble |
| `--line-bubble-you` | `#FFFFFF` | Bot message bubble |
| `--line-chat-bg` | `#8FAAD0` | Chat background |

#### Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-deep` | `linear-gradient(150deg, #061E5C 0%, #0B2A72 45%, #027276 100%)` | Sidebar, login panel, hero cards, LIFF headers |
| `--gradient-mark` | `linear-gradient(135deg, #52ECCA 0%, #02A99E 42%, #028E91 62%, #061E5C 100%)` | Logo/brand |
| `--gradient-rule` | `linear-gradient(90deg, #52ECCA 0%, #028E91 55%, #061E5C 100%)` | Decorative divider |
| `--gradient-protect` | `linear-gradient(180deg, rgba(6,30,92,0) 0%, rgba(6,30,92,.82) 100%)` | Image overlay |

### 2.2 Typography (Source)

| Token | Value | Current (`globals.css`) |
|-------|-------|------------------------|
| `--font-sans` | `"Fira Sans", "Noto Sans Thai", -apple-system, …` | `"Plus Jakarta Sans", Sarabun, …` |
| `--font-thai` | `"Noto Sans Thai", "Fira Sans", sans-serif` | (Sarabun via font-sans) |
| `--font-mono` | `"Fira Mono", ui-monospace, …` | (not defined) |
| `--text-xs` | 12px | — |
| `--text-sm` | 14px | `--text-label-md: 14px` |
| `--text-base` | 16px | `--text-body-md: 16px` |
| `--text-md` | 18px | `--text-body-lg: 18px` |
| `--text-lg` | 20px | — |
| `--text-xl` | 24px | `--text-headline-md: 24px` |
| `--text-2xl` | 30px | — |
| `--text-3xl` | 38px | — |
| `--text-4xl` | 48px | `--text-display-lg: 48px` |
| `--text-5xl` | 60px | — |
| `--text-6xl` | 76px | — |

**Weights:** light 300, regular 400, medium 500, semibold 600, bold 700

**Line heights:** tight 1.08, snug 1.2, heading 1.28, normal 1.55, relaxed 1.7

**Letter spacing:** display −0.02em, heading −0.01em, normal 0em, eyebrow 0.14em

### 2.3 Spacing and Layout (Source)

| Token | Value |
|-------|-------|
| `--space-1` through `--space-32` | 4px through 128px (full: 1,2,3,4,5,6,8,10,12,16,20,24) |
| `--gutter` | 24px |
| `--container-max` | 1200px |
| `--container-narrow` | 760px |
| `--card-padding` | `var(--space-6)` = 24px |
| `--control-height-sm` | 36px |
| `--control-height-md` | 46px |
| `--control-height-lg` | 54px |
| `--field-height` | 46px |

### 2.4 Border Radius (Source)

| Token | Value | Current |
|-------|-------|---------|
| `--radius-xs` | 4px | — |
| `--radius-sm` | 8px | `0.25rem` (4px) |
| `--radius-md` | 12px | `0.75rem` (12px) ✓ |
| `--radius-lg` | 16px | `1rem` (16px) ✓ |
| `--radius-xl` | 24px | `1.5rem` (24px) ✓ |
| `--radius-card` | `var(--radius-lg)` = 16px | — |
| `--radius-pill` | 999px | `9999px` |
| `--radius-circle` | 50% | — |

### 2.5 Shadows (Source)

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(6,30,92,.06)` |
| `--shadow-sm` | `0 2px 6px rgba(6,30,92,.07)` |
| `--shadow-md` | `0 8px 24px rgba(6,30,92,.09)` |
| `--shadow-lg` | `0 18px 44px rgba(6,30,92,.12)` |
| `--shadow-xl` | `0 32px 72px rgba(6,30,92,.16)` |
| `--shadow-accent` | `0 12px 28px rgba(2,142,145,.24)` |

**Current shadows:** neumorphic, neumorphic-inset, claymorphic, glassmorphic — all different from source.

### 2.6 Transitions (Source)

| Token | Value |
|-------|-------|
| `--duration-instant` | 80ms |
| `--duration-fast` | 140ms |
| `--duration-base` | 220ms |
| `--duration-slow` | 420ms |
| `--duration-reveal` | 700ms |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` |

---

## 3. Screen/State Inventory — Admin Console

### 3.1 LoginScreen (`9482f706`)

**Req IDs:** AD-AUTH-01, AD-AUTH-02, AD-AUTH-03, SP-AUTH-01

**Layout:** Split grid `1.05fr / 0.95fr`
- **Left panel:** `--gradient-deep` bg, wind farm image at 18% opacity, Logo (white, 36px), eyebrow "Admin Console" or "Sponsor Portal" (teal-300, uppercase, tracked), h1 (text-4xl, weight-light, white), GradientRule 120px, description paragraph (text-md, white 82%), methodology footer (text-xs, white 55%)
- **Right panel:** Centered form (max-width 392px), h2 "เข้าสู่ระบบ" (text-2xl, weight-light), subtitle, 3 Fields (email, password, OTP with hint), Checkbox "จำอุปกรณ์นี้ 30 วัน", forgot-password link, Button "เข้าสู่ระบบ" (size lg, fullWidth, iconRight arrow), audit log notice (shield-check icon)

**States:** admin role, sponsor role (different copy)

**Thai copy highlights:**
- Admin: "โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน"
- Sponsor: "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"
- "ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด"

### 3.2 ConsoleShell (`9482f706`)

**Layout:** Grid `232px / minmax(0,1fr)`, min-height 100vh
- **Sidebar:** `--surface-inverse` (navy-900), sticky, 100vh, Logo (white, 28px), nav items (Icon 16px + label 13px semibold, active: white 12% bg + white text, inactive: white 72%), count badges (teal-500 bg, pill), dividers (10px uppercase tracked), user chip at bottom (32px circle, teal-600 bg, initials, name 12px, role 10.5px, logout icon)
- **Main:** padding `space-8` top, `space-10` sides, `space-16` bottom

**Admin nav items:** ภาพรวมโครงการ, ตรวจสอบใบสมัคร, คิวตรวจภาพ, เกษตรกร, ผู้สนับสนุน, รายงาน, ตั้งค่า
**Sponsor nav items:** พื้นที่และเครดิต, รายแปลงย่อย, รายงาน

### 3.3 OverviewScreen (`1e8c88ce`)

**Req IDs:** AD-OV-01 through AD-OV-06

**Components:**
- PageTitle: eyebrow "ภาพรวมโครงการ", h1 "โครงการทำนาลดโลกร้อน — ทุกพื้นที่", sub with provinces and methodology
- Actions: "กราฟสรุปเครดิต" (outline), "ส่งออกรายงาน" (outline), "คิวตรวจภาพ" (primary)
- FilterBar
- 4-column StatTile grid: ครัวเรือนที่เข้าร่วม, แปลงย่อยที่ดำเนินการ, พื้นที่รวม (ไร่), เครดิตสุทธิปี 2569 (ER tCO₂eq)
- Section "คิวงานที่ต้องดำเนินการ" — 4 task queue cards (ใบสมัครรอตรวจ AD-10, ภาพหลักฐานรอตรวจ, แปลงที่หลักฐานยังไม่ครบ, แปลงที่ถอยไปใช้ SF_w=0.71)
- 2-column: CreditChart (seasons, baseline/estimate/verified bars) + GHG breakdown DataTable (แหล่งการปล่อย, BE, PE, ส่วนต่าง, สมการ)
- Province/sponsor DataTable

**States:** populated (fixture data), filtered

### 3.4 ReviewScreen (`1e8c88ce`)

**Req IDs:** AD-01, AD-02, AD-04, AD-REV-01 through AD-REV-03

**Layout:** 2-column `minmax(0,1fr) / 420px`
- **Left top:** DataTable "ภาพรอตรวจ N รายการ" — columns: รหัสภาพ, CPA code, แปลงย่อย, รอบ (Tag navy/teal), ระดับน้ำที่กรอก, พิกัด (Badge success/danger), อายุคำร้อง, ผล (Badge)
- **Left bottom:** DataTable "ความครบถ้วนของหลักฐานรายแปลง" — columns: แปลงย่อย, ไร่, รอบภาพ (4 colored cells), SF_w ที่ใช้จริง (mono), fallback Badge, ER
- **Right:** Photo detail panel — simulated PVC tube image (gradient bg), GPS/timestamp overlay, Badge wet/dry, metadata table (7 rows: camera, GPS, WKT bounds, time, water level, consistency, deadline), approve/reject actions, rejection form with Checkbox reasons + Textarea message

**States:** populated, rejecting (form expanded), decided (approved/rejected badge)

### 3.5 ApplicationsScreen (`f24453af`)

**Req IDs:** AD-10, AD-APP-01 through AD-APP-05

**Layout:** 2-column `minmax(0,1fr) / 400px`
- **Left:** DataTable "ใบสมัคร" — columns: เลขที่ใบสมัคร, CPA code, ชื่อ-นามสกุล, ตำบล, สถานะการถือครอง (Tag), ไร่, เอกสาร (x/y), ค้าง, สถานะ (Badge)
- **Right:** Detail panel — metadata table (5 rows), document checklist grid (6 doc types, 2-column), message Textarea, action buttons

**States:** populated (4 sample applications), selected row, docs complete/incomplete

### 3.6 ImportScreen (`f24453af`)

**Req IDs:** AD-13, LF-07

**States:** pick (file upload zone), review (dry-run results table with 5 sample rows, 4 StatTiles, import options)

### 3.7 MapScreen (`f24453af`)

**Req IDs:** AD-16

**Layout:** 2-column `minmax(0,1fr) / 360px`
- **Left:** Simulated plot map (gradient bg, grid lines, 10 plot rectangles, legend overlay, UTM note)
- **Right:** Selected plot detail (CPA code, deed, area, rice variety, photos, SF_w, ER, WKT string)

**States:** 10 plots displayed, one selected

### 3.8 ChatModeScreen (`f24453af`)

**Req IDs:** AD-12

**Layout:** 2-column `300px / minmax(0,1fr)`
- **Left:** Chat thread list (3 threads, CPA code, last message, time, unread badge, status badge)
- **Right:** Chat conversation (farmer/bot/staff messages with different bubble styles), input + send button

**States:** bot-answering, staff-taking-over

### 3.9 FarmersScreen (`8c07477b`)

**Req IDs:** AD-15, AD-18, AD-FAR-01 through AD-FAR-05

**Layout:** Full-width DataTable + fixed-position detail drawer (760px, slides from right)
- **Table:** CPA code (mono), ชื่อ-นามสกุล, พื้นที่, ผู้สนับสนุน (Tag navy), แปลงย่อย, ไร่, ภาพหลักฐาน, BE, PE, ER, สถานะ (Badge)
- **Drawer:** gradient-deep header (CPA code, name, province, sponsor, 4 stat values), 5 tabs (แปลงและเอกสาร, การคำนวณเครดิต, ที่มาของไนโตรเจน, ภาพหลักฐาน, ประวัติการแก้ไข)

**Tab contents:**
1. แปลงและเอกสาร: subplot DataTable + document grid (8 items)
2. การคำนวณเครดิต: CalcTrace (side-by-side BL/PJ calculation steps, ER result)
3. ที่มาของไนโตรเจน: nitrogen source DataTable (AD-18, F-71)
4. ภาพหลักฐาน: 4-round photo grid (WET-1, DRY-1, WET-2, DRY-2)
5. ประวัติการแก้ไข: audit log DataTable (AD-11)

### 3.10 ChartsScreen (`80e8634d`)

**Req IDs:** AD-CHART-01, AD-CHART-02

**Components:** Gauge (SVG arc), Donut (SVG), Bubbles (SVG scatter), Treemap, BarSeries, CreditChart, DataTable (full GHG summary)
**Layout:** 3-column hero grid, 2-column charts, 3-column secondary

### 3.11 ReportsScreen (`8c07477b`)

**Req IDs:** AD-07

**Layout:** 2-column `minmax(0,1fr) / 380px`
- **Left:** Export list DataTable (report name, format Tag, scope, who)
- **Right:** T-VER registration progress (3 ProgressBars), warning notice, download buttons; selected report detail

### 3.12 SponsorsScreen (`8c07477b`)

**Req IDs:** F-65

**Layout:** Per-sponsor Sections with 2-column grid (area checkboxes, visibility level checkboxes)

### 3.13 SettingsScreen (`20301eef`)

**Req IDs:** AD-11 (audit), roles/permissions

**5 tabs:**
1. สิทธิ์การเข้าถึง: 5 role cards + permission matrix table (15 rows × 5 roles)
2. บัญชีผู้ใช้: user DataTable (7 sample users)
3. ค่าคงที่การคำนวณ: constants DataTable (Group A) + SF_w lookup table (Group B)
4. การแจ้งเตือน: 6 notification toggles
5. ทั่วไป: project info fields + privacy fields

---

## 4. Screen/State Inventory — Sponsor Portal

### 4.1 LoginScreen (`a350f295`)

Identical to admin LoginScreen with `role="sponsor"`. Different copy:
- Eyebrow: "Sponsor Portal"
- h1: "พื้นที่และเครดิตที่บริษัทท่านสนับสนุน"
- Description: "ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน ตามสิทธิ์ที่แอดมินตั้งค่าไว้"
- Default email: `esg@company-a.example`

### 4.2 SponsorOverview (`7ccc65fc`)

**Req IDs:** SP-OV-01 through SP-OV-10, SP-BR-01 through SP-BR-05

**Layout:**
- PageTitle: eyebrow "Sponsor Portal", title "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"
- FilterBar
- PdpaNote (full PDPA explanation)
- 3-column hero: gradient-deep card (verified credits large number, Badge, GradientRule, estimate caveat) + 2 StatTiles (พื้นที่ที่สนับสนุน, ครัวเรือนที่ได้รับประโยชน์)
- 2-column: CreditChart (no baseline) + GHG source DataTable + ProgressBars
- 4-column "ผลลัพธ์ร่วม" stats (methane reduction, water savings, fuel increase, fertilizer parity)

### 4.3 SponsorAreas (`7ccc65fc`)

**Req IDs:** SP-OV-04 (detail)

- Per-province Sections with DataTable (CPA code, แปลงย่อย, ไร่, พันธุ์ข้าว, ภาพหลักฐาน 4-cell, ตัวปรับน้ำ, ER)
- Photo grid (4 rounds, non-identifying)

### 4.4 SponsorReports (`7ccc65fc`)

- Report download DataTable (filtered to sponsor-allowed exports)
- Certificate DataTable (3 sample certificates)

---

## 5. Screen/State Inventory — LINE OA

### 5.1 Chat Script (`5a25b866`)

**10 scenes, 43 steps:**

| Scene | Nodes | Content | Req IDs |
|-------|-------|---------|---------|
| 1 | OB-01, OB-15 | Friend add + PDPA consent | LO-OB-01, LO-OB-02 |
| 2 | OB-02, OB-03 | Phone share + identity confirm | LO-OB-03, LO-OB-04 |
| 3 | OB-05 | 3 conditions (CS-02/03/04) | LO-OB-05 |
| 4 | OB-12, LF-01 | Registration form | LO-OB-06 |
| 5 | OB-13, OB-10, OB-11 | Documents + pending + activation | LO-OB-07, LO-OB-08, LO-OB-09 |
| 7 | PJ-00, PJ-13 | Season opening + 9-step calendar | LO-PJ-00, LO-PJ-01 |
| 8 | PJ-02 to PJ-08 | Photo evidence WET-1, DRY-1 | LO-PH-01 to LO-PH-06 |
| 9 | SY-03, PJ-09 | Rejected photo + chat rejection | LO-PH-07, LO-PH-08 |
| 10 | RP-01, RP-03 | Pending tasks + results | LO-RP-01, LO-RP-02 |

**Message types:** `divider`, `flex` (with heroTone: teal/navy/amber/grey, heroBadge, rows, actions), `oa` (bot text with quick replies), `me` (user messages), `photo` (with GPS coordinates)

**Chapters (left sidebar):**
- `ob`: "สมัครและผูกบัญชี" (OB-01 to OB-11)
- `pj`: "รายงานระหว่างฤดู" (PJ-00 to PJ-13)
- `rp`: "ดูผล / งานค้าง" (RP-01 to RP-04)

### 5.2 Rich Menu

**Req IDs:** LO-MENU-01 through LO-MENU-06

| Glyph | Label | Action | Type |
|-------|-------|--------|------|
| 📋 | กรอกข้อมูลย้อนหลัง | `BL_HOME` | Chat action |
| 📷 | บันทึกงานในแปลง | `SEASON_HOME` | Chat action |
| 🔔 | งานที่ต้องทำ | `TODO` | Chat action |
| 🌾 | แปลงของฉัน | `FIELD_LIST` | LIFF |
| 📊 | สรุปผลของฉัน | `SUMMARY` | LIFF |
| ☎️ | ติดต่อเจ้าหน้าที่ | `CONTACT` | LIFF |

### 5.3 LIFF Pages (`30fbaadd`)

**Req IDs:** LO-LIFF-01 through LO-LIFF-07

| Component | Destination | Req ID | Content |
|-----------|------------|--------|---------|
| LiffShell | (shared) | — | Gradient-deep header bar, NZC logo, title/subtitle, close button, scrollable content, optional footer |
| LiffRegister | `register` | LO-LIFF-01 | 2-step form: person data (R-01 to R-06) + plot/deed data (R-07 to R-14), progress bar |
| LiffDocs | `docs` | LO-LIFF-02 | Document upload (DOC-01, DOC-03, DOC-06), progress counter |
| LiffCamera | `camera` | LO-LIFF-03 | Forced camera with PVC tube overlay, GPS/timestamp capture, water level selector (0/5/10/15/>15/manual) |
| LiffCalendar | `calendar` | LO-LIFF-04 | 9-step calendar (SG-01 to SG-09), progress bar, photo round tracker |
| LiffSummary | `summary` | LO-LIFF-05 | 3-tab dashboard (ผล/เครดิต/ภาพ), gradient hero card, ProgressBars, credit breakdown |
| LiffFields | `fields` | LO-LIFF-06 | Plot list (3 sample plots), badges, select action |
| LiffContact | `contact` | LO-LIFF-07 | Coordinator card, video placeholder, offline-mode notice |
| LiffBaseline | `baseline` | (BL-01 to BL-15) | 8-set accordion form, 6-season progress, shortcut option |

### 5.4 Flex Message Design

**Req IDs:** LO-06 (message requirements)

**heroTone variants:** teal, navy, amber, grey
**Structure:** hero section with badge, title, optional subtitle, key/value rows (with optional good/warning tone), primary + secondary actions, optional LIFF deep-links

---

## 6. Requirement ID Cross-Reference

### LINE OA

| Req ID | Source file(s) | Screen/Component |
|--------|---------------|-----------------|
| LO-OB-01 to LO-OB-09 | `5a25b866` | Script scenes 1-5 |
| LO-PJ-00 to LO-PJ-03 | `5a25b866`, `30fbaadd` | Scene 7, LiffCalendar |
| LO-PH-01 to LO-PH-08 | `5a25b866`, `30fbaadd` | Scenes 8-9, LiffCamera |
| LO-RP-01 to LO-RP-03 | `5a25b866`, `30fbaadd` | Scene 10, LiffSummary, LiffFields |
| LO-MENU-01 to LO-MENU-06 | `5a25b866` | RICH_MENU |
| LO-LIFF-01 to LO-LIFF-07 | `30fbaadd` | 8 LIFF page components |
| LO-BR-01 to LO-BR-08 | `5a25b866`, `3ee05776` | Business rules in script + calc engine |

### Admin Console

| Req ID | Source file(s) | Screen/Component |
|--------|---------------|-----------------|
| AD-AUTH-01 to AD-AUTH-03 | `9482f706` | LoginScreen |
| AD-OV-01 to AD-OV-06 | `1e8c88ce` | OverviewScreen |
| AD-FAR-01 to AD-FAR-05 | `8c07477b` | FarmersScreen |
| AD-APP-01 to AD-APP-05 | `f24453af` | ApplicationsScreen |
| AD-REV-01 to AD-REV-03 | `1e8c88ce` | ReviewScreen |
| AD-CHART-01 to AD-CHART-02 | `80e8634d` | ChartsScreen |
| AD-CALC-01 to AD-CALC-02 | `3ee05776`, `8c07477b` | CalcTrace, calc engine |
| AD-07 | `8c07477b` | ReportsScreen |
| AD-10 | `f24453af` | ApplicationsScreen |
| AD-11 | `20301eef` | SettingsScreen (audit log tab) |
| AD-12 | `f24453af` | ChatModeScreen |
| AD-13 | `f24453af` | ImportScreen |
| AD-15, AD-18 | `8c07477b` | FarmersScreen (drawer tabs) |
| AD-16 | `f24453af` | MapScreen |
| F-65 | `8c07477b` | SponsorsScreen |
| F-34 | `9482f706` | LoginScreen |

### Sponsor Dashboard

| Req ID | Source file(s) | Screen/Component |
|--------|---------------|-----------------|
| SP-AUTH-01, SP-AUTH-02 | `a350f295` | LoginScreen (role="sponsor") |
| SP-OV-01 to SP-OV-10 | `7ccc65fc` | SponsorOverview, SponsorAreas, SponsorReports |
| SP-BR-01 to SP-BR-05 | `7ccc65fc` | PdpaNote, filtered data in all sponsor screens |

---

## 7. Current Route/Component Mapping

| Source Screen | Current Route | Current Component | Status |
|--------------|--------------|-------------------|--------|
| LoginScreen (admin) | `/admin/login` | `admin/login/page.tsx` | **Partial** — centered card, no split layout, no OTP, no remember-device |
| LoginScreen (sponsor) | `/admin/login` | `admin/login/page.tsx` | **Partial** — shared route, dev bypass buttons |
| ConsoleShell (admin) | `/admin` layout | `components/dashboard/dashboard-sidebar.tsx`, `dashboard-header.tsx` | **Partial** — exists but wrong colors (dark green vs navy-900), wrong width (288px vs 232px) |
| OverviewScreen | `/admin` | `admin/page.tsx` | **Exists** — has stat tiles, work queue, credit chart, GHG table |
| ReviewScreen | `/admin/applications` | `admin/applications/page.tsx` + `admin-review/` components | **Exists** — filter tabs, review cards, detail panel |
| ApplicationsScreen | — | — | **Missing** — no separate application review page |
| ImportScreen | — | — | **Missing** |
| MapScreen | — | — | **Missing** |
| ChatModeScreen | — | — | **Missing** |
| FarmersScreen | `/admin/farmers` | `admin/farmers/page.tsx` | **Partial** — basic table, no detail drawer with 5 tabs |
| ChartsScreen | — | — | **Missing** — no dedicated charts page |
| ReportsScreen | `/admin/reports` | `admin/reports/page.tsx` | **Partial** — basic, no T-VER progress bars |
| SponsorsScreen | `/admin/sponsors` | `admin/sponsors/page.tsx` | **Partial** — basic, no permission matrix |
| SettingsScreen | `/admin/settings` | `admin/settings/page.tsx` | **Partial** — basic, no 5-tab structure |
| SponsorOverview | `/sponsor` | `sponsor/page.tsx` | **Exists** — has KPIs, province groups, GHG table, live calc |
| SponsorAreas | `/sponsor/areas` | `sponsor/areas/page.tsx` | **Partial** — exists, needs PDPA note refinement |
| SponsorReports | `/sponsor/reports` | `sponsor/reports/page.tsx` | **Partial** — exists, needs certificate table |
| LINE Script (10 scenes) | `/chat` (demo) | `chat/page.tsx` | **Partial** — web demo only, real LINE is separate |
| Rich Menu | LINE backend | `src/line/rich-menu.ts` | **Exists** — needs label verification |
| LiffRegister | `/register` (LIFF) | — | **Partial** — LIFF route exists |
| LiffCamera | `/camera` (LIFF) | — | **Exists** — deployed |
| LiffCalendar | `/calendar` (LIFF) | — | **Exists** |
| LiffSummary | `/summary` (LIFF) | `summary/page.tsx` | **Exists** |
| LiffFields | — | — | **Missing** |
| LiffContact | — | — | **Missing** |
| LiffBaseline | — | — | **Missing** |
| LiffDocs | `/docs` (LIFF) | — | **Partial** |

---

## 8. Reusable Asset List

### Design System Components (`window.NetZeroCarbonDesignSystem_f3e7a8`)

Logo, Button, Badge, Tag, Icon, StatTile, FilterBar, DataTable, ProgressBar, GradientRule, Field, Input, Select, Textarea, Checkbox, IconButton

### Chart Components (admin `80e8634d`)

Gauge (SVG arc), Donut (SVG), Bubbles (SVG scatter), Treemap, BarSeries, CreditChart

### Shared Components (admin `9482f706`)

ConsoleShell, PageTitle, Section, PdpaNote, CreditChart

### Calculation Engine (`3ee05776`)

Full AWD carbon credit calculation implementing T-VER-P-METH-13-08:
- Constants: `EF_BL_c: 0.1952`, `CF: 0.89`, `U_d: 0.15`, `GWP_CH4: 28`, `GWP_N2O: 265`
- Lookup tables: `SF_P`, `SF_W` (WW-1=1.00, WW-2=0.71, WW-3=0.55), `CFOA`
- Functions: `computePlotSeason()`, `sfOrganic()`, `efCh4()`, `ch4Soil()`, `co2Lime()`, `co2Urea()`, `n2oSoil()`, `co2Fuel()`, `nonCo2Burn()`, `resolveSfW()`, `seasonSide()`

### Thai Copy

All UI text is in Thai. Key terms:
- โครงการทำนาลดโลกร้อน (NetZero Carbon Rice Farming Project)
- เครดิตสุทธิ (Net credits), tCO₂eq
- แปลงย่อย (Sub-plot), CPA code
- ภาพหลักฐาน (Evidence photo), รอบเปียก/แห้ง (Wet/dry round)
- ระเบียบวิธี T-VER-P-METH-13-08

---

## 9. Conflicts and Unknowns

### Token Mismatches

| Aspect | Source | Current (`globals.css`) | Resolution needed |
|--------|--------|------------------------|-------------------|
| **Font family** | Fira Sans + Noto Sans Thai | Plus Jakarta Sans + Sarabun | Decide: switch to source fonts or keep current |
| **Sidebar bg** | `--navy-900` (#061E5C) | `#0d1f17` (dark green) | Change to navy-900 |
| **Sidebar width** | 232px | 288px (w-72) | Change to 232px |
| **Primary action** | `--teal-600` (#028E91) | `#006e2b` (green) | Change to teal-600 |
| **Heading text** | `--navy-900` (#061E5C) | `#171c1f` (charcoal) | Change to navy-900 |
| **Shadows** | Navy-tinted rgba(6,30,92,x) | Neumorphic/claymorphic | Replace with source shadows |
| **Body text** | `--grey-800` (#273343) | `#171c1f` | Change to grey-800 |
| **Background** | `--white` (pages are white) | `#f0f4f8` (Cloud Gray) | Decide per surface |

### Missing Implementation

- ApplicationsScreen (AD-10) — no separate page
- ImportScreen (AD-13) — not implemented
- MapScreen (AD-16) — not implemented
- ChatModeScreen (AD-12) — not implemented
- ChartsScreen — no dedicated page
- LiffFields, LiffContact, LiffBaseline — no LIFF routes
- Farmer detail drawer (5 tabs) — only basic table exists

### Stale Documents

- `DESIGN-COMPARISON-REPORT.md` — warns about missing features that now exist (credit chart, work queue). Do not blindly rebuild reported missing features.
- `design-*-full.png` — historical captures with Claude wrapper frames, unsuitable as pixel baselines.

### Native LINE Caveats

- LINE renders Flex Messages differently from browser HTML. The artifact shows idealized layouts.
- Rich Menu has fixed 3×2 grid with specific pixel constraints.
- LIFF runs inside LINE's WebView — native chrome (header, back button) is outside our control.
- Photo EXIF/GPS handling depends on LINE's camera API capabilities.

### Unknowns

- No image assets in extractions — login background, logo must be sourced separately.
- Font licensing — Fira Sans/Mono are open (SIL OFL), Noto Sans Thai is open (SIL OFL).
- WOFF2 font files are named with UUIDs — need mapping to standard filenames.

---

## 10. Implementation Checklist

Ordered by dependency. Each item references source file, requirement IDs, and current route.

### Job 02 — Clean Reference Captures (prerequisite for all visual work)
- [ ] Render each `index.html` in a browser at fixed viewport
- [ ] Capture screenshot per screen/state at identical DPR
- [ ] Document viewport, scroll position, font readiness
- [ ] Store as baselines in `tests/visual/baselines/`

### Job 03 — Shared Tokens, Shell, Login
- [ ] Replace font stack: Fira Sans + Noto Sans Thai
- [ ] Replace color tokens: teal/navy palette
- [ ] Replace shadow tokens: navy-tinted shadows
- [ ] Fix sidebar: 232px, navy-900 bg
- [ ] Fix dashboard header: glassmorphic with source tokens
- [ ] Rebuild login: split layout, gradient panel, OTP, remember-device
- [ ] Verify: login (admin + sponsor), shell, nav

### Job 04 — Admin Screens
- [ ] OverviewScreen — geometry, stat tiles, task queue, chart, tables
- [ ] ReviewScreen — photo review layout, metadata table, approve/reject
- [ ] ApplicationsScreen — new page, application list + detail
- [ ] FarmersScreen — detail drawer with 5 tabs
- [ ] ChartsScreen — new page, SVG chart components
- [ ] ReportsScreen — T-VER progress bars, export list
- [ ] SettingsScreen — 5-tab structure, permission matrix
- [ ] SponsorsScreen — permission checkboxes
- [ ] ImportScreen, MapScreen, ChatModeScreen — new pages (if in scope)

### Job 05 — Sponsor Dashboard
- [ ] SponsorOverview — gradient hero card, PDPA note, charts
- [ ] SponsorAreas — per-province tables, photo grid
- [ ] SponsorReports — certificate table

### Job 06 — LINE OA
- [ ] Rich Menu — verify Thai labels match source
- [ ] Flex Message templates — heroTone variants, row structure
- [ ] LIFF pages: register, camera, calendar, summary (existing)
- [ ] LIFF pages: fields, contact, baseline (new)
- [ ] LIFF shell — gradient-deep header, NZC logo
- [ ] Native LINE verification (real device, not /chat)

### Job 07 — Independent Acceptance Audit
- [ ] Overlay/diff each screen against baseline
- [ ] Verify all requirement IDs have implementation
- [ ] Verify all states (empty, loading, populated, error)
- [ ] Document remaining discrepancies
- [ ] Do not close without visual evidence
