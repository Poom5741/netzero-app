# Data Model: Reference Captures and Visual Comparison

**Feature**: 005-reference-captures-comparison
**Date**: 2026-09-15

## Entities

### FixtureRecord (abstract base)

Base shape for all synthetic fixture data. Not a runtime entity — a design constraint ensuring all fixtures are deterministic and auditable.

- `id`: string (stable synthetic identifier, e.g., "fix-farmer-001")
- `createdAt`: string (fixed ISO 8601 date)
- `updatedAt`: string (fixed ISO 8601 date)

### FarmerFixture

Synthetic farmer record for reference rendering.

- Extends `FixtureRecord`
- `phone`: string (synthetic, e.g., "08X-XXX-XXXX" pattern)
- `name`: string (Thai name, deterministic)
- `deeds`: DeedFixture[] (1-3 per farmer)
- `status`: "registered" | "pending" | "active"

### DeedFixture

Synthetic land deed linked to a farmer.

- Extends `FixtureRecord`
- `farmerId`: string (references FarmerFixture.id)
- `plots`: PlotFixture[] (1-4 per deed)
- `areaRai`: number (fixed value)
- `province`: string (Thai province name)

### PlotFixture

Synthetic plot within a deed.

- Extends `FixtureRecord`
- `deedId`: string (references DeedFixture.id)
- `cropType`: string (e.g., "ข้าว", "อ้อย", "มันสำปะหลัง")
- `areaRai`: number
- `seasons`: SeasonFixture[]

### SeasonFixture

Synthetic growing season for a plot.

- Extends `FixtureRecord`
- `plotId`: string (references PlotFixture.id)
- `startDate`: string (fixed: "2026-01-15")
- `endDate`: string | null (fixed: "2026-09-30" or null for active)
- `status`: "active" | "completed" | "planned"
- `carbonEstimate`: number | null (synthetic, clearly not verified)
- `verificationStatus`: "unverified" (always — constitution Principle V)

### AdminUserFixture

Synthetic admin user for Admin console reference.

- Extends `FixtureRecord`
- `username`: string
- `role`: "admin" | "reviewer"
- `displayName`: string (Thai)

### SponsorAccountFixture

Synthetic sponsor account with CPA-scoped access.

- Extends `FixtureRecord`
- `cpaCode`: string (e.g., "CPA-001")
- `assignedArea`: string (province/region)
- `displayName`: string

### CaptureProvenance

Metadata record for a single reference capture.

- `artifactId`: string (source artifact UUID from #142 inventory)
- `screenName`: string (e.g., "admin-login", "sponsor-overview")
- `stateName`: string (e.g., "default", "loading", "error", "empty")
- `viewport`: { `width`: number, `height`: number }
- `deviceScaleFactor`: number (1 | 2 | 3)
- `fixtureId`: string (references which fixture data set was used)
- `fontState`: "ready" | "timeout"
- `captureTimestamp`: string (ISO 8601)
- `sourceHash`: string (SHA-256 of rendered HTML source)
- `captureTool`: string (always "playwright" for automated captures)
- `noiseProfileId`: string (references NoiseProfile)

### NoiseProfile

Per-region noise measurement from repeat captures.

- `id`: string (e.g., "np-admin-overview-1280x720")
- `screenName`: string
- `viewport`: { `width`: number, `height`: number }
- `deviceScaleFactor`: number
- `captureCount`: number (always 5)
- `regions`: NoiseRegion[]
- `createdAt`: string (ISO 8601)

### NoiseRegion

Per-region noise data within a NoiseProfile.

- `name`: string ("header" | "sidebar" | "content" | "footer")
- `bounds`: { `x`: number, `y`: number, `width`: number, `height`: number }
- `maxDiffPixels`: number (maximum non-matching pixels across all capture pairs)
- `tolerance`: number (maxDiffPixels + 1)
- `avgDiffPixels`: number (mean across capture pairs)

### ComparisonResult

Output of comparing two images.

- `referencePath`: string (file path to reference image)
- `implementationPath`: string (file path to implementation image)
- `dimensionsMatch`: boolean
- `dimensionMismatchError`: string | null (if dimensions differ)
- `overallPass`: boolean
- `regions`: RegionComparison[]
- `diffImagePath`: string (always produced, even on pass)
- `overlayImagePath`: string (always produced)
- `timestamp`: string (ISO 8601)

### RegionComparison

Per-region comparison result.

- `regionName`: string
- `diffPixels`: number
- `tolerance`: number
- `pass`: boolean
- `diffPercentage`: number (0-100)

### CoverageEntry

One row in the coverage manifest.

- `screenName`: string
- `stateName`: string
- `surface`: "line-oa" | "admin" | "sponsor"
- `sourceArtifactId`: string
- `captureStatus`: "complete" | "blocked-missing-source" | "blocked-not-implemented"
- `viewportCoverage`: number (0-5, count of viewports captured)
- `blockerReason`: string | null
- `provenancePath`: string | null

## Relationships

```
FarmerFixture 1──* DeedFixture 1──* PlotFixture 1──* SeasonFixture

CaptureProvenance *──1 NoiseProfile (via noiseProfileId)

ComparisonResult 1──* RegionComparison

CoverageEntry → sourceArtifactId (references #142 inventory manifest)
```

## Validation Rules

- All fixture dates are fixed: season start "2026-01-15", "today" is "2026-09-15"
- All fixture phone numbers follow synthetic pattern (no real numbers)
- SeasonFixture.verificationStatus is always "unverified" (never "verified")
- SponsorAccountFixture always has a cpaCode (constitution Principle VI)
- NoiseRegion.tolerance >= NoiseRegion.maxDiffPixels (never relaxed below measurement)
- ComparisonResult.dimensionsMatch=false → no diff/overlay images produced, dimensionMismatchError is set
- CoverageEntry.captureStatus="blocked-*" → blockerReason is non-null
