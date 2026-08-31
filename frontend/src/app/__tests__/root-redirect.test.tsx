import { describe, it, expect } from "vitest";

describe("Root page redirect", () => {
  it("redirects to /chat", async () => {
    const { redirect } = await import("next/navigation");
    const Home = (await import("../page")).default;

    // The component calls redirect("/chat") which throws NEXT_REDIRECT
    try {
      Home();
      expect.unreachable("Should have thrown redirect");
    } catch (err: any) {
      // Next.js redirect throws a special error
      expect(err.digest || err.message).toMatch(/\/chat|NEXT_REDIRECT/i);
    }
  });
});
