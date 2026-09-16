# UI Regression Contract

The visual refresh is accepted only if these existing user-visible contracts remain true:

- **Authentication**: An authorized admin can sign in and an unauthorized user cannot access protected admin content.
- **Privacy**: Restricted roles do not see farmer identity details outside authorized admin contexts.
- **Evidence decisions**: Approve, Reject, and Request Retake remain available under their existing conditions; Reject/Retake still require and preserve a communicable reason.
- **Review history**: Reviewer, timestamp, decision, reason, and prior status remain visible wherever the existing surface provides them.
- **Auditability**: Existing privileged reads and writes continue to produce their existing audit records.
- **Resilience**: Loading, empty, image-error, GPS-error, and API-error states remain usable and visually contained.
- **Responsive behavior**: Desktop and tablet layouts remain keyboard accessible with visible focus states and usable touch targets.

The contract is verified through existing automated tests plus browser-use checks against the deployed surface when credentials and environment access permit.
