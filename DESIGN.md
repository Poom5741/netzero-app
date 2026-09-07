---
name: NetZeroCarbon
description: Digital MRV for Thai rice carbon credits — trust through transparency
colors:
  rice-field-green: "#006e2b"
  line-green: "#06c755"
  line-green-dark: "#00a854"
  mint-glow: "#69ff89"
  mint-soft: "#3ee26c"
  slate-lavender: "#5d5c74"
  soft-violet: "#e2e0fc"
  deep-violet: "#63627a"
  harvest-orange: "#ab3500"
  sunset-coral: "#ff8e67"
  warm-cream: "#ffdbd0"
  sky-blue: "#f6fafe"
  cloud-gray: "#f0f4f8"
  frost-white: "#ffffff"
  mist: "#eaeef2"
  steel: "#e4e9ed"
  graphite: "#dfe3e7"
  charcoal: "#171c1f"
  dark-navy: "#1a1a2e"
  slate: "#2c3134"
  fog: "#3c4a3c"
  muted-teal: "#6c7b6b"
  moss: "#bbcbb8"
  berry-red: "#ba1a1a"
  soft-blush: "#ffdad6"
  deep-rust: "#93000a"
  golden-amber: "#f9c74f"
  muted-rose: "#f94144"
typography:
  display-lg:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.2
  headline-lg:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.3
  headline-md:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.4
  headline-lg-mobile:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.3
  body-lg:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Inter, Sarabun, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  unit: 8px
  container-margin: 20px
  touch-target-min: 44px
components:
  button-primary:
    backgroundColor: "linear-gradient(145deg, {colors.line-green}, {colors.line-green-dark})"
    textColor: "{colors.frost-white}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.frost-white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fog}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "44px"
  button-danger:
    backgroundColor: "linear-gradient(to bottom, #EF5350, {colors.berry-red})"
    textColor: "{colors.frost-white}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    height: "44px"
  input-field:
    backgroundColor: "{colors.cloud-gray}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.frost-white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.fog}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "36px"
  nav-bottom:
    backgroundColor: "rgba(255,255,255,0.6)"
    textColor: "{colors.fog}"
    rounded: "0"
    padding: "8px 24px"
  sidebar:
    backgroundColor: "{colors.dark-navy}"
    textColor: "{colors.frost-white}"
    rounded: "0"
    padding: "24px"
---

# Design System: NetZeroCarbon

## Overview

**Creative North Star: "Confidence through Transparency"**

NetZeroCarbon bridges two worlds: the ancient rhythms of Thai rice farming and the precision of carbon credit verification. The design system must feel simultaneously organic and mathematically precise — a living tool that earns trust through openness, not promises. Every pixel serves the chain of evidence: from the farmer's muddy-hands photo to the sponsor's offset dashboard.

The visual language is a deliberate hybrid of three depth systems. **Claymorphism** gives primary actions a tactile, squishy warmth — buttons feel like something you could press with a wet thumb in a rice paddy. **Neumorphism** provides structural depth for data containers and input fields, creating a sense of physical organization. **Glassmorphism** floats premium overlays and navigation above the content, signaling modernity and sophistication for admin and sponsor audiences.

The system is bilingual (Thai primary, English secondary) and optimized for extreme conditions: bright outdoor sun, one-handed mobile use, elderly users, and intermittent connectivity. Every interactive element meets a 44px minimum touch target. The 1.6 line-height for body text is not a suggestion — it is a readability requirement for Thai script.

**Key Characteristics:**
- **Tactile and organic** — depth effects create a sense of physical presence; UI elements feel touchable
- **Evidence-first** — every visual decision serves the verification chain; decoration never obscures data
- **Bilingual-ready** — Inter for Latin, Sarabun for Thai; the system degrades gracefully when either is unavailable
- **Field-tough** — 44px touch targets, high-contrast text, generous spacing for outdoor mobile use
- **Three-audience calibration** — farmer warmth, admin authority, sponsor confidence — all from one token set

## Colors

The palette is rooted in the lush greenery of Thai rice fields, anchored by the familiar LINE Green (#06C755) to build immediate trust with the local user base. The system uses Material Design 3 surface-container roles for neutral layering.

### Primary
- **Rice Field Deep Green** (#006e2b): The institutional green — used for active sidebar items, status indicators, and the eco-avatar icon. Serious and trustworthy.
- **LINE Green** (#06c755): The signature accent — primary CTAs, verified badges, active bottom-nav icons. Instantly recognizable to LINE users. Used on ≤15% of any screen; its rarity signals importance.
- **LINE Green Dark** (#00a854): The gradient endpoint for claymorphic buttons. Never used standalone.
- **Mint Glow** (#69ff89): Primary fixed color for inverse/surface-tint contexts. Avoid on light backgrounds.
- **Mint Soft** (#3ee26c): Primary fixed-dim. Used in dark-mode inverse contexts only.

### Secondary
- **Slate Lavender** (#5d5c74): A muted purple-gray for secondary typography and subtle labels. Provides cool contrast to the warm greens without competing.
- **Soft Violet** (#e2e0fc): Secondary container — chip backgrounds, subtle tag fills. Gentle and receding.
- **Deep Violet** (#636274): Secondary on-container text. High legibility on soft violet.

### Tertiary
- **Harvest Orange** (#ab3500): A warm, earthy accent for sponsor actions and critical notifications. Used sparingly — ≤5% of any screen. Its warmth provides a sun-like contrast to the greens.
- **Sunset Coral** (#ff8e67): Tertiary container — alert backgrounds, highlight fills.
- **Warm Cream** (#ffdbd0): Tertiary fixed — very light warmth for backgrounds in dark contexts.

### Neutral
- **Charcoal** (#171c1f): Primary text on light surfaces. Near-black with a cool undertone.
- **Dark Navy** (#1a1a2e): The sidebar background — authoritative and deep. The darkest element in the system.
- **Slate** (#2c3134): Inverse surface — used for dark-mode or overlay text backgrounds.
- **Fog** (#3c4a3c): Secondary text, body copy on surfaces. Muted green-gray.
- **Muted Teal** (#6c7b6b): Outlines, borders, dividers. Subtle and organic.
- **Moss** (#bbcbb8): Outline variant — lighter borders, disabled states. Named for its organic green cast.
- **Sky Blue** (#f6fafe): The default surface — barely-there blue tint. Clean and airy.
- **Cloud Gray** (#f0f4f8): The canonical background — the neumorphic base. All depth effects reference this.
- **Frost White** (#ffffff): Surface container lowest — cards, panels, elevated content.
- **Mist** (#eaeef2): Surface container — subtle layering between background and content.
- **Steel** (#e4e9ed): Surface container high — pressed states, inset areas.
- **Graphite** (#dfe3e7): Surface container highest — the most prominent neutral surface.

### Semantic
- **Berry Red** (#ba1a1a): Error, rejected, destructive actions.
- **Soft Blush** (#ffdad6): Error container — error backgrounds, soft alerts.
- **Deep Rust** (#93000a): Error on-container text.
- **Golden Amber** (#f9c74f): Pending, flagged, caution states. Warm and attention-getting without alarming.
- **Muted Rose** (#f94144): Rejected badge background (legacy; prefer Berry Red in new work).

### Named Rules

**The LINE Green Rule.** LINE Green (#06c755) is the signature accent. It appears on primary CTAs, verified badges, and active nav icons — never on backgrounds, body text, or decorative fills. Its scarcity is the point.

**The Cloud Gray Foundation Rule.** The background is always Cloud Gray (#f0f4f8). Never Sky Blue, never white. The entire neumorphic shadow system assumes this exact base; changing it breaks depth perception.

**The Dark Navy Isolation Rule.** Dark Navy (#1a1a2e) is used exclusively for the dashboard sidebar and nowhere else. It creates a clear boundary between the authoritative admin space and the farmer-facing surfaces.

## Typography

**Display Font:** Inter (Latin) with Sarabun (Thai) fallback, system-ui stack
**Body Font:** Inter (Latin) with Sarabun (Thai) fallback, system-ui stack
**Icons:** Material Symbols Outlined (loaded via Google Fonts)

**Character:** Clean, systematic, and highly legible. Inter was chosen for its excellent Thai-script metrics when paired with Sarabun. The type system is deliberately restrained — one family, one weight scale — because the data density of admin dashboards and the bilingual requirements demand clarity over personality.

### Hierarchy
- **Display** (700, 48px, 1.2): Sponsor dashboard hero numbers — CO₂ tons, plot counts. The largest text in the system; used on KPI cards only.
- **Headline LG** (700, 32px, 1.3): Page titles, section headers. Desktop primary heading.
- **Headline MD** (600, 24px, 1.4): Card titles, sidebar brand name, subsection headers.
- **Headline LG Mobile** (700, 28px, 1.3): Mobile page titles — scales down display-lg to fit viewport.
- **Body LG** (400, 18px, 1.6): Primary reading text for longer content. Used sparingly.
- **Body MD** (400, 16px, 1.6): Default body text — chat messages, descriptions, form text. The workhorse.
- **Label MD** (500, 14px, 1.2, 0.05em tracking): Labels, badges, metadata, timestamps. Slightly tighter line-height and added tracking for legibility at small sizes.

### Named Rules

**The 1.6 Rule.** All body text uses 1.6 line-height. This is non-negotiable — Thai script with combining vowels and tone marks requires the extra vertical space. Never reduce below 1.5 for any text block.

**The One Family Rule.** The system uses one type family (Inter/Sarabun) across all roles. No display fonts, no monospace, no accent typefaces. The visual personality comes from depth and color, not typography.

## Layout

**Grid:** 12-column fluid grid for desktop, single-column stack for mobile. The dashboard surfaces use a fixed 288px sidebar (desktop only) with fluid content area.

**Container margins:** 20px on mobile, 24px on tablet, 40px+ on desktop. Generous margins prevent the UI from feeling cramped — essential for the "Calm Tech" approach.

**Spacing rhythm:** 8px baseline grid. All vertical and horizontal spacing uses multiples of 8px (4px for tight gaps). The system does not use a 4px sub-grid; 8px is the atomic unit.

**Responsive breakpoints:**
- Mobile: < 768px — single column, bottom nav, full-width cards
- Tablet: 768–1023px — two-column grid, bottom nav
- Desktop: ≥ 1024px — sidebar navigation, three-column grid for dashboards

**Dashboard layout:** The admin and sponsor dashboards use a fixed 288px dark sidebar on the left (desktop), a sticky glassmorphic header at the top, and a fluid content area with 24px padding. On mobile, the sidebar collapses to a bottom nav.

### Named Rules

**The Thumb Zone Rule.** On mobile, primary actions (upload, send, confirm) sit within the bottom 200px of the viewport — the natural thumb reach. Secondary actions may sit higher; never the primary CTA.

**The 288px Sidebar Rule.** Desktop dashboards always show the 288px sidebar. It is fixed-position, never collapsible in the current implementation. The content area offsets via `padding-left: 288px`.

## Elevation & Depth

The system uses a three-layer depth vocabulary, each layer serving a distinct purpose:

1. **Level 0 — The Ground:** Cloud Gray (#f0f4f8) background. Flat, uniform, the canvas everything else rises from.
2. **Level 1 — Neumorphic Structure:** Soft-raised cards and input wells. Two shadows create the illusion of physical depth — a light shadow pushing up-left, a dark shadow pushing down-right.
3. **Level 2 — Claymorphic Actions:** Primary buttons and status indicators. Inner glow, gradient backgrounds, and subtle transform on hover create a "squishy" tactile feel.
4. **Level 3 — Glassmorphic Overlays:** Navigation bars, modals, and floating panels. Backdrop-blur with semi-transparent white fill simulates frosted glass.

### Shadow Vocabulary
- **Neumorphic raised** (`box-shadow: 5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff`): Cards, containers, elevated content panels. The signature shadow of the system.
- **Neumorphic inset** (`box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff`): Input fields, text areas, data entry wells. Creates a "pressed" trough.
- **Claymorphic** (`box-shadow: 4px 4px 10px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.5)`): Primary buttons, active nav icons, status badges. The inner white glow is the signature detail.
- **Glassmorphic** (`box-shadow: 0 8px 32px rgba(0,0,0,0.08)`): Navigation bars, modals, floating panels. Paired with `backdrop-filter: blur(20px)` and `background: rgba(255,255,255,0.6)`.
- **Card hover** (`box-shadow: 6px 6px 14px rgba(0,0,0,0.18), -3px -3px 8px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.5)`): Enhanced claymorphic on hover — slightly deeper, slightly more dramatic.

### Named Rules

**The Ground Rule.** The background is always Cloud Gray (#f0f4f8). The neumorphic shadow pair (#d1d9e6 dark, #ffffff light) assumes this exact base. Never change the background without recalculating the shadows.

**The Layer Integrity Rule.** Each depth layer has a purpose: structure (neumorphic), action (claymorphic), overlay (glassmorphic). Never mix — a card is neumorphic, a button is claymorphic, a nav is glassmorphic. A claymorphic card or a neumorphic button breaks the system's physical logic.

## Shapes

The form language is **distinctly organic** — no sharp corners anywhere in the system. This reinforces the "living tool" personality and keeps the interface approachable for elderly farmers.

- **Buttons and inputs:** Extra-large radius (1.5rem / 24px, `rounded-xl`). Pill-like, tactile.
- **Cards and containers:** Large radius (1rem / 16px, `rounded-lg`). Soft, substantial.
- **Small elements (badges, chips):** Full pill shape (9999px, `rounded-full`). Emphasizes their status as labels, not containers.
- **Base elements (sidebar, header):** Zero radius — hard edges against the content area. The sidebar's sharp left edge anchors it as a structural element, not a floating card.

### Named Rules

**The No Sharp Corners Rule.** Every interactive or content-bearing element in the farmer-facing surfaces uses at least 8px radius. The only exceptions are structural elements (sidebar, header) that intentionally contrast with the organic content.

**The Pill Badge Rule.** Status badges and chips are always pill-shaped (full radius). Their elongated form signals "label" rather than "button," preventing accidental taps.

## Components

### Buttons

Tactile, claymorphic primary actions. The system defines four variants.

- **Shape:** Extra-large radius (1.5rem / 24px, `rounded-xl`)
- **Primary:** Claymorphic gradient (LINE Green → LINE Green Dark), white text, inner white glow. Minimum 48px height. The `claymorphic` utility class applies the gradient, shadows, and hover lift (`translateY(-1px)`).
- **Secondary:** Neumorphic raised surface, charcoal text. Subtle shadow, hover intensifies shadow. Minimum 44px height.
- **Ghost:** Transparent background, muted teal text, hover shows surface-container-low fill. Minimum 44px height.
- **Danger:** Red gradient (#EF5350 → Berry Red), white text, inner glow matching claymorphic pattern. Reserved for destructive confirmations.
- **Loading state:** Spinner icon replaces leading content; button is disabled with 50% opacity.

### Inputs / Fields

Neumorphic inset wells for data entry.

- **Style:** Inset shadow creates a "trough" effect. Cloud Gray background with rounded-xl corners.
- **Label:** Label MD weight, muted teal text, sits above the field with 4px gap.
- **Focus:** Ring-2 in LINE Green (`focus:ring-primary-container`). Clean, no glow animation.
- **Error:** Ring-2 in Berry Red. Error text below in label-md, Berry Red color. Uses `role="alert"` for screen readers.
- **Minimum height:** 44px (touch-target class).

### Cards / Containers

Neumorphic raised surfaces for content grouping.

- **Corner Style:** Large radius (1rem / 16px, `rounded-lg`)
- **Background:** Frost White (#ffffff)
- **Shadow Strategy:** Neumorphic raised pair. On hover, cards with the review pattern get enhanced claymorphic shadow and `translateY(-2px)` lift.
- **Border:** None — the shadow provides all depth definition.
- **Internal Padding:** 16px default, 24px for dashboard KPI cards.

### Chips / Quick Actions

Pill-shaped, state-aware action chips in the chat interface.

- **Style:** Surface-container-highest background, muted teal text, full pill radius. Hover transitions to primary-container fill with primary-container text.
- **Active/pressed:** `scale(95)` for tactile feedback.
- **Minimum height:** 36px (smaller than buttons to fit the horizontal scroll strip).

### Chat Bubbles

The signature component — distinguishes user messages from bot responses.

- **User messages:** Claymorphic background (LINE Green gradient), white text, bottom-right radius reduced (`rounded-br-sm`) for the speech tail. Aligned right.
- **Bot messages:** Neumorphic surface (surface-container-lowest at 80% opacity + backdrop-blur), charcoal text, bottom-left radius reduced (`rounded-bl-sm`). Aligned left with eco-avatar icon. Glass border overlay for the premium feel.
- **Timestamp:** 11px, 60% opacity, positioned at bottom of bubble.

### Navigation — Bottom (Mobile)

Glassmorphic bottom bar for farmer-facing surfaces.

- **Style:** Glass utility (`backdrop-blur(20px)`, white 60% opacity, white/20 border-top). Sticky to bottom.
- **Items:** Material icon + 10px label. Active item gets claymorphic treatment (green gradient, white text, `scale-1.10`). Inactive items are muted teal.
- **Spacing:** Even distribution with `justify-around`. 56px × 56px tap targets per item.

### Navigation — Sidebar (Desktop)

Dark navy sidebar for admin/sponsor dashboards.

- **Style:** Fixed left, 288px wide, Dark Navy background. Hidden below 1024px.
- **Brand:** Eco icon in primary green circle + bold headline-md brand name.
- **Items:** Material icon + label. Active item gets primary-container background with bold text. Inactive items are surface-container-highest text with hover white/10 background.
- **User chip:** Bottom section with person avatar, name, and email. Separated by 5% white border-top.

### Dashboard Header

Glassmorphic sticky header for admin/sponsor surfaces.

- **Style:** Surface/60 opacity + backdrop-blur-xl. Fixed top, full width, 80px height. Subtle bottom border (surface-container-highest/30).
- **Left:** Search icon + transparent text input.
- **Right:** Notification, settings, and logout icon buttons (40px round). User avatar + name.

### Status Badges

Pill-shaped indicators for evidence verification state.

- **Verified:** Primary green gradient, white text, pill-shaped.
- **Pending / Flagged:** Golden Amber background (#f9c74f), dark text.
- **Rejected:** Berry Red background or soft-blush container, depending on context.
- **AI Status:** Glassmorphic overlay on review cards — small dot (green for pass, red for flag) + 12px label.

### KPI Cards (Sponsor Dashboard)

Large neumorphic cards for impact metrics.

- **Shape:** Large radius (1rem), neumorphic raised shadow, Frost White background.
- **Layout:** Icon badge top-right, title below, large display-lg value at bottom.
- **Color coding:** Primary (green), secondary (slate-lavender), or tertiary (orange) palette — selected per metric.
- **Hover:** Subtle `translateY(-1px)` lift with enhanced shadow.
- **Glow:** Blurred color circle (32×32, positioned -8px top-right) for ambient color bleed.

### Review Cards (Admin Dashboard)

Photo evidence cards in the review grid.

- **Shape:** Large radius (1rem), square aspect ratio (1:1), overflow-hidden.
- **Content:** Full-bleed photo, gradient overlay at bottom for farm labels.
- **AI Badge:** Top-left, glassmorphic overlay with color dot + label.
- **Admin Badge:** Top-right, stacked vertically when multiple (audit sample, verified, rejected).
- **Hover:** `translateY(-2px)` lift with enhanced shadow (`shadow-xl`).
- **Selected state:** 2px primary outline with 4px offset + primary/20 ring.

## Do's and Don'ts

### Do:
- **Do** use the `claymorphic`, `neumorphic`, `neumorphic-inset`, and `glass` utility classes for depth effects. They encode the exact shadow values; hand-writing shadows drifts.
- **Do** maintain 44px minimum touch targets on all interactive elements. The `touch-target` class enforces this.
- **Do** use LINE Green (#06c755) only on primary CTAs and verified indicators. Its scarcity is its power.
- **Do** pair Inter with Sarabun for any text containing Thai characters. The layout.tsx already loads both via Google Fonts.
- **Do** use the Material Symbols Outlined icon font. It is loaded in layout.tsx. Never import Lucide, Heroicons, or SVG icon libraries.
- **Do** keep body text at 1.6 line-height. Thai script readability depends on it.
- **Do** use Cloud Gray (#f0f4f8) as the background. The neumorphic shadows are calibrated to this exact value.

### Don't:
- **Don't** use sharp corners (< 4px radius) on any farmer-facing element. The organic shape language is a brand commitment.
- **Don't** place Dark Navy (#1a1a2e) outside the dashboard sidebar. It is a structural accent, not a general-purpose dark color.
- **Don't** use the `ml-72` or `left-72` Tailwind classes for sidebar offset. They are invalid in Tailwind v4. Use the `dashboard-main` and `dashboard-header` CSS classes with their `@media (min-width: 1024px)` rules.
- **Don't** load fonts via `next/font/google`. It breaks the Next.js 16.3 static export. Use the Google Fonts `<link>` tags in layout.tsx.
- **Don't** apply the glassmorphic treatment to cards or buttons. Glass is reserved for navigation and overlays only.
- **Don't** use Berry Red (#ba1a1a) for anything other than errors, destructive actions, and rejected states. It is a semantic color, not an accent.
- **Don't** reduce line-height below 1.5 for any text containing Thai characters. Combining vowels and tone marks need the vertical space.
