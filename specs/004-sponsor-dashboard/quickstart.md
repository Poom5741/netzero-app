# Quickstart: Sponsor Dashboard Validation

**Date**: 2026-09-14
**Feature**: Sponsor Dashboard (specs/004-sponsor-dashboard)

## Prerequisites

1. **Production deployment**: Sponsor Dashboard is deployed at `https://netzero-carbon.chirayu888.workers.dev`
2. **Sponsor credentials**: Email, password, and OTP secret for test sponsor account
3. **Browser**: Chrome or Firefox for manual testing
4. **browser-use**: For automated visual QA (optional)

## Setup

No local setup required. All testing is performed against the production deployment.

## Validation Scenarios

### Scenario 1: Sponsor Sign-In and Scoped Access (SP-AUTH-01, SP-AUTH-02)

**Objective**: Verify branded login with scoped access to configured areas only.

**Steps**:
1. Navigate to `https://netzero-carbon.chirayu888.workers.dev/sponsor/login`
2. Verify split layout with Sponsor Portal eyebrow, NetZeroCarbon logo, supported-area title, scoped-access explanation, methodology reference, audit notice
3. Enter valid email and password
4. Enter valid OTP code
5. Click "Sign In"
6. Verify redirect to dashboard
7. Verify only configured areas are visible
8. Attempt to access another sponsor's area URL directly
9. Verify 403 Forbidden response

**Expected**:
- Login page displays correctly with branding
- Successful authentication redirects to dashboard
- Only configured areas are visible
- Direct access to other areas is denied

**Evidence**: Screenshot of login page, screenshot of dashboard, screenshot of 403 error

---

### Scenario 2: Certified Credits and Supported Area (SP-OV-01 through SP-OV-06)

**Objective**: Verify certified credits card, supported area details, households benefited, and credits by season.

**Steps**:
1. From dashboard, verify supported area identification (province/area, methodology)
2. Verify PDPA/data boundary notice explains CPA codes and no PII exposure
3. Verify prominent card shows verified credits in tCO₂eq with certification period and estimate caveat
4. Verify supported area details: rai, hectares, subplot count, crop-cycle information
5. Verify household count with explanatory methodology note
6. Verify credits by season chart with verified and estimate distinction

**Expected**:
- Dashboard displays all required elements
- Certified credits card is prominent with deep-gradient design
- Verified and estimated credits are visually distinct
- Household count is shown with methodology note

**Evidence**: Screenshot of dashboard, screenshot of certified credits card, screenshot of season chart

---

### Scenario 3: Estimate Transparency and Credit Difference (SP-OV-07, SP-OV-08)

**Objective**: Verify estimate uncertainty note and credit-difference table.

**Steps**:
1. From dashboard, verify uncertainty note explains estimates can change when evidence is incomplete and conservative SF_w is used
2. Verify credit-difference table shows baseline/project difference
3. Verify methane contribution is highlighted
4. Verify fertilizer parity note is present

**Expected**:
- Uncertainty note is visible and understandable
- Credit-difference table explains all components
- Methane contribution is clearly identified

**Evidence**: Screenshot of uncertainty note, screenshot of credit-difference table

---

### Scenario 4: Filtering and Export (SP-OV-09, SP-OV-10)

**Objective**: Verify filtering by province/area and export with CPA-coded data only.

**Steps**:
1. From dashboard, apply province filter
2. Verify all views update within authorized scope
3. Apply area_code filter
4. Verify all views update
5. Click "Download Summary" (CSV)
6. Verify CSV contains only CPA-coded data
7. Verify CSV is filtered by selected areas
8. Verify no PII appears in export

**Expected**:
- Filters update all affected views
- Export contains only CPA-coded data
- No PII in export

**Evidence**: Screenshot with filter applied, screenshot of export file

---

### Scenario 5: Privacy Rules (SP-BR-01 through SP-BR-05)

**Objective**: Verify sponsor cannot access other sponsors' areas, cannot see PII, and exports use CPA codes only.

**Steps**:
1. Login as sponsor A
2. Navigate to dashboard
3. Verify only sponsor A's areas are visible
4. Attempt to access sponsor B's area URL
5. Verify 403 Forbidden response
6. Navigate to farmer list
7. Verify only CPA codes are visible (no names, phone numbers, etc.)
8. Export farmer data
9. Verify export contains only CPA codes
10. Verify verified and estimated credits are visually distinct in all views

**Expected**:
- Sponsor cannot access other sponsors' areas
- No PII is visible in any view
- Exports use CPA codes only
- Verified and estimated credits are visually distinct

**Evidence**: Screenshot of dashboard, screenshot of 403 error, screenshot of farmer list, screenshot of export

---

### Scenario 6: Navigation (SP-NAV-01)

**Objective**: Verify primary navigation includes overview, areas, and reports/certificates.

**Steps**:
1. From dashboard, verify navigation menu
2. Click "Overview" — verify dashboard loads
3. Click "Areas" — verify area list loads
4. Click "Reports and Certificates" — verify reports page loads
5. Verify navigation maintains scope and context

**Expected**:
- All three navigation items are present
- Each page loads correctly
- Scope is maintained across navigation

**Evidence**: Screenshots of each page

---

## Automated Testing

### Unit Tests

```bash
npm test -- src/sponsor/
```

**Coverage**: All sponsor logic modules (dashboard, area scoping, privacy enforcement)

### E2E Tests

```bash
npm run test:e2e -- tests/e2e/sponsor.spec.ts
```

**Coverage**: Login flow, dashboard, area scoping, privacy enforcement, export

### Visual QA

```bash
# Using browser-use skill
/visual-qa https://netzero-carbon.chirayu888.workers.dev/sponsor
```

**Coverage**: Visual consistency, neumorphic design, deep-gradient cards, responsive layout

## Success Criteria

All validation scenarios pass with evidence:

- ✅ Sponsor sign-in with scoped access
- ✅ Certified credits card with estimate caveat
- ✅ Supported area details with household count
- ✅ Estimate transparency with uncertainty note
- ✅ Credit-difference table with methane contribution
- ✅ Filtering and export with CPA codes only
- ✅ Privacy rules enforced (no PII, no cross-sponsor access)
- ✅ Navigation with overview, areas, reports/certificates

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify email and password are correct
- Verify OTP code is current (30-second window)
- Check browser console for errors

### Dashboard shows "No supported areas configured"
- Verify sponsor account has `supported_areas` in `users` table
- Check admin settings to configure areas for sponsor

### Export fails
- Verify sponsor role has export permissions
- Check browser download settings

### 403 Forbidden on area access
- Verify area is in sponsor's `supported_areas`
- Check URL matches sponsor's configured areas

### PII visible in sponsor view
- This is a critical bug — verify route layer is filtering fields
- Check `src/routes/sponsor.ts` data shape

## Conclusion

This quickstart guide provides runnable validation scenarios for all Sponsor Dashboard requirements. All scenarios can be tested against the production deployment with appropriate credentials.
