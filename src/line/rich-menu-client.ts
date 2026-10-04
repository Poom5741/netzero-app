/**
 * LINE Rich Menu API client.
 *
 * `rich-menu.ts` builds a correct, artifact-matching rich menu configuration, but
 * building it is not enough: the menu only reaches farmers once it is created through
 * the Messaging API, given its image, and attached as the default. This module
 * provides that transport, mirroring `reply.ts`.
 *
 * Still not wired into the webhook. `uploadRichMenuImage` needs the PNG fetched from
 * R2 or bundled as an asset, and doing it on a live `follow` event would put a network
 * round trip in the welcome path. Wire it behind a deliberate call site.
 */

import { buildRichMenu, type RichMenuConfig } from "./rich-menu";

type LineResponse = { status: number; statusText: string; body: string };

const API_BASE = "https://api.line.me/v2/bot";
// LINE serves binary content (image upload/download) on a separate host —
// posting to api.line.me 404s. Found live 2026-10-05 during T-208 apply.
const API_DATA_BASE = "https://api-data.line.me/v2/bot";

async function post(accessToken: string, path: string, body?: unknown): Promise<LineResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`LINE ${path}: status=${res.status} body=${text.substring(0, 200)}`);
  return { status: res.status, statusText: res.statusText, body: text };
}

/**
 * Create a rich menu and return LINE's response, whose body contains `richMenuId`.
 */
export function createRichMenu(
  accessToken: string,
  menu: RichMenuConfig = buildRichMenu(),
): Promise<LineResponse> {
  return post(accessToken, "/richmenu", menu);
}

/** Attach a rich menu as the default menu for every user who has not set their own. */
export function setDefaultRichMenu(accessToken: string, richMenuId: string): Promise<LineResponse> {
  return post(accessToken, `/user/all/richmenu/${encodeURIComponent(richMenuId)}`);
}

/**
 * Upload the 2500x843 PNG that LINE renders behind the menu. Without this the menu
 * is blank, so it must succeed before `setDefaultRichMenu`.
 *
 * @param image - Raw PNG bytes, 2500x843.
 */
export async function uploadRichMenuImage(
  accessToken: string,
  richMenuId: string,
  image: ArrayBuffer,
): Promise<LineResponse> {
  const res = await fetch(`${API_DATA_BASE}/richmenu/${encodeURIComponent(richMenuId)}/content`, {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      Authorization: `Bearer ${accessToken}`,
    },
    body: image,
  });

  const text = await res.text();
  console.log(`LINE richmenu content: status=${res.status} body=${text.substring(0, 200)}`);
  return { status: res.status, statusText: res.statusText, body: text };
}
