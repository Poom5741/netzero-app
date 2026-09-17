/**
 * Fixture data index — re-exports all fixture modules and provides
 * a unified validation function.
 */

export type { AdminUserFixture } from "./admin";
export { ADMIN_FIXTURES, validateAdminFixtures } from "./admin";
export type { DeedFixture, FarmerFixture, PlotFixture, SeasonFixture } from "./farmers";
export { FARMER_FIXTURES, validateFarmerFixtures } from "./farmers";
export type { SponsorAccountFixture } from "./sponsor";
export { SPONSOR_FIXTURES, validateSponsorFixtures } from "./sponsor";

/** Fixed fixture metadata */
export const FIXTURE_META = {
  fixtureId: "fixed-2026-09-15",
  todayDate: "2026-09-15",
  timezone: "Asia/Bangkok",
} as const;

/**
 * Run all fixture validation assertions.
 * Throws if any fixture violates invariants.
 */
export function validateFixtures(): void {
  validateFarmerFixtures();
  validateAdminFixtures();
  validateSponsorFixtures();
}
