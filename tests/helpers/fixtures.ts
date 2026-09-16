/**
 * Webhook fixture loader — loads JSON fixtures from tests/fixtures/line-events/.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface WebhookFixture {
  id: string;
  description: string;
  initialState: string;
  event: {
    type: "message" | "postback" | "follow" | "unfollow";
    source: { type: "user"; userId: string };
    message?: { type: "text"; text: string; id?: string };
    postback?: { data: string; params?: Record<string, string> };
    timestamp: number;
  };
  signature: string;
  expectedState: string;
  expectedReply: {
    type: "text" | "flex" | "sticker" | "image";
    text?: string;
    contents?: unknown;
    quickReply?: unknown;
  };
  databaseChanges?: Array<{
    table: string;
    operation: "insert" | "update" | "delete";
    where?: Record<string, unknown>;
    values?: Record<string, unknown>;
  }>;
}

const FIXTURES_DIR = join(process.cwd(), "tests", "fixtures", "line-events");

/**
 * Load a single fixture by ID.
 */
export function loadFixture(id: string): WebhookFixture {
  const filePath = join(FIXTURES_DIR, `${id}.json`);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as WebhookFixture;
}

/**
 * Load all fixtures from the directory.
 */
export function loadAllFixtures(): WebhookFixture[] {
  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = readFileSync(join(FIXTURES_DIR, f), "utf-8");
    return JSON.parse(raw) as WebhookFixture;
  });
}

/**
 * Load fixtures filtered by initial state.
 */
export function loadFixturesByState(initialState: string): WebhookFixture[] {
  return loadAllFixtures().filter((f) => f.initialState === initialState);
}
