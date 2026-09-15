# Blockers Report

This document tracks issues that prevent complete visual capture or comparison.

## Status

- **Total blockers**: 3
- **Critical**: 0
- **High**: 1
- **Medium**: 1
- **Low**: 1

## Current Blockers

### [HIGH] Admin login reference background image missing

- **Screen**: admin-login, sponsor-login (split-panel left panels)
- **Issue**: Reference `9482f706` shows a background image (`/assets/imagery/renewables-wind-farm.png`) overlaid at 18% opacity on the navy gradient. This image does not exist in the `public/` directory.
- **Impact**: Left panel shows gradient only; with image it would be 18% opaque photo overlay. Affects visual fidelity.
- **Workaround**: Gradient-only background is visually acceptable (gradient is correct per reference). Image adds texture but is non-essential.
- **Priority**: High
- **Fix**: Obtain or create wind farm / renewable energy imagery and place at `public/assets/imagery/renewables-wind-farm.png`

### [MEDIUM] Browser viewport cannot be set to 1280×720 for comparison captures

- **Screen**: All surfaces requiring formal comparison
- **Issue**: Browser-use control-browser returns viewport 1164×655 (DPR 1.1) regardless of attempts to set 1280×720. Reference captures are at 1280×720; dimension mismatch prevents pixel-diff comparison.
- **Impact**: Formal quickstart S1–S7 pixel comparisons cannot run via `compare-pair.ts --tolerance=0` against reference captures. Manual visual inspection confirms correct rendering.
- **Workaround**: Use browser screenshot for manual visual verification; formal comparison deferred until viewport issue is resolved in browser-use environment.
- **Priority**: Medium
- **Fix**: Resolve browser viewport setting in browser-use environment, or re-capture all references at 1164×655

### [LOW] T060 auth regression — valid production credentials not confirmed

- **Screen**: admin-login, sponsor-login
- **Issue**: PM handoff credentials (`admin@netzero.com/ClawTest2026!`, `sponsor@netzero.com/ClawTest2026!`) return 401 on both `/login` and `/sponsor/login`. `admin123` returns 302 (redirect) but leads to 404 (backend has no `/admin` route — frontend is separate). Seed file uses `admin@netzero.local` — production DB appears different.
- **Impact**: Cannot verify valid-login-redirect + session-cookie step of T060. Invalid-creds → 401 Thai error IS confirmed working.
- **Workaround**: Auth mechanism verified working (401 for invalid, 302 for admin123). Valid login flow is blocked by infrastructure credential sync, not implementation.
- **Priority**: Low
- **Fix**: Sync production credentials or obtain valid test credentials from current production database_

## Resolved Blockers

_None yet._

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

### Low Blockers

_Minor issues that don't prevent work but should be fixed._

Example:
```markdown
### [LOW] Missing favicon
- **Screen**: All
- **Issue**: No favicon in reference harness
- **Impact**: Browser tab shows generic icon
- **Workaround**: None needed
- **Priority**: Low
```

## Notes

- Review this document before running visual regression tests
- Update status when blockers are resolved
- Link to related GitHub issues when applicable
