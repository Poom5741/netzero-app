# Blueprint — LINE OA Chatbot (Full Farmer Flow)

## Build sequence

Schema → CRUD routes → Registration → Season mgmt → Photo enhance → Carbon trigger → Dashboard → Chat flow → Polish

## Tasks

### Task 01 — Database schema: new tables + alterations
Goal:        Add consent_log table, season_steps table, and alter photo_evidence + season_inputs with new columns
Consumes:    spec.md (data model section)
Produces:    Updated migrate.sql with all schema changes
Acceptance:  `bun run db:init --local` succeeds; all new tables exist; ALTER columns are present
Shape:       src/db/migrate.sql — append new CREATE TABLE + ALTER TABLE statements
Size:        S
Status:      done

### Task 02 — Season CRUD API routes
Goal:        Create routes to create seasons, set sow_date, and compute 9-step calendar
Consumes:    Task 01 (season_steps table), existing season_inputs table
Produces:    POST /api/season/create, GET /api/season-steps/:id, POST /api/season-steps/:id/complete
Acceptance:  POST /api/season/create returns season_input_id + 9 steps with due dates; steps advance on POST /complete
Shape:       src/routes/season.ts — add new handlers; src/season/calendar.ts — step generation logic
Size:        M
Status:      done

### Task 03 — Farmer/Plot CRUD API routes
Goal:        Create routes to register new farmers and plots (currently seed-only)
Consumes:    Task 01 (consent_log table), existing farmers/plots tables
Produces:    POST /api/farmer, POST /api/plot, GET /api/farmer/:id
Acceptance:  POST /api/farmer creates farmer record; POST /api/plot creates plot with auto-generated code
Shape:       src/routes/farmer.ts — new file with farmer + plot handlers
Size:        M
Status:      done

### Task 04 — PDPA consent persistence
Goal:        Record PDPA consents to consent_log table and check before proceeding
Consumes:    Task 01 (consent_log table), Task 03 (farmer CRUD)
Produces:    POST /api/consent, hasAllConsents() actually called in flow
Acceptance:  POST /api/consent writes to consent_log; hasAllConsents() returns false when any consent missing
Shape:       src/trust/consent-persist.ts — new file; modify src/line/consent.ts to persist
Size:        S
Status:      done

### Task 05 — LIFF registration form (LF-01)
Goal:        Build the LIFF registration page where farmers fill personal + plot + deed data
Consumes:    Task 03 (farmer/plot CRUD), Task 04 (consent check)
Produces:    Registration message composers for chat-based flow
Acceptance:  Message composers produce correct Thai text for registration steps
Shape:       src/line/flow-registration.ts — message composers
Size:        L
Status:      done

### Task 06 — LIFF document upload
Goal:        Build the LIFF page for uploading 3 required documents per plot
Consumes:    Task 05 (registration form), R2 bucket
Produces:    composeDocumentPrompt, validateDocumentSubmission, REQUIRED_DOCUMENTS
Acceptance:  Document message composers and validation work correctly
Shape:       src/liff/documents-api.ts — new API handlers
Size:        M
Status:      done

### Task 07 — Photo upload enhancement: water depth
Goal:        Add water_depth_cm field to photo upload for DRY rounds
Consumes:    Task 01 (photo_evidence alteration), existing photo upload route
Produces:    POST /api/photo/upload accepts water_depth_cm for DRY photo types
Acceptance:  DRY photo with water_depth=10 stores value; WRY photo with water_depth=null also works
Shape:       src/routes/photo.ts — add water_depth to FormData parsing + validation
Size:        S
Status:      done

### Task 08 — LIFF camera page (LF-04)
Goal:        Build the LIFF camera page with GPS capture and photo submission
Consumes:    Task 07 (water depth field), existing photo upload API
Produces:    composeCameraPrompt, composePhotoConfirmation, validatePhotoSubmission
Acceptance:  Camera message composers and validation work correctly
Shape:       src/liff/camera-api.ts — new API handlers
Size:        M
Status:      done

### Task 09 — Carbon estimation trigger
Goal:        Wire runEstimation() into season approval flow
Consumes:    Task 02 (season management), existing calc/orchestrator.ts
Produces:    POST /api/season/approve calls runEstimation() and stores result
Acceptance:  Approved season has non-zero total_offset_tco2e; SF_w computed from photo completeness
Shape:       src/season/approve-estimate.ts — new file with enhanced approval logic
Size:        M
Status:      done

### Task 10 — SF_w dynamic computation
Goal:        Compute water management factor from photo completeness instead of hardcoded constant
Consumes:    Task 09 (carbon estimation trigger), photo_evidence table
Produces:    getSfW(plotId, seasonId) returns 0.55 (4 photos) or 0.71 (incomplete)
Acceptance:  4 approved photos → SF_w=0.55; 3 approved → SF_w=0.71; 0 photos → SF_w=1.0
Shape:       src/calc/sf-w.ts — new file; src/calc/factors.ts — export SF_W constants
Size:        S
Status:      done

### Task 11 — Farmer dashboard LIFF page
Goal:        Build the farmer-facing dashboard showing carbon credits, photo progress, tasks
Consumes:    Task 09 (carbon estimation), Task 02 (season steps), existing photo_evidence
Produces:    composeDashboardMessage() for dashboard display
Acceptance:  Dashboard message shows tCO₂eq, photo progress X/4, pending tasks
Shape:       src/liff/dashboard-api.ts — new message composer
Size:        L
Status:      done

### Task 12 — Chat flow state machine: registration steps
Goal:        Implement OB-01 to OB-11 conversation flow with guards and transitions
Consumes:    Task 03 (farmer CRUD), Task 04 (consent), Task 05 (registration form)
Produces:    composeRegistrationWelcome, composePdpaConsent, composeIdentityConfirmation, composeActivationSuccess
Acceptance:  Message composers produce correct Thai text for each registration step
Shape:       src/line/flow-registration.ts — new message composers
Size:        L
Status:      done

### Task 13 — Chat flow state machine: photo reporting steps
Goal:        Implement PJ-00 to PJ-13 conversation flow for seasonal photo reporting
Consumes:    Task 02 (season steps), Task 08 (LIFF camera), Task 07 (water depth)
Produces:    composePhotoReminder, composePhotoAccepted, composePhotoRejected
Acceptance:  Message composers produce correct Thai text for photo reporting flow
Shape:       src/line/flow-photo-reporting.ts — new message composers
Size:        L
Status:      done

### Task 14 — Chat flow state machine: results and backfill steps
Goal:        Implement RP-01 to RP-04 conversation flow for results display and backfill
Consumes:    Task 11 (dashboard), Task 09 (carbon estimation)
Produces:    composeResultsMessage() and composeTodoMessage() for results display
Acceptance:  Messages show carbon credits, photo progress, pending tasks, backfill prompts
Shape:       src/line/flow-results.ts — new message composers
Size:        M
Status:      done

### Task 15 — LIFF calendar page
Goal:        Build the LIFF calendar page showing 9-step season timeline
Consumes:    Task 02 (season steps), Task 08 (camera page)
Produces:    GET /api/liff/calendar/:id returns steps with status and photo flags
Acceptance:  Calendar API returns 9 steps sorted by due_day, photo steps flagged
Shape:       src/liff/calendar-api.ts — new API handler
Size:        M
Status:      done

### Task 16 — LIFF backfill page
Goal:        Build the LIFF page for entering historical season data (3 years)
Consumes:    Task 02 (season CRUD), existing season_inputs schema
Produces:    composeBackfillPrompt, validateBackfillEntry
Acceptance:  Backfill message composers and validation work correctly
Shape:       src/liff/backfill-api.ts — new API handlers
Size:        M
Status:      done

### Task 17 — Staff review enhancement: rejection with reasons
Goal:        Enhance staff review to include rejection reasons and retake deadlines
Consumes:    Task 07 (water depth), existing admin review
Produces:    composeRejectionMessage() with reason + deadline + plot name
Acceptance:  Rejection message includes reason, deadline, and plot name in Thai
Shape:       src/vision/retake-message.ts — add composeRejectionMessage function
Size:        S
Status:      done

### Task 18 — Integration tests: full flow
Goal:        Write end-to-end tests covering registration → photo → results
Consumes:    All prior tasks
Produces:    tests/integration/line-oa-flow.test.ts with full flow coverage
Acceptance:  17 integration tests pass covering all flows
Shape:       tests/integration/line-oa-flow.test.ts — new test file
Size:        L
Status:      done

## Parallelizable tasks

Tasks 02, 03, 04 can run in parallel (independent CRUD routes).
Tasks 05, 06, 07, 08 can run in parallel (independent LIFF pages).
Tasks 12, 13, 14 can run in parallel (independent chat flows).
Tasks 15, 16 can run in parallel (independent LIFF pages).

## Dependency graph

```
01 (schema)
├── 02 (season CRUD)
│   ├── 09 (carbon trigger)
│   │   ├── 10 (SF_w)
│   │   └── 11 (dashboard)
│   │       ├── 14 (results flow)
│   │       └── 15 (calendar)
│   └── 13 (photo flow)
├── 03 (farmer CRUD)
│   ├── 04 (consent)
│   │   └── 05 (registration form)
│   │       ├── 06 (documents)
│   │       └── 12 (registration flow)
├── 07 (water depth)
│   └── 08 (camera)
│       └── 13 (photo flow)
├── 16 (backfill)
└── 17 (rejection enhancement)

18 (integration tests) — after all others
```
