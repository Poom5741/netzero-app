# Autonomous Agent Monitoring Handoff

## Overview

The Sandcastle autonomous agent runs on the Hetzner VPS (157.180.95.221) and processes GitHub issues using TDD. This document provides monitoring commands and troubleshooting steps for a claw agent to monitor the system.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Hetzner VPS (157.180.95.221)                               │
│                                                              │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │  netzero-agent  │─────▶│  9router (port 8787)         │  │
│  │  (Sandcastle)   │      │  - localhost only (127.0.0.1)│  │
│  │                 │      │  - Docker bridge (172.17.0.x)│  │
│  │  Uses model:    │      │  - External: BLOCKED         │  │
│  │  main-coding-   │      │                              │  │
│  │  model          │      │  Providers:                    │  │
│  │                 │      │  - antigravity (Gemini)        │  │
│  │  Runs in Docker │      │  - alicode-intl (Qwen)         │  │
│  │  container      │      │  - glm (GLM)                   │  │
│  └─────────────────┘      │  - poolside (Laguna)           │  │
│                           │  - openrouter (free models)    │  │
│                           └──────────────────────────────┘  │
│                                                              │
│  iptables rules:                                             │
│  - ACCEPT 8787 from 127.0.0.1                               │
│  - ACCEPT 8787 from 172.17.0.0/16 (Docker bridge)           │
│  - DROP all other 8787 traffic                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Health Checks

### 1. Service Status
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "systemctl status netzero-agent --no-pager | head -10"
ssh -i ~/.ssh/poom-server root@157.180.95.221 "systemctl status 9router --no-pager | head -10"
```

**Expected:** Both services `active (running)`

### 2. 9router Health
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "curl -s http://localhost:8787/api/health"
```

**Expected:** `{"ok":true}`

### 3. Agent Progress
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "ls -t /root/netzero-app/.sandcastle/logs/main-sandcastle-netzero-agent-*.log 2>/dev/null | head -1 | xargs tail -20"
```

**Expected:** See iteration progress, agent working on an issue

### 4. Recent Commits
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "cd /root/netzero-app && git log --oneline -5"
```

### 5. Open Issues Count
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "gh project item-list 10 --owner Poom5741 --format json | jq -r '.items[] | select(.status == \"Todo\") | .content.number' | wc -l"
```

## Security Verification

### Verify External Access Blocked
```bash
# From LOCAL machine (not server):
curl -s --connect-timeout 5 http://157.180.95.221:8787/api/health
# Expected: Connection timeout or refused
```

### Verify iptables Rules
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "iptables -L INPUT -n --line-numbers | grep 8787"
```

**Expected output:**
```
1    ACCEPT     tcp  --  127.0.0.1       0.0.0.0/0       tcp dpt:8787
2    ACCEPT     tcp  --  172.17.0.0/16   0.0.0.0/0       tcp dpt:8787
3    DROP       tcp  --  0.0.0.0/0       0.0.0.0/0       tcp dpt:8787
```

## Troubleshooting

### Agent Crashed / Restarting
```bash
# Check logs
ssh -i ~/.ssh/poom-server root@157.180.95.221 "journalctl -u netzero-agent -n 50 --no-pager"

# Common errors:
# - "Model not found" → 9router not reachable from Docker
# - "403" / "credit" → Provider quota exhausted, combo will failover
# - "Overlapping env keys" → Config error in main.ts
```

### 9router Not Responding
```bash
# Restart 9router
ssh -i ~/.ssh/poom-server root@157.180.95.221 "systemctl restart 9router"

# Check provider status
ssh -i ~/.ssh/poom-server root@157.180.95.221 "curl -s -H 'Authorization: Bearer sk-58d602cfdc3ca98a-cm4k9w-fc61cfab' http://localhost:8787/v1/models | jq '.data[] | .id' | head -10"
```

### Docker Container Can't Reach 9router
```bash
# Test from inside container
ssh -i ~/.ssh/poom-server root@157.180.95.221 "docker run --rm --add-host=host.docker.internal:host-gateway sandcastle:netzero-app curl -s http://172.17.0.1:8787/api/health"

# If fails, check iptables
ssh -i ~/.ssh/poom-server root@157.180.95.221 "iptables -L INPUT -n | grep 8787"
```

## Configuration Files

| File | Purpose |
|------|---------|
| `/etc/systemd/system/netzero-agent.service` | Agent systemd service |
| `/etc/systemd/system/9router.service` | 9router systemd service |
| `/root/netzero-app/.sandcastle/main.ts` | Sandcastle config (model, sandbox) |
| `/root/netzero-app/.sandcastle/.env` | Environment variables (GH_TOKEN, API keys) |
| `/root/netzero-app/.sandcastle/prompt.md` | Agent prompt template |
| `/root/.9router/db/data.sqlite` | 9router database (providers, combos) |
| `/etc/iptables/rules.v4` | Firewall rules (persisted) |

## Key Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `GH_TOKEN` | .sandcastle/.env, systemd | GitHub API access |
| `NINE_ROUTER_BASE_URL` | .sandcastle/main.ts | 9router endpoint (http://172.17.0.1:8787) |
| `NINE_ROUTER_API_KEY` | .sandcastle/.env, main.ts | 9router auth |

## Model Configuration

- **Combo:** `main-coding-model` (30+ fallback models)
- **Provider:** 9router (local AI gateway)
- **Failover:** Automatic across antigravity, alicode-intl, glm, poolside, openrouter

## Monitoring Schedule

Recommended checks every 15 minutes:
1. Service status (both services running)
2. Agent progress (no errors in last hour)
3. Git commits (new commits indicate progress)
4. Open issues (count decreasing)

## Alert Conditions

| Condition | Action |
|-----------|--------|
| Agent service not running | `systemctl restart netzero-agent` |
| 9router service not running | `systemctl restart 9router` |
| No commits in 2+ hours | Check logs for errors |
| External access to 8787 | CRITICAL: iptables broken, investigate |
| Provider errors > 50% | Check provider quotas/keys |

## Project Board

- **URL:** https://github.com/users/Poom5741/projects/10/views/1
- **Columns:** Todo, In Progress, Done
- **Agent workflow:** Picks lowest-numbered Todo issue, implements via TDD, moves to Done

## Cost Tracking

- 9router routes to multiple providers with automatic failover
- Free models used when available (openrouter/minimax, kgw/kilo-auto/free)
- Check usage: `curl -s -H 'Authorization: Bearer sk-58d602cfdc3ca98a-cm4k9w-fc61cfab' http://localhost:8787/api/usage`

## Recovery Procedures

### Full Restart
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "systemctl restart 9router && sleep 5 && systemctl restart netzero-agent"
```

### Restore iptables Rules
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "iptables-restore < /etc/iptables/rules.v4"
```

### Check 9router Backup
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "ls -la /root/.9router/backup-import.json"
```
