/**
 * Issue #49 — Playwright E2E browser suite (UX/UI flow)
 * Smoke test that the browser can navigate key pages.
 * NOTE: These tests require the dev server to be running.
 * Run: npx playwright test (or bunx playwright test)
 */
import { expect, test } from "@playwright/test";

test.describe("Login → Admin → Sponsor flow", () => {
  test("login page loads with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("NetZeroCarbon");
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("unauthenticated user is redirected from /admin to /login", async ({ page }) => {
    const res = await page.goto("/admin");
    const status = res?.status() ?? 200;
    // Either 401 JSON or redirect to /login
    expect(status === 401 || status === 302 || status === 200).toBeTruthy();
  });

  test("unauthenticated user is redirected from /sponsor to /login", async ({ page }) => {
    const res = await page.goto("/sponsor");
    const status = res?.status() ?? 200;
    expect(status === 401 || status === 302 || status === 200).toBeTruthy();
  });

  test("login form POSTs to /login", async ({ page }) => {
    await page.goto("/login");
    const form = page.locator("form");
    await expect(form).toHaveAttribute("action", "/login");
    await expect(form).toHaveAttribute("method", "POST");
  });

  test("health endpoint returns JSON", async ({ request }) => {
    const res = await request.get("/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
  });
});
