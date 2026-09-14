# Spec-Driven Workflow Setup Guide

This guide shows how to set up the spec-driven workflow on a new machine or share it with your team.

## Quick Start

```bash
# Run the automated setup script
./scripts/setup-spec-driven.sh
```

This will:
- ✅ Install GitHub Spec Kit (specify CLI)
- ✅ Verify ZCode skills are installed
- ✅ Check project dependencies
- ✅ Validate project structure

## What Gets Installed

### 1. GitHub Spec Kit
- **Tool:** `specify` CLI (v1.0.7.dev0)
- **Purpose:** Official spec-driven development toolkit from GitHub
- **Commands:** `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-converge`

### 2. ZCode Skills
- **spec-driven-workflow** — Main workflow guide (this skill)
- **github-spec-kit** — GitHub Spec Kit commands reference
- **visual-qa** — Visual testing and design comparison

### 3. Project Dependencies
- **pixelmatch** — Pixel-level image comparison
- **canvas** — Image processing for visual tests

### 4. Custom Scripts
- **check-spec-compliance.sh** — Check implementation vs spec
- **what-next.sh** — Show status and suggest next steps
- **setup-spec-driven.sh** — Automated setup (this script)

## Manual Setup (If Needed)

If the automated script doesn't work, follow these steps:

### Step 1: Install uv (Python package manager)
```bash
pip3 install uv
```

### Step 2: Install GitHub Spec Kit
```bash
cd /tmp
git clone https://github.com/github/spec-kit.git
cd spec-kit
uv tool install specify-cli --from .
cd ~
rm -rf /tmp/spec-kit
```

### Step 3: Install visual test dependencies
```bash
npm install -D pixelmatch canvas
```

### Step 4: Verify ZCode skills
```bash
ls ~/.zcode/skills/spec-driven-workflow/SKILL.md
ls ~/.zcode/skills/github-spec-kit/SKILL.md
ls ~/.zcode/skills/visual-qa/SKILL.md
```

If any are missing, install them via ZCode:
- `/spec-driven-workflow`
- `/github-spec-kit`
- `/visual-qa`

## Verify Setup

```bash
# Check if everything is installed
./scripts/setup-spec-driven.sh

# Check current status
./scripts/what-next.sh

# Run compliance check
./scripts/check-spec-compliance.sh
```

## Initialize Project (One-Time)

```bash
# Initialize GitHub Spec Kit
specify init . --integration copilot

# Create your first spec
mkdir -p specs/my-feature
# Write spec in specs/my-feature/spec.md
```

## Workflow

1. **Specify** — Write spec in `specs/<feature>/spec.md`
2. **Plan** — Use `/speckit-plan` to create implementation plan
3. **Tasks** — Use `/speckit-tasks` to break into tasks
4. **Implement** — Code the feature
5. **Verify** — Run `./scripts/check-spec-compliance.sh`
6. **Visual QA** — Run `/visual-qa` for UI features
7. **Converge** — Use `/speckit-converge` to finalize

## Sharing with Team

To share this workflow with your team:

1. **Commit the setup script** (already done):
   ```bash
   git add scripts/setup-spec-driven.sh
   git commit -m "feat: add spec-driven workflow setup"
   ```

2. **Team members run**:
   ```bash
   git pull
   ./scripts/setup-spec-driven.sh
   ```

3. **They'll have**:
   - All tools installed
   - All skills available
   - Project structure validated
   - Ready to start working

## Troubleshooting

### "specify: command not found"
```bash
# Reinstall GitHub Spec Kit
cd /tmp && git clone https://github.com/github/spec-kit.git
cd spec-kit && uv tool install specify-cli --from .
```

### "pixelmatch not found"
```bash
npm install -D pixelmatch canvas
```

### "ZCode skills not found"
Install via ZCode:
- `/spec-driven-workflow`
- `/github-spec-kit`
- `/visual-qa`

## Next Steps

After setup:
1. Run `./scripts/what-next.sh` to see current status
2. Read `~/.zcode/skills/spec-driven-workflow/SKILL.md` for workflow details
3. Start your first feature with `/speckit-specify`

## Resources

- **GitHub Spec Kit:** https://github.com/github/spec-kit
- **Spec-Driven Development:** See `~/.zcode/skills/spec-driven-workflow/SKILL.md`
- **Visual QA:** See `~/.zcode/skills/visual-qa/SKILL.md`
