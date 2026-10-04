/**
 * Register the artifact-matching rich menu against the live LINE channel (T-208).
 *
 * Usage:
 *   bun scripts/register-rich-menu.ts --check   # read-only: channel info + current default menu
 *   bun scripts/register-rich-menu.ts --apply   # create menu → upload image → set default
 *
 * Token source: LINE_CHANNEL_ACCESS_TOKEN env var, or LINE_CHANNEL_ACCESS_TOKEN=... in .dev.vars.
 * Never prints the token. --apply mutates the live channel; run --check first.
 */

import { readFileSync } from "node:fs";
import { createRichMenu, setDefaultRichMenu, uploadRichMenuImage } from "../src/line/rich-menu-client";

function loadToken(): string {
  if (process.env.LINE_CHANNEL_ACCESS_TOKEN) return process.env.LINE_CHANNEL_ACCESS_TOKEN;
  try {
    const vars = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
    const line = vars
      .split("\n")
      .find((l) => l.trim().startsWith("LINE_CHANNEL_ACCESS_TOKEN="));
    const value = line?.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  } catch {
    // .dev.vars absent — fall through to error
  }
  console.error("No LINE_CHANNEL_ACCESS_TOKEN in env or .dev.vars — refusing to proceed.");
  process.exit(1);
}

const token = loadToken();
const API_BASE = "https://api.line.me/v2/bot";
const mode = process.argv[2] ?? "--check";

async function get(path: string): Promise<{ status: number; body: string }> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, body: await res.text() };
}

if (mode === "--check") {
  const info = await get("/info");
  console.log(`channel info: status=${info.status} ${info.body.substring(0, 200)}`);
  const current = await get("/user/all/richmenu");
  console.log(`current default rich menu: status=${current.status} ${current.body.substring(0, 200)}`);
  process.exit(0);
}

if (mode === "--apply") {
  const created = await createRichMenu(token);
  if (created.status !== 200) {
    console.error(`createRichMenu failed: ${created.status} ${created.body}`);
    process.exit(1);
  }
  const richMenuId = (JSON.parse(created.body) as { richMenuId: string }).richMenuId;
  console.log(`created richMenuId=${richMenuId}`);

  const image = readFileSync(new URL("../assets/richmenu/richmenu-2500x843.png", import.meta.url));
  const uploaded = await uploadRichMenuImage(token, richMenuId, image.buffer as ArrayBuffer);
  if (uploaded.status !== 200) {
    console.error(`uploadRichMenuImage failed: ${uploaded.status} ${uploaded.body}`);
    process.exit(1);
  }
  console.log("image uploaded");

  const applied = await setDefaultRichMenu(token, richMenuId);
  if (applied.status !== 200) {
    console.error(`setDefaultRichMenu failed: ${applied.status} ${applied.body}`);
    process.exit(1);
  }
  console.log(`default rich menu set to ${richMenuId} — T-208 complete`);
  process.exit(0);
}

console.error("Unknown mode — use --check or --apply");
process.exit(1);
