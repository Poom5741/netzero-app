import { afterEach, describe, expect, it } from "vitest";

/**
 * Rich menu registration client (slice 2 of 013-farmer-chat-design-parity).
 *
 * `buildRichMenu()` already produces a correct artifact-matching config, but nothing
 * ever sends it to LINE. These tests pin the requests that make the menu reachable.
 *
 * `fetch` is stubbed by direct assignment: bun's `vi` shim has no `stubGlobal`.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildRichMenu } from "../../src/line/rich-menu";
import {
  createRichMenu,
  setDefaultRichMenu,
  uploadRichMenuImage,
} from "../../src/line/rich-menu-client";

const realFetch = globalThis.fetch;

interface Captured {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

function captureFetch(response: { status: number; statusText: string; body: string }) {
  const calls: Captured[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({
      url: String(url),
      method: String(init.method),
      headers: (init.headers ?? {}) as Record<string, string>,
      body: String(init.body ?? ""),
    });
    return {
      status: response.status,
      statusText: response.statusText,
      text: async () => response.body,
    } as unknown as Response;
  }) as unknown as typeof fetch;
  return calls;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("createRichMenu", () => {
  it("POSTs the config to the LINE rich menu endpoint", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: '{"richMenuId":"rm-1"}' });
    const menu = buildRichMenu();

    const res = await createRichMenu("token-abc", menu);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.line.me/v2/bot/richmenu");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].headers.Authorization).toBe("Bearer token-abc");
    expect(calls[0].headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(calls[0].body)).toEqual(menu);
    expect(res.status).toBe(200);
  });

  it("sends a body carrying the artifact 3x2 layout", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: "{}" });
    await createRichMenu("t", buildRichMenu());

    const sent = JSON.parse(calls[0].body);
    expect(sent.type).toBe("rich");
    expect(sent.size).toEqual({ width: 2500, height: 843 });
    expect(sent.areas).toHaveLength(6);
  });

  it("never echoes the access token in the returned body", async () => {
    captureFetch({ status: 200, statusText: "OK", body: '{"richMenuId":"rm-1"}' });
    const res = await createRichMenu("super-secret-token", buildRichMenu());
    expect(JSON.stringify(res)).not.toContain("super-secret-token");
  });
});

describe("setDefaultRichMenu", () => {
  it("POSTs the menu id to the default-richmenu endpoint", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: "{}" });

    const res = await setDefaultRichMenu("token-abc", "rm-1");

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.line.me/v2/bot/user/all/richmenu/rm-1");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].headers.Authorization).toBe("Bearer token-abc");
    expect(res.status).toBe(200);
  });

  it("url-encodes the rich menu id", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: "{}" });
    await setDefaultRichMenu("t", "rm/../evil");
    expect(calls[0].url).toBe("https://api.line.me/v2/bot/user/all/richmenu/rm%2F..%2Fevil");
  });
});

describe("uploadRichMenuImage", () => {
  it("POSTs raw PNG bytes to the api-data content endpoint (binary host, not api.line.me)", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: "{}" });
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer;

    const res = await uploadRichMenuImage("token-abc", "rm-1", png);

    expect(calls).toHaveLength(1);
    // LINE serves rich menu image content on the api-data host — uploading to
    // api.line.me 404s (found live 2026-10-05, T-208 first apply attempt).
    expect(calls[0].url).toBe("https://api-data.line.me/v2/bot/richmenu/rm-1/content");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].headers["Content-Type"]).toBe("image/png");
    expect(calls[0].headers.Authorization).toBe("Bearer token-abc");
    expect(res.status).toBe(200);
  });

  it("does not JSON-encode the image", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: "{}" });
    await uploadRichMenuImage("t", "rm-1", new Uint8Array([1, 2, 3]).buffer);
    // A stringified payload would be a quoted/base64 string, not the raw bytes.
    expect(calls[0].body).toBe(String(new Uint8Array([1, 2, 3]).buffer));
  });

  it("url-encodes the rich menu id", async () => {
    const calls = captureFetch({ status: 200, statusText: "OK", body: "{}" });
    await uploadRichMenuImage("t", "rm/../evil", new Uint8Array([0]).buffer);
    expect(calls[0].url).toBe("https://api-data.line.me/v2/bot/richmenu/rm%2F..%2Fevil/content");
  });
});

describe("rich menu image asset", () => {
  const asset = join(process.cwd(), "assets", "richmenu", "richmenu-2500x843.png");

  it("exists", () => {
    expect(existsSync(asset)).toBe(true);
  });

  it("is exactly 2500x843, the only size LINE accepts", () => {
    const buf = readFileSync(asset);
    expect(buf.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(buf.readUInt32BE(16)).toBe(2500);
    expect(buf.readUInt32BE(20)).toBe(843);
  });

  it("matches the size declared in buildRichMenu()", () => {
    expect(buildRichMenu().size).toEqual({ width: 2500, height: 843 });
  });

  it("is under LINE's 1 MB upload limit (found live 2026-10-05: 1.63MB asset 413/404s)", () => {
    expect(readFileSync(asset).length).toBeLessThan(1_000_000);
  });
});
