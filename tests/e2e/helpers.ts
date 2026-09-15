/**
 * E2E Test Helpers — NetZeroCarbon
 *
 * Reusable utilities for Playwright E2E tests.
 * Provides auth setup, page-object patterns, console error collection,
 * and common assertions.
 */
import { expect, type Page } from "@playwright/test";

// ─── Constants ────────────────────────────────────────────────────────

export const ADMIN_EMAIL = "admin@netzero.com";
export const ADMIN_PASS = "ClawTest2026!";
export const SPONSOR_EMAIL = "sponsor@netzero.local";
export const SPONSOR_PASS = "ClawTest2026!";

/** Default timeout for network-heavy operations */
export const NETWORK_TIMEOUT = 10_000;

// ─── Auth Helpers ─────────────────────────────────────────────────────

/**
 * Pre-authenticate as admin by setting sessionStorage before navigation.
 * This bypasses the login form (which has a CSS layout bug in production).
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.evaluate(
    ({ email, pass }) => {
      sessionStorage.setItem("nzc_admin_email", email);
      sessionStorage.setItem("nzc_admin_pass", pass);
    },
    { email: ADMIN_EMAIL, pass: ADMIN_PASS },
  );
}

/**
 * Pre-authenticate as sponsor by setting sessionStorage before navigation.
 */
export async function loginAsSponsor(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.evaluate(
    ({ email, pass }) => {
      sessionStorage.setItem("nzc_admin_email", email);
      sessionStorage.setItem("nzc_admin_pass", pass);
    },
    { email: SPONSOR_EMAIL, pass: SPONSOR_PASS },
  );
}

/**
 * Perform actual login via the backend API (sets cookies).
 * Returns true if login succeeded.
 */
export async function performLogin(page: Page, email: string, password: string): Promise<boolean> {
  const result = await page.evaluate(
    async ({ email, password }) => {
      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email, password }),
          redirect: "manual",
          credentials: "include",
        });
        return res.status === 0 || res.status === 302;
      } catch {
        return false;
      }
    },
    { email, password },
  );
  return result;
}

// ─── Navigation Helpers ───────────────────────────────────────────────

/**
 * Navigate to a page and wait for it to be fully loaded.
 * Returns load time in ms.
 */
export async function navigateTo(
  page: Page,
  url: string,
): Promise<{ status: number; loadMs: number }> {
  const start = Date.now();
  const res = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: NETWORK_TIMEOUT,
  });
  const loadMs = Date.now() - start;
  return { status: res?.status() ?? 0, loadMs };
}

/**
 * Wait for LIFF standalone init to complete (loading spinner disappears).
 */
export async function waitForLiffReady(page: Page): Promise<void> {
  try {
    await page.waitForFunction(
      () =>
        !document.querySelector(".animate-spin") ||
        document.querySelectorAll(".animate-spin").length === 0,
      { timeout: 15_000 },
    );
  } catch {
    // Spinner may never appear; continue
  }
  await page.waitForTimeout(1_000);
}

/**
 * Wait for the admin review queue to finish loading.
 */
export async function waitForAdminQueue(page: Page): Promise<void> {
  await page.waitForSelector('[role="tablist"]', { timeout: NETWORK_TIMEOUT });
  try {
    await page.waitForSelector("text=กำลังโหลด...", {
      state: "hidden",
      timeout: 8_000,
    });
  } catch {
    // Loading text may not appear if data loads fast
  }
  await page.waitForTimeout(2_000);
}

// ─── Console Error Collection ─────────────────────────────────────────

/**
 * Collect console errors during a callback.
 * Returns array of error messages.
 */
export async function collectConsoleErrors(page: Page, fn: () => Promise<void>): Promise<string[]> {
  const errors: string[] = [];
  const handler = (msg: { type: string; text: string }) => {
    if (msg.type() === "error") errors.push(msg.text());
  };
  page.on("console", handler);
  await fn();
  page.off("console", handler);
  return errors;
}

// ─── Page Object: Admin Dashboard ─────────────────────────────────────

export class AdminPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await loginAsAdmin(this.page);
    await navigateTo(this.page, "/admin");
    await waitForAdminQueue(this.page);
  }

  get tablist() {
    return this.page.locator('[role="tablist"]');
  }

  get tabs() {
    return this.page.locator('[role="tab"]');
  }

  get reviewCards() {
    return this.page.locator('button[aria-label*="ภาพหลักฐาน"]');
  }

  get emptyState() {
    return this.page.locator("text=ไม่มีรายการในขณะนี้");
  }

  get errorMsg() {
    return this.page.locator("text=ไม่สามารถโหลดข้อมูลได้");
  }

  get detailPanel() {
    return this.page.locator('[aria-label="รายละเอียดการตรวจสอบ"]');
  }

  get approveBtn() {
    return this.detailPanel.locator("text=Approve");
  }

  get rejectBtn() {
    return this.detailPanel.locator("text=Reject");
  }

  get heading() {
    return this.page.getByRole("heading", { name: "Review Queue" });
  }

  async clickTab(name: string) {
    const tab = this.page.locator('[role="tab"]', { hasText: name });
    await tab.click();
    return tab;
  }

  async openFirstCard() {
    const count = await this.reviewCards.count();
    if (count > 0) {
      await this.reviewCards.first().click();
      await expect(this.detailPanel).toBeVisible({ timeout: 5_000 });
      return true;
    }
    return false;
  }

  async getTabCount(): Promise<number> {
    return this.tabs.count();
  }

  async getCardCount(): Promise<number> {
    return this.reviewCards.count();
  }
}

// ─── Page Object: Sponsor Dashboard ───────────────────────────────────

export class SponsorPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await loginAsSponsor(this.page);
    await navigateTo(this.page, "/sponsor");
    await this.page.waitForLoadState("networkidle");
  }

  get heading() {
    return this.page.getByRole("heading", { name: "แดชบอร์ดผู้สนับสนุน" });
  }

  get kpiCards() {
    return this.page.locator('[aria-label*="KPI"], [data-testid*="kpi"]');
  }

  get provinceGroups() {
    return this.page.locator('[role="group"], [data-testid*="province"]');
  }

  get csvExportBtn() {
    return this.page.locator("text=Export CSV, text=ส่งออก CSV");
  }

  async waitForData() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2_000);
  }
}

// ─── Page Object: Chat ────────────────────────────────────────────────

export class ChatPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await navigateTo(this.page, "/chat");
    await waitForLiffReady(this.page);
  }

  get welcomeMessage() {
    return this.page.locator("text=สวัสดีครับ");
  }

  get inputField() {
    return this.page.locator('textarea, input[type="text"]').last();
  }

  get sendButton() {
    return this.page.locator('button[aria-label*="ส่ง"], button:has-text("ส่ง")');
  }

  get bottomNav() {
    return this.page.locator('nav, [role="navigation"]');
  }

  get chatBubbles() {
    return this.page.locator('[class*="chat"], [class*="bubble"]');
  }

  async sendMessage(text: string) {
    await this.inputField.fill(text);
    await this.sendButton.click();
  }

  async getMessageCount(): Promise<number> {
    return this.chatBubbles.count();
  }
}

// ─── Page Object: Upload ──────────────────────────────────────────────

export class UploadPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await navigateTo(this.page, "/upload");
    await waitForLiffReady(this.page);
  }

  get plotSelect() {
    return this.page.locator('select, [role="combobox"]').first();
  }

  get seasonSelect() {
    return this.page.locator('select, [role="combobox"]').nth(1);
  }

  get photoTypeSelect() {
    return this.page.locator('select, [role="combobox"]').last();
  }

  get uploadButton() {
    return this.page.locator('button:has-text("อัปโหลด"), button[type="submit"]');
  }

  get cameraButton() {
    return this.page.locator('button:has-text("ถ่ายรูป"), input[type="file"]');
  }
}

// ─── Page Object: Season Summary ──────────────────────────────────────

export class SummaryPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await navigateTo(this.page, "/summary");
    await waitForLiffReady(this.page);
  }

  get heading() {
    return this.page.locator("text=สรุปผล, h1, h2").first();
  }

  get waterSlider() {
    return this.page.locator('input[type="range"]');
  }

  get submitButton() {
    return this.page.locator('button[type="submit"], button:has-text("บันทึก")');
  }
}

// ─── Screenshot Helpers ───────────────────────────────────────────────

/**
 * Take a screenshot and return its path for evidence.
 */
export async function takeEvidenceScreenshot(page: Page, name: string): Promise<string> {
  const path = `tests/e2e/test-results/${name}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

// ─── Assertion Helpers ────────────────────────────────────────────────

/**
 * Assert page loaded within acceptable time.
 */
export function assertLoadTime(loadMs: number, maxMs = 10_000) {
  expect(loadMs).toBeLessThan(maxMs);
}

/**
 * Assert page URL contains expected path.
 */
export function assertOnPage(page: Page, path: string) {
  expect(page.url()).toContain(path);
}
