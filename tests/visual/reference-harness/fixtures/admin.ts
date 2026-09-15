/**
 * Deterministic admin user fixture data.
 *
 * 5 admin users with synthetic usernames and Thai display names.
 */

export interface AdminUserFixture {
	id: string;
	username: string;
	role: "admin" | "reviewer";
	displayName: string;
	createdAt: string;
	updatedAt: string;
}

const FIXED_DATES = {
	created: "2026-01-10",
	updated: "2026-09-01",
};

export const ADMIN_FIXTURES: AdminUserFixture[] = [
	{
		id: "fix-admin-001",
		username: "admin.supakorn",
		role: "admin",
		displayName: "ศุภกร ผู้ดูแลระบบ",
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-admin-002",
		username: "admin.nattapong",
		role: "admin",
		displayName: "ณัฐพงศ์ ตรวจสอบ",
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-admin-003",
		username: "review.wilai",
		role: "reviewer",
		displayName: "วิไล รีวิว",
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-admin-004",
		username: "review.somchai",
		role: "reviewer",
		displayName: "สมชาย ตรวจผล",
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-admin-005",
		username: "review.pimchanok",
		role: "reviewer",
		displayName: "พิมพ์ชนก ยืนยัน",
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
];

/** Validate admin fixture data integrity */
export function validateAdminFixtures(): void {
	for (const admin of ADMIN_FIXTURES) {
		if (!admin.username.startsWith("admin.") && !admin.username.startsWith("review.")) {
			throw new Error(`Admin ${admin.id} has invalid username pattern: ${admin.username}`);
		}
		if (!["admin", "reviewer"].includes(admin.role)) {
			throw new Error(`Admin ${admin.id} has invalid role: ${admin.role}`);
		}
	}
}
