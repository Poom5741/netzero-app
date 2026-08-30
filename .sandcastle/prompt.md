# Context

## Issue identifiers found (from Multica)

!`cd /root/netzero-app && multica issue list --status todo --output json | jq -r '.issues[] | .identifier' 2>/dev/null | tr '\n' ',' | sed 's/,$//'`

## Recent commits (last 5)

!`git log --oneline -5`

# Task

You are an autonomous coding agent working through issues one at a time.

Pick the first issue identifier. Implement it:

1. **Explore** — read the issue body (fetch details with `multica issue get <identifier>`) and the relevant source files before writing any code.
2. **Execute** — implement the smallest correct change. Write/update tests if applicable.
3. **Verify** — run typecheck/tests if the repo defines them. Fix failures before committing.
4. **Commit** — one commit starting with `<identifier>:`.
5. **Comment** — post what you did to the issue: `multica issue comment <identifier> --body "..."`.
6. **Done** — mark the issue as done: `multica issue status <identifier> done`.

Rules: one issue per iteration; no commented-out code; if blocked, comment the blocker on the issue and move on.

# Done

If the issue-number list above is empty, output the completion signal:

<promise>COMPLETE</promise>
