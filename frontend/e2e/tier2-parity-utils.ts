import type { Page } from "@playwright/test";

// T-601 shared helpers.
//
// R-025 note: the ONLY network interception in this suite is the session
// render-enabler below. lib/use-session-gate.ts redirects to the role
// login page when GET /api/auth/session fails, which on a backend-less
// static export means the dashboard chrome (sidebar rail, drawer,
// toolbars) would never render at all. Fulfilling that single probe with
// authenticated:true is the same pattern the existing dev-server e2e
// specs use; NO API-backed value is ever asserted anywhere in Tier-2.

export async function mockAdminSession(page: Page): Promise<void> {
  await page.route("**/api/auth/session", function (route) {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authenticated: true,
        role: "admin",
        email: "admin@netzerocarbon.com",
      }),
    });
  });
}

export async function mockSponsorSession(page: Page): Promise<void> {
  await page.route("**/api/auth/session", function (route) {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authenticated: true,
        role: "sponsor",
        email: "sponsor@netzerocarbon.com",
      }),
    });
  });
}

// Resolve a design token to its computed rgb() colour IN THE PAGE — the
// browser does the hex-to-rgb conversion, so the suite contains zero raw
// hex literals while still asserting honest computed colours. Non-colour
// values are returned trimmed as-is.
export async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate(function (name) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!raw) throw new Error("token not defined: " + name);
    const probe = document.createElement("span");
    probe.style.color = raw;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, token);
}
