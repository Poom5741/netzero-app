/**
 * Season creation — creates a new season record with sow_date
 * and generates the 9-step calendar.
 */

import { generateSeasonSteps, type SeasonStep } from "./calendar";

export interface SeasonCreateInput {
  plot_id: string;
  sow_date: string;
  rice_variety?: string;
  rice_age_days?: number;
}

export interface SeasonCreateResult {
  success: boolean;
  season_input_id?: string;
  steps?: SeasonStep[];
  error?: string;
}

export interface StepCompleteResult {
  success: boolean;
  error?: string;
}

/**
 * Create a new season with sow_date and generate the 9-step calendar.
 *
 * 1. Validate inputs
 * 2. Check plot exists
 * 3. Insert season_inputs record
 * 4. Generate and insert 9 season_steps
 * 5. Return the season_input_id and steps
 */
export async function handleSeasonCreate(
  db: D1Database,
  input: SeasonCreateInput,
): Promise<SeasonCreateResult> {
  // Validate required fields
  if (!input.plot_id?.trim()) {
    return { success: false, error: "plot_id is required" };
  }
  if (!input.sow_date?.trim()) {
    return { success: false, error: "sow_date is required" };
  }

  // Validate sow_date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.sow_date)) {
    return { success: false, error: "sow_date must be YYYY-MM-DD format" };
  }

  // Check plot exists
  const plot = await db
    .prepare("SELECT id FROM plots WHERE id = ?")
    .bind(input.plot_id)
    .first<{ id: string }>();
  if (!plot) {
    return { success: false, error: "Plot not found" };
  }

  // Create season_inputs record
  const seasonInputId = `si_${crypto.randomUUID()}`;
  const riceAgeDays = input.rice_age_days ?? 120;

  await db
    .prepare(
      `INSERT INTO season_inputs (
        id, plot_id, season_id, rice_variety, sow_date, rice_age_days, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    )
    .bind(
      seasonInputId,
      input.plot_id,
      `season_${input.plot_id}_${input.sow_date}`,
      input.rice_variety ?? null,
      input.sow_date,
      riceAgeDays,
    )
    .run();

  // Generate 9-step calendar
  const steps = generateSeasonSteps(seasonInputId, input.sow_date, riceAgeDays);

  // Insert all steps
  for (const step of steps) {
    await db
      .prepare(
        `INSERT INTO season_steps (
          id, season_input_id, step_code, step_name, due_day, due_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        `ss_${crypto.randomUUID()}`,
        step.season_input_id,
        step.step_code,
        step.step_name,
        step.due_day,
        step.due_date,
        step.status,
      )
      .run();
  }

  return {
    success: true,
    season_input_id: seasonInputId,
    steps,
  };
}

/**
 * Mark a season step as completed, optionally linking a photo.
 */
export async function handleStepComplete(
  db: D1Database,
  stepId: string,
  photoEvidenceId: string | undefined,
): Promise<StepCompleteResult> {
  if (!stepId?.trim()) {
    return { success: false, error: "stepId is required" };
  }

  await db
    .prepare(
      `UPDATE season_steps
       SET status = 'completed',
           photo_evidence_id = COALESCE(?, photo_evidence_id),
           completed_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(photoEvidenceId ?? null, stepId)
    .run();

  return { success: true };
}
