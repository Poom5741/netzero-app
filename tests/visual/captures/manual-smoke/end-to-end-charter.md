# End-to-End Functional Test Charter — Claude Design Parity

**Feature**: specs/010-claude-design-parity
**Date**: 2026-09-17
**Method**: computer-use MCP browser automation only, no scripts
**Pre-conditions**: dev server reachable (HTTP 200 confirmed)

## Risk register (P × I)

| ID | Risk | P | I | Priority |
|---|---|---|---|---|
| E2E-1 | Admin login flow broken (bypass path) | Low | High | P1 |
| E2E-2 | Photo review approve/reject workflow stuck | Medium | High | P1 |
| E2E-3 | Sponsor sees out-of-scope PII | Low | Critical | P1 |
| E2E-4 | Sidebar navigation broken across Admin pages | Low | Medium | P2 |
| E2E-5 | Mobile hamburger menu toggle broken | Low | Medium | P2 |
| E2E-6 | Keyboard navigation regression on login | Low | Medium | P2 |

## Charter 1 — Admin Login Flow (E2E-1)

**Mission**: Prove admin can authenticate via dev bypass and reach `/admin`.

**Steps**:
1. Open `http://localhost:3000/admin/login`
2. Verify the form has email, password, OTP, "remember device" checkbox, "forgot password" link, primary submit
3. Click the visible "Admin (Bypass)" dev button (no real form fill)
4. Verify URL becomes `/admin`
5. Verify sidebar, header, and "ภาพรวม" heading render

**Oracle**: redirect completes within 5s; URL is `/admin`; sidebar visible

---

## Charter 2 — Admin Sidebar Navigation (E2E-4)

**Mission**: Prove clicking each sidebar entry navigates and updates the active state.

**Steps**:
1. From `/admin`, click each sidebar entry: "ตรวจสอบใบสมัคร", "ตรวจสอบภาพ", "เกษตรกร", "ผู้สนับสนุน", "รายงาน", "ตั้งค่า"
2. After each click, verify URL changes to expected route
3. Verify the clicked entry shows the active state (brighter background)
4. Verify the previous active entry loses the active state

**Oracle**: every navigation succeeds; URL matches the clicked entry; active-state highlight tracks the click

---

## Charter 3 — Photo Review Workflow (E2E-2)

**Mission**: Prove admin can act on a pending photo with reject + reason (the most complex domain workflow).

**Steps**:
1. Navigate to `/admin/applications`
2. Identify any photo with a "รอ" (pending) badge or filter-tab button for pending
3. If found: select the photo, find the reject button, click it
4. Verify the reject form expands with at least one reason checkbox and a message textarea
5. Check at least one reason, type a short reason like "ภาพไม่ชัด", click submit
6. Verify the badge changes to "ปฏิเสธ" (rejected) or similar
7. Verify the audit panel/history shows the new entry (if visible)
8. If no pending photo is available, document what IS visible

**Oracle**: form accepts reject + reason; badge updates; state persists; if no pending data exists, that's also acceptable for a manual test in dev (fallback data)

---

## Charter 4 — Sponsor Data Scoping (E2E-3)

**Mission**: Prove sponsor login shows ONLY assigned-area data with CPA codes (no PII like names, phone numbers, ID card numbers).

**Steps**:
1. Navigate to `/sponsor/login`
2. Login (admin bypass doesn't apply; check if dev buttons exist, else document)
3. If accessible: navigate to `/sponsor`, `/sponsor/areas`, `/sponsor/reports`
4. Verify PDPA notice is visible
5. On `/sponsor/areas`: verify province filter shows only "ทุกจั้งหวัด" plus the assigned areas; no farmer PII
6. Verify CPA codes (e.g. CPA1021) appear, not names
7. Verify "no data" or empty state if no sponsor data is in the dev DB

**Oracle**: PDPA notice present; only CPA codes visible; only assigned provinces in filter; no Thai names, phone numbers, or ID card numbers anywhere

**Note**: If sponsor login is not dev-accessible in this environment, document the access path and stop.

---

## Charter 5 — Mobile Hamburger Toggle (E2E-5)

**Mission**: Prove the mobile sidebar collapse/expand works at 390×844.

**Steps**:
1. Resize viewport to 390×844
2. Navigate to `/admin` (use existing session)
3. Verify the desktop sidebar (232px) is hidden
4. Verify the hamburger button is visible
5. Click hamburger
6. Verify sidebar appears with 260px width (mobile-expanded width)
7. Verify content shifted right by sidebar
8. Click a sidebar nav item
9. Verify sidebar closes and navigation worked
10. Repeat for `/sponsor`

**Oracle**: hamburger reveals sidebar; nav item click closes sidebar AND navigates

---

## Charter 6 — Keyboard Navigation (E2E-6)

**Mission**: Prove keyboard navigation through login form and filter tabs is functional.

**Steps**:
1. Navigate to `/admin/login`
2. Tab through fields: email, password, OTP, remember checkbox, forgot password link, submit button
3. Verify visible focus indicators on each field
4. Navigate to `/admin/applications` (after auth bypass)
5. Tab through filter tabs (ทั้งหมด, รอดำเนินการ, ยืนยันแล้ว, ปฏิเสธแล้ว)
6. Verify Enter/Space activates a filter tab
7. Verify focus moves through chips/tags logically

**Oracle**: tab order is logical; focus ring visible; Enter/Space activates tabs

---

## Output Format

After each charter, one short observation note will be appended. After all six, a consolidated report will be written to `functional-test-report.md` in this directory.
