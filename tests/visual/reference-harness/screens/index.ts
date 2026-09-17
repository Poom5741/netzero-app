/**
 * Screen index — exports all screen definitions
 */

import { ADMIN_SCREENS } from "./admin";
import { LINE_OA_SCREENS } from "./line-oa";
import { SPONSOR_SCREENS } from "./sponsor";

export type { ScreenDefinition } from "./admin";
export { ADMIN_SCREENS } from "./admin";
export { LINE_OA_SCREENS } from "./line-oa";
export { SPONSOR_SCREENS } from "./sponsor";

/** All screens combined */
export const ALL_SCREENS = [...ADMIN_SCREENS, ...SPONSOR_SCREENS, ...LINE_OA_SCREENS];

/** Get total screen count */
export function getScreenCount(): {
  total: number;
  lineOa: number;
  admin: number;
  sponsor: number;
} {
  return {
    total: ALL_SCREENS.length,
    lineOa: LINE_OA_SCREENS.length,
    admin: ADMIN_SCREENS.length,
    sponsor: SPONSOR_SCREENS.length,
  };
}

/**
 * Validate that the screen inventory matches the expected #142 count.
 * Throws if the count doesn't match.
 */
export function validateInventoryCount(expectedCount: number): void {
  const actualCount = ALL_SCREENS.length;
  if (actualCount !== expectedCount) {
    throw new Error(
      `Screen inventory count mismatch: expected ${expectedCount} screens from #142 inventory, found ${actualCount}. ` +
        `Run /speckit-tasks to regenerate the screen definitions.`,
    );
  }
}

/**
 * Validate that each screen config has a valid Claude artifact ID.
 * Claude artifact IDs must match the UUID v4 format used by the design system.
 */
export function validateArtifactIds(): void {
  const invalidScreens: Array<{ screen: string; error: string }> = [];

  for (const screen of ALL_SCREENS) {
    if (!screen.artifactId) {
      invalidScreens.push({ screen: screen.name, error: "Missing artifact ID" });
      continue;
    }

    // Claude artifact IDs are UUID format
    const artifactIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (!artifactIdPattern.test(screen.artifactId)) {
      invalidScreens.push({
        screen: screen.name,
        error: `Invalid Claude artifact ID format: ${screen.artifactId}`,
      });
    }
  }

  if (invalidScreens.length > 0) {
    const errors = invalidScreens.map((s) => `  - Screen ${s.screen}: ${s.error}`).join("\n");
    throw new Error(`Invalid Claude artifact IDs found:\n${errors}`);
  }
}

/**
 * Look up a screen config by surface, screen name, and state name.
 * Returns undefined if not found.
 */
export function getScreenConfig(
  surface: "line-oa" | "admin" | "sponsor",
  screenName: string,
  _stateName: string,
): ScreenDefinition | undefined {
  const screens =
    surface === "line-oa" ? LINE_OA_SCREENS : surface === "admin" ? ADMIN_SCREENS : SPONSOR_SCREENS;

  return screens.find((s) => s.name === screenName);
}
