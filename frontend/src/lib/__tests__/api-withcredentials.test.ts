import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest } from "../api";

describe("apiRequest withCredentials", () => {
  let openArgs: unknown[];
  let sentWithCredentials: boolean | undefined;

  beforeEach(() => {
    openArgs = [];
    sentWithCredentials = undefined;

    class FakeXhr {
      status = 200;
      responseText = "{}";
      withCredentials = false;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      open(...args: unknown[]) {
        openArgs = args;
      }
      setRequestHeader() {}
      send() {
        sentWithCredentials = this.withCredentials;
        // Simulate async response
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal("XMLHttpRequest", FakeXhr);
  });

  it("sets withCredentials=true on XHR for cookie-based auth", async () => {
    await apiRequest("/me");
    expect(sentWithCredentials).toBe(true);
  });
});
