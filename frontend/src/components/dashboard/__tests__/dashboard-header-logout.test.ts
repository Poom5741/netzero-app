import { describe, it, expect } from "vitest";
import { logoutTarget } from "../dashboard-header";

// D-1 regression 2026-10-05 (Rakazo staging e2e r1): the sponsor session
// cookie lives on the backend host (cross-origin login per the F2 contract),
// so logout must call the backend /sponsor/logout cross-origin with
// credentials:include. Admin's cookie lives on the frontend host — the
// same-origin proxy path stays.

describe("logoutTarget host routing", () => {
  it("sends the sponsor logout cross-origin to the backend /sponsor/logout route", () => {
    const { url, credentials } = logoutTarget("sponsor");
    expect(url).toBe(
      "https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor/logout",
    );
    expect(credentials).toBe("include");
  });

  it("keeps the admin logout same-origin on the proxy path", () => {
    const { url, credentials } = logoutTarget("admin");
    expect(url).toBe("/api/auth/logout");
    expect(credentials).toBe("same-origin");
  });
});
