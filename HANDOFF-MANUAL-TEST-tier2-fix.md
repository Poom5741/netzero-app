# Handoff — Tier 2 Mobile Project Scope Fix (Manual Testing)

**Date:** 2026-10-02
**For:** A completely fresh agent or manual tester, with no prior context, verifying the Tier 2 fix.
**Mission:** Verify the fix for mobile-chrome Playwright project configuration and ensure Tier 2 parity works as intended.

---

## 0. Orientation — read this first

| Question | Answer | Where to verify |
|---|---|---|
| What is the fix? | Test configuration only: desktop-only Tier-2 suites excluded from mobile-chrome project via testIgnore; TIER2_BASE_URL seam added to target fresh server instead of reusing :3000 | `frontend/playwright.config.ts` |
| Is there product code change? | **NO.** Zero lines of production code were modified. Only test configuration. | `git show d4744f1 --stat` |
| What is the scope? | Manual verification of desktop ≥1024px and mobile <1024px behavior; automated Tier-2 backup evidence | §2 below |
| What is the critical fix? | Mobile-chrome project now excludes desktop-only specs (sidebar-rail hidden lg:flex below 1024px) | §1 below |

---

## 1. Repo facts (verify, don't assume)

- **Repo:** `/Users/poom-work/netzero-app` · branch `main` · remote `https://github.com/Poom5741/netzero-app.git` (public)
- **Fix location:** `frontend/playwright.config.ts` commit d4744f1 on branch `fix/tier2-mobile-project-scope`
- **Tier-2 contract:** `chromium` project only (34 tests = 22 passed + 12 skipped) — mobile project runs none of the three desktop specs
- **Deployed frontend:** `https://netzero-frontend.poom-a1d.workers.dev` (HTTP 200, Thai content)

**Critical configuration change:**
 - Mobile-chrome project now has `testIgnore` listing the three desktop-only files explicitly (`e2e/admin-shell-parity.spec.ts`, `e2e/controls-parity.spec.ts`, `e2e/data-chrome-parity.spec.ts`) — `frontend/playwright.config.ts:26-32`, no glob, so future parity specs must be added consciously
 - `TIER2_BASE_URL` seam added to enable fresh server targeting (prevents stale :3000 reuse)
---

## 2. What to test (the core manual verification)

### Desktop ≥1024px (use e.g. 1280×720)
 - [ ] Admin shell shows 232px fixed left rail, background rgb(6,30,92), nav items highlight by route
 - [ ] Sponsor shell shows same rail, sponsor nav (3 routes: overview/areas/reports)
 - [ ] Buttons use pill radius (999px), primary teal #028E91
 - [ ] Tables use dense paddings; tabular numerals
 - [ ] Thai labels render exactly (spot-check: สรุปฤดูกาล, อัปโหลดรูป)
 - [ ] Charts on /admin/charts show 6 labeled deferred placeholders (dashed frames)
### Mobile <1024px (use e.g. Pixel-5 412×915)
- [ ] Sidebar rail hidden; hamburger icon appears
- [ ] Opening hamburger drawer traps focus
- [ ] Escape and backdrop-click close drawer; focus returns to trigger
- [ ] Page scroll locked while drawer open
- [ ] Thai labels render exactly on mobile
- [ ] Login pages show gradient-deep brand panel (no wind-farm image)

### Both breakpoints
- [ ] Data loads from live API on admin overview (KPI tiles, work queue, GHG table)
- [ ] No console errors beyond expected backend noise if Worker not running locally
- [ ] Session gating works (admin/sponsor surfaces inaccessible without login)

---

## 3. Automated evidence (backup verification)

Run these to confirm the fix works mechanically:

```bash
# Frontend tests
cd frontend && npx vitest run     # expect 372/372
cd frontend && npx tsc --noEmit  # expect clean

# Unit and integration (repo root)
bun test tests/unit/             # expect 914/0
bun test tests/integration/      # expect 73/0 (hits deployed site)

# Tier-2 (chromium only)
cd frontend && TIER2_BASE_URL=http://127.0.0.1:3100 npx playwright test e2e/admin-shell-parity.spec.ts e2e/controls-parity.spec.ts e2e/data-chrome-parity.spec.ts --project=chromium
# expect 22 passed / 0 failed / 12 skipped

# Mobile project should run NONE of the three desktop specs
cd frontend && npx playwright test --project=mobile-chrome
# expect: the three parity files are ignored (0 collected); older suites still run
```

---

## 4. Known-open items (do NOT file as defects)

- Static-export Tier-2 path (`tier2-static-server.mjs`) is broken pre-existing — never use it as evidence
- 3 designer-gap assets intentionally absent (wind-farm PNG, logo binaries, Lucide sprite) — gradient substitutions in place
- `bun run check` at repo root is broken independently (`check:type:frontend` references missing script) — run individual commands

---

## 5. Evidence convention

Record manual test results under `.super-speckit/qa/<run-id>/report.md` (folder is gitignored — local evidence only), one line per checklist item: pass/fail + screenshot path if any.

**Example format:**
```
✓ Admin shell 232px rail @ screenshots/desktop-admin-rail.png
✗ Sponsor nav highlighting missing @ screenshots/sponsor-nav-highlight-fail.png
✓ Mobile hamburger drawer focus trap @ screenshots/mobile-drawer-focus.png
```

---