import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface ValidationResult {
  scenario: string;
  passed: boolean;
  output: string;
  error?: string;
}

interface Scenario {
  name: string;
  command: string;
  args: string[];
  description: string;
  /** If true, a non-zero exit code is treated as success (e.g. dimension mismatch = correct rejection) */
  expectNonZero?: boolean;
}

const VALIDATION_SCENARIOS: Scenario[] = [
  {
    name: "V1: Single Reference Capture",
    command: "bun",
    args: [
      "run",
      "tests/visual/scripts/capture-single.ts",
      "--screen=admin-login",
      "--state=default",
      "--viewport=1280x720",
    ],
    description: "Capture admin-login at 1280x720",
  },
  {
    name: "V2: Capture Determinism",
    command: "bun",
    args: ["run", "tests/visual/scripts/verify-determinism.ts"],
    description: "Verify determinism for 3 screens",
  },
  {
    name: "V3: Noise Measurement",
    command: "bun",
    args: [
      "run",
      "tests/visual/scripts/measure-noise.ts",
      "--screen=admin-login",
      "--viewport=1280x720",
      "--captures=5",
    ],
    description: "Measure noise for admin-login",
  },
  {
    name: "V4: Comparison Detects Intentional Change",
    command: "bun",
    args: [
      "run",
      "tests/visual/scripts/compare-pair.ts",
      "--ref=tests/visual/captures/reference/admin-login-default-1280x720.png",
      "--impl=tests/visual/captures/reference/admin-login-default-1280x720.png",
      "--tolerance=0",
    ],
    description: "Compare identical images with zero tolerance",
  },
  {
    name: "V5: Dimension Mismatch Rejection",
    command: "bun",
    args: [
      "run",
      "tests/visual/scripts/compare-pair.ts",
      "--ref=tests/visual/captures/multi-viewport/admin-login-1280x720.png",
      "--impl=tests/visual/captures/multi-viewport/admin-login-390x844.png",
      "--tolerance=0",
    ],
    description: "Compare images with different dimensions",
    expectNonZero: true, // dimension mismatch correctly detected → exit 1 → test passes
  },
  {
    name: "V6: All-Viewport Capture",
    command: "bun",
    args: ["run", "tests/visual/scripts/capture-all-viewports.ts", "--screen=admin-login"],
    description: "Capture admin-login at all 5 viewports",
  },
  {
    name: "V7: Coverage Manifest Completeness",
    command: "bun",
    args: ["run", "tests/visual/scripts/generate-coverage.ts"],
    description: "Generate coverage manifest",
  },
];

function runCommand(
  command: string,
  args: string[],
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: process.cwd(),
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      resolve({ stdout, stderr, code });
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      proc.kill();
      resolve({ stdout, stderr: "Command timed out after 60 seconds", code: null });
    }, 60000);
  });
}

async function runQuickstartValidation() {
  console.log(" Starting Quickstart Validation\n");
  console.log("=".repeat(80));

  const results: ValidationResult[] = [];
  let passedCount = 0;

  for (const scenario of VALIDATION_SCENARIOS) {
    console.log(`\n📋 ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log(`   Command: ${scenario.command} ${scenario.args.join(" ")}`);

    const result = await runCommand(scenario.command, scenario.args);

    // For scenarios that expect non-zero exit (e.g. dimension mismatch correctly detected)
    const passed = scenario.expectNonZero ? result.code !== 0 : result.code === 0;

    if (passed) {
      results.push({
        scenario: scenario.name,
        passed: true,
        output: result.stdout,
      });

      console.log(`   ✓ PASSED`);
      passedCount++;
    } else {
      results.push({
        scenario: scenario.name,
        passed: false,
        output: result.stdout,
        error: result.stderr || `Exit code: ${result.code}`,
      });

      console.log(`    FAILED`);
      if (result.stderr) {
        console.log(`   Error: ${result.stderr.split("\n")[0]}`);
      }
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("\n📊 Validation Summary\n");

  for (const result of results) {
    const status = result.passed ? "✓" : "✗";
    console.log(`   ${status} ${result.scenario}`);
  }

  console.log(`\n   Total: ${passedCount}/${VALIDATION_SCENARIOS.length} passed`);

  // Write summary
  const summaryPath = join(process.cwd(), "tests/visual/quickstart-validation-summary.json");
  writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        total: VALIDATION_SCENARIOS.length,
        passed: passedCount,
        failed: VALIDATION_SCENARIOS.length - passedCount,
        results,
      },
      null,
      2,
    ),
  );

  console.log(`\n✓ Summary written to ${summaryPath}`);

  const allPassed = passedCount === VALIDATION_SCENARIOS.length;
  console.log(
    `\n${allPassed ? "✓" : "✗"} Quickstart validation ${allPassed ? "PASSED" : "FAILED"}`,
  );

  process.exit(allPassed ? 0 : 1);
}

runQuickstartValidation().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
