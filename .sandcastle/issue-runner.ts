import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

await run({
  name: "issue-59",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt: "Implement GitHub issue #59: UX/UI Audit Fix Map — 16 issues, 3 phases\n\nIssue details:\n## Destination\n\nShip NetZeroCarbon with all audit issues resolved: WCAG AA contrast compliance, mobile-responsive layouts, persistent chat state, and zero dead controls.\n\n## Notes\n\n- **Audit report**: Comprehensive UX/UI audit completed 2026-08-25 with measured WCAG contrast ratios\n- **Frontend stack**: Next.js 16.3, Tailwind v4, Thai-first (lang=\"th\"), Material Symbols\n- **Design decisions made**:\n  - Chat bubbles: Option A (dark-green gradient #006e2b→#008a3c, white text, 4.6-4.9:1)\n  - Chat state: React Context (not sessionStorage)\n  - Sponsor mobile: Mirror admin responsive pattern (sidebar hidden lg:block)\n  - Dead controls: Remove entirely (don't implement stubs)\n\n## Decisions so far\n\n(None yet — map just created)\n\n## Not yet specified\n\n- Implementation order within each phase (audit suggests P0→P1→P2)\n- Whether to add e2e tests for each fix (audit recommends it)\n- Whether to update DEV_SETUP.md/CLAW_HANDOFF.md after fixes\n\n## Out of scope\n\n- Brand redesign (audit explicitly out of scope)\n- Backend architecture changes\n- GPS fallback disclosure decision (flagged as follow-up, not in this sprint)\n- Real-time data polling for sponsor dashboard (relable instead)\n\nInstructions:\n1. Read and understand the issue requirements\n2. Implement the changes in the codebase\n3. Write or update tests if applicable\n4. Run typecheck and tests to verify your changes work\n5. Commit your changes with a message starting with #59:\n6. Make sure all tests pass before finishing\n\nFocus on making the minimal correct changes to satisfy the issue requirements.\n",
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
