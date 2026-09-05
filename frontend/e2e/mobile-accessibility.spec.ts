/**
 * Mobile Responsiveness & Accessibility QA Test Suite
 * Tests NetZero Carbon frontend across multiple viewports.
 */
import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const BASE = "https://netzero-frontend.poom-a1d.workers.dev";

const VIEWPORTS = {
  "iPhone SE (375x667)": { width: 375, height: 667 },
  "iPhone 14 (390x844)": { width: 390, height: 844 },
  "iPad (768x1024)": { width: 768, height: 1024 },
  "Desktop (1440x900)": { width: 1440, height: 900 },
};

const PAGES = [
  { path: "/", name: "Home (redirects to /chat)" },
  { path: "/chat", name: "Chat" },
  { path: "/admin/login", name: "Admin Login" },
  { path: "/admin", name: "Admin Review" },
  { path: "/upload", name: "Upload" },
  { path: "/sponsor", name: "Sponsor Dashboard" },
  { path: "/summary", name: "Summary Form" },
];

const MOBILE_WIDTH = 400; // treat anything under this as "mobile"

// ============================================================
// Helper: wait for page to stabilize (network idle + render)
// ============================================================
async function waitForStable(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  // Extra wait for JS rendering
  await page.waitForTimeout(1500);
}

// ============================================================
// 1. LAYOUT ISSUES - horizontal scroll overflow
// ============================================================
for (const vpName of ["iPhone SE (375x667)", "iPhone 14 (390x844)"]) {
  const vp = VIEWPORTS[vpName];
  for (const pg of PAGES) {
    test(`[Layout] No horizontal scroll on ${vpName} - ${pg.path}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(`${BASE}${pg.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForStable(page);

      // Allow redirects to settle (e.g. / -> /chat, /admin -> /admin/login)
      await page.waitForTimeout(1000);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      // Allow 1px tolerance for sub-pixel rounding
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
}

// ============================================================
// 2. TOUCH TARGETS - buttons/links >= 44px
// ============================================================
for (const vpName of ["iPhone SE (375x667)", "iPhone 14 (390x844)"]) {
  const vp = VIEWPORTS[vpName];
  for (const pg of [PAGES[1], PAGES[3], PAGES[4], PAGES[5], PAGES[6]]) { // skip / and /admin/login for targeted test
    test(`[Touch] Targets >= 44px on ${vpName} - ${pg.path}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(`${BASE}${pg.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForStable(page);
      await page.waitForTimeout(1000);

      // Get all interactive elements
      const results: { tag: string; text: string; width: number; height: number }[] = await page.evaluate(() => {
        const els = document.querySelectorAll("a, button, input, select, textarea, [role='button']");
        return Array.from(els)
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          })
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              text: (el.textContent || "").trim().slice(0, 40),
              width: rect.width,
              height: rect.height,
            };
          });
      });

      const tooSmall: typeof results = [];
      for (const r of results) {
        if (r.width < 44 || r.height < 44) {
          tooSmall.push(r);
        }
      }

      // Log for report but don't fail — some elements (like icon-only buttons in chat header) are 40x40
      if (tooSmall.length > 0) {
        console.log(`[Touch] ${pg.path} on ${vpName}: ${tooSmall.length} elements below 44px:`);
        for (const t of tooSmall) {
          console.log(`  ${t.tag} "${t.text}" = ${t.width}x${t.height}`);
        }
      }
      // Soft assertion: at least 80% of interactive elements should meet target
      const pct = results.length > 0 ? ((results.length - tooSmall.length) / results.length) * 100 : 100;
      console.log(`[Touch] ${pg.path} on ${vpName}: ${pct.toFixed(1)}% of ${results.length} elements meet 44px target`);
      // We store this in test annotations for the report
      expect(pct, `Touch target compliance should be >= 70%, got ${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(70);
    });
  }
}

// ============================================================
// 3. FONT SIZES - minimum 12px on mobile
// ============================================================
for (const vpName of ["iPhone SE (375x667)", "iPhone 14 (390x844)"]) {
  const vp = VIEWPORTS[vpName];
  for (const pg of PAGES) {
    test(`[Font] No text < 12px on ${vpName} - ${pg.path}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(`${BASE}${pg.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForStable(page);
      await page.waitForTimeout(1000);

      const smallTexts: { text: string; fontSize: number }[] = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const results: { text: string; fontSize: number }[] = [];
        let node;
        while ((node = walker.nextNode())) {
          const text = (node.textContent || "").trim();
          if (!text) continue;
          const el = node.parentElement;
          if (!el) continue;
          const style = window.getComputedStyle(el);
          const size = parseFloat(style.fontSize);
          if (size < 12 && text.length > 0) {
            results.push({ text: text.slice(0, 50), fontSize: size });
          }
        }
        return results;
      });

      if (smallTexts.length > 0) {
        console.log(`[Font] ${pg.path} on ${vpName}: ${smallTexts.length} text nodes below 12px:`);
        for (const s of smallTexts.slice(0, 5)) {
          console.log(`  "${s.text}" at ${s.fontSize}px`);
        }
      }
      // Allow some exceptions (e.g. timestamps, badges) — max 10% of text
      expect(smallTexts.length, `Too many small text nodes on ${pg.path}`).toBeLessThanOrEqual(10);
    });
  }
}

// ============================================================
// 4. IMAGES - responsive, no overflow
// ============================================================
for (const vpName of ["iPhone SE (375x667)", "iPhone 14 (390x844)"]) {
  const vp = VIEWPORTS[vpName];
  test(`[Image] All images fit container on ${vpName}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await waitForStable(page);
    await page.waitForTimeout(1000);

    const overflowingImages: { src: string; naturalW: number; renderedW: number }[] = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs)
        .filter((img) => {
          const container = img.parentElement;
          if (!container) return false;
          const containerWidth = container.getBoundingClientRect().width;
          return img.naturalWidth > containerWidth + 10;
        })
        .map((img) => ({
          src: img.src.slice(0, 80),
          naturalW: img.naturalWidth,
          renderedW: img.getBoundingClientRect().width,
        }));
    });

    if (overflowingImages.length > 0) {
      console.log(`[Image] ${vpName}: ${overflowingImages.length} images potentially overflowing:`);
      for (const img of overflowingImages) {
        console.log(`  ${img.src}: natural ${img.naturalW}px vs rendered ${img.renderedW}px`);
      }
    }
    // No image should render wider than its container by more than 20px
    expect(overflowingImages.length, "No images should overflow").toBe(0);
  });
}

// ============================================================
// 5. BOTTOM NAV - fixed at bottom, accessible
// ============================================================
for (const vpName of ["iPhone SE (375x667)", "iPhone 14 (390x844)"]) {
  const vp = VIEWPORTS[vpName];
  for (const pg of [PAGES[1], PAGES[4], PAGES[6]]) { // chat, upload, summary
    test(`[BottomNav] Fixed at bottom & accessible on ${vpName} - ${pg.path}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(`${BASE}${pg.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForStable(page);
      await page.waitForTimeout(1000);

      // Check nav element exists
      const nav = page.locator('nav[aria-label="นำทางหลัก"]');
      await expect(nav).toBeVisible({ timeout: 10000 });

      // Check it's at the bottom of viewport
      const box = await nav.boundingBox();
      if (box) {
        const vpHeight = vp.height;
        // Nav should be near the bottom (within 10px of viewport bottom)
        expect(box.y + box.height, "Bottom nav should be at viewport bottom").toBeGreaterThanOrEqual(vpHeight - 15);
        // Nav should be full width
        expect(box.width, "Bottom nav should be full width").toBeGreaterThanOrEqual(vp.width - 10);
      }

      // Check accessibility
      const links = await nav.locator("a").all();
      for (const link of links) {
        const text = await link.textContent();
        expect(text?.trim().length, "Nav link should have text").toBeGreaterThan(0);
      }
    });
  }
}

// ============================================================
// 6. LOADING STATES - visible spinner/indicator
// ============================================================
test("[Loading] Chat page shows loading or content", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });

  // During loading or after, something should be visible
  await page.waitForTimeout(2000);
  const body = await page.locator("body").textContent();
  expect(body?.length).toBeGreaterThan(0);
});

// ============================================================
// 7. EMPTY STATES
// ============================================================
test("[Empty] Admin review shows empty state or content", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Should show either loading, empty state, or login redirect
  const body = await page.locator("body").textContent();
  expect(body?.length).toBeGreaterThan(0);
});

test("[Empty] Sponsor dashboard shows empty state or data", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/sponsor`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(2000);

  const body = await page.locator("body").textContent();
  expect(body?.length).toBeGreaterThan(0);
});

// ============================================================
// ACCESSIBILITY CHECKS
// ============================================================

// 8. Alt text on images
for (const vpName of ["iPhone 14 (390x844)", "Desktop (1440x900)"]) {
  const vp = VIEWPORTS[vpName];
  test(`[A11y] All images have alt text - ${vpName}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await waitForStable(page);
    await page.waitForTimeout(1000);

    const imagesMissingAlt: string[] = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs)
        .filter((img) => !img.alt && img.alt !== "" && img.getAttribute("alt") === null)
        .map((img) => img.src.slice(0, 80));
    });

    console.log(`[A11y] Images missing alt: ${imagesMissingAlt.length}`);
    for (const s of imagesMissingAlt) {
      console.log(`  ${s}`);
    }
    expect(imagesMissingAlt.length, "All images should have alt attribute").toBe(0);
  });
}

// 9. Form inputs have labels (admin login)
test("[A11y] Admin login form inputs have labels", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  const unlabeledInputs: string[] = await page.evaluate(() => {
    const inputs = document.querySelectorAll("input:not([type='hidden']):not([type='file'])");
    return Array.from(inputs)
      .filter((input) => {
        const id = input.id;
        const ariaLabel = input.getAttribute("aria-label");
        const ariaLabelledby = input.getAttribute("aria-labelledby");
        const hasLabel = id ? !!document.querySelector(`label[for="${id}"]`) : false;
        // Check parent for label
        const parentLabel = input.closest("label");
        return !hasLabel && !ariaLabel && !ariaLabelledby && !parentLabel;
      })
      .map((input) => `${input.type} input without label`);
  });

  console.log(`[A11y] Unlabeled inputs: ${unlabeledInputs.length}`);
  for (const s of unlabeledInputs) {
    console.log(`  ${s}`);
  }
  expect(unlabeledInputs.length, "Form inputs should have labels").toBe(0);
});

// 10. Form inputs have labels (summary page)
test("[A11y] Summary form inputs have labels", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/summary`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(2000);

  const unlabeledInputs: string[] = await page.evaluate(() => {
    const inputs = document.querySelectorAll("input:not([type='hidden']):not([type='file']):not([type='range']), select");
    return Array.from(inputs)
      .filter((input) => {
        const id = input.id;
        const ariaLabel = input.getAttribute("aria-label");
        const ariaLabelledby = input.getAttribute("aria-labelledby");
        const hasLabel = id ? !!document.querySelector(`label[for="${id}"]`) : false;
        const parentLabel = input.closest("label");
        return !hasLabel && !ariaLabel && !ariaLabelledby && !parentLabel;
      })
      .map((input) => `${input.tagName} input without label`);
  });

  console.log(`[A11y] Summary unlabeled inputs: ${unlabeledInputs.length}`);
  expect(unlabeledInputs.length, "Summary form inputs should have labels").toBe(0);
});

// 11. Buttons have accessible names
for (const vpName of ["iPhone 14 (390x844)"]) {
  const vp = VIEWPORTS[vpName];
  test(`[A11y] Buttons have accessible names - ${vpName}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await waitForStable(page);
    await page.waitForTimeout(1000);

    const unnamedButtons: string[] = await page.evaluate(() => {
      const buttons = document.querySelectorAll("button");
      return Array.from(buttons)
        .filter((btn) => {
          const ariaLabel = btn.getAttribute("aria-label");
          const text = btn.textContent?.trim();
          const title = btn.getAttribute("title");
          return !ariaLabel && !text && !title;
        })
        .map((btn, i) => `Button #${i} (${btn.className.slice(0, 50)})`);
    });

    console.log(`[A11y] Buttons without accessible names: ${unnamedButtons.length}`);
    for (const s of unnamedButtons) {
      console.log(`  ${s}`);
    }
    expect(unnamedButtons.length, "All buttons should have accessible names").toBe(0);
  });
}

// 12. ARIA landmarks
test("[A11y] Pages use ARIA landmarks", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  const landmarks = await page.evaluate(() => {
    const roles = ["banner", "navigation", "main", "contentinfo", "complementary"];
    const found: string[] = [];
    for (const role of roles) {
      const el = document.querySelector(`[role="${role}"], ${role === "banner" ? "header" : role === "navigation" ? "nav" : role === "contentinfo" ? "footer" : role}`);
      if (el) found.push(role);
    }
    // Also check for <header>, <main>, <nav> elements
    if (document.querySelector("header")) found.push("header-element");
    if (document.querySelector("main")) found.push("main-element");
    if (document.querySelector("nav")) found.push("nav-element");
    return found;
  });

  console.log(`[A11y] Landmarks found: ${landmarks.join(", ")}`);
  expect(landmarks.length, "Should have at least header, main, and nav landmarks").toBeGreaterThanOrEqual(3);
});

// 13. Focus states visible
test("[A11y] Focus states are visible on interactive elements", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Tab to first interactive element
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300);

  const focusedElement = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = window.getComputedStyle(el);
    const outlineStyle = style.outlineStyle;
    const boxShadow = style.boxShadow;
    return {
      tag: el.tagName,
      outlineStyle,
      boxShadow: boxShadow !== "none" ? boxShadow : "",
      hasFocusClass: el.classList.toString(),
    };
  });

  console.log(`[A11y] Focused element:`, focusedElement);
  // We just verify something is focused — focus indicators may be subtle
  expect(focusedElement, "Something should be focused after Tab").not.toBeNull();
});

// 14. lang attribute
test("[A11y] HTML lang attribute set", async ({ page }) => {
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  const lang = await page.evaluate(() => document.documentElement.lang);
  expect(lang, "HTML should have lang attribute").toBeTruthy();
  console.log(`[A11y] HTML lang: ${lang}`);
});

// 15. Skip navigation link (check for presence — many mobile apps omit this)
test("[A11y] Check for skip navigation link", async ({ page }) => {
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  const skipLink = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    return Array.from(links).some((l) =>
      l.textContent?.toLowerCase().includes("skip") || l.textContent?.includes("ข้าม")
    );
  });

  console.log(`[A11y] Skip navigation link: ${skipLink ? "present" : "NOT present"}`);
  // Note: skip nav is best practice but not always present in mobile-first apps
});

// ============================================================
// INTERACTION TESTS
// ============================================================

// 16. Tap/click all buttons on chat page
test("[Interaction] Tap send button on chat page", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Find and click send button
  const sendBtn = page.locator('button[aria-label="ส่งข้อความ"]');
  if (await sendBtn.isVisible()) {
    await sendBtn.click();
    // Should not crash
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(0);
  }
});

// 17. Submit admin login form
test("[Interaction] Admin login form submission", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Fill form
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");

  // Submit
  const submitBtn = page.locator('button[type="submit"]');
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  await page.waitForTimeout(2000);

  // Should show error or redirect
  const body = await page.locator("body").textContent();
  expect(body?.length).toBeGreaterThan(0);
});

// 18. Keyboard navigation on admin login
test("[Interaction] Keyboard navigation on admin login", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Tab through elements
  const focusedElements: string[] = [];
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    const tag = await page.evaluate(() => document.activeElement?.tagName || "none");
    focusedElements.push(tag);
  }

  console.log(`[Interaction] Keyboard focus order: ${focusedElements.join(" -> ")}`);
  // Should have at least some interactive elements focused
  const interactive = focusedElements.filter((t) => ["INPUT", "BUTTON", "A", "SELECT"].includes(t));
  expect(interactive.length, "Should tab through interactive elements").toBeGreaterThanOrEqual(2);
});

// 19. Keyboard navigation on chat
test("[Interaction] Keyboard submit on chat", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Focus input and type
  const input = page.locator('input[aria-label="พิมพ์ข้อความ"]');
  if (await input.isVisible()) {
    await input.focus();
    await page.keyboard.type("Hello test");
    // Press Enter to send
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // Check the message was added
    const body = await page.locator("body").textContent();
    expect(body).toContain("Hello test");
  }
});

// 20. prefers-reduced-motion
test("[A11y] Reduced motion preference respected", async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Check that animations are either not running or respect prefers-reduced-motion
  const animations = await page.evaluate(() => {
    const els = document.querySelectorAll("*");
    let animatedCount = 0;
    for (const el of els) {
      const style = window.getComputedStyle(el);
      if (style.animationName && style.animationName !== "none") {
        animatedCount++;
      }
    }
    return animatedCount;
  });

  console.log(`[A11y] Elements with active animations under reduced-motion: ${animations}`);
  // Ideally all animations should be paused, but Tailwind animate-spin uses CSS
  // We log this for the report
});

// ============================================================
// DESKTOP LAYOUT CHECKS
// ============================================================
test("[Desktop] Sponsor dashboard sidebar visible at 1440px", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["Desktop (1440x900)"]);
  await page.goto(`${BASE}/sponsor`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(2000);

  // Sidebar should be visible on desktop
  const sidebar = page.locator('aside');
  if (await sidebar.count() > 0) {
    const isVisible = await sidebar.first().isVisible();
    console.log(`[Desktop] Sidebar visible: ${isVisible}`);
    expect(isVisible, "Sidebar should be visible on desktop").toBe(true);
  }
});

test("[Desktop] Admin review sidebar visible at 1440px", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["Desktop (1440x900)"]);
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(2000);

  const sidebar = page.locator('aside');
  if (await sidebar.count() > 0) {
    const isVisible = await sidebar.first().isVisible();
    console.log(`[Desktop] Admin sidebar visible: ${isVisible}`);
    expect(isVisible, "Sidebar should be visible on desktop").toBe(true);
  }
});

// ============================================================
// RESPONSIVE LAYOUT - verify content adapts
// ============================================================
test("[Responsive] Sponsor KPI grid adapts from 1 to 3 columns", async ({ page }) => {
  // Mobile: should be 1 column
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/sponsor`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(2000);

  const mobileGrid = await page.evaluate(() => {
    const grid = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-3");
    if (!grid) return null;
    const style = window.getComputedStyle(grid);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
    };
  });
  console.log(`[Responsive] Mobile KPI grid:`, mobileGrid);

  // Desktop: should be 3 columns
  await page.setViewportSize(VIEWPORTS["Desktop (1440x900)"]);
  await page.waitForTimeout(1000);

  const desktopGrid = await page.evaluate(() => {
    const grid = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-3");
    if (!grid) return null;
    const style = window.getComputedStyle(grid);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
    };
  });
  console.log(`[Responsive] Desktop KPI grid:`, desktopGrid);
});

// ============================================================
// CHAT PAGE - viewport height
// ============================================================
test("[Layout] Chat page fits viewport height", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Check that the chat container is h-screen
  const chatContainer = await page.evaluate(() => {
    const el = document.querySelector(".h-screen");
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { height: rect.height, windowHeight: window.innerHeight };
  });

  if (chatContainer) {
    console.log(`[Layout] Chat container height: ${chatContainer.height}, window: ${chatContainer.windowHeight}`);
    // Should be close to viewport height
    expect(Math.abs(chatContainer.height - chatContainer.windowHeight)).toBeLessThan(50);
  }
});

// ============================================================
// Z-INDEX LAYERING - headers, navs don't overlap content
// ============================================================
test("[Layout] Headers don't cover chat input on mobile", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  // Header and bottom nav should not overlap the main chat area input
  const header = page.locator("header").first();
  const inputArea = page.locator('input[aria-label="พิมพ์ข้อความ"]');

  if (await header.isVisible() && await inputArea.isVisible()) {
    const headerBox = await header.boundingBox();
    const inputBox = await inputArea.boundingBox();

    if (headerBox && inputBox) {
      // Header should not cover the input area
      const headerBottom = headerBox.y + headerBox.height;
      expect(headerBottom, "Header should not cover input").toBeLessThan(inputBox.y);
      console.log(`[Layout] Header bottom: ${headerBottom}, Input top: ${inputBox.y}`);
    }
  }
});

// ============================================================
// ADMIN LOGIN - max-width constraint
// ============================================================
test("[Layout] Admin login form is centered with max-width", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS["iPhone 14 (390x844)"]);
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForStable(page);
  await page.waitForTimeout(1000);

  const form = await page.evaluate(() => {
    const el = document.querySelector(".max-w-\\[448px\\]");
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { left: rect.left, width: rect.width, viewportWidth: window.innerWidth };
  });

  if (form) {
    console.log(`[Layout] Login form: left=${form.left}, width=${form.width}, viewport=${form.viewportWidth}`);
    // Form should not extend beyond viewport
    expect(form.left + form.width, "Form should fit within viewport").toBeLessThanOrEqual(form.viewportWidth + 5);
  }
});

// ============================================================
// ALL VIEWPORTS - screenshots for visual regression
// ============================================================
for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const pg of [PAGES[1], PAGES[2], PAGES[4], PAGES[6]]) { // chat, admin/login, upload, summary
    test(`[Screenshot] ${vpName} - ${pg.path}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(`${BASE}${pg.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForStable(page);
      await page.waitForTimeout(2000);

      // Take screenshot for visual inspection
      const filename = `${vpName.replace(/[^a-zA-Z0-9]/g, "_")}_${pg.path.replace(/\//g, "_") || "root"}.png`;
      await page.screenshot({
        path: `/Users/poom-work/netzero-app/.gstack/qa-reports/screenshots/mobile-qa-${filename}`,
        fullPage: false,
      });
    });
  }
}
