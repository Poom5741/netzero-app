import { Hono } from "hono";
import { estimatesToCSV, getAllEstimates } from "../export/estimates";

type Bindings = {
  DB: D1Database;
};

export const exportRoutes = new Hono<{ Bindings: Bindings }>();

exportRoutes.get("/estimates", async (c) => {
  const db = c.env.DB;
  const format = c.req.query("format") ?? "json";
  const estimates = await getAllEstimates(db);

  if (format === "csv") {
    const csv = estimatesToCSV(estimates);
    return new Response(csv, {
      headers: { "content-type": "text/csv; charset=utf-8" },
    });
  }

  return c.json({ estimates });
});
