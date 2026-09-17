# Data Model: Claude Multi-Page Design Parity

This feature adds reference metadata and capture records only. It does not add production business entities or database tables.

## ReferencePage

Represents one human-labeled design page or page group.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `label` | string | yes | Stable identifier such as `AD-OV`, `SP-REPORT`, or `LO-CAMERA`. |
| `surface` | enum | yes | `admin`, `sponsor`, or `line-oa`. |
| `pageName` | string | yes | Human-readable component/page name. |
| `route` | string or null | yes | Existing application route when implemented; null for deferred/reference-only pages. |
| `artifactId` | string | yes | Claude artifact identifier. |
| `sourceModule` | string | yes | UUID-named extracted module or documented source file. |
| `status` | enum | yes | `implemented`, `partial`, `deferred`, or `reference-only`. |
| `states` | string[] | yes | Supported reference states, such as `default`, `loading`, `empty`, or `error`. |

### Validation

- `label` must be unique across the complete map.
- `surface` must match the artifact source directory.
- `route` must only be populated when the route exists in the application.
- A `deferred` or `reference-only` record must never be counted as implemented parity.
- One source module may be linked by multiple `ReferencePage` records when it contains multiple screens.

## CaptureRecord

Represents one deterministic image capture and its provenance.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `captureKind` | enum | yes | `source-reference` or `implementation`. |
| `referenceLabel` | string | yes | Must resolve to a `ReferencePage.label`. |
| `stateName` | string | yes | Must be listed in the reference page's states. |
| `viewportWidth` | integer | yes | Positive viewport width. |
| `viewportHeight` | integer | yes | Positive viewport height. |
| `deviceScaleFactor` | number | yes | Positive capture scale. |
| `sourceHash` | string | yes | Hash of the rendered source input. |
| `fixtureId` | string | yes | Deterministic fixture identifier when fixtures are used. |
| `fontState` | enum | yes | `ready` or `timeout`. |
| `assetStatus` | enum | yes | `ready`, `missing`, or `blocked`. |
| `imagePath` | string | yes | Deterministic path under the visual capture directory. |
| `capturedAt` | timestamp | yes | Capture timestamp. |

### Validation

- Filename must include the reference label/page, state, and viewport.
- `fontState=timeout`, `assetStatus=missing`, or `assetStatus=blocked` prevents a clean parity pass.
- Source and implementation captures must not share the same capture-kind namespace.
- Repeating a capture with identical inputs must produce the same rendered pixels after the configured noise profile is applied.

## VisualTokenSet

Represents the shared visual values applied to Admin and Sponsor surfaces.

| Field | Value | Scope |
|---|---|---|
| `sidebarWidth` | 232px | Desktop dashboard shell |
| `sidebarColor` | `#061E5C` | Dashboard sidebar |
| `primaryColor` | `#028E91` | Primary actions and accents |
| `fontFamily` | Fira Sans + Noto Sans Thai + Fira Mono | Shared typography |
| `surfaceBackground` | `#f0f4f8` | Existing project foundation, unless source surface requires white |
| `shadowFamily` | Claude source navy-tinted shadows | Cards and elevation |

Token exceptions must be documented with the affected route, reason, and verification impact.

## Relationships

```text
ReferencePage 1 ──< CaptureRecord
ReferencePage >── 1 DesignArtifact
ReferencePage >── 1 VisualTokenSet (for Admin/Sponsor shared foundation)
CaptureRecord 1 ── 0..1 ComparisonResult
```
