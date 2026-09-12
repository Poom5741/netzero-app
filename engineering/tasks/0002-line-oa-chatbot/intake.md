# Intake — LINE OA Chatbot (Full Farmer Flow)

## References
- Design system artifact: https://claude.ai/code/artifact/19c446b9-e2f5-4e09-a118-fca56ec0c0c8
- Existing codebase: src/ (Hono routes, D1, R2, LIFF frontend)
- PM testing handoff: tests/poc1-verification/PM-TESTING-HANDOFF.md

## Q&A

### Q1 · define · 2026-09-11
Question: Which parts of the design system are net-new vs already implemented?
My guess: Registration flow (OB) and dashboard (RP) partially exist; photo reporting (PJ) and LIFF pages are mostly new.
Answer:   Build all together — full production, all 43 steps.
Locks:    Scope = complete design system, not incremental.

### Q2 · define · 2026-09-11
Question: Build ambition — MVP or full production?
My guess: Full production, since the design system defines every step and edge case.
Answer:   Full / Production — all edge cases, rejection flows, backfill, dashboard tabs.
Locks:    Build depth = complete, not lean.

### Q3 · define · 2026-09-11
Question: Where does the engineering workspace live?
My guess: Inside the repo at /Users/poom-work/netzero-app/engineering/, committed.
Answer:   Keep in repo, committed (team-visible through git).
Locks:    Workspace path and exposure.

### Q4 · define · 2026-09-11
Question: Priority order — which flow to build first?
My guess: Build all together in one task.
Answer:   Build all together — registration through dashboard.
Locks:    Single task, not phased delivery.

### Q5 · define · 2026-09-11
Question: Does the existing codebase already implement any of these flows?
My guess: Partial — there's a chat system (src/chat/), photo upload (src/photo/), season management (src/season/), and LIFF pages (src/liff/). Need to check what's actually working vs stub.
Answer:   VERIFIED via codebase audit. See gap analysis below.
Locks:    Gap analysis — what's new vs what's enhancement.

### Q6 · define · 2026-09-11
Question: Do you approve the spec for the LINE OA Chatbot feature?
My guess: Approve — proceed to blueprint.
Answer:   Approved. Proceed to blueprint.
Locks:    Spec scope locked. No changes to success criteria or "not doing" list without re-approval.

### Q7 · blueprint · 2026-09-11
Question: Do you approve the implementation plan (18 tasks, ordered)?
My guess: Approve — start building.
Answer:   Approved. Start construct phase.
Locks:    Task order and shapes locked. Amendments require re-approval.

## Gap Analysis (from codebase audit)

### Already Implemented (functional)
- AI chat with OpenRouter (src/chat/ai.ts) — stateless, no multi-turn
- Photo upload with GPS, CLIP classifier, auto-verify (src/routes/photo.ts)
- Carbon credit calculation engine (src/calc/ — all 4 gases)
- Farmer trust score with Bayesian smoothing (src/trust/)
- PDPA consent card display (src/line/consent.ts) — but never checked
- Phone matching (src/line/phone-match.ts)
- Admin photo review queue (src/admin/)
- Frontend: chat, upload, summary, admin review, sponsor dashboard
- D1 schema: 13 tables with indexes

### Critical Gaps (no implementation at all)
1. **Carbon estimation never triggered** — runEstimation() exists but no route calls it
2. **No sow_date input** — phase windows can't be computed
3. **EXIF extraction is a no-op** — always returns null
4. **LINE webhook disabled** — using LIFF standalone chat
5. **No farmer/plot/season CRUD routes** — all data from seed SQL
6. **Queue digest has no trigger** — computed but never invoked
7. **No water depth input on photo upload** — only via summary form
8. **PDPA consent never checked** — hasAllConsents() exists but never called
9. **LIFF pages not wired** — plot-selection.ts and camera.ts are utilities, no routes
10. **water_management not mapped to SF_w** — hardcoded constants
