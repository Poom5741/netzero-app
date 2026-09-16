# Quickstart Validation: Admin Dashboard Visual Polish

This quickstart is a runnable validation guide, not an implementation guide.

## Prerequisites

- Existing project dependencies installed
- Existing admin credentials for authenticated flows
- Access to the deployed admin surface where credentials and environment permit
- Browser-use available for manual visual verification

## Local validation

1. Start the unified dev environment.
2. Open the admin dashboard at the local admin origin.
3. Sign in with authorized admin credentials.
4. Verify the overview page shows KPI tiles, chart, and tables within 3 seconds of navigation.
5. Verify the evidence review page shows photo cards with visible AI confidence treatments and a selectable detail panel.
6. Verify Approve, Reject, and Request Retake remain functional and still preserve reasons and review history.
7. Verify restricted roles do not see unauthorized identity details.
8. Verify image-error and GPS-error states render labeled placeholders.
9. Verify hover, focus, and active feedback on cards, buttons, and tabs.
10. Verify the layout at desktop and tablet viewports.

## Deployed validation

1. Open the deployed admin surface.
2. Repeat the same visual and workflow checks as local validation.
3. Compare the evidence review page against the approved baseline using the 10-region inventory.
4. Confirm at least 8 regions meet composition, hierarchy, and interaction treatment.
5. Confirm no more than 3 minor discrepancies remain.

## Regression checks

- Authentication and unauthorized access remain unchanged.
- Evidence decision workflows remain unchanged.
- Review history and audit records remain unchanged.
- Loading, empty, and error states remain usable.
- Existing unit/integration tests remain green.
- Project compliance script remains green.
