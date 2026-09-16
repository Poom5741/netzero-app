/**
 * Test harness for state-machine tests.
 *
 * Combines MockDB + fake LINE transport + fixture loader to test handleFlow().
 * Each test creates a fresh MockDB instance for isolation.
 */

import { type ConversationState, type FlowContext, handleFlow } from "../../src/line/flow";
import { loadFixture, type WebhookFixture } from "./fixtures";
import { createMockDB, type MockDB, seedFarmer, seedLineLink, seedPlot } from "./integration";
import { FakeLineTransport } from "./line-transport";

export interface TestHarness {
  db: MockDB;
  transport: FakeLineTransport;
  farmerId: string;
  linkId: string;
  userId: string;
}

/**
 * Create a fresh test harness with seeded data.
 */
export async function createTestHarness(overrides?: {
  farmerId?: string;
  linkId?: string;
  userId?: string;
  initialState?: ConversationState;
}): Promise<TestHarness> {
  const db = createMockDB();
  const transport = new FakeLineTransport();

  const farmerId = overrides?.farmerId ?? "farmer-test-001";
  const linkId = overrides?.linkId ?? "line-test-001";
  const userId = overrides?.userId ?? "U-test-user-001";
  const initialState = overrides?.initialState ?? "welcome";

  // Seed test data
  await seedFarmer(db, { id: farmerId, phone: "0812345678" });
  const plot = await seedPlot(db, farmerId);
  await seedLineLink(db, farmerId, {
    id: linkId,
    line_user_id: userId,
    conversation_state: initialState,
    selected_plot_id: plot.id,
  });

  return { db, transport, farmerId, linkId, userId };
}

/**
 * Run a fixture through the state machine and return the result.
 */
export async function runFixture(
  harness: TestHarness,
  fixture: WebhookFixture,
): Promise<{
  newState: ConversationState;
  pushedMessages: Array<{
    type: string;
    text?: string;
    contents?: unknown;
  }>;
}> {
  const ctx: FlowContext = {
    db: harness.db,
    token: process.env.LINE_ACCESS_TOKEN ?? "test-token",
    apiKey: process.env.OPENROUTER_API_KEY ?? "test-api-key",
    userId: harness.userId,
    linkId: harness.linkId,
    farmerId: harness.farmerId,
    state: fixture.initialState as ConversationState,
    selectedPlotId: null,
    text: fixture.event.message?.text ?? fixture.event.postback?.data ?? "",
    pushFn: harness.transport.push.bind(harness.transport),
  };

  await handleFlow(ctx);

  // Read the new state from DB
  const link = await harness.db
    .prepare("SELECT conversation_state FROM line_links WHERE id = ?")
    .bind(harness.linkId)
    .first<{ conversation_state: string }>();

  return {
    newState: (link?.conversation_state ?? fixture.expectedState) as ConversationState,
    pushedMessages: harness.transport.getLastPush()?.messages ?? [],
  };
}

/**
 * Load and run a fixture by ID.
 */
export async function runFixtureById(
  harness: TestHarness,
  fixtureId: string,
): Promise<ReturnType<typeof runFixture>> {
  const fixture = loadFixture(fixtureId);
  return runFixture(harness, fixture);
}
