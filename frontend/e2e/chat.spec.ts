import { test, expect } from "@playwright/test";

test.describe("LIFF Chat Interface", () => {
  test("loads chat page with welcome message", async ({ page }) => {
    await page.goto("/chat");

    // Should show heading
    await expect(page.getByRole("heading", { name: "NetZeroCarbon" })).toBeVisible();
    await expect(page.locator("text=ยินดีต้อนรับ")).toBeVisible();
  });

  test("shows quick action buttons", async ({ page }) => {
    await page.goto("/chat");

    await expect(page.locator("text=👋 สวัสดี")).toBeVisible();
    await expect(page.locator("text=❓ ช่วย")).toBeVisible();
    await expect(page.locator("text=📸 ถ่ายรูป")).toBeVisible();
    await expect(page.locator("text=🌾 เลือกแปลง")).toBeVisible();
  });

  test("shows input bar with send button", async ({ page }) => {
    await page.goto("/chat");

    await expect(page.locator('input[placeholder="พิมพ์ข้อความ..."]')).toBeVisible();
    await expect(page.locator('button:has-text("➤")')).toBeVisible();
  });

  test("shows bottom navigation", async ({ page }) => {
    await page.goto("/chat");

    await expect(page.locator('a:has-text("แชท")')).toBeVisible();
    await expect(page.locator('a:has-text("อัปโหลด")')).toBeVisible();
    await expect(page.locator('a:has-text("สรุป")')).toBeVisible();
  });

  test("can type and send message", async ({ page }) => {
    await page.goto("/chat");

    const input = page.locator('input[placeholder="พิมพ์ข้อความ..."]');
    await input.fill("สวัสดีครับ");

    const sendBtn = page.locator('button:has-text("➤")');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Should show user message
    await expect(page.locator("text=สวัสดีครับ").last()).toBeVisible();
  });

  test("quick action sends message", async ({ page }) => {
    await page.goto("/chat");

    await page.locator("text=👋 สวัสดี").click();

    // Should show user message
    await expect(page.locator("text=สวัสดี").last()).toBeVisible();
  });
});

test.describe("LIFF Chat - Mobile Layout", () => {
  test.use({ ...{ viewport: { width: 375, height: 812 } } });

  test("renders correctly on mobile", async ({ page }) => {
    await page.goto("/chat");

    // Header should be visible
    await expect(page.getByRole("heading", { name: "NetZeroCarbon" })).toBeVisible();

    // Input should be at bottom
    const input = page.locator('input[placeholder="พิมพ์ข้อความ..."]');
    await expect(input).toBeVisible();
  });
});
