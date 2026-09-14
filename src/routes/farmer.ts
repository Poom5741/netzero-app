/**
 * Farmer & Plot API routes — onboarding CRUD.
 */

import { Hono } from "hono";
import { handleFarmerCreate, handlePlotCreate } from "../farmer/create";
import { requireRole } from "../auth/middleware";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const farmerRoutes = new Hono<{ Bindings: Bindings }>();

// POST /api/farmer — Create a new farmer
farmerRoutes.post("/api/farmer", async (c, next) => requireRole(["admin", "field"], c.env.SECRET)(c, next), async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<{
      full_name: string;
      phone: string;
      gender?: "male" | "female" | "unspecified";
      addr_province?: string;
      addr_district?: string;
      addr_subdistrict?: string;
      addr_village?: string;
      national_id_enc?: string;
    }>();

    const result = await handleFarmerCreate(db, body);

    if (result.success) {
      return c.json({ success: true, farmer_id: result.farmer_id });
    }

    return c.json({ success: false, error: result.error }, 400);
  } catch (err) {
    console.error("Farmer create error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// POST /api/plot — Create a new plot
farmerRoutes.post("/api/plot", async (c, next) => requireRole(["admin", "field"], c.env.SECRET)(c, next), async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<{
      farmer_id: string;
      deed_no: string;
      area_rai: number;
      doc_type?: "chanote" | "ns3k" | "spk" | "rental";
      tenure?: "owner" | "tenant" | "proxy";
      addr_province?: string;
      centroid_lat?: number;
      centroid_lng?: number;
    }>();

    const result = await handlePlotCreate(db, body);

    if (result.success) {
      return c.json({
        success: true,
        plot_id: result.plot_id,
        plot_code: result.plot_code,
      });
    }

    return c.json({ success: false, error: result.error }, 400);
  } catch (err) {
    console.error("Plot create error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});
