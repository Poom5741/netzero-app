/**
 * Conversation Simulator — runs multi-turn LINE conversation scenarios.
 *
 * Chains state machine turns, pre-seeds data between steps, and asserts on
 * state transitions and reply content.
 */

import { type ConversationState, type FlowContext, handleFlow } from "../../src/line/flow";
import { createTestHarness, type TestHarness } from "./test-harness";

export type ConversationStep = {
  user_sends: string;
  expect_state: ConversationState;
  expect_reply_contains?: string;
  pre_seed?: Array<{ table: string; row: Record<string, unknown> }>;
};

export type ConversationScenario = {
  name: string;
  description?: string;
  setup?: {
    farmer?: Record<string, unknown>;
    initialState?: ConversationState;
  };
  steps: ConversationStep[];
  aiMock?: (
    apiKey: string,
    userMessage: string,
    context: {
      farmerName?: string;
      plotCode?: string;
      seasonId?: string;
      linkedFarmer?: boolean;
    },
  ) => Promise<{
    type: "reply" | "draft";
    text: string;
    category?: string;
    data?: Record<string, unknown>;
  }>;
};

export type ConversationResult = {
  name: string;
  steps: number;
  finalState: ConversationState;
  harness: TestHarness;
};

const SAFE_TABLES = new Set(["application_documents"]);

function resolvePlaceholders(value: unknown, farmerId: string): unknown {
  if (typeof value === "string") return value.replaceAll("{farmer_id}", farmerId);
  if (Array.isArray(value)) return value.map((item) => resolvePlaceholders(item, farmerId));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolvePlaceholders(item, farmerId)]),
    );
  }
  return value;
}

async function seedRows(harness: TestHarness, rows: ConversationStep["pre_seed"]): Promise<void> {
  for (const item of rows ?? []) {
    if (!SAFE_TABLES.has(item.table)) throw new Error(`Unsupported scenario table: ${item.table}`);
    const columns = Object.keys(item.row);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((column) => item.row[column]);
    await harness.db
      .prepare(`INSERT INTO ${item.table} (${columns.join(", ")}) VALUES (${placeholders})`)
      .bind(...values)
      .run();
  }
}

function extractTextFromFlex(node: any): string {
  const texts: string[] = [];
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) texts.push(node.text);
  if (node.contents) {
    if (Array.isArray(node.contents)) {
      for (const child of node.contents) {
        texts.push(extractTextFromFlex(child));
      }
    } else {
      texts.push(extractTextFromFlex(node.contents));
    }
  }
  if (node.body) texts.push(extractTextFromFlex(node.body));
  if (node.header) texts.push(extractTextFromFlex(node.header));
  if (node.footer) texts.push(extractTextFromFlex(node.footer));
  return texts.filter(Boolean).join(" ");
}

function replyText(messages: Array<{ type: string; text?: string; contents?: any }>): string {
  const texts: string[] = [];
  for (const message of messages) {
    if (message.type === "text" && message.text) {
      texts.push(message.text);
    } else if (message.type === "flex" && message.contents) {
      texts.push(extractTextFromFlex(message.contents));
    }
  }
  return texts.join("\n");
}

export async function runConversationScenario(
  scenario: ConversationScenario,
): Promise<ConversationResult> {
  const harness = await createTestHarness({
    initialState: scenario.setup?.initialState ?? "welcome",
  });
  let state = scenario.setup?.initialState ?? "welcome";

  for (const step of scenario.steps) {
    await seedRows(
      harness,
      resolvePlaceholders(step.pre_seed, harness.farmerId) as ConversationStep["pre_seed"],
    );
    harness.transport.reset();

    const link = await harness.db
      .prepare("SELECT selected_plot_id FROM line_links WHERE id = ?")
      .bind(harness.linkId)
      .first<{ selected_plot_id: string | null }>();

    const ctx: FlowContext = {
      db: harness.db,
      token: process.env.LINE_ACCESS_TOKEN ?? "test-token",
      apiKey: process.env.OPENROUTER_API_KEY ?? "test-api-key",
      userId: harness.userId,
      linkId: harness.linkId,
      farmerId: harness.farmerId,
      state,
      selectedPlotId: link?.selected_plot_id ?? null,
      text: step.user_sends,
      liffId: process.env.LIFF_ID ?? "test-liff-id",
      appUrl: process.env.APP_URL ?? "https://test.example.com",
      pushFn: harness.transport.push.bind(harness.transport),
      aiFn: scenario.aiMock,
    };

    await handleFlow(ctx);
    const updated = await harness.db
      .prepare("SELECT conversation_state FROM line_links WHERE id = ?")
      .bind(harness.linkId)
      .first<{ conversation_state: ConversationState }>();
    state = updated?.conversation_state ?? state;

    if (state !== step.expect_state) {
      throw new Error(`${scenario.name}: expected ${step.expect_state}, got ${state}`);
    }

    if (step.expect_reply_contains) {
      const text = replyText(harness.transport.getLastPush()?.messages ?? []);
      if (!text.includes(step.expect_reply_contains)) {
        throw new Error(
          `${scenario.name}: expected reply to contain ${JSON.stringify(step.expect_reply_contains)}, got ${JSON.stringify(text)}`,
        );
      }
    }
  }

  return { name: scenario.name, steps: scenario.steps.length, finalState: state, harness };
}
