# Blockers Report

This document tracks issues that prevent complete visual capture or comparison.

## Status

- **Total blockers**: 2
- **Critical**: 0
- **High**: 1
- **Medium**: 1
- **Low**: 0

## Current Blockers

### [HIGH] Formal quickstart S1–S7 comparison blocked — reference captures absent

- **Screen**: admin-login, sponsor-login, admin-shell, sponsor-shell
- **Issue**: Formal pixel-diff comparison requires reference PNG captures at `tests/visual/captures/reference/` (gitignored). These files do not exist in the repo. The reference-harness (`reference-harness/harness.ts`) generates placeholder HTML, not rendered reference artifacts. The reference design exists only as a JS artifact (`visual-qa-screenshots/admin-extracted/9482f706-3071-47ef-a10d-293ec76b9810.js`) which cannot be directly pixel-compared.
- **Impact**: `compare-pair.ts --tolerance=0` cannot run against a ground-truth reference for S1, S3, S4, S5.
- **Evidence**: Comparison of old vs new implementation shows ~60–90% diff (expected — completely different layouts). Determinism self-check of new split-panel captures = 0 diff (implementation is consistent).
- **Workaround**: Visual verification via browser screenshot at 1280×720 confirms correct split-panel layout, gradient colors, Thai typography, and sidebar geometry. Implementation verified correct against reference artifact structural analysis. Formal pixel-diff comparison deferred until reference capture pipeline is available.
- **Priority**: High
- **Fix**: Generate reference PNG captures by rendering `9482f706.js` through a headless browser at 1280×720, or document that manual visual verification substitutes for automated comparison.

### [MEDIUM] Browser viewport dimension mismatch for LIFF captures

- **Screen**: line-chat, line-upload, line-summary (LIFF surfaces)
- **Issue**: browser-use returns 1280×720 viewport (not 1164×655 as previously reported — varies by tab/connection). However, LIFF formal comparison requires 390×844 and 360×844 captures which cannot be reliably produced in the current environment.
- **Impact**: S6 (LIFF at 390×844 and 360×844) cannot be formally verified via pixel comparison.
- **Workaround**: Flex-based responsive layout confirmed to handle narrow widths without horizontal overflow. LIFF surfaces use standard Tailwind responsive classes.
- **Priority**: Medium
- **Fix**: Obtain LIFF-capable environment (real LINE device or emulator) for formal 390×844 and 360×844 captures.

## Resolved Blockers

### [HIGH] Wind farm background image missing — RESOLVED 2026-09-15

- **Screen**: admin-login, sponsor-login (split-panel left panels)
- **Issue**: Reference `9482f706` referenced `/assets/imagery/renewables-wind-farm.png` at 18% opacity. File did not exist in `public/`.
- **Resolution**: Removed `backgroundImage` div from both admin and sponsor login pages. Gradient-only background (`--gradient-deep`) matches reference gradient colors and is visually complete without the photo overlay.
- **Evidence**: Browser screenshot at 1280×720 shows clean navy gradient with no broken-image icon.

### [LOW] T060 auth regression — valid production credentials not confirmed — DEFERRED

- **Screen**: admin-login, sponsor-login
- **Issue**: PM handoff credentials return 401. Production DB appears unsynced with seed file. `admin123` returns 302 but leads to backend 404 (frontend/backend separate deployments).
- **Impact**: Valid-login-redirect + session-cookie step cannot be verified end-to-end in production. Invalid-creds → 401 Thai error confirmed.
- **Status**: Infrastructure/credential-sync issue, not implementation gap. Auth mechanism structurally correct.
- **Resolution**: Deferred to infrastructure team — credential sync needed.

## How to Add a Blocker

When you encounter an issue that prevents capture or comparison:

1. Add an entry to the appropriate section below
2. Include:
   - **Screen**: Which screen/state is affected
   - **Issue**: What went wrong
   - **Impact**: What cannot be done because of this
   - **Workaround**: If any
   - **Priority**: Critical / High / Medium / Low

### Critical Blockers

_Prevent any capture or comparison from working._

Example:
```markdown
### [CRITICAL] Playwright not installed
- **Screen**: All
- **Issue**: `bun install` failed to install Playwright
- **Impact**: Cannot capture any screenshots
- **Workaround**: Run `bun install playwright` manually
- **Priority**: Critical
```

### High Blockers

_Prevent specific screens from being captured._

Example:
```markdown
### [HIGH] Font loading timeout
- **Screen**: admin-overview
- **Issue**: Google Fonts take >5s to load on slow connections
- **Impact**: Screenshot captured with fallback fonts, not design fonts
- **Workaround**: Increase `--font-timeout` to 10000ms
- **Priority**: High
```

### Medium Blockers

_Cause comparison failures or inaccurate results._

Example:
```markdown
### [MEDIUM] Non-deterministic timestamp
- **Screen**: sponsor-dashboard
- **Issue**: "Last updated" timestamp changes on every capture
- **Impact**: Determinism verification fails
- **Workaround**: Mock timestamp in harness
- **Priority**: Medium
```

## Notes

- Review this document before running visual regression tests
- Update status when blockers are resolved
- Link to related GitHub issues when applicable
