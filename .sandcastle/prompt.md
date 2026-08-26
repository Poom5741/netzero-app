# Context

## Debug: issue fetch diagnostics

!`cd /root/netzero-app && gh project item-list 10 --owner Poom5741 --limit 200 --format json > /tmp/sc-issues.json 2>/tmp/sc-issues.err; echo "exit=$? bytes=$(wc -c < /tmp/sc-issues.json) stderr=$(head -c 200 /tmp/sc-issues.err)"`

## Issue numbers found

!`cat /tmp/sc-issues.json | jq -r '[.items[] | select(.status == "Todo") | .content.number] | join(",")' 2>&1`

## Recent commits (last 5)

!`git log --oneline -5`

# Task

You are an autonomous coding agent working through issues one at a time.

Pick the lowest-numbered open issue whose blockers are all closed. Implement it:

1. **Explore** — read the issue body (fetch details with `gh issue view <number>`) and the relevant source files before writing any code.
2. **Execute** — implement the smallest correct change. Write/update tests if applicable.
3. **Verify** — run typecheck/tests if the repo defines them. Fix failures before committing.
4. **Commit** — one commit starting with `#<issue-number>:`.
5. **Comment** — post what you did to the issue: `gh issue comment <number> --body "..."`.

Rules: one issue per iteration; no commented-out code; if blocked, comment the blocker on the issue and move on.

# Done

If the issue-number list above is empty, output the completion signal:

<promise>COMPLETE</promise>
