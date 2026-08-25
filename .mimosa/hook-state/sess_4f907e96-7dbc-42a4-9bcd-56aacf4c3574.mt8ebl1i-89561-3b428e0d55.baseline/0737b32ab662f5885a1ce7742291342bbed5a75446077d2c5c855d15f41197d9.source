import { test, expect } from "@playwright/test";

test.describe("Sponsor Dashboard", () => {
  test("renders sidebar with NetZero brand", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=NetZero").first()).toBeVisible();
  });

  test("renders Sponsor Dashboard heading", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=แดชบอร์ดผู้สนับสนุน").first()).toBeVisible();
  });

  test("renders three KPI labels", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=CO₂ ที่ลดทั้งหมด").first()).toBeVisible();
    await expect(page.locator("text=แปลงที่ได้รับการสนับสนุน").first()).toBeVisible();
    await expect(page.locator("text=การลงทุนทั้งหมด").first()).toBeVisible();
  });

  test("renders Live Carbon Tracking label", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=ติดตามคาร์บอนแบบเรียลไทม์").first()).toBeVisible();
  });

  test("renders Regional Breakdown heading", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=รายละเอียดตามภูมิภาค").first()).toBeVisible();
  });

  test("renders Export Report button", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=ส่งออกรายงาน").first()).toBeVisible();
  });

  test("renders navigation links", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=แดชบอร์ดผู้สนับสนุน").first()).toBeVisible();
  });
});

test.describe("Sponsor Dashboard - Mobile Layout", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("renders correctly on mobile (Pixel 5)", async ({ page }) => {
    await page.goto("/sponsor");
    await expect(page.locator("text=แดชบอร์ดผู้สนับสนุน").first()).toBeVisible();
    await expect(page.locator("text=CO₂ ที่ลดทั้งหมด").first()).toBeVisible();
    await expect(page.locator("text=ส่งออกรายงาน").first()).toBeVisible();
  });
});
