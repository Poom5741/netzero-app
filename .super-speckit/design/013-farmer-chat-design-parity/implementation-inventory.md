# Farmer (LINE OA / LIFF) Frontend Inventory — netzero-app

> Captured by evidence agent 2026-09-29 (agent transcript summarized verbatim below by orchestrator).

## 1. Farmer-facing routes (frontend/ — Next.js 16.3.2, static export)

| Route | File | Renders |
|---|---|---|
| `/chat` | `frontend/src/app/chat/page.tsx` (+ passthrough `layout.tsx`, Thai metadata) | LIFF chat UI: `LiffProvider`/`useLiff`, localStorage history (`nzc_chat_history`, last 100 msgs, `nzc_chat_state`, `nzc_chat_hint_seen`), Thai welcome bot message, `ChatBubble`, `QuickActions`/`getQuickActions`, `TypingIndicator`, `BottomNav`; calls `sendChatMessage` (`@/lib/api`) |
| `/upload` | `frontend/src/app/upload/page.tsx` | Photo submission LIFF: `PhotoTypePicker` (`components/upload/photo-type-picker.tsx`), `uploadPhoto` from `@/lib/photo`, `VerdictResult` (`components/upload/verdict-result.tsx`), `Button`, `BottomNav`. Camera capture happens here — there is NO `/camera` route despite spec references |
| `/summary` | `frontend/src/app/summary/page.tsx` | Farmer dashboard summary: fetches plots/results via `apiRequest`, plot selector, `Button`, `Input`, `BottomNav` |
| `/contact` | `frontend/src/app/contact/page.tsx` | Contact page (no component imports; self-contained) |

Missing vs spec (`specs/line-oa/spec.md` LIFF table): no `/camera`, `/calendar`, `/fields`, `/docs` routes exist. Shared libs: `frontend/src/lib/liff-context.tsx`, `api.ts`, `photo.ts`, `use-session-gate.ts`.

## 2. Design tokens (`frontend/src/app/globals.css`, Tailwind v4 `@theme inline`)

- Primary: `#028E91` (teal-600), container `#E7FCF7`, hover `#027276`; LINE green `#06C755` / dark `#00A854`
- Canonical background: `--color-background: #f0f4f8` (also `--color-surface`, `surface-container-low`); surfaces `#ffffff`/`#eaeef2`/`#e4e9ed`/`#dfe3e7`; on-surface `#171c1f`, variant `#3c4a3c`; navy `#061E5C` (inverse-surface, gradient `--gradient-deep`)
- Fonts: `--font-sans: "Fira Sans", "Noto Sans Thai", ...`; type scale display-lg 48 / headline-lg 32 / headline-md 24 / body-lg 18 / body-md 16 / label-md 14
- Spacing 4–64px scale; radius 4/8/12/16/24/full; shadows `--shadow-xs…xl` (navy-tinted rgba(6,30,92,…)), `--shadow-accent` teal
- Utilities: `.glass`, `.card`, `.btn-primary`, `.badge-verified/pending/rejected/flagged`, `.touch-target` (44px), `.typing-dot` animations, reduced-motion + focus-visible
- No separate tailwind.config — Tailwind v4 CSS-first tokens only.

**Shared components usage:** `DashboardShell`/`DashboardHeader`/`DashboardSidebar` (`frontend/src/components/dashboard/`) are used ONLY by `app/admin/layout.tsx` — farmer pages do not use them. Farmer surface uses `frontend/src/components/ui/`: `chat-bubble.tsx` (user bubble `bg-[#028E91]` hard-coded, bot bubble glassy white `surface-container-lowest/80` + material-symbols "eco" avatar), `bottom-nav.tsx` (glass sticky nav), `quick-actions.tsx`, `typing-indicator.tsx`, `button.tsx`, `input.tsx`; plus `components/upload/*`. Sponsor has its own `components/sponsor/`.

## 3. LINE webhook / chat content generation (backend, repo root `src/`)

Entry: `src/line/webhook.ts` → `src/line/flow.ts` (2094 lines; `ConversationState` union, state handlers duplicated for push + LIFF-API: `handleWelcomeApi`, `handleConsentApi`, … `handleResultsApi`). Content builders:

- **`src/line/flex-builders.ts` (986 lines)** — all Flex bubbles: `buildWelcomeBubble`, `buildConsentBubble` (+`buildConsent4Checkbox`), `buildIdentityConfirmBubble`, `buildConditionsBubble`/`buildConditions3Checkbox`, `buildRegistrationLinkBubble`, `buildCalendarBubble` (9-step SG-01..SG-09), `buildDashboardBubble` (results summary), `buildQuickReplies`, `textMessage`
- **`src/line/flow-photo-reporting.ts`** — WET/DRY photo rounds: WET-1 (SG-04), DRY-1 (SG-05), WET-2 (SG-07), DRY-2 (SG-08); reminder (deadline, X/4 submitted), accepted, rejected/retake messages
- **`src/line/quick-replies.ts`** — per-state quick replies (welcome, consent, identity_confirm, conditions, registration, documents, pending_review, activation, season_setup, calendar)
- **`src/line/consent.ts`**, **`welcome.ts`**, **`retake-message.ts`**, **`rich-menu.ts`** (6 items: BL_HOME, SEASON_HOME, TODO, FIELD_LIST, SUMMARY, ☎️ CONTACT), **`calendar-api.ts`**, **`liff-adapter.ts`**, **`reply.ts`**
- Free chat: `src/chat/` (`ai.ts`, `faq.ts`, `parser.ts`, `state.ts`, `quota.ts`, `audit.ts`)

## 4. Design-parity specs

- **`specs/line-oa/spec.md`** — farmer LINE OA acceptance criteria: OB-01..OB-15 registration, PJ-00/PJ-13 season, PJ-02..PJ-09 photo reporting, RP-01/RP-03 results, 6-item rich menu, LIFF URL patterns (incl. `/camera`, `/calendar`, `/docs`, `/fields`), Flex contract (`heroTone` teal|navy|amber|grey, `heroBadge`, title/subtitle/rows/actions)
- **`specs/010-claude-design-parity/spec.md`** — Admin/Sponsor parity; FR-014 defers farmer surface ("LIFF Fields, Contact, and Baseline pages; and native LINE Flex/rich-menu rendering … unless a separate approved scope is created"). Feature 013 is that separate scope; no `specs/013-*` exists yet.
- **`specs/012-line-document-upload/`** — LIFF docs flow.
