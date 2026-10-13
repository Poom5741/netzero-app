# 019 — stand up the current e2e gate (baseline from 018 triage)

Owner decision 2026-10-13: 018 landed with the playwright gate recorded as a named exception; this follow-up makes it a passing, required gate.

## Baseline (triage 2026-10-13, clone @ c03d633 + portable-path fix, desktop project)
129 passed / 70 failed. Evidence: `.super-speckit/qa/QA-018-005/gate-playwright-triage.log` (qa dir; digests in the 018 record).

## Work items
1. **Spec audit to 017 UI** — rewrite stale assertions to shipped surfaces:
   - `sponsor.spec.ts` (7): expects pre-017 text (`แดชบอร์ดผู้สนับสนุน`, `ติดตามคาร์บอนแบบเรียลไทม์`, `รายละเอียดตามภูมิภาค`, `ส่งออกรายงาน`); shipped portal (r5-verified): `พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน`, KPI `Supported area … ไร่ / Households benefited / Verified credits`, `รายงานและใบรับรอง`.
   - `admin.spec.ts` (2) + `admin-shell-parity.spec.ts` (1): same old-text pattern.
   - `chat.spec.ts`: RETIRED in 018 (targets a never-shipped FE `/chat` page; farmer chat is LINE OA + backend LIFF pages `/liff/summary|calendar|fields|baseline|camera`). If FE chat coverage is wanted, spec the shipped LIFF surface instead.
   - `full-qa.spec.ts` (39) + `verify-journey.spec.ts` (11): admin review flows need seeded `photo_evidence`/season states; local seed has none.
2. **Seed harness** — deterministic local dataset: farmers/plots/seasons (seed.sql) + photo evidence in pending/flagged/verified states (extend `src/db/seed.sql` or a dedicated `seed-e2e.sql`), applied by the playwright webServer/setup step.
3. **A11y product fixes (real findings, not spec artifacts)**:
   - `/sponsor` login inputs render 14.7×16 px and ลืมรหัสผ่าน 70×17 at 375px viewport (66.7% < 70% touch target) — input height/padding fix (compare admin login which passes at 75-100%).
   - `<html lang>` attribute missing per spec scan (frontend layout).
   - No ARIA landmarks (`header/main/nav`) detected on scanned pages.
   - `context.emulateMedia is not a function` — spec API misuse in mobile-accessibility (fix the call).
4. **Re-add gate** — super-speckit.yml `playwright: "npx playwright test --config frontend/playwright.config.ts"` once green; owner sign-off; then the gate is required for release again.

## Out of scope
Server capacity/perf; real-device camera pass (waived 2026-09-29); production environment provisioning.
