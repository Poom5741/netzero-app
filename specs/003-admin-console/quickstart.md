# Quickstart: Admin Console Validation

**Date**: 2026-09-14
**Feature**: Admin Console (specs/003-admin-console)

## Prerequisites

1. **Production deployment**: Admin Console is deployed at `https://netzero-carbon.chirayu888.workers.dev`
2. **Admin credentials**: Email, password, and OTP secret for test admin account
3. **Browser**: Chrome or Firefox for manual testing
4. **browser-use**: For automated visual QA (optional)

## Setup

No local setup required. All testing is performed against the production deployment.

## Validation Scenarios

### Scenario 1: Privileged Sign-In (AD-AUTH-01, AD-AUTH-02, AD-AUTH-03)

**Objective**: Verify branded login with email, password, OTP, and audit logging.

**Steps**:
1. Navigate to `https://netzero-carbon.chirayu888.workers.dev/admin/login`
2. Verify split layout with deep gradient, NetZeroCarbon logo, Thai project title, methodology reference
3. Enter valid email and password
4. Enter valid OTP code
5. Click "Sign In"
6. Verify redirect to overview dashboard
7. Check audit log for sign-in event

**Expected**:
- Login page displays correctly with branding
- Successful authentication redirects to overview
- Audit log entry created with actor, time, action

**Evidence**: Screenshot of login page, screenshot of overview after login, audit log entry

---

### Scenario 2: Overview Dashboard (AD-OV-01 through AD-OV-06)

**Objective**: Verify project overview with metrics, work queue, credit charts, and filters.

**Steps**:
1. From overview dashboard, verify scope identification (T-VER-P-METH-13-08)
2. Verify four primary metrics: households, active subplots, total area, net credits
3. Verify work queue tiles: pending applications, pending evidence, follow-up items
4. Verify credit chart: verified vs estimated
5. Verify province and season breakdowns
6. Apply province filter
7. Verify all metrics update
8. Click "Export Report" action

**Expected**:
- Overview displays all required elements
- Filters update all affected metrics
- Export action initiates download

**Evidence**: Screenshot of overview, screenshot with filter applied, export file

---

### Scenario 3: Farmer Registry (AD-FAR-01 through AD-FAR-05)

**Objective**: Verify farmer list, detail view, and personal data protection.

**Steps**:
1. Navigate to Farmers page
2. Verify table shows CPA code, name (if authorized), area, sponsor, subplot count, rai, photo progress, BE, PE, ER
3. Search for farmer by CPA code
4. Click farmer row to open detail
5. Verify 5 tabs: Plots & Documents, Credit Calculation, Nitrogen Source, Photo Evidence, Audit Log
6. Verify plot codes, area, rice variety, deed references, evidence status
7. Verify CalcTrace tab shows calculation inputs and outputs
8. Logout and login as sponsor role
9. Navigate to Farmers page
10. Verify names are hidden, only CPA codes visible

**Expected**:
- Farmer list displays correctly
- Detail view shows all tabs with correct data
- Sponsor role cannot see names or identity data

**Evidence**: Screenshot of farmer list, screenshot of farmer detail, screenshot of sponsor view

---

### Scenario 4: Application Review (AD-APP-01 through AD-APP-05)

**Objective**: Verify application queue, document checklist, and review actions.

**Steps**:
1. Navigate to Application Review page
2. Verify queue shows application ID, CPA code, farmer, location, subplot count, area, holding type, doc count, age, status
3. Click application to open detail
4. Verify document checklist: required, received, missing, invalid
5. Verify holding-specific rules (owner vs tenant)
6. Click "Request Documents" action
7. Enter reason and submit
8. Verify status changes to hold
9. Click "Approve" action
10. Verify status changes to approved

**Expected**:
- Application queue displays correctly
- Document checklist distinguishes statuses
- Review actions update status with audit trail

**Evidence**: Screenshot of application queue, screenshot of document checklist, audit log entry

---

### Scenario 5: Evidence Review (AD-REV-01 through AD-REV-03)

**Objective**: Verify photo review queue, approve/reject/retake actions, and review history.

**Steps**:
1. Navigate to Evidence Review page
2. Verify queue shows crop, plot, round, GPS, timestamp, water level, image, status
3. Click photo to open detail
4. Verify all context is visible
5. Click "Approve" action
6. Enter reason and submit
7. Verify status changes to approved
8. Navigate to another photo
9. Click "Reject" action
10. Enter reason and submit
11. Verify status changes to rejected
12. Navigate to farmer detail → Photo Evidence tab
13. Verify review history shows reviewer, timestamp, decision, reason, prior status

**Expected**:
- Evidence queue displays correctly
- Review actions update status with reason
- Review history is preserved

**Evidence**: Screenshot of evidence queue, screenshot of review detail, audit log entries

---

### Scenario 6: Calculation Traceability (AD-CALC-01, AD-CALC-02)

**Objective**: Verify traceable calculation inputs and outputs.

**Steps**:
1. Navigate to farmer detail → Credit Calculation tab
2. Verify baseline and project emissions are shown
3. Verify SF_w factor (0.55, 0.71, or 1.0)
4. Verify uncertainty deduction
5. Verify net offset
6. Verify inputs JSON shows all source values
7. Verify methodology reference (T-VER-P-METH-13-08)

**Expected**:
- Calculation tab shows all inputs and outputs
- SF_w is evidence-driven
- Inputs are traceable

**Evidence**: Screenshot of credit calculation tab

---

### Scenario 7: Role-Based Permissions (AD-ROLE-01, AD-ROLE-02)

**Objective**: Verify five roles with granular permissions.

**Steps**:
1. Login as admin role
2. Navigate to Settings → Permissions
3. Verify 5 roles: admin, verifier, field, sponsor, auditor
4. Verify 15 permission categories
5. Logout and login as verifier role
6. Verify can review evidence but cannot edit settings
7. Logout and login as sponsor role
8. Verify can only see assigned areas
9. Verify cannot see names or identity data
10. Logout and login as auditor role
11. Verify read-only access

**Expected**:
- All roles have correct permissions
- Permission enforcement is consistent

**Evidence**: Screenshot of permissions matrix, screenshots of each role view

---

### Scenario 8: Data Export (AD-FAR-03, AD-CALC-02)

**Objective**: Verify CSV/JSON export with role-based field filtering.

**Steps**:
1. Login as admin role
2. Navigate to Reports page
3. Click "Export Farmers" (CSV)
4. Verify CSV contains all fields including names
5. Logout and login as sponsor role
6. Navigate to Reports page
7. Click "Export Farmers" (CSV)
8. Verify CSV contains only CPA codes, no names
9. Verify CSV is filtered by supported areas

**Expected**:
- Admin export includes all fields
- Sponsor export is CPA-coded and area-filtered

**Evidence**: Admin export CSV, sponsor export CSV

---

## Automated Testing

### Unit Tests

```bash
npm test -- src/admin/
```

**Coverage**: All admin logic modules (overview, review, applications, farmer-detail, queue, audit-log)

### E2E Tests

```bash
npm run test:e2e -- tests/e2e/admin.spec.ts
```

**Coverage**: Login flow, overview dashboard, farmer registry, application review, evidence review

### Visual QA

```bash
# Using browser-use skill
/visual-qa https://netzero-carbon.chirayu888.workers.dev/admin
```

**Coverage**: Visual consistency, neumorphic design, responsive layout

## Success Criteria

All validation scenarios pass with evidence:

- ✅ Privileged sign-in with audit logging
- ✅ Overview dashboard with metrics and filters
- ✅ Farmer registry with personal data protection
- ✅ Application review with document checklist
- ✅ Evidence review with approve/reject/retake
- ✅ Calculation traceability
- ✅ Role-based permissions
- ✅ Data export with field filtering

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify email and password are correct
- Verify OTP code is current (30-second window)
- Check browser console for errors

### Overview shows no data
- Verify database is seeded with demo data
- Check D1 binding in Wrangler configuration

### Export fails
- Verify role has export permissions
- Check browser download settings

### Permission errors
- Verify user role in `users` table
- Check `requireRole` middleware configuration

## Conclusion

This quickstart guide provides runnable validation scenarios for all Admin Console requirements. All scenarios can be tested against the production deployment with appropriate credentials.
