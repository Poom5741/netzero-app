#!/usr/bin/env node
/**
 * Deploy LINE Rich Menu to the channel.
 *
 * Reads LINE_CHANNEL_ACCESS_TOKEN from .dev.vars (or env).
 * Calls LINE Messaging API to:
 *   1. Create the rich menu
 *   2. Set it as the default menu for all users
 *
 * Usage:
 *   node scripts/deploy-rich-menu.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load token from .dev.vars
const devVarsPath = resolve(process.cwd(), ".dev.vars");
const token = readFileSync(devVarsPath, "utf8")
  .split("\n")
  .find((line) => line.startsWith("LINE_CHANNEL_ACCESS_TOKEN="))
  ?.split("=")[1]
  ?.trim();

if (!token) {
  console.error("LINE_CHANNEL_ACCESS_TOKEN not found in .dev.vars");
  process.exit(1);
}

const LINE_API = "https://api.line.me/v2/bot";

// Rich menu definition (3 cols x 2 rows, 2500x1686)
const richMenu = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "NetZeroCarbon Post-Activation Menu",
  chatBarText: "เมนู",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: "postback", label: "กรอกข้อมูลย้อนหลัง", data: "action=BL_HOME" },
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: { type: "postback", label: "บันทึกงานในแปลง", data: "action=SEASON_HOME" },
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: { type: "postback", label: "งานที่ต้องทำ", data: "action=TODO" },
    },
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: { type: "postback", label: "แปลงของฉัน", data: "action=FIELD_LIST" },
    },
    {
      bounds: { x: 833, y: 843, width: 834, height: 843 },
      action: { type: "postback", label: "สรุปผลของฉัน", data: "action=SUMMARY" },
    },
    {
      bounds: { x: 1667, y: 843, width: 833, height: 843 },
      action: { type: "postback", label: "ติดต่อเจ้าหน้าที่", data: "action=CONTACT" },
    },
  ],
};

async function deploy() {
  console.log("Creating rich menu...");
  const createRes = await fetch(`${LINE_API}/richmenu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(richMenu),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error(`Create failed: ${createRes.status} ${text}`);
    process.exit(1);
  }

  const { richMenuId } = await createRes.json();
  console.log(`Created rich menu: ${richMenuId}`);

  console.log("Setting as default menu...");
  const setRes = await fetch(`${LINE_API}/user/all/richmenu/${richMenuId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!setRes.ok) {
    const text = await setRes.text();
    console.error(`Set default failed: ${setRes.status} ${text}`);
    process.exit(1);
  }

  console.log("✅ Rich menu deployed and set as default for all users.");
  console.log("Note: Users may need to restart LINE app to see the new menu.");
}

deploy().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
