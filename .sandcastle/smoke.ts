import { run, pi } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

// Smoke test: verify Pi + 9router + branching + commit collection work end-to-end.
await run({
  name: "smoke",
  sandbox: noSandbox(),
  agent: pi("9router/high-context-coding"),
  prompt:
    "Create a file named smoke-test.txt in the repo root containing exactly: sandcastle works. Commit it with the message: smoke test.",
  maxIterations: 1,
  branchStrategy: { type: "merge-to-head" },
});
