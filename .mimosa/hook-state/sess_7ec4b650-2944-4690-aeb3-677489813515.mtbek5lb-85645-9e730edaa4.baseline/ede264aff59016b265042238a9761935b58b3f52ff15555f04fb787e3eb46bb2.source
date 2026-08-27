import { test, expect } from "@playwright/test";

test.describe("LIFF Chat Interface", () => {
  test("loads chat page with welcome message", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("text=Chat Hub")).toBeVisible();
    await expect(page.locator("text=ยินดีต้อนรับสู่ NetZeroCarbon")).toBeVisible();
  });

  test("shows quick action buttons", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("text=ส่งรูปถ่าย")).toBeVisible();
    await expect(page.locator("text=สรุปฤดูกาล")).toBeVisible();
    await expect(page.locator("text=สอบถาม")).toBeVisible();
  });

  test("shows input bar with send button", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator('input[placeholder="พิมพ์ข้อความ..."]')).toBeVisible();
    await expect(page.locator('[aria-label="ส่งข้อความ"]')).toBeVisible();
  });

  test("shows bottom navigation", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator('nav[aria-label="นำทางหลัก"] a:has-text("แชท")')).toBeVisible();
    await expect(page.locator('nav[aria-label="นำทางหลัก"] a:has-text("อัปโหลด")')).toBeVisible();
    await expect(page.locator('nav[aria-label="นำทางหลัก"] a:has-text("สรุป")')).toBeVisible();
  });

  test("can type and send message", async ({ page }) => {
    await page.goto("/chat");
    const input = page.locator('input[placeholder="พิมพ์ข้อความ..."]');
    await input.fill("สวัสดีครับ");
    const sendBtn = page.locator('[aria-label="ส่งข้อความ"]');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();
    await expect(page.locator("text=สวัสดีครับ").last()).toBeVisible();
  });

  test("quick action sends message", async ({ page }) => {
    await page.goto("/chat");
    await page.locator("text=สอบถาม").click();
    await expect(page.locator("text=สอบถาม").last()).toBeVisible();
  });
});

test.describe("LIFF Chat - Mobile Layout", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("renders correctly on mobile", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("text=Chat Hub")).toBeVisible();
    await expect(page.locator('input[placeholder="พิมพ์ข้อความ..."]')).toBeVisible();
  });
});
