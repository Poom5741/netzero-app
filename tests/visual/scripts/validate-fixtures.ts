#!/usr/bin/env bun
/**
 * Validate all fixture data for compliance with constraints:
 * - Synthetic phone patterns (no real PII)
 * - CPA codes and assigned areas for sponsors
 * - All seasons marked as "unverified"
 * - Fixed dates and timezone
 */

import { validateFarmerFixtures } from "../reference-harness/fixtures/farmers";
import { validateAdminFixtures } from "../reference-harness/fixtures/admin";
import { validateSponsorFixtures } from "../reference-harness/fixtures/sponsor";

console.log("🔍 Validating fixture data...\n");

try {
  validateFarmerFixtures();
  console.log("   ✅ Farmer fixtures valid");

  validateAdminFixtures();
  console.log("   ✅ Admin fixtures valid");

  validateSponsorFixtures();
  console.log("   ✅ Sponsor fixtures valid");

  console.log("\n✅ All fixtures valid");
  console.log("   - Phone numbers follow synthetic pattern (08X-XXX-XXXX)");
  console.log("   - No real PII detected");
  console.log("   - All seasons marked as 'unverified'");
  console.log("   - Sponsor accounts have CPA codes and assigned areas");
  console.log("   - Fixed dates: 2026-09-15 (Asia/Bangkok)");
  process.exit(0);
} catch (err) {
  console.error("\n❌ Fixture validation failed:", (err as Error).message);
  process.exit(1);
}
