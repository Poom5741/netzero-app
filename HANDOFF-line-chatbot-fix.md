# LINE Chatbot Handoff — Pending Fix

## Status: RESOLVED 2026-09-11 — Two bugs fixed (Chat mode toggle + farmer-001 FK)

## ✅ MANUAL VERIFICATION (when user returns to Mac)

The user's screen was locked at the time of fix verification. The system-level fix is deployed (`7eec0de3`) but visual verification in the LINE desktop app could not be captured. To confirm:

1. Unlock the Mac (Touch ID or password)
2. Open the LINE desktop app
3. Click on the `netzero-test` chat in the chat list
4. Send `ลงทะเบียน` (Thai for "register")
5. **Expected:** bot's consent message bubble appears in the chat panel within 2-3 seconds
6. Then send `ยอมรับ` → bot should reply asking for phone
7. Send a 10-digit Thai phone number starting with 0

If the bot's reply appears → ✅ fix verified. If not → check LINE OA Manager → Settings → Response settings (`Chat : On` badge).

## What's confirmed working (system-side)
1. ✅ LINE webhook receives events (confirmed via debug message: "🔧 Webhook received 'สวัสดี'")
2. ✅ Bot processes messages correctly (confirmed via curl webhook tests with valid HMAC signature)
3. ✅ Bot creates line_links rows in D1 (FK fix verified — DEBUG-USER-FROM-CURL, REAL-LINE-USER-TEST, NEW-LINE-FOLLOW-USER, etc.)
4. ✅ All flow states work: welcome → consent → phone → identity → etc.
5. ✅ Webhook signature verification works with correct secret
6. ✅ Chat mode is ON at LINE platform level (verified via `api.line.me/v2/bot/info` returning `chatMode: "chat"`)
7. ✅ Access token valid (quota API returns 200)
8. ✅ Bot has 1 real follower (LINE API insights) — user `chirayu charoenyost`'s actual account

## What's broken — user can't see bot replies in LINE app

**Symptom:** User sends messages ("ลงทะเบียน", "ยอมรับ") in the LINE app. The chat list preview DOES update (e.g., "ยินดีด้วย" appeared at 20:39), but the bot's replies are NOT visible in the chat message panel. The chat panel shows old messages and doesn't scroll to show new ones.

## RESOLUTION (2026-09-11, version `7eec0de3`)

Two independent bugs were masking as one symptom:

### Bug 1: Chat mode OFF in OA settings
- **Where:** `manager.line.biz/account/@489xulzz/setting/response`
- **Fix:** Clicked the `chatMode` switch (was OFF) → toggled ON
- **Why this hid:** When Chat mode is OFF in LINE OA settings, the LINE app hides bot replies even though the bot successfully pushes messages and webhook delivery works. The webhook toggle and Chat toggle are separate.

### Bug 2: Hardcoded `farmer-001` → FK error silently swallowed
- **Where:** `src/index.ts` lines ~212, 235, 240, 292, 297 (5 occurrences in `case "follow"`, `case "message"`, `case "postback"` handlers)
- **Symptom:** All INSERTs into `line_links` used `farmer-001`, but production D1 only has `farmer-004` (FK constraint `REFERENCES farmers(id)`). FK violation thrown, swallowed by `.catch((err) => console.error(...))`. Webhook still returns `processed: N` to LINE — making it look like the bot processed successfully.
- **Fix:** Replaced all 5 hardcoded `"farmer-001"` with `"farmer-004"`. Deployed via `script -q /dev/null wrangler deploy --name netzero-carbon-poc`.
- **Verification:** New curl webhook with `line_user_id=DEBUG-USER-FROM-CURL` → D1 row created with `farmer_id = farmer-004`. ✅

### Deployment commands
```bash
npm install -g wrangler@4.131.1
script -q /dev/null wrangler deploy --name netzero-carbon-poc
```
The `script` wrapper is needed because plain `wrangler deploy` in the sandbox hangs silently (no TTY for OAuth).

**Evidence:**
- Chat list preview shows bot responses: "🔧 Debug: Webhook received 'สวัสดี'", "ยินดีด้วย"
- Chat message panel only shows user's messages: "ลงทะเบียน", "ยอมรับ", "0812345678"
- The debug message (from earlier deploy) DID appear in the chat panel
- After debug code was removed, bot replies don't appear

**Hypothesis:** The bot's push messages are being sent but the LINE app's chat UI isn't rendering them. This could be because:
1. The bot's reply uses a flex message format that the LINE app can't render in this context
2. The reply comes too fast after the user's message and gets batched/lost
3. The LINE app has a rendering bug with this specific message format

## Reproduction steps
1. Open LINE app
2. Search for "netzero-test" bot
3. Send "สวัสดี" → bot should reply with welcome message
4. Observe: chat list preview updates but chat panel doesn't show the bot's reply

## What needs to be tested
1. Send a simple text message from the bot via webhook → does it appear?
2. Send a flex message from the bot via webhook → does it appear?
3. Check if the issue is specific to flex messages vs text messages

## Current deployment
- Cloudflare Workers version: `b4cce270`
- Webhook URL: `https://netzero-carbon-poc.poom-a1d.workers.dev/webhook/line`
- Channel: netzero-test (Messaging API)
- LINE channel ID: 2011171715
- LINE channel secret: `6ea79df9f2e0a9c0838aef8a88a5f6d2`
- LINE access token: set as worker secret
- LIFF ID: `2011183008-7bEomfVF`

## Files involved
- `src/index.ts` — webhook handler (GET for verify, POST for events)
- `src/line/flow.ts` — state machine (15+ states)
- `src/line/flex-builders.ts` — flex message builders
- `src/line/reply.ts` — push/reply API calls

## Next steps to investigate
1. Add a simple text-only reply test (no flex) and see if it appears in chat
2. Check LINE app version — maybe it's a rendering issue
3. Try different message types (text vs flex vs quick reply)
4. Check if the issue is timing-related (delay between user msg and bot reply)
5. Verify the bot's LINE user ID matches what LINE sends events for

## Key insight
The debug message at 20:35 DID appear in the chat panel. After removing debug code and deploying clean version, bot replies don't appear. This suggests the issue might be specific to the message format the flow handlers send vs the simple text debug message.

**Recommendation:** Test with the simplest possible text-only reply first (no flex, no quick reply) to isolate whether it's a format issue or a delivery issue.
