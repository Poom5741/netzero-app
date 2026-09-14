# Feature Specification: Admin Console

**Feature Branch**: `003-admin-console`
**Created**: 2026-09-14
**Status**: Draft
**Input**: User description: "Use REQUIREMENTS.md as the source of truth to specify the remaining Admin Console requirements."

## User Scenarios & Testing

### User Story 1 - Privileged sign-in (Priority: P1)

An authorized administrator or staff member signs in to the branded Admin Console and reaches only the areas permitted by their role.

**Why this priority**: The console must protect farmer and project data before any operational workflow is available.

**Independent Test**: Submit valid and invalid credentials for each role and verify access, denial, remembered-device behavior, and audit notice.

**Acceptance Scenarios**:
1. **Given** a user on the Admin Console login, **When** they submit valid email, password, and OTP, **Then** they enter the console with role-appropriate access.
2. **Given** invalid credentials or OTP, **When** the user submits the form, **Then** access is denied without exposing sensitive account information.
3. **Given** a privileged view or change, **When** it is completed, **Then** the user, time, previous value, and new value are recorded for audit.

### User Story 2 - Operational overview (Priority: P1)

An authorized user views project scope, key metrics, urgent work, credit summaries, and filters to understand what needs attention.

**Why this priority**: The overview is the daily entry point for project operations.

**Independent Test**: Open the overview with representative data, apply province and season filters, and verify metrics, queue actions, charts, and exports update consistently.

**Acceptance Scenarios**:
1. **Given** an authorized user on the overview, **When** the page loads, **Then** it shows supported scope, households, active subplots, area, net credits, work queue, and credit visualizations.
2. **Given** filterable project data, **When** the user selects province or season filters, **Then** all affected metrics and visualizations reflect the selected scope.
3. **Given** an actionable queue item, **When** the user selects its action, **Then** the related review workflow opens.

### User Story 3 - Farmer and application review (Priority: P1)

A reviewer searches the farmer registry, opens a farmer detail, reviews an application and its document checklist, and approves, holds, or requests missing information.

**Why this priority**: Registration review is required to activate farmers safely and accurately.

**Independent Test**: Use owner, co-owner, tenant, and representative applications with complete, missing, and invalid documents.

**Acceptance Scenarios**:
1. **Given** a permitted registry view, **When** the user filters or exports records, **Then** names are shown only where authorized and customer-facing/export data uses CPA codes.
2. **Given** an application with documents, **When** the reviewer opens it, **Then** required, received, missing, and invalid documents are clearly distinguished according to holding type.
3. **Given** an incomplete or valid application, **When** the reviewer requests documents, holds, or approves it, **Then** the decision and reason are preserved and communicated through the supported workflow.

### User Story 4 - Evidence review (Priority: P1)

A verifier reviews submitted evidence with its plot, round, GPS, timestamp, water level, and status, then approves, rejects, or requests a retake.

**Why this priority**: Evidence decisions determine farmer progress and credit treatment.

**Independent Test**: Review accepted, rejected, and retake cases and verify the farmer-facing reason and immutable review history.

**Acceptance Scenarios**:
1. **Given** submitted evidence, **When** the verifier opens it, **Then** the image and all required context are visible.
2. **Given** evidence under review, **When** the verifier approves, rejects, or requests a retake, **Then** a reason is required where applicable and the status changes accordingly.
3. **Given** a prior decision, **When** a new decision is made, **Then** reviewer, timestamp, decision, reason, and prior status remain available in history.

### User Story 5 - Calculation, roles, and reporting (Priority: P2)

An authorized user views traceable calculation inputs and outputs, uses role-appropriate navigation and permissions, and exports reports without leaking protected data.

**Why this priority**: Auditability and controlled reporting support certification and sponsor trust.

**Independent Test**: Exercise each role against the permission categories and verify calculation views, navigation, exports, and audit logs.

**Acceptance Scenarios**:
1. **Given** calculation inputs and evidence status, **When** the user views results, **Then** fixed parameters, baseline/project emissions, uncertainty deduction, and evidence-driven treatment are visible and traceable.
2. **Given** users with different roles, **When** they access navigation and actions, **Then** each receives only the permitted capabilities.
3. **Given** an export request, **When** the user downloads a report, **Then** it contains only fields allowed for that role and context.

### Edge Cases

- Expired, invalid, or missing OTP must fail safely and not reveal whether an account exists.
- A user with no assigned area must see no operational farmer or credit data.
- A filter with no matching records must show an explicit empty state rather than stale data.
- Missing, corrupt, duplicated, or unreadable documents must remain visibly unresolved.
- Evidence missing GPS, timestamp, or water level must not be silently treated as complete.
- Repeated review actions must not erase prior history or create contradictory current status.
- Placeholder or sample data must be labeled wherever live OCR or automation is unavailable.

## Requirements

### Functional Requirements

- **AD-AUTH-01**: The console MUST provide a branded login containing the project identity, purpose, methodology reference, and sign-in form.
- **AD-AUTH-02**: The login MUST support email, password, OTP, remember-device, forgot-password, and submit interactions.
- **AD-AUTH-03**: Privileged reads and writes MUST record user, time, previous value, and new value.
- **AD-OV-01**: The overview MUST identify supported areas and the T-VER-P-METH-13-08 methodology.
- **AD-OV-02**: The overview MUST show households, active subplots, total area, and net credits.
- **AD-OV-03**: The overview MUST show an actionable queue for pending applications, pending evidence, and follow-up items with count and urgency.
- **AD-OV-04**: The overview MUST show verified-versus-estimated credits, area breakdown, and season breakdown.
- **AD-OV-05**: Users MUST be able to filter by province/area, season, and relevant project dimensions.
- **AD-OV-06**: The overview MUST provide actions for credit charts, report export, and evidence review.
- **AD-FAR-01**: The registry MUST show CPA code, authorized farmer name, area, sponsor, subplot count, rai, photo progress, BE, PE, and ER as permitted.
- **AD-FAR-02**: Names and identity details MUST be restricted to authorized admin contexts; customer-facing and export views MUST use CPA codes.
- **AD-FAR-03**: Users MUST be able to filter and export farmer data by CPA code within their permission scope.
- **AD-FAR-04**: Selecting a farmer MUST open plots/documents, behaviors, and photo-history views.
- **AD-FAR-05**: Farmer detail MUST show plot codes, area, rice variety, deed references, evidence status, and calculation inputs according to permission.
- **AD-APP-01**: The application queue MUST show application ID, CPA code, farmer, location, subplot count, area, holding type, document count, age, and status.
- **AD-APP-02**: Review MUST handle owner, co-owner, tenant, and authorized-representative document rules.
- **AD-APP-03**: The document checklist MUST distinguish required, received, missing, and invalid documents.
- **AD-APP-04**: Reviewers MUST be able to request documents, approve complete applications, or hold with a reason.
- **AD-APP-05**: Placeholder or unavailable OCR/automation MUST be labeled honestly.
- **AD-REV-01**: Evidence review MUST show crop, plot, round, GPS, timestamp, water level, image, and status.
- **AD-REV-02**: Reviewers MUST be able to approve, reject, or request retake; rejection and retake decisions MUST include a farmer-communicable reason.
- **AD-REV-03**: Review history MUST preserve reviewer, timestamp, decision, reason, and prior status.
- **AD-CHART-01**: Credit views MUST distinguish verified credits from estimates.
- **AD-CHART-02**: Credit views MUST provide province/area and season breakdowns.
- **AD-CALC-01**: Calculations MUST follow documented T-VER-P-METH-13-08 parameters and evidence-driven SF_w treatment.
- **AD-CALC-02**: Calculation views MUST show traceable inputs and outputs without silently changing farmer fertilizer quantities.
- **AD-ROLE-01**: The console MUST enforce the five roles: admin, verifier, field, sponsor, and auditor.
- **AD-ROLE-02**: Permissions MUST cover dashboard scope, sensitive identity fields, evidence/application review, data entry, bot replies, batch import, recalculation, parameter editing, exports, audit access, and permission administration.
- **AD-NAV-01**: Primary navigation MUST include overview, application review, evidence review, farmers, sponsors, reports, and settings.

### Key Entities

- **Privileged user**: A console user with one of the five defined roles and an assigned data scope.
- **Farmer record**: A CPA-linked farmer and related plots, documents, behaviors, and evidence.
- **Application**: A registration submission with holding type, documents, status, age, and review history.
- **Evidence submission**: A project photo round with image, plot, crop, GPS, timestamp, water level, status, and decisions.
- **Credit calculation**: Traceable inputs, methodology parameters, emissions outputs, uncertainty deduction, and evidence-driven treatment factor.
- **Audit event**: A privileged read or write containing actor, time, action, previous value, and new value.

## Success Criteria

### Measurable Outcomes

- **SC-001**: An authorized user can sign in and reach their permitted overview in under 2 minutes.
- **SC-002**: 100% of privileged review and change actions tested in the console produce an audit event with actor, time, and applicable before/after values.
- **SC-003**: Reviewers can determine document completeness and make an application decision in under 5 minutes for a normal case.
- **SC-004**: Reviewers can determine evidence status and record a decision in under 3 minutes for a normal case.
- **SC-005**: In permission tests, 100% of sponsor-scoped and auditor read-only restrictions prevent unauthorized data access or mutation.
- **SC-006**: Every displayed credit result in the tested sample exposes its source inputs, estimate/verified status, and methodology treatment.
- **SC-007**: All required primary navigation destinations are reachable from the console without losing the active scope or record context.

## Assumptions

- The existing authentication, role, data, and calculation services are authoritative sources for the console.
- Thai is the primary user-facing language, with readable controls and accessible touch targets.
- Live OCR and automation may be unavailable in the first release; unavailable capabilities are labeled rather than simulated as complete.
- Responsive desktop-first behavior is required; mobile parity is limited to usable access unless separately specified.
- Admin Console requirements do not grant sponsors access to personally identifiable farmer data.
- The methodology constants and calculation rules in `REQUIREMENTS.md` are fixed inputs, not redesign scope.

## Out of Scope

- Changing T-VER-P-METH-13-08 methodology or fixed calculation constants.
- Exposing personally identifiable farmer data to sponsor users.
- Treating ordinary LINE chat photos as project evidence.
- Replacing the LINE OA or LIFF farmer journeys.
- Building unavailable OCR or automation merely to remove a placeholder label.
