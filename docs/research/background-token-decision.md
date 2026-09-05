# Background Token Decision

**Date:** 2026-08-28
**Status:** Research findings
**Ticket:** Conflicting `background` color values between DESIGN.md and reference HTML prototypes

---

## 1. DESIGN.md Specification

DESIGN.md contains an **internal conflict**:

| Location | Value | Context |
|----------|-------|---------|
| Frontmatter line 48 | `#f6fafe` | `background: '#f6fafe'` (token definition) |
| Prose line 124 | `#F0F4F8` | "Background: A soft gray-blue (#F0F4F8) that serves as the base for neumorphic shadows" |
| Elevation line 146 | `#F0F4F8` | "Level 0 (Base): The #F0F4F8 background." |

**Rationale given in prose (line 124):** The color "serves as the base for neumorphic shadows, allowing white surfaces to pop with subtle depth."

---

## 2. Reference HTML Files — Tailwind Config Values

All 5 HTML files share an identical Tailwind config block. The relevant tokens:

| Token | Value |
|-------|-------|
| `background` | `#f6fafe` |
| `surface` | `#f6fafe` |
| `surface-container-low` | `#f0f4f8` |
| `surface-container-lowest` | `#ffffff` |

### Actual Usage Per File

| File | `<main>` background class | Resolved color | Notes |
|------|--------------------------|----------------|-------|
| `admin_review_dashboard/code.html` | `bg-surface` | `#f6fafe` | Desktop layout |
| `sponsor_dashboard/code.html` | `bg-surface` | `#f6fafe` | Desktop layout |
| `liff_chat_interface/code.html` | `bg-surface-container-low` | `#f0f4f8` | Mobile layout + CSS override `body { background-color: #f0f4f8 }` |
| `photo_upload/code.html` | `bg-surface-container-low` | `#f0f4f8` | Mobile layout + CSS override `body { background-color: #f0f4f8 }` |
| `season_summary_form/code.html` | `bg-surface-container-low` | `#f0f4f8` | Mobile layout + CSS override `body { background-color: #f0f4f8 }` |

**Pattern:** Desktop prototypes use `#f6fafe` (matching the frontmatter token). Mobile prototypes use `#f0f4f8` (matching the prose description) via both a CSS override on `body` and `bg-surface-container-low` on `<main>`.

---

## 3. Neumorphic Shadow Contrast Analysis

The neumorphic shadow pair defined in DESIGN.md (line 147):
- **Dark shadow:** `#D1D9E6` (RGB 209, 217, 230)
- **Light shadow:** `#FFFFFF` (RGB 255, 255, 255)
- **Ideal midpoint:** ~`#E8ECF2` (RGB 232, 236, 242)

### Contrast with each candidate background

| Metric | `#f6fafe` (RGB 246, 250, 254) | `#f0f4f8` (RGB 240, 244, 248) |
|--------|-------------------------------|-------------------------------|
| Distance from ideal midpoint | ~22.9 | ~12.6 |
| Delta vs dark shadow `#D1D9E6` | (37, 33, 24) — moderate | (31, 27, 18) — moderate |
| Delta vs light shadow `#FFFFFF` | (9, 5, 1) — **very low** | (15, 11, 7) — low but visible |
| Neumorphic viability | Light shadow nearly invisible against background | Both shadows distinguishable |

**Conclusion:** `#f0f4f8` produces mathematically correct neumorphic contrast. With `#f6fafe`, the light shadow (`#FFFFFF`) is only 1–9 channel units away from the background, making the raised effect nearly imperceptible. The prose rationale ("allowing white surfaces to pop with subtle depth") is better served by `#f0f4f8`.

---

## 4. Screenshot Visual Assessment

| Screenshot | Observed background | Assessment |
|------------|-------------------|------------|
| `admin_review_dashboard/screen.png` | Very light blue-gray, near-white | Visually closer to `#f6fafe` |
| `sponsor_dashboard/screen.png` | Very light blue-gray, near-white | Visually closer to `#f6fafe` |

The screenshots appear to have been rendered from the desktop HTML prototypes (which use `#f6fafe`). The cards (white, `#ffffff`) do pop against the background, but the neumorphic shadow detail is subtle — consistent with the poor light-shadow contrast of `#f6fafe`.

---

## 5. Recommendation

**Canonical value: `#f0f4f8`**

Evidence:
1. The prose rationale in DESIGN.md explicitly names `#F0F4F8` and explains its purpose as a neumorphic base.
2. The elevation section (Level 0) explicitly names `#F0F4F8`.
3. Neumorphic shadow math requires a background closer to the midpoint of `#D1D9E6` and `#FFFFFF` — `#f0f4f8` is ~2x closer to ideal than `#f6fafe`.
4. All 3 mobile prototypes (the primary farmer-facing surfaces) already use `#f0f4f8` in practice.

The frontmatter value `#f6fafe` appears to be a copy-paste error from the `surface` / `surface-bright` tokens, which are correctly `#f6fafe` (a lighter tint used for elevated surfaces, not the base background).

**Suggested fix:** Update DESIGN.md frontmatter line 48 from `background: '#f6fafe'` to `background: '#f0f4f8'`, and update the 5 HTML Tailwind configs' `"background"` entry to `"#f0f4f8"`.

---

## 6. Secondary Inconsistencies Found

### 6.1 `surface` vs `background` token collision

In all 5 HTML Tailwind configs, both `surface` and `background` map to `#f6fafe`. In DESIGN.md frontmatter, `surface: '#f6fafe'` and `background: '#f6fafe'` are also identical. This makes the two tokens interchangeable, which defeats the purpose of having distinct tokens. The prose implies `surface` should be a lighter/elevated variant while `background` is the base — but they resolve to the same value.

### 6.2 Mobile vs desktop background divergence

Mobile prototypes render with `#f0f4f8` (correct for neumorphism) while desktop prototypes render with `#f6fafe` (incorrect for neumorphism). Users on different form factors would see meaningfully different shadow behavior.

### 6.3 `borderRadius.DEFAULT` mismatch

DESIGN.md frontmatter defines `DEFAULT: 0.5rem` (line 90), but all 5 HTML Tailwind configs set `"DEFAULT": "0.25rem"`. The prose (line 154) says "Standard UI elements use 0.5rem (8px) radius," which matches the frontmatter, not the HTML configs.

### 6.4 `borderRadius.xl` mismatch

DESIGN.md frontmatter: `xl: 1.5rem` (line 93). All 5 HTML configs: `"xl": "0.75rem"`. The prose (line 155) says "Feature cards and primary containers use 1rem (16px)" — which matches neither value. The HTML configs use `0.75rem` (12px) while the frontmatter says `1.5rem` (24px).
