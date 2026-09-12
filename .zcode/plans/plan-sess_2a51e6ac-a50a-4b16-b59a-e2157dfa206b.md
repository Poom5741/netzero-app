# Plan: Pivot to LINE Chatbot as Primary Farmer Interface

## Context

The current system has a working LINE webhook and state machine, but all messages are plain text with no interactive elements. The client requirement (design system artifact) shows farmers interacting entirely through LINE chat with flex message cards, quick reply buttons, and LIFF deep-links for camera/document upload. The standalone LIFF web app at `src/routes/liff.ts` should be deprioritized — LIFF pages remain as deep-linked tools (camera, registration form) but all conversational flow happens in LINE chat.

**What already works:** Webhook receives events → flow state machine processes → replies via LINE API. Welcome flex, consent card, and retake message flex exist.

**What's broken/missing:** No postback event handling (flex buttons are dead), no flex message builders (everything is plain text), state machine only covers 7 states (needs 15+), 7 of 11 registration composers missing, no quick reply support, LIFF deep-links not threaded through flow.

---

## Step 1: Add Postback Event Handling

**File:** `src/index.ts`

- Add `postback` field to `WebhookEvent` type (data string, displayText)
- Add `case "postback"` to `handleEvent()` switch — extract `event.postback.data`, parse it, and route to `handleFlow()` with the postback data as the text input
- Fix the duplicate `replyMessage` call in the follow handler (lines 183 and 194)

**Verify:** Deploy, send a test flex button tap via LINE, confirm the postback reaches the handler (check worker logs).

---

## Step 2: Create Flex Message Builders

**New file:** `src/line/flex-builders.ts`

Create 8 builder functions that return `LineMessage` objects (flex type):

| Builder | Purpose |
|---------|---------|
| `buildWelcomeBubble()` | Welcome card with "ผูกบัญชีของฉัน" postback button |
| `buildConsentBubble()` | PDPA consent with "ยินยอม" / "ไม่ยินยอม" postback buttons |
| `buildPhonePromptBubble()` | Phone input prompt with quick reply |
| `buildIdentityConfirmBubble(name, district, province)` | Identity match card with "ใช่" / "ไม่ใช่" postback |
| `buildConditionsBubble()` | OB-05 project conditions (3 items) with "ยอมรับ" postback |
| `buildRegistrationLinkBubble(liffUrl)` | LIFF deep-link button for registration form |
| `buildCalendarBubble(steps)` | 9-step calendar card with photo buttons |
| `buildDashboardBubble(data)` | Carbon credit results + photo progress card |

Each builder returns `{ type: "flex", altText: "...", contents: { type: "bubble", ... } }`.

**Verify:** Unit test each builder returns valid flex JSON. Visual check in LINE by manually pushing a test flex message.

---

## Step 3: Expand State Machine

**File:** `src/line/flow.ts`

Extend `ConversationState` type from 7 to 15 states:

```
welcome → consent → phone → identity_confirm → conditions → 
registration → documents → pending_review → activation → 
season_setup → calendar → chat ↔ confirm_draft → photo_report → results
```

Update the `switch` in `handleFlow()` to dispatch to the new state handlers. Each new handler calls the corresponding composer from `flow-registration.ts` / `flow-photo-reporting.ts` / `flow-results.ts` and wraps the output in a flex builder.

**Verify:** Unit test all state transitions. Deploy and walk through the full flow in LINE.

---

## Step 4: Wire Registration Flow (OB-01 to OB-11)

**File:** `src/line/flow.ts` (new handler functions)

Wire the existing text composers from `flow-registration.ts` into the state machine:

| State | Composer | Flex Builder | Action |
|-------|----------|-------------|--------|
| `welcome` | `composeRegistrationWelcome()` | `buildWelcomeBubble()` | Show welcome + "ผูกบัญชี" button |
| `consent` | `composePdpaConsent()` | `buildConsentBubble()` | Show PDPA + accept/reject buttons |
| `phone` | (prompt text) | `buildPhonePromptBubble()` | Ask for phone number |
| `identity_confirm` | `composeIdentityConfirmation()` | `buildIdentityConfirmBubble()` | Show matched name, ask confirm |
| `conditions` | (OB-05 text) | `buildConditionsBubble()` | Show 3 conditions, accept button |
| `registration` | (OB-06) | `buildRegistrationLinkBubble(liffUrl)` | LIFF link to registration form |
| `documents` | (OB-07) | LIFF deep-link | LIFF link to document upload |
| `pending_review` | (OB-08 text) | text message | "รอตรวจสอบ" status |
| `activation` | `composeActivationSuccess()` | text message | Account activated |
| `season_setup` | (OB-10) | text + quick replies | Ask for sow date |
| `calendar` | (OB-11) | `buildCalendarBubble()` | Show 9-step calendar |

**Verify:** End-to-end test: add bot as friend → consent → phone → identity → conditions → registration form → documents → activation → season setup → calendar.

---

## Step 5: Wire Photo Reporting Flow (PJ-00 to PJ-13)

**File:** `src/line/flow.ts` (new handler functions)

Wire `flow-photo-reporting.ts` composers into the `photo_report` state:

- When a calendar step is due, push a `composePhotoReminder()` message with a LIFF camera deep-link button
- When photo is approved, push `composePhotoAccepted()` 
- When photo is rejected, push `composePhotoRejected()` with retake instructions
- Add quick replies: "ถ่ายรูป" → LIFF camera, "ดูปฏิทิน" → calendar, "ดูผล" → dashboard

**Verify:** Test photo reminder push, approval flow, rejection + retake flow.

---

## Step 6: Wire Results Flow (RP-01 to RP-04)

**File:** `src/line/flow.ts` (new handler functions)

Wire `flow-results.ts` composers into the `results` state:

- "ดูผล" → `composeResultsMessage()` showing carbon estimate + photo progress
- "งานค้าง" → `composeTodoMessage()` showing pending tasks
- Add quick reply buttons for common actions

**Verify:** Test results display with real season data.

---

## Step 7: Thread LIFF Deep-Links

**File:** `src/line/flow.ts`

- Add `liffId` to `FlowContext` type
- Thread `env.LIFF_ID` from webhook handler into flow context
- Create LIFF URLs: `https://liff.line.me/${liffId}/<path>` for camera, registration, documents
- Include these URLs in flex button actions (type: "uri")

**Verify:** Click LIFF buttons in LINE chat, confirm they open the correct LIFF pages.

---

## Step 8: Add Quick Reply Menus

**File:** `src/line/flow.ts`

Add `quickReply` items to key messages:

- `identified` state: quick replies for "บันทึก", "ถ่ายรูป", "ดูสถานะ", "ดูผล"
- `chat` state: quick replies for "ถ่ายรูป", "ดูปฏิทิน", "ดูผล", "งานค้าง"
- `calendar` state: quick replies for "ถ่ายรูป", "ดูผล", "ติดต่อเจ้าหน้าที่"

Quick replies format: `{ items: [{ type: "action", action: { type: "message", text: "..." }, label: "..." }] }`

**Verify:** Quick reply chips appear below messages in LINE chat.

---

## Step 9: Preserve LIFF Chat API Compatibility

**File:** `src/line/flow.ts`

The `handleFlowApi()` function (used by the LIFF chat page at `/api/chat`) must be updated in parallel with the state machine changes to avoid runtime errors from new states. Map new states to appropriate text replies.

**Verify:** `POST /api/chat` still returns valid responses for all states.

---

## Step 10: Clean Up and Deploy

- Remove the duplicate `replyMessage` call in follow handler
- Use `buildWelcomeFlex()` from `welcome.ts` instead of inline flex
- Deploy to production
- Walk through all 43 steps in LINE chat
- Test edge cases: re-follow, invalid phone, expired link

**Verify:** Full E2E test in production LINE app. All 43 steps pass.

---

## Files Changed

| File | Change |
|------|--------|
| `src/index.ts` | Add postback handler, fix follow handler |
| `src/line/flow.ts` | Expand to 15 states, wire all composers |
| `src/line/flex-builders.ts` | **NEW** — 8 flex message builders |
| `src/line/flow-registration.ts` | No changes (composers already exist) |
| `src/line/flow-photo-reporting.ts` | No changes (composers already exist) |
| `src/line/flow-results.ts` | No changes (composers already exist) |
| `src/line/reply.ts` | No changes (already supports flex) |
| Tests | New unit tests for flex builders + state transitions |

## Risks

1. **State type expansion** — `handleFlowApi()` (LIFF path) must be updated in parallel
2. **Flex message size** — LINE has a 300KB limit per message; keep bubbles small
3. **Postback data size** — LINE limits postback data to 300 bytes; use compact encoding
4. **No DB migration needed** — `conversation_state` is TEXT type, accepts any string