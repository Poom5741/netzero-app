import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getReviewQueue, reviewPhoto } from "../api";

describe("getReviewQueue", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("builds correct URL without status filter", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await getReviewQueue();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/review"),
    );
    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).not.toContain("status=");
  });

  it("builds correct URL with status filter", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await getReviewQueue("flagged");

    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(url).toContain("status=flagged");
  });

  it("parses JSON response", async () => {
    const mockData = [
      { id: "p1", plot_id: "F1", ai_status: "pass", admin_status: "pending", photo_url: "/img.jpg" },
    ];
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await getReviewQueue();
    expect(result).toEqual(mockData);
  });

  it("throws on non-ok status", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(getReviewQueue()).rejects.toThrow("Review queue error: 500");
  });
});

describe("reviewPhoto", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("builds POST with correct body", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await reviewPhoto("photo-1", "verified", "Looks good");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/review/photo-1"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified", reason: "Looks good" }),
      }),
    );
  });

  it("parses response JSON", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const result = await reviewPhoto("photo-1", "verified");
    expect(result).toEqual({ ok: true });
  });

  it("throws on non-ok status", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    await expect(reviewPhoto("photo-1", "rejected", "Bad")).rejects.toThrow("Review error: 403");
  });
});
