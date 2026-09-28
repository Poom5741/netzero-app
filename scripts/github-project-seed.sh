#!/usr/bin/env bash
set -e
mk() { gh issue create --repo Poom5741/netzero-app --title "$1" --body "$2" ${3:+--label "$3"}; }

mk "Admin console feature sweep A1-A8 + farmer-detail 500 fix" "Fixed farmer-detail 500 (plots.rice_variety column drift → season_inputs subquery), worker \`bac960f6\`. Evidence detail panel layout fixed with flex wrapper + sticky panel; Pages \`b4fa7c92\`." ""
mk "Next.js 16.3 migration + Admin Review + Sponsor dashboards" "Completed Next.js 16.3 static-export migration, Admin Review (#56) and Sponsor (#57) dashboards, 105 unit + 47 e2e tests green. Committed 34184a9." ""
mk "Visual QA sweep of all 10 surfaces + rich menu postbacks" "Visual QA PASS across farmer LINE/LIFF, admin, sponsor surfaces. Rich menu postbacks stable via text-matching. V-1 card UUID overflow fixed (truncate)." ""
mk "Full-flow manual review 2026-09-19 (9-step charter)" "Follow-along review: farmer (LINE OA + LIFF) → admin → sponsor + exceptional branches. Log: tests/verification/line-document-upload-manual-review-2026-09-19.md. D1 wipe+seed via scripts/seed-review-2026-09-19.sql. Currently in progress — Step 1 done, live SHA b3b92b48." ""
mk "Native LINE DOC-01/DOC-03 real upload + approval + camera retest" "Document upload implemented/deployed but native real-LINE upload, admin approval, and camera unlock retest remain. Gate: native approval flow blocks photo capture until docs complete." ""
mk "Dashboard pending count includes orphan test links (4 vs 1 mismatch)" "Admin dashboard pending applications count (4) does not match Applications list (1) — orphaned test link records inflate the count. Backlogged from visual sweep 2026-09-19." "bug"
mk "Report download is a stub (no actual file served)" "Admin/sponsor report download buttons do not deliver a real file; EX-2042 CSV works in sponsor Reports but admin report download remains a stub." "bug"
mk "Photo GPS coordinates recorded as 0,0" "Photo evidence submissions record GPS 0,0 — EXIF/GPS extraction not producing real coordinates. Blocks geolocation proof for carbon credit evidence." "bug"
mk "LIFF upload UI unverified outside real LINE app context" "Upload UI itself has never been exercised in a real browser context (desktop/web) — only real-LINE embedded use; camera/photo picker verification pending." "bug"
mk "/health reports environment:development in production" "wrangler.toml sets environment dev; /health on live deploy returns environment:development, misleading monitoring. Step 1 finding from 2026-09-19 review." "bug"
mk "Admin sponsor detail button inert" "Farmer-detail 'sponsor detail' button does nothing; minor UX gap from admin sweep." "bug"
