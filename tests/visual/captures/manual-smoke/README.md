# Manual Browser Smoke Test — Claude Design Parity

**Date**: 2026-09-17
**Feature**: specs/010-claude-design-parity

## Method

Manual browser smoke test using browser-use MCP (Playwright under the hood). Steps exercised:

1. `/admin/login` at 1280×720
2. `/admin/login` at 390×844
3. `/sponsor/login` at 1280×720
4. `/admin` dashboard at 1280×720 (after session-storage auth bypass)
5. `/admin` dashboard at 390×844 (regression check)
6. `/sponsor` dashboard at 1280×720
7. `/sponsor` dashboard at 390×844

## Findings discovered and resolved during smoke

### F-SMOKE-1 — Fira Sans / Noto Sans Thai font stack not active in production

- **Symptom**: After updating `globals.css --font-sans` to `Fira Sans/Noto Sans Thai/Fira Mono`, body and headings still rendered as `"Plus Jakarta Sans", Sarabun` in the browser.
- **Root cause**: `frontend/src/app/layout.tsx` had hardcoded Google Fonts `<link>` for `Plus Jakarta Sans + Sarabun` and an inline `style={{ fontFamily: '"Plus Jakarta Sans", Sarabun, system-ui, sans-serif' }}` that overrode `globals.css`.
- **Fix**: Updated `layout.tsx` to load `Fira Sans + Noto Sans Thai + Fira Mono + Material Symbols Outlined` and to use `"Fira Sans", "Noto Sans Thai", "Fira Mono", system-ui, sans-serif` as the body font.
- **Resolved**: Confirmed in browser: `bodyFont` and `h1Font` both report the Claude source font stack on `/admin`, `/sponsor`, and login pages.

### F-SMOKE-2 — Mobile horizontal scroll on `/admin` after 232px sidebar reduction

- **Symptom**: At 390×844, `document.documentElement.scrollWidth` was 404 with `viewportW=390`, producing unwanted horizontal scroll on the dashboard. `main` had `paddingLeft=232px` even though `aside` collapsed to 72px on mobile.
- **Root cause**: `dashboard-shell.tsx` had `style={{ paddingLeft: 'var(--sidebar-width, 232px)' }}` on `<main>`, which applied 232px regardless of viewport, even though Tailwind's `lg:pl-[232px]` was correctly responsive.
- **Fix**: Removed the unconditional inline `paddingLeft` and added `pl-4` (16px) for mobile. The Tailwind responsive class `lg:pl-[232px]` still applies the Claude-source 232px gutter at ≥1024px.
- **Resolved**: Re-checked at 390×844: `scrollWidth=390`, `hasHorizontalScroll=false`, `mainPaddingLeft=16px`. Re-checked at 1280×720: `asideWidth=232`, `mainPaddingLeft=232px`, no horizontal scroll.

### F-SMOKE-3 — Stale `260px` in `.dashboard-main` and `.dashboard-header` CSS media queries

- **Symptom**: On `/sponsor`, `/sponsor/areas`, `/sponsor/reports` (the pages that use `<div className="dashboard-main">` instead of `<DashboardShell>`), at ≥1024px the content area was offset by `260px` even though the sidebar is now 232px. The 28px gap was visible as dead space on the right edge of the sidebar.
- **Root cause**: `frontend/src/app/globals.css` had hardcoded `padding-left: 260px` and `left: 260px` in `@media (min-width: 1024px)` for `.dashboard-main` and `.dashboard-header`. The third sponsor page that does NOT use DashboardShell rendered with this stale offset.
- **Fix**: Updated `globals.css` to use `232px` for both CSS classes at the `lg` breakpoint. Also documented for future maintainers that all three sponsor pages + the Admin layout must agree on the same sidebar width.
- **Resolved**: Re-checked `/sponsor`, `/sponsor/areas`, `/sponsor/reports` at 1280×720: sidebar 232px, no dead space. Re-checked at 390×844: `mainPaddingLeft=16px`, no horizontal scroll.

## Final smoke results (after all fixes)

| Surface | Route | Viewport | Sidebar | Nav offset | Font stack | Horz scroll | Result |
|---|---|---|---|---|---|---|---|
| Admin | /admin/login | 1280×720 | n/a split | n/a | Fira Sans/Noto Sans Thai | no | PASS |
| Admin | /admin/login | 390×844 | n/a split | n/a | Fira Sans/Noto Sans Thai | no | PASS |
| Sponsor | /sponsor/login | 1280×720 | n/a split | n/a | Fira Sans/Noto Sans Thai | no | PASS |
| Admin | /admin | 1280×720 | 232px navy `#061E5C` | 232px | Fira Sans/Noto Sans Thai | no | PASS |
| Admin | /admin | 390×844 | 72px collapsed | 16px (pl-4) | Fira Sans/Noto Sans Thai | no | PASS |
| Sponsor | /sponsor | 1280×720 | 232px navy `#061E5C` | 232px | Fira Sans/Noto Sans Thai | no | PASS |
| Sponsor | /sponsor | 390×844 | 72px collapsed | 16px (pl-4) | Fira Sans/Noto Sans Thai | no | PASS |
| Sponsor | /sponsor/areas | 390×844 | 72px collapsed | 16px (CSS) | Fira Sans/Noto Sans Thai | no | PASS |
| Sponsor | /sponsor/reports | 390×844 | 72px collapsed | 16px (CSS) | Fira Sans/Noto Sans Thai | no | PASS |
| Admin | /admin/applications | 390×844 | 72px collapsed | 16px (pl-4) | Fira Sans/Noto Sans Thai | no | PASS |

All ten scenarios pass.

## Screenshot inventory

| File | Surface | Viewport | Notes |
|---|---|---|---|
| `qaa-admin-1280-final.png` | Admin | 1280×720 | Final state after both fixes |
| `qaa-admin-1280-fixed.png` | Admin | 1280×720 | After F-SMOKE-1 (font) fix |
| `qaa-admin-1280.png` | Admin | 1280×720 | Initial smoke before fixes |
| `qaa-admin-390-horizontal-scroll.png` | Admin | 390×844 | Captured F-SMOKE-2 (mobile horizontal scroll) regression |
| `qaa-sponsor-1280-final.png` | Sponsor | 1280×720 | Final sponsor state |
