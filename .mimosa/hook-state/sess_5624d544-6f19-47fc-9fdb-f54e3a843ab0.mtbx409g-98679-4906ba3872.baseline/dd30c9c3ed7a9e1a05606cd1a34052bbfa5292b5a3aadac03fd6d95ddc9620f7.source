import { describe, expect, it } from "vitest";
import { validateTemporal } from "../../src/season/temporal-validation";

const windows = {
  prepare: { start: new Date("2025-04-01"), end: new Date("2025-05-15") },
  grow:    { start: new Date("2025-05-01"), end: new Date("2025-09-15") },
  harvest: { start: new Date("2025-08-15"), end: new Date("2025-10-15") },
};

describe("validateTemporal", () => {
  it("returns valid when timestamp is within phase window", () => {
    const result = validateTemporal({
      photo_timestamp: new Date("2025-04-20"),
      photo_type: "prepare",
      phase_windows: windows,
    });
    expect(result.status).toBe("valid");
  });

  it("returns invalid when timestamp is outside phase window", () => {
    const result = validateTemporal({
      photo_timestamp: new Date("2025-07-01"),
      photo_type: "prepare",
      phase_windows: windows,
    });
    expect(result.status).toBe("invalid");
    expect(result.reason).toContain("prepare");
  });

  it("returns unknown when photo_timestamp is null", () => {
    const result = validateTemporal({
      photo_timestamp: null,
      photo_type: "grow",
      phase_windows: windows,
    });
    expect(result.status).toBe("unknown");
    expect(result.reason).toBe("EXIF missing");
  });

  it("returns invalid for unknown photo_type", () => {
    const result = validateTemporal({
      photo_timestamp: new Date("2025-06-01"),
      photo_type: "planting",
      phase_windows: windows,
    });
    expect(result.status).toBe("invalid");
    expect(result.reason).toContain("planting");
  });

  it("valid at exact start boundary", () => {
    const result = validateTemporal({
      photo_timestamp: new Date("2025-04-01"),
      photo_type: "prepare",
      phase_windows: windows,
    });
    expect(result.status).toBe("valid");
  });

  it("valid at exact end boundary", () => {
    const result = validateTemporal({
      photo_timestamp: new Date("2025-05-15"),
      photo_type: "prepare",
      phase_windows: windows,
    });
    expect(result.status).toBe("valid");
  });

  it("works for harvest phase", () => {
    const result = validateTemporal({
      photo_timestamp: new Date("2025-09-01"),
      photo_type: "harvest",
      phase_windows: windows,
    });
    expect(result.status).toBe("valid");
  });
});
