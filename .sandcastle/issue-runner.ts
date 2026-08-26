import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

await run({
  name: "issue-61",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt: "Implement GitHub issue #61: B1: Implement /api/season endpoint for summary save\n\nIssue details:\n## Question\n\nThe summary page POSTs to /api/season but the backend has no such endpoint. How should we implement it?\n\n## Context\n\n- Frontend: frontend/src/app/summary/page.tsx calls POST /api/season with water_level_cm, straw_mgmt, fuel_liters, electricity_kwh\n- Backend: src/routes/ has no season.ts route file\n- Database: src/db/migrate.sql has season_inputs table (plot_id, season_id, water_level_cm, straw_mgmt, fuel_liters, electricity_kwh, submitted_at)\n\n## Options\n\nA. Create src/routes/season.ts with POST /api/season that inserts into season_inputs\nB. Reuse existing src/season/summary.ts helper (if it exists)\nC. Something else?\n\n## Success criteria\n\n- POST /api/season returns 200 with {success: true}\n- Data is inserted into season_inputs table\n- Frontend summary page can save without error\n\nInstructions:\n1. Read and understand the issue requirements\n2. Implement the changes in the codebase\n3. Write or update tests if applicable\n4. Run typecheck and tests to verify your changes work\n5. Commit your changes with a message starting with #61:\n6. Make sure all tests pass before finishing\n\nFocus on making the minimal correct changes to satisfy the issue requirements.\n",
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
