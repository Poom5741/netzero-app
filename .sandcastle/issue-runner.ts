import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

await run({
  name: "issue-63",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt: "Implement GitHub issue #63: B3: Fix fake GPS coordinates presented as verified\n\nIssue details:\n## Question\n\nUpload page shows demo coordinates (14.0322, 100.5231) with green check_circle when geolocation fails. How should we handle GPS fallback?\n\n## Context\n\n- Frontend: frontend/src/app/upload/page.tsx error callback sets gps to {lat: 14.0322, lng: 100.5231, accuracy: 10}\n- UI renders these coordinates with check_circle icon, making them look verified\n- For carbon-credit verification, fake GPS is a data-integrity risk\n\n## Options\n\nA. Show warning state with 'ตำแหน่งโดยประมาณ' (approximate location) text, no check_circle\nB. Block upload when GPS unavailable, require manual confirmation\nC. Show 'GPS ไม่สามารถระบุได้' (GPS unavailable) and disable upload button\nD. Combination: show warning + allow upload with manual GPS entry\n\n## Success criteria\n\n- User can clearly distinguish real vs fallback GPS\n- No fake coordinates presented as verified\n- Carbon-credit evidence integrity maintained\n\nInstructions:\n1. Read and understand the issue requirements\n2. Implement the changes in the codebase\n3. Write or update tests if applicable\n4. Run typecheck and tests to verify your changes work\n5. Commit your changes with a message starting with #63:\n6. Make sure all tests pass before finishing\n\nFocus on making the minimal correct changes to satisfy the issue requirements.\n",
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
