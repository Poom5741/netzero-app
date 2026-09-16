# Quickstart: Visual Parity Validation Guide

**Feature**: 006-match-dashboard-shell-login
**Date**: 2026-09-15

## Overview

This guide provides step-by-step instructions for validating visual parity of Admin and Sponsor login pages and dashboard shells against reference captures from spec 005.

## Prerequisites

1. **Spec 005 Complete**: Reference captures must be available in `visual-qa-screenshots/` or as specified by spec 005
2. **Issue #142 Inventory**: Complete list of screens, states, and viewports
3. **Development Environment**: `npm run dev:all` running (backend on :8787, frontend on :3000)
4. **Browser**: Chrome or Firefox with developer tools
5. **Browser-Use**: For automated visual comparison (optional but recommended)

## Validation Workflow

### Step 1: Start Development Server

```bash
npm run dev:all
```

This starts:
- Backend API on `http://localhost:8787`
- Frontend on `http://localhost:3000`

### Step 2: Validate Admin Login Page

1. Navigate to `http://localhost:3000/admin/login`
2. Set viewport to 1280x720
3. Compare against reference capture:
   - **Left Panel**: NetZeroCarbon logo, Thai title, purpose, methodology reference
   - **Right Panel**: Email, password, submit button (OTP/remember-device hidden)
4. Measure dimensions:
   - Branding panel width: ~45% of viewport
   - Form panel width: ~55% of viewport
   - Form max-width: 420px
   - Button height: 44px
   - Form field height: 44px
5. Check colors:
   - Left panel gradient: `--gradient-deep` (navy to teal)
   - Right panel background: white
   - Button color: `--color-primary` (teal)
6. Check Thai font rendering:
   - No clipping or overflow
   - Correct line height
7. Repeat at 1440x900 viewport

### Step 3: Validate Sponsor Login Page

1. Navigate to `http://localhost:3000/sponsor/login`
2. Set viewport to 1280x720
3. Compare against reference capture:
   - **Left Panel**: "Sponsor Portal" eyebrow, NetZeroCarbon logo, area title, scoped-access explanation
   - **Right Panel**: Email, password, audit notice, submit button
4. Measure dimensions (same as Admin login)
5. Check colors and Thai font rendering
6. Repeat at 1440x900 viewport

### Step 4: Validate Admin Dashboard Shell

1. Log in to Admin Console (use test credentials if available)
2. Navigate to each primary screen:
   - ภาพรวม (Overview)
   - ตรวจสอบใบสมัคร (Applications)
   - ตรวจสอบภาพ (Evidence Review)
   - เกษตรกร (Farmers)
   - ผู้สนับสนุน (Sponsors)
   - รายงาน (Reports)
   - ตั้งค่า (Settings)
3. For each screen:
   - **Sidebar**: 260px width, 7 navigation items with correct icons
   - **Header**: 64px height, page title, user menu
   - **Content Area**: Correct card styles, table layouts, spacing
   - **Active State**: Current navigation item highlighted
4. Check Thai font rendering in sidebar and header
5. Test hover states on navigation items
6. Repeat at 1440x900 viewport

### Step 5: Validate Sponsor Dashboard Shell

1. Log in to Sponsor Portal (use test credentials if available)
2. Navigate to each primary screen:
   - ภาพรวม (Overview)
   - พื้นที่ (Areas)
   - รายงานและใบรับรอง (Reports & Certificates)
3. For each screen:
   - **Sidebar**: 260px width, 3 navigation items with correct icons
   - **Header**: 64px height, page title, user menu
   - **Content Area**: Correct card styles, table layouts, spacing
4. Verify sponsor data scoping (CPA-code masking)
5. Repeat at 1440x900 viewport

### Step 6: Validate LIFF Destinations

1. Open each LIFF destination at 390x844 viewport:
   - `/registration` (LF-01)
   - `/documents` (LF-02)
   - `/camera` (LF-03)
   - `/calendar` (LF-04)
   - `/summary` (LF-05)
   - `/fields` (LF-06)
   - `/contact` (LF-07)
2. For each destination:
   - Verify page loads without errors
   - Check Thai font rendering
   - Verify layout integrity (no horizontal scroll, no clipped content)
   - Test all interactive elements
3. Repeat at 360x844 and 430x844 viewports

### Step 7: Validate Error/Loading/Empty States

1. **Error State**: Enter incorrect credentials on login page
   - Verify error message styling matches design system
   - Check Thai text rendering
2. **Loading State**: Simulate slow network (Chrome DevTools → Network → Slow 3G)
   - Verify loading skeletons display correctly
   - Check dimensions and spacing
3. **Empty State**: Navigate to a queue with no items
   - Verify empty-state message styling
   - Check Thai text rendering

### Step 8: Validate Zoom Usability

1. Set browser zoom to 125%
2. Navigate all dashboard pages
3. Verify no horizontal scroll or clipped content
4. Repeat at 150% zoom

### Step 9: Generate Visual Comparison Evidence

For each screen and state:

1. Capture screenshot at target viewport
2. Compare against reference capture from spec 005
3. Generate overlay/diff image (if tooling available)
4. Document:
   - Viewport/DPR
   - Fixture ID (if using deterministic data)
   - Remaining discrepancies (if any)
   - Pass/fail status

### Step 10: Run Test Suite

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Visual tests (if configured)
npm run test:visual
```

All tests must pass.

## Acceptance Criteria

- [ ] Admin login page matches reference capture at 1280x720 and 1440x900
- [ ] Sponsor login page matches reference capture at 1280x720 and 1440x900
- [ ] Admin dashboard shell matches reference capture for all 7 navigation items
- [ ] Sponsor dashboard shell matches reference capture for all 3 navigation items
- [ ] All 7 LIFF destinations function correctly at 390x844, 360x844, 430x844
- [ ] Error/loading/empty states render correctly
- [ ] Zoom usability at 125% and 150% verified
- [ ] Visual comparison evidence generated for all screens/states in #142 inventory
- [ ] All tests pass (unit, e2e, visual)
- [ ] Thai text renders correctly without clipping or overflow

## Troubleshooting

### Thai Font Not Rendering

- Check that Google Fonts `<link>` is present in `layout.tsx`
- Verify font family includes "Sarabun" or Thai-capable fallback
- Clear browser cache and reload

### Material Symbols Not Displaying

- Check that Material Symbols `<link>` is present in `layout.tsx`
- Verify icon names are correct (use Material Symbols search)
- Clear browser cache and reload

### Layout Broken at Specific Viewport

- Check CSS media queries for responsive breakpoints
- Verify sidebar collapse logic (viewport < 1280px)
- Test with browser DevTools device emulation

### Visual Comparison Shows Mismatch

- Verify reference capture is from spec 005 (not stale)
- Check viewport size and DPR match exactly
- Verify font loading and rendering
- Check for browser-specific rendering differences
- Use per-region tolerance from spec 005, not flat ±2px

## Resources

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/feature-flags.md](./contracts/feature-flags.md)
- **REQUIREMENTS.md**: [../../REQUIREMENTS.md](../../REQUIREMENTS.md)
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
