# Traceability Matrix: Fix Native LINE WET-1 Photo Action

**Feature**: 002-fix-line-photo-action
**Created**: 2026-09-14
**Last Updated**: 2026-09-14

## Overview

This matrix maps each requirement to its implementation, tests, and PR status.

## User Stories

| REQ-ID | Description | Implementation | Tests | Status |
|--------|-------------|----------------|-------|--------|
| US1 | Native LINE calendar photo button opens LIFF camera | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| US2 | All 4 photo rounds work consistently | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| US3 | Error handling for missing LIFF ID | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |

## Functional Requirements

| REQ-ID | Description | Implementation | Tests | Status |
|--------|-------------|----------------|-------|--------|
| FR-001 | Render "ถ่ายรูป" buttons on pending photo steps | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| FR-002 | Use `type: "uri"` action for photo buttons | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| FR-003 | Construct LIFF camera URL with step parameter | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| FR-004 | Preserve plot_id and season_id in URL | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` |  Pending |
| FR-005 | Handle missing LIFF_ID gracefully | `src/line/flex-builders.ts:buildCalendarBubble()` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| FR-006 | Send exactly one reply per webhook event | `src/line/webhook.ts` | `tests/unit/line/webhook.test.ts` | ⏳ Pending |
| FR-007 | Log LIFF URL generation | `src/line/flex-builders.ts:buildCalendarBubble()` | N/A (logging) |  Pending |
| FR-008 | Work in LINE desktop and mobile | `src/line/flex-builders.ts:buildCalendarBubble()` | Manual QA in real LINE | ⏳ Pending |
| FR-009 | Debounce rapid button taps | LIFF app client-side | N/A (client-side) | ⏳ Pending |

## Edge Cases

| REQ-ID | Description | Implementation | Tests | Status |
|--------|-------------|----------------|-------|--------|
| EC-01 | No active season | `src/line/flex-builders.ts` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| EC-02 | No selected plot | `src/line/flex-builders.ts` | `tests/unit/line/calendar-photo-action.test.ts` | ⏳ Pending |
| EC-03 | Rapid repeated taps | LIFF app client-side | N/A (client-side) | ⏳ Pending |
| EC-04 | Network failure loading LIFF | LIFF app client-side | N/A (client-side) |  Pending |
| EC-05 | Farmer closes LIFF without photo | No state change | N/A (no action) | ⏳ Pending |

## Success Criteria

| REQ-ID | Description | Verification Method | Status |
|--------|-------------|---------------------|--------|
| SC-001 | 100% of farmers can open LIFF camera | Manual QA in real LINE | ⏳ Pending |
| SC-002 | LIFF camera loads within 3 seconds | Manual QA timing | ⏳ Pending |
| SC-003 | Photo submission correct 100% | Integration tests | ⏳ Pending |
| SC-004 | Error message within 1 second | Manual QA timing |  Pending |
| SC-005 | Zero duplicate webhook events | Unit tests + logs | ⏳ Pending |

## Summary

- **Total Requirements**: 9 functional + 5 edge cases + 5 success criteria
- **Implemented**: 0/19 (0%)
- **Tested**: 0/19 (0%)
- **Compliance**: Pending

## Verification Gates

- ⏳ Spec compliance: Pending
- ⏳ Typecheck: Pending
-  Test suite: Pending
- ⏳ Convergence audit: Pending

## Notes

- This is a bug fix for the native LINE photo action
- The web chat mock works correctly; the issue is specific to real LINE app
- LIFF app must already exist and be approved by LINE
- LIFF_ID must be set in Cloudflare Workers environment
