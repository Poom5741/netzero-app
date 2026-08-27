/**
 * Issue #107 — Season approve route plumbing
 * Verifies the POST /api/season/approve endpoint exists and validates input.
 * The actual gate logic is tested in approve-season-typed-gate.test.ts.
 */
import { describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/integration";

describe("POST /api/season/approve — route plumbing", () => {
  it("returns 400 when body is empty", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/season/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ success: boolean }>();
    expect(body.success).toBe(false);
  });

  it("returns 400 when plot_id is missing", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/season/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season_id: "2026-01" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when season_id is missing", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/season/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plot_id: "plot-1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns error when season not found", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/season/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plot_id: "nonexistent", season_id: "nonexistent" }),
    });
    // The mock DB won't find the season, so approveSeason returns { success: false, error: "season not found" }
    expect(res.status).toBe(400);
    const body = await res.json<{ success: boolean; error: string }>();
    expect(body.success).toBe(false);
  });
});
