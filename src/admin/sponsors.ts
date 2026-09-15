/**
 * Admin sponsors management — list sponsors with area scoping.
 */

type SponsorRow = {
  id: string;
  name: string | null;
  email: string;
  areas: string | null; // JSON array
  plot_count: number;
  credit_total: number;
};

export type SponsorItem = {
  id: string;
  name: string;
  email: string;
  areas: string[];
  plot_count: number;
  credit_total: number;
};

export async function getSponsors(db: D1Database): Promise<SponsorItem[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.areas,
              COUNT(DISTINCT p.id) as plot_count,
              COALESCE(SUM(ce.total_offset_tco2e), 0) as credit_total
       FROM users u
       LEFT JOIN farmers f ON f.id = u.sponsor_id
       LEFT JOIN plots p ON p.farmer_id = f.id
       LEFT JOIN carbon_estimates ce ON ce.plot_id = p.id
       WHERE u.role = 'sponsor'
       GROUP BY u.id
       ORDER BY u.name ASC`,
    )
    .bind()
    .all<SponsorRow>();

  return (results ?? []).map((r) => {
    let areas: string[] = [];
    if (r.areas) {
      try {
        areas = JSON.parse(r.areas);
      } catch {
        areas = [];
      }
    }
    return {
      id: r.id,
      name: r.name ?? r.email,
      email: r.email,
      areas,
      plot_count: r.plot_count ?? 0,
      credit_total: r.credit_total ?? 0,
    };
  });
}
