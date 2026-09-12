/**
 * LIFF Calendar API — returns 9-step season calendar for a given season_input_id.
 *
 * Used by the LIFF calendar page to display the farming schedule.
 */

const PHOTO_STEP_CODES = ["SG-04", "SG-05", "SG-07", "SG-08"];

export interface CalendarStep {
  id: string;
  step_code: string;
  step_name: string;
  due_day: number;
  due_date: string;
  status: string;
  photo_evidence_id: string | null;
  completed_at: string | null;
  requires_photo: boolean;
}

export interface CalendarResult {
  steps: CalendarStep[];
}

/**
 * Get calendar steps for a season, sorted by due_day ascending.
 */
export async function handleLiffCalendar(
  db: D1Database,
  seasonInputId: string,
): Promise<CalendarResult> {
  const { results } = await db
    .prepare(
      `SELECT id, step_code, step_name, due_day, due_date, status, photo_evidence_id, completed_at
       FROM season_steps
       WHERE season_input_id = ?
       ORDER BY due_day ASC`
    )
    .bind(seasonInputId)
    .all<{
      id: string;
      step_code: string;
      step_name: string;
      due_day: number;
      due_date: string;
      status: string;
      photo_evidence_id: string | null;
      completed_at: string | null;
    }>();

  const steps: CalendarStep[] = results.map((r) => ({
    ...r,
    requires_photo: PHOTO_STEP_CODES.includes(r.step_code),
  }));

  return { steps };
}
