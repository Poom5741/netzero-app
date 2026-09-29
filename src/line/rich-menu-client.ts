/**
 * LINE Rich Menu API client.
 *
 * `rich-menu.ts` builds a correct, artifact-matching rich menu configuration, but
 * building it is not enough: the menu only reaches farmers once it is created through
 * the Messaging API and attached as the default. This module provides that transport,
 * mirroring `reply.ts`.
 *
 * Not wired into the webhook. A rich menu needs a 2500x843 image uploaded to
 * `POST /v2/bot/richmenu/{id}/content`, and no such asset exists in the repo; LINE
 * rejects a menu without content, so calling this on a live `follow` event would break
 * the welcome flow. Wire it only once the asset is in place.
 */

import { buildRichMenu, type RichMenuConfig } from "./rich-menu";

type LineResponse = { status: number; statusText: string; body: string };

const API_BASE = "https://api.line.me/v2/bot";

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
