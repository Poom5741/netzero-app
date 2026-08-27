type EntryInput = {
  plot_id: string;
  season_id: string;
  step: string;
  formula: string;
  rate_kg_per_rai: number;
  is_urea: boolean;
};

export function calculatePercentN(formula: string): number {
  const parts = formula.split("-");
  return Number(parts[0]) || 0;
}

export function calculateNitrogen(rate: number, percentN: number): number {
  return (rate * percentN) / 100;
}

export async function writeFertilizerEntry(input: EntryInput, db: D1Database): Promise<void> {
  const id = `fert_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const percentN = calculatePercentN(input.formula);
  const nitrogenKg = calculateNitrogen(input.rate_kg_per_rai, percentN);

  await db
    .prepare(
      `INSERT INTO fertilizer_entries
       (id, plot_id, season_id, step, formula, rate_kg_per_rai, percent_n, nitrogen_kg_per_rai, is_urea, confirmed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    )
    .bind(
      id,
      input.plot_id,
      input.season_id,
      input.step,
      input.formula,
      input.rate_kg_per_rai,
      percentN,
      nitrogenKg,
      input.is_urea ? 1 : 0,
    )
    .run();
}
