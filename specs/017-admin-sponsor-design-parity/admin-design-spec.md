# Admin Console — Design Parity Spec
**Authority**: decoded from `design-artifacts/2026-09-28/admin-console.html` (2 504 058 bytes),
artifact ID `161f2305-35de-42f8-83ed-7c90ab4da5a6`.

## Source of Truth

| Property | Value |
|---|---|
| Source file | `design-artifacts/2026-09-28/admin-console.html` |
| Size | 2 504 058 bytes |
| Manifest block | 2 442 568 bytes of base64+gzip, one `<script type="__bundler/manifest">` tag |
| Total decoded modules | 72 |
| Design system global | `window.NetZeroCarbonDesignSystem_f3e7a8` |
| Artifact ID | `161f2305-35de-42f8-83ed-7c90ab4da5a6` |

**Decode command** (executed in Python 3):

```python
import re, json, base64, gzip, pathlib
path = "design-artifacts/2026-09-28/admin-console.html"
html = open(path).read()
m = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html, re.DOTALL)
manifest = json.loads(m.group(1).strip())  # dict keyed by UUID
out_dir = pathlib.Path("/tmp/nzc-admin-decode")
out_dir.mkdir()
for uuid, mod in manifest.items():
    data = base64.b64decode(mod["data"])
    if mod.get("compressed"):
        data = gzip.decompress(data)
    ext = "bin" if mod["mime"] != "text/javascript" else "js"
    (out_dir / f"{uuid}.{ext}").write_bytes(data)
```

Module UUIDs for screens:

| Module UUID | Role | Screen(s) |
|---|---|---|
| `9482f706` | screen | `LoginScreen` (AD-AUTH) |
| `1e8c88ce` | screen | `OverviewScreen` + `ReviewScreen` (AD-OV, AD-REV) |
| `80e8634d` | screen | `FarmersScreen` + `ChartsScreen` (AD-FAR, AD-CHART) |
| `8c07477b` | screen | `ApplicationsScreen` + `ReportsScreen` + `SponsorsScreen` (AD-APP, AD-REPORT, AD-SPONSOR) |
| `20301eef` | screen | `SettingsScreen` (AD-SETTINGS) |
| `f24453af` | screen | `SettingsScreen` (duplicate) + `ApplicationsScreen` (duplicate) |
| `c0d425a3` | design-system | All shared components (JSX, 375 876 chars) |
| `3ee05776` | calc | `computePlotSeason`, `SF_W`, `SF_P`, `A_CONST`, `GHG_2569` (7 323 chars) |
| `7fa43fba` | fixture | `FARMERS`, `PROVINCES`, `PLOTS`, `SPONSORS`, `SEASONS`, `EXPORTS`, `QUEUE`, `NITROGEN_ROWS`, `REJECT_REASONS` (8 112 chars) |

The `.bin` files are UTF-8 JavaScript source (the `.bin` extension reflects the artifact bundler's classification, not the actual content type). All screen modules are plain JavaScript (JSX syntax without JSX transform — React.createElement calls).

**Rendering mode**: Every screen renders as a standalone full-page component with no visible admin chrome/shell in the artifact. All screens are desktop-width; there is no mobile breakpoint in any screen module.

---

## Design Token Table

All tokens from `--grey-50` through `--logo-clearspace` are defined in the artifact HTML `<style>` block (not inside any module). They are CSS custom properties on the document root. Source: `grep -ohE '\-\-[a-z0-9-]+:[^;"\\]{1,60}' admin-console.html | sort -u`.

Tokens with no explicit usage in the decoded screen modules (but defined in the token block) are marked **[declared only]**.

### Colour ramp — greys

| Token | Value | Usage |
|---|---|---|
| `--grey-50` | `#F2F2F2` | Surface sunken, badge neutral bg |
| `--grey-100` | `#EDEFF3` | Table cell bottom borders |
| `--grey-200` | `#DDE1E8` | Badge neutral bg, form borders, SVG track |
| `--grey-300` | `#C2C8D2` | Form borders (strong), ProgressBar grey tone |
| `--grey-400` | `#9AA3B2` | Muted icon/text |
| `--grey-500` | `#737E91` | Subtle text |
| `--grey-600` | `#566277` | Muted text (`--text-muted`) |
| `--grey-700` | `#3C4A5C` | Body text (`--text-body`) |
| `--grey-800` | `#273343` | Inverse surface |
| `--grey-900` | `#1B2330` | — |
| `--grey-950` | `#141414` | — |

### Colour ramp — navy

| Token | Value | Usage |
|---|---|---|
| `--navy-50` | `#EEF2FB` | Card alt surface, badge navy bg |
| `--navy-100` | `#D6E0F4` | — |
| `--navy-200` | `#AEC2E8` | — |
| `--navy-300` | `#7C9AD8` | — |
| `--navy-400` | `#5279CB` | — |
| `--navy-500` | `#2C5EB8` | — |
| `--navy-600` | `#1C489F` | Secondary action, badge info tone |
| `--navy-700` | `#123787` | Badge navy text, Bubble chart |
| `--navy-800` | `#0B2A72` | Gradient midpoint, secondary action hover |
| `--navy-900` | `#061E5C` | Primary dark, gradient start, headings |
| `--navy-950` | `#030E2E` | Gradient end |

### Colour ramp — teal

| Token | Value | Usage |
|---|---|---|
| `--teal-50` | `#E7FCF7` | Accent soft surface, teal badge bg |
| `--teal-100` | `#C6F9EE` | — |
| `--teal-200` | `#8FF3DE` | BarSeries mint tone |
| `--teal-300` | `#52ECCA` | Mint accent, eyebrow label colour |
| `--teal-400` | `#24C4B2` | ProgressBar mint, Bubble chart |
| `--teal-500` | `#0AA8A3` | Focus ring, teal badge text |
| `--teal-600` | `#028E91` | Primary action, accent text, ProgressBar default |
| `--teal-700` | `#027276` | Button primary hover |
| `--teal-800` | `#01565F` | Button primary active |
| `--teal-900` | `#013B45` | — |
| `--teal-950` | `#012730` | — |

### Semantic tokens

| Token | Value | Usage |
|---|---|---|
| `--nzc-aqua` | `#43D8B8` | NZC accent |
| `--nzc-mint` | `#52ECCA` | NZC mint (= `--teal-300`) |
| `--nzc-navy` | `#061E5C` | NZC navy (= `--navy-900`) |
| `--nzc-off-white` | `#F2F2F2` | NZC off-white (= `--grey-50`) |
| `--nzc-space-grey` | `#273343` | NZC space grey (= `--grey-800`) |
| `--nzc-teal` | `#028E91` | NZC teal (= `--teal-600`) |
| `--status-danger` | `#C8464F` | Danger text/border |
| `--status-danger-soft` | `#FBECEC` | Danger surface |
| `--status-info` | `#1C489F` | Info text (= `--navy-600`) |
| `--status-info-soft` | `#EEF2FB` | Info surface (= `--navy-50`) |
| `--status-success` | `#0AA8A3` | Success text/border |
| `--status-success-soft` | `#E7FCF7` | Success surface (= `--teal-50`) |
| `--status-warning` | `#E2A33C` | Warning text/border |
| `--status-warning-soft` | `#FCF2E0` | Warning surface |
| `--surface-accent-soft` | `#E7FCF7` | Accent soft (= `--teal-50`) |
| `--surface-card` | `#FFFFFF` | Card background |
| `--surface-card-alt` | `#EEF2FB` | Alternate card (= `--navy-50`) |
| `--surface-inverse` | `#061E5C` | Inverse surface (= `--navy-900`) |
| `--surface-inverse-alt` | `#273343` | Inverse alt (= `--grey-800`) |
| `--surface-page` | `#FFFFFF` | Page background |
| `--surface-sunken` | `#F2F2F2` | Sunken surface (= `--grey-50`) |
| `--white` | `#FFFFFF` | White |
| `--text-heading` | `#061E5C` | Heading colour (= `--navy-900`) |
| `--text-body` | `#273343` | Body colour (= `--grey-700`) |
| `--text-muted` | `#566277` | Muted text (= `--grey-600`) |
| `--text-subtle` | `#737E91` | Subtle text (= `--grey-500`) |
| `--text-accent` | `#028E91` | Accent text (= `--teal-600`) |
| `--text-link` | `#028E91` | Link colour |
| `--text-link-hover` | `#061E5C` | Link hover |
| `--text-on-accent` | `#FFFFFF` | Text on accent |
| `--text-on-dark` | `#FFFFFF` | Text on dark |
| `--text-on-dark-muted` | `rgba(255,255,255,.72)` | Muted on dark |
| `--action-primary` | `#028E91` | Primary action bg |
| `--action-primary-hover` | `#027276` | Primary hover |
| `--action-primary-active` | `#01565F` | Primary active |
| `--action-secondary` | `#061E5C` | Secondary action bg |
| `--action-secondary-hover` | `#0B2A72` | Secondary hover |
| `--action-disabled` | `#DDE1E8` | Disabled action (= `--grey-200`) |
| `--border-accent` | `#028E91` | Accent border |
| `--border-default` | `#C2C8D2` | Default border |
| `--border-strong` | `#9AA3B2` | Strong border |
| `--border-subtle` | `#DDE1E8` | Subtle border |
| `--border-on-dark` | `rgba(255,255,255,.18)` | Border on dark overlay |

### Gradients

| Token | Value |
|---|---|
| `--gradient-deep` | `linear-gradient(150deg, #061E5C 0%, #0B2A72 45%, #027276 100%)` |
| `--gradient-rule` | `linear-gradient(90deg, #52ECCA 0%, #028E91 55%, #061E5C 100%)` |
| `--gradient-mark` | `linear-gradient(135deg, #52ECCA 0%, #02A99E 42%, #028E91 62%, …)` |
| `--gradient-protect` | `linear-gradient(180deg, rgba(6,30,92,0) 0%, rgba(6,30,92,.82) …)` |

### Shadows

| Token | Value |
|---|---|
| `--shadow-xs` | `0 1px 2px rgba(6,30,92,.06)` |
| `--shadow-sm` | `0 2px 6px rgba(6,30,92,.07)` |
| `--shadow-md` | `0 8px 24px rgba(6,30,92,.09)` |
| `--shadow-lg` | `0 18px 44px rgba(6,30,92,.12)` |
| `--shadow-xl` | `0 32px 72px rgba(6,30,92,.16)` |
| `--shadow-accent` | `0 12px 28px rgba(2,142,145,.24)` |

### Spacing

| Token | Value |
|---|---|
| `--space-0` | `0px` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |
| `--space-24` | `96px` |
| `--space-32` | `128px` |
| `--card-padding` | `24px` (`--space-6`) |
| `--gutter` | `24px` |
| `--container-max` | `1200px` |
| `--container-narrow` | `760px` |

### Control dimensions

| Token | Value |
|---|---|
| `--control-height-sm` | `36px` |
| `--control-height-md` | `46px` |
| `--control-height-lg` | `54px` |
| `--field-height` | `46px` |

### Border radii

| Token | Value |
|---|---|
| `--radius-xs` | `4px` |
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-2xl` | `32px` |
| `--radius-pill` | `999px` |
| `--radius-circle` | `50%` |

### Typography

| Token | Value | Token | Value |
|---|---|---|---|
| `--text-xs` | `12px` | `--weight-regular` | `400` |
| `--text-sm` | `14px` | `--weight-medium` | `500` |
| `--text-base` | `16px` | `--weight-semibold` | `600` |
| `--text-md` | `18px` | `--weight-bold` | `700` |
| `--text-lg` | `20px` | `--weight-light` | `300` |
| `--text-xl` | `24px` | `--leading-tight` | `1.08` |
| `--text-2xl` | `30px` | `--leading-snug` | `1.2` |
| `--text-3xl` | `38px` | `--leading-normal` | `1.55` |
| `--text-4xl` | `48px` | `--leading-relaxed` | `1.7` |
| `--text-5xl` | `60px` | `--tracking-display` | `-0.02em` |
| `--text-6xl` | `76px` | `--tracking-eyebrow` | `0.14em` |
| | | `--tracking-heading` | `-0.01em` |

### Transitions & motion

| Token | Value |
|---|---|
| `--duration-instant` | `80ms` |
| `--duration-fast` | `140ms` |
| `--duration-base` | `220ms` |
| `--duration-slow` | `420ms` |
| `--duration-reveal` | `700ms` |
| `--duration-count` | `1800ms` |
| `--ease-in` | `cubic-bezier(.4,0,1,1)` |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` |
| `--lift-hover` | `translateY(-4px)` |
| `--press-scale` | `0.98` |

### Focus rings & glass

| Token | Value |
|---|---|
| `--focus-ring` | `0 0 0 3px rgba(10,168,163,.32)` |
| `--ring-focus-inverse` | `0 0 0 3px rgba(82,236,202,.45)` |
| `--blur-glass` | `14px` |
| `--glass-fill` | `rgba(255,255,255,.72)` |
| `--glass-fill-dark` | `rgba(6,30,92,.62)` |

---

## Per-Screen Inventory

### AD-AUTH — LoginScreen
**Module**: `9482f706-3071-47ef-a10d-293ec76b9810.bin` (11 739 chars)
**Render mode**: Standalone full-page. Desktop-only two-column split. No shell/nav.
**Layout**:
- Left panel (`1.05fr`): `--gradient-deep` bg, wind-farm image at 18% opacity, `Logo` top-left, then headline block (eyebrow "Admin Console" in `--teal-300`, h1 in `--white`, `GradientRule` 120px wide, description paragraph, footer text)
- Right panel (`0.95fr`): `--surface-page` bg, centred form at max 392px

| Element | Copy / Value |
|---|---|
| Eyebrow (admin) | `Admin Console` |
| Heading (admin) | `โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน` |
| Description (admin) | `ตรวจภาพหลักฐาน อนุมัติใบสมัคร คำนวณเครดิต และส่งออกรายงานสำหรับขึ้นทะเบียน Premium T-VER` |
| Heading (sponsor) | `พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน` |
| Form title | `เข้าสู่ระบบ` |
| Field 1 label | `อีเมลบริษัท` (type=email, default `admin@netzero-carbon.io`) |
| Field 2 label | `รหัสผ่าน` (type=password) |
| Field 3 label | `รหัส OTP จากแอป` (placeholder `000000`) |
| Checkbox | `จำอุปกรณ์นี้ไว้ 30 วัน` |
| Button | `เข้าสู่ระบบ` (size=lg, fullWidth, iconRight=arrow-right) |
| Footer | `ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด` |

**Tokens used**: `--gradient-deep`, `--surface-page`, `--white`, `--teal-300`, `--text-xs`, `--weight-semibold`, `--tracking-eyebrow`, `--text-4xl`, `--weight-light`, `--leading-snug`, `--tracking-display`, `--text-md`, `--leading-relaxed`, `--text-2xl`, `--text-sm`, `--text-muted`, `--space-4`, `--space-5`, `--space-6`, `--space-12`, `--field-height`, `--radius-md`, `--surface-sunken`, `--text-accent`, `--border-subtle`

---

### AD-OV — OverviewScreen
**Module**: `1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2.bin` (15 611 chars)
**Render mode**: Standalone full-page. Desktop (4-column stat grid, 2-column chart section). No shell/nav.
**Props**: `filters`, `onFilter`, `onNavigate`

| Section | Detail |
|---|---|
| PageTitle eyebrow | `ภาพรวมโครงการ` |
| PageTitle title | `โครงการทำนาลดโลกร้อน — ทุกพื้นที่` |
| PageTitle sub | `ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี และ จ.ชัยนาท · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01 · แนวทางการประเมินที่ 3 (ค่าแนะนำ)` |
| Actions | `กราฟสรุปเครดิต` (outline, chart-pie icon), `ส่งออกรายงาน` (outline, download icon), `คิวตรวจภาพ` (primary) |
| StatTile 1 | label=`ครัวเรือนที่เข้าร่วม`, value=`FARMERS.length + 13`, unit=`ครัวเรือน`, note=`CPA code N ราย ในพื้นที่ที่ขึ้นทะเบียนแล้ว · 13 รายในกลุ่มใหม่` |
| StatTile 2 | label=`แปลงย่อยที่ดำเนินการ`, value=`PLOTS.length + 24`, unit=`แปลง` |
| StatTile 3 | label=`พื้นที่รวม`, value=`fmt(totalRai, 1)`, unit=`ไร่` |
| StatTile 4 | label=`เครดิตสุทธิปี 2569 (ER)`, value=`fmt(GHG_2569.er)`, unit=`tCO₂eq` |
| Work queue section title | `คิวงานที่ต้องดำเนินการ` |
| Work card 1 | `ใบสมัครรอตรวจ (AD-10)` / `4` / `ค้าง 5 วัน` / tone danger |
| Work card 2 | `ภาพหลักฐานรอตรวจ` / `QUEUE.length` / tone neutral |
| Work card 3 | `แปลงที่หลักฐานยังไม่ครบ 4 ภาพ` / `needPhotos - gotPhotos` / `กระทบเครดิต` / tone warning |
| Work card 4 | `แปลงที่ถอยไปใช้ SF_w = 0.71` / `fallbacks` / tone danger |
| Left column | `CreditChart` (season comparison) |
| Right column | GHG DataTable (dense, 6 rows, 5 columns) |
| Bottom | Province DataTable (onRowClick → navigates to AD-FAR) |

**Components used**: `PageTitle`, `FilterBar`, `StatTile`, `Section`, `CreditChart`, `DataTable`, `Button`, `Badge`, `Tag`, `Icon`, `ProgressBar`

---

### AD-REV — ReviewScreen
**Module**: `1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2.bin` (same file as AD-OV)
**Render mode**: Standalone full-page. Desktop (left queue + right viewer split).
**Props**: none (uses global QUEUE, PLOTS, PHOTO_ROUNDS)

| Section | Detail |
|---|---|
| PageTitle eyebrow | `AD-01 · คิวตรวจภาพหลักฐาน` |
| PageTitle title | `ตรวจภาพท่อวัดระดับน้ำและ metadata` |
| PageTitle sub | `หนึ่งครอปต้องมี 4 ภาพ — เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน · ครบทั้ง 4 จึงใช้ SF_w = 0.55 ได้` |
| Left — queue DataTable | dense, columns: รหัสภาพ / CPA code / แปลงย่อย / รอบ (Tag) / ระดับน้ำที่กรอก / พิกัด (Badge) / อายุคำร้อง / ผล (Badge) |
| Left — completeness DataTable | dense, columns: แปลงย่อย / ไร่ / รอบภาพ (4 colour chips) / SF_w ที่ใช้จริง / (badge) / ER |
| Photo viewer | aspect-ratio 4/3, bg `linear-gradient(180deg,#9FC7E8,#CFE3B9 52%,#8FA95C 100%)`, pipe SVG overlay, GPS+time badge bottom-left, phase badge top-right |
| Metadata panel | 7 rows: ใช้กล้องระบบ / พิกัด / อยู่ในขอบเขต / เวลาถ่าย / ระดับน้ำ / สอดคล้อง / อยู่ในช่วง |
| Reject flow | reason checkboxes (7 items from `REJECT_REASONS`) + textarea + cancel + submit |
| Approve flow | two outline buttons: `ตีกลับ` / `อนุมัติและส่งเข้าคำนวณ` |

**Reject reasons** (from fixture):
1. `มองไม่เห็นขีดระดับน้ำในท่อ`
2. `ภาพเบลอ / มืดเกินไป`
3. `พิกัดตกนอกขอบเขตแปลง`
4. `เวลาถ่ายไม่อยู่ในช่วงกำหนดของรอบนี้`
5. `รอบแห้งแต่ในภาพน้ำยังเต็มท่อ (หรือกลับกัน)`
6. `ไม่ใช่ท่อวัดระดับน้ำของแปลงนี้`
7. `ส่งภาพจากคลังภาพ ไม่ได้ถ่ายผ่านกล้องของระบบ`

---

### AD-FAR — FarmersScreen
**Module**: `80e8634d-4689-4d3e-96ed-6ce38f681e25.bin` (26 323 chars)
**Render mode**: Standalone full-page + right slide-over drawer (760px, full viewport height, `--shadow-xl`).
**Props**: `filters`, `onFilter`

| Element | Detail |
|---|---|
| PageTitle eyebrow | `ทะเบียนเกษตรกร` |
| PageTitle title | `ดูราย CPA code · รายพื้นที่ · รายบริษัทผู้สนับสนุน` |
| Actions | `นำเข้าเป็นชุด (AD-13)` / `ส่งออกราย CPA code` (both outline) |
| PdpaNote | `ตารางนี้แสดงชื่อได้เพราะเป็นบัญชีแอดมิน · ทุกไฟล์ที่ส่งออกและทุกหน้าที่ลูกค้าเห็น ใช้ CPA code แทนชื่อเสมอ (PDPA · CS-02)` |
| DataTable columns | CPA code (mono 12px bold) / ชื่อ-นามสกุล / พื้นที่ (ต.X อ.X) / ผู้สนับสนุน (Tag navy) / แปลงย่อย (right) / ไร่ (right) / ภาพหลักฐาน (right) / BE (right) / PE (right) / ER tCO₂eq (right, accent bold) / สถานะหลักฐาน (Badge) |
| Drawer header | `--gradient-deep` bg, CPA code (mono teal-300), name (text-2xl light white), address line, 4 stats |
| Drawer tabs | แปลงและเอกสาร / การคำนวณเครดิต / ที่มาของไนโตรเจน / ภาพหลักฐาน / ประวัติการแก้ไข |
| Tab "แปลงและเอกสาร" | DataTable (plots) + 8-item document checklist grid |
| Tab "การคำนวณเครดิต" | `<CalcTrace>` — two-column BL/PJ calculation trace |
| Tab "ที่มาของไนโตรเจน" | DataTable with formula render, N calculation, urea Badge, photo Badge |
| Tab "ภาพหลักฐาน" | 4-photo grid (4/3 aspect, pipe overlay, approved/not-yet states) |
| Tab "ประวัติการแก้ไข" | DataTable audit log (4 rows) |

---

### AD-CHART — ChartsScreen
**Module**: `80e8634d-4689-4d3e-96ed-6ce38f681e25.bin` (same file as AD-FAR)
**Render mode**: Standalone full-page. Desktop multi-column grids.
**Props**: `filters`, `onFilter`

| Section | Detail |
|---|---|
| PageTitle eyebrow | `แดชบอร์ดกราฟ` |
| PageTitle title | `สรุปเครดิตและผลการดำเนินโครงการ` |
| FilterBar | `FilterBarLite` (wraps `FilterBar`) |
| Row 1 | (1.1fr) area stat block — 58px number / (1fr) `Gauge` / (1.3fr) `Donut` + note |
| Row 2 | (1.2fr) `CreditChart` / (1fr) `BarSeries` sponsor credits |
| Row 3 | (1fr) `Treemap` rice mix / (1fr) `Bubbles` farmer ER / (1fr) `BarSeries` photo rounds |
| Bottom | GHG source DataTable (dense, 8 columns, by season) |

**Chart specs**:
- **Gauge** (SVG, default size 168px): grey circle track, teal arc fill, value centred in arc, `rotate(129.6deg)` start offset
- **Donut** (SVG, default size 190px): multiple coloured arcs, 26px stroke width, total in centre
- **Bubbles** (SVG, viewBox `0 0 400 200`): circles with fillOpacity 0.72, 4 grid lines
- **Treemap**: coloured blocks, 2px gap, min font 10px, borderRadius top
- **BarSeries**: 180px height, gap `--space-3`, value label above bar, category label below

---

### AD-APP — ApplicationsScreen
**Module**: `8c07477b-0027-4c54-88fe-c86bba24472b.bin` (22 109 chars)
**Render mode**: Standalone full-page. Desktop (left list + right detail split, 400px detail).
**Note in source**: `"หน้านี้ใช้ข้อมูลตัวอย่าง 4 ใบ ยังไม่ได้ต่อกับคิวใบสมัครจริง"`

| Element | Detail |
|---|---|
| PageTitle eyebrow | `AD-10 · ใบสมัครรอตรวจ` |
| PageTitle title | `ตรวจและอนุมัติใบสมัครเข้าร่วมโครงการ` |
| MockNote | `"หน้านี้ใช้ข้อมูลตัวอย่าง 4 ใบ ยังไม่ได้ต่อกับคิวใบสมัครจริง และยังไม่มีตัวอ่านเลขโฉนดจากภาพเพื่อเทียบกับ R-07 อัตโนมัติ"` |
| Left DataTable | 9 columns: เลขที่ใบสมัคร / CPA code / ชื่อ-นามสกุล / ตำบล / สถานะการถือครอง (Tag) / ไร่ (right) / เอกสาร (right) / ค้าง (right) / สถานะ (Badge) |
| Right detail | Application ID + name + hold type header, metadata list (8 rows), approval checklist |

Sample applications: AP-0312 (เอกสารไม่ครบ danger), AP-0313 (พร้อมอนุมัติ success), AP-0314 (รอสัญญาเช่า warning), AP-0315 (พร้อมอนุมัติ success)

---

### AD-REPORT — ReportsScreen
**Module**: `80e8634d-4689-4d3e-96ed-6ce38f681e25.bin` (same file as AD-FAR/CHART)
**Render mode**: Standalone full-page. Desktop (left list + right detail, 380px).
**No props** (uses global FARMERS, EXPORTS, SPONSORS).

| Element | Detail |
|---|---|
| PageTitle eyebrow | `AD-07 · ส่งออกรายงาน` |
| PageTitle title | `รายงานและไฟล์สำหรับยื่นขึ้นทะเบียน` |
| Left DataTable | 4 columns: รายงาน (name + note) / รูปแบบ (Tag) / ขอบเขต / ใครดาวน์โหลดได้ |
| Right — T-VER panel | 3 ProgressBars (baseline 71%, docs 88%, photos computed%), warning banner, 3 buttons |
| Right — report detail | 5-kv pairs + download button |

---

### AD-SPONSOR — SponsorsScreen
**Module**: `80e8634d-4689-4d3e-96ed-6ce38f681e25.bin` (same file)
**Render mode**: Standalone full-page. Desktop.
**No props**.

| Element | Detail |
|---|---|
| PageTitle eyebrow | `F-65 · สิทธิ์ของลูกค้า` |
| PageTitle title | `บริษัทผู้สนับสนุนและขอบเขตที่มองเห็นได้` |
| Per-sponsor Section | header: name + stats; two-column: province checkboxes / visibility level checkboxes |

---

### AD-SETTINGS — SettingsScreen
**Module**: `20301eef-f947-40de-b124-763f338e3c60.bin` (13 862 chars) — **also duplicated** in `f24453af`
**Render mode**: Standalone full-page. Desktop. 5 tabs.
**No props**.

| Tab | Content |
|---|---|
| สิทธิ์การเข้าถึง | Role cards (5 across) + permissions matrix table (15 rows × 5 roles), lock icons on PDPA-sensitive rows |
| บัญชีผู้ใช้ | DataTable: email / ชื่อที่แสดง / ประเภทบัญชี (Tag) / ขอบเขตที่เห็น / OTP (Badge) / เข้าใช้ล่าสุด / แก้ไข button |
| ค่าคงที่การคำนวณ | MockNote about versioning + two DataTables (Group A constants, Group B behaviour lookup tables) |
| การแจ้งเตือน | 6 notification items as toggle rows with description text |
| ทั่วไป | Two-column form: project data (5 fields) / privacy & settings (6 items) |

---

## Admin Flow / Navigation Map

```
AD-AUTH (LoginScreen)
    │
    │ form submit → onLogin()
    ▼
AD-OV (OverviewScreen)
    │
    ├── [คิวตรวจภาพ button] ──→ AD-REV (ReviewScreen)
    │                                  │
    │                                  └── [อนุมัติ/ตีกลับ] → QUEUE update → AD-OV
    │
    ├── [กราฟสรุปเครดิต button] ──→ AD-CHART (ChartsScreen)
    │                                  (no return navigation in artifact — breadcrumb implied)
    │
    ├── [ส่งออกรายงาน button] ──→ AD-REPORT (ReportsScreen)
    │
    ├── [คิวใบสมัคร card click] ──→ AD-APP (ApplicationsScreen)
    │
    ├── [province DataTable row click] ──→ AD-FAR (FarmersScreen)
    │                                        │
    │                                        └── [row click] ──→ slide-over drawer
    │                                                  │
    │                                                  ├── tab "แปลงและเอกสาร"
    │                                                  ├── tab "การคำนวณเครดิต" ──→ <CalcTrace>
    │                                                  ├── tab "ที่มาของไนโตรเจน"
    │                                                  ├── tab "ภาพหลักฐาน"
    │                                                  └── tab "ประวัติการแก้ไข"
    │
    ├── [sidebar nav] ──→ AD-SPONSOR (SponsorsScreen)
    │
    └── [sidebar nav] ──→ AD-SETTINGS (SettingsScreen)
                               │
                               └── 5 tabs: สิทธิ์ / บัญชี / ค่าคงที่ / การแจ้งเตือน / ทั่วไป
```

**Navigation mechanism in artifact**: `onNavigate(screenName)` prop passed to `OverviewScreen`. No visible nav/shell in the artifact itself.

**Empty/entry state**: `AD-AUTH` is always the entry point. No onboarding empty states.

**Role-based access**: `LoginScreen` accepts a `role` prop (`"admin"` | `"sponsor"`). The eyebrow, heading, description, and form subheading all switch on this prop.

---

## Shared Component Inventory

All from module `c0d425a3-6ee5-4613-9c4a-c6ef8c5043c4.bin` unless noted.

### PageTitle
`{ eyebrow, title, sub, actions }`
- Eyebrow: `--text-xs`, `--weight-semibold`, `--teal-600`, `uppercase`, `--tracking-eyebrow`, `marginBottom: --space-1`
- Title: `--text-3xl`, `--weight-light`, `--text-heading`, `leading-tight`, margin 0
- Sub: `--text-sm`, `--text-muted`, `marginTop: --space-2`, `maxWidth: 72ch`
- Actions slot: `marginLeft: auto`

### Section
`{ title, sub, actions, children, pad }`
- Container: `bg: --surface-card`, `border: 1px solid --border-subtle`, `border-radius: --radius-card`, `box-shadow: --shadow-xs`, `overflow: hidden`
- Header: `padding: --space-4 --space-6`, `display: flex`, `alignItems: center`, `justifyContent: space-between`, `borderBottom: 1px solid --border-subtle`
- Body: `padding: --space-6` (when `pad=true`); `pad=false` passes children without wrapper padding

### FilterBar
`{ label, filters, onChange, actions }`
- Wrapper: `display: flex`, `gap: --space-3`, `flexWrap: wrap`
- Label: `--text-xs`, `--weight-semibold`, `--text-subtle`
- Select: `bg: --white`, `border: 1px solid --border-subtle`, `border-radius: --radius-sm`, `height: --control-height-sm`
- `FilterBarLite`: thin wrapper that extracts `filters` and `onFilter` as `onChange`

### DataTable
`{ columns, rows, onRowClick, dense, style }`
- Container: `border: 1px solid --border-subtle`, `border-radius: --radius-card`, `bg: --surface-card`
- Th: `bg: --grey-50`, `padding: 11px 14px`, `--text-xs`, `--weight-semibold`, `--text-muted`, `borderBottom: 1px solid --border-subtle`
- Td: `padding: 9px 14px`, `borderBottom: 1px solid --grey-100`, `--text-sm`, `--text-body`
- Dense: `padding: 7px 14px`, `--text-xs`
- `onRowClick`: wraps `<tr onClick>` — clicking a row calls `onRowClick(row)`

### StatTile
`{ value, unit, label, note, delta, tone, align }`
- Standard: `bg: --surface-card`, `border: 1px solid --border-subtle`, `border-radius: --radius-card`, `padding: --space-5 --space-6`
- Dark (tone=dark): `bg: --surface-inverse`, `border: 1px solid --border-on-dark`
- Value: `--text-3xl`, `--weight-light`, `lineHeight: 1.1`
- Unit: `--text-xs`, `--text-subtle`
- Label: `--text-xs`, `--weight-semibold`, `--text-heading`
- Note: `11px`, `--text-subtle`, `leading-relaxed`, `marginTop: --space-2`

### Button
`{ variant, size, disabled, fullWidth, iconLeft, iconRight, children, onClick }`
- `primary`: bg `--action-primary`, text white; hover `--action-primary-hover`; active `--action-primary-active`
- `secondary`: bg `--action-secondary`, text white; hover `--action-secondary-hover`
- `outline`: bg transparent, text `--text-accent`, border `--border-accent`
- `ghost`: bg transparent, text `--text-muted`
- Sizes: sm=`--control-height-sm` + `--space-4` padding; md=`--control-height-md` + `--space-5`; lg=`--control-height-lg` + `--space-6`
- Border-radius: `--radius-pill`; font-weight: `--weight-semibold`; transition: `--transition-control`
- `fullWidth`: `width: 100%`
- Icon: `iconLeft`/`iconRight` renders `<Icon name size=16>` inside button

### Badge
`{ tone, dot, children, style }`
- Height 24px, padding `0 --space-3`, `--radius-pill`
- Tones (bg / text): success=`--status-success-soft`/`--status-success`; warning=`--status-warning-soft`/`--status-warning`; danger=`--status-danger-soft`/`--status-danger`; info=`--navy-50`/`--navy-700`; neutral=`--grey-100`/`--grey-700`; navy=`--navy-50`/`--navy-700`; teal=`--teal-50`/`--teal-700`
- `dot` (default true): small circle indicator before text

### Tag
`{ tone, icon, children, style }`
- Height 28px, padding `0 --space-3`, `--radius-pill`
- Same tone map as Badge but with `border: 1px solid tone.bd` added

### Icon
`{ name, size, strokeWidth, color, style }`
- Source: `window.lucide` (initialized via `lucide.createIcons`)
- Default size 20px, strokeWidth 1.75, colour `currentColor`

### Field
`{ label, hint, error, required, htmlFor, children }`
- Wrapper: `display: flex`, `flexDirection: column`, `gap: --space-2`
- Label: `--text-sm`, `--weight-semibold`, `--text-heading`
- Hint: `11.5px`, `--text-subtle`, `marginTop: 2px`

### Input
`{ invalid, type, defaultValue, placeholder }`
- Width 100%, height `--field-height` (46px), padding `0 --space-4`
- Border: `1px solid --border-subtle`; radius: `--radius-field` (8px)
- Font: `--font-sans`, `--text-sm`
- Focus: `--focus-ring` ring

### Select
Same geometry as Input; wrapped in `position: relative`.

### Checkbox
`{ label, checked, defaultChecked, disabled, onChange }`
- Box: 16px square, `--radius-xs` border
- Checked: bg `--teal-600`, white checkmark
- Label: `--text-sm`, `--text-body`
- Disabled: `opacity: 0.5`, `cursor: not-allowed`

### Textarea
`{ invalid, rows, defaultValue }`
- Width 100%, padding `--space-3 --space-4`
- Border: `1px solid --border-subtle`, `--radius-sm`
- Font: `--font-sans`, `--text-sm`

### IconButton
`{ size, label, children }`
- Circle shape (`--radius-circle`), square sizes: sm=30px, md=36px, lg=46px
- Renders as `<button>` (aria-label required)

### ProgressBar
`{ value, max, label, valueLabel, tone, height }`
- Height 9px default
- Track: `--grey-200`
- Fill colours: teal=`--teal-600`; mint=`--teal-400`; navy=`--navy-700`; grey=`--grey-300`; warn=`--status-warning`
- Radius: `--radius-pill`

### GradientRule
`{ width, thickness, orientation }`
- Background: `--gradient-rule`
- Default: 72px wide, 3px thick, `--radius-pill`

### Logo
`{ lockup, tone, height, assetBase }`
- Height: default 40px
- Tone: `full` (navy logo), `white`, `mark`
- Source: `${assetBase}/${file}` (e.g. `../../assets/logos/horizontal-white.png`)

### Card
`{ media, eyebrow, title, children, footer, tone, interactive, padding }`
- Border-radius: `--radius-lg`
- Interactive: hover lift `--lift-hover` + shadow transition
- Tone dark: `bg: --surface-inverse`, white text

### PdpaNote
`{ children }` — defined in LoginScreen module only (not shared)
- Bg: `--status-info-soft`, padding `--space-4 --space-5`, `--radius-md`
- Icon: info circle; font `--text-xs`

### MockNote
`{ children }` — defined per-module (ApplicationsScreen, SettingsScreen)
- Bg: `--status-warning-soft`, border `1px dashed #E0BE7A`, `--radius-md`

### CreditChart
`{ seasons, showBaseline, height }` — defined in LoginScreen module (not shared)
- Grouped bar chart, 3 bars per season (baseline / estimate / verified)
- Height default 190px

### CalcTrace
`{ plot }` — defined in FarmersScreen module
- 2-column layout (BL left / PJ right)
- Each row: key `--text-xs --text-muted` + value `--font-mono --weight-semibold`
- Bottom box: `bg: --surface-accent-soft`, formula in `--font-mono`

---

## Per-Screen Geometry Token Table

### AD-OV — Section padding, tile spacing
| Property | Value |
|---|---|
| Page gap between sections | `--space-6` |
| StatTile grid | `repeat(4, 1fr)`, gap `--space-4` |
| Work queue grid | `repeat(4, 1fr)`, gap `--space-4` |
| Chart row grid | `1.15fr 1fr`, gap `--space-6` |
| Section body padding | `--space-6` |
| Section header padding | `--space-4 --space-6` |
| Work card padding | `--space-4 --space-5` |
| Work card border-radius | `--radius-md` |
| Danger card bg | `--status-danger-soft` (#FBECEC) |
| Danger card border | `#EFC9CB` |
| Warning card bg | `--status-warning-soft` (#FCF2E0) |
| Warning card border | `#F2DDB4` |

### AD-REV — Review screen layout
| Property | Value |
|---|---|
| Grid | `minmax(0, 1fr) 420px`, gap `--space-6` |
| Section body padding | `--space-6` |
| Photo viewer aspect | `4 / 3` |
| Photo viewer bg | `linear-gradient(180deg,#9FC7E8,#CFE3B9 52%,#8FA95C)` |
| Pipe overlay | white, left 50%, top 22%, 30×132px, radius 4px |
| Water fill | `rgba(56,120,160,.72)`, `inset: 4%/58% 0 0 0` (wet/dry) |
| GPS badge | `rgba(0,0,0,.6)`, `--font-mono`, 10px, padding 3px 7px, radius 5px |
| Metadata panel | border `1px solid --border-subtle`, `--radius-md`, overflow hidden |
| Metadata row | padding 9px 12px, font `--text-xs` |
| Metadata row border | `1px solid --grey-100` except last |
| Reject panel bg | `--status-danger-soft` (#FBECEC), border `#EFC9CB` |

### AD-FAR — Farmers drawer
| Property | Value |
|---|---|
| Overlay bg | `rgba(6,30,92,.42)` |
| Drawer width | `min(760px, 94vw)` |
| Drawer bg | `--surface-sunken` |
| Drawer shadow | `--shadow-xl` |
| Drawer header bg | `--gradient-deep` |
| Drawer header padding | `--space-6 --space-8` |
| Tab bar padding | `0 --space-8` |
| Tab button padding | `13px 11px` |
| Tab active border | `2px solid --teal-600`, color `--teal-700` |
| Tab inactive color | `--text-muted` |
| Content padding | `--space-6 --space-8 --space-16` |
| Photo grid | `repeat(4, 1fr)`, gap `--space-3` |

### AD-CHART — Chart dimensions
| Property | Value |
|---|---|
| Area number | `58px`, `--weight-light`, `--tracking-display` |
| Gauge size | 168px (default) |
| Donut size | 190px (default) |
| Donut stroke | 26px |
| Bubbles height | 200px |
| Treemap height | 190px |
| BarSeries height | 180px |
| CreditChart height | 190px |
| Row 1 grid | `1.1fr 1fr 1.3fr`, gap `--space-5` |
| Row 2 grid | `1.2fr 1fr`, gap `--space-5` |
| Row 3 grid | `1fr 1fr 1fr`, gap `--space-5` |

### AD-SETTINGS — Permissions table
| Property | Value |
|---|---|
| Role card grid | `repeat(5, 1fr)`, gap `--space-3` |
| Role card padding | `--space-4` |
| Table header padding | `11px 14px` |
| Table cell padding | `9px 14px` |
| Lock icon | margin-left 7px |
| Notification row padding | `--space-4` |
| Form max-width | 620px (notification panel) |

---

## Fixture Data Shapes

### FARMERS
Derived by aggregating `PLOTS` by CPA code, then running `computePlotSeason()` per plot.
```js
{
  code: "CPA1001",           // CPA code
  name: "วิชา ทองโสภา",     // from FARMER_NAMES lookup
  prov: "สุพรรณบุรี",
  tambon: "หนองสะเดา",
  district: "สามชุก",
  sponsor: "บจก. A",
  plots: [ /* array of PLOT objects with .calc = computePlotSeason result */ ],
  rai: 8.65,                 // sum of plot rai
  er: 3.891,                 // sum of plot er
  be: ..., pe: ...,
  photos: 8,                 // sum of photosApproved
  need: 8,                   // always 4 per plot
  fallback: 0,                // count of plots where sfWpj.fallback === true
  status: "หลักฐานครบ" | "หลักฐานไม่ครบ · ถอย SF_w" | "กำลังเก็บหลักฐาน",
  tone: "success" | "danger" | "warning"
}
```

### PLOTS
```js
mkPlot(cpa, plot, deed, rai, rice, roa, nSynth, ureaKg, doloKg, fuelL, photos)
// returns:
{
  cpa, plot, deed, rai, rice, days: 120, photosApproved: photos,
  organicRoa: roa,
  bl: { wwCode: "WW-1", sfP: "WP-1", organic: [{code:"OM-3",roa}], nSynth, ureaT:kg/1000, doloT:kg/1000, limeT: 0 },
  pj: { wwCode: "WW-3", sfP: "WP-2", organic: [{code:"OM-3",roa}], nSynth, ureaT:kg/1000, doloT:kg/1000, limeT: 0, fuelL, fuelType:"ดีเซล", kwh: 0 }
}
```

### SEASONS
```js
[
  { label: "นาปี 2568",   baseline: 652.3, estimate: 342.1, verified: 323.4 },
  { label: "นาปรัง 2568", baseline: 251.0, estimate:  39.6, verified:  32.4 },
  { label: "นาปี 2569 (S1)", baseline: 664.9, estimate: 249.4, verified: 0 },
  { label: "นาปรัง 2569 (S2)", baseline: 263.3, estimate: 169.2, verified: 0 }
]
```

### PHOTO_ROUNDS
```js
[
  { code: "WET-1", stage: "SG-04", name: "รอบที่ 1 · เปียก", phase: "wet", day: 28 },
  { code: "DRY-1", stage: "SG-05", name: "รอบที่ 1 · แห้ง", phase: "dry", day: 42 },
  { code: "WET-2", stage: "SG-07", name: "รอบที่ 2 · เปียก", phase: "wet", day: 61 },
  { code: "DRY-2", stage: "SG-08", name: "รอบที่ 2 · แห้ง", phase: "dry", day: 75 }
]
```

### GHG_2569
```js
{
  rows: [
    { name: "น้ำขัง (มีเทน)",   s1: [648.9607, 136.0118], s2: [247.2942, 136.0118], eq: "E-06 · E-07" },
    { name: "สารปรับปรุงดิน",   s1: [0.6497, 0.6497],     s2: [0.6497, 0.6497],     eq: "E-09" },
    { name: "ปุ๋ยยูเรีย",        s1: [3.0774, 3.0774],     s2: [3.0774, 3.0774],     eq: "E-10" },
    { name: "ปุ๋ยไนโตรเจน",     s1: [12.2560, 15.8437],   s2: [12.2560, 15.8437],   eq: "E-11 ถึง E-16" },
    { name: "การเผาไหม้เชื้อเพลิง", s1: [0, 13.0219],      s2: [0, 13.0219],         eq: "E-17" },
    { name: "การเผาไหม้มวลชีวภาพ", s1: [0, 0],             s2: [0, 0],               eq: "E-18" }
  ],
  be: 829.6331, pe: 337.2090, le: 0, er: 418.5605
}
```

---

## Calculation Module — `computePlotSeason`

Source: `3ee05776-efb9-4d93-ae7f-7be67557cbf3.bin`

**Inputs** (per plot object):
- `rai`, `days`, `rice`, `photosApproved`
- `bl.wwCode`, `bl.sfP`, `bl.organic[]`, `bl.nSynth`, `bl.ureaT`, `bl.doloT`
- `pj.wwCode`, `pj.sfP`, `pj.organic[]`, `pj.nSynth`, `pj.ureaT`, `pj.doloT`, `pj.fuelL`, `pj.fuelType`, `pj.kwh`

**Outputs** (returned object):
```js
{
  BL: { sfO, ef, ch4, ch4Applied, lime, urea, n2o, fuel, burn, total },
  PJ: { sfO, ef, ch4, ch4Applied, lime, urea, n2o, fuel, burn, total },
  sfWbl: { code, v, n2o, fallback: false },
  sfWpj: { code, v, n2o, fallback: bool, reason },
  be: BL.total,
  pe: PJ.total,
  le: 0,
  er: Math.max(0, (BL.total - PJ.total) * 0.85)
}
```

**Key decision logic** (`resolveSfW`): if `SF_W[code].fallback` is set and `photosApproved < SF_W[code].photos`, returns the fallback row (WW-2, `v=0.71`) with `fallback: true` and a reason string.

---

## Open Unknowns (post-GAP resolution)

1. ~~**Admin shell/chrome**~~ — **RESOLVED**: `ConsoleShell` found at line 2531 of `c0d425a3.bin`, in chunk `ui_kits/admin_console/AdminChrome.jsx`. Full definition extracted. Sidebar is 232px fixed, navy-900 bg, sticky, with Logo + nav + user chip + logout.

2. ~~**PdpaNote**~~ — **RESOLVED**: Defined in `ConsoleShell` chunk (`ui_kits/admin_console/AdminChrome.jsx`, line ~2795). Shared between admin and sponsor.

3. ~~**CreditChart**~~ — **RESOLVED**: Defined in `ConsoleShell` chunk (line ~2830). Shared.

4. ~~**Button SIZES map**~~ — **RESOLVED**: Full `SIZES` map extracted (line 337). sm=36px/16px/14px, md=46px/24px/16px, lg=54px/32px/18px.

5. ~~**Badge/Tag `bd` (border) colour**~~ — **RESOLVED**: `TONES` map extracted for both Badge (success/warning/danger/info/neutral) and Tag (teal/navy/neutral/solid/onDark).

6. **AD-IMPORT, AD-MAP, AD-CHAT**: Listed in `docs/claude-design-artifact-map.md` but no distinct module found for these screens in the admin bundle. No shell module defines these views either.

7. **MockNote**: Still defined inline in screen modules (`8c07477b` ApplicationsScreen, `f24453af` SettingsScreen) — not shared from design system.

8. **Revenue/split data**: No sponsor revenue, credit split, or financial allocation data in artifact.

9. **Per-sponsor credit allocation**: `computePlotSeason()` operates per-plot. No sponsor-level aggregation function found.

---

## GAP A — Admin Shell (`ConsoleShell`)

**Module**: `c0d425a3-6ee5-4613-9c4a-c6ef8c5043c4.bin`, lines 2531–2867, chunk path `ui_kits/admin_console/AdminChrome.jsx`.

**Source**: `grep -lE 'ConsoleShell' /tmp/nzc-admin-decode/*.bin` → `c0d425a3.bin`

### Shell geometry

| Property | Value |
|---|---|
| Layout | `display: grid; gridTemplateColumns: 232px minmax(0,1fr); minHeight: 100vh` |
| Sidebar width | **`--sidebar-width: 232px`** (exact px, not a token) |
| Sidebar bg | `var(--surface-inverse)` (`#061E5C`) |
| Sidebar padding | `padding: var(--space-6) var(--space-4)` |
| Sidebar gap | `gap: var(--space-6)` |
| Sidebar position | `position: sticky; top: 0; height: 100vh` |
| Main area padding | `padding: var(--space-8) var(--space-10) var(--space-16)` |
| Main min-width | `minWidth: 0` |

### Nav items

Nav driven by `nav` prop (array of `{ id, label, icon, count? }`). Each item:
- Button: `borderRadius: var(--radius-sm)`, `padding: 9px 11px`
- Active: `bg: rgba(255,255,255,.12)`, `color: #fff`
- Inactive: `bg: transparent`, `color: rgba(255,255,255,.72)`
- Font: `13px`, `fontWeight: var(--weight-semibold)`, `fontFamily: var(--font-sans)`
- Icon: `<Icon name={n.icon} size={16} />`
- Label gap: `10px` between icon and text
- Count badge: `bg: var(--teal-500)`, `color: #fff`, `fontSize: 10.5px`, `borderRadius: var(--radius-pill)`, `padding: 1px 7px`

Dividers: `fontSize: 10px`, `letterSpacing: var(--tracking-eyebrow)`, `textTransform: uppercase`, `color: rgba(255,255,255,.42)`, `fontWeight: var(--weight-semibold)`, `padding: var(--space-4) var(--space-3) var(--space-2)`

### User chip (sidebar bottom)

| Element | Value |
|---|---|
| Container | `marginTop: auto`, `borderTop: 1px solid var(--border-on-dark)`, `paddingTop: var(--space-4)` |
| Avatar | 32×32px circle, `bg: var(--teal-600)`, `color: #fff`, `fontSize: 12px`, `fontWeight: var(--weight-bold)`, `display: grid; placeItems: center` |
| Name | `fontSize: 12px`, `fontWeight: var(--weight-semibold)`, `color: #fff`, `overflow: hidden; textOverflow: ellipsis` |
| Role | `fontSize: 10.5px`, `color: rgba(255,255,255,.6)` |
| Logout button | `Icon name="log-out" size={15}`, `color: rgba(255,255,255,.6)`, no bg/border |

### Logo in sidebar

`assetBase: "../../assets/logos"`, `tone: "white"`, `height: 28`

### ConsoleShell props

```ts
{
  nav: Array<{ id: string, label: string, icon: string, count?: number, divider?: boolean }>,
  screen: string,        // current active screen id
  onNavigate: (id: string) => void,
  account: { name: string, initials: string },
  role: string,
  children: React.ReactNode,
  onLogout: () => void
}
```

### How screens connect to shell

Each screen (OverviewScreen, ReviewScreen, etc.) is rendered **as `children` inside `ConsoleShell`**. The shell's `onNavigate` callback is passed as `onNavigate` prop to OverviewScreen, which calls it with `"review"`, `"charts"`, `"reports"` etc. The parent component (not in artifact) re-renders shell with a different `screen` prop and replaces `children`. The artifact does not contain the orchestrating parent — only the shell + individual screens.

**Viewport assumption**: Fixed 232px sidebar + fluid main. No mobile breakpoint in any screen module.

---

## GAP B — Shared Component Full Geometry

**Module**: `c0d425a3-6ee5-4613-9c4a-c6ef8c5043c4.bin`

### Button (lines 354–428, chunk `components/core/Button.jsx`)

**TONES map** (line 300):
| Variant | bg | fg | bd | hoverBg | activeBg |
|---|---|---|---|---|---|
| primary | `var(--action-primary)` (#028E91) | `var(--text-on-accent)` (#fff) | `transparent` | `var(--action-primary-hover)` (#027276) | `var(--action-primary-active)` (#01565F) |
| secondary | `var(--action-secondary)` (#061E5C) | `var(--text-on-dark)` (#fff) | `transparent` | `var(--action-secondary-hover)` (#0B2A72) | `var(--navy-950)` |
| outline | `transparent` | `var(--text-heading)` (#061E5C) | `var(--border-default)` (#C2C8D2) | `var(--navy-50)` | `var(--navy-100)` |
| ghost | `transparent` | `var(--text-accent)` (#028E91) | `transparent` | `var(--teal-50)` | `var(--teal-100)` |
| onDark | `rgba(255,255,255,.14)` | `var(--text-on-dark)` (#fff) | `var(--border-on-dark)` | `rgba(255,255,255,.24)` | `rgba(255,255,255,.3)` |

**SIZES map** (line 337):
| Size | h | px | fs |
|---|---|---|---|
| sm | `var(--control-height-sm)` (36px) | `var(--space-4)` (16px) | `var(--text-sm)` (14px) |
| md | `var(--control-height-md)` (46px) | `var(--space-6)` (24px) | `var(--text-base)` (16px) |
| lg | `var(--control-height-lg)` (54px) | `var(--space-8)` (32px) | `var(--text-md)` (18px) |

**Geometry**: `display: inline-flex`, `alignItems: center`, `justifyContent: center`, `gap: var(--space-2)`, `borderRadius: var(--radius-control)` (999px), `fontWeight: var(--weight-semibold)`, `letterSpacing: 0.01em`, `cursor: pointer`, `boxShadow: var(--shadow-accent)` on primary hover, `transform: scale(var(--press-scale))` on press, `transition: var(--transition-control), transform var(--duration-instant) var(--ease-standard)`.

**Props**: `variant`, `size`, `disabled`, `fullWidth`, `iconLeft`, `iconRight`, `as`, `href`, `children`, `style`, `onMouseEnter`, `onMouseLeave`, `onMouseDown`, `onMouseUp`

### Badge (lines 263–300, chunk `components/core/Badge.jsx`)

**TONES map** (line 236):
| Tone | bg | fg | dot |
|---|---|---|---|
| success | `var(--status-success-soft)` (#E7FCF7) | `var(--teal-800)` (#01565F) | `var(--status-success)` (#0AA8A3) |
| warning | `var(--status-warning-soft)` (#FCF2E0) | `#8A5B10` | `var(--status-warning)` (#E2A33C) |
| danger | `var(--status-danger-soft)` (#FBECEC) | `#8C2830` | `var(--status-danger)` (#C8464F) |
| info | `var(--status-info-soft)` (#EEF2FB) | `var(--navy-800)` (#0B2A72) | `var(--status-info)` (#1C489F) |
| neutral | `var(--grey-100)` (#EDEFF3) | `var(--grey-700)` (#3C4A5C) | `var(--grey-500)` (#737E91) |

**Geometry**: `display: inline-flex`, `alignItems: center`, `gap: var(--space-2)`, `height: 24px`, `padding: 0 var(--space-3)`, `borderRadius: var(--radius-pill)` (999px), `fontSize: var(--text-xs)` (12px), `fontWeight: var(--weight-semibold)`. Dot: 6×6px circle (`var(--radius-circle)`), colour `t.dot`.

### Tag (lines 605–637, chunk `components/core/Tag.jsx`)

**TONES map** (line 578):
| Tone | bg | fg | bd |
|---|---|---|---|
| teal | `var(--teal-50)` (#E7FCF7) | `var(--teal-800)` (#01565F) | `var(--teal-200)` (#8FF3DE) |
| navy | `var(--navy-50)` (#EEF2FB) | `var(--navy-800)` (#0B2A72) | `var(--navy-200)` (#AEC2E8) |
| neutral | `var(--grey-100)` (#EDEFF3) | `var(--grey-700)` (#3C4A5C) | `var(--grey-200)` (#DDE1E8) |
| solid | `var(--teal-600)` (#028E91) | `var(--white)` (#fff) | `transparent` |
| onDark | `rgba(255,255,255,.12)` | `var(--white)` (#fff) | `var(--border-on-dark)` |

**Geometry**: `display: inline-flex`, `alignItems: center`, `gap: var(--space-2)`, `height: 28px`, `padding: 0 var(--space-3)`, `borderRadius: var(--radius-pill)`, `fontSize: var(--text-xs)`, `fontWeight: var(--weight-semibold)`, `letterSpacing: 0.02em`, `border: 1px solid t.bd`, `whiteSpace: nowrap`.

### Icon (lines 511–548, chunk `components/core/Icon.jsx`)

**Geometry**: `display: inline-flex`, `width: size px`, `height: size px`, `color: currentColor`, `strokeWidth: 1.75` default. Uses `window.lucide` via `createIcons`. Source: lucide-icons library (full icon set).

### IconButton (lines 553–578, chunk `components/core/IconButton.jsx`)

**Size map** (D, line 548):
| Size | dimension |
|---|---|
| sm | 36px |
| md | 46px |
| lg | 54px |

**Geometry**: renders as `<Button size={size} aria-label={label} style={{ width: d, padding: 0, borderRadius: var(--radius-circle) }}>`. No independent styling — inherits Button's geometry minus the padding.

### DataTable (lines 638–701, chunk `components/data/DataTable.jsx`)

**Geometry**: Container: `border: 1px solid var(--border-subtle)`, `borderRadius: var(--radius-card)`, `overflow: hidden`, `background: var(--surface-card)`. Table: `width: 100%`, `borderCollapse: collapse`, `fontSize: var(--text-sm)`. Th: `textAlign` (from col), `background: var(--grey-50)`, `padding: dense ? "8px 12px" : "11px 14px"`, `fontSize: var(--text-xs)`, `fontWeight: var(--weight-semibold)`, `color: var(--text-muted)`, `borderBottom: 1px solid var(--border-subtle)`, `whiteSpace: nowrap`. Tr: `cursor: onRowClick ? "pointer" : "default"`, `background: var(--white)`, hover → `background: var(--navy-50)`. Td: `padding: dense ? "8px 12px" : "11px 14px"`, `borderBottom: last-row ? "none" : "1px solid var(--grey-100)"`, `color: var(--text-body)`, `fontVariantNumeric: right ? "tabular-nums" : "normal"`.

### FilterBar (lines 702–774, chunk `components/data/FilterBar.jsx`)

**Geometry**: Wrapper: `display: flex`, `alignItems: center`, `gap: var(--space-3)`, `flexWrap: wrap`. Label: `--text-xs`, `--weight-semibold`, `--text-subtle`. Each filter: `label` with inner `select`, wrapped in a box: `minWidth: 148px`, `padding: 6px 14px`, `borderRadius: var(--radius-md)`, `border: active ? var(--border-accent) : var(--border-subtle)`, `background: active ? var(--surface-accent-soft) : var(--white)`, `boxShadow: active ? none : var(--shadow-xs)`, `cursor: pointer`. Inner select: no border/bg/outline, `fontFamily: var(--font-sans)`, `fontSize: var(--text-sm)`, `fontWeight: var(--weight-semibold)`, `color: active ? var(--teal-800) : var(--text-heading)`. Actions slot: `marginLeft: auto`.

### StatTile (lines 840–912, chunk `components/data/StatTile.jsx`)

**Geometry**: Container: `background: tone==="dark" ? var(--surface-inverse) : var(--surface-card)`, `border: 1px solid tone==="dark" ? var(--border-on-dark) : var(--border-subtle)`, `borderRadius: var(--radius-card)`, `padding: var(--space-5) var(--space-6)`, `display: flex`, `flexDirection: column`, `gap: var(--space-2)`, `textAlign: align`. Label: `--text-sm`, `--weight-semibold`, `color: tone==="dark" ? var(--teal-300) : var(--text-heading)`. Value: `--text-4xl` (48px), `--weight-light`, `lineHeight: 1`, `letterSpacing: var(--tracking-display)`, `color: tone==="dark" ? var(--white) : var(--text-heading)`, `fontVariantNumeric: tabular-nums`. Unit + delta beside value. Note: `--text-xs`, `lineHeight: var(--leading-relaxed)`, `color: tone==="dark" ? rgba(255,255,255,.66) : var(--text-subtle)`.

### ProgressBar (lines 775–839, chunk `components/data/ProgressBar.jsx`)

**Fill colours**: teal=`var(--teal-600)`, mint=`var(--teal-400)`, navy=`var(--navy-700)`, grey=`var(--grey-300)`, warn=`var(--status-warning)`.

**Geometry**: Container: `display: flex`, `alignItems: center`, `gap: var(--space-4)`. Label: `flex: 0 0 132px`, `--text-xs`, `color: var(--text-muted)`. Track: `flex: 1`, `height: height` (default 9px), `background: var(--grey-100)`, `borderRadius: var(--radius-pill)`, `overflow: hidden`. Fill: `width: pct%`, `height: 100%`, `background: fill`, `borderRadius: var(--radius-pill)`, `transition: width var(--duration-slow) var(--ease-out)`. Value label: `flex: 0 0 76px`, `textAlign: right`, `--text-sm`, `--weight-semibold`, `color: var(--text-heading)`, `fontVariantNumeric: tabular-nums`.

### Checkbox (lines 912–975, chunk `components/forms/Checkbox.jsx`)

**Geometry**: Wrapper: `display: inline-flex`, `alignItems: center`, `gap: var(--space-3)`, `cursor: disabled ? not-allowed : pointer`, `opacity: disabled ? 0.55 : 1`. Input: `position: absolute; opacity: 0; width: 0; height: 0`. Visual box: `width: 20px; height: 20px; flex: 0 0 20px`, `borderRadius: var(--radius-xs)` (4px), `border: on ? var(--teal-600) : var(--border-default)`, `background: on ? var(--teal-600) : var(--white)`, `color: #fff` (checkmark), `fontSize: 13px`, `transition: var(--transition-control)`. Label text: `--text-sm`, `color: var(--text-body)`.

### Field (lines 976–1023, chunk `components/forms/Field.jsx`)

**Geometry**: Wrapper: `display: flex; flexDirection: column; gap: var(--space-2)`. Label: `--text-sm`, `--weight-semibold`, `color: var(--text-heading)`. Required asterisk: `color: var(--status-danger); marginLeft: 4px`. Error text: `--text-xs`, `color: var(--status-danger)`. Hint: `--text-xs`, `color: var(--text-subtle)`.

### Input (lines 1023–1063, chunk `components/forms/Input.jsx`)

**Geometry**: `width: 100%`, `height: var(--field-height)` (46px), `padding: 0 var(--space-4)`, `fontFamily: var(--font-sans)`, `fontSize: var(--text-base)` (16px), `color: var(--text-body)`, `background: var(--white)`, `border: invalid ? var(--status-danger) : focus ? var(--border-accent) : var(--border-default)`, `borderRadius: var(--radius-field)` (8px), `boxShadow: focus ? var(--ring-focus) : none`, `outline: none`, `transition: var(--transition-control)`.

### Select (lines 1063–1122, chunk `components/forms/Select.jsx`)

**Geometry**: Wrapper: `position: relative; width: 100%`. Select: same as Input + `appearance: none; cursor: pointer`. Chevron icon: `position: absolute; right: var(--space-4); top: 50%; transform: translateY(-50%)`, `pointerEvents: none`, `color: var(--text-subtle)`, `fontSize: 12px`, character `\25BE`. Padding right includes space for chevron: `padding: 0 var(--space-10) 0 var(--space-4)`.

### Textarea (lines 1122–1180, chunk `components/forms/Textarea.jsx`)

`rows` default 5. Same border/focus/transition geometry as Input. `fontFamily: var(--font-sans)`, `fontSize: var(--text-sm)`, `padding: var(--space-3) var(--space-4)`.

### Logo (lines 51–236, chunk `components/brand/Logo.jsx`)

**Geometry**: `height` prop (default 40), `width: auto`, `display: block`. Tone options: `full` (navy logo file), `white` (white logo file), `mark` (mark only). `assetBase` prop (default `assets/logos`). File: `horizontal-{tone}` for lockup=`horizontal`; `mark-{tone}` for lockup=`mark`.

---

## GAP C — Screen-to-Implementation Gap

**Implementation route source**: `frontend/src/app/admin/` listing + page content reads.

| Artifact screen | Label | Our route | Gap |
|---|---|---|---|
| LoginScreen | AD-AUTH | `/admin/login/page.tsx` | **Partial.** Current: calls `LoginForm` component, email/password/OTP fields, POST to `/login`. Artifact: 2-col split (gradient left / form right), gradient bg, Logo, eyebrow "Admin Console", full Thai headline + copy, GradientRule, 3 fields (email+password+OTP), remember checkbox, CTA button. Our form is a single-column card — missing the left marketing panel entirely. |
| OverviewScreen | AD-OV | `/admin/page.tsx` | **Structural gap.** Current: fetches KPIs from API, renders `KpiTile` row + `WorkQueueCard` grid. Artifact: Same KPI row + Work Queue + **CreditChart** (grouped bar) + **GHG source DataTable** (6 rows × 5 cols) + **Province DataTable** (onRowClick → farmers). Our page is missing the CreditChart and GHG table sections entirely; only has the KPI tiles and work queue. |
| ReviewScreen | AD-REV | `/admin/evidence/page.tsx` | **Structural gap.** Current: `ReviewCard` list + `ReviewDetailPanel` + `PrecisionCard`. Artifact: Dense **DataTable** queue (columns: รหัสภาพ/CPA/แปลง/รอบ/น้ำ/พิกัด/อายุ/ผล) + completeness DataTable + **photo viewer** (aspect 4/3, pipe SVG overlay, GPS badge) + **metadata panel** + approve/reject flow with reason checkboxes + textarea. Our evidence page has cards not tables, no pipe-SVG viewer, no completeness DataTable. |
| FarmersScreen | AD-FAR | `/admin/farmers/page.tsx` | **Structural gap.** Current: list view with `createFarmer` form. Artifact: DataTable with 11 columns (CPA mono/code, name, area, sponsor Tag, plots/rai/photos/BE/PE/ER/Badge) + **slide-over drawer** (760px, gradient header, 5 tabs: แปลง/calc/N/photo/audit). Our farmers page has no drawer, no tab system, no CalcTrace. |
| ChartsScreen | AD-CHART | `/admin/page.tsx` (same as AD-OV) | **No dedicated route.** Charts are NOT a standalone route in our implementation — they are not rendered anywhere. Artifact: full page with 6 chart types (Gauge, Donut, CreditChart, BarSeries, Bubbles, Treemap) + GHG DataTable. Would need new route `/admin/charts`. |
| ApplicationsScreen | AD-APP | `/admin/applications/page.tsx` | **Partial.** Current: tabbed (รอตรวจ/อนุมัติแล้ว/ปฏิเสธแล้ว/ทั้งหมด) with approve/reject actions. Artifact: 2-col split (DataTable list + detail panel with metadata list + approval checklist), **4 sample applications**, MockNote about placeholder data. Our page is tabbed, not split; has live API data, not samples; no detail panel with metadata list. |
| ReportsScreen | AD-REPORT | `/admin/reports/page.tsx` | **Partial.** Current: report catalog with download button. Artifact: 2-col (report DataTable + T-VER submission panel with 3 ProgressBars + download buttons). Our reports page has catalog only, no T-VER progress panel, no selected report detail pane. |
| SponsorsScreen | AD-SPONSOR | `/admin/sponsors/page.tsx` | **Structural gap.** Current: basic sponsor list with empty state. Artifact: Section per sponsor with **province area checkboxes** + **visibility level checkboxes** + stats header. No SponsorsScreen equivalent in our app. |
| SettingsScreen | AD-SETTINGS | `/admin/settings/page.tsx` | **Partial.** Current: 5 tabs (permissions/users/constants/notifications/general) — structurally matches. **Gap**: Our permissions tab shows a Record-based checkbox grid. Artifact shows a **permissions matrix table** (15 rows × 5 role columns). Our constants tab is likely a simple form; artifact has two **DataTable grids** (Group A constants, Group B lookup). Our notifications tab likely differs in layout from artifact's **toggle row list** (6 items). |
| — (ChartsScreen) | AD-CHART | **NONE** | No `/admin/charts` route exists. Charts as a standalone view are unimplemented. |
| ConsoleShell | AD-SHELL | `/admin/layout.tsx` | **Different shell.** Our layout uses `DashboardShell` from `@/components/dashboard/dashboard-shell` with `SidebarEntry[]` driven by `usePathname`. Artifact uses `ConsoleShell` with explicit `nav` prop + `screen`/`onNavigate` pattern. Sidebar labels differ: our `ภาพรวม` vs artifact's nav items; our `ตรวจสอบใบสมัคร` (applications) + `ตรวจสอบภาพ` (evidence) vs artifact single `review`. The artifact shell is state-driven (current view passed as prop); our shell is route-driven. |

### Summary

| Status | Count |
|---|---|
| Route exists + structurally close | 2 (AD-AUTH, AD-SETTINGS) |
| Route exists + major structure missing | 4 (AD-OV, AD-REV, AD-FAR, AD-APP) |
| Route exists but minimal/empty | 2 (AD-REPORT, AD-SPONSOR) |
| No route at all | 1 (AD-CHART) |
| Different navigation pattern | 1 (AD-SHELL — state-driven vs route-driven) |
