## LIFF Chat POC — Plan

### What We're Building
A LIFF web app that runs inside LINE, with a chat interface. Farmer types messages → direct API call to our Worker → instant AI response. No webhook delays, no push API.

### Architecture
```
Farmer opens LIFF in LINE
    ↓
LIFF app (HTML/JS served by Worker)
    ↓ POST /api/chat
Worker (Hono) → OpenRouter AI → JSON response
    ↓
LIFF renders response in chat UI
```

### Components

#### 1. LIFF App (HTML/JS served from Worker)
- Single HTML page with chat interface
- LIFF SDK for LINE user identification
- Sends messages via `fetch("/api/chat", { body: { text, userId } })`
- Displays responses in chat bubbles
- Thai UI, mobile-first

#### 2. Chat API Endpoint (`POST /api/chat`)
- Receives `{ text, userId }` from LIFF
- Looks up farmer by LINE userId
- Routes through state machine (same flow.ts logic)
- Returns `{ reply: string }` — no push needed

#### 3. Existing Backend (reuse)
- `src/line/flow.ts` — state machine (adapt to return reply instead of push)
- `src/chat/ai.ts` — OpenRouter AI
- `src/chat/state.ts` — draft management
- D1 database — farmer data

### Files to Create
1. `public/index.html` — LIFF chat app (HTML/CSS/JS)
2. `src/routes/liff.ts` — serves the LIFF app + chat API

### Files to Modify
1. `wrangler.toml` — add static asset serving
2. `src/line/flow.ts` — add `handleFlowApi()` that returns reply text instead of pushing

### LIFF App ID
Need to create a LIFF app in LINE Developers Console and set the LIFF_ID as an env var.

### Flow
1. Farmer opens LIFF app in LINE
2. LIFF SDK gets LINE userId
3. App shows chat interface
4. Farmer types message → POST /api/chat
5. Worker processes via state machine → returns reply
6. App displays reply in chat

### Expected Result
- Instant responses (no webhook delay)
- Rich chat UI (bubbles, timestamps, typing indicator)
- Same state machine logic (welcome → phone → verify → select_plot → chat)
- Easy to extend with photo/forms later