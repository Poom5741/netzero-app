/**
 * OB-11 duplicate fix (BUG-017-B4).
 *
 * Admin approval already PUSHES the OB-11 activation card (admin.ts) and
 * sets the link to state "activation". When the farmer taps เริ่มใช้งาน on
 * that same card, handleActivation used to send the card AGAIN — the
 * farmer saw it twice (live finding, 07:5x walk). Single-sender rule: the
 * handler moves the flow on (sow-date prompt) without re-sending the card.
 */

import { beforeEach, describe, expect, it } from "bun:test";
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

describe("handleActivation — no duplicate OB-11 card", () => {
  let h: TestHarness;

  beforeEach(async () => {
    h = await createTestHarness({ initialState: "activation" });
  });

  it("เริ่มใช้งาน postback advances to season_setup WITHOUT a second flex card", async () => {
    const push = await runInput(h, "activation", "activation");
    const msgs = push?.messages ?? [];
    expect(msgs.length).toBeGreaterThan(0);
    for (const m of msgs) {
      expect(m.type).toBe("text"); // prompt only — no flex re-send
    }
    expect(JSON.stringify(msgs)).toContain("วันหว่าน");
  });

  it("any text in activation state also advances without the card", async () => {
    const push = await runInput(h, "activation", "hello");
    const msgs = push?.messages ?? [];
    for (const m of msgs) {
      expect(m.type).toBe("text");
    }
    expect(JSON.stringify(msgs)).toContain("วันหว่าน");
  });
});
