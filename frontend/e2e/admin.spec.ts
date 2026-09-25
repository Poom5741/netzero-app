import { test, expect, type Page } from "@playwright/test";

async function setupAdminPage(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true, role: "admin", email: "admin@netzero.com" }) }),
  );
  await page.route("**/api/admin/overview/kpis**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ totalFarmers: 12, totalPlots: 8, totalAreaRai: 42, pendingReviews: 3, totalCredits: 1.25 }) }),
  );
  await page.route("**/api/admin/overview/work-queue", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ pendingApplications: 2, photoQueue: 3, missingPhotos: 1, sfwFallback: 0, urgentApplications: 0, urgentPhotos: 0 }) }),
  );
  for (const path of ["credit-chart", "ghg-sources", "provinces"]) {
    await page.route(`**/api/admin/overview/${path}`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) }),
    );
  }
}

test.beforeEach(async ({ page }) => setupAdminPage(page));

test.describe("Admin Overview Dashboard", () => {
  test("renders sidebar with NetZero brand", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Sidebar is hidden on mobile; brand tested in mobile layout describe",
    );
    await page.goto("/admin");
    await expect(page.locator("aside").getByText("NetZero", { exact: true })).toBeVisible();
  });

  test("renders overview heading", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "ภาพรวมระบบ" })).toBeVisible();
  });

  test("renders KPI section", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[aria-label="ตัวชี้วัดหลัก"]')).toBeVisible();
    await expect(page.getByText("เกษตรกรทั้งหมด")).toBeVisible();
    await expect(page.getByText("รอตรวจสอบภาพ")).toBeVisible();
  });

  test("renders work queue section", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[aria-label="งานค้าง"]')).toBeVisible();
  });

  test("renders Thai project description", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("สรุปข้อมูลโครงการ NetZeroCarbon")).toBeVisible();
  });
});

test.describe("Admin Overview Dashboard - Mobile Layout", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("renders menu control on mobile viewport", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("button", { name: "เปิดเมนู" })).toBeVisible();
  });

  test("KPI section visible on mobile", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[aria-label="ตัวชี้วัดหลัก"]')).toBeVisible();
  });

  test("work queue visible on mobile", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('[aria-label="งานค้าง"]')).toBeVisible();
  });
});
