# Claude Design Artifacts — Complete Page Map

## Overview

The Claude Design artifacts are complete React component implementations spanning all three product surfaces. They are not single-page references: each extracted source file contains one or more pages, shared components, fixture data, or runtime dependencies.

The extraction is preserved in `visual-qa-screenshots/` and is the authoritative design reference used by `docs/design-inventory.md`.

## Artifact Sources

| Surface | Artifact HTML | Extracted directory | Source artifact ID |
|---|---|---|---|
| Admin Console | `visual-qa-screenshots/admin.html` | `visual-qa-screenshots/admin-extracted/` | `161f2305-35de-42f8-83ed-7c90ab4da5a6` |
| Sponsor Portal | `visual-qa-screenshots/sponsor.html` | `visual-qa-screenshots/sponsor-extracted/` | `0de23b7a-9fb3-433e-8930-7eff56a39e45` |
| LINE OA / LIFF | `visual-qa-screenshots/line-oa.html` | `visual-qa-screenshots/line-oa-extracted/` | `19c446b9-e2f5-4e09-a118-fca56ec0c0c8` |

`index.html` in each extracted directory is the artifact entrypoint. The UUID-named files are the asset graph unpacked from that entrypoint.

## What the Extracted Files Are

| Extension | Meaning | Notes |
|---|---|---|
| `.js` | Executable artifact source | Includes React runtime, design-system runtime, shared components, screen components, fixture data, and calculation logic. |
| `.bin` | Binary resource | Usually a WOFF2 font or other asset whose original URL was replaced by a UUID during extraction. Inspect MIME metadata in the parent artifact manifest. |
| `index.html` | Artifact shell | Loads the extracted assets and mounts the selected pages. It is useful for rendering the original design, not for importing into Next.js. |

The large JavaScript files are vendor/runtime bundles and should **not** be copied into `frontend/src`. The smaller UUID-named modules are the useful source references.

## Admin Console Page Map

| Label | Page/component | Source module | Current route |
|---|---|---|---|
| AD-AUTH | `LoginScreen` | `9482f706-3071-47ef-a10d-293ec76b9810.js` | `/admin/login` |
| AD-OV | `OverviewScreen` | `1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2.js` | `/admin` |
| AD-REV | `ReviewScreen` | `1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2.js` | `/admin/applications` and evidence review components |
| AD-APP | `ApplicationsScreen` | `f24453af-9d15-48ee-beda-8e32cfc14985.js` | `/admin/applications` |
| AD-FAR | `FarmersScreen` | `80e8634d-4689-4d3e-96ed-6ce38f681e25.js` | `/admin/farmers` |
| AD-CHART | `ChartsScreen` and charts | `80e8634d-4689-4d3e-96ed-6ce38f681e25.js` | `/admin/charts` (reference route; verify implementation) |
| AD-REPORT | `ReportsScreen` | `8c07477b-0027-4c54-88fe-c86bba24472b.js` | `/admin/reports` |
| AD-SPONSOR | `SponsorsScreen` | `8c07477b-0027-4c54-88fe-c86bba24472b.js` | `/admin/sponsors` |
| AD-SETTINGS | `SettingsScreen` | `20301eef-f947-40de-b124-763f338e3c60.js` | `/admin/settings` |
| AD-IMPORT | `ImportScreen` | `f24453af-9d15-48ee-beda-8e32cfc14985.js` | Reference only; no confirmed route |
| AD-MAP | `MapScreen` | `f24453af-9d15-48ee-beda-8e32cfc14985.js` | Reference only; no confirmed route |
| AD-CHAT | `ChatModeScreen` | `f24453af-9d15-48ee-beda-8e32cfc14985.js` | Reference only; no confirmed route |
| AD-CALC | `computePlotSeason`, `CalcTrace` | `3ee05776-efb9-4d93-ae7f-7be67557cbf3.js` and screen modules | Shared calculation reference |

## Sponsor Portal Page Map

| Label | Page/component | Source module | Current route |
|---|---|---|---|
| SP-AUTH | `LoginScreen` | `a350f295-58c9-44bd-9b11-b1f3c64738da.js` | `/sponsor/login` |
| SP-OV | `SponsorOverview` | `7ccc65fc-cc06-41a3-8112-7407b6d435bb.js` | `/sponsor` |
| SP-AREA | `SponsorAreas` | `7ccc65fc-cc06-41a3-8112-7407b6d435bb.js` | `/sponsor/areas` |
| SP-REPORT | `SponsorReports` | `7ccc65fc-cc06-41a3-8112-7407b6d435bb.js` | `/sponsor/reports` |

## LINE OA / LIFF Page Map

| Label | Page/component | Source module | Current route |
|---|---|---|---|
| LO-SCRIPT | Chat script, 10 scenes / 43 steps | `5a25b866-38ba-416b-afff-53fe6c36cc28.js` | Native LINE flow; `/chat` is only a demo |
| LO-MENU | Rich menu definition | `5a25b866-38ba-416b-afff-53fe6c36cc28.js` | LINE channel configuration |
| LO-SHELL | `LiffShell` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | Shared LIFF shell |
| LO-REGISTER | `LiffRegister` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | `/register` |
| LO-DOCS | `LiffDocs` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | `/docs` |
| LO-CAMERA | `LiffCamera` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | `/camera` |
| LO-CALENDAR | `LiffCalendar` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | `/calendar` |
| LO-SUMMARY | `LiffSummary` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | `/summary` |
| LO-FIELDS | `LiffFields` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | Reference only; route to verify |
| LO-CONTACT | `LiffContact` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | Reference only; route to verify |
| LO-BASELINE | `LiffBaseline` | `30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js` | Reference only; route to verify |

## Shared Claude Design System

The screen modules depend on a shared runtime exposed as:

```js
window.NetZeroCarbonDesignSystem_f3e7a8
```

Important exports include:

`Logo`, `Button`, `Badge`, `Tag`, `Icon`, `StatTile`, `FilterBar`, `DataTable`, `ProgressBar`, `GradientRule`, `Field`, `Input`, `Select`, `Textarea`, `Checkbox`, and `IconButton`.

These are reference implementations. They cannot be imported directly by the Next.js app because they expect a browser global, React 18 globals, artifact-relative assets, and runtime fixture globals such as `FARMERS` and `PROVINCES`.

## Correct Application Strategy

1. Treat each smaller source module as a labeled reference for one or more screens.
2. Port only the required component behavior and tokens into the existing typed Next.js components.
3. Keep business logic and API calls in the current app; do not copy artifact fixtures or browser-global dependencies into production.
4. Use the artifact HTML to render and capture visual references, not as a production dependency.
5. Compare each route/state against the matching label above and record evidence in `tests/visual/`.

## Important Correction

The extracted artifacts are **not a Framer project export**. They are Claude artifact HTML bundles containing React code and binary resources. The UUID filenames are bundle asset identifiers, not meaningful component names. The mapping above is the stable human-readable label to use in code reviews, visual baselines, and requirement cross-references.
