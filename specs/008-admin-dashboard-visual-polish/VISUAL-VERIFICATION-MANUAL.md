# Manual Visual Verification Guide

This document describes the manual visual verification steps that must be performed using browser-use or manual browser testing.

## Prerequisites

- Application running locally or deployed
- Browser with developer tools
- Reference image: `visual-qa-screenshots/design-admin-full.png`

## Verification Steps

### 1. Desktop Viewport (1280×800)

**Step 1.1: Evidence Review Page**

1. Navigate to `/admin/evidence`
2. Set viewport to 1280×800
3. Take screenshot: `visual-verification/desktop-evidence.png`
4. Verify against 10-region inventory:
   - [ ] Region 1: Sidebar (compact icons visible)
   - [ ] Region 2: Header (search, notifications, user chip)
   - [ ] Region 3: Queue heading ("รายการรอตรวจสอบ")
   - [ ] Region 4: Filter control (pill-shaped tabs)
   - [ ] Region 5: Photo grid (cards with hover lift)
   - [ ] Region 6: Selected card (outline + ring)
   - [ ] Region 7: Detail header (plot ID, status badge)
   - [ ] Region 8: Analysis panel (neumorphic inset shadow)
   - [ ] Region 9: Map section (coordinate overlay)
   - [ ] Region 10: Action area (claymorphic buttons)

**Step 1.2: Overview Page**

1. Navigate to `/admin`
2. Take screenshot: `visual-verification/desktop-overview.png`
3. Verify:
   - [ ] KPI tiles with elevated shadows
   - [ ] Credit chart with verified vs estimated distinction
   - [ ] Tables with hover highlighting
   - [ ] Consistent spacing and typography

### 2. Tablet Viewport (768×1024)

**Step 2.1: Sidebar Behavior**

1. Set viewport to 768×1024
2. Navigate to any admin page
3. Verify:
   - [ ] Sidebar shows compact icons only (72px width)
   - [ ] Hamburger menu visible in top-left
   - [ ] Clicking hamburger expands full sidebar
   - [ ] Clicking outside collapses sidebar

**Step 2.2: Photo Grid Reflow**

1. Navigate to `/admin/evidence`
2. Verify:
   - [ ] Photo grid reflows to 2 columns
   - [ ] Cards maintain aspect ratio
   - [ ] Detail panel becomes overlay on mobile

### 3. Interaction Verification

**Step 3.1: Hover States**

1. Hover over photo card
2. Verify:
   - [ ] Card lifts with shadow enhancement
   - [ ] Transition completes within 300ms

**Step 3.2: Focus States**

1. Tab through interactive elements
2. Verify:
   - [ ] Focus ring visible on all focusable elements
   - [ ] Focus ring uses primary color
   - [ ] Focus ring has 2px offset

**Step 3.3: Reduced Motion**

1. Enable "Reduce motion" in OS settings
2. Navigate to evidence page
3. Verify:
   - [ ] No animations or transitions
   - [ ] All content immediately visible

## Acceptance Criteria

- [ ] At least 8 of 10 regions match reference composition
- [ ] No more than 3 minor discrepancies (spacing, color shade, icon differences)
- [ ] All hover/focus states visible within 100ms
- [ ] All transitions complete within 300ms
- [ ] Overview page loads within 3 seconds

## Sign-off

- [ ] Visual verification completed by: _______________
- [ ] Date: _______________
- [ ] All acceptance criteria met: YES / NO
- [ ] Screenshots saved to `visual-verification/` directory
