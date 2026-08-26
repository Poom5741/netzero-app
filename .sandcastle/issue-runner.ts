import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

await run({
  name: "issue-64",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt: "Implement GitHub issue #64: B4: Add phone number validation in chat flow\n\nIssue details:\n## Question\n\nChat accepts any input as phone number (e.g. '123'), creating stuck pending accounts. How should we validate?\n\n## Context\n\n- Frontend: frontend/src/app/chat/page.tsx sends user input to /api/chat\n- Backend: src/line/flow.ts accepts any text as phone, creates line_link with status='pending'\n- User who enters bad phone is trapped in permanent pending loop with no error/retry\n\n## Options\n\nA. Validate /^0\\d{9}$/ (Thai mobile format) in backend, return error if invalid\nB. Validate in frontend before sending, show error message\nC. Both frontend + backend validation (defense in depth)\nD. Allow retry: if status=pending, let user re-enter phone\n\n## Success criteria\n\n- Invalid phone rejected with Thai error message\n- User can retry after bad input\n- No stuck pending accounts from typos\n\nInstructions:\n1. Read and understand the issue requirements\n2. Implement the changes in the codebase\n3. Write or update tests if applicable\n4. Run typecheck and tests to verify your changes work\n5. Commit your changes with a message starting with #64:\n6. Make sure all tests pass before finishing\n\nFocus on making the minimal correct changes to satisfy the issue requirements.\n",
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
