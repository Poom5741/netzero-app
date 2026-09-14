# Implementation Plan: Fix Native LINE WET-1 Photo Action

**Branch**: `002-fix-line-photo-action` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-fix-line-photo-action/spec.md`

**Note**: This is a bug fix for the native LINE photo action. The web chat mock works correctly; the issue is specific to the real LINE app where the calendar "ถ่ายรูป" button does not open the LIFF camera flow.

## Summary

Fix the Flex message calendar builder to use `type: "uri"` action with LIFF camera URL instead of `type: "postback"` for photo buttons. The LIFF camera URL must include the step code, plot_id, and season_id parameters. Handle missing LIFF_ID gracefully with a Thai error message.

**Technical Approach**: Modify `buildCalendarBubble()` in `src/line/flex-builders.ts` to construct the correct LIFF camera URL and use URI action type. Add error handling for missing LIFF_ID.

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 target)

**Primary Dependencies**: 
- Hono 4.13.3 (web framework)
- Cloudflare Workers runtime
- LINE Messaging API (Flex Messages)

**Storage**: N/A (UI-only change)

**Testing**: Vitest 4.1.11 (unit tests), Manual QA in real LINE app

**Target Platform**: Cloudflare Workers (backend), LINE mobile/desktop app (client)

**Project Type**: Web service + chatbot

**Performance Goals**: 
- LIFF camera URL generation: < 10ms
- Button tap response: immediate (no server round-trip for URI action)

**Constraints**: 
- LINE Flex Message schema (must use valid action types)
- LIFF URL format: `https://liff.line.me/{LIFF_ID}/camera?step={stepCode}`
- replyToken single-use constraint (not applicable here since URI action doesn't send reply)
- LIFF_ID from environment variable (not hardcoded)

**Scale/Scope**: 
- 1 file changed: `src/line/flex-builders.ts`
- 1 test file added: `tests/unit/line/calendar-photo-action.test.ts`
- 4 photo rounds affected: SG-04, SG-05, SG-07, SG-08

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate

**I. Phone-Is-Identity** ✅ PASS (N/A for this UI fix)

**II. Production-First Testing** ✅ PASS
- Manual QA in real LINE app (not web mock)
- Unit tests for URL construction

**III. YAGNI Extremist** ✅ PASS
- Minimal change: only button action type and URL
- No new abstractions

**IV. LINE-Native UX** ✅ PASS
- This fix enables LINE-native UX (LIFF camera within LINE app)
- URI action opens LIFF directly (no postback round-trip)

**V. Design Consistency** ✅ PASS (N/A for this bug fix)

### Post-Design Gate (after Phase 1)

**Status**: All 5 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-line-photo-action/
├── plan.md              # This file
├── research.md          # Phase 0 output (skipped - simple fix)
── data-model.md        # Phase 1 output (skipped - no data changes)
── quickstart.md        # Phase 1 output (skipped - manual QA only)
├── contracts/           # Phase 1 output (skipped - no API changes)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/line/
── flex-builders.ts     # Modify buildCalendarBubble() function

tests/unit/line/
└── calendar-photo-action.test.ts  # New test file
```

**Structure Decision**: Single file change in `src/line/flex-builders.ts`. The `buildCalendarBubble()` function currently renders photo buttons but may use the wrong action type or URL format. Add unit tests to verify the correct URI action with LIFF camera URL.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Phase 0: Research (Skipped)

This is a simple bug fix with clear root cause:
- Current code may use `type: "postback"` instead of `type: "uri"`
- URL may not include step/plot/season parameters
- No research needed; proceed directly to implementation

## Phase 1: Design (Skipped)

No data model or API contract changes. The fix is purely in the Flex message builder.

## Phase 2: Implementation Tasks

See `tasks.md` for detailed task breakdown.

Key tasks:
1. Inspect current `buildCalendarBubble()` implementation
2. Change photo button action from `postback` to `uri`
3. Construct LIFF camera URL with step, plot_id, season_id parameters
4. Add error handling for missing LIFF_ID
5. Add unit tests for URL construction
6. Manual QA in real LINE app
