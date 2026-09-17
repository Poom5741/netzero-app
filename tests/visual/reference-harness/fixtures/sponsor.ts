/**
 * Deterministic sponsor account fixture data.
 *
 * 5 sponsor accounts each with CPA codes and assigned areas.
 * Constitution Principle VI: sponsor views MUST use CPA codes and assigned-area scope.
 */

export interface SponsorAccountFixture {
  id: string;
  cpaCode: string;
  assignedArea: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

const FIXED_DATES = {
  created: "2026-01-10",
  updated: "2026-09-01",
};

export const SPONSOR_FIXTURES: SponsorAccountFixture[] = [
  {
    id: "fix-sponsor-001",
    cpaCode: "CPA-001",
    assignedArea: "เชียงใหม่",
    displayName: "บริษัท กรีนคาร์บอน จำกัด",
    createdAt: FIXED_DATES.created,
    updatedAt: FIXED_DATES.updated,
  },
  {
    id: "fix-sponsor-002",
    cpaCode: "CPA-002",
    assignedArea: "เชียงราย",
    displayName: "บริษัท คาร์บอนเครดิตเหนือ จำกัด",
    createdAt: FIXED_DATES.created,
    updatedAt: FIXED_DATES.updated,
  },
  {
    id: "fix-sponsor-003",
    cpaCode: "CPA-003",
    assignedArea: "ขอนแก่น",
    displayName: "บริษัท อีสานเขียว จำกัด",
    createdAt: FIXED_DATES.created,
    updatedAt: FIXED_DATES.updated,
  },
  {
    id: "fix-sponsor-004",
    cpaCode: "CPA-004",
    assignedArea: "นครราชสีมา",
    displayName: "บริษัท ชดเชยคาร์บอน จำกัด",
    createdAt: FIXED_DATES.created,
    updatedAt: FIXED_DATES.updated,
  },
  {
    id: "fix-sponsor-005",
    cpaCode: "CPA-005",
    assignedArea: "กาญจนบุรี",
    displayName: "บริษัท ป่าตะวันตก จำกัด",
    createdAt: FIXED_DATES.created,
    updatedAt: FIXED_DATES.updated,
  },
];

/** Validate sponsor fixture data integrity */
export function validateSponsorFixtures(): void {
  for (const sponsor of SPONSOR_FIXTURES) {
    if (!/^CPA-\d{3}$/.test(sponsor.cpaCode)) {
      throw new Error(`Sponsor ${sponsor.id} has invalid CPA code: ${sponsor.cpaCode}`);
    }
    if (sponsor.assignedArea.length === 0) {
      throw new Error(`Sponsor ${sponsor.id} has empty assignedArea`);
    }
  }
}
