# Autonomous Agent Debug Handoff

## Current Status

**Goal**: Run a Sandcastle autonomous agent on a remote server (157.180.95.221) that processes GitHub issues using Test-Driven Development (TDD).

**Current Problem**: The Pi agent inside the Sandcastle Docker container cannot find the `9router/high-context-coding` model, even though the model is available and the `pi-9router-ext` extension is installed.

## Server Details

- **IP**: 157.180.95.221
- **SSH**: `ssh -i ~/.ssh/poom-server root@157.180.95.221`
- **Project Path**: `/root/netzero-app`
- **Sandcastle Config**: `/root/netzero-app/.sandcastle/`

## What Works

✅ **9router is running** on port 8787
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "curl http://localhost:8787/api/health"
# Returns: {"status":"ok"}
```

✅ **pi-9router-ext is installed** in the Docker image
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "docker run --rm --entrypoint pi sandcastle:netzero-app list"
# Shows: npm:pi-9router-ext
```

✅ **Pi can list 9router models** when run manually with correct env vars
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "docker run --rm --entrypoint pi --add-host=host.docker.internal:host-gateway -e NINE_ROUTER_BASE_URL=http://172.17.0.1:8787 -e NINE_ROUTER_API_KEY=sk-58d602cfdc3ca98a-cm4k9w-fc61cfab sandcastle:netzero-app --list-models"
# Shows: 9router/high-context-coding (128K context)
```

✅ **Docker container can reach 9router**
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "docker run --rm --add-host=host.docker.internal:host-gateway sandcastle:netzero-app curl http://172.17.0.1:8787/api/health"
# Returns: {"status":"ok"}
```

## What Doesn't Work

❌ **Sandcastle agent fails to find the model**
```bash
ssh -i ~/.ssh/poom-server root@157.180.95.221 "journalctl -u netzero-agent -n 50"
# Error: Model "9router/high-context-coding" not found. Use --list-models to see available models.
```

## Configuration Files

### .sandcastle/main.ts
```typescript
import { run, pi } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, ".env");
const envContent = readFileSync(envPath, "utf-8");
const parsedEnv: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      parsedEnv[key] = valueParts.join("=").trim();
    }
  }
}

// Autonomous agent loop using Sandcastle's built-in iteration
await run({
  name: "netzero-agent",
  agent: pi("high-context-coding", {
    provider: "9router", // Explicitly set provider for Pi
  }),
  sandbox: docker({
    image: "sandcastle:netzero-app",
    extraHosts: ["host.docker.internal:host-gateway"],
    env: {
      NINE_ROUTER_BASE_URL: parsedEnv.NINE_ROUTER_BASE_URL || "http://172.17.0.1:8787",
      NINE_ROUTER_API_KEY: parsedEnv.NINE_ROUTER_API_KEY || "",
    },
  }),
  promptFile: "./.sandcastle/prompt.md",
  maxIterations: 50,
  branchStrategy: { type: "merge-to-head" },
});
```

### .sandcastle/.env
```
GH_TOKEN=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
NINE_ROUTER_BASE_URL=http://172.17.0.1:8787
NINE_ROUTER_API_KEY=sk-58d602cfdc3ca98a-cm4k9w-fc61cfab
```

### .sandcastle/Dockerfile
```dockerfile
FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Build-args for UID/GID alignment
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Rename the base image's "node" user to "agent" and align UID/GID.
RUN groupmod -o -g $AGENT_GID node && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node

# Install pi coding agent (run as root before USER agent)
RUN npm install -g @earendil-works/pi-coding-agent

# Install pi-9router-ext extension for the agent user
USER ${AGENT_UID}:${AGENT_GID}
ENV HOME=/home/agent
RUN pi install npm:pi-9router-ext

WORKDIR /home/agent

ENTRYPOINT ["sleep", "infinity"]
```

### /etc/systemd/system/netzero-agent.service
```ini
[Unit]
Description=NetZero Autonomous Agent (Sandcastle)
After=network.target 9router.service
Requires=9router.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/netzero-app
Environment=GH_TOKEN=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
Environment=NINE_ROUTER_BASE_URL=http://172.17.0.1:8787
Environment=NINE_ROUTER_API_KEY=sk-58d602cfdc3ca98a-cm4k9w-fc61cfab
ExecStart=/usr/bin/npx tsx .sandcastle/main.ts
Restart=always
RestartSec=60
StandardOutput=append:/var/log/netzero-agent.log
StandardError=append:/var/log/netzero-agent.log

[Install]
WantedBy=multi-user.target
```

## What Has Been Tried

1. ✅ Installed `pi-9router-ext` in Docker image (both as root and as agent user)
2. ✅ Set `NINE_ROUTER_BASE_URL` and `NINE_ROUTER_API_KEY` in multiple places:
   - `.sandcastle/.env` file
   - systemd service environment
   - `main.ts` docker sandbox env
   - `main.ts` pi agent env
3. ✅ Added `extraHosts: ["host.docker.internal:host-gateway"]` to docker config
4. ✅ Tried different model name formats:
   - `"9router/high-context-coding"`
   - `"high-context-coding"` with `provider: "9router"`
5. ✅ Verified Docker container can reach 9router via `http://172.17.0.1:8787`
6. ✅ Verified Pi can list models when run manually with correct env vars

## Root Cause Analysis

The problem appears to be that **Sandcastle is not passing the environment variables to the Pi agent correctly**. Even though:
- The env vars are set in the systemd service
- The env vars are set in the docker sandbox config
- The env vars are set in the pi agent config
- The Docker container can reach 9router

Pi still cannot find the model when launched by Sandcastle.

## Next Steps to Debug

1. **Check what command Sandcastle actually runs**:
   ```bash
   ssh -i ~/.ssh/poom-server root@157.180.95.221 "journalctl -u netzero-agent -n 100 | grep 'pi -p'"
   ```
   Look for the exact command and check if env vars are passed.

2. **Add debug logging to main.ts**:
   ```typescript
   console.log("Parsed env:", parsedEnv);
   console.log("Pi config:", { provider: "9router", env: {...} });
   ```

3. **Try running the exact Sandcastle command manually**:
   ```bash
   ssh -i ~/.ssh/poom-server root@157.180.95.221 "cd /root/netzero-app && NINE_ROUTER_BASE_URL=http://172.17.0.1:8787 NINE_ROUTER_API_KEY=sk-58d602cfdc3ca98a-cm4k9w-fc61cfab npx tsx .sandcastle/main.ts"
   ```

4. **Check if Sandcastle supports `provider` option for pi()**:
   - Look at Sandcastle source code or documentation
   - The `provider` option might not be supported

5. **Try using a different model that doesn't require 9router**:
   - Test with a standard provider like `anthropic/claude-sonnet-4-20250514`
   - This will confirm if the issue is specific to 9router or a general Sandcastle config problem

## Monitoring Commands

```bash
# Check service status
ssh -i ~/.ssh/poom-server root@157.180.95.221 "systemctl status netzero-agent"

# View logs
ssh -i ~/.ssh/poom-server root@157.180.95.221 "tail -f /var/log/netzero-agent.log"

# Check recent commits (what the agent has done)
ssh -i ~/.ssh/poom-server root@157.180.95.221 "cd /root/netzero-app && git log --oneline -10"

# Check remaining open issues
ssh -i ~/.ssh/poom-server root@157.180.95.221 "gh project item-list 10 --owner Poom5741 --format json | jq -r '.items[] | select(.status == \"Todo\") | .content.number'"
```

## Cron Job for Monitoring

Add to crontab (`crontab -e`):
```bash
*/15 * * * * /path/to/monitor-agent.sh
```

### Monitor Script
```bash
#!/bin/bash

SERVER="root@157.180.95.221"
SSH_KEY="$HOME/.ssh/poom-server"
LOG_FILE="$HOME/agent-monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if agent service is running
AGENT_STATUS=$(ssh -i "$SSH_KEY" "$SERVER" "systemctl is-active netzero-agent" 2>/dev/null)

if [ "$AGENT_STATUS" != "active" ]; then
    log "WARNING: Agent service is not running (status: $AGENT_STATUS). Attempting restart..."
    ssh -i "$SSH_KEY" "$SERVER" "systemctl restart netzero-agent"
    log "Agent service restarted"
else
    log "Agent service is running normally"
fi

# Check if 9router is running
ROUTER_STATUS=$(ssh -i "$SSH_KEY" "$SERVER" "systemctl is-active 9router" 2>/dev/null)

if [ "$ROUTER_STATUS" != "active" ]; then
    log "WARNING: 9router service is not running (status: $ROUTER_STATUS). Attempting restart..."
    ssh -i "$SSH_KEY" "$SERVER" "systemctl restart 9router"
    log "9router service restarted"
else
    log "9router service is running normally"
fi

# Check recent activity
LAST_COMMIT=$(ssh -i "$SSH_KEY" "$SERVER" "cd /root/netzero-app && git log -1 --format='%h %s (%cr)'" 2>/dev/null)
log "Last commit: $LAST_COMMIT"

# Check remaining issues
REMAINING=$(ssh -i "$SSH_KEY" "$SERVER" "gh project item-list 10 --owner Poom5741 --format json | jq -r '.items[] | select(.status == \"Todo\") | .content.number' | wc -l" 2>/dev/null)
log "Remaining open issues: $REMAINING"
```

## Project Board

- **URL**: https://github.com/users/Poom5741/projects/10/views/1
- **Status Columns**: Todo, In Progress, Done
- **Agent Workflow**: Picks issues from "Todo" column, implements them using TDD, moves to "Done"

## Key Files

- **Agent Loop Script**: `/root/netzero-app/agent-loop.sh` (old custom loop, not used)
- **Sandcastle Config**: `/root/netzero-app/.sandcastle/main.ts`
- **Environment Variables**: `/root/netzero-app/.sandcastle/.env`
- **Agent Logs**: `/var/log/netzero-agent.log`
- **Sandcastle Logs**: `/root/netzero-app/.sandcastle/logs/`

## Cost Tracking

- **9router**: Routes to multiple providers (Gemini, Qwen, etc.)
- **API Usage**: Check 9router dashboard at `http://157.180.95.221:8787`
- **Model Combo**: `high-context-coding` uses 1M+ context window models

## Notes

- The agent uses the `9router/high-context-coding` model combo for maximum context window
- 9router provides automatic fallback between multiple AI providers
- The agent follows TDD methodology: write failing tests first, then implement, then refactor
- Each issue gets its own Sandcastle run with isolated environment
- Commits are automatically pushed to main branch
