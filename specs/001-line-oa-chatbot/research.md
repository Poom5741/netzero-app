# Research: LINE OA Chatbot

**Feature**: 001-line-oa-chatbot
**Date**: 2026-09-14
**Status**: Complete (feature already implemented)

## Research Tasks

### 1. LINE Messaging API — Flex Message Structure

**Decision**: Use LINE Flex Message API with bubble containers for rich UI cards.

**Rationale**: Flex messages provide structured, interactive UI within LINE chat without requiring a separate app. They support buttons, images, and multi-column layouts — perfect for consent forms, photo instructions, and dashboards.

**Alternatives considered**:
- Template messages (buttons/carousel): Limited layout flexibility, no multi-column support
- LIFF full-screen app: Requires leaving chat, higher friction
- Plain text: No interactivity, poor UX for forms

**Implementation**: `src/line/flex-builders.ts` — 7 builder functions (welcome, consent, identity confirm, conditions, registration link, calendar, dashboard)

---

### 2. Phone Number as Identity — No Verification Gate

**Decision**: Phone number = identity. If phone matches existing farmer record, trust immediately. No password, no email, no OTP.

**Rationale**: 
- Farmers' nephews may enter data — phone is the simplest shared identifier
- LINE already verifies phone numbers at account level
- Adding OTP/password creates friction and support burden
- Thai farmers are not accustomed to account-based apps

**Alternatives considered**:
- Email + password: Farmers don't use email regularly
- OTP via SMS: Adds cost, delay, and complexity
- LINE social login: Doesn't link to farmer database

**Implementation**: `src/line/flow.ts` — `handlePhone()` looks up farmer by phone, transitions to identity confirm if found

---

### 3. LIFF Camera vs Chat Photo Upload

**Decision**: Require LIFF camera deep-link for photo submission. Reject photos sent as chat attachments.

**Rationale**: 
- LIFF camera auto-captures GPS coordinates (required for carbon verification)
- Chat photos don't include GPS metadata
- Carbon credit methodology requires geolocation proof

**Alternatives considered**:
- Accept chat photos + manual GPS input: Farmers forget to enter GPS, data quality drops
- Third-party camera app: Higher friction, farmers won't install

**Implementation**: `src/line/flow.ts` — Photo reminder includes LIFF camera URL `https://liff.line.me/{LIFF_ID}/camera`. `src/routes/photo.ts` rejects non-LIFF uploads.

---

### 4. SF_w Calculation — Photo Completeness Tiers

**Decision**: 
- 4 approved photos (WET-1, DRY-1, WET-2, DRY-2) → SF_w = 0.55 (full AWD benefit)
- 1-3 approved photos → SF_w = 0.71 (partial benefit)
- 0 photos → SF_w = 1.0 (no water management benefit)

**Rationale**: Carbon credit methodology rewards complete photo evidence. Full AWD (Alternate Wetting and Drying) benefit requires all 4 rounds. Partial photos indicate incomplete water management.

**Alternatives considered**:
- Binary (4 photos = 0.55, else 1.0): Too harsh, doesn't incentivize partial completion
- Linear interpolation: Complex to explain to farmers, methodology doesn't support it

**Implementation**: `src/calc/sf-w.ts` — `getSfW(db, plotId, seasonId)` queries photo_evidence table, counts verified photos, returns tier

---

### 5. 9-Step Calendar — Sowing Date + 120 Days

**Decision**: Calendar spans 120 days from sowing date, divided into 9 steps (SG-01 to SG-09). Photo steps (WET-1, DRY-1, WET-2, DRY-2) are marked with camera icons.

**Rationale**: 
- 120 days = typical Thai rice growing season
- 9 steps align with key growth stages (tillering, flowering, grain filling, etc.)
- Photo rounds distributed across steps to capture water management evidence

**Alternatives considered**:
- Fixed calendar (same dates for all farmers): Doesn't account for regional planting differences
- Farmer-defined steps: Too flexible, breaks carbon methodology

**Implementation**: `src/season/calendar.ts` — `generateCalendar(sowDate)` creates 9 steps with due dates, photo flags

---

### 6. D1 Concurrent Write Limitation

**Decision**: Use mutex/batch transactions for concurrent writes to the same row (e.g., farmer trust score updates from multiple photo uploads).

**Rationale**: D1 SQLite can't handle concurrent writes to the same row — causes 90-500 errors. Mutex serializes writes; batch transactions reduce write frequency.

**Alternatives considered**:
- Retry logic: Doesn't solve root cause, adds latency
- Move to PostgreSQL: Overkill for pilot, breaks Cloudflare-native architecture

**Implementation**: `src/trust/farmer-trust.ts` — Batch updates trust score after photo verification completes

---

### 7. LINE ReplyToken Single-Use Constraint

**Decision**: Batch all reply messages into a single API call per webhook event.

**Rationale**: LINE replyToken can only be used once. Multiple reply calls fail silently.

**Alternatives considered**:
- Push messages instead of replies: Higher cost, delayed delivery
- Token reuse: Not supported by LINE API

**Implementation**: `src/line/webhook.ts` — Collects all messages for an event, sends single `replyMessage()` call

---

## Summary

All research tasks complete. No NEEDS CLARIFICATION markers remain. Technical decisions align with constitution principles (YAGNI, LINE-native UX, production-first testing).

**Next**: Phase 1 — data-model.md, contracts/, quickstart.md
