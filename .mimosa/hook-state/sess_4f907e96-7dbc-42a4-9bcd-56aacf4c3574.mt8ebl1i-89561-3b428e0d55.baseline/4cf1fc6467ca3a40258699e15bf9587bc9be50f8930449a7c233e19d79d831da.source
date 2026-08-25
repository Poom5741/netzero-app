type Plot = {
  id: string;
  plot_code: string;
  area_rai: number;
  deed_no: string;
};

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
