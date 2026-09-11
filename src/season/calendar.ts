/**
 * Season calendar — generates the 9-step farming calendar from sowing date.
 *
 * Each crop cycle follows this sequence:
 * SG-01: Prepare plot (day -7)
 * SG-02: Sow (day 0)
 * SG-03: Fertilize #1 (day 7)
 * SG-04: Photo WET-1 (day 28) — camera required
 * SG-05: Photo DRY-1 (day 42) — camera required
 * SG-06: Fertilize #2 (day 50)
 * SG-07: Photo WET-2 (day 61) — camera required
 * SG-08: Photo DRY-2 (day 75) — camera required
 * SG-09: Harvest (day 120)
 */

export interface SeasonStep {
  season_input_id: string;
  step_code: string;
  step_name: string;
  due_day: number;
  due_date: string;
  status: "pending" | "completed" | "overdue";
  requires_photo: boolean;
}

interface CalendarEntry {
  step_code: string;
  step_name: string;
  due_day: number;
  requires_photo: boolean;
}

export const COMPLETE_CALENDAR: CalendarEntry[] = [
  { step_code: "SG-01", step_name: "เตรียมแปลง", due_day: -7, requires_photo: false },
  { step_code: "SG-02", step_name: "หว่านข้าว", due_day: 0, requires_photo: false },
  { step_code: "SG-03", step_name: "ใส่ปุ๋ยครั้งที่ 1", due_day: 7, requires_photo: false },
  { step_code: "SG-04", step_name: "ภาพรอบที่ 1 เปียก (WET-1)", due_day: 28, requires_photo: true },
  { step_code: "SG-05", step_name: "ภาพรอบที่ 1 แห้ง (DRY-1)", due_day: 42, requires_photo: true },
  { step_code: "SG-06", step_name: "ใส่ปุ๋ยครั้งที่ 2", due_day: 50, requires_photo: false },
  { step_code: "SG-07", step_name: "ภาพรอบที่ 2 เปียก (WET-2)", due_day: 61, requires_photo: true },
  { step_code: "SG-08", step_name: "ภาพรอบที่ 2 แห้ง (DRY-2)", due_day: 75, requires_photo: true },
  { step_code: "SG-09", step_name: "เก็บเกี่ยว", due_day: 120, requires_photo: false },
];

/**
 * Add days to a date string (YYYY-MM-DD) and return a new date string.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Generate the 9-step season calendar for a given sowing date.
 *
 * @param seasonInputId - The season_inputs record ID
 * @param sowDate - Sowing date in YYYY-MM-DD format
 * @param riceAgeDays - Days from sowing to harvest (default 120)
 * @returns Array of SeasonStep objects ready for DB insert
 */
export function generateSeasonSteps(
  seasonInputId: string,
  sowDate: string,
  riceAgeDays: number = 120,
): SeasonStep[] {
  return COMPLETE_CALENDAR.map((entry) => ({
    season_input_id: seasonInputId,
    step_code: entry.step_code,
    step_name: entry.step_name,
    due_day: entry.due_day,
    due_date: addDays(sowDate, entry.due_day),
    status: "pending" as const,
    requires_photo: entry.requires_photo,
  }));
}
