# Requirements-to-verification matrix — 013-farmer-chat-design-parity

> **LOCALLY AUTHORED RECONSTRUCTION — 2026-10-01.** The original 013 matrix is Mac-only and
> never landed (blocked by `.gitignore:53` `.super-speckit/` + absent from all pushes). Created
> per explicit user instruction "if missing just create it" (2026-10-01). Content limited to
> facts derivable from landed evidence (cited per line); all unrecoverable rows are marked
> UNKNOWN, not invented. If the Mac original surfaces, diff and reconcile.

**Feature**: `013-farmer-chat-design-parity` (umbrella) · slices: `specs/013-bot-render-parity`
(slice 1), `specs/014-richmenu-registration` (slice 2), `specs/015-worker-liff-parity` (slice 3)
**Original (Mac-only) location**: `.super-speckit/matrices/013-farmer-chat-design-parity.md` —
cited by specs/013-bot-render-parity/spec.md:72 and specs/013-bot-render-parity/tasks.md:4;
`.super-speckit/matrices/` does not exist locally (verified 2026-10-01) and never landed
(gate-close-note-2026-10-01.md:31–33).
**Tracked location chosen**: `specs/013-farmer-chat-design-parity.md` — the exact path the 017
gate record cites as the expected landing spot (.super-speckit/purpose/017-admin-sponsor-design-parity/purpose-map.md:29
and purpose-map.html:71). A copy under `.super-speckit/` would be re-gitignored and lost again,
which defeats the user-ordered tracked supersession record.
**Umbrella purpose map**: `.super-speckit/purpose/013-farmer-chat-design-parity/purpose-map.md`
(human-confirmed 2026-09-29, per specs/013-bot-render-parity/spec.md:5) — that file is also
absent locally (verified 2026-10-01).
**Why this file exists now**: the 017 purpose gate closed with R-901 → `superseded`
user-approved, but the annotation was BLOCKED because this file never landed
(gate-close-note-2026-10-01.md:31–33; purpose-map.md:62–64). The user then authorized creation:
"if missing just create it" (2026-10-01).

---

## Why the original never landed

- `.gitignore:53` ignores all of `.super-speckit/`, where the matrix lived
  (HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md:57 — "This matches feature 013's precedent").
- Landing verification found the file "does not exist anywhere locally (verified post-pull)"
  and it was deliberately NOT fabricated at gate time (gate-close-note-2026-10-01.md:31–33).
- The 017 non-goal "no changes to `specs/013-farmer-chat-design-parity.md` or any 013 artifact"
  (purpose-map.md:29) was written while the file did not exist; its intent was "Do not fabricate
  the file" pending the gate (purpose-map.md:64). The user's 2026-10-01 instruction
  "if missing just create it" explicitly lifts that guardrail for this tracked reconstruction.

## R-901 — explicit-exclusion row (the supersession record)

The kit matrix convention places 9xx rows under "Explicit exclusions" with status
`not-applicable` (.super-speckit/templates/verification-matrix.md:9–12, `R-999` placeholder row).

| Requirement ID | Status | Reason | Approval |
| --- | --- | --- | --- |
| R-901 | ~~not-applicable~~ → **SUPERSEDED** | "Admin and sponsor surfaces — excluded by confirmed non-goals" (original matrix line 57, quoted verbatim in GATE-PENDING.md:29 and HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md:68) | **SUPERSEDED — by 017-admin-sponsor-design-parity, user-approved 2026-10-01 (purpose gate card tap "Approve all as recommended")** |

Decision chain (every link cited):
1. Original row: `013-farmer-chat-design-parity.md:57` recorded "Admin and sponsor surfaces —
   excluded by confirmed non-goals", status `not-applicable`
   (HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md:68; GATE-PENDING.md:29).
2. Gate question Q2 recommended **revoke**: "this feature is that carve-out's reversal; annotate
   the row `superseded`" (GATE-PENDING.md:29; mirrored purpose-map.md:37, purpose-map.html:45).
3. Human approval: user Poom5741 tapped "✅ Approve all as recommended" 2026-10-01 ~02:19 UTC
   (purpose-map.md:4–5); transcribed in decision.json — `confirmed_by: "THE USER (Poom5741)"`,
   `confirmed_at: 2026-10-01T03:13:56Z`, `confirmation: "user card tap 2026-10-01"`
   (decision.json:6–8).
4. The gate-close note ordered this exact annotation once the 013 file existed: "annotate the
   R-901 row `superseded` and link this note" (gate-close-note-2026-10-01.md:31–33). This row is
   that annotation; this file links that note.
5. What supersedes the carve-out: 017 admin (9 screens, slice A) + sponsor (4 screens, slice B)
   (GATE-PENDING.md:40; purpose-map.md 3c row).

## Other rows attested in landed evidence

The original matrix's own wording for these rows is UNKNOWN except where quoted; what follows is
each row the landed slice specs prove existed in the matrix, with its stated content and citation.

**Slice 1 — bot render (specs/013-bot-render-parity/spec.md)**

| Row | Stated content | Citation |
| --- | --- | --- |
| R-001 | Flex body text uses artifact ink (`#16202C`/`#06C755`/`#04A344`/`#FFFFFF`; no `#333333`) | specs/013-bot-render-parity/spec.md:36–38 |
| R-002 | Action rows use artifact geometry (`paddingAll: "9px 4px"`, `cornerRadius: "4px"`) | specs/013-bot-render-parity/spec.md:43–44 |
| R-003 | Bubbles use artifact corner radius `13px` | specs/013-bot-render-parity/spec.md:49 |
| R-004 | A system divider exists (translucent black pill, `999px` radius, Thai label) | specs/013-bot-render-parity/spec.md:52–54 |
| R-005 | No behavioural regression | specs/013-bot-render-parity/spec.md:60; also 015 spec.md:41 |
| R-007 | Rich-menu registration with the LINE API — separate capability (later slice 2, R-201–R-204) | specs/013-bot-render-parity/spec.md:30 |
| R-011 | On-device LINE-client rendering — human observation lane, not an automated gate; "LINE's own client chrome, which no repo code can restyle (matrix R-011)" | specs/013-bot-render-parity/spec.md:75–76; specs/015-worker-liff-parity/spec.md:28 |

**Slice 2 — rich menu registration (specs/014-richmenu-registration/spec.md)**

| Row | Stated content | Citation |
| --- | --- | --- |
| R-201 | `createRichMenu` issues the correct request (`POST /v2/bot/richmenu`) | specs/014-richmenu-registration/spec.md:33 |
| R-202 | `setDefaultRichMenu` issues the correct request (`POST /v2/bot/user/all/richmenu/{id}`) | specs/014-richmenu-registration/spec.md:39 |
| R-203 | No credential leakage | specs/014-richmenu-registration/spec.md:43 |
| R-204 | No production wiring without an asset | specs/014-richmenu-registration/spec.md:47 |
| (matrix note) | "The quick-reply vs Flex action-row question — a product decision, recorded in the matrix" | specs/014-richmenu-registration/spec.md:29 |

**Slice 3 — worker LIFF page (specs/015-worker-liff-parity/spec.md — "Matrix: … (R-013 … R-020)", line 51)**

| Row | Stated content | Citation |
| --- | --- | --- |
| R-013 | Chat canvas paints the artifact `--line-chat-bg: #8FAAD0` (the R-013 precedent regex-technique lives in `tests/unit/liff-page-parity.test.ts`) | specs/015-worker-liff-parity/spec.md:34; HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md:124 |
| R-014 | Bot bubble text uses `--line-chat-ink: #16202C`; legacy `#333` must not appear | specs/015-worker-liff-parity/spec.md:35 |
| R-015 | User bubble uses `--line-bubble-me: #A9E86B` | specs/015-worker-liff-parity/spec.md:36 |
| R-016 | System divider is a `rgba(0,0,0,0.22)` pill, radius `999px`, `3px 12px`, 11px | specs/015-worker-liff-parity/spec.md:37 |
| R-017 | Bubbles cap at 232px, `9px 12px` padding, 13px radius, 4px tail, 13px/1.55 | specs/015-worker-liff-parity/spec.md:38 |
| R-018 | Composer hairline `#EEF2F6`; quick-reply border `#D6DFE9`, text `#04A344`, `6px 13px`, 12px semibold | specs/015-worker-liff-parity/spec.md:39 |
| R-019 | No legacy palette value remains in the template | specs/015-worker-liff-parity/spec.md:40 |
| R-020 | `/register`, `/camera`, `/documents` templates — separate work | specs/015-worker-liff-parity/spec.md:25,51 |

Matrix usage in the record: the 017 requirements-to-verification matrix was to be "modelled on
`013-farmer-chat-design-parity.md` (that matrix is the template — read it)"
(HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md:142).

## Other R-9xx rows

None. A repo-wide search of the 017 landed files (HANDOFF, specs/017-admin-sponsor-design-parity/*,
.super-speckit/purpose/017-admin-sponsor-design-parity/*) and the 013/014/015/016 slice specs finds
exactly one 9xx row reference: R-901. Any additional 9xx exclusion rows the original may have held
are UNKNOWN — unrecoverable without the Mac original (kit template shows only the generic `R-999`
placeholder, .super-speckit/templates/verification-matrix.md:11).

## UNKNOWN (recorded, not invented)

- Total row count and exact layout of the original matrix (only one line position is known: R-901
  sat at line 57 of the original — GATE-PENDING.md:29).
- Per-row verification method / automated asset / runtime assertion / owner / status columns
  (main-table columns per .super-speckit/templates/verification-matrix.md:3–5).
- Exact matrix wording for every row above (content here is transcribed from the landed slice
  specs, which are the authoritative statements of the requirements).
- Any row whose ID is not attested above.
- The 013 umbrella purpose map content (file absent locally; only its path and human-confirmed
  status are known — specs/013-bot-render-parity/spec.md:5).
- 013 kit state (`.super-speckit/state/features/013-*.json`): absent locally; per HANDOFF line 148,
  013 state was hand-maintained on the Mac.

## Relationship to the 017 feature state

The 017 `matrix` field stays pointed at `specs/017-admin-sponsor-design-parity/GATE-PENDING.md`
(.super-speckit/state/features/017-admin-sponsor-design-parity.json; rationale:
gate-close-note-2026-10-01.md:39–42 — GATE-PENDING is the active requirements/tension matrix for
017; the full matrix modelled on 013 is a post-gate deliverable that can replace the pointer
later). This file is the R-901 supersession record plus a partial reconstruction of the 013
matrix — it does not replace the 017 pointer. This annotation also discharges blocked item 1 of
gate-close-note-2026-10-01.md.
