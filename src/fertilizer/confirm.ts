type DraftData = {
  plot_id: string;
  season_id: string;
  step: string;
  formula: string;
  rate_kg_per_rai: number;
};

type ConfirmResult = {
  success: boolean;
};

const LIFF_STUB = `<script>
  window.liff = window.liff || {};
  window.liff.init = window.liff.init || function(cb) { cb(); };
</script>`;

export function renderFertilizerConfirm(draft: DraftData): string {
  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<div class="fertilizer-confirm">
  <h2>ยืนยันการใส่ปุ๋ย</h2>
  <form id="confirm-form">
    <input type="hidden" name="plot_id" value="${draft.plot_id}">
    <input type="hidden" name="season_id" value="${draft.season_id}">
    <p>ขั้นตอน: ${draft.step}</p>
    <p>สูตรปุ๋ย: ${draft.formula}</p>
    <p>อัตรา: ${draft.rate_kg_per_rai} กก./ไร่</p>
    <button type="submit" class="btn-confirm">ยืนยัน</button>
    <button type="button" class="btn-edit">แก้ไข</button>
  </form>
</div>
${LIFF_STUB}
</body>
</html>`;
}

export async function confirmFertilizerDraft(
  draft: DraftData,
  db: D1Database,
): Promise<ConfirmResult> {
  const id = `fert_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  await db
    .prepare(
      `INSERT INTO fertilizer_entries (id, plot_id, season_id, step, formula, rate_kg_per_rai, confirmed)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
    )
    .bind(id, draft.plot_id, draft.season_id, draft.step, draft.formula, draft.rate_kg_per_rai)
    .run();

  return { success: true };
}
