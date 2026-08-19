# NetZeroCarbon — Field Test Script

> Step-by-step guide for conducting a field test of the POC.
> Estimated time: 45 minutes.

## Prerequisites

- [x] Bun installed (`bun --version`)
- [x] Node 22+ installed (`node --version`)
- [x] Database initialized (`bun run db:init`)
- [x] Demo data seeded (`bun run seed`)
- [x] Dev server running (`bun run dev`)

## Setup (5 min)

1. Open two terminals.
2. Terminal 1 — start the dev server:

   ```bash
   cd netzero-carbon-poc
   bun run dev
   ```

3. Terminal 2 — run the demo seeder:

   ```bash
   bun run demo/seed-demo.ts
   ```

## Test Scenarios

### Scenario 1: Farmer Onboarding (10 min)

1. Open `http://localhost:8787/login` in a browser.
2. Log in as **admin** (`admin@test.com` / `admin123`).
3. Verify the Admin Dashboard loads with navigation links.
4. Click "Farmers" link — confirm the page renders.
5. Click "Photo Review" link — confirm the page renders.

### Scenario 2: Photo Upload Flow (10 min)

1. While logged in as admin, navigate to the photo review queue.
2. Verify photos are listed with AI screening status.
3. Approve a photo — confirm the status changes to "verified".
4. Reject a photo — confirm the status changes to "rejected".

### Scenario 3: Carbon Estimation (10 min)

1. Check that the season summary endpoint returns data:

   ```bash
   curl http://localhost:8787/health
   ```

2. Verify the health check returns `{"status":"ok"}`.

### Scenario 4: Sponsor Dashboard (5 min)

1. Log out of admin.
2. Log in as **sponsor** (`sponsor@test.com` / `sponsor123`).
3. Verify the Sponsor Dashboard loads.
4. Confirm navigation links for "My Plots" and "Carbon Estimates" are present.

### Scenario 5: API Smoke Tests (5 min)

Run the built-in test suite to verify everything works:

```bash
bun run check:test
```

Expected: All tests pass.

## Cleanup

1. Stop the dev server (Ctrl+C).
2. Optionally reset the database:

   ```bash
   bun run db:init
   bun run seed
   ```

## Troubleshooting

| Problem | Fix |
| --------- | ----- |
| Port 8787 in use | Kill existing process: `lsof -ti:8787 \| xargs kill` |
| DB not initialized | Run `bun run db:init` |
| Seed data missing | Run `bun run seed` then `bun run demo/seed-demo.ts` |
| Login fails | Check that demo seed was run; password is `admin123` or `sponsor123` |
