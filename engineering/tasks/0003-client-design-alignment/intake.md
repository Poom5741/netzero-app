# Intake — 0003-client-design-alignment

## Setup (inherited from profile.md)
- Workspace: /Users/poom-work/netzero-app/engineering/ (committed)
- Platform: macOS arm64, zsh
- Role: Lead · Commits: gate (external-content-sourced task — loop-auto unavailable, §12)

## Task framing
Clients delivered requirements as three Claude Design artifacts (public, link-shared).
Full source extracted 2026-09-12 via the claude-artifact-capture recipe — every screen,
state, chat message, and rule is in hand as JSX source. Development = reconcile the
designs against the current implementation and build the gaps.

## References
- Artifact 1 (LINE OA farmer): https://claude.ai/code/artifact/19c446b9-e2f5-4e09-a118-fca56ec0c0c8 — extracted to /tmp/artifact1_files/ (app source: 5a25b866-*.js, 30fbaadd-*.js)
- Artifact 2 (Admin Console): https://claude.ai/code/artifact/161f2305-35de-42f8-83ed-7c90ab4da5a6 — extracted to /tmp/a2_files/
- Artifact 3 (Sponsor Portal): https://claude.ai/code/artifact/0de23b7a-9fb3-433e-8930-7eff56a39e45 — extracted to /tmp/a3_files/
- Capture method: ~/.zcode/skills/claude-artifact-capture/SKILL.md
- Prior implementation: task 0002 (LINE OA chatbot, shipped — deploy 795c54b8); memory notes gaps: unrouted liff handlers, no step seeding in chat path

## Q&A

### Q3 · define · 2026-09-12
Question: Task scope — one task for all 3 surfaces or split per surface?
My guess: one task (surfaces share DB + credit logic)
Answer:   one task (user did not respond; proceeding with recommended default)
Locks:    single spec covers LINE OA + Admin + Sponsor; blueprint may still split construction

### Q4 · define · 2026-09-12
Question: LINE OA unscripted edge paths — define now or defer?
My guess: defer (happy paths are substantial; edge paths are a follow-up)
Answer:   deferred (user did not respond)
Locks:    spec covers only scripted happy paths; unscripted paths in backlog

### Q5 · define · 2026-09-12
Question: Baseline data sets 1, 3–8 (placeholder in artifact) — include or defer?
My guess: defer (set 2 is the only built form)
Answer:   deferred (user did not respond)
Locks:    baseline forms stay as-is; sets 1, 3–8 in backlog

### Q6 · define · 2026-09-12
Question: Admin Console MOCK screens — spec to plan depth or full spec?
My guess: spec to plan depth (mark MOCK screens as phase 2 if they need new APIs)
Answer:   spec to plan depth (user did not respond)
Locks:    MOCK screens get acceptance criteria but no API contract detail
