type Plot = {
  id: string;
  plot_code: string;
  area_rai: number;
  deed_no: string;
};

export interface PlotCardData {
  id: string;
  plotCode: string;
  areaRai: number;
  variety: string;
  photosApproved: number;
  photosTotal: number;
}

const LIFF_STUB = `<script>\n  window.liff = window.liff || {};\n  window.liff.init = window.liff.init || function(cb) { cb(); };\n</script>`;

export function renderPlotList(plots: Plot[]): string {
  if (plots.length === 0) {
    return `<div class="empty-state"><p>ยังไม่มีแปลง</p></div>${LIFF_STUB}`;
  }

  const cards = plots
    .map(
      (p) =>
        `<div class="plot-card" data-plot-id="${p.id}">
          <h3>${p.plot_code}</h3>
          <p>พื้นที่: ${p.area_rai} ไร่</p>
          <p>โฉนด: ${p.deed_no}</p>
        </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<div class="plot-list">${cards}</div>
${LIFF_STUB}
</body>
</html>`;
}

/**
 * Render per-plot cards with photo progress for the LIFF Fields page.
 * Shows plot code, area, variety, and photo progress (X/4).
 */
export function renderPlotCards(plots: PlotCardData[]): string {
  if (plots.length === 0) {
    return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<div class="empty-state"><p>ยังไม่มีแปลง</p></div>
${LIFF_STUB}
</body>
</html>`;
  }

  const cards = plots
    .map((p) => {
      const progressPct =
        p.photosTotal > 0 ? Math.round((p.photosApproved / p.photosTotal) * 100) : 0;
      const progressColor =
        progressPct >= 100 ? "#06c755" : progressPct >= 50 ? "#ff9800" : "#dc3545";

      return `<div class="plot-card" data-plot-id="${p.id}" style="border:1px solid #e0e0e0;border-radius:12px;padding:16px;margin-bottom:12px;background:#fff;">
          <h3 style="margin:0 0 8px 0;font-size:18px;">${p.plotCode}</h3>
          <p style="margin:0 0 4px 0;color:#666;">พื้นที่: ${p.areaRai} ไร่ · ข้าว: ${p.variety || "—"}</p>
          <div style="margin-top:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:13px;color:#333;">ภาพหลักฐาน</span>
              <span style="font-size:13px;font-weight:bold;color:${progressColor};">${p.photosApproved}/${p.photosTotal}</span>
            </div>
            <div style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${progressPct}%;background:${progressColor};border-radius:3px;"></div>
            </div>
          </div>
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:16px;background:#f5f5f5;">
<div class="plot-list">${cards}</div>
${LIFF_STUB}
</body>
</html>`;
}
