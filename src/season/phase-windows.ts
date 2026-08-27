const DAY_MS = 86_400_000;

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function calculatePhaseWindows(sowDate: string) {
  const sow = new Date(sowDate);
  if (Number.isNaN(sow.getTime())) throw new Error(`Invalid sow_date: ${sowDate}`);

  const GRACE = 7;
  return {
    prepare: { start: addDays(sow, -37 - GRACE), end: addDays(sow, 7 + GRACE) },
    grow:    { start: addDays(sow,  -7 - GRACE), end: addDays(sow, 127 + GRACE) },
    harvest: { start: addDays(sow, 113 - GRACE), end: addDays(sow, 157 + GRACE) },
  };
}
