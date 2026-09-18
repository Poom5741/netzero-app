# NetZeroCarbon — Entrypoints & User Journeys

> Architecture diagrams for the full NetZeroCarbon codebase. Any developer joining the project should be able to read this document and understand every way a user or external system can enter the application, what happens next, and where data goes.

---

## 1. System Architecture Overview

```mermaid
flowchart TB
    subgraph External["🌐 External Systems"]
        LINE["LINE Platform<br/>(OA, LIFF, Messaging API)"]
        Farmer["Farmer Mobile<br/>(LINE App + LIFF WebView)"]
        Browser["Admin / Sponsor Browser"]
    end

    subgraph Workers["☁️ Cloudflare Workers (Hono)"]
        subgraph Entrypoints["Entrypoints"]
            Webhook["POST /webhook/line<br/>LINE Messaging API"]
            LIFFApp["GET /liff/<br/>LIFF Chat App"]
            LIFFReg["GET /register<br/>LIFF Registration Form"]
            LIFFCam["GET /liff/camera<br/>LIFF Camera"]
            LIFFDocs["GET /liff/documents<br/>LIFF Document Upload"]
            WebAdmin["GET /admin/*<br/>Admin Console"]
            WebSponsor["GET /sponsor/*<br/>Sponsor Portal"]
            WebAuth["GET /login<br/>Admin Login"]
            Health["GET /health"]
            Export["GET /export/*"]
        end

        subgraph Routes["Route Modules"]
            flow["src/line/flow.ts<br/>State Machine"]
            reply["src/line/reply.ts<br/>LINE Push/Reply"]
            admin["src/routes/admin.ts"]
            sponsor["src/routes/sponsor.ts"]
            liff["src/routes/liff.ts"]
            auth["src/routes/auth.ts"]
            dashboard["src/routes/dashboard.ts"]
            photo["src/routes/photo.ts"]
            season["src/routes/season.ts"]
            farmer["src/routes/farmer.ts"]
            export["src/routes/export.ts"]
        end

        subgraph Infra["Infrastructure"]
            D1["🗄️ Cloudflare D1<br/>(SQLite — farmers, plots,<br/>photos, users, sessions)"]
            R2["📦 Cloudflare R2<br/>(Photos: evidence/{id}.jpg<br/>Docs: docs/{farmerId}/{code}/*)"]
            OpenRouter["🤖 OpenRouter API<br/>(Qwen 3.6 Flash — AI chat)"]
        end
    end

    LINE --> Webhook
    Farmer --> LIFFApp
    Farmer --> LIFFReg
    Farmer --> LIFFCam
    Farmer --> LIFFDocs
    Browser --> WebAdmin
    Browser --> WebSponsor
    Browser --> WebAuth

    Webhook --> flow
    flow --> reply
    reply --> LINE

    LIFFApp --> liff
    LIFFReg --> liff
    LIFFCam --> liff
    LIFFDocs --> liff
    liff --> flow
    flow --> D1
    flow --> OpenRouter

    admin --> D1
    admin --> R2
    sponsor --> D1
    dashboard --> D1
    photo --> D1
    photo --> R2
    farmer --> D1
    export --> D1

    LIFFApp -.-> LINE
    LIFFReg -.-> LINE
```

---

## 2. All Entrypoints by Surface

### 2A. Farmer — LINE OA & LIFF

```mermaid
flowchart LR
    subgraph LINE_OA["LINE OA Chatbot"]
        W1["POST /webhook/line<br/>follow event"]
        W2["POST /webhook/line<br/>message event"]
        W3["POST /webhook/line<br/>postback event"]
    end

    subgraph LIFF["LIFF In-App Pages"]
        L1["GET /liff/<br/>Chat UI"]
        L2["GET /register<br/>Registration Form"]
        L3["GET /liff/camera<br/>Camera + Upload"]
        L4["GET /liff/documents<br/>Document Upload"]
    end

    subgraph LIFF_API["LIFF API Endpoints"]
        A1["POST /liff/api/chat<br/>State machine"]
        A2["POST /liff/api/register<br/>Create farmer + plot"]
        A3["POST /liff/api/documents/upload<br/>Upload to R2"]
        A4["GET /liff/api/documents/:farmerId<br/>List documents"]
    end

    subgraph Photo["Photo Upload"]
        P1["POST /api/photo/upload<br/>Multipart file upload"]
        P2["GET /api/photo/:photoId<br/>Serve photo from R2"]
    end

    LINE_OA --> W1
    LINE_OA --> W2
    LINE_OA --> W3

    L1 --> A1
    L2 --> A2
    L4 --> A3
    A3 -.-> P1
    P1 -.-> R2
    P2 -.-> R2
```

### 2B. Admin — Browser Console

```mermaid
flowchart LR
    subgraph Auth["Auth"]
        Login["GET /login<br/>Login page"]
        LoginPOST["POST /login<br/>Email + password + OTP"]
        Logout["POST /logout"]
        Redirect["GET /redirect"]
    end

    subgraph Admin_UI["Admin HTML Pages"]
        A1["GET /admin<br/>Dashboard shell"]
        A2["GET /admin/overview<br/>KPI + work queue"]
        A3["GET /admin/applications<br/>Application queue"]
        A4["GET /admin/review<br/>Photo review queue"]
        A5["GET /admin/farmers<br/>Farmer list"]
        A6["GET /admin/farmers/:id<br/>Farmer detail"]
        A7["GET /admin/audit/:photoId<br/>Decision history"]
        A8["GET /admin/sponsors<br/>Sponsor management"]
        A9["GET /admin/reports<br/>Report catalogue"]
        A10["GET /admin/settings<br/>System settings"]
    end

    subgraph Admin_API["Admin JSON APIs"]
        API1["GET /api/admin/farmers"]
        API2["POST /api/admin/farmers<br/>Create farmer"]
        API3["GET /api/admin/farmers/:id"]
        API4["POST /api/admin/applications<br/>List applications"]
        API5["POST /api/admin/applications/:id/approve"]
        API6["POST /api/admin/applications/:id/reject"]
        API7["POST /api/admin/applications/:id/hold"]
        API8["GET /api/admin/review"]
        API9["POST /api/admin/review/:photoId<br/>Verify / Reject photo"]
        API10["GET /api/admin/overview/kpis"]
        API11["GET /api/admin/overview/credit-chart"]
        API12["GET /api/admin/overview/ghg-sources"]
        API13["GET /api/admin/dashboard"]
        API14["GET /api/photo/:photoId"]
    end

    Auth --> Login --> LoginPOST
    Admin_UI --> Admin_API
    Admin_API --> D1
    Admin_API --> R2
```

### 2C. Sponsor — Browser Portal

```mermaid
flowchart LR
    subgraph Sponsor_Auth["Sponsor Auth"]
        SLogin["GET /sponsor/login"]
        SLoginPOST["POST /sponsor/login"]
        SLogout["POST /sponsor/logout"]
    end

    subgraph Sponsor_UI["Sponsor HTML Pages"]
        S1["GET /sponsor<br/>Overview dashboard"]
    end

    subgraph Sponsor_API["Sponsor JSON APIs"]
        SA1["GET /sponsor/overview<br/>Area-scoped KPIs"]
        SA2["GET /sponsor/summary"]
        SA3["GET /sponsor/farmers"]
        SA4["GET /sponsor/ghg-sources"]
        SA5["GET /sponsor/season-credits"]
        SA6["GET /sponsor/certificates"]
        SA7["GET /sponsor/reports/:id/download<br/>EX-2042 CSV"]
        SA8["GET /sponsor/:plotId<br/>Plot detail (area-scoped)"]
        SA9["GET /sponsor/me"]
    end

    Sponsor_Auth --> SLogin --> SLoginPOST
    Sponsor_UI --> Sponsor_API
    Sponsor_API --> D1
```

---

## 3. LINE Conversation State Machine

```mermaid
stateDiagram-v2
    [*] --> welcome: User adds LINE OA / sends first message

    welcome --> registration: "สวัสดี" / "ช่วย" / follow event
    welcome --> documents: (existing verified link)

    registration --> documents: Phone verified + form submitted
    registration --> welcome: Invalid input / retry

    documents --> documents: Farmer uploads docs
    documents --> plot_selection: All required docs attached

    plot_selection --> plot_selection: Farmer selects plot
    plot_selection --> season_setup: Plot confirmed

    season_setup --> photo_upload: Season + variety set

    photo_upload --> photo_upload: Farmer submits photo
    photo_upload --> calendar: All photo rounds done

    calendar --> results: Farmer requests calendar
    calendar --> photo_upload: New round reminder

    results --> results: Farmer asks for estimate
    results --> photo_upload: New season starts

    %% Error states
    registration --> registration: Error
    documents --> documents: Error
    photo_upload --> photo_upload: Rejected photo
```

---

## 4. Journey 1 — Farmer Registers via LINE OA

```mermaid
sequenceDiagram
    participant F as Farmer (LINE App)
    participant LINE as LINE Platform
    participant WA as /webhook/line
    participant FLOW as flow.ts
    participant D1 as D1 Database
    participant RP as LINE Reply API
    participant LIFF as LIFF (line.me)

    Note over F,LINE: Farmer opens LINE and adds OA friend

    LINE->>WA: POST /webhook/line<br/>{ type: "follow" }
    WA->>D1: SELECT line_links WHERE line_user_id=?
    D1-->>WA: not found → INSERT line_links (pending, welcome)
    WA->>RP: replyMessage() — welcome flex + LIFF button
    RP-->>LINE: 200 OK
    LINE-->>F: Welcome message with "เปิดแอป" button

    F->>LIFF: Tap "เปิดแอป NetZeroCarbon"
    LIFF->>WA: GET /register (LIFF deep-link)
    WA-->>F: Registration HTML form

    F->>WA: POST /liff/api/register<br/>{ full_name, phone, national_id, address, deed, ... }
    WA->>D1: INSERT/UPDATE farmers<br/>INSERT plots<br/>UPDATE line_links state='documents'
    D1-->>WA: farmer_id
    WA-->>F: { ok: true, farmer_id }

    Note over F: Farmer uploads documents

    F->>WA: POST /liff/api/documents/upload<br/>DOC-01 (โฉนด)
    WA->>R2: PUT evidence/docs/{farmerId}/DOC-01/*
    R2-->>WA: stored
    WA->>D1: UPSERT application_documents
    D1-->>WA: ok

    F->>WA: POST /liff/api/documents/upload<br/>DOC-03 (บัตรประชาชน)
    F->>WA: POST /liff/api/documents/upload<br/>DOC-06 (มอบอำนาจ, optional)
```

---

## 5. Journey 2 — Farmer Chats with Bot

```mermaid
sequenceDiagram
    participant F as Farmer (LINE App)
    participant LINE as LINE Platform
    participant WA as /webhook/line
    participant FLOW as flow.ts
    participant D1 as D1 Database
    participant OR as OpenRouter API
    participant RP as LINE Push/Reply API

    F->>LINE: Farmer types "ถ่ายรูป"
    LINE->>WA: POST /webhook/line<br/>{ type: "message", text: "ถ่ายรูป" }
    WA->>D1: SELECT line_links WHERE line_user_id=?
    D1-->>WA: link record (state, farmer_id, selected_plot_id)

    WA->>FLOW: handleFlow({ state, farmerId, text, ... })
    FLOW->>OR: POST /v1/chat/completions<br/>Qwen 3.6 Flash
    OR-->>FLOW: AI reply text + next state
    FLOW-->>WA: { reply, newState }

    WA->>D1: UPDATE line_links<br/>SET conversation_state=?, selected_plot_id=?
    WA->>RP: replyMessage() — AI reply + quick reply buttons
    RP-->>LINE: 200 OK
    LINE-->>F: Bot message in chat
```

---

## 6. Journey 3 — Farmer Takes Photo via LIFF Camera

```mermaid
flowchart TD
    Start["Farmer in LINE chat taps 📸 button"] --> Cam["GET /liff/camera<br/>?plot_id=&season_id=&step="]
    Cam --> LIFFSDK["LIFF SDK initialized"]
    LIFFSDK --> Camera["Camera opens<br/>(getUserMedia or file picker fallback)"]
    Camera --> Snap["Farmer captures photo"]
    Snap --> Preview["Photo preview shown"]
    Preview --> Send["POST /api/photo/upload<br/>multipart/form-data"]
    Send --> R2["R2: evidence/{photoId}.jpg"]
    Send --> D1["D1: INSERT photo_evidence<br/>status=pending, ai_status=flag"]
    D1 --> AI["AI pre-verification<br/>(pass / flag / reject)"]
    AI --> Queue["Photo enters admin review queue"]
    Queue --> Notify["LINE push to farmer<br/>✅ รอตรวจสอบ"]
```

---

## 7. Journey 4 — Admin Reviews Application

```mermaid
flowchart TD
    A["Admin opens /admin/applications"] --> B["GET /api/admin/applications"]
    B --> C["List of pending applications"]
    C --> D["Admin clicks ✓ อนุมัติ"]
    D --> E["POST /api/admin/applications/:id/approve"]
    E --> F["D1: UPDATE application<br/>status=verified, cpa_code generated"]
    F --> G["LINE push: ✅ อนุมัติแล้ว + CPA code"]
    G --> H["Farmer can now submit season inputs and photos"]
```

---

## 8. Journey 5 — Admin Reviews Photo

```mermaid
flowchart TD
    A["Admin opens /admin/review"] --> B["GET /api/admin/review"]
    B --> C["Photo queue: pending / flag / preverified"]
    C --> D["Admin selects a photo"]
    D --> E{"Decision"}
    E -->|✓ ผ่าน| F["POST /api/admin/review/:photoId<br/>{ status: 'verified' }"]
    E -->|✗ ตีกลับ| G["POST /api/admin/review/:photoId<br/>{ status: 'rejected', reason }"]
    E -->|⚡ Override| H["POST /api/admin/review/:photoId<br/>{ status: 'rejected' } (pre-verified override)"]
    F --> I["D1: UPDATE photo_evidence<br/>admin_status=verified"]
    G --> I2["D1: UPDATE photo_evidence<br/>admin_status=rejected"]
    H --> I3["D1: UPDATE photo_evidence<br/>admin_status=rejected, supersedes AI"]
    I --> J["automation_audit_log entry created"]
    I2 --> J
    I3 --> J
    J --> K["LINE push to farmer with result"]
```

---

## 9. Journey 6 — Sponsor Views Carbon Impact

```mermaid
flowchart TD
    S["Sponsor opens /sponsor/login"] --> T["POST /sponsor/login<br/>email + password + OTP"]
    T --> U["Session cookie set"]
    U --> V["GET /sponsor → Area-scoped dashboard"]
    V --> W["SELECT from D1 filtered by sponsor's assigned provinces"]
    W --> X["KPIs: total credits, area, households, GHG breakdown"]
    X --> Y["Sponsor can filter by province/season"]
    Y --> Z["GET /sponsor/reports/EX-2042/download → CSV export"]
```

---

## 10. Route Mount Order (src/index.ts)

```mermaid
flowchart BT
    subgraph Order["app.route() Registration Order"]
        O1["1. /register<br/>(inline — must be first)"]
        O2["2. /liff/*<br/>(liffRoutes — LIFF pages + APIs)"]
        O3["3. /<br/>(authRoutes — login/logout)"]
        O4["4. /health<br/>(healthRoutes)"]
        O5["5. /api/photo<br/>(photoRoutes)"]
        O6["6. /api/season<br/>(seasonRoutes — admin-gated POST)"]
        O7["7. /api/farmer<br/>(farmerRoutes)"]
        O8["8. /webhook/line<br/>(inline — GET verify, POST events)"]
        O9["9. /admin/*<br/>(adminRoutes — session-protected)"]
        O10["10. /sponsor/*<br/>(sponsorRoutes — session-protected)"]
        O11["11. /export/*<br/>(exportRoutes)"]
        O12["12. /<br/>(dashboardRoutes — catch-all shells)"]
    end

    Note_N["Why order matters: Hono matches first registered route.<br/>/register must be before sub-routers so it is not caught by them."]
```

---

## 11. Data Storage Map

```mermaid
flowchart LR
    subgraph D1_Tables["D1 Database Tables"]
        T1["farmers<br/>(id, full_name, phone, gender,<br/>addr_*, national_id_enc, cpa_code)"]
        T2["plots<br/>(id, farmer_id, plot_code,<br/>deed_no, area_rai, tenure)"]
        T3["season_inputs<br/>(plot_id, season_id, rice_variety,<br/>sowing_date, harvest_date)"]
        T4["photo_evidence<br/>(id, plot_id, photo_type,<br/>ai_status, admin_status, gps_*)"]
        T5["application_documents<br/>(farmer_id, doc_type,<br/>r2_key, review_status)"]
        T6["line_links<br/>(line_user_id, farmer_id,<br/>status, conversation_state)"]
        T7["users<br/>(id, email, password_hash,<br/>role, areas, otp_secret)"]
        T8["automation_audit_log<br/>(actor_type, action,<br/>entity_type, entity_id)"]
        T9["carbon_estimates<br/>(plot_id, status,<br/>ch4_baseline, ch4_project, ...)"]
    end

    subgraph R2_Buckets["R2 Buckets"]
        R1["evidence/{photoId}.jpg<br/>Photo evidence uploads"]
        R2["docs/{farmerId}/{docCode}/{filename}<br/>Application documents"]
    end

    subgraph Cookies["Session Cookies"]
        C1["nzc_session<br/>(HttpOnly, Signed, SameSite=Lax)"]
    end

    T1 --> T2
    T2 --> T3
    T1 --> T6
    T2 --> T4
    T1 --> T5
    T5 --> R2
    T4 --> R1
    T1 --> T9
    C1 --> T7
```

---

## 12. Security Boundaries

```mermaid
flowchart TB
    subgraph LB1["LINE Webhook"]
        W1["POST /webhook/line"]
        W1 --> SIG["X-Line-Signature<br/>HMAC-SHA256 verified"]
        SIG -->|invalid| W2["401 Unauthorized"]
        SIG -->|valid| W3["Process event"]
    end

    subgraph Admin_Auth["Admin Auth Middleware"]
        A1["requireRole('admin', SECRET)"]
        A1 --> A2{"Valid session cookie?"}
        A2 -->|no| A3["401 Unauthorized"]
        A2 -->|yes| A4["Role = admin?"]
        A4 -->|no| A5["403 Forbidden"]
        A4 -->|yes| A6["Proceed"]
    end

    subgraph Sponsor_Auth["Sponsor Auth Middleware"]
        S1["requireRole('sponsor', SECRET)"]
        S1 --> S2{"Valid session cookie?"}
        S2 -->|no| S3["401 Unauthorized"]
        S2 -->|yes| S4["Role = sponsor?"]
        S4 -->|no| S5["403 Forbidden"]
        S4 -->|yes| S6["Area-scope filter<br/>every query filtered by assigned provinces"]
    end

    subgraph Season_Write["Season Write Protection"]
        SE1["POST /api/season"]
        SE2["POST /api/season/approve"]
        SE1 --> SE3{"Admin session?"}
        SE2 --> SE3
        SE3 -->|no| SE4["401/403"]
        SE3 -->|yes| SE5["Proceed"]
    end
```

---

## 13. External Service Configuration

```mermaid
flowchart LR
    subgraph Config["Environment Bindings"]
        E1["DB: D1Database"]
        E2["R2: R2Bucket"]
        E3["SECRET: string<br/>(session signing key)"]
        E4["LINE_CHANNEL_ACCESS_TOKEN"]
        E5["LINE_CHANNEL_SECRET"]
        E6["OPENROUTER_API_KEY"]
        E7["LIFF_ID<br/>(e.g. 2011183008-7bEomfVF)"]
        E8["APP_URL"]
    end

    subgraph Services["External Services"]
        L1["LINE Messaging API<br/>pushMessage / replyMessage"]
        L2["LINE LIFF Platform<br/>https://liff.line.me/{LIFF_ID}"]
        O1["OpenRouter API<br/>Qwen 3.6 Flash (128k context)"]
    end

    E4 --> L1
    E5 --> L1
    E7 --> L2
    E6 --> O1
```

---

## 14. Entrypoint Quick-Reference Table

| Surface | Method | Path | Auth | Description |
|---------|--------|------|------|-------------|
| **LINE** | POST | `/webhook/line` | X-Line-Signature | All LINE events (follow, message, postback) |
| **LIFF** | GET | `/liff/` | LIFF SDK | Chat UI |
| **LIFF** | GET | `/register` | LIFF SDK | Registration form |
| **LIFF** | GET | `/liff/camera` | LIFF SDK | Camera + photo upload |
| **LIFF** | GET | `/liff/documents` | LIFF SDK | Document upload UI |
| **LIFF** | POST | `/liff/api/chat` | userId in body | State machine API |
| **LIFF** | POST | `/liff/api/register` | userId in body | Farmer registration |
| **LIFF** | POST | `/liff/api/documents/upload` | userId in body | Document file upload |
| **Photo** | POST | `/api/photo/upload` | None | Photo evidence upload |
| **Admin** | GET | `/login` | None | Login page |
| **Admin** | POST | `/login` | Form | Authenticate |
| **Admin** | GET | `/admin` | Session cookie | Dashboard shell |
| **Admin** | GET | `/admin/*` | Session cookie | All admin HTML pages |
| **Admin** | GET/POST | `/api/admin/*` | Session cookie | All admin APIs |
| **Admin** | POST | `/api/photo/upload` | Session cookie | Photo review action |
| **Admin** | POST | `/api/admin/farmers` | Session cookie | Create farmer (rate-limited) |
| **Sponsor** | GET | `/sponsor/login` | None | Sponsor login page |
| **Sponsor** | POST | `/sponsor/login` | Form | Sponsor authenticate |
| **Sponsor** | GET | `/sponsor/*` | Session cookie | All sponsor routes (area-scoped) |
| **System** | GET | `/webhook/line` | None | LINE webhook verification (200 OK) |
| **System** | GET | `/health` | None | Health check |
| **System** | GET | `/export/*` | — | Data export |
