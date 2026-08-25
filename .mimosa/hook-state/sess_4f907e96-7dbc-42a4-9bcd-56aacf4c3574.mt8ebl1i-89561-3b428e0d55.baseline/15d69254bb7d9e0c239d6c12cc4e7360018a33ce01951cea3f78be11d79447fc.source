import { Hono } from "hono";
import { getPlotDetail, getPlotsByProvince } from "../sponsor/dashboard";

type Bindings = {
  DB: D1Database;
};

export const sponsorRoutes = new Hono<{ Bindings: Bindings }>();

sponsorRoutes.get("/", async (c) => {
  const db = c.env.DB;
  const provinces = await getPlotsByProvince(db);
  return c.json({ provinces });
});

sponsorRoutes.get("/:plotId", async (c) => {
  const db = c.env.DB;
  const plotId = c.req.param("plotId");
  const detail = await getPlotDetail(db, plotId);
  if (!detail) {
    return c.json({ error: "Plot not found" }, 404);
  }
  return c.json(detail);
});
