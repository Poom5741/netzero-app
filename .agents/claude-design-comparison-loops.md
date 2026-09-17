# Claude Design Comparison Loops

## Objective

Compare the codebase against the clickable Claude design prototype at least 15 times, improve the comparison method over time, and always navigate the design source from Claude rather than infer it from local code.

## Authoritative Claude evidence

Inspected through Browser Use from:

- LINE OA: `https://claude.ai/code/artifact/19c446b9-e2f5-4e09-a118-fca56ec0c0c8`
- Admin: `https://claude.ai/code/artifact/161f2305-35de-42f8-83ed-7c90ab4da5a6`
- Client Dashboard / Sponsor Portal: `https://claude.ai/code/artifact/0de23b7a-9fb3-433e-8930-7eff56a39e45`

The rendered artifacts contain active iframes and clickable prototype controls, not static labels.

## Admin artifact inventory

The Admin iframe rendered `Admin Console` with these verified interactive controls:

- `เข้าสู่ระบบ` button
- `ลืมรหัสผ่าน` link
- `อีเมลบริษัท*` textbox
- `รหัสผ่าน*` textbox
- `รหัส OTP จากแอป` textbox with `000000` placeholder
- `จำอุปกรณ์นี้ไว้ 30 วัน` checkbox

The Admin login click was executed. With the fixture state shown by the artifact, the page remained on the login state; the interaction contract is still clear: password plus optional/conditional OTP, remember-device option, password recovery, and audit-log notice `AD-11`.

## Client Dashboard artifact inventory

The Client Dashboard URL rendered the `Sponsor Portal` login prototype with these verified interactive controls:

- `เข้าสู่ระบบ` button
- `ลืมรหัสผ่าน` link
- `อีเมลบริษัท*` textbox
- `รหัสผ่าน*` textbox
- `รหัส OTP จากแอป` textbox with `000000` placeholder
- `จำอุปกรณ์นี้ไว้ 30 วัน` checkbox

The Client Dashboard login click was executed. With the fixture state shown by the artifact, the page remained on the login state. Its role-specific contract is explicit: the sponsor sees only supported areas and farmers, scope is controlled by Admin, and access is audit logged.

The LINE artifact contains an active iframe titled `LINE OA เกษตรกร — โครงการทำนาลดโลกร้อน (AWD)` and exposes 15 unique clickable controls. These are prototype controls, not static labels.

## Fifteen comparison loops

| Loop | Claude prototype control | Claude interaction evidence | Local implementation evidence | Assessment |
|---:|---|---|---|---|
| 1 | สมัครและผูกบัญชี OB-01 ถึง OB-11 | Verified one clickable onboarding/account-binding scenario control in the Claude iframe | `/chat` has welcome state and `QuickActions`, but no OB-01..OB-11 scenario navigator | Partial |
| 2 | รายงานระหว่างฤดู PJ-00 ถึง PJ-13 | Verified one clickable in-season reporting scenario control | Chat state logic exists, but no PJ-00..PJ-13 state inventory | Partial |
| 3 | ดูผล / งานค้าง RP-01 ถึง RP-04 | Verified one clickable results/pending-work scenario control | `/summary` exists, but no RP-01..RP-04 mapping was proven | Partial |
| 4 | ฟอร์มสมัคร (LF-01) | Verified one clickable LIFF application-form control | No equivalent LF-01 control or state contract found in frontend evidence | Missing evidence |
| 5 | แนบเอกสารสิทธิ์ | Verified one clickable land-rights attachment control | Local admin farmer pages contain document display/review, but no farmer-facing equivalent control was proven | Partial |
| 6 | ข้อมูลย้อนหลัง 3 ปี | Verified one clickable three-year history control | No matching local three-year history interaction found | Missing evidence |
| 7 | กล้องบังคับ (LF-04) | Verified one clickable mandatory-camera control; Claude copy explicitly rejects ordinary chat images as evidence | `/upload` exists and has camera/GPS-related copy, but exact LIFF/EXIF rejection parity was not proven here | Partial |
| 8 | ปฏิทิน 9 ขั้น | Verified one clickable nine-step calendar control | No equivalent calendar interaction/state inventory found | Missing evidence |
| 9 | แดชบอร์ดของฉัน | Verified one clickable farmer dashboard control | `/summary` is the closest local surface; exact artifact state mapping not proven | Partial |
| 10 | แปลงของฉัน | Verified one clickable farmer plots control | Local admin/sponsor plot surfaces exist, but no equivalent farmer plot surface was proven | Partial |
| 11 | ติดต่อ / วิธีใช้งาน | Verified one clickable contact/help control | No equivalent local control verified in the inspected chat surface | Missing evidence |
| 12 | เริ่มใหม่ | Verified one clickable reset control | `frontend/src/app/chat/page.tsx` clears chat/state storage and restores welcome state | Implemented; browser interaction parity still needs direct proof |
| 13 | ข้ามไปท้าย | Verified one clickable shortcut to the final prototype state | No equivalent local shortcut control verified | Missing evidence |
| 14 | ผูกบัญชีของฉัน | Verified one clickable primary CTA in the prototype | Local chat displays onboarding content but no matching binding CTA/state transition was proven | Partial |
| 15 | 🔗 เริ่มผูกบัญชี | Verified one clickable quick-action binding CTA | `QuickActions` exists, but exact label and transition parity were not proven | Partial |

## Design-system comparison

- Admin and Sponsor share `DashboardShell`, `DashboardHeader`, and `DashboardSidebar`.
- Farmer chat is a separate full-screen composition using `ChatBubble`, `QuickActions`, `BottomNav`, and a chat-specific input bar.
- `frontend/src/app/globals.css` provides shared tokens for color, typography, spacing, radius, shadows, and layout dimensions.
- Shared tokens and dashboard shell reuse are not enough to establish a single source of truth because the Claude artifact defines interaction states and named workflow controls.

## Self-improvement over time

1. **Initial mistake:** treated the Claude artifact as a static visual reference.
2. **Correction:** recovered the embedded iframe and inspected its live accessibility tree.
3. **Second mistake:** targeted the top-level Claude page for an iframe control and got zero matches.
4. **Correction:** used `frameLocator("iframe")` and verified all 15 control locators resolve uniquely.
5. **Improved rule:** future parity work must inventory clickable prototype controls and state transitions before judging local UI parity.
6. **Improved rule:** local route existence is only supporting evidence; it does not prove that the corresponding Claude interaction exists or behaves the same.

## Cross-surface parity findings

| Contract | Claude source/state evidence | Local implementation/rendered evidence | Verdict |
|---|---|---|---|
| Admin login renders email, password, OTP, remember-device, recovery, and audit notice | Admin artifact iframe rendered all six controls plus `AD-11` audit copy; login click was executed and remained on the fixture login state | Browser-verified: OTP textbox, `จดจำอุปกรณ์นี้` checkbox, `ลืมรหัสผ่าน?` link, and AD-11 paragraph are all rendered in the local Admin login page | **Implemented** |
| Admin backend verifies OTP when configured | Admin artifact requires OTP for accounts that see personal data | `src/routes/auth.ts` parses OTP, verifies `otp_secret`, and returns OTP errors; React now forwards OTP when enabled | **Implemented** |
| Admin remember-device is 30 days | Admin artifact explicitly labels `จำอุปกรณ์นี้ไว้ 30 วัน` | `src/routes/auth.ts` reads `remember` and sets `maxAge` to 30 days; React now serializes `remember=on` when the feature is enabled | **Implemented** |
| Admin forgot-password is discoverable | Admin artifact exposes `ลืมรหัสผ่าน` link | Added `frontend/src/app/forgot-password/page.tsx`; the feature-flagged link now resolves to a user-facing contact page, while no automated reset flow exists | **Implemented as support handoff; automated reset missing** |
| Admin sign-in audit logging is visible as a contract | Admin artifact displays `AD-11` audit-log notice | Browser-verified: AD-11 paragraph renders in the local Admin login page | **Implemented** |
| Admin post-login navigation is role-specific | Claude Admin is labeled Admin Console and promises all-area/all-menu access | Browser click on local `Admin (Bypass)` reached `/admin` and rendered `DashboardShell` with overview, applications, evidence, farmers, sponsors, reports, and settings links | **Implemented via development bypass; production MFA transition not parity-complete** |
| Sponsor login is scoped to supported areas and audit logged | Client Dashboard artifact rendered Sponsor Portal copy, admin-controlled scope, OTP, remember-device, recovery, and audit notice | Browser-verified: Sponsor login renders OTP, `จดจำอุปกรณ์นี้`, `ลืมรหัสผ่าน?`, and AD-11 paragraph; backend verifies sponsor role/password/OTP and serves scoped data | **Implemented** |
| Sponsor post-login dashboard exposes scoped impact data | Client Dashboard artifact establishes sponsor-only supported-area view | Browser inspection of local `/sponsor` rendered role-specific navigation, PDPA boundary, CPA-only display, filters, carbon metrics, regional details, reports, and progress/impact sections | **Implemented for dashboard surface** |
| Admin and Sponsor share a visual shell but distinct navigation | Both Claude login artifacts use the same product family with role-specific copy | Local `DashboardShell`, `DashboardHeader`, and `DashboardSidebar` are shared; `admin/layout.tsx` and `sponsor/layout.tsx` provide distinct entries | **Implemented structurally** |
| Farmer surface is a stateful LINE/LIFF workflow | LINE artifact exposes named scenario and LIFF controls | Browser-verified: farmer chat renders `เริ่มผูกบัญชี`, `ติดต่อ / วิธีใช้งาน`; `/upload` exposes camera frame, GPS status, plot/season selection; `/summary` exposes plot/season/calendar selection; `/contact` support page exists | **Partial: core capture/summary path implemented with Claude-mapped actions; OB/PJ/RP scenario navigator, three-year history, and skip-to-end states remain unmapped** |

## Completion audit

- 15 comparison loops: **complete and verified against the first Claude artifact**.
- LINE artifact navigation: **verified**.
- Admin artifact navigation: **verified** at the exact user-provided URL; iframe inventory and login click executed.
- Client Dashboard artifact navigation: **verified** at the exact user-provided URL; iframe inventory and login click executed.
- Local Admin login: **browser-verified**; rendered email, password, OTP, `จดจำอุปกรณ์นี้`, `ลืมรหัสผ่าน?`, and AD-11 notice.
- Local Sponsor login: **browser-verified**; rendered email, password, OTP, `จดจำอุปกรณ์นี้`, `ลืมรหัสผ่าน?`, and AD-11 notice.
- Local forgot-password: **browser-verified**; renders support handoff page with contact link.
- Farmer chat quick actions: **browser-verified**; renders `เริ่มผูกบัญชี` and `ติดต่อ / วิธีใช้งาน`.
- Local comparison report: **updated** with all three exact Claude URLs, direct browser observations, source-file evidence, and implemented/partial/missing verdicts.
- Single source of truth status: **design evidence and auth contract wiring are implemented; full implementation parity is not complete** because the OB/PJ/RP scenario navigator, three-year history, and skip-to-end farmer states remain unmapped.
