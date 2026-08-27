import { describe, expect, it } from "vitest";
import { renderPlotList } from "../../src/liff/plot-selection";

describe("renderPlotList", () => {
  it("returns HTML with plot cards for each plot", () => {
    const plots = [
      { id: "p1", plot_code: "ABC-001", area_rai: 10.5, deed_no: "12345" },
      { id: "p2", plot_code: "ABC-002", area_rai: 5.0, deed_no: "67890" },
    ];
    const html = renderPlotList(plots);
    expect(html).toContain("ABC-001");
    expect(html).toContain("ABC-002");
    expect(html).toContain("10.5");
    expect(html).toContain("5");
  });

  it("includes data-plot-id attribute for selection", () => {
    const plots = [{ id: "p1", plot_code: "X-001", area_rai: 2, deed_no: "1" }];
    const html = renderPlotList(plots);
    expect(html).toContain('data-plot-id="p1"');
  });

  it("returns empty state message when no plots", () => {
    const html = renderPlotList([]);
    expect(html).toContain("ยังไม่มีแปลง");
  });

  it("includes LIFF init script stub", () => {
    const html = renderPlotList([]);
    expect(html).toContain("liff.init");
  });
});
