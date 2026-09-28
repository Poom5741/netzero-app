#!/usr/bin/env node
/**
 * Fake LINE Gateway — signs a LINE webhook event and POSTs it to the
 * Worker. Lets us drive the production conversation flow without a real
 * LINE device. The bot's reply goes through pushMessage() to LINE; we
 * observe D1 side effects (line_links.conversation_state, application_documents, etc.).
 *
 * Usage:
 *   node scripts/simulate-line.mjs "U-test-happy-001" "ลงทะเบียน"
 *   node scripts/simulate-line.mjs "U-test-edge-001" "อัปโหลด"
 *
 * Env (read from .dev.vars in repo root):
 *   LINE_CHANNEL_SECRET — must match the deployed Worker's secret
 *
 * Flags:
 *   --reply-token <token>   override the auto-generated replyToken
 *   --source-user <id>      alias for the first positional arg
 *   --text <text>           alias for the second positional arg
 *   --endpoint <url>        override webhook URL (default https://netzero-carbon-poc.poom-a1d.workers.dev/webhook/line)
 *   --dry                   print the signed body without sending
 */

import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { resolve } from "node:path";

const args = process.argv.slice(2);
let sourceUser = null;
let text = null;
let postbackData = null;
let endpoint = "https://netzero-carbon-poc.poom-a1d.workers.dev/webhook/line";
let replyToken = null;
let dry = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--reply-token") replyToken = args[++i];
  else if (a === "--source-user") sourceUser = args[++i];
  else if (a === "--text") text = args[++i];
  else if (a === "--postback") postbackData = args[++i];
  else if (a === "--endpoint") endpoint = args[++i];
  else if (a === "--dry") dry = true;
  else if (!sourceUser) sourceUser = a;
  else if (!text && !postbackData) text = a;
}

if (!sourceUser || (!text && !postbackData)) {
  console.error(
    "usage: simulate-line.mjs <source-user-id> <text> [--postback DATA] [--endpoint URL]",
  );
  process.exit(2);
}

// Load channel secret from .dev.vars (LOCAL ONLY — must match deployed secret)
const devVarsPath = resolve(process.cwd(), ".dev.vars");
const secret = readFileSync(devVarsPath, "utf8")
  .split("\n")
  .find((line) => line.startsWith("LINE_CHANNEL_SECRET="))
  ?.split("=")[1]
  ?.trim();

if (!secret) {
  console.error("LINE_CHANNEL_SECRET not found in .dev.vars");
  process.exit(2);
}

replyToken = replyToken ?? `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const event = postbackData
  ? {
      destination: "U-bot-destination",
      events: [
        {
          replyToken,
          type: "postback",
          timestamp: Date.now(),
          source: { type: "user", userId: sourceUser },
          postback: { data: postbackData },
        },
      ],
    }
  : {
      destination: "U-bot-destination",
      events: [
        {
          replyToken,
          type: "message",
          timestamp: Date.now(),
          source: { type: "user", userId: sourceUser },
          message: { id: `m-${Date.now()}`, type: "text", text },
        },
      ],
    };

const body = JSON.stringify(event);
const signature = createHmac("sha256", secret).update(body).digest("base64");

if (dry) {
  console.log("--- DRY ---");
  console.log("endpoint:", endpoint);
  console.log("signature:", signature);
  console.log("body:", body);
  process.exit(0);
}

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Line-Signature": signature,
  },
  body,
});

console.log("status:", res.status);
const responseBody = await res.text();
console.log("body:", responseBody.slice(0, 200));
console.log("---");
console.log("source:", sourceUser, "text:", text, "replyToken used:", replyToken);
