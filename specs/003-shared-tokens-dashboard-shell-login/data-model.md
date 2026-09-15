# Data Model: Match Shared Tokens, Dashboard Shell and Login Presentation

**Feature**: 003-shared-tokens-dashboard-shell-login

## Applicability: Not Applicable

This feature modifies CSS design tokens and component presentation only. No new entities are introduced, no schema changes are made, no APIs are added or modified, and no data flows are changed.

All data structures (farmer, deed, plot, season, consent, photo, sponsor account, admin user) remain exactly as they were before this feature.

The implementation agent works exclusively in:
- `frontend/src/app/globals.css` — design token custom properties
- `frontend/src/app/layout.tsx` — font loading verification
- `frontend/src/components/dashboard/dashboard-sidebar.tsx` — sidebar component
- `frontend/src/components/dashboard/dashboard-header.tsx` — header component
- `frontend/src/components/ui/button.tsx` — button component styles
- `frontend/src/app/admin/login/page.tsx` — admin login (presentation only)
- `frontend/src/app/sponsor/login/page.tsx` — sponsor login (presentation only)
