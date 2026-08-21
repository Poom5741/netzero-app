import { test, expect } from "@playwright/test";

test.describe("Admin Review Dashboard", () => {
  test("renders sidebar with NetZero brand", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Sidebar is hidden on mobile; brand tested in mobile layout describe",
    );
    await page.goto("/admin");
    await expect(page.locator("aside").getByText("NetZero", { exact: true })).toBeVisible();
  });

  test("renders Review Queue heading", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();
  });

  test("renders filter tabs including ทั้งหมด", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ทั้งหมด")')).toBeVisible();
  });

  test("renders grid area for review cards", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[aria-label="รายการตรวจสอบ"]')).toBeVisible();
  });

  test("shows error state when API is unavailable", async ({ page }) => {
    await page.goto("/admin");
    // Shell renders even when API fails
    await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ทั้งหมด")')).toBeVisible();
    // Error message shown because no backend
    await expect(page.getByText("ไม่สามารถโหลดข้อมูลได้")).toBeVisible();
  });

  test("renders Thai description text", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("ตรวจสอบและอนุมัติภาพถ่ายหลักฐานจากเกษตรกร")).toBeVisible();
  });
});

test.describe("Admin Review Dashboard - Mobile Layout", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("renders brand on mobile viewport", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("mobile-brand")).toBeVisible();
  });

  test("filter tabs visible on mobile", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[role="tab"]:has-text("ทั้งหมด")')).toBeVisible();
  });

  test("renders grid area on mobile", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[aria-label="รายการตรวจสอบ"]')).toBeVisible();
  });
});
