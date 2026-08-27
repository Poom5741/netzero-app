/**
 * Issue #107 — AI Photo Verify E2E journey
 * Full verification story with AI responses mocked at the network layer.
 * Tests: farmer upload verdicts, admin review/override/promote, season gate, sponsor tallies.
 */
import { test, expect } from "@playwright/test";

test.describe("Farmer journey — mobile emulation", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("upload page shows photo type picker", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText("ประเภทรูป")).toBeVisible();
    await expect(page.getByText("เตรียมแปลง")).toBeVisible();
    await expect(page.getByText("ท่อเปียก-แห้ง")).toBeVisible();
    await expect(page.getByText("เก็บเกี่ยว")).toBeVisible();
  });

  test("refused verdict shows Thai reason and retake button", async ({ page }) => {
    // Mock upload API to return refused
    await page.route("**/api/photo/upload", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          verdict: "refused",
          reason: "ไม่พบท่อวัด กรุณาถ่ายให้เห็นท่อ",
        }),
      });
    });

    await page.goto("/upload");
    
    // Select wetdry photo type
    await page.getByText("ท่อเปียก-แห้ง").click();
    
    // Mock file input
    await page.setInputFiles('input[type="file"]', {
      name: "test.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-data"),
    });

    // Wait for preview and click upload
    await expect(page.getByText("อัปโหลด")).toBeVisible();
    await page.getByText("อัปโหลด").click();

    // Assert refused verdict UI
    await expect(page.getByTestId("verdict-refused")).toBeVisible();
    await expect(page.getByText("ไม่พบท่อวัด")).toBeVisible();
    await expect(page.getByText("ถ่ายภาพใหม่")).toBeVisible();
  });

  test("flagged verdict shows waiting message", async ({ page }) => {
    await page.route("**/api/photo/upload", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "photo_123",
          verdict: "flagged",
          photo_type: "wetdry",
          water_state: "flooded",
        }),
      });
    });

    await page.goto("/upload");
    await page.getByText("ท่อเปียก-แห้ง").click();
    await page.setInputFiles('input[type="file"]', {
      name: "test.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-data"),
    });
    await page.getByText("อัปโหลด").click();

    await expect(page.getByTestId("verdict-flagged")).toBeVisible();
    await expect(page.getByText("รอเจ้าหน้าที่ตรวจ")).toBeVisible();
  });

  test("pre-verified verdict shows success with water state", async ({ page }) => {
    await page.route("**/api/photo/upload", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "photo_456",
          verdict: "pre_verified",
          photo_type: "wetdry",
          water_state: "flooded",
          ai_confidence: 0.95,
        }),
      });
    });

    await page.goto("/upload");
    await page.getByText("ท่อเปียก-แห้ง").click();
    await page.setInputFiles('input[type="file"]', {
      name: "test.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-data"),
    });
    await page.getByText("อัปโหลด").click();

    await expect(page.getByTestId("verdict-pre_verified")).toBeVisible();
    await expect(page.getByText("ยืนยันการอัปโหลดสำเร็จ")).toBeVisible();
    await expect(page.getByText("ขั้งน้ำ")).toBeVisible();
  });
});

test.describe("Admin journey — audit handling", () => {
  test("review queue shows photos with AI badges", async ({ page }) => {
    await page.route("**/api/admin/review*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "photo_1",
            plot_id: "plot-001",
            ai_status: "flag",
            ai_label: "rice_paddy",
            ai_reason: "ภาพไม่ชัดเจน",
            ai_confidence: 0.55,
            admin_status: "pending",
            photo_url: "/placeholder.jpg",
            water_state: "flooded",
            photo_type: "wetdry",
            pre_verified: 0,
            audit_sample: 0,
          },
          {
            id: "photo_2",
            plot_id: "plot-002",
            ai_status: "pass",
            ai_label: "rice_paddy",
            ai_reason: "เห็นน้ำขังชัดเจน",
            ai_confidence: 0.95,
            admin_status: "pending",
            photo_url: "/placeholder.jpg",
            water_state: "dry",
            photo_type: "wetdry",
            pre_verified: 1,
            audit_sample: 1,
          },
        ]),
      });
    });

    await page.goto("/admin");
    
    // Assert queue is visible
    await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();
    
    // Assert photos are shown
    await expect(page.getByText("plot-001")).toBeVisible();
    await expect(page.getByText("plot-002")).toBeVisible();
    
    // Assert audit badge is visible
    await expect(page.getByText("ตรวจตัวอย่าง")).toBeVisible();
  });

  test("admin can approve a photo", async ({ page }) => {
    let reviewCalled = false;
    
    await page.route("**/api/admin/review*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "photo_1",
              plot_id: "plot-001",
              ai_status: "flag",
              ai_label: null,
              ai_reason: "ภาพไม่ชัดเจน",
              ai_confidence: 0.55,
              admin_status: "pending",
              photo_url: "/placeholder.jpg",
              water_state: null,
              photo_type: "wetdry",
              pre_verified: 0,
              audit_sample: 0,
            },
          ]),
        });
      } else if (route.request().method() === "POST") {
        reviewCalled = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      }
    });

    await page.goto("/admin");
    
    // Click on photo to select
    await page.getByText("plot-001").click();
    
    // Click approve button
    await page.getByText("อนุมัติ").click();
    
    // Assert review was called
    expect(reviewCalled).toBe(true);
  });

  test("admin can reject a photo with reason", async ({ page }) => {
    await page.route("**/api/admin/review*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "photo_1",
              plot_id: "plot-001",
              ai_status: "flag",
              ai_label: null,
              ai_reason: "ภาพไม่ชัดเจน",
              ai_confidence: 0.55,
              admin_status: "pending",
              photo_url: "/placeholder.jpg",
              water_state: null,
              photo_type: "wetdry",
              pre_verified: 0,
              audit_sample: 0,
            },
          ]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      }
    });

    await page.goto("/admin");
    await page.getByText("plot-001").click();
    
    // Click reject button
    await page.getByText("ปฏิเสธ").click();
    
    // Fill in reason
    await page.getByPlaceholder("กรุณาระบุเหตุผล...").fill("ภาพไม่ชัดเจน");
    
    // Confirm rejection
    await page.getByText("ยืนยันการปฏิเสธ").click();
    
    // Modal should close
    await expect(page.getByText("ยืนยันการปฏิเสธ")).not.toBeVisible();
  });

  test("admin can override a pre-verified photo", async ({ page }) => {
    await page.route("**/api/admin/review*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "photo_pv_1",
              plot_id: "plot-003",
              ai_status: "pass",
              ai_label: "rice_paddy",
              ai_reason: "เห็นน้ำขังชัดเจน",
              ai_confidence: 0.95,
              admin_status: "pending",
              photo_url: "/placeholder.jpg",
              water_state: "flooded",
              photo_type: "wetdry",
              pre_verified: 1,
              audit_sample: 1,
            },
          ]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      }
    });

    await page.goto("/admin");
    
    // Select the pre-verified audit photo
    await page.getByText("plot-003").click();
    
    // Detail panel should show
    await expect(page.getByText("รายละเอียด")).toBeVisible();
    
    // Override by rejecting
    await page.getByText("ปฏิเสธ").click();
    await page.getByPlaceholder("กรุณาระบุเหตุผล...").fill("ภาพไม่ชัดเจน");
    await page.getByText("ยืนยันการปฏิเสธ").click();
    
    // Should succeed
    await expect(page.getByText("ยืนยันการปฏิเสธ")).not.toBeVisible();
  });
});

test.describe("Season gate — block/approve journey", () => {
  test("gate blocks incomplete season", async ({ page }) => {
    await page.route("**/api/admin/review*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/season/approve*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "incomplete",
          missing: ["wetdry photo", "harvest photo"],
        }),
      });
    });

    await page.goto("/admin");
    
    // Season gate section should be visible
    await expect(page.getByText("สถานะฤดูกาล")).toBeVisible();
    
    // Try to approve
    await page.getByText("อนุมัติฤดูกาล").click();
    
    // Should show error
    await expect(page.getByText("ไม่ผ่านการอนุมัติ")).toBeVisible();
    await expect(page.getByText("wetdry photo")).toBeVisible();
  });

  test("gate approves complete season", async ({ page }) => {
    await page.route("**/api/admin/review*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/season/approve*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          estimateId: "est_123",
        }),
      });
    });

    await page.goto("/admin");
    await page.getByText("อนุมัติฤดูกาล").click();
    
    // Should show success
    await expect(page.getByText("อนุมัติสำเร็จ")).toBeVisible();
  });
});

test.describe("Sponsor tally/provenance — visible in browser", () => {
  test("sponsor page shows water-state tallies", async ({ page }) => {
    await page.route("**/sponsor*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            province: "พระนครศรีอยุธยา",
            plots: [
              {
                plot_id: "plot-001",
                plot_code: "AY-001",
                area_rai: 15,
                farmer_name: "สมชาย วงศ์สุข",
                province: "พระนครศรีอยุธยา",
                district: "พระนครศรีอยุธยา",
                total_offset_tco2e: 12.5,
                latest_season_id: "2568-napi",
                estimate_status: "verified",
                water_state_tallies: { flooded: 3, dry: 2 },
                provenance_counts: { machine: 4, human: 1 },
              },
            ],
          },
        ]),
      });
    });

    await page.goto("/sponsor");
    
    // Assert province is visible
    await expect(page.getByText("พระนครศรีอยุธยา")).toBeVisible();
    
    // Assert plot is visible
    await expect(page.getByText("AY-001")).toBeVisible();
    
    // Assert water-state tallies are visible
    await expect(page.getByText("น้ำขัง: 3")).toBeVisible();
    await expect(page.getByText("แห้ง: 2")).toBeVisible();
    
    // Assert provenance is visible
    await expect(page.getByText("AI: 4")).toBeVisible();
    await expect(page.getByText("มนุษย์: 1")).toBeVisible();
  });

  test("sponsor page handles missing tallies gracefully", async ({ page }) => {
    await page.route("**/sponsor*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            province: "เชียงใหม่",
            plots: [
              {
                plot_id: "plot-002",
                plot_code: "CM-001",
                area_rai: 10,
                farmer_name: "มนตรี บุญศรี",
                province: "เชียงใหม่",
                district: "เมือง",
                total_offset_tco2e: 8.3,
                latest_season_id: "2568-napi",
                estimate_status: "pending",
                water_state_tallies: { flooded: 0, dry: 0 },
                provenance_counts: { machine: 0, human: 0 },
              },
            ],
          },
        ]),
      });
    });

    await page.goto("/sponsor");
    
    // Should still render without errors
    await expect(page.getByText("เชียงใหม่")).toBeVisible();
    await expect(page.getByText("CM-001")).toBeVisible();
  });
});
