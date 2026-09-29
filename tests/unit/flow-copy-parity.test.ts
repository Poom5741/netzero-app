import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Copy-parity audit: does the bot speak the artifact's script verbatim?
 *
 * The artifact's script module (5a25b866-38ba-416b-afff-53fe6c36cc28.js) says the
 * copy "is taken from the NZC chatbot spec" — so the Thai text is the spec, not a
 * suggestion. This compares each node's artifact title against the strings the
 * builders actually emit.
 *
 * Run: bun test tests/unit/flow-copy-parity.test.ts
 */

import { describe, expect, it } from "vitest";
import { buildConditions3Checkbox, buildWelcomeBubble } from "../../src/line/flex-builders";

const SCRIPT = JSON.parse(
  readFileSync(join(process.cwd(), "specs", "016-flow-parity", "script.json"), "utf8"),
) as Array<Record<string, string>>;

const byNode = (node: string, type = "flex") =>
  SCRIPT.find((s) => s.node === node && s.type === type);

/** Flatten a Flex document to the Thai text it would show. */
function textOf(msg: unknown): string {
  const out: string[] = [];
  const walk = (n: unknown): void => {
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    for (const k of ["text", "title", "hero", "heroBadge", "altText", "label"]) {
      if (typeof o[k] === "string") out.push(o[k] as string);
    }
    for (const v of Object.values(o)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") walk(v);
    }
  };
  walk(msg);
  return out.join(" | ");
}

describe("artifact script — shape", () => {
  it("has the 43 steps the artifact documents", () => {
    expect(SCRIPT).toHaveLength(43);
  });

  it("contains every node the flow spec lists", () => {
    const nodes = new Set(SCRIPT.map((s) => s.node).filter(Boolean));
    for (const n of [
      "OB-01",
      "OB-03",
      "OB-05",
      "OB-10",
      "OB-11",
      "PJ-00",
      "PJ-13",
      "PJ-02",
      "PJ-09",
      "RP-01",
    ]) {
      expect(nodes.has(n)).toBe(true);
    }
  });
});

describe("copy parity — OB-01 welcome", () => {
  it("uses the artifact title verbatim", () => {
    const s = byNode("OB-01");
    expect(s).toBeDefined();
    expect(textOf(buildWelcomeBubble("liff-test"))).toContain(s!.title as string);
  });

  it("offers the artifact's primary action", () => {
    const s = byNode("OB-01");
    const primary = (s!.actions as Array<{ label: string; primary?: boolean }>).find(
      (a) => a.primary,
    );
    expect(textOf(buildWelcomeBubble("liff-test"))).toContain(primary!.label);
  });
});

describe("copy parity — OB-05 conditions", () => {
  it("uses the artifact title verbatim", () => {
    const s = byNode("OB-05");
    expect(s).toBeDefined();
    expect(textOf(buildConditions3Checkbox())).toContain(s!.title as string);
  });
});

describe("gallery-image rejection (SY-03)", () => {
  it("the artifact rejects a chat-sent image for lacking GPS/time", () => {
    const s = byNode("SY-03", "oa");
    expect(s).toBeDefined();
    expect(s!.text as string).toMatch(/หลักฐานไม่ได้/);
  });

  it("the webhook sends that exact copy and points at the system camera", () => {
    const s = byNode("SY-03", "oa");
    const src = readFileSync(join(process.cwd(), "src", "index.ts"), "utf8");
    // Verbatim from the artifact script, so the farmer sees the designed wording.
    // The script stores a real newline; the source carries it as an escape.
    expect(src).toContain((s!.text as string).replace(/\n/g, "\\n"));
    expect(src).toMatch(/message\?\.type === "image"/);
    expect(src).toContain("/liff/camera");
  });
});
