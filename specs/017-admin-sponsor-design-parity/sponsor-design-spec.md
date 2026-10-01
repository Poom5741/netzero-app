# Sponsor Portal — Artifact Design Spec

**Source of truth**: `design-artifacts/2026-09-28/sponsor-portal.html`
(2,467,010 bytes, 1 bundler manifest, 68 modules decoded to `/tmp/nzc-sponsor-decode/`)

**Artifact ID**: `0de23b7a-9fb3-433e-8930-7eff56a39e45` (per `docs/claude-design-artifact-map.md`)

**Decode method**:
```bash
python3 - <<'EOF'
import re, json, base64, gzip, os
html = open("design-artifacts/2026-09-28/sponsor-portal.html").read()
body = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html, re.DOTALL).group(1)
manifest = json.loads(body)
for uuid, info in manifest.items():
    data = base64.b64decode(info["data"])
    if info.get("compressed"): data = gzip.decompress(data)
    open(f"/tmp/nzc-sponsor-decode/{uuid}.js", "w").write(data.decode())
EOF
```

## 1. Source Modules

| UUID | Role | Size |
|---|---|---|
| `9a78bbdb-69d8-4b90-a82d-822f30d2655d` | Design system (`NetZeroCarbonDesignSystem_f3e7a8`) | 376 KB |
| `a350f295-58c9-44bd-9b11-b1f3c64738da` | Login screen + shell components (`LoginScreen`, `ConsoleShell`, `PageTitle`, `Section`, `PdpaNote`, `CreditChart`) | 11.7 KB |
| `7ccc65fc-cc06-41a3-8112-7407b6d435bb` | Sponsor screens (`SponsorOverview`, `SponsorAreas`, `SponsorReports`) | 13.0 KB |
| `b836f80d-4f94-4ddc-a598-a02e4755b30b` | Fixture globals (`SPONSORS`, `FARMERS`, `PROVINCES`, `PLOTS`, `FARMER_NAMES`, `QUEUE`, `REJECT_REASONS`, `SEASONS`, `EXPORTS`, `NITROGEN_ROWS`) | 8.1 KB |
| `97820dda-25b1-4694-b1f1-0b0c6700d03c` | Calculation engine (`computePlotSeason`, `GHG_2569`, `PHOTO_ROUNDS`, `SF_P`, `SF_W`, `CFOA`, `A_CONST`) | 7.3 KB |
| `d51ad957-530b-45f8-8283-ff5023a61896` | `regjsparser` vendor bundle | 3.1 MB |
| `ff634291-0f02-46a6-a0ee-00f169fd98cc` | React runtime | 1.1 MB |
| `c8a9416f-36cb-4a0f-8711-32086da2298e` | React DOM runtime | 348 KB |
| `c9fb0782-60ed-4170-9392-e79eb481867b` | Unknown vendor chunk | 107 KB |
| 42× WOFF2 fonts | Font assets | 28–32 KB each |
| `f5b62a32-27ff-4839-bcee-127c3a901a3c` | Small runtime | 2.8 KB |

The four application modules are `a350f295` (shell + login), `7ccc65fc` (three sponsor screens), `b836f80d` (fixtures), and `97820dda` (calculation). Everything else is vendor.

---

## 2. Design Token Table (complete, extracted from `9a78bbdb` @ds-bundle comment + CSS vars in source)

All tokens are CSS custom properties defined in the artifact's CSS variables block.

### Brand / Colour ramp

| Token | Value | Notes |
|---|---|---|
| `--navy-950` | `#030E2E` | |
| `--navy-900` | `#061E5C` | Primary brand dark |
| `--navy-800` | `#0B2A72` | |
| `--navy-700` | `#123787` | |
| `--navy-600` | `#1C489F` | |
| `--navy-500` | `#2C5EB8` | |
| `--navy-400` | `#5279CB` | |
| `--navy-300` | `#7C9AD8` | |
| `--navy-200` | `#AEC2E8` | |
| `--navy-100` | `#D6E0F4` | |
| `--navy-50` | `#EEF2FB` | |
| `--teal-950` | `#012730` | |
| `--teal-900` | `#013B45` | |
| `--teal-800` | `#01565F` | |
| `--teal-700` | `#027276` | |
| `--teal-600` | `#028E91` | Primary accent |
| `--teal-500` | `#0AA8A3` | |
| `--teal-400` | `#24C4B2` | |
| `--teal-300` | `#52ECCA` | Highlight |
| `--teal-200` | `#8FF3DE` | |
| `--teal-100` | `#C6F9EE` | |
| `--teal-50` | `#E7FCF7` | |
| `--grey-950` | `#141414` | |
| `--grey-900` | `#1B2330` | |
| `--grey-800` | `#273343` | |
| `--grey-700` | `#3C4A5C` | |
| `--grey-600` | `#566277` | |
| `--grey-500` | `#737E91` | |
| `--grey-400` | `#9AA3B2` | |
| `--grey-300` | `#C2C8D2` | |
| `--grey-200` | `#DDE1E8` | |
| `--grey-100` | `#EDEFF3` | |
| `--grey-50` | `#F2F2F2` | |
| `--white` | `#FFFFFF` | |
| `--nzc-navy` | `#061E5C` | Alias of `--navy-900` |
| `--nzc-teal` | `#028E91` | Alias of `--teal-600` |
| `--nzc-aqua` | `#43D8B8` | Not in ramp |
| `--nzc-mint` | `#52ECCA` | Alias of `--teal-300` |
| `--nzc-off-white` | `#F2F2F2` | Alias of `--grey-50` |
| `--nzc-space-grey` | `#273343` | Alias of `--grey-800` |
| `--nzc-black` | `#141414` | Alias of `--grey-950` |
| `--status-success` | `#0AA8A3` | |
| `--status-success-soft` | `var(--teal-50)` | |
| `--status-danger` | `#C8464F` | |
| `--status-danger-soft` | `#FBECEC` | |
| `--status-warning` | `#E2A33C` | |
| `--status-warning-soft` | `#FCF2E0` | |
| `--status-info` | `var(--navy-600)` | |
| `--status-info-soft` | `var(--navy-50)` | |

### Typography

| Token | Value |
|---|---|
| `--text-6xl` | `76px` |
| `--text-5xl` | `60px` |
| `--text-4xl` | `48px` |
| `--text-3xl` | `38px` |
| `--text-2xl` | `30px` |
| `--text-xl` | `24px` |
| `--text-lg` | `20px` |
| `--text-md` | `18px` |
| `--text-base` | `16px` |
| `--text-sm` | `14px` |
| `--text-xs` | `12px` |
| `--text-accent` | `var(--teal-600)` |
| `--text-body` | `var(--grey-800)` |
| `--text-heading` | `var(--navy-900)` |
| `--text-muted` | `var(--grey-600)` |
| `--text-subtle` | `var(--grey-500)` |
| `--text-link` | `var(--teal-600)` |
| `--text-link-hover` | `var(--navy-900)` |
| `--text-on-accent` | `var(--white)` |
| `--text-on-dark` | `var(--white)` |
| `--text-on-dark-muted` | `rgba(255,255,255,.72)` |
| `--weight-light` | `300` |
| `--weight-regular` | `400` |
| `--weight-medium` | `500` |
| `--weight-semibold` | `600` |
| `--weight-bold` | `700` |
| `--leading-tight` | `1.08` |
| `--leading-snug` | `1.2` |
| `--leading-normal` | `1.55` |
| `--leading-relaxed` | `1.7` |
| `--tracking-display` | `-0.02em` |
| `--tracking-heading` | `-0.01em` |
| `--tracking-normal` | `0em` |
| `--tracking-eyebrow` | `0.14em` |
| `--font-display` | `var(--font-sans)` |

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
| `--gutter` | `24px` |
| `--section-y` | `var(--space-24)` |
| `--section-y-tight` | `var(--space-16)` |

### Layout

| Token | Value |
|---|---|
| `--container-max` | `1200px` |
| `--container-narrow` | `760px` |
| `--radius-xs` | `4px` |
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-2xl` | `32px` |
| `--radius-card` | `var(--radius-lg)` |
| `--radius-field` | `var(--radius-sm)` |
| `--radius-control` | `var(--radius-pill)` |
| `--radius-circle` | `50%` |
| `--radius-pill` | `999px` |
| `--radius-none` | `0px` |
| `--radius-media` | `var(--radius-lg)` |
| `--phone-radius` | `38px` |
| `--phone-width` | `360px` |

### Shadows

| Token | Value |
|---|---|---|
| `--shadow-none` | `none` |
| `--shadow-xs` | `0 1px 2px rgba(6,30,92,.06)` |
| `--shadow-sm` | `0 2px 6px rgba(6,30,92,.07)` |
| `--shadow-md` | `0 8px 24px rgba(6,30,92,.09)` |
| `--shadow-lg` | `0 18px 44px rgba(6,30,92,.12)` |
| `--shadow-xl` | `0 32px 72px rgba(6,30,92,.16)` |
| `--shadow-accent` | `0 12px 28px rgba(2,142,145,.24)` |
| `--shadow-inset-top` | `inset 0 1px 0 rgba(255,255,255,.6)` |

### Borders

| Token | Value |
|---|---|---|
| `--border-subtle` | `var(--grey-200)` |
| `--border-default` | `var(--grey-300)` |
| `--border-strong` | `var(--grey-400)` |
| `--border-accent` | `var(--teal-600)` |
| `--border-on-dark` | `rgba(255,255,255,.18)` |

### Surfaces

| Token | Value |
|---|---|---|
| `--surface-page` | `var(--white)` |
| `--surface-card` | `var(--white)` |
| `--surface-card-alt` | `var(--navy-50)` |
| `--surface-sunken` | `var(--grey-50)` |
| `--surface-inverse` | `var(--navy-900)` |
| `--surface-inverse-alt` | `var(--grey-800)` |
| `--surface-accent-soft` | `var(--teal-50)` |
| `--glass-fill` | `rgba(255,255,255,.72)` |
| `--glass-fill-dark` | `rgba(6,30,92,.62)` |
| `--blur-glass` | `14px` |

### Form controls

| Token | Value |
|---|---|---|
| `--field-height` | `46px` |
| `--control-height-sm` | `36px` |
| `--control-height-md` | `46px` |
| `--control-height-lg` | `54px` |
| `--focus-ring` | `0 0 0 3px rgba(10,168,163,.32)` |
| `--ring-focus-inverse` | `0 0 0 3px rgba(82,236,202,.45)` |

### Actions / buttons

| Token | Value |
|---|---|---|
| `--action-primary` | `var(--teal-600)` |
| `--action-primary-hover` | `var(--teal-700)` |
| `--action-primary-active` | `var(--teal-800)` |
| `--action-secondary` | `var(--navy-900)` |
| `--action-secondary-hover` | `var(--navy-800)` |
| `--action-disabled` | `var(--grey-200)` |

### Motion

| Token | Value |
|---|---|---|
| `--duration-instant` | `80ms` |
| `--duration-fast` | `140ms` |
| `--duration-base` | `220ms` |
| `--duration-slow` | `420ms` |
| `--duration-reveal` | `700ms` |
| `--duration-count` | `1800ms` |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` |
| `--ease-in` | `cubic-bezier(.4,0,1,1)` |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` |
| `--lift-hover` | `translateY(-4px)` |
| `--press-scale` | `0.98` |
| `--transition-card` | `transform var(--duration-base) var(--ease-out),box-shadow var(--duration-base) var(--ease-out)` |
| `--transition-control` | `background-color var(--duration-fast) var(--ease-standard),color var(--duration-fast) var(--ease-standard)` |

### Gradients

| Token | Value |
|---|---|---|
| `--gradient-deep` | `linear-gradient(150deg,#061E5C 0%,#0B2A72 45%,#027276 100%)` |
| `--gradient-rule` | `linear-gradient(90deg,#52ECCA 0%,#028E91 55%,#061E5C 100%)` |
| `--gradient-mark` | `linear-gradient(135deg,#52ECCA 0%,#02A99E 42%,#028E91 62%,#0…` (truncated) |
| `--gradient-protect` | `linear-gradient(180deg,rgba(6,30,92,0) 0%,rgba(6,30,92,.82) …` (truncated) |

### LINE (shared from farmer design system — present but unused in sponsor portal)

| Token | Value |
|---|---|---|
| `--line-green` | `#06C755` |
| `--line-green-dark` | `#04A344` |
| `--line-chat-bg` | `#8FAAD0` |
| `--line-chat-ink` | `#16202C` |
| `--line-chat-ink-2` | `#4A5866` |
| `--line-chat-ink-3` | `#78889A` |
| `--line-bubble-me` | `#A9E86B` |
| `--line-bubble-you` | `#FFFFFF` |
| `--line-hairline` | `#EEF2F6` |
| `--line-qr-border` | `#D6DFE9` |

---

## 3. Shared Component Inventory (from `9a78bbdb` @ds-bundle manifest)

Confirmed present in `NetZeroCarbonDesignSystem_f3e7a8`:

| Component | Source path | Sponsor usage |
|---|---|---|
| `GradientRule` | `components/brand/GradientRule.jsx` | ✅ `SponsorOverview` hero divider |
| `Logo` | `components/brand/Logo.jsx` | ✅ Login panel + sidebar |
| `SectionHeading` | `components/brand/SectionHeading.jsx` | Not used in sponsor |
| `StatCounter` | `components/brand/StatCounter.jsx` | Not used in sponsor |
| `Badge` | `components/core/Badge.jsx` | ✅ Status chips on KPI cards |
| `Button` | `components/core/Button.jsx` | ✅ Download, outline actions |
| `Card` | `components/core/Card.jsx` | Not used (Sections are used instead) |
| `Icon` | `components/core/Icon.jsx` | ✅ nav icons, download, arrow |
| `IconButton` | `components/core/IconButton.jsx` | Not used in sponsor |
| `Tag` | `components/core/Tag.jsx` | ✅ XLSX/DOCX format tags |
| `DataTable` | `components/data/DataTable.jsx` | ✅ Main data display |
| `FilterBar` | `components/data/FilterBar.jsx` | ✅ `SponsorOverview` filter bar |
| `ProgressBar` | `components/data/ProgressBar.jsx` | ✅ Season progress section |
| `StatTile` | `components/data/StatTile.jsx` | ✅ KPI tiles |
| `Checkbox` | `components/forms/Checkbox.jsx` | ✅ Login "remember device" |
| `Field` | `components/forms/Field.jsx` | ✅ Login form labels |
| `Input` | `components/forms/Input.jsx` | ✅ Email, password, OTP |
| `Select` | `components/forms/Select.jsx` | Not used in sponsor |
| `Textarea` | `components/forms/Textarea.jsx` | Not used in sponsor |
| `ChatBubble` | `components/line/ChatBubble.jsx` | Not used in sponsor |
| `ChatDivider` | `components/line/ChatBubble.jsx` | Not used in sponsor |
| `PhotoBubble` | `components/line/ChatBubble.jsx` | Not used in sponsor |
| `FlexMessage` | `components/line/FlexMessage.jsx` | Not used in sponsor |
| `PhoneFrame` | `components/line/PhoneFrame.jsx` | Not used in sponsor |
| `ChatHeader` | `components/line/PhoneFrame.jsx` | Not used in sponsor |
| `ChatCanvas` | `components/line/PhoneFrame.jsx` | Not used in sponsor |
| `QuickReplies` | `components/line/QuickReplies.jsx` | Not used in sponsor |
| `RichMenu` | `components/line/RichMenu.jsx` | Not used in sponsor |

**NOT present in sponsor screens**: `Select`, `Textarea`, `IconButton`, `SectionHeading`, `StatCounter`, `Card`, all LINE-specific components.

### Per-component geometry (fully recovered from `9a78bbdb` source lines — not inferred)

All 18 sponsor-used components decoded by line-offset slicing the minified bundle:
`grep -n 'function Button\|const Tag\|function StatTile' 9a78bbdb-69d8-4b90-a82d-822f30d2655d.js`

**`Button`** — `9a78bbdb` lines 354–422
- Props: `variant=primary|secondary|outline|ghost|onDark`, `size=sm|md|lg`, `disabled`, `fullWidth`, `iconLeft`, `iconRight`, `as`, `href`, `children`
- SIZES: `sm` → h `var(--control-height-sm)` (36px), px `var(--space-4)`, fs `var(--text-sm)`; `md` → h `var(--control-height-md)` (46px), px `var(--space-6)`, fs `var(--text-base)`; `lg` → h `var(--control-height-lg)` (54px), px `var(--space-8)`, fs `var(--text-md)`
- VARIANTS:
  - `primary`: bg `var(--action-primary)`, fg `var(--text-on-accent)`, bd `transparent`; hover `var(--action-primary-hover)`; active `var(--action-primary-active)`
  - `secondary`: bg `var(--action-secondary)`, fg `var(--text-on-dark)`, bd `transparent`; hover `var(--action-secondary-hover)`; active `var(--navy-950)`
  - `outline`: bg `transparent`, fg `var(--text-heading)`, bd `var(--border-default)`; hover `var(--navy-50)`; active `var(--navy-100)`
  - `ghost`: bg `transparent`, fg `var(--text-accent)`, bd `transparent`; hover `var(--teal-50)`; active `var(--teal-100)`
  - `onDark`: bg `rgba(255,255,255,.14)`, fg `var(--text-on-dark)`, bd `var(--border-on-dark)`; hover `rgba(255,255,255,.24)`; active `rgba(255,255,255,.3)`
- Common: `fontWeight: var(--weight-semibold)`, `letterSpacing: 0.01em`, `borderRadius: var(--radius-control)` (pill), `gap: var(--space-2)`, hover lift shadow `var(--shadow-accent)`, press scale `var(--press-scale)`

**`Badge`** — `9a78bbdb` lines 263–293
- Props: `tone=success|warning|danger|info|neutral`, `dot`, `children`
- Geometry: `height: 24px`, `padding: 0 var(--space-3)`, `borderRadius: var(--radius-pill)`, `fontSize: var(--text-xs)`, `fontWeight: var(--weight-semibold)`, `gap: var(--space-2)`, dot `6px` circle
- TONES: `success` → bg `var(--status-success-soft)`, fg `var(--teal-800)`, dot `var(--status-success)`; `warning` → bg `var(--status-warning-soft)`, fg `#8A5B10`, dot `var(--status-warning)`; `danger` → bg `var(--status-danger-soft)`, fg `#8C2830`, dot `var(--status-danger)`; `info` → bg `var(--status-info-soft)`, fg `var(--navy-800)`, dot `var(--status-info)`; `neutral` → bg `var(--grey-100)`, fg `var(--grey-700)`, dot `var(--grey-500)`

**`Tag`** — `9a78bbdb` lines 605–633
- Props: `tone=teal|navy|neutral|solid|onDark`, `icon`, `children`
- Geometry: `height: 28px`, `padding: 0 var(--space-3)`, `borderRadius: var(--radius-pill)`, `fontSize: var(--text-xs)`, `fontWeight: var(--weight-semibold)`, `letterSpacing: 0.02em`
- TONES: `teal` → bg `var(--teal-50)`, fg `var(--teal-800)`, bd `var(--teal-200)`; `navy` → bg `var(--navy-50)`, fg `var(--navy-800)`, bd `var(--navy-200)`; `neutral` → bg `var(--grey-100)`, fg `var(--grey-700)`, bd `var(--grey-200)`; `solid` → bg `var(--teal-600)`, fg `var(--white)`, bd `transparent`; `onDark` → bg `rgba(255,255,255,.12)`, fg `var(--white)`, bd `var(--border-on-dark)`

**`StatTile`** — `9a78bbdb` lines 840–905
- Props: `value`, `unit`, `label`, `note`, `delta`, `tone=light|dark`, `align=left|center`
- Container: `bg: var(--surface-card)`, `border: 1px solid var(--border-subtle)`, `borderRadius: var(--radius-card)`, `padding: var(--space-5) var(--space-6)`, `gap: var(--space-2)`
- Label: `fontSize: var(--text-sm)`, `fontWeight: var(--weight-semibold)`, color `var(--text-heading)` (light) / `var(--teal-300)` (dark)
- Value: `fontSize: var(--text-4xl)`, `fontWeight: var(--weight-light)`, `lineHeight: 1`, `letterSpacing: var(--tracking-display)`, color `var(--text-heading)` (light) / `var(--white)` (dark)
- Unit: `fontSize: var(--text-sm)`, `fontWeight: var(--weight-semibold)`, color `var(--text-muted)` (light) / `rgba(255,255,255,.7)` (dark)
- Note: `fontSize: var(--text-xs)`, `lineHeight: var(--leading-relaxed)`, color `var(--text-subtle)` (light) / `rgba(255,255,255,.66)` (dark)

**`DataTable`** — `9a78bbdb` lines 638–696
- Props: `columns=[{key,label,align?,render?}]`, `rows`, `onRowClick`, `dense=false`
- Container: `border: 1px solid var(--border-subtle)`, `borderRadius: var(--radius-card)`, `bg: var(--surface-card)`
- TH: `padding: 11px 14px` (normal), `8px 12px` (dense); `bg: var(--grey-50)`; `fontSize: var(--text-xs)`; `fontWeight: var(--weight-semibold)`; `color: var(--text-muted)`; `borderBottom: 1px solid var(--border-subtle)`; `whiteSpace: nowrap`
- TR hover: `bg: var(--navy-50)` when `onRowClick` present
- TD: `padding: 11px 14px` (normal), `8px 12px` (dense); `borderBottom: 1px solid var(--grey-100)` except last row; `color: var(--text-body)`; `fontVariantNumeric: tabular-nums` when `align: right`

**`FilterBar`** — `9a78bbdb` lines 702–769
- Props: `label="ตัวกรอง"`, `filters=[{id,label,value,options,active}]`, `onChange`, `actions`
- Layout: `display: flex; alignItems: center; gap: var(--space-3); flexWrap: wrap`
- Label: `fontSize: var(--text-xs)`, `fontWeight: var(--weight-semibold)`, `color: var(--text-subtle)`
- Each filter chip: `minWidth: 148px`, `padding: 6px 14px`, `borderRadius: var(--radius-md)`; active: border `var(--border-accent)`, bg `var(--surface-accent-soft)`, shadow none; inactive: border `var(--border-subtle)`, bg `var(--white)`, shadow `var(--shadow-xs)`
- Filter chip label: `fontSize: 10.5px`, `color: var(--text-subtle)`
- Internal select: no border, no bg, no outline; `fontSize: var(--text-sm)`, `fontWeight: var(--weight-semibold)`; active color `var(--teal-800)`, inactive `var(--text-heading)`; `cursor: pointer`
- Actions slot: `marginLeft: auto`

**`ProgressBar`** — `9a78bbdb` lines 775–833
- Props: `value`, `max=100`, `label`, `valueLabel`, `tone=teal|mint|navy|grey|warn`, `height=9`
- Layout: `display: flex; alignItems: center; gap: var(--space-4)`
- Label col: `flex: 0 0 132px`; `fontSize: var(--text-xs)`; `color: var(--text-muted)`
- Track: `flex: 1`; height = `height` prop (default 9px); `bg: var(--grey-100)`; `borderRadius: var(--radius-pill)`; `overflow: hidden`
- Fill: `borderRadius: var(--radius-pill)`; `transition: width var(--duration-slow) var(--ease-out)`; fill colours: `teal→var(--teal-600)`, `mint→var(--teal-400)`, `navy→var(--navy-700)`, `grey→var(--grey-300)`, `warn→var(--status-warning)`
- Value label: `flex: 0 0 76px`; `textAlign: right`; `fontSize: var(--text-sm)`; `fontWeight: var(--weight-semibold)`; `color: var(--text-heading)`

**`GradientRule`** — `9a78bbdb` lines 14–34
- Props: `width=72`, `thickness=3`, `orientation=horizontal|vertical`
- Default: 72px wide × 3px thick; `borderRadius: var(--radius-pill)`; `background: var(--gradient-rule)`
- If `orientation=vertical`: width becomes `thickness` px, height becomes `width` px; gradient rotates to vertical

**`Icon`** — `9a78bbdb` lines 511–541
- Props: `name`, `size=20`, `strokeWidth=1.75`, `color=currentColor`
- Uses `window.lucide.createIcons()` (lucide icon library)
- Confirmed icon names used in sponsor: `arrow-right`, `download`, `shield-check`, `log-out` (login); `layout-dashboard`, `map`, `file-spreadsheet` (nav)

**`IconButton`** — `9a78bbdb` lines 553–572
- Props: `size=sm|md|lg`, `label (aria-label)`, `children`
- Renders as `Button` with `borderRadius: var(--radius-circle)` (square-ish circle) and `padding: 0`; sizes: `sm=36px`, `md=46px`, `lg=54px`

**`Card`** — `9a78bbdb` lines 429–505
- Props: `media`, `mediaAlt`, `eyebrow`, `title`, `children`, `footer`, `tone=light|dark`, `interactive=false`, `padding`
- `bg`: light `var(--surface-card)`, dark `var(--surface-inverse)`; `border`: light `var(--border-subtle)`, dark `var(--border-on-dark)`; `borderRadius: var(--radius-card)`; `shadow`: default `var(--shadow-sm)`, hover `var(--shadow-lg)`; `transition: var(--transition-card)`; `cursor: pointer` if `interactive`
- Media: `aspectRatio: 16/10`, `objectFit: cover`
- Body: `padding: var(--card-padding)`, `gap: var(--space-3)`

**`StatCounter`** — `9a78bbdb` lines 159–230
- Props: `value`, `suffix`, `prefix`, `label`, `description`, `tone=light|dark`, `animate=true`, `duration=1800`
- Value: `fontSize: var(--text-5xl)`, `fontWeight: var(--weight-light)`, `lineHeight: var(--leading-tight)`, `letterSpacing: var(--tracking-display)`, color `var(--text-accent)` (light) / `var(--teal-300)` (dark)
- Animation: `duration=1800ms`, easing `1 - Math.pow(1-p, 3)`, respects `prefers-reduced-motion`

**`SectionHeading`** — `9a78bbdb` lines 88–153 (not used in sponsor screens)
- Props: `eyebrow`, `title`, `lead`, `align=left|center`, `tone=light|dark`, `rule=true`, `as=h2`, `actions`
- Eyebrow: `fontSize: var(--type-eyebrow-size)`, `fontWeight: var(--weight-semibold)`, `letterSpacing: var(--tracking-eyebrow)`, `textTransform: uppercase`; color `var(--text-accent)` (light) / `var(--teal-300)` (dark)
- Title: `fontSize: var(--type-h2-size)`, `fontWeight: var(--weight-light)`, `lineHeight: var(--leading-snug)`, `letterSpacing: var(--tracking-display)`
- Rule: `width: 72px`, `height: 3px`, `borderRadius: var(--radius-pill)`, `background: var(--gradient-rule)`

**`Field`** — `9a78bbdb` lines 976–1016
- Props: `label`, `hint`, `error`, `required=false`, `htmlFor`, `children`
- Layout: `display: flex; flexDirection: column; gap: var(--space-2)`
- Label: `fontSize: var(--text-sm)`, `fontWeight: var(--weight-semibold)`, `color: var(--text-heading)`; required asterisk `color: var(--status-danger)`, `marginLeft: 4px`
- Error: `fontSize: var(--text-xs)`, `color: var(--status-danger)`; Hint: `fontSize: var(--text-xs)`, `color: var(--text-subtle)`

**`Input`** — `9a78bbdb` lines 1023–1057
- Props: `invalid=false`, `style`, `onFocus`, `onBlur`, plus `type`, `id`, `defaultValue`, `placeholder` via `...rest`
- Geometry: `width: 100%`, `height: var(--field-height)` (46px), `padding: 0 var(--space-4)`, `fontSize: var(--text-base)`, `color: var(--text-body)`, `bg: var(--white)`
- Border: default `1px solid var(--border-default)`; focus `1px solid var(--border-accent)` + `boxShadow: var(--ring-focus)`; invalid `1px solid var(--status-danger)`
- `borderRadius: var(--radius-field)`; `transition: var(--transition-control)`

**`Checkbox`** — `9a78bbdb` lines 912–970
- Props: `label`, `checked`, `defaultChecked`, `disabled=false`, `onChange`
- Layout: `display: inline-flex; alignItems: center; gap: var(--space-3)`
- Native input: `position: absolute; opacity: 0; width: 0; height: 0` (visually hidden)
- Visual box: `width: 20px; height: 20px; flex: 0 0 20px; borderRadius: var(--radius-xs)`; unchecked: border `var(--border-default)`, bg `var(--white)`; checked: border `var(--teal-600)`, bg `var(--teal-600)`, color `var(--white)`, checkmark `✓`; `transition: var(--transition-control)`

**`Select`** — `9a78bbdb` lines 1063–1116
- Props: `invalid=false`, `children`, `style`, `onFocus`, `onBlur`
- Geometry: same field height (46px), same border/focus ring as Input; `padding: 0 var(--space-10) 0 var(--space-4)` (extra right-padding for caret); `appearance: none`; caret icon rendered as `span` at `right: var(--space-4)` with `color: var(--text-subtle)`, `fontSize: 12px`

**`Textarea`** — `9a78bbdb` lines 1122–1159
- Props: `invalid=false`, `rows=5`, `style`, `onFocus`, `onBlur`
- Geometry: `width: 100%`, `padding: var(--space-3) var(--space-4)` (12px 16px), `fontSize: var(--text-base)`, `lineHeight: var(--leading-normal)`, same border/focus/invalid as Input; `resize: vertical`

---

## 4. Screens

### SP-AUTH — Login Screen

**Module**: `a350f295-58c9-44bd-9b11-b1f3c64738da`
**Route rendering**: Full-page, standalone (no shell), desktop split-panel.
**Layout**: Two-column grid `1.05fr .95fr`. Left: brand panel with `gradient-deep` background + wind-farm image at 18% opacity + content. Right: centered form on white.

#### Left panel geometry
- Background: `var(--gradient-deep)`
- Padding: `var(--space-16) var(--space-12)` = `64px 48px`
- Background image: `../../assets/imagery/renewables-wind-farm.png`, `position: absolute, inset: 0, width: 100%, height: 100%, objectFit: cover, opacity: .18`
- Logo: top-left, `height={36}`, `tone="white"`, assetBase `../../assets/logos`
- Eyebrow: `var(--text-sm) var(--weight-semibold) uppercase letterSpacing 0.14em` colour `--teal-300`
- H1: `var(--text-4xl)` = `48px`, `var(--weight-light)` = `300`, `var(--leading-snug)` = `1.2`, `var(--tracking-display)` = `-0.02em`, `color: #fff`, max-width `22ch`
- Thai copy: "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"
- GradientRule: `width={120}` (120px)
- Description paragraph: `var(--text-md)` = `18px`, `var(--leading-relaxed)` = `1.7`, `color: rgba(255,255,255,.82)`, max-width `44ch`
- Footer: `var(--text-xs)` = `12px`, `color: rgba(255,255,255,.55)`

#### Right panel geometry
- Background: `var(--surface-page)` = white
- Padding: `var(--space-12)` = `48px`
- Form: max-width `392px`, centred via `placeItems: center`
- Gap between fields: `var(--space-5)` = `20px`

#### Form fields (3 inputs + 1 checkbox)
1. **อีเมลบริษัท** — `type="email"`, `defaultValue="esg@company-a.example"`
2. **รหัสผ่าน** — `type="password"`, `defaultValue="••••••••••"`
3. **รหัส OTP จากแอป** — `placeholder="000000"`, hint: "บังคับสำหรับบัญชีที่เห็นข้อมูลส่วนบุคคล"
4. **จำอุปกรณ์นี้ไว้ 30 วัน** — Checkbox
5. "ลืมรหัสผ่าน" link — `var(--text-sm)`
6. **เข้าสู่ระบน** Button — `size="lg"`, `fullWidth`, `iconRight={<Icon name="arrow-right" size={16} />}`
7. Audit note box: `var(--space-4)` padding, `var(--surface-sunken)` bg, `var(--radius-md)` = `12px`, `var(--text-xs)`, icon `shield-check` size 16

**Token variants for sponsor vs admin** (driven by `role` prop):
| Field | Admin | Sponsor |
|---|---|---|
| Eyebrow | "Admin Console" | "Sponsor Portal" |
| H1 | "โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน" | "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน" |
| Description | "ตรวจภาพหลักฐาน อนุมัติใบสมัคร…" | "ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน…" |
| Email default | `admin@netzero-carbon.io` | `esg@company-a.example` |
| Sub copy | "บัญชีเจ้าหน้าที่ NZC…" | "บัญชีบริษัทผู้สนับสนุน…" |

---

### SP-OV — SponsorOverview

**Module**: `7ccc65fc-cc06-41a3-8112-7407b6d435bb`
**Route rendering**: Inside `ConsoleShell` (sidebar + main), desktop-width.
**Responsive**: NOT mobile — sidebar is `position: sticky 100vh`, `gridTemplateColumns: 232px minmax(0,1fr)`.

#### Page layout (top to bottom)
```
PageTitle
FilterBar
PdpaNote
[3-column hero grid]
  [CreditHero — gradient-deep card, spans 1.35 cols]
  [StatTile — พื้นที่ที่สนับสนุน]
  [StatTile — ครัวเรือนที่ได้รับประโยชน์]
[2-column lower grid]
  [Section — CreditChart, 1.15 cols]
  [Section — GHG breakdown + ProgressBars, 1 col]
Section — 4 outcome KPIs
```

#### PageTitle geometry
- `eyebrow`: `var(--text-xs) var(--weight-semibold) uppercase letterSpacing 0.14em` colour `--text-accent`
- `title`: `var(--text-3xl)` = `38px`, `var(--weight-light)` = `300`, `var(--tracking-display)` = `-0.02em`
- `sub`: `var(--text-sm)` = `14px`, `color: var(--text-muted)`
- Actions slot: right-aligned flex row

#### CreditHero card geometry
- Background: `var(--gradient-deep)` = `linear-gradient(150deg,#061E5C,#0B2A72,#027276)`
- `borderRadius: var(--radius-card)` = `16px`
- Padding: `var(--space-6)` = `24px`
- Label: `var(--text-sm) var(--weight-semibold) color: var(--teal-300)`
- Value: `var(--text-5xl)` = `60px`, `var(--weight-light)` = `300`, `lineHeight: 1`, `letterSpacing: var(--tracking-display)` = `-0.02em`, `color: #fff`
- Unit: `var(--text-md)` = `18px`, `opacity: .82`
- Badge inside hero: `<Badge tone="success">รอบ 2568 (นาปี + นาปรัง) · ออกใบรับรองครบแล้ว</Badge>`
- GradientRule: `width="100%", thickness={2}`
- Note text: `var(--text-xs)`, `var(--leading-relaxed)`, `color: rgba(255,255,255,.74)` — includes bold `color: #fff` for numbers

#### StatTile geometry
- Container: `background: var(--surface-card)`, `borderRadius: var(--radius-card)`, `boxShadow: var(--shadow-xs)`, `padding: var(--space-6)`
- Value: `var(--text-3xl)` = `38px`, `var(--weight-light)`, `var(--text-heading)`
- Note line: `var(--text-xs)`, `var(--text-subtle)`

#### CreditChart geometry (inline component in `a350f295`)
- Container height: prop `height` default `190px`
- Bar gap: `3px` between bars within a season group
- Season group gap: `var(--space-6)` = `24px`
- Bar width: `flex: 1`, `minWidth: 8px`, border-radius `4px 4px 0 0`
- Legend: `var(--text-xs)`, `color: var(--text-muted)`, margin-top `var(--space-4)`
- Legend swatch: `10px × 10px`, `borderRadius: 3px`

#### Section geometry
- Background: `var(--surface-card)` = white
- Border: `1px solid var(--border-subtle)`
- `borderRadius: var(--radius-card)` = `16px`
- `boxShadow: var(--shadow-xs)`
- Header: `padding: var(--space-5) var(--space-6)` = `20px 24px`, `borderBottom: 1px solid var(--border-subtle)`
- Section title: `var(--text-md)` = `18px`, `var(--weight-semibold)`
- Section sub: `var(--text-xs)`, `color: var(--text-subtle)`, margin-top `3px`
- Body padding: `var(--space-6)` = `24px` (or `pad={false}` → 0)

#### Outcome KPI section (last Section)
- 4-column grid: `repeat(4, 1fr)`, gap `var(--space-6)`
- Value: `var(--text-3xl)` = `38px`, `var(--weight-light)`, `color: var(--text-accent)` or warning colour
- Label: `var(--text-sm) var(--weight-semibold var(--text-heading)`
- Note: `11px`, `color: var(--text-subtle)`, `marginTop: 3px`, `var(--leading-relaxed)`

---

### SP-AREA — SponsorAreas

**Module**: `7ccc65fc-cc06-41a3-8112-7407b6d435bb`
**Route rendering**: Inside `ConsoleShell`, desktop-width.

#### Layout
```
PageTitle
PdpaNote
[one Section per province]
  [DataTable — plot rows]
[Section — photo grid]
```

#### Province Section geometry
- `pad={false}` — DataTable fills the section body with no padding
- Title: province name
- Sub: `{note} · {households} ครัวเรือน · {rai} ไร่ · ER {credits} tCO₂eq`

#### DataTable columns (SP-AREA)
| key | label | Notes |
|---|---|---|
| `cpa` | CPA code | `fontFamily: monospace`, `fontSize: 12px`, bold |
| `plot` | แปลงย่อย | `fontFamily: monospace`, `fontSize: 11.5px` |
| `rai` | ไร่ | `align: right`, formatted to 2dp |
| `rice` | พันธุ์ข้าว | plain text |
| `photos` | ภาพหลักฐาน | 4 pill badges per row |
| `sfw` | ตัวปรับการจัดการน้ำ | monospace, 2dp, ⚠ if fallback |
| `er` | ER (tCO₂eq) | `align: right`, 3dp |

#### Photo badge geometry (inside photos column)
- `width: 24px, height: 18px`
- `borderRadius: 3px`
- `fontSize: 9px fontWeight: 700`
- Filled (approved): wet=`--navy-600`, dry=`--teal-600`, text white
- Empty: `--grey-200` bg, `--grey-500` text
- Thai label: "เปียก" / "แห้ง"

#### Photo gallery section geometry
- 4-column grid: `repeat(4, 1fr)`, gap `var(--space-3)` = `12px`
- Card: `borderRadius: var(--radius-sm)` = `8px`, overflow hidden, border `1px solid var(--border-subtle)`
- Image: `aspectRatio: 4/3`, gradient background simulating field image
- Card body padding: `7px 9px`

---

### SP-REPORT — SponsorReports

**Module**: `7ccc65fc-cc06-41a3-8112-7407b6d435bb`
**Route rendering**: Inside `ConsoleShell`, desktop-width.

#### Layout
```
PageTitle
Section — available reports (DataTable)
Section — issued certificates (DataTable)
```

#### Report table columns
| key | label | render |
|---|---|---|
| `name` | รายงาน | bold name + note line below |
| `fmt` | รูปแบบ | `<Tag tone="teal">{fmt}</Tag>` |
| `scope` | ขอบเขต | plain text |
| `a` | (download button) | right-aligned `<Button size="sm" variant="outline" iconLeft={<Icon name="download" size={14} />}>ดาวน์โหลด</Button>` |

#### Certificate table columns
| key | label | render |
|---|---|---|
| `id` | เลขที่ใบรับรอง | plain text |
| `season` | ฤดู | plain text |
| `vol` | tCO₂eq | `align: right`, formatted |
| `status` | สถานะ | `<Badge tone={r.tone}>{r.status}</Badge>` |
| `d` | วันที่ออก | plain text |

---

## 5. Sponsor Flow / Navigation Map

**NAV definition** (from inline Babel script in HTML template, `SponsorApp()`):
```jsx
const NAV = [
  { label: "ภาพรวม", divider: true },                        // label-only section header
  { id: "overview", label: "เครดิตและพื้นที่", icon: "layout-dashboard" },
  { id: "areas",    label: "รายแปลงในพื้นที่",    icon: "map" },
  { label: "เอกสาร",  divider: true },                        // label-only section header — NO screen
  { id: "reports",  label: "รายงานและใบรับรอง", icon: "file-spreadsheet" }
];
```

**`divider: true` render branch** (confirmed from `ConsoleShell` source, `a350f295`):
```jsx
{nav.map(n => n.divider ? (
  <div key={n.label} style={{
    fontSize: "10px", letterSpacing: "var(--tracking-eyebrow)",
    textTransform: "uppercase", color: "rgba(255,255,255,.42)",
    fontWeight: "var(--weight-semibold)",
    padding: "var(--space-4) var(--space-3) var(--space-2)"
  }}>{n.label}</div>
) : (
  <button onClick={() => onNavigate(n.id)} ...>{n.label}</button>
))}
```
`divider: true` entries render as non-interactive section-header text. **This is intentional design, not a missing screen.** The "เอกสาร" divider is a section label that groups "รายงาน" under a "เอกสาร" heading — no document-management screen exists in this artifact.

```
[Login — SP-AUTH]
    │
    │ onLogin() → sets role + account → enters ConsoleShell
    ▼
[ConsoleShell — shared shell, always visible after login]
    │
    ├── (section header: ภาพรวม)
    ├── nav "เครดิตและพื้นที่" (layout-dashboard icon) ──► SponsorOverview — SP-OV
    │       Default landing page
    ├── nav "รายแปลงในพื้นที่" (map icon) ──► SponsorAreas — SP-AREA
    │       Filtered to MY_PROVINCES
    ├── (section header: เอกสาร)
    └── nav "รายงานและใบรับรอง" (file-spreadsheet icon) ──► SponsorReports — SP-REPORT
            EXPORTS filtered to who.includes('ลูกค้า')
```

**Shell navigation** (from `ConsoleShell` in `a350f295`):
- Active screen: `screen === n.id` → bg `rgba(255,255,255,.12)`, text white
- Inactive: text `rgba(255,255,255,.72)`
- Count badge: `--teal-500` bg, white text, `radius-pill`, font `10.5px bold`
- Account area at bottom: avatar circle (32px, `--teal-600`), name + role, logout button

**Sponsor data scoping** (all computed from `SPONSORS[0]` = ME):
- `MY_PROVINCES = PROVINCES.filter(p => ME.areas.includes(p.name))`
- `MY_FARMERS = FARMERS.filter(f => ME.areas.includes(f.prov))`
- `MY_PLOTS = MY_FARMERS.reduce((a, f) => a.concat(...), [])`
- `VERIFIED = SEASONS.reduce((s, x) => s + x.verified, 0)`
- `ESTIMATE = GHG_2569.er`

---

## 6. Fixture Data Shapes

### `SPONSORS` — `b836f80d`
```ts
type Sponsor = {
  id: string;          // "A" | "B" | "C"
  name: string;        // "บจก. A" etc.
  areas: string[];    // province names, e.g. ["สุพรรณบุรี"]
  rai: number;         // total rai supported
  households: number;
  verified: number;    // tCO₂eq certified
  estimate: number;    // tCO₂eq estimated current year
  since: string;       // "2568" | "2569"
  contact: string;    // "ฝ่าย ESG"
  pending?: boolean;   // true for Sponsor C (no areas yet)
};
```

### `PROVINCES` — `b836f80d`
```ts
type Province = {
  name: string;        // "สุพรรณบุรี" | "ชัยนาท"
  districts: number;
  tambon: number;
  rai: number;
  households: number;
  credits: number;     // total estimated credits
  note: string;        // description string
};
```

### `PLOTS` — `b836f80d`
```ts
type Plot = {
  cpa: string;         // "CPA1001"
  plot: string;        // "CPA1001/F01"
  deed: string;       // deed numbers
  rai: number;
  rice: string;       // "หอมปทุม" | "กข85"
  days: 120;
  photosApproved: number;  // 0–4
  organicRoa: number;  // kg/ha organic amendment
  bl: SeasonSide;
  pj: SeasonSide;
};

type SeasonSide = {
  wwCode: "WW-1" | "WW-2" | "WW-3";  // water regime code
  sfP: "WP-1" | "WP-2" | ...;
  organic: { code: string; roa: number }[];
  nSynth: number;     // kg N/ha synthetic
  ureaT: number;      // tonnes urea/ha
  doloT: number;       // tonnes dolomite/ha
  limeT: number;
  fuelL?: number;     // litres diesel/rai (PJ only)
  fuelType?: string;
  kwh?: number;
  burnRai?: number;
  mb?: number;
};
```

### `FARMERS` — derived by `b836f80d`
```ts
type Farmer = {
  code: string;       // CPA code
  name: string;       // real name (from FARMER_NAMES)
  prov: string;
  tambon: string;
  district: string;
  sponsor: string;
  plots: (Plot & { calc: PlotSeasonResult })[];
  rai: number;
  er: number;         // tCO₂eq
  be: number;
  pe: number;
  photos: number;      // total approved photos across plots
  need: number;       // total photos needed (4 per plot)
  fallback: number;    // how many plots fell back to SF_w 0.71
  status: "หลักฐานครบ" | "หลักฐานไม่ครบ · ถอย SF_w" | "กำลังเก็บหลักฐาน";
  tone: "success" | "danger" | "warning";
  rice: string;
};
```

### `SEASONS` — `b836f80d`
```ts
type Season = {
  label: string;       // "นาปี 2568"
  baseline: number;    // tCO₂eq
  estimate: number;     // tCO₂eq
  verified: number;     // tCO₂eq (0 for 2569 seasons)
};
```

### `GHG_2569` — `97820dda`
```ts
type GHG2569 = {
  rows: {
    name: string;
    s1: [number, number];  // [baseline season1, project season1]
    s2: [number, number];  // [baseline season2, project season2]
    eq: string;            // equation reference "E-06 · E-07"
  }[];
  be: number;   // 829.6331
  pe: number;   // 337.2090
  le: number;   // 0
  er: number;    // 418.5605
};
```

### `PHOTO_ROUNDS` — `97820dda`
```ts
type PhotoRound = {
  code: string;    // "WET-1" | "DRY-1" | "WET-2" | "DRY-2"
  stage: string;   // "SG-04" etc.
  name: string;    // "รอบที่ 1 · เปียก"
  phase: "wet" | "dry";
  day: number;     // day number
  need: string;    // instruction text
};
```

### `EXPORTS` — `b836f80d`
```ts
type ExportItem = {
  id: string;      // "EX-2041"
  name: string;
  fmt: "XLSX" | "DOCX";
  scope: string;
  note: string;
  who: "แอดมิน" | "แอดมิน · ลูกค้า" | "แอดมิน · ผู้ประเมินภายนอก";
};
```

### `QUEUE` — photo inspection queue (admin, in `b836f80d`)
```ts
type QueueItem = {
  id: string;
  code: string;       // CPA code
  plot: string;       // plot sub-ID
  round: string;      // "DRY-1" etc.
  stage: string;
  stageName: string;
  phase: "wet" | "dry";
  water: string;      // "10 ซม."
  when: string;       // timestamp string
  gps: string;
  inside: boolean;
  age: string;        // "รอ 1 วัน"
  tone: "warning" | "danger";
};
```

---

## 7. Calculation Modules

### `computePlotSeason(plot)` → `PlotSeasonResult`
**Module**: `97820dda`

Inputs: `Plot` object (with `bl` and `pj` `SeasonSide`)

Steps:
1. `sfWbl = resolveSfW(plot.bl.wwCode, 99)` — BL always uses full SF_w (no photo needed)
2. `sfWpj = resolveSfW(plot.pj.wwCode, plot.photosApproved || 0)` — PJ uses fallback if photos < 4
3. `BL = seasonSide("BL", ...sfWbl)` — computes baseline emissions
4. `PJ = seasonSide("PJ", ...sfWpj)` — computes project emissions
5. `er = Math.max(0, (BL.total - PJ.total - 0) * (1 - A.U_d))` — applies 15% uncertainty discount

Output:
```ts
type PlotSeasonResult = {
  BL: SeasonEmissions;   // baseline side totals
  PJ: SeasonEmissions;   // project side totals
  sfWbl: SfWResult;
  sfWpj: SfWResult;
  be: number;             // BL.total
  pe: number;             // PJ.total
  le: number;             // 0
  er: number;             // net ER after U_d
};
```

### `seasonSide(side, plot, sfW)` — emissions for one side of one season
Computes: CH4 (E-06/E-07) + lime (E-09) + urea (E-10) + N2O (E-11–E-16) + fuel (E-17, PJ only) + burn (E-18)
`ch4Applied` = `ch4 * A.CF` (0.89) for BL; plain `ch4` for PJ.

### `resolveSfW(code, photosApproved)` — water management factor
- WW-1 (continuous flooding): `sf_w = 1.00`, no photos needed
- WW-2 (1 dry cycle): `sf_w = 0.71`, needs 2 photos; if fewer → fallback to WW-1
- WW-3 (AWD, 4 photos): `sf_w = 0.55` if 4+ photos, else fallback to WW-2 (`sf_w = 0.71`)

---

## 8. Findings vs `docs/claude-design-artifact-map.md`

**`docs/claude-design-artifact-map.md` lists 4 sponsor screens** (SP-AUTH, SP-OV, SP-AREA, SP-REPORT). The artifact **confirms exactly these 4 screens**.

| Map label | Artifact component | Confirmed? |
|---|---|---|
| SP-AUTH | `LoginScreen` (`a350f295`) | ✅ Confirmed |
| SP-OV | `SponsorOverview` (`7ccc65fc`) | ✅ Confirmed |
| SP-AREA | `SponsorAreas` (`7ccc65fc`) | ✅ Confirmed |
| SP-REPORT | `SponsorReports` (`7ccc65fc`) | ✅ Confirmed |

**LoginScreen is a shared component** — `a350f295` lines 1–12:
```jsx
function LoginScreen({ onLogin, role = "admin" }) {
  const admin = role === "admin";
```
The `role` prop (default `"admin"`) gates 4 copy/labelling differences. **No structural differences** — same layout, same fields, same post-login API, same shell. All differences are copy-only:

| Element | Admin (`role="admin"`) | Sponsor (`role="sponsor"`) |
|---|---|---|
| Eyebrow | `"Admin Console"` | `"Sponsor Portal"` |
| H1 | "โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน" | "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน" |
| Description paragraph | "ตรวจภาพหลักฐาน อนุมัติใบสมัคร…" | "ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน…" |
| Sub-copy (below form title) | "บัญชีเจ้าหน้าที่ NZC · เข้าถึงได้ทุกพื้นที่และทุกเมนู" | "บัญชีบริษัทผู้สนับสนุน · ขอบเขตกำหนดโดยแอดมิน" |
| Email default | `"admin@netzero-carbon.io"` | `"esg@company-a.example"` |

The admin bundle (`admin-console.html`) does NOT include `a350f295`. The admin portal uses a separate login module (`9482f706` per the map). Whether that module is structurally identical or different requires decoding `admin-console.html` separately.

---

## 9. Genuinely Unresolved

The following cannot be recovered from the decoded module set. Each entry states what it blocks and the reversible alternative.

1. **`Logo` SVG/PNG asset files** — `Logo` component (`9a78bbdb` lines 52–83) references `assetBase + "/" + FILES[key]` where FILES maps keys to filenames like `NZC-Horizontal-White.png`. These binary/logo assets are not in the extracted bundle (artifact-relative paths). **Blocks**: implementing the actual logo image in a standalone page. **Reversible alternative**: use the `Logo` component with the same `assetBase` and `tone` props; a placeholder SVG matching the brand colours (navy `#061E5C` + teal `#028E91`) can stand in without blocking layout work.

2. **`renewables-wind-farm.png` background image** — login left panel renders `<img src="../../assets/imagery/renewables-wind-farm.png" ... opacity: .18 />` (`a350f295` lines 9–10). The image is not in the extracted set. **Blocks**: exact visual match of the login brand panel background. **Reversible alternative**: any dark gradient placeholder with `--gradient-deep` preserves layout fidelity; the wind-farm image is decorative (opacity 18%) and does not affect component geometry.

3. **Lucide icon SVG paths** — `Icon` component (`9a78bbdb` lines 511–541) uses `window.lucide.createIcons()` and renders `<i data-lucide="name" ...>`. The lucide icon sprite (the actual SVG path data for `arrow-right`, `download`, `shield-check`, `log-out`, `layout-dashboard`, `map`, `file-spreadsheet`) is not in the extracted bundle. **Blocks**: implementing actual SVG icon rendering without a lucide CDN dependency. **Reversible alternative**: `npm install lucide-react` and use `lucide-react` directly — the `Icon` component props (`name`, `size`, `strokeWidth`, `color`) map 1:1 to `lucide-react`'s props. The icon names are confirmed from the NAV and login screen usage.

4. **`SectionHeading`** — in `@ds-bundle` manifest but not referenced by any sponsor screen (`9a78bbdb` lines 88–153 fully decoded). **Blocks**: nothing for sponsor parity; this is an admin component. **Reversible alternative**: N/A — not needed for sponsor work.

5. **`StatCounter`** — in `@ds-bundle` manifest but not referenced by any sponsor screen (`9a78bbdb` lines 159–230 fully decoded). **Blocks**: nothing for sponsor parity; not used. **Reversible alternative**: N/A.

6. **Admin portal screens** — not in `sponsor-portal.html`. The admin bundle `admin-console.html` (separate artifact) is required for AD-* parity work. **Blocks**: admin portal parity cannot proceed from this artifact. **Reversible alternative**: decode `admin-console.html` using the same method (the sponsor-portal decode script is artifact-format-agnostic).

---

## 10. Filter Defaults and Credit Chart (from `SponsorApp()` in HTML template)

These were recovered from the inline Babel script in the HTML template (`SponsorApp()` function, extracted by `grep pageOrder` from the template script).

### FilterBar default state
```jsx
const [filters, setFilters] = React.useState([
  { id: "season",  label: "ฤดู",    value: "นาปี 2569 (S1)",  options: ["นาปี 2569 (S1)","นาปรัง 2569 (S2)","นาปี 2568"],  active: true  },
  { id: "prov",    label: "จังหวัด", value: "ทั้งหมด (1)",       options: ["ทั้งหมด (1)","สุพรรณบุรี"],                         active: false },
  { id: "tambon",  label: "ตำบล",   value: "หนองสะเดา",         options: ["หนองสะเดา"],                                     active: true  },
  { id: "compare", label: "เทียบกับ", value: "ฤดูก่อนหลัง",       options: ["ฤดูก่อนหลัง","กรณีฐาน 3 ปี","ค่าเฉลี่ยโครงการ"], active: false }
]);
const setF = (id, v) => setFilters(fs => fs.map(f => f.id === id ? {...f, value: v, active: !String(v).startsWith("ทั้งหมด")} : f));
```
The `setF` updater marks a filter `active: false` when its new value starts with `"ทั้งหมด"` (which denotes "all"). `active: false` suppresses the `var(--border-accent)` highlight.

### CreditChart geometry (inline in `a350f295` lines 1–73)
```jsx
function CreditChart({ seasons, showBaseline = true, height = 190 }) {
  const max = Math.max(...seasons.map(s => Math.max(s.baseline, s.estimate, s.verified))) || 1;
  const bar = (v, fill, label) => (
    <span title={label} style={{
      flex: 1,
      height: Math.max(2, (v / max) * height) + "px",
      background: fill,
      borderRadius: "4px 4px 0 0",
      minWidth: "8px"
    }} />
  );
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-6)", height: height + "px",
        borderBottom: "1px solid var(--border-default)", paddingBottom: "1px" }}>
        {seasons.map(s => (
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "3px", height: "100%" }}>
            {showBaseline ? bar(s.baseline, "var(--grey-200)", "กรณีฐาน (BE)") : null}
            {bar(s.estimate, "var(--teal-300)", "ประมาณการ (ER)")}
            {bar(s.verified, "var(--teal-700)", "ทวนสอบแล้ว")}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--space-6)", marginTop: "var(--space-2)" }}>
        {seasons.map(s => (
          <div key={s.label} style={{ flex: 1, fontSize: "10.5px", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.35 }}>{s.label}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--space-5)", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)", flexWrap: "wrap" }}>
        {(showBaseline ? [["var(--grey-200)", "กรณีฐาน BE (tCO₂eq)"]] : []).concat([
          ["var(--teal-300)", "ประมาณการ ER"],
          ["var(--teal-700)", "ทวนสอบแล้ว"]
        ]).map(([c, l]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
```
- 3 bars per season if `showBaseline=true` (SP-OV GHG section uses `showBaseline=false` → 2 bars)
- Bar gap within group: `3px`; season-group gap: `var(--space-6)` (24px)
- Bar min-width: `8px`; border-radius: `4px 4px 0 0`; height: `max(2, (v/max)*height)` px
- Legend swatch: `10px × 10px`, `borderRadius: 3px`
