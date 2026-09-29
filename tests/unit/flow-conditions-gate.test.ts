/**
 * J5 gate — OB-05 conditions must be tick-to-accept (BUG-017-B3).
 *
 * Artifact/design authority: flow-spec.md step 9-10 — "ขอให้อ่านและติ๊กยอมรับ
 * อีก 3 ข้อ" + card "ต้องติ๊กครบทุกข้อจึงจะไปต่อได้". Handoff finding: the
 * shipped card accepted without any ticks (no checkbox UI, no gate).
 *
 * Contract under test:
 * - Card renders one ☐/☑ toggle per condition (postback conditions_tick_N)
 *   plus the artifact actions (อ่านข้อความเต็ม · ยอมรับทั้ง 3 ข้อ).
 * - Ticking toggles persisted state (flow_scratch, append-only) and re-renders.
 * - ยอมรับ / conditions_accept is REFUSED until all 3 are ticked; then it
 *   advances to registration exactly as before.
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { buildConditions3Checkbox } from "../../src/line/flex-builders";
import { type ConversationState, type FlowContext, handleFlow } from "../../src/line/flow";
import { createTestHarness, type TestHarness } from "../helpers/test-harness";

async function runInput(h: TestHarness, state: ConversationState, text: string) {
  const ctx: FlowContext = {
    db: h.db,
    token: "test-token",
    apiKey: "test-api-key",
    userId: h.userId,
    linkId: h.linkId,
    farmerId: h.farmerId,
    state,
    selectedPlotId: null,
    liffId: "LIFF-TEST-ID",
    text,
    pushFn: h.transport.push.bind(h.transport),
  };
  await handleFlow(ctx);
  return h.transport.getLastPush();
}

function tickRows(h: TestHarness) {
  return (h.db.store.get("flow_scratch") ?? []).filter((r) => r.key === "conditions_tick");
}

function acceptedItems(h: TestHarness) {
  return tickRows(h)
    .filter((r) => r.accepted === 1)
    .map((r) => String(r.value))
    .sort();
}

describe("buildConditions3Checkbox — tick UI", () => {
  it("renders one unticked toggle per condition by default", () => {
    const json = JSON.stringify(buildConditions3Checkbox());
    for (const n of [1, 2, 3]) {
      expect(json).toContain(`conditions_tick_${n}`);
    }
    expect(json).toContain("☐");
    expect(json).not.toContain("☑");
  });

  it("marks ticked items with ☑", () => {
    const json = JSON.stringify(buildConditions3Checkbox(["1", "3"]));
    expect(json).toContain("☑ ข้อ 1");
    expect(json).toContain("☐ ข้อ 2");
    expect(json).toContain("☑ ข้อ 3");
  });

  it("keeps the artifact shell (hero/title + อ่านข้อความเต็ม · ยอมรับทั้ง 3 ข้อ)", () => {
    const json = JSON.stringify(buildConditions3Checkbox(["2"]));
    expect(json).toContain("เงื่อนไขการเข้าร่วมโครงการ");
    expect(json).toContain("ต้องติ๊กครบทุกข้อจึงจะไปต่อได้");
    expect(json).toContain("อ่านข้อความเต็ม");
    expect(json).toContain("ยอมรับทั้ง 3 ข้อ");
    expect(json).toContain("conditions_accept");
  });
});

describe("handleConditions — tick + gate", () => {
  let h: TestHarness;

  beforeEach(async () => {
    h = await createTestHarness({ initialState: "conditions" });
  });

  it("toggling a tick persists it and re-renders the card without advancing", async () => {
    const push = await runInput(h, "conditions", "conditions_tick_1");
    expect(acceptedItems(h)).toEqual(["1"]);
    const json = JSON.stringify(push?.messages ?? []);
    expect(json).toContain("conditions_tick_");
    expect(json).toContain("☑ ข้อ 1");
  });

  it("re-ticking unticks (append-only accepted=0)", async () => {
    await runInput(h, "conditions", "conditions_tick_1");
    await runInput(h, "conditions", "conditions_tick_1");
    expect(acceptedItems(h)).toEqual([]);
    const rows = tickRows(h);
    expect(rows.length).toBe(1); // the live row flipped to 0 — audit kept
    expect(rows[0]?.accepted).toBe(0);
  });

  it("REFUSES accept until all 3 ticks are on (typed ยอมรับ)", async () => {
    await runInput(h, "conditions", "conditions_tick_1");
    const push = await runInput(h, "conditions", "ยอมรับ");
    const json = JSON.stringify(push?.messages ?? []);
    expect(json).toContain("1/3");
    // still in conditions — re-rendered card present
    expect(json).toContain("conditions_accept");
  });

  it("REFUSES accept until all 3 ticks are on (postback conditions_accept)", async () => {
    await runInput(h, "conditions", "conditions_tick_1");
    await runInput(h, "conditions", "conditions_tick_2");
    const push = await runInput(h, "conditions", "conditions_accept");
    const json = JSON.stringify(push?.messages ?? []);
    expect(json).toContain("2/3");
  });

  it("advances to registration once all 3 are ticked", async () => {
    for (const n of [1, 2, 3]) {
      await runInput(h, "conditions", `conditions_tick_${n}`);
    }
    const push = await runInput(h, "conditions", "conditions_accept");
    expect(acceptedItems(h)).toEqual(["1", "2", "3"]);
    const json = JSON.stringify(push?.messages ?? []);
    expect(json).toContain("liff/register");
  });

  it("unknown text re-shows the card with current tick state", async () => {
    await runInput(h, "conditions", "conditions_tick_3");
    const push = await runInput(h, "conditions", "อะไรนะ");
    const json = JSON.stringify(push?.messages ?? []);
    expect(json).toContain("☑ ข้อ 3");
    expect(json).toContain("☐ ข้อ 1");
  });
});
