# Data Model: Admin Dashboard Visual Polish

No new persisted entities or fields are introduced.

The visual layer continues to consume existing entities:

- **Photo Evidence**: Existing image, crop, plot, round, GPS, timestamp, water-level, confidence, and status data.
- **Review Decision**: Existing approve, reject, Request Retake, reason, reviewer, timestamp, decision, and prior-status data.
- **Dashboard Metrics**: Existing households, subplots, area, credit, province/area, and season aggregates.
- **Admin Identity and Role**: Existing authenticated user and role visibility rules.

## Invariants

1. Visual changes MUST NOT alter persisted values, decision transitions, audit records, or role-based data access.
2. Verified credits and estimates MUST remain visually distinguishable.
3. Missing image, GPS, confidence, or aggregate data MUST render an explicit placeholder state rather than fabricated values.
