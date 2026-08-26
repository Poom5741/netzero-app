/**
 * Season inputs API — save farmer season data.
 */

import { Hono } from "hono";
import { approveSeason } from "../season/approve";

type Bindings = {
  DB: D1Database;
};

export const seasonRoutes = new Hono<{ Bindings: Bindings }>();

// POST /api/season — Save season input data
seasonRoutes.post("/api/season", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<{
      plot_id: string;
      season_id: string;
      water_level_cm?: number;
      straw_mgmt?: string;
      fuel_liters?: number;
      electricity_kwh?: number;
    }>();

    // Validate required fields
    if (!body.plot_id || !body.season_id) {
      return c.json({ error: "plot_id and season_id are required" }, 400);
    }

    // Check if plot exists
    const plot = await db.prepare("SELECT id FROM plots WHERE id = ?").bind(body.plot_id).first();
    if (!plot) {
      return c.json({ error: "Plot not found" }, 404);
    }

    // Check if season_inputs already exists for this plot+season
    const existing = await db
      .prepare("SELECT id FROM season_inputs WHERE plot_id = ? AND season_id = ?")
      .bind(body.plot_id, body.season_id)
      .first<{ id: string }>();

    if (existing) {
      // Update existing record
      await db
        .prepare(
          `UPDATE season_inputs SET
            water_pre_plant = COALESCE(?, water_pre_plant),
            straw_management = COALESCE(?, straw_management),
            fuel_liters_per_rai = COALESCE(?, fuel_liters_per_rai),
            electricity_kwh_per_rai = COALESCE(?, electricity_kwh_per_rai),
            status = 'open'
          WHERE id = ?`
        )
        .bind(
          body.water_level_cm ?? null,
          body.straw_mgmt ?? null,
          body.fuel_liters ?? null,
          body.electricity_kwh ?? null,
          existing.id
        )
        .run();

      return c.json({ success: true, id: existing.id, action: "updated" });
    } else {
      // Insert new record
      const id = `season_${crypto.randomUUID()}`;
      await db
        .prepare(
          `INSERT INTO season_inputs (
            id, plot_id, season_id, water_pre_plant, straw_management,
            fuel_liters_per_rai, electricity_kwh_per_rai, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`
        )
        .bind(
          id,
          body.plot_id,
          body.season_id,
          body.water_level_cm ?? null,
          body.straw_mgmt ?? null,
          body.fuel_liters ?? null,
          body.electricity_kwh ?? null
        )
        .run();

      return c.json({ success: true, id, action: "created" });
    }
  } catch (err) {
    console.error("Season save error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /api/season/:plotId/:seasonId — Get season input data
seasonRoutes.get("/api/season/:plotId/:seasonId", async (c) => {
  try {
    const db = c.env.DB;
    const plotId = c.req.param("plotId");
    const seasonId = c.req.param("seasonId");

    const record = await db
      .prepare("SELECT * FROM season_inputs WHERE plot_id = ? AND season_id = ?")
      .bind(plotId, seasonId)
      .first();

    if (!record) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json(record);
  } catch (err) {
    console.error("Season fetch error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/season/approve — Approve a season (gate check)
seasonRoutes.post("/api/season/approve", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<{ plot_id?: string; season_id?: string }>();

    if (!body.plot_id || !body.season_id) {
      return c.json({ success: false, error: "plot_id and season_id required" }, 400);
    }

    const result = await approveSeason(db, body.plot_id, body.season_id);

    if (result.success) {
      return c.json({ success: true, estimateId: result.estimateId });
    }

    return c.json({ success: false, error: result.error, missing: result.missing }, 400);
  } catch (err) {
    console.error("Season approve error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});
