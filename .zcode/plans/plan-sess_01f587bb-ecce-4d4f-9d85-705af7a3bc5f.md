## LINE Bot Flow Redesign — Implementation Plan

### 1. Database Schema Change
Add to `line_links` table:
- `conversation_state TEXT DEFAULT 'welcome'` — tracks farmer's current step
- `selected_plot_id TEXT` — which plot the farmer is working on

### 2. New File: `src/line/flow.ts` — State Machine
State handler that dispatches based on `conversation_state`:

| State | Input | Action | Next State |
|-------|-------|--------|------------|
| `welcome` | "ยอมรับ" / consent keywords | Save consent, prompt phone | `phone` |
| `phone` | 10-digit phone | Match farmer, create link | `pending` |
| `pending` | Any | "รอการยืนยัน" | (stays) |
| `select_plot` | Plot number | Set selected_plot_id | `chat` |
| `chat` | Any text | AI or quick reply | `chat` or `confirm_draft` |
| `confirm_draft` | "ยืนยัน"/"ยกเลิก" | Save/discard draft | `chat` |

### 3. Rewrite `src/index.ts` Message Handler
Replace monolithic handler with state machine dispatch:
```
getLink → get state → handleState(state, text, event)
```

### 4. Wire Existing Modules
- `line/welcome.ts` → Welcome Flex on follow
- `line/consent.ts` → Consent card
- `line/phone-match.ts` → Phone matching
- `line/reply.ts` → Reply/Push API
- `chat/ai.ts` → AI conversation
- `chat/state.ts` → Draft management

### 5. Plot Selection (Chat-based)
When farmer reaches `select_plot`:
1. Query farmer's plots from DB
2. Send numbered list: "1. 99999-1 (10 ไร่)\n2. 88888-1 (15 ไร่)"
3. Farmer types "1" or "2"
4. Save selected_plot_id, move to `chat`

### 6. Cleanup
Remove unused files: webhook.ts, crypto.ts, faq.ts, parser.ts, quota.ts, audit.ts

### Expected Result
- Clear, maintainable state machine
- Follow → Consent → Phone → Verify → Select Plot → Chat → Confirm flow
- Each state has explicit allowed inputs and transitions
- Plot selection via chat (text list + number)
- No LIFF required for core flow