/**
 * Calendar API — compute calendar steps from real season_steps data.
 *
 * Replaces the hardcoded calendarSteps() in flow.ts with real data from
 * the season_steps table, computing due dates from sow_date + due_day.
 */

export interface SeasonStepRow {
  step_code: string;
  step_name: string;
  due_day: number;
  status: string; // 'pending' | 'completed' | 'overdue'
}

export interface CalendarStepComputed {
  stepCode: string;
  stepName: string;
  dueDay: number;
  status: string;
  requiresPhoto: boolean;
}

// Steps that require a photo submission
const PHOTO_STEPS = new Set(["SG-04", "SG-05", "SG-07", "SG-08"]);

/**
 * Compute calendar steps from real season_steps data.
 *
 * @param steps - Rows from the season_steps table
 * @param sowDate - ISO date string of the sowing date (e.g. "2025-06-15")
 * @param today - ISO date string for overdue calculation (defaults to now)
 * @returns Array of calendar steps with computed due days and statuses
 */
export function computeCalendarFromSeasonSteps(
  steps: SeasonStepRow[],
  sowDate: string,
  today?: string,
): CalendarStepComputed[] {
  if (!steps || steps.length === 0) return [];

  const sowDateMs = new Date(sowDate).getTime();
  const todayMs = today ? new Date(today).getTime() : Date.now();
  const daysSinceSow = Math.floor((todayMs - sowDateMs) / (1000 * 60 * 60 * 24));

  return steps.map((step) => {
    let status = step.status;

    // If still pending but past due day, mark as overdue
    if (status === "pending" && daysSinceSow > step.due_day && step.due_day > 0) {
      status = "overdue";
    }

    return {
      stepCode: step.step_code,
      stepName: step.step_name,
      dueDay: step.due_day,
      status,
      requiresPhoto: PHOTO_STEPS.has(step.step_code),
    };
  });
}

/**
 * Query season_steps from the database and compute calendar.
 * Used by flow.ts to replace the hardcoded calendarSteps().
 */
export async function fetchCalendarSteps(
  db: D1Database,
  plotId: string,
): Promise<CalendarStepComputed[]> {
  // Get the active season's season_input
  const seasonInput = await db
    .prepare(
      `SELECT si.id, si.sow_date, si.rice_age_days
       FROM season_inputs si
       JOIN seasons s ON s.id = si.season_id
       WHERE si.plot_id = ? AND s.status = 'active'
       ORDER BY si.created_at DESC
       LIMIT 1`,
    )
    .bind(plotId)
    .first<{ id: string; sow_date: string; rice_age_days: number }>();

  if (!seasonInput) {
    return [];
  }

  // Get the season steps
  const stepsResult = await db
    .prepare(
      `SELECT step_code, step_name, due_day, status
       FROM season_steps
       WHERE season_input_id = ?
       ORDER BY due_day ASC`,
    )
    .bind(seasonInput.id)
    .all<SeasonStepRow>();

  return computeCalendarFromSeasonSteps(stepsResult.results, seasonInput.sow_date);
}
