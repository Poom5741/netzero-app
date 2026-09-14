# Spec-Driven Workflow Setup Complete

**Installed:** 2026-09-14

---

## What Was Installed

### 1. Spec Files
- `specs/line-oa/spec.md` - LINE OA specification (extracted from Claude Design artifact)
- `specs/admin/` - Empty (needs spec extraction)
- `specs/sponsor/` - Empty (needs spec extraction)

### 2. Compliance Check Script
- `scripts/check-spec-compliance.sh` - Checks implementation against spec
- **Usage:** `./scripts/check-spec-compliance.sh`
- **Exit codes:** 0 = compliant, 1 = gaps detected

### 3. Visual Regression Tests
- `tests/visual/spec-comparison.spec.ts` - Playwright visual tests
- **Usage:** `npm run test:visual` (requires `pixelmatch` and `canvas`)

### 4. Guidance Skill
- `~/.zcode/skills/spec-driven-workflow/SKILL.md` - Workflow guidance
- **Usage:** Read the skill file for next steps

### 5. Status Check Script
- `scripts/what-next.sh` - Shows current status and suggests next steps
- **Usage:** `./scripts/what-next.sh`

---

## Current Status

### Spec Compliance
- **LINE OA:** 33/36 checks pass, 3 gaps detected
  - ❌ BR-01: SF_w = 0.55 calculation not found
  - ❌ BR-02: SF_w fallback to 0.71 not found
  -  BR-03: SY-03 chat photo rejection not found

### Specs
- ✅ LINE OA spec exists
- ⚠️ Admin spec missing
- ⚠️ Sponsor spec missing

### Traceability
- ⚠️ All traceability files missing

### Visual Regression
- ⚠️ No baseline screenshots captured

---

## Next Steps (In Order)

### Step 1: Fix LINE OA Compliance Gaps
```bash
# Check where SF_w calculation actually lives
grep -r "0.55" src/

# Check where SY-03 is handled
grep -r "SY-03" src/

# If missing, implement the business rules
# Then re-run compliance check
./scripts/check-spec-compliance.sh
```

### Step 2: Extract Admin & Sponsor Specs
```bash
# Manual process:
# 1. Open Claude Design artifacts in browser
# 2. Download frame payloads
# 3. Extract manifest + template
# 4. Write specs/admin/spec.md and specs/sponsor/spec.md
```

### Step 3: Create Traceability Files
```bash
# For each feature:
# Create specs/<feature>/traceability.md
# Map: REQ-ID → Implementation → Test → PR
```

### Step 4: Capture Visual Baselines
```bash
# 1. Install dependencies
npm install -D pixelmatch canvas

# 2. Open Claude Design artifacts in browser
# 3. Screenshot each state
# 4. Save to tests/visual/baselines/
```

### Step 5: Integrate with CI
```bash
# Add to .github/workflows/spec-compliance.yml
# Run compliance check + visual tests on every PR
```

---

## How to Use

### Before Starting a Feature
```bash
./scripts/what-next.sh
# Shows current status and suggests next steps
```

### After Implementing a Feature
```bash
./scripts/check-spec-compliance.sh
# Checks if implementation matches spec
```

### Before Creating a PR
```bash
./scripts/check-spec-compliance.sh
npm run test:visual
# Both must pass before merge
```

### When You Suspect Drift
```bash
./scripts/check-spec-compliance.sh
# Reveals gaps between spec and implementation
```

---

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│  SPEC-DRIVEN WORKFLOW                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SPECIFY (Human + AI)                                   │
│     └─ Write spec.md with acceptance criteria               │
│                                                             │
│  2. IMPLEMENT (AI)                                         │
│     └─ Code against spec, not vibes                         │
│                                                             │
│  3. VERIFY (Script)                                        │
│     └─ ./scripts/check-spec-compliance.sh                   │
│     └─ npm run test:visual                                  │
│                                                             │
│  4. TRACE (Human)                                          │
│     └─ Update traceability.md                               │
│                                                             │
│  5. REVIEW (Human)                                         │
│     └─ Create PR with REQ-IDs                               │
│     └─ Merge only if compliant                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Commands

| Command | Purpose | When to Run |
|---------|---------|-------------|
| `./scripts/what-next.sh` | Show status + suggestions | Anytime |
| `./scripts/check-spec-compliance.sh` | Check spec compliance | After implementation |
| `npm run test:visual` | Visual regression tests | After UI changes |
| `ls specs/` | List specs | Before starting feature |
| `cat specs/<feature>/spec.md` | Read spec | Before implementing |

---

## Troubleshooting

### "Compliance check fails but code looks correct"
- Check if spec is outdated
- Update spec if requirements changed intentionally
- Re-run check

### "Visual test fails but UI looks correct"
- Check if baseline screenshot is from correct artifact version
- Update baseline if design changed intentionally
- Re-run test

### "No spec exists for this feature"
- Write spec first (extract from Claude Design artifact)
- Don't implement without spec

---

## References

- **Skill file:** `~/.zcode/skills/spec-driven-workflow/SKILL.md`
- **Specs:** `specs/`
- **Scripts:** `scripts/`
- **Visual tests:** `tests/visual/`
- **Artifacts:** `visual-qa-screenshots/`
