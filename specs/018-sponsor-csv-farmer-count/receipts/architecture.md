## architecture
Project contract applied (Dune rules made project-specific):
- Owner of sponsor area scoping: backend `src/sponsor/dashboard.ts` `areaFilter` (single choke point; `f.addr_province` vs `users.areas` JSON). FE must never re-scope or widen server-scoped data; it renders what the scoped API returns.
- Durable state: `users.areas` (sponsor assignments), `plots`↔`farmers` (ownership of "has activity in area"). No new state introduced.
- Allowed direction: FE sponsor pages → scoped sponsor APIs only; no direct D1 access from FE; no new dependency.
- Forbidden example (mechanically rejected by review + test): counting sponsor farmers without the plot join while list surfaces join plots — this delivery's regression test encodes the rejection (plotless in-scope farmer must not appear in `totalFarmers`).
- Executable check added: unit regression test on `getSponsorSummary`; valid path (farmer with in-scope plot counted exactly once) asserted in the same test.
