# Standards — NetZeroCarbon

Stack:           Cloudflare Workers (Hono), D1 (SQLite), R2 (images), TypeScript, Bun runtime
Test tooling:    bun test (unit + integration), playwright (e2e), biome (lint)
Conventions:     Hono routes in src/routes/, services in src/<domain>/, DB schema in src/db/migrate.sql
Branch format:   task/NNNN-<slug>
Commit format:   conventional commits (feat:, fix:, chore:, docs:)
Copy source:     hardcoded in chat.ts (LINE messages) — Thai language
Domain terms:
  - AWD (Alternate Wetting and Drying) — rice farming water management technique
  - SF_w — water management scaling factor (0.55 full, 0.71 incomplete)
  - LIFF — LINE Front-end Framework (mini-apps inside LINE)
  - PDPA — Personal Data Protection Act (Thailand)
  - WET/DRY — photo submission rounds (WET-1, DRY-1, WET-2, DRY-2)
  - crop — one planting season for one plot (120-day rice cycle)
  - plot — a registered land parcel with deed number
  - farmer — a registered user with phone-matched identity
  - coordinator — staff who reviews documents and photos
