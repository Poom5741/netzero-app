# Admin Automation Spec

## Problem Statement

The admin review queue is overwhelmed with 50+ photos per day requiring manual verification. The CLIP ViT-L/14 classifier is trained and validated (92.31% accuracy, 0% bad-slip rate) but not yet wired into production. Carbon certification requires temporal integrity — photos must be taken at the correct time in the farming cycle. Farmers don't receive retake notifications, and admins have no visibility into queue growth or stale photos.

## Solution

Implement Tier 1 event-driven automation that collapses the admin queue by 70-80% through:
1. Wire CLIP classifier into production upload pipeline
2. Add temporal validation (EXIF timestamp vs. season phase windows)
3. Auto-verify photos based on confidence + farmer trust scoring
4. Push retake notifications to farmers via LINE
5. Add cron jobs for admin queue digest and stale photo escalation

## User Stories

1. As a farmer, I want my photos to be automatically verified when the AI is confident, so that I don't wait for admin review on every upload
2. As a farmer, I want to receive a LINE notification when my photo is rejected, so that I know to retake it immediately
3. As a farmer, I want my trust score to improve over time as I upload correct photos, so that high-confidence photos from me are auto-verified
4. As an admin, I want to see only photos that need human judgment in the queue, so that I can focus on edge cases instead of rubber-stamping obvious passes
5. As an admin, I want a daily LINE digest when the queue grows beyond 10 photos, so that I know when to prioritize review
6. As an admin, I want photos pending >48 hours to be escalated, so that farmers don't wait indefinitely for decisions
7. As a carbon certifier, I want photos to be rejected if they're taken outside the season phase window, so that temporal integrity is enforced for certification
8. As a carbon certifier, I want photos with missing EXIF timestamps to be flagged for admin review, so that I can manually verify temporal integrity
9. As a system, I want to extract EXIF timestamps from uploaded photos, so that I can validate they were taken at the correct time
10. As a system, I want to calculate phase windows from sow_date, so that temporal validation works for any season
11. As a system, I want to track farmer trust scores (lifetime average acceptance rate), so that I can auto-verify photos from reliable farmers
12. As a system, I want new farmers to start with neutral trust (0.50), so that they're neither auto-verified nor auto-rejected until they prove themselves
13. As a system, I want to auto-verify photos when confidence ≥ 0.95 AND trust ≥ 0.80, so that obvious passes skip the queue
14. As a system, I want to auto-verify photos when confidence ≥ 0.85 AND trust ≥ 0.95, so that high-trust farmers get faster processing
15. As a system, I want to auto-reject photos when confidence < 0.60 AND trust < 0.50, so that obvious failures don't clutter the queue
16. As a system, I want to update farmer trust after each admin decision, so that trust scores reflect recent behavior
17. As a system, I want to push retake notifications via LINE when photos are rejected, so that farmers know to retake
18. As a system, I want to run a daily cron at 9am to check queue length, so that admins get notified when work piles up
19. As a system, I want to run a cron every 6 hours to check for stale photos, so that photos pending >48h are escalated
20. As a system, I want to integrate CLIP ViT-L/14 with 10 example embeddings per class, so that production classification replaces fake test hints

## Implementation Decisions

### CLIP Classifier Integration
- Wire CLIP ViT-L/14 into the photo upload route (`src/routes/photo.ts`)
- Load 10 example embeddings per class (30 images total: 10 flooded, 10 dry, 10 invalid)
- Replace fake `classifyFromRequest` (which reads `__classifier_result` test hints) with real CLIP inference
- Use cosine similarity between uploaded image and class embeddings
- Return `ClassifierResult` with confidence, label, and reason

### Temporal Validation
- Extract EXIF timestamp from uploaded photo using `exifr` library (already installed)
- Calculate phase windows from `sow_date` in `season_inputs` table:
  - prepare phase: sow_date - 37 days → sow_date + 7 days (7-day grace)
  - grow phase: sow_date - 7 days → sow_date + 127 days (7-day grace)
  - harvest phase: sow_date + 113 days → sow_date + 157 days (7-day grace)
- Validate photo_timestamp ∈ phase[photo_type]
- If EXIF present and within window → continue to classification
- If EXIF present and outside window → reject with message "Photo taken at wrong time"
- If EXIF missing → flag for admin review (can't verify temporal integrity)

### Auto-Verify Rules
- Implement auto-verify logic in `src/vision/auto-verify.ts`
- Rules evaluated at upload time after CLIP classification:
  - IF confidence ≥ 0.95 AND trust ≥ 0.80 → auto-verify (pre_verified=1, admin_status='verified')
  - IF confidence ≥ 0.85 AND trust ≥ 0.95 → auto-verify (pre_verified=1, admin_status='verified')
  - IF confidence < 0.60 AND trust < 0.50 → auto-reject (ai_status='reject', admin_status='rejected')
  - ELSE → queue for admin review (ai_status='flag', admin_status='pending')
- Write audit log entry for every auto-verify/auto-reject decision

### Farmer Trust Scoring
- Create `src/farmer/trust.ts` module
- Add `farmer_trust` table to schema:
  ```sql
  CREATE TABLE farmer_trust (
    farmer_id TEXT PRIMARY KEY REFERENCES farmers(id),
    total_photos INTEGER DEFAULT 0,
    accepted_photos INTEGER DEFAULT 0,
    trust_score REAL DEFAULT 0.50,
    updated_at TEXT DEFAULT (datetime('now'))
  );
  ```
- Trust calculation: `trust_score = accepted_photos / total_photos`
- New farmers start at trust = 0.50 (neutral)
- After 10 photos, trust becomes data-driven
- Update trust after each admin decision (verify/reject)
- Query trust score at upload time for auto-verify rules

### Retake Push Notification
- After photo rejection, call LINE push API with retake prompt
- Use `src/line/reply.ts` existing push infrastructure
- Include reason, photo_type, and season phase info in flex message
- Write to `farmer_messages` table for audit trail

### Admin Queue Digest (Cron)
- Create `src/cron/queue-digest.ts`
- Configure `wrangler.toml` `[crons]` → daily at 9am
- Query queue length: `SELECT COUNT(*) FROM photo_evidence WHERE admin_status='pending'`
- If queue > 10, send LINE push to admin with:
  - Queue length
  - Precision stat (from `src/admin/precision.ts`)
  - Trust distribution (count of farmers by trust band)

### Stale Photo Escalation (Cron)
- Create `src/cron/stale-escalation.ts`
- Configure `wrangler.toml` `[crons]` → every 6 hours
- Query photos pending > 48h: `SELECT * FROM photo_evidence WHERE admin_status='pending' AND created_at < datetime('now', '-48 hours')`
- For each stale photo:
  - Bump confidence threshold by 0.05 and re-screen, OR
  - Send LINE push to admin with photo details

### Schema Changes
- Add `farmer_trust` table (see Farmer Trust Scoring section)
- No changes to existing tables (temporal validation uses existing `season_inputs.sow_date`)

### API Contracts
- No new API endpoints (all automation happens at upload time or via cron)
- Existing endpoints unchanged:
  - `POST /photo/upload` → adds temporal validation + auto-verify logic
  - `POST /api/admin/review/:photoId` → adds trust score update
  - `GET /api/admin/review` → unchanged (queue filtering already works)

## Testing Decisions

### What Makes a Good Test
- Test external behavior, not implementation details
- Use existing test infrastructure (Vitest + Playwright)
- Prior art: `tests/vision/screen.test.ts`, `tests/admin/review.test.ts`

### Modules to Test
- **Temporal validation**: Test EXIF extraction, phase window calculation, grace period logic
- **Auto-verify rules**: Test confidence + trust combinations (matrix of 9 cases)
- **Farmer trust scoring**: Test trust calculation, update after admin decision, new farmer bootstrap
- **CLIP integration**: Test classification with known images (flooded/dry/invalid)
- **Cron jobs**: Test queue digest logic, stale escalation logic

### Test Cases
- Temporal validation: photo within window → pass, photo outside window → reject, missing EXIF → flag
- Auto-verify: confidence=0.95, trust=0.80 → auto-verify; confidence=0.50, trust=0.40 → auto-reject; confidence=0.70, trust=0.60 → queue
- Trust scoring: new farmer starts at 0.50; after 10 photos with 8 accepted → trust=0.80; admin verifies photo → increment accepted_photos
- CLIP integration: upload flooded photo → confidence > 0.9, label='flooded'; upload invalid photo → confidence > 0.9, label='invalid'

## Out of Scope

- **Tier 2/3 automation**: Precision-gated threshold auto-raise, active learning from overrides, multi-model consensus
- **Farmer reputation UI**: No admin dashboard to view/edit farmer trust scores (trust is calculated automatically)
- **Temporal validation UI**: No admin dashboard to view photos rejected for temporal mismatch (they're auto-rejected)
- **Cron job monitoring**: No admin dashboard to view cron job history or failures
- **Batch admin actions**: No bulk verify/reject in admin queue UI
- **Season approval UI**: No frontend for `POST /api/season/approve` (API exists but no UI)

## Further Notes

### Implementation Order
1. **CLIP integration** (highest ROI, unlocks auto-verify)
2. **Temporal validation** (carbon compliance requirement)
3. **Auto-verify rules + trust scoring** (collapses queue)
4. **Retake push notification** (farmer UX)
5. **Cron jobs** (admin awareness)

### Dependencies
- `exifr` library for EXIF extraction (already installed)
- CLIP model weights and example embeddings (already trained, stored in `src/vision/bakeoff/`)
- LINE push API (already configured in `src/line/reply.ts`)

### Risks
- **CLIP model size**: 890MB may exceed Cloudflare Workers memory limit (10MB). May need to deploy CLIP as external API endpoint or distill to smaller model.
- **EXIF stripping**: Many phones strip EXIF on upload. Temporal validation will flag many photos for admin review until farmers learn to preserve metadata.
- **Trust bootstrapping**: New farmers start at 0.50 trust. If they upload 10 bad photos early, their trust drops to 0.0 and they're auto-rejected going forward. Consider adding trust recovery mechanism in future iteration.

### Success Metrics
- Admin queue volume: target <10 photos/day (from 50+/day)
- Auto-verify rate: target >70% of photos auto-verified
- Temporal rejection rate: target <5% of photos rejected for temporal mismatch
- Farmer retake rate: target >80% of rejected photos retaken within 24 hours
