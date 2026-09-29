import { afterEach, describe, expect, it } from "vitest";

/**
 * Rich menu registration client (slice 2 of 013-farmer-chat-design-parity).
 *
 * `buildRichMenu()` already produces a correct artifact-matching config, but nothing
 * ever sends it to LINE. These tests pin the requests that make the menu reachable.
 *
 * `fetch` is stubbed by direct assignment: bun's `vi` shim has no `stubGlobal`.
 */

import { buildRichMenu } from "../../src/line/rich-menu";
import { createRichMenu, setDefaultRichMenu } from "../../src/line/rich-menu-client";

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
