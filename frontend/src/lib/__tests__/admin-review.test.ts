import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getReviewQueue, reviewPhoto } from "../api";

// apiRequest uses XMLHttpRequest (browser client traffic is XHR-based) and
// constructs its instance with no args, so the fake records calls in shared
// state and replays a scripted response set by stubXhr().
const recorded = {
  open: [] as unknown[][],
  headers: [] as unknown[][],
  sendBody: undefined as unknown,
};

let script = { status: 200, responseText: "[]" };

class FakeXhr {
  status = 0;
  responseText = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  open(...args: unknown[]) {
    recorded.open.push(args);
  }

  setRequestHeader(...args: unknown[]) {
    recorded.headers.push(args);
  }

  send(body?: unknown) {
    recorded.sendBody = body;
    this.status = script.status;
    this.responseText = script.responseText;
    this.onload?.();
  }
}

function stubXhr(status: number, responseText: string) {
  script = { status, responseText };
  recorded.open = [];
  recorded.headers = [];
  recorded.sendBody = undefined;
  vi.stubGlobal("XMLHttpRequest", FakeXhr);
}

function lastUrl(): string {
  return recorded.open[recorded.open.length - 1][1] as string;
}

describe("getReviewQueue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    stubXhr(200, "[]");
  });

  it("builds correct URL without status filter", async () => {
    await getReviewQueue();

    const url = lastUrl();
    expect(url).toContain("/api/admin/review");
    expect(url).not.toContain("status=");
  });

  it("builds correct URL with status filter", async () => {
    await getReviewQueue("flagged");

    expect(lastUrl()).toContain("status=flagged");
  });

  it("parses JSON response", async () => {
    const mockData = [
      { id: "p1", plot_id: "F1", ai_status: "pass", admin_status: "pending", photo_url: "/img.jpg" },
    ];
    stubXhr(200, JSON.stringify(mockData));

    const result = await getReviewQueue();
    expect(result).toEqual(mockData);
  });

  it("throws on non-ok status", async () => {
    stubXhr(500, "");

    await expect(getReviewQueue()).rejects.toThrow("Review queue error: 500");
  });
});

describe("reviewPhoto", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    stubXhr(200, JSON.stringify({ ok: true }));
  });

  it("builds POST with correct body", async () => {
    await reviewPhoto("photo-1", "verified", "Looks good");

    expect(lastUrl()).toContain("/api/admin/review/photo-1");
    expect(recorded.headers[0]).toEqual(["Content-Type", "application/json"]);
    expect(recorded.sendBody).toBe(JSON.stringify({ status: "verified", reason: "Looks good" }));
  });

  it("parses response JSON", async () => {
    const result = await reviewPhoto("photo-1", "verified");
    expect(result).toEqual({ ok: true });
  });

  it("throws on non-ok status", async () => {
    stubXhr(403, "");

    await expect(reviewPhoto("photo-1", "rejected", "Bad")).rejects.toThrow("Review error: 403");
  });
});
