import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

await run({
  name: "issue-62",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt: "Implement GitHub issue #62: B2: Fix photo upload route prefix mismatch\n\nIssue details:\n## Question\n\nPhoto upload fails because frontend calls /api/photo/upload but backend registers /photo/upload (no /api prefix). How should we fix this?\n\n## Context\n\n- Frontend: frontend/src/app/upload/page.tsx calls POST /api/photo/upload\n- Backend: src/routes/photo.ts registers POST /photo/upload (no /api prefix)\n- Next.js rewrite: /api/:path* → http://localhost:8787/api/:path*\n- Result: backend never sees the route, returns 404\n\n## Options\n\nA. Change backend to register /api/photo/upload (consistent with other routes)\nB. Change frontend to call /photo/upload (inconsistent with other routes)\nC. Add both routes for backward compatibility\n\n## Success criteria\n\n- POST /api/photo/upload returns 200\n- Photo is uploaded to R2 storage\n- Frontend upload page works without error\n\nInstructions:\n1. Read and understand the issue requirements\n2. Implement the changes in the codebase\n3. Write or update tests if applicable\n4. Run typecheck and tests to verify your changes work\n5. Commit your changes with a message starting with #62:\n6. Make sure all tests pass before finishing\n\nFocus on making the minimal correct changes to satisfy the issue requirements.\n",
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
