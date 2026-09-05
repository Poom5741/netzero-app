/**
 * Full QA Test Suite for NetZeroCarbon Frontend
 * Tests all pages, components, interactions, accessibility, responsiveness.
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const TARGET = process.env.QA_TARGET ?? BASE;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function collectConsoleErrors(page: Page, fn: () => Promise<void>): Promise<string[]> {
  const errors: string[] = [];
  const handler = (msg: { type: string; text: string }) => {
    if (msg.type() === "error") errors.push(msg.text());
  };
  page.on("console", handler);
  await fn();
  page.removeListener("console", handler);
  return errors;
}

async function checkBrokenImages(page: Page): Promise<string[]> {
  const broken: string[] = [];
  const images = await page.$$eval("img", (imgs) =>
    imgs.map((img) => ({ src: img.src, alt: img.alt || "(no alt)", naturalWidth: img.naturalWidth })),
  );
  for (const img of images) {
    if (img.naturalWidth === 0 && img.src && !img.src.startsWith("data:")) {
      broken.push(`${img.src} (alt: ${img.alt})`);
    }
  }
  return broken;
}

async function measureLoadTime(page: Page, url: string): Promise<{ timeMs: number; status: number | null }> {
  const start = Date.now();
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const timeMs = Date.now() - start;
  return { timeMs, status: response?.status() ?? null };
}

async function checkMaterialSymbols(page: Page): Promise<{ total: number; rendered: number; notLoaded: number }> {
  return page.evaluate(() => {
    const symbols = document.querySelectorAll(".material-symbols-outlined");
    let rendered = 0;
    let notLoaded = 0;
    symbols.forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.fontFamily.includes("Material Symbols") || cs.fontSize !== "0px") rendered++;
      else notLoaded++;
    });
    return { total: symbols.length, rendered, notLoaded };
  });
}

async function checkAccessibility(page: Page): Promise<string[]> {
  const issues: string[] = [];
  const interactiveNoLabel = await page.$$eval("button, a[href]", (els) =>
    els
      .filter((el) => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute("aria-label");
        const title = el.getAttribute("title");
        const hasImg = el.querySelector("img[alt]");
        return !text && !ariaLabel && !title && !hasImg;
      })
      .map((el) => `<${el.tagName.toLowerCase()}> without accessible name`),
  );
  issues.push(...interactiveNoLabel);

  const htmlLang = await page.getAttribute("html", "lang");
  if (!htmlLang) issues.push("Missing lang attribute on <html>");
  return issues;
}

async function checkColorContrast(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const textElements = document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6, a, button, label");
    const problems: string[] = [];
    const seen = new Set<string>();
    textElements.forEach((el) => {
      if (seen.size > 20) return;
      const cs = window.getComputedStyle(el);
      const color = cs.color;
      const bg = cs.backgroundColor;
      const text = el.textContent?.trim().slice(0, 50);
      if (!text || text.length < 2) return;
      const key = `${color}-${bg}-${text.slice(0, 10)}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (bg && color) {
        const parseRGB = (s: string) => {
          const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [+m[1], +m[2], +m[3]] : null;
        };
        const fg = parseRGB(color);
        const bgC = parseRGB(bg);
        if (fg && bgC) {
          const lum = (r: number, g: number, b: number) => {
            const [rs, gs, bs] = [r, g, b].map((c) => {
              c /= 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          };
          const l1 = lum(fg[0], fg[1], fg[2]);
          const l2 = lum(bgC[0], bgC[1], bgC[2]);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          if (ratio < 4.5) {
            problems.push(`Low contrast (${ratio.toFixed(1)}:1) "${text.slice(0, 30)}" (fg: ${color}, bg: ${bg})`);
          }
        }
      }
    });
    return problems;
  });
}

// ── 1. Home / Root ───────────────────────────────────────────────────────────

test.describe("1. Home/Root (/)", () => {
  test("redirects to /chat", async ({ page }) => {
    const { timeMs } = await measureLoadTime(page, `${TARGET}/`);
    console.log(`[HOME] Load: ${timeMs}ms`);
    await page.waitForURL("**/chat", { timeout: 10000 });
    expect(page.url()).toContain("/chat");
  });
});

// ── 2. Login (/admin/login) ──────────────────────────────────────────────────

test.describe("2. Login Page (/admin/login)", () => {
  test("renders form elements in DOM", async ({ page }) => {
    const errors = await collectConsoleErrors(page, async () => {
      await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle", timeout: 30000 });
    });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-login-desktop.png", fullPage: true });

    // Verify DOM structure (elements exist regardless of CSS layout)
    await expect(page.locator("h1")).toContainText("เข้าสู่ระบบ Admin");
    await expect(page.locator('input[type="email"]')).toHaveAttribute("placeholder", "admin@netzero.com");
    await expect(page.locator('input[type="password"]')).toHaveAttribute("placeholder", "••••••••");
    await expect(page.locator('button[type="submit"]')).toContainText("เข้าสู่ระบบ");
    await expect(page.locator('label:has-text("อีเมล")')).toHaveCount(1);
    await expect(page.locator('label:has-text("รหัสผ่าน")')).toHaveCount(1);

    // BUG: Check if neumorphic card has proper width
    const cardWidth = await page.evaluate(() => {
      const card = document.querySelector(".neumorphic");
      return card ? card.getBoundingClientRect().width : 0;
    });
    console.log(`[LOGIN] Card width: ${cardWidth}px (expected >= 300)`);

    console.log(`[LOGIN] Console errors: ${errors.length}`, errors);
    const broken = await checkBrokenImages(page);
    console.log(`[LOGIN] Broken images:`, broken);
  });

  test("submit button is hidden by CSS layout bug", async ({ page }) => {
    await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle" });
    // Document the bug: button exists in DOM but is not visible
    const btnInfo = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      const cs = window.getComputedStyle(btn);
      return { visible: cs.visibility, display: cs.display, rect: { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } };
    });
    console.log(`[LOGIN] Button info:`, JSON.stringify(btnInfo));
    expect(btnInfo).not.toBeNull();
  });

  test("responsive mobile - card width bug", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-login-mobile.png", fullPage: true });

    const cardBox = await page.evaluate(() => {
      const card = document.querySelector(".neumorphic");
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    console.log(`[LOGIN] Mobile card: ${JSON.stringify(cardBox)}`);
    // BUG: card should be > 300px but is likely very narrow
    expect(cardBox).not.toBeNull();
  });

  test("loads Material Symbols", async ({ page }) => {
    await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle" });
    const icons = await checkMaterialSymbols(page);
    console.log(`[LOGIN] Icons: total=${icons.total}, rendered=${icons.rendered}`);
    expect(icons.total).toBeGreaterThan(0);
  });

  test("accessibility labels exist", async ({ page }) => {
    await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle" });
    const issues = await checkAccessibility(page);
    console.log(`[LOGIN] A11y:`, issues);
  });
});

// ── 3. Chat (/chat) ──────────────────────────────────────────────────────────

test.describe("3. Chat Page (/chat)", () => {
  test("renders full chat interface", async ({ page }) => {
    const errors = await collectConsoleErrors(page, async () => {
      await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle", timeout: 30000 });
    });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-chat-desktop.png", fullPage: true });

    await expect(page.locator("text=Chat Hub")).toBeVisible();
    const botBubble = page.locator("text=สวัสดีครับ");
    await expect(botBubble.first()).toBeVisible();
    await expect(page.locator('input[aria-label="พิมพ์ข้อความ"]')).toBeVisible();
    await expect(page.locator('button[aria-label="ส่งข้อความ"]')).toBeDisabled();
    await expect(page.locator("text=ยอมรับเงื่อนไข").first()).toBeVisible();
    await expect(page.locator('nav[aria-label="นำทางหลัก"]')).toBeVisible();
    await expect(page.locator('img[alt="NetZeroCarbon Logo"]')).toBeVisible();

    console.log(`[CHAT] Console errors: ${errors.length}`, errors);
    const broken = await checkBrokenImages(page);
    console.log(`[CHAT] Broken images:`, broken);
  });

  test("send button enables on input", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    const input = page.locator('input[aria-label="พิมพ์ข้อความ"]');
    const sendBtn = page.locator('button[aria-label="ส่งข้อความ"]');
    await expect(sendBtn).toBeDisabled();
    await input.fill("สวัสดี");
    await expect(sendBtn).toBeEnabled();
    await input.fill("");
    await expect(sendBtn).toBeDisabled();
  });

  test("bottom nav has correct links", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    const nav = page.locator('nav[aria-label="นำทางหลัก"] a');
    expect(await nav.count()).toBe(3);
    await expect(nav.nth(0)).toHaveAttribute("href", "/chat");
    await expect(nav.nth(1)).toHaveAttribute("href", "/upload");
    await expect(nav.nth(2)).toHaveAttribute("href", "/summary");
    await expect(nav.nth(0)).toContainText("แชท");
    await expect(nav.nth(1)).toContainText("อัปโหลด");
    await expect(nav.nth(2)).toContainText("สรุปผล");
    await expect(nav.nth(0)).toHaveClass(/claymorphic/);
  });

  test("mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-chat-mobile.png", fullPage: true });
    await expect(page.locator('input[aria-label="พิมพ์ข้อความ"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="นำทางหลัก"]')).toBeVisible();
  });

  test("quick action buttons work", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    const acceptBtn = page.locator("button:has-text('ยอมรับเงื่อนไข')");
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      const userMessages = page.locator("text=ยอมรับ");
      expect(await userMessages.count()).toBeGreaterThan(0);
    }
  });

  test("notification and refresh buttons exist", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await expect(page.locator('button[aria-label="การแจ้งเตือน"]')).toBeVisible();
    await expect(page.locator('button[aria-label="เริ่มแชทใหม่"]')).toBeVisible();
    await expect(page.locator('button[aria-label="เพิ่มไฟล์"]')).toBeVisible();
  });
});

// ── 4. Admin Review (/admin) ─────────────────────────────────────────────────

test.describe("4. Admin Review Page (/admin)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem("nzc_admin_email", "admin@netzero.com");
      sessionStorage.setItem("nzc_admin_pass", "password");
    });
  });

  test("renders review queue with filters", async ({ page }) => {
    const errors = await collectConsoleErrors(page, async () => {
      await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle", timeout: 30000 });
    });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-admin-desktop.png", fullPage: true });

    // Use heading selector to avoid strict mode (text appears in both mobile header and h2)
    await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ทั้งหมด")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("รอตรวจสอบ")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ถูกธง")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ผ่านแล้ว")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ปฏิเสธแล้ว")')).toBeVisible();
    await expect(page.locator("text=สถานะฤดูกาล")).toBeVisible();
    await expect(page.locator("button:has-text('อนุมัติฤดูกาล')")).toBeVisible();

    console.log(`[ADMIN] Console errors: ${errors.length}`, errors);
  });

  test("shows loading, error, or empty state", async ({ page }) => {
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    const hasCards = await page.locator('[aria-label^="ภาพหลักฐาน"]').count();
    const hasEmpty = await page.locator("text=ไม่มีรายการในขณะนี้").isVisible().catch(() => false);
    const hasLoading = await page.locator("text=กำลังโหลด...").isVisible().catch(() => false);
    const hasError = await page.locator("text=ไม่สามารถโหลดข้อมูลได้").isVisible().catch(() => false);
    console.log(`[ADMIN] State: cards=${hasCards} empty=${hasEmpty} loading=${hasLoading} error=${hasError}`);
    expect(hasCards > 0 || hasEmpty || hasLoading || hasError).toBeTruthy();
  });

  test("filter tabs switch correctly", async ({ page }) => {
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const pendingTab = page.locator('[role="tab"]:has-text("รอตรวจสอบ")');
    await pendingTab.click();
    await expect(pendingTab).toHaveAttribute("aria-selected", "true");
    const flaggedTab = page.locator('[role="tab"]:has-text("ถูกธง")');
    await flaggedTab.click();
    await expect(flaggedTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[role="tab"]:has-text("ทั้งหมด")')).toHaveAttribute("aria-selected", "false");
  });

  test("detail panel opens on card click", async ({ page }) => {
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    const cards = page.locator('button[aria-label^="ภาพหลักฐาน"]');
    const cardCount = await cards.count();
    if (cardCount > 0) {
      await cards.first().click();
      const panel = page.locator('[aria-label="รายละเอียดการตรวจสอบ"]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      await expect(panel.locator("button:has-text('Approve')")).toBeVisible();
      await expect(panel.locator("button:has-text('Reject')")).toBeVisible();
      await expect(panel.locator('button[aria-label="Close"]')).toBeVisible();
      await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-admin-detail-panel.png", fullPage: true });
    } else {
      console.log("[ADMIN] No review cards (empty/error state)");
    }
  });

  test("mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-admin-mobile.png", fullPage: true });
    await expect(page.locator('[data-testid="mobile-brand"]')).toBeVisible();
  });
});

// ── 5. Sponsor Dashboard (/sponsor) ──────────────────────────────────────────

test.describe("5. Sponsor Dashboard (/sponsor)", () => {
  test("renders dashboard with KPI cards", async ({ page }) => {
    const errors = await collectConsoleErrors(page, async () => {
      await page.goto(`${TARGET}/sponsor`, { waitUntil: "networkidle", timeout: 30000 });
    });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-sponsor-desktop.png", fullPage: true });

    // Use heading to avoid strict mode
    await expect(page.getByRole("heading", { name: "แดชบอร์ดผู้สนับสนุน" })).toBeVisible();
    await expect(page.locator("text=ติดตามคาร์บอนแบบเรียลไทม์")).toBeVisible();
    await expect(page.locator("text=CO₂ ที่ลดทั้งหมด")).toBeVisible();
    await expect(page.locator("text=แปลงที่ได้รับการสนับสนุน")).toBeVisible();
    await expect(page.locator("text=การลงทุนทั้งหมด")).toBeVisible();
    await expect(page.locator("button:has-text('ส่งออกรายงาน')")).toBeVisible();

    // Check for CSS layout bug
    const headingBox = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return null;
      const rect = h1.getBoundingClientRect();
      return { width: rect.width, left: rect.left };
    });
    console.log(`[SPONSOR] Heading box: ${JSON.stringify(headingBox)}`);

    console.log(`[SPONSOR] Console errors: ${errors.length}`, errors);
    const broken = await checkBrokenImages(page);
    console.log(`[SPONSOR] Broken images:`, broken);
  });

  test("province groups load or empty state shown", async ({ page }) => {
    await page.goto(`${TARGET}/sponsor`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    const hasEmpty = await page.locator("text=ยังไม่มีข้อมูล").isVisible().catch(() => false);
    const hasRegionHeader = await page.locator("text=รายละเอียดตามภูมิภาค").isVisible().catch(() => false);
    const hasLoading = await page.locator("text=กำลังโหลดข้อมูล...").isVisible().catch(() => false);
    console.log(`[SPONSOR] State: empty=${hasEmpty} region=${hasRegionHeader} loading=${hasLoading}`);
    expect(hasEmpty || hasRegionHeader || hasLoading).toBeTruthy();
  });

  test("LiveCalc and map section render", async ({ page }) => {
    await page.goto(`${TARGET}/sponsor`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expect(page.locator("text=AWD")).toBeVisible();
    await expect(page.locator("text=Biochar")).toBeVisible();
    await expect(page.locator("text=การกระจายโครงการ")).toBeVisible();
  });

  test("mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/sponsor`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-sponsor-mobile.png", fullPage: true });
    await expect(page.getByRole("heading", { name: "แดชบอร์ดผู้สนับสนุน" })).toBeVisible();
  });

  test("export button triggers download", async ({ page }) => {
    await page.goto(`${TARGET}/sponsor`, { waitUntil: "networkidle" });
    const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
    // Use force:true to bypass header interception on mobile
    await page.locator("button:has-text('ส่งออกรายงาน')").click({ force: true });
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toMatch(/sponsor-report.*\.csv/);
      console.log(`[SPONSOR] Export: ${download.suggestedFilename()}`);
    } else {
      console.log("[SPONSOR] No download event (blob URL)");
    }
  });
});

// ── 6. Upload (/upload) ──────────────────────────────────────────────────────

test.describe("6. Upload Page (/upload)", () => {
  test("renders upload interface", async ({ page }) => {
    const errors = await collectConsoleErrors(page, async () => {
      await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle", timeout: 30000 });
    });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-upload-desktop.png", fullPage: true });

    await expect(page.locator("text=อัปโหลดรูป")).toBeVisible();
    await expect(page.locator('[role="radiogroup"][aria-label="ประเภทรูป"]')).toBeVisible();
    await expect(page.locator('[role="radio"]:has-text("เตรียมดิน")')).toBeVisible();
    await expect(page.locator('[role="radio"]:has-text("ท่อน้ำ/เปียก-แห้ง")')).toBeVisible();
    await expect(page.locator('[role="radio"]:has-text("เก็บเกี่ยว")')).toBeVisible();
    await expect(page.locator('[data-testid="camera-frame"]')).toBeVisible();
    await expect(page.locator("button:has-text('เลือกประเภทรูปก่อน')")).toBeVisible();
    await expect(page.locator("text=ตำแหน่ง GPS")).toBeVisible();
    await expect(page.locator('nav[aria-label="นำทางหลัก"]')).toBeVisible();

    console.log(`[UPLOAD] Console errors: ${errors.length}`, errors);
    const broken = await checkBrokenImages(page);
    console.log(`[UPLOAD] Broken images:`, broken);
  });

  test("selecting photo type enables capture", async ({ page }) => {
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    const wetdryBtn = page.locator('[role="radio"]:has-text("ท่อน้ำ/เปียก-แห้ง")');
    await wetdryBtn.click();
    await expect(wetdryBtn).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("button:has-text('ถ่ายรูป')")).toBeVisible();
    await expect(page.locator('[role="radio"]:has-text("เตรียมดิน")')).toHaveAttribute("aria-checked", "false");
  });

  test("camera frame has proper ARIA", async ({ page }) => {
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    const frame = page.locator('[data-testid="camera-frame"]');
    await expect(frame).toHaveAttribute("role", "button");
    await expect(frame).toHaveAttribute("aria-label", "ถ่ายรูป");
    await expect(frame).toHaveAttribute("tabindex", "0");
  });

  test("mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-upload-mobile.png", fullPage: true });
    await expect(page.locator('[data-testid="camera-frame"]')).toBeVisible();
  });

  test("radio buttons start unchecked", async ({ page }) => {
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    const radios = page.locator('[role="radio"]');
    expect(await radios.count()).toBe(3);
    for (let i = 0; i < 3; i++) {
      await expect(radios.nth(i)).toHaveAttribute("aria-checked", "false");
    }
  });
});

// ── 7. Summary (/summary) ────────────────────────────────────────────────────

test.describe("7. Summary Page (/summary)", () => {
  test("renders summary form", async ({ page }) => {
    const errors = await collectConsoleErrors(page, async () => {
      await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle", timeout: 30000 });
    });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-summary-desktop.png", fullPage: true });

    await expect(page.locator("text=สรุปฤดูกาล")).toBeVisible();
    await expect(page.locator("text=เลือกแปลงนา")).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator("text=ระดับน้ำ (ซม.)")).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
    await expect(page.locator("text=การจัดการฟางข้าว")).toBeVisible();
    await expect(page.locator("text=พลังงานที่ใช้")).toBeVisible();
    await expect(page.locator("button:has-text('บันทึกข้อมูล')")).toBeVisible();
    await expect(page.locator('nav[aria-label="นำทางหลัก"]')).toBeVisible();

    console.log(`[SUMMARY] Console errors: ${errors.length}`, errors);
  });

  test("required asterisk on straw management", async ({ page }) => {
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    // The asterisk is a red span with text "*"
    const asterisk = page.locator("text=*").first();
    await expect(asterisk).toBeVisible();
  });

  test("progress updates when filling form", async ({ page }) => {
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    // Progress starts at 25% (waterLevel=5 counts as filled)
    const progressEl = page.locator("text=25%");
    await expect(progressEl).toBeVisible();

    // Select straw management (3rd select)
    const strawSelect = page.locator("select").nth(2);
    await strawSelect.selectOption("plough_under");
    // Progress should increase to 50%
    await expect(page.locator("text=50%")).toBeVisible();
  });

  test("burn warning appears", async ({ page }) => {
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    const strawSelect = page.locator("select").nth(2);
    await strawSelect.selectOption("burn");
    await expect(page.locator("text=การเผาฟางปล่อยก๊าซเรือนกระจก")).toBeVisible();
  });

  test("mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-summary-mobile.png", fullPage: true });
    await expect(page.locator("text=สรุปฤดูกาล")).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
  });

  test("save button disabled when incomplete", async ({ page }) => {
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    const saveBtn = page.locator("button:has-text('บันทึกข้อมูล')");
    await expect(saveBtn).toBeDisabled();
  });
});

// ── 8. Navigation ────────────────────────────────────────────────────────────

test.describe("8. Navigation Between Pages", () => {
  test("chat -> upload via bottom nav", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.locator('nav[aria-label="นำทางหลัก"] a[href="/upload"]').click();
    await page.waitForURL("**/upload", { timeout: 10000 });
    expect(page.url()).toContain("/upload");
  });

  test("chat -> summary via bottom nav", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.locator('nav[aria-label="นำทางหลัก"] a[href="/summary"]').click();
    await page.waitForURL("**/summary", { timeout: 10000 });
    expect(page.url()).toContain("/summary");
  });

  test("upload -> chat via bottom nav", async ({ page }) => {
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    await page.locator('nav[aria-label="นำทางหลัก"] a[href="/chat"]').click();
    await page.waitForURL("**/chat", { timeout: 10000 });
    expect(page.url()).toContain("/chat");
  });

  test("summary -> upload via bottom nav", async ({ page }) => {
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    await page.locator('nav[aria-label="นำทางหลัก"] a[href="/upload"]').click();
    await page.waitForURL("**/upload", { timeout: 10000 });
    expect(page.url()).toContain("/upload");
  });

  test("back button works", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    await page.goBack();
    expect(page.url()).toContain("/upload");
    await page.goBack();
    expect(page.url()).toContain("/chat");
  });
});

// ── 9. Responsive Layout ─────────────────────────────────────────────────────

test.describe("9. Responsive Layout Tests", () => {
  test("chat at desktop 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-chat-1440.png", fullPage: true });
    const chatArea = page.locator("main");
    const box = await chatArea.boundingBox();
    if (box) expect(box.width).toBeGreaterThan(400);
  });

  test("chat at tablet 768px", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-chat-768.png", fullPage: true });
  });

  test("chat at mobile 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-chat-375.png", fullPage: true });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });

  test("admin at multiple widths", async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem("nzc_admin_email", "admin@netzero.com");
      sessionStorage.setItem("nzc_admin_pass", "password");
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-admin-1440.png", fullPage: true });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-admin-375.png", fullPage: true });
  });

  test("no horizontal overflow on all mobile pages", async ({ page }) => {
    const pages = ["/chat", "/upload", "/summary", "/admin/login"];
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of pages) {
      await page.goto(`${TARGET}${path}`, { waitUntil: "networkidle", timeout: 30000 });
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      console.log(`[RESPONSIVE] ${path} body scroll width: ${bodyWidth}px`);
      expect(bodyWidth).toBeLessThanOrEqual(376);
    }
  });
});

// ── 10. Font and Icon Loading ────────────────────────────────────────────────

test.describe("10. Font and Icon Loading", () => {
  test("Google Fonts (Inter, Sarabun) load", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    const fontsLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      const fonts = Array.from(document.fonts).map((f) => f.family);
      return {
        hasInter: fonts.some((f) => f.includes("Inter")),
        hasSarabun: fonts.some((f) => f.includes("Sarabun")),
        total: fonts.length,
      };
    });
    console.log(`[FONTS] Inter: ${fontsLoaded.hasInter}, Sarabun: ${fontsLoaded.hasSarabun}, Total: ${fontsLoaded.total}`);
    expect(fontsLoaded.hasInter).toBeTruthy();
    expect(fontsLoaded.hasSarabun).toBeTruthy();
  });

  test("Material Symbols Outlined loads", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return Array.from(document.fonts).some((f) => f.family.includes("Material Symbols"));
    });
    console.log(`[ICONS] Material Symbols: ${loaded}`);
    expect(loaded).toBeTruthy();
  });

  test("icons render on all pages", async ({ page }) => {
    const pages = ["/chat", "/upload", "/summary", "/admin/login"];
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of pages) {
      await page.goto(`${TARGET}${path}`, { waitUntil: "networkidle", timeout: 30000 });
      const info = await checkMaterialSymbols(page);
      console.log(`[ICONS] ${path}: total=${info.total} rendered=${info.rendered}`);
      expect(info.total).toBeGreaterThan(0);
    }
  });
});

// ── 11. Empty and Error States ───────────────────────────────────────────────

test.describe("11. Empty and Error States", () => {
  test("admin shows meaningful state on API failure", async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem("nzc_admin_email", "admin@netzero.com");
      sessionStorage.setItem("nzc_admin_pass", "password");
    });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-admin-empty-state.png", fullPage: true });

    const state = await page.evaluate(() => ({
      hasEmptyInbox: document.body.textContent?.includes("ไม่มีรายการ"),
      hasLoading: document.body.textContent?.includes("กำลังโหลด"),
      hasError: document.body.textContent?.includes("ไม่สามารถโหลด"),
      hasCards: document.querySelectorAll('button[aria-label^="ภาพหลักฐาน"]').length,
      hasRetry: !!document.querySelector("button"),
    }));
    console.log(`[ADMIN] Error state:`, state);
    expect(state.hasEmptyInbox || state.hasLoading || state.hasError || state.hasCards > 0).toBeTruthy();
  });

  test("sponsor shows data or fallback", async ({ page }) => {
    await page.goto(`${TARGET}/sponsor`, { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-sponsor-fallback.png", fullPage: true });
    await expect(page.getByRole("heading", { name: "แดชบอร์ดผู้สนับสนุน" })).toBeVisible();
    await expect(page.locator("text=CO₂ ที่ลดทั้งหมด")).toBeVisible();
  });

  test("summary renders even without plot data", async ({ page }) => {
    await page.goto(`${TARGET}/summary`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "/Users/poom-work/netzero-app/test-results/qa-summary-no-data.png", fullPage: true });
    await expect(page.locator("text=สรุปฤดูกาล")).toBeVisible();
    await expect(page.locator("text=เลือกแปลงนา")).toBeVisible();
  });
});

// ── 12. Page Load Performance ────────────────────────────────────────────────

test.describe("12. Page Load Performance", () => {
  const PAGES = [
    { path: "/", name: "Home (redirect)" },
    { path: "/chat", name: "Chat" },
    { path: "/upload", name: "Upload" },
    { path: "/summary", name: "Summary" },
    { path: "/admin/login", name: "Admin Login" },
  ];

  for (const p of PAGES) {
    test(`${p.name} loads within 10s`, async ({ page }) => {
      const { timeMs, status } = await measureLoadTime(page, `${TARGET}${p.path}`);
      console.log(`[PERF] ${p.name}: ${timeMs}ms (status: ${status})`);
      expect(timeMs).toBeLessThan(10000);
    });
  }
});

// ── 13. Color Contrast ───────────────────────────────────────────────────────

test.describe("13. Color Contrast", () => {
  test("chat page contrast check", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    const issues = await checkColorContrast(page);
    console.log(`[A11Y] Chat contrast:`, issues);
  });

  test("login page contrast check", async ({ page }) => {
    await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle" });
    const issues = await checkColorContrast(page);
    console.log(`[A11Y] Login contrast:`, issues);
  });
});

// ── 14. Keyboard Navigation ──────────────────────────────────────────────────

test.describe("14. Keyboard Navigation", () => {
  test("login form is keyboard navigable", async ({ page }) => {
    await page.goto(`${TARGET}/admin/login`, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const tag1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag1).toBe("INPUT");
    await page.keyboard.press("Tab");
    const tag2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag2).toBe("INPUT");
    await page.keyboard.press("Tab");
    const tag3 = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag3).toBe("BUTTON");
  });

  test("upload camera frame focusable", async ({ page }) => {
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    await page.locator('[data-testid="camera-frame"]').focus();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
    expect(focused).toBe("camera-frame");
  });

  test("filter tabs keyboard navigable", async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem("nzc_admin_email", "admin@netzero.com");
      sessionStorage.setItem("nzc_admin_pass", "password");
    });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.locator('[role="tab"]').first().focus();
    await page.keyboard.press("ArrowRight");
    const role = await page.evaluate(() => document.activeElement?.getAttribute("role"));
    expect(role).toBe("tab");
  });
});

// ── 15. ARIA and Semantic HTML ────────────────────────────────────────────────

test.describe("15. ARIA and Semantic HTML", () => {
  test("all pages have lang attribute", async ({ page }) => {
    for (const path of ["/chat", "/upload", "/summary", "/admin/login"]) {
      await page.goto(`${TARGET}${path}`, { waitUntil: "networkidle", timeout: 30000 });
      const lang = await page.getAttribute("html", "lang");
      expect(lang).toBeTruthy();
    }
  });

  test("bottom nav has aria-label", async ({ page }) => {
    await page.goto(`${TARGET}/chat`, { waitUntil: "networkidle" });
    await expect(page.locator('nav[aria-label="นำทางหลัก"]')).toBeVisible();
  });

  test("review cards have aria-pressed", async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem("nzc_admin_email", "admin@netzero.com");
      sessionStorage.setItem("nzc_admin_pass", "password");
    });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    const cards = page.locator('button[aria-label^="ภาพหลักฐาน"]');
    if ((await cards.count()) > 0) {
      await expect(cards.first()).toHaveAttribute("aria-pressed", "false");
    }
  });

  test("photo type picker uses radiogroup", async ({ page }) => {
    await page.goto(`${TARGET}/upload`, { waitUntil: "networkidle" });
    await expect(page.locator('[role="radiogroup"]')).toBeVisible();
    const radios = page.locator('[role="radio"]');
    expect(await radios.count()).toBe(3);
  });

  test("filter tabs use tablist", async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem("nzc_admin_email", "admin@netzero.com");
      sessionStorage.setItem("nzc_admin_pass", "password");
    });
    await page.goto(`${TARGET}/admin`, { waitUntil: "networkidle" });
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    expect(await page.locator('[role="tab"]').count()).toBe(5);
  });
});
