#!/bin/bash
# Autonomous agent loop: fetch issues from project board and implement them
set -e

cd /root/netzero-app

# Load environment
set -a
source .sandcastle/.env
set +a

# Configure git
git config user.email "agent@netzero.app"
git config user.name "NetZero Agent"

echo "$(date): Starting agent loop..."

while true; do
  echo "$(date): Fetching next open issue from project board..."
  
  # Get the lowest-numbered open issue from the project board
  ISSUE_JSON=$(gh project item-list 10 --owner Poom5741 --limit 100 --format json)
  
  # Extract open issues (status = Todo) with their issue numbers
  ISSUE_NUMBERS=$(echo "$ISSUE_JSON" | jq -r '.items[] | select(.status == "Todo") | .content.number' | sort -n)
  
  if [ -z "$ISSUE_NUMBERS" ]; then
    echo "$(date): No open issues found. Sleeping for 1 hour..."
    sleep 3600
    continue
  fi
  
  # Pick the first (lowest-numbered) issue
  ISSUE_NUMBER=$(echo "$ISSUE_NUMBERS" | head -n 1)
  
  echo "$(date): Found issue #$ISSUE_NUMBER"
  
  # Fetch full issue details
  ISSUE_TITLE=$(gh issue view $ISSUE_NUMBER --json title -q '.title')
  ISSUE_BODY=$(gh issue view $ISSUE_NUMBER --json body -q '.body')
  
  echo "$(date): Issue title: $ISSUE_TITLE"
  
  # Create prompt for Pi
  PROMPT="Implement GitHub issue #$ISSUE_NUMBER: $ISSUE_TITLE

Issue details:
$ISSUE_BODY

Instructions:
1. Read and understand the issue requirements
2. Implement the changes in the codebase
3. Write or update tests if applicable
4. Run typecheck and tests to verify your changes work
5. Commit your changes with a message starting with #$ISSUE_NUMBER:
6. Make sure all tests pass before finishing

Focus on making the minimal correct changes to satisfy the issue requirements."
  
  # Run Sandcastle with this issue
  echo "$(date): Running Sandcastle for issue #$ISSUE_NUMBER..."
  
  # Create a temporary main.ts for this issue
  cat > .sandcastle/issue-runner.ts << EOF
import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

await run({
  name: "issue-$ISSUE_NUMBER",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt: $(echo "$PROMPT" | jq -Rs .),
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
EOF
  
  # Run the agent
  if timeout 600 npx tsx .sandcastle/issue-runner.ts 2>&1 | tee -a /var/log/netzero-agent.log; then
    echo "$(date): Agent finished working on issue #$ISSUE_NUMBER"
    
    # Check if there are uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
      echo "$(date): Committing changes for issue #$ISSUE_NUMBER"
      git add -A
      git commit -m "#$ISSUE_NUMBER: $ISSUE_TITLE

Implemented by autonomous agent"
      
      # Push changes
      git push origin main
      echo "$(date): Pushed changes to main"
    else
      echo "$(date): No changes to commit for issue #$ISSUE_NUMBER"
    fi
    
    # Update project board status to Done
    ITEM_ID=$(echo "$ISSUE_JSON" | jq -r ".items[] | select(.content.number == $ISSUE_NUMBER) | .id")
    if [ -n "$ITEM_ID" ]; then
      gh project item-edit --id "$ITEM_ID" --project-id PVT_kwHOAfefzM4Bhha3 --field-id PVTSSF_lAHOAfefzM4Bhha3zhgc3FY --single-select-option-id 98236657
      echo "$(date): Updated project board status to Done"
    fi
    
    # Close the issue
    gh issue close $ISSUE_NUMBER --comment "Implemented by autonomous agent"
    echo "$(date): Closed issue #$ISSUE_NUMBER"
  else
    echo "$(date): Failed to complete issue #$ISSUE_NUMBER"
  fi
  
  # Clean up
  rm -f .sandcastle/issue-runner.ts
  
  # Small delay before next issue
  sleep 5
done
