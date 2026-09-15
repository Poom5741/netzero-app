#!/usr/bin/env bun
/**
 * Validate screen inventory count matches #142 specification.
 * Run before capture to ensure all screens are defined.
 */

import { getScreenCount, validateInventoryCount } from "../reference-harness/screens";

const EXPECTED_SCREEN_COUNT = 14; // From #142 inventory

console.log("🔍 Validating screen inventory...\n");

try {
  validateInventoryCount(EXPECTED_SCREEN_COUNT);

  const counts = getScreenCount();
  console.log("✅ Screen inventory valid");
  console.log(`   Total: ${counts.total}`);
  console.log(`   Admin: ${counts.admin}`);
  console.log(`   Sponsor: ${counts.sponsor}`);
  console.log(`   LINE OA: ${counts.lineOa}`);
  console.log(`\n   Expected: ${EXPECTED_SCREEN_COUNT} screens from #142 inventory`);

  process.exit(0);
} catch (err) {
  console.error("\n❌ Inventory validation failed:", (err as Error).message);
  process.exit(1);
}
