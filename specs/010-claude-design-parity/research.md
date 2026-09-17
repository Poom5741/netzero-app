# Research: Claude Multi-Page Design Parity

## Decision 1: Use the extracted Claude HTML bundles as source references, not production imports

- **Decision**: Render the existing `visual-qa-screenshots/{admin,sponsor,line-oa}.html` artifact bundles in a reference-only harness. Keep UUID-named `.js` and `.bin` files outside `frontend/src`.
- **Rationale**: The bundles depend on browser globals, artifact-relative assets, fixture globals, and bundled runtimes. Importing them would couple production to an opaque artifact runtime and violate the constitution's YAGNI and safe-boundary principles.
- **Alternatives considered**:
  - Importing extracted modules directly into Next.js: rejected because they are not typed modules and require `window.NetZeroCarbonDesignSystem_f3e7a8`, React globals, and artifact fixtures.
  - Rebuilding every artifact page: rejected because missing application routes are explicitly deferred.

## Decision 2: Keep one human-readable artifact map as the source of visual traceability

- **Decision**: Extend the existing artifact map and visual screen definitions with stable labels, source artifact IDs, source module names, current route, scope status, and capture states.
- **Rationale**: UUID filenames are bundle identifiers, not usable review labels. A single map prevents conflicting route/module claims across the inventory and visual harness.
- **Alternatives considered**:
  - Relying on filenames alone: rejected because one module can contain multiple screens.
  - Maintaining separate Admin/Sponsor/LINE maps: rejected because it increases drift and duplicates the same metadata model.

## Decision 3: Reuse the current capture, provenance, comparison, and noise utilities

- **Decision**: Add source-reference capture support to the existing `tests/visual/lib/capture.ts` and reference-harness flow, preserving existing provenance and comparison formats.
- **Rationale**: The repository already has Playwright, image comparison, provenance, deterministic fixtures, and a capture CLI. New parallel tooling would duplicate infrastructure and create competing baselines.
- **Alternatives considered**:
  - Add a new export/capture framework: rejected as unnecessary and contrary to the existing test architecture.
  - Treat historical `design-*-full.png` files as ground truth: rejected because the inventory documents their wrapper-frame and pixel-fidelity limitations.

## Decision 4: Reconcile visual tokens in the existing frontend foundation

- **Decision**: Update the existing `frontend/src/app/globals.css` and shared dashboard/auth components to the Claude source values where they differ, with explicit tests for geometry, typography, responsive behavior, and touch targets.
- **Rationale**: The app already has shared CSS variables and shared shell/login components. Replacing them in place is smaller and safer than adding a second design-system layer.
- **Alternatives considered**:
  - Add a parallel Claude component package: rejected because it would duplicate existing primitives.
  - Copy artifact components verbatim: rejected because artifact components are browser-global reference code, not production-ready typed components.

## Decision 5: Treat the existing implementation as the behavior authority

- **Decision**: Preserve routes, API calls, role restrictions, audit records, evidence decisions, loading/error/empty states, and sponsor scoping while changing visual presentation.
- **Rationale**: The constitution and feature spec make behavior preservation a hard boundary. Visual parity must not silently change security or domain behavior.
- **Alternatives considered**:
  - Align behavior to artifact fixtures: rejected because fixtures are illustrative and must not override production behavior.
  - Expand scope to missing artifact screens: rejected because that is a separate product feature.

## Decision 6: Use a bounded viewport matrix

- **Decision**: Capture source and implementation references at 1280×720 and 1440×900 desktop sizes, plus 390×844 where the existing environment can render it reliably. Record unsupported or blocked narrow captures explicitly.
- **Rationale**: These sizes align with the repository's existing capture utilities and visual QA history. The feature must not claim formal parity when the environment cannot produce a trustworthy capture.
- **Alternatives considered**:
  - Use only one desktop viewport: rejected because responsive behavior is in scope.
  - Require native LINE device captures for this web parity feature: rejected because native LINE verification is explicitly deferred.
