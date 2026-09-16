# Research: Match Shared Tokens, Dashboard Shell and Login Presentation

**Feature**: 006-match-dashboard-shell-login
**Date**: 2026-09-15

## Research Task 1: Current Admin and Sponsor Login Page Implementations

### Findings

**Admin Login** (`frontend/src/app/admin/login/page.tsx`):
- Exists with split layout structure
- Uses `--gradient-deep` for left panel
- Contains email, password fields
- OTP and remember-device controls: **NOT YET IMPLEMENTED**
- Forgot-password link: **NOT YET IMPLEMENTED**

**Sponsor Login** (`frontend/src/app/sponsor/login/page.tsx`):
- Exists with split layout structure
- Uses similar gradient pattern
- Contains email, password fields
- OTP and remember-device controls: **NOT YET IMPLEMENTED**

### Decision

Both login pages exist but are missing OTP, remember-device, and forgot-password controls. These controls should be implemented as **conditional components** that render only when backend support is confirmed. For now, implement the UI structure but hide these controls behind a feature flag or configuration check.

### Alternatives Considered

1. **Implement controls unconditionally**: Rejected — violates FR-020 (nonfunctional controls must not be added without backend support)
2. **Skip controls entirely**: Rejected — violates AD-AUTH-02 and SP-AUTH-01 requirements
3. **Implement as disabled/placeholder**: Rejected — violates FR-020 (must not add nonfunctional controls)
4. **Conditional rendering with feature flag**: **CHOSEN** — satisfies FR-002, FR-004, FR-020

## Research Task 2: Existing Design Tokens in globals.css

### Findings

**Current Token Coverage** (`frontend/src/app/globals.css`):
- ✅ Colors: primary (teal), surface (white/gray), inverse (navy), error, LINE green
- ✅ Typography: font-sans (Plus Jakarta Sans + Sarabun fallback), text sizes
- ✅ Spacing: 4px-based scale (xs through 5xl)
- ✅ Border radius: xs through xl, full
- ✅ Shadows: xs through xl, accent
- ✅ Gradients: deep gradient for login panels

**Missing Tokens**:
- ❌ Explicit sidebar width token
- ❌ Header height token
- ❌ Navigation item height/spacing tokens
- ❌ Login panel width ratio token
- ❌ Button height/padding tokens
- ❌ Form field height/padding tokens

### Decision

Existing token system is comprehensive for colors, typography, spacing, and shadows. Add layout-specific tokens (sidebar width, header height, navigation dimensions) to ensure consistency across dashboard shells.

### Alternatives Considered

1. **Inline hardcoded values**: Rejected — violates design token consistency principle
2. **Separate token file**: Rejected — YAGNI, globals.css is sufficient for this scope
3. **Extend globals.css with layout tokens**: **CHOSEN** — minimal change, maintains single source of truth

## Research Task 3: Spec 005 Reference Capture Methodology

### Findings

**Spec 005 Approach** (from `specs/005-reference-captures-comparison/spec.md`):
- Uses per-region tolerance values derived from measured repeat-capture noise
- NOT a flat global threshold (e.g., ±2px)
- Tolerance varies by region (sidebar, header, content area may have different noise levels)
- Comparison tool measures pixel-level differences and generates overlay/diff images

### Decision

This spec (006) must use spec 005's per-region tolerance methodology, not a flat ±2px threshold. The spec has been updated to reference spec 005's FR-009 for tolerance values.

### Alternatives Considered

1. **Flat ±2px tolerance**: Rejected — conflicts with spec 005 methodology
2. **Subjective designer sign-off**: Rejected — unmeasurable, violates testability requirement
3. **Per-region tolerance from spec 005**: **CHOSEN** — consistent with dependency, measurable

## Research Task 4: Backend OTP/Remember-Device Support Status

### Findings

**Backend API** (`backend/src/index.ts`):
- No OTP endpoints found
- No remember-device endpoints found
- No password-reset endpoints found
- Authentication is currently email + password only

### Decision

Backend OTP/remember-device support is **NOT AVAILABLE**. Login forms must render only email, password, and submit button. OTP, remember-device, and forgot-password controls must be **hidden** from the UI. A separate functional blocker issue must be filed to track the missing backend functionality.

### Alternatives Considered

1. **Implement backend OTP support**: Out of scope for this visual parity spec
2. **Implement UI controls as disabled**: Rejected — violates FR-020
3. **Hide controls and file separate issue**: **CHOSEN** — satisfies FR-002, FR-004, FR-020

## Research Task 5: Issue #142 Inventory Manifest

### Findings

**Issue #142** (from GitHub):
- Title: "Design parity: execution map for LINE OA, Admin and Client Dashboard"
- Description: Provides an inventory of all screens, states, and viewports to be compared
- Inventory includes:
  - Admin login (populated, empty, error states)
  - Admin dashboard (overview, applications, evidence review, farmers, sponsors, reports, settings)
  - Sponsor login (populated, empty, error states)
  - Sponsor dashboard (overview, areas, reports)
  - LIFF destinations (registration, documents, camera, calendar, summary, fields, contact)
  - Viewports: 1280x720, 1440x900 (desktop); 390x844, 360x844, 430x844 (LIFF)

### Decision

The #142 inventory manifest provides the authoritative list of screens and states for visual comparison. SC-009 has been updated to reference this inventory explicitly. All screens and states in the inventory must have visual comparison evidence.

### Alternatives Considered

1. **Ad-hoc screen list**: Rejected — untestable, violates SC-009
2. **Reference #142 inventory**: **CHOSEN** — authoritative, testable

## Summary of Decisions

1. **Conditional OTP/remember-device controls**: Hidden until backend support is available; separate issue filed
2. **Extend globals.css with layout tokens**: Add sidebar width, header height, navigation dimensions
3. **Per-region tolerance from spec 005**: Use spec 005's noise measurement methodology, not flat ±2px
4. **Reference #142 inventory**: Use as authoritative screen/state enumeration for SC-009
5. **File separate backend issue**: Track OTP/remember-device/password-reset as functional blocker

## Risks and Mitigations

1. **Risk**: Spec 005 reference captures incomplete → **Mitigation**: This spec is blocked until spec 005 is complete
2. **Risk**: Backend OTP support delayed → **Mitigation**: Controls hidden, separate issue tracked
3. **Risk**: Tolerance disputes during QA → **Mitigation**: Use spec 005's per-region noise measurement, not subjective judgment
4. **Risk**: LIFF regressions → **Mitigation**: Test all 7 LIFF destinations after each change
