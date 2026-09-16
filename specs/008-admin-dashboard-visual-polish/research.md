# Research: Admin Dashboard Visual Polish

## Decision: Use the approved project baseline as the visual authority

- **Decision**: Compare against `visual-qa-screenshots/design-admin-full.png`; use `stitch_netzerocarbon_platform/admin_review_dashboard/screen.png` only for supplemental evidence-review treatments.
- **Rationale**: `REQUIREMENTS.md` names the former as the approved Admin artifact, while the Stitch screen provides useful composition details.
- **Alternatives considered**: Treating the Stitch screen as the sole authority was rejected because it conflicts with the repository's approved baseline.

## Decision: Enhance existing components and primitives

- **Decision**: Modify existing dashboard shell, admin-review components, admin pages, and global styles; use lightweight CSS/SVG for visualization treatments.
- **Rationale**: Matches the constitution's YAGNI principle and avoids dependency or static-export risk.
- **Alternatives considered**: Adding a charting library or interactive map library was rejected as unnecessary for this visual-only scope.

## Decision: Preserve workflows as regression constraints

- **Decision**: Treat authentication, privacy, evidence decisions, Request Retake reason capture, review history, audit records, loading/error states, and existing data behavior as non-changing regression surfaces.
- **Rationale**: Existing Admin requirements AD-AUTH, AD-REV, AD-FAR, and constitution principles require these behaviors.
- **Alternatives considered**: Reworking workflows alongside visual changes was rejected because it expands scope and increases regression risk.

## Decision: Static map thumbnail with explicit fallback

- **Decision**: Render a deterministic map thumbnail or existing project-supported image representation when coordinates are available; render a labeled no-GPS placeholder when unavailable or failed.
- **Rationale**: Meets the visual goal without introducing a runtime map dependency.
- **Alternatives considered**: Interactive maps were rejected as out of scope.

## Decision: Visual comparison protocol

- **Decision**: Use a 10-region inventory at 1280×800 and require at least 8 regions to match composition, hierarchy, and interaction treatment, with no more than 3 minor discrepancies.
- **Rationale**: Makes visual acceptance repeatable and aligns with the spec's measurable criteria.
- **Alternatives considered**: Unscored subjective side-by-side review was rejected because it cannot provide a reproducible gate.
