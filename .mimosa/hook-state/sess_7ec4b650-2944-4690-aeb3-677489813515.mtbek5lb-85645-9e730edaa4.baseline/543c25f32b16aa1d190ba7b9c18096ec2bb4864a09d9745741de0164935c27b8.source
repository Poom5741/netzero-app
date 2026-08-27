import { describe, expect, it } from "vitest";
import app from "../../src/index";

describe("Health endpoint", () => {
  it("returns 200 with status ok", async () => {
    const res = await app.request(
      "/health",
      {},
      {
        DB: {} as D1Database,
        R2: {} as R2Bucket,
        ENVIRONMENT: "test",
      },
    );

    expect(res.status).toBe(200);
    const body = await res.json<{ status: string; environment: string; timestamp: string }>();
    expect(body.status).toBe("ok");
    expect(body.environment).toBe("test");
    expect(body.timestamp).toBeDefined();
  });
});

describe("404 handler", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request(
      "/unknown",
      {},
      {
        DB: {} as D1Database,
        R2: {} as R2Bucket,
        ENVIRONMENT: "test",
      },
    );

    expect(res.status).toBe(404);
  });
});
