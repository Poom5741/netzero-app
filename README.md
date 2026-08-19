# NetZeroCarbon POC

Carbon credit verification for Thai rice farmers via LINE integration.

## Quick Start

```bash
# Install dependencies
bun install

# Initialize local D1 database
bun run db:init

# Seed demo data
bun run db:seed

# Start dev server
bun run dev
```

## Prerequisites

- [bun](https://bun.sh/) (via mise or standalone)
- [wrangler](https://developers.cloudflare.com/workers/wrangler/) (bundled via bunx)

## Scripts

| Command | Description |
| --------- | ------------- |
| `bun run dev` | Start local dev server via wrangler |
| `bun run db:init` | Initialize local D1 with migration |
| `bun run db:seed` | Seed demo farmers, plots, and users |
| `bun run check` | Run lint + typecheck + tests |
| `bun run check:lint` | Biome lint |
| `bun run check:type` | TypeScript type check |
| `bun run check:test` | Vitest unit tests |
| `bun run deploy` | Deploy to Cloudflare Workers |

## Architecture

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (photo evidence)
- **Auth**: Cookie-based sessions with role middleware (admin/sponsor)

## Demo Users

| Role | Email | Password |
|------|-------|----------|
| Admin | <admin@netzero.local> | (set via seed) |
| Sponsor | <sponsor@netzero.local> | (set via seed) |

## Project Structure

```
src/
  index.ts              # App entry point
  auth/                 # Authentication modules
    password.ts         # PBKDF2 hashing
    session.ts          # Cookie-based sessions
    middleware.ts       # Role-based access control
  routes/               # Hono route handlers
    health.ts           # Health check
    auth.ts             # Login/logout/redirect
    dashboard.ts        # Admin/sponsor dashboards
  db/
    migrate.sql         # D1 schema
    seed.ts             # Demo data seeder
tests/
  unit/                 # Vitest unit tests
```

## Testing

```bash
# Run all checks
bun run check

# Run tests only
bun run check:test
```
