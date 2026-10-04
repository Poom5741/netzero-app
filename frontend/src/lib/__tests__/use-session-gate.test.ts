import { describe, it, expect } from "vitest";
import { sessionCheck } from "../use-session-gate";

// F3 regression 2026-10-05: sponsor and admin session cookies live on
// different hosts (sponsor login is cross-origin to the backend origin per
// the F2 contract; admin login is same-origin through the proxy). The gate
// check must match each role's cookie host or the portal bounce-loops.

describe("sessionCheck origin routing", () => {
  it("sends the sponsor check cross-origin to the backend /session route", () => {
    const { url, credentials } = sessionCheck("sponsor");
    expect(url).toBe(
      "https://netzero-carbon-poc.poom-a1d.workers.dev/session",
    );
    expect(credentials).toBe("include");
  });

  it("keeps the admin check same-origin on the proxy path", () => {
    const { url, credentials } = sessionCheck("admin");
    expect(url).toBe("/api/auth/session");
    expect(credentials).toBe("same-origin");
  });
});
