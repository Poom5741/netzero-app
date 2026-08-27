interface PhaseWindow { start: Date; end: Date }
type PhaseWindows = { prepare: PhaseWindow; grow: PhaseWindow; harvest: PhaseWindow };

export function validateTemporal({
  photo_timestamp,
  photo_type,
  phase_windows,
}: {
  photo_timestamp: Date | null;
  photo_type: string;
  phase_windows: PhaseWindows;
}): { status: "valid" | "invalid" | "unknown"; reason?: string } {
  if (!photo_timestamp) return { status: "unknown", reason: "EXIF missing" };

  const window = (phase_windows as Record<string, PhaseWindow>)[photo_type];
  if (!window) return { status: "invalid", reason: `Unknown photo_type: ${photo_type}` };

  const t = photo_timestamp.getTime();
  if (t >= window.start.getTime() && t <= window.end.getTime()) {
    return { status: "valid" };
  }
  return { status: "invalid", reason: `Photo taken outside ${photo_type} phase` };
}
