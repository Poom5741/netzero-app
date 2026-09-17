# Route Parity Matrix Contract

The route parity matrix is the review contract for this feature. Each in-scope row must identify the source label, route, expected states, and verification status.

| Surface | Label | Route | Required states | Clean pass requires |
|---|---|---|---|---|
| Admin | AD-AUTH | `/admin/login` | default, error, loading | Source and implementation captures; auth behavior unchanged |
| Admin | AD-OV | `/admin` | default, loading, empty | Source and implementation captures; dashboard data preserved |
| Admin | AD-REV | `/admin/applications` / evidence review | default, rejecting, decided | Review actions, reasons, and audit behavior preserved |
| Admin | AD-FAR | `/admin/farmers` | default, filtered, empty | Farmer privacy and current table behavior preserved |
| Admin | AD-REPORT | `/admin/reports` | default, loading | Existing exports/report states preserved |
| Admin | AD-SPONSOR | `/admin/sponsors` | default, empty | Sponsor assignment behavior preserved |
| Admin | AD-SETTINGS | `/admin/settings` | default, roles, accounts, constants, notifications, general | Existing settings behavior preserved |
| Sponsor | SP-AUTH | `/sponsor/login` | default, error, loading | Sponsor authentication behavior unchanged |
| Sponsor | SP-OV | `/sponsor` | default, loading, empty | Assigned-area scope and CPA-code-only presentation preserved |
| Sponsor | SP-AREA | `/sponsor/areas` | default, filtered, empty | No personal data or out-of-scope areas exposed |
| Sponsor | SP-REPORT | `/sponsor/reports` | default, loading, empty | Allowed exports and certificates remain scoped |

## Deferred Reference Rows

These rows may remain in the artifact map but do not receive production parity implementation in this feature:

- `AD-APP` as a separate new application screen
- `AD-IMPORT`
- `AD-MAP`
- `AD-CHAT`
- `AD-CHART`
- `LO-FIELDS`
- `LO-CONTACT`
- `LO-BASELINE`
- `LO-SCRIPT` and `LO-MENU` native rendering parity

## Acceptance Rule

A route is complete only when its row has a labeled source reference, an implementation capture, a provenance record, a comparison result, and a documented outcome for any unexplained mismatch. Deferred rows must not be counted toward the complete parity total.
