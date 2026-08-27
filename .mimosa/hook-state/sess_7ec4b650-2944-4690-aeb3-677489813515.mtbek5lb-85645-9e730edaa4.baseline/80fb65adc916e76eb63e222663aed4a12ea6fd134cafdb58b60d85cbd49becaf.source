import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FILE_PATH = "/tmp/sandcastle-test.txt";
const EXPECTED_CONTENT = "Sandcastle workflow verified";

describe("Issue #108: Sandcastle workflow verification file", () => {
  it("file exists at /tmp/sandcastle-test.txt", () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  it("file contains the exact text 'Sandcastle workflow verified'", () => {
    const content = readFileSync(FILE_PATH, "utf-8");
    expect(content).toBe(EXPECTED_CONTENT);
  });
});
