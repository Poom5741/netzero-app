# Feature Specification: Sponsor Dashboard

**Feature Branch**: `004-sponsor-dashboard`
**Created**: 2026-09-14
**Status**: Draft
**Input**: User description: "Use REQUIREMENTS.md as the source of truth to specify the Sponsor Dashboard requirements."

## User Scenarios & Testing

### User Story 1 - Sponsor sign-in and scoped access (Priority: P1)

A sponsor representative signs in and sees only the areas configured for their account, with no access to personally identifiable farmer data.

**Why this priority**: Scope enforcement is the foundation of sponsor trust and PDPA compliance.

**Independent Test**: Sign in with each sponsor account and verify that only their configured areas appear and that no names, phone numbers, identity numbers, or deed numbers are visible.

**Acceptance Scenarios**:
1. **Given** a sponsor on the Portal login, **When** they submit valid credentials with OTP, **Then** they enter the dashboard restricted to their authorized areas.
2. **Given** a sponsor account, **When** they view any page, **Then** only their configured supported areas are visible and no other sponsor's areas appear.
3. **Given** a sponsor user, **When** they browse records, **Then** no personally identifiable farmer data is exposed; records use CPA codes and subplot codes.

### User Story 2 - Certified credits and supported area (Priority: P1)

A sponsor views their verified credits prominently, along with the supported area, households benefited, and credit-by-season chart.

**Why this priority**: Credits and impact are the sponsor's primary value proposition.

**Independent Test**: Open the overview with representative data and verify certified credits, area, households, and seasonal chart render with correct scope.

**Acceptance Scenarios**:
1. **Given** a sponsor on the overview, **When** the page loads, **Then** a prominent card shows verified credits in tCO₂eq with certification period and estimate caveat.
2. **Given** a sponsor with configured areas, **When** they view the overview, **Then** supported area, rai, hectares, subplot count, and crop-cycle information are visible.
3. **Given** a sponsor account, **When** they view the overview, **Then** the count of supported households and an explanatory methodology note are shown.
4. **Given** seasonal credit data, **When** the chart renders, **Then** verified credits and estimates are visually distinguished.

### User Story 3 - Estimate transparency and credit difference (Priority: P2)

A sponsor understands why estimates differ from verified credits and sees the source of the baseline/project credit difference.

**Why this priority**: Transparency builds confidence in the methodology and supports sponsor reporting.

**Independent Test**: View the overview with both verified and estimated data and verify the uncertainty note and credit-difference table.

**Acceptance Scenarios**:
1. **Given** estimated credits are present, **When** the sponsor views the overview, **Then** a note explains that estimates may change when evidence is incomplete and a conservative water-management factor is used.
2. **Given** baseline and project emissions data, **When** the sponsor views the credit-difference table, **Then** the table explains the baseline/project difference, methane contribution, and fertilizer parity where applicable.

### User Story 4 - Filtering and export (Priority: P2)

A sponsor filters their data by province/area and season within their authorized scope and exports a CPA-coded summary.

**Why this priority**: Filtering and export support sponsor reporting and certification documentation.

**Independent Test**: Apply filters and export; verify that only authorized data is included and that no personally identifiable information appears in the export.

**Acceptance Scenarios**:
1. **Given** a sponsor with multiple authorized areas, **When** they apply province/area or season filters, **Then** all views update within their authorized scope.
2. **Given** filtered data, **When** the sponsor downloads the summary, **Then** the export contains only CPA-coded data permitted for their scope.

### Edge Cases

- A sponsor with no configured areas must see an explicit empty state, not a blank page.
- A filter combination with no matching records must show an empty state without error.
- An export with no data must produce a valid empty file or an explicit message, not a corrupted download.
- Verified and estimated credits must remain visually distinct under all filter combinations.
- A sponsor attempting to access another sponsor's area URL directly must be denied.

## Requirements

### Functional Requirements

- **SP-AUTH-01**: The Portal MUST provide a branded login with Sponsor Portal identity, NetZeroCarbon branding, supported-area title, scoped-access explanation, methodology reference, email, password, OTP, remember-device, and audit notice.
- **SP-AUTH-02**: Login and dashboard MUST expose only areas configured for the sponsor account.
- **SP-OV-01**: The overview MUST identify the supported province/area and methodology.
- **SP-OV-02**: The overview MUST explain that sponsor views use CPA codes and do not expose names, phone numbers, identity numbers, or deed numbers.
- **SP-OV-03**: A prominent card MUST show verified credits in tCO₂eq with certification period and estimate caveat.
- **SP-OV-04**: The overview MUST show rai, hectares, subplot count, and crop-cycle information.
- **SP-OV-05**: The overview MUST show the count of supported households with an explanatory methodology note.
- **SP-OV-06**: The overview MUST show credits by season with verified and estimate distinction.
- **SP-OV-07**: The overview MUST note that estimates can change when evidence is incomplete and a conservative water-management factor is used.
- **SP-OV-08**: The overview MUST show a table explaining baseline/project credit difference, methane contribution, and fertilizer parity.
- **SP-OV-09**: Users MUST be able to filter by province/area and season within their authorized scope.
- **SP-OV-10**: Users MUST be able to download a summary containing only authorized CPA-coded data.
- **SP-BR-01**: Sponsor users MUST see only their configured supported areas.
- **SP-BR-02**: Sponsor users MUST NOT browse other sponsors' areas.
- **SP-BR-03**: Sponsor users MUST NOT access personally identifiable farmer records.
- **SP-BR-04**: Customer-facing and exported records MUST use CPA code and subplot code instead of names and identity data.
- **SP-BR-05**: Verified credits and estimates MUST be visibly distinguished.
- **SP-NAV-01**: Primary navigation MUST include overview, areas, and reports/certificates.

### Key Entities

- **Sponsor account**: A company user with configured supported areas and restricted data scope.
- **Supported area**: A province/area assigned to a sponsor, with rai, hectares, subplots, crop cycle, and household count.
- **Credit record**: Verified and estimated credits in tCO₂eq with certification period and seasonal breakdown.
- **Credit difference**: Traceable explanation of baseline/project emissions difference, methane contribution, and fertilizer parity.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A sponsor can sign in and reach their overview in under 2 minutes.
- **SC-002**: In permission tests, 100% of sponsor accounts see only their configured areas and zero personally identifiable farmer data.
- **SC-003**: Verified and estimated credits are visually distinguishable in 100% of tested views and filter combinations.
- **SC-004**: A sponsor can apply filters and download an export in under 3 minutes.
- **SC-005**: Every exported file contains only CPA-coded data permitted for the sponsor's scope.
- **SC-006**: The credit-difference explanation is present and understandable in all tested scenarios.

## Assumptions

- Sponsor accounts are pre-configured with their supported areas by an administrator.
- Thai is the primary user-facing language.
- The sponsor portal reuses the existing authentication, role, and calculation services.
- Responsive desktop-first behavior is required; mobile parity is limited to usable access.
- The methodology constants are fixed inputs, not redesign scope.

## Out of Scope

- Changing T-VER-P-METH-13-08 methodology or fixed calculation constants.
- Exposing personally identifiable farmer data to sponsor users.
- Building unavailable OCR or automation merely to remove a placeholder label.
- Replacing the LINE OA or LIFF farmer journeys.
- Granting sponsors access to Admin Console workflows.
