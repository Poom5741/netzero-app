# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Cloudflare Workers (Hono) backend + Next.js 16.3 frontend with Tailwind v4. D1 database, R2 object storage for photos, Workers AI (CLIP vision), OpenRouter LLM (Qwen 3.6 Flash) for chat. LIFF (LINE Front-end Framework) for LINE mini-app distribution. Deployed on workers.dev.

## Users

**Thai rice farmers** (primary) — Hold land tenure (owner/tenant/proxy), participate in AWD carbon credit projects. Use the system via LINE or standalone web to upload photo evidence of farming activities, chat with an AI assistant in colloquial Thai, and track their plots and seasons. Many are elderly; the system must work outdoors in bright sun, one-handed, on mobile.

**Project coordinators** — Manage farmer registrations, verify LINE account bindings, oversee field operations at the provincial/district level.

**Admins / auditors** — Review AI-screened photo evidence (pass/flag/reject), make final verify/reject decisions, approve carbon credit estimates. Work from desktop dashboards.

**Corporate sponsors** — View dashboards tracking offset impact, see transparency reports on funded projects. Expect a modern, data-rich interface that builds trust.

## Product Purpose

NetZeroCarbon enables verified carbon credits from Thai rice farming through AWD (Alternate Wetting and Drying) water management. The system replaces manual paperwork with a mobile-first digital workflow: farmers photograph field activities (wet/dry cycles, field prep, harvest), AI screens the evidence, admins verify it, and the platform computes GHG offset estimates (baseline minus project emissions: CH₄ + N₂O + CO₂ + burning).

Success means every plot-season has verified photo evidence and computed carbon estimates that withstand audit — turning field-level farming practices into tradeable carbon credits.

## Positioning

End-to-end digital MRV (Measurement, Reporting, Verification) for rice carbon credits — from the farmer's phone to the sponsor's dashboard — with AI-assisted evidence screening that reduces admin burden while maintaining audit rigor. The LINE integration meets Thai farmers where they already are.

## Operating Context

- Farmers work in rice paddies — bright sun, muddy hands, one-handed phone use, intermittent connectivity
- Evidence is live photos with GPS coordinates, timestamp, and accuracy — not uploads from gallery
- AI screening (CLIP vision) provides three-way classification (pass/flag/reject) with label, reason, and confidence — never the final authority
- Admin review is the final stamp: pending → verified or rejected
- Carbon estimates are computed per plot per season using IPCC-aligned formulas (baseline vs. project emissions)
- The chat interface parses colloquial Thai (mixed numbers, whole sentences) into structured drafts for farmer confirmation — never written to DB unconfirmed
- Phone number = identity, not account. A farmer's nephew may enter data on their behalf.
- LINE integration deferred (standalone in-app chat mimics LINE feel; full LINE migration planned later)

## Capabilities and Constraints

- **Photo evidence**: Live camera capture with GPS, timestamp, accuracy. AI screens automatically; admin decides finally.
- **Farmer chat**: LLM-powered conversational interface in Thai. Extracts structured data (fertilizer, water management) from free-text. Token quota: 50 messages/season.
- **Carbon calculation**: Baseline (default values) minus project (actual recorded practice). Water management factor (SF_w) is the AWD proof point.
- **Three dashboards**: Farmer (chat + upload + summary), Admin (review queue + detail panel), Sponsor (impact metrics + transparency).
- **LIFF integration**: LINE mini-app for distribution. LIFF_ID `2011183008-7bEomfVF`.
- **Technical constraints**: Cloudflare Workers runtime (no node:crypto, no fs, no dynamic imports for large JSON). D1 SQLite — concurrent writes to same row cause race conditions. R2 for photo storage. Static export build for Next.js frontend.
- **Open decisions**: LINE server integration timing (deferred due to CF↔LINE latency). Farmer trust-level scoring algorithm. Photo compression for large uploads (>10MB).

## Brand Commitments

- **Name**: NetZeroCarbon (NetZeroCarbon)
- **Primary color anchor**: LINE Green (#06C755) — builds immediate trust with Thai LINE users
- **Visual style**: Claymorphism (tactile, friendly for farmers) + Glassmorphism (premium for sponsors/admins) + Neumorphism (structural depth). "Confidence through Transparency."
- **Typography**: Inter + Sarabun (bilingual Thai/English). 1.6 line-height for body text.
- **Background**: Soft gray-blue #F0F4F8 as neumorphic base
- **Brand personality**: Trustworthy, Eco-Innovative, Approachable. Bridges traditional agriculture and high-tech carbon markets.
- **Design materials**: Full design system tokens in `stitch_netzerocarbon_platform/netzerocarbon/DESIGN.md`. Surface mockups (chat, admin, sponsor, upload, summary) in `stitch_netzerocarbon_platform/`.

## Evidence on Hand

- Deployed POC on workers.dev (backend + frontend live since 2026-08-30)
- Real D1 database with farmer-004/plot-004/2568-napi baseline data (mock data purged 2026-09-05)
- CLIP AI screening operational and verified
- 105 unit tests + 47 e2e tests all passing
- Client verification guide at `tests/poc1-verification/TEST-GUIDE.md`
- Full design system with tokens, typography, spacing, elevation, and component specs
- Surface mockups (PNG + HTML) for all five interfaces

## Product Principles

1. **Evidence over claims** — Every carbon credit rests on timestamped, GPS-tagged, AI-screened, admin-verified photo evidence. No shortcuts.
2. **Meet farmers where they are** — Thai language, colloquial chat, LINE-native distribution, 44px touch targets for outdoor use. The system adapts to the farmer, not the reverse.
3. **AI assists, humans decide** — AI screening reduces admin burden but never replaces human judgment. Drafts are proposed, never auto-committed.
4. **Transparency by default** — Sponsors see what the admin sees. Every status change is traceable. The UI earns trust through openness, not promises.
5. **Audit-grade from day one** — Schema, evidence chain, and calculation formulas are designed to withstand third-party carbon credit verification, not just internal demos.

## Accessibility & Inclusion

- Elderly farmers: large touch targets (44px min), generous line-height (1.6), high-contrast text
- Outdoor use: UI must remain readable in bright sunlight; consider contrast ratios above WCAG AA
- Bilingual: Thai primary, English secondary. Sarabun font required for Thai text legibility
- One-handed mobile use: critical actions within thumb reach
- Low-bandwidth tolerance: photo compression, minimal asset payloads
