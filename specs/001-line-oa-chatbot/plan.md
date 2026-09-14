# Implementation Plan: LINE OA Chatbot for Farmer Registration & Photo Reporting

**Branch**: `001-line-oa-chatbot` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-line-oa-chatbot/spec.md`

**Note**: This plan documents the implementation of an already-completed feature. The code exists and passes 36/36 compliance checks. This plan captures the technical decisions and architecture for reference.

## Summary

Build a LINE Official Account chatbot that guides Thai farmers through registration (PDPA consent, phone verification, identity confirmation, LIFF form, document upload) and photo reporting (4 rounds: WET-1, DRY-1, WET-2, DRY-2) for carbon credit verification. The system uses LINE Messaging API for chat, LIFF for camera/form access, and calculates water management scaling factors (SF_w) based on photo completeness.

**Technical Approach**: State machine-driven conversation flow with flex messages for rich UI, LIFF deep-links for camera/file access, and D1/R2 for storage. Phone number is the primary identity (no account verification).

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 target)

**Primary Dependencies**: 
- Backend: Hono 4.13.3 (web framework), Cloudflare Workers runtime
- Frontend: Next.js 16.3 (static export), Tailwind CSS v4
- LINE: Messaging API, LIFF SDK
- AI: OpenRouter (Qwen 3.6 Flash) for photo verification
- Storage: Cloudflare D1 (SQLite), R2 (images), KV (sessions)

**Storage**: Cloudflare D1 (SQLite database for farmers, plots, seasons, photos), R2 (photo evidence storage), KV (session tokens)

**Testing**: Vitest 4.1.11 (unit/integration), Playwright 1.62.1 (e2e), browser-use (manual QA against production)

**Target Platform**: Cloudflare Workers (backend), Web browsers (frontend), LINE mobile app (chatbot interface)

**Project Type**: Web service + chatbot + static frontend

**Performance Goals**: 
- 500 concurrent farmers without degradation
- Message delivery < 3 seconds
- Photo upload and verification < 10 seconds
- Dashboard load < 2 seconds

**Constraints**: 
- D1 SQLite concurrent write limitation (mutex/batch required)
- LINE replyToken single-use (batch replies)
- Cloudflare Workers CPU time limit (10ms free, 50s paid)
- R2 image storage costs (compress uploads)
- LIFF camera required for GPS capture (chat photos rejected)

**Scale/Scope**: 
- 500 pilot farmers (Phase 1)
- 4 photo rounds per season per plot
- 9-step calendar per season (120 days)
- 6 rich menu items
- 15 conversation states

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate

**I. Phone-Is-Identity** ✅ PASS
- Farmer identity = phone number, no account verification
- If phone matches, trust immediately
- Implementation: `src/line/flow.ts` uses phone lookup, no password/email

**II. Production-First Testing** ✅ PASS
- Tests run against production URLs (workers.dev)
- TDD mandatory: tests written → fail → implement → pass
- Implementation: `tests/` directory with unit/integration/e2e

**III. YAGNI Extremist** ✅ PASS
- No unnecessary abstractions
- Stdlib over dependencies
- Implementation: Minimal dependencies (Hono, Jimp), no ORM

**IV. LINE-Native UX** ✅ PASS
- LINE chat is primary interface
- Flex messages, postback buttons, rich menu
- LIFF only for camera/file access
- Implementation: `src/line/flex-builders.ts`, `src/line/rich-menu.ts`

**V. Design Consistency** ✅ PASS
- Neumorphism (white cards on gray #f0f4f8)
- Material Symbols via Google Fonts `<link>`
- Implementation: `frontend/src/app/globals.css`

### Post-Design Gate (after Phase 1)

*Re-evaluate after data-model.md and contracts/ are created*

**Status**: All 5 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-line-oa-chatbot/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── admin/               # Admin dashboard (Hono routes)
├── auth/                # Authentication (sessions, tokens)
├── calc/                # Carbon calculation (SF_w, nitrogen)
├── chat/                # Chat state machine (conversation flow)
├── db/                  # Database (D1 schema, migrations, seed)
├── export/              # Data export (CSV, reports)
├── farmer/              # Farmer entity (registration, profile)
├── fertilizer/          # Fertilizer calculation
├── liff/                # LIFF app (camera, forms)
├── line/                # LINE Messaging API (webhook, flex, rich menu)
├── photo/               # Photo handling (upload, verification)
├── routes/              # API routes (REST endpoints)
├── season/              # Season management (calendar, steps)
├── sponsor/             # Sponsor dashboard
├── trust/               # Farmer trust scoring
├── vision/              # AI photo verification (OpenRouter)
└── index.ts             # Main entry point (Hono app)

frontend/
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   └── lib/             # Utilities, API client
└── public/              # Static assets

tests/
├── unit/                # Unit tests (Vitest)
├── integration/         # Integration tests (Vitest)
└── e2e/                 # End-to-end tests (Playwright)
```

**Structure Decision**: Single monorepo with backend (src/), frontend (frontend/), and tests (tests/). Backend is a Cloudflare Worker with Hono routes organized by domain (admin, farmer, line, photo, etc.). Frontend is a Next.js static export. Tests are co-located in a separate directory.

## Complexity Tracking

> **No violations to justify. All constitution principles pass.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
