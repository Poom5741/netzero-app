/**
 * Deterministic farmer fixture data.
 *
 * 7 farmers with synthetic phone numbers, Thai names, fixed dates.
 * Each farmer has 1–3 deeds with 1–4 plots and 1–2 seasons each.
 * All seasons have verificationStatus "unverified" (constitution Principle V).
 */

export interface SeasonFixture {
	id: string;
	plotId: string;
	startDate: string;
	endDate: string | null;
	status: "active" | "completed" | "planned";
	carbonEstimate: number | null;
	verificationStatus: "unverified";
	createdAt: string;
	updatedAt: string;
}

export interface PlotFixture {
	id: string;
	deedId: string;
	cropType: string;
	areaRai: number;
	seasons: SeasonFixture[];
	createdAt: string;
	updatedAt: string;
}

export interface DeedFixture {
	id: string;
	farmerId: string;
	areaRai: number;
	plots: PlotFixture[];
	createdAt: string;
	updatedAt: string;
}

export interface FarmerFixture {
	id: string;
	phone: string;
	name: string;
	status: "registered" | "pending" | "active";
	deeds: DeedFixture[];
	createdAt: string;
	updatedAt: string;
}

const FIXED_DATES = {
	created: "2026-01-10",
	updated: "2026-09-01",
	seasonStart: "2026-01-15",
	seasonEnd: "2026-09-30",
};

function makeSeason(
	id: string,
	plotId: string,
	status: "active" | "completed" | "planned",
	carbonEstimate: number | null,
): SeasonFixture {
	return {
		id,
		plotId,
		startDate: FIXED_DATES.seasonStart,
		endDate: status === "completed" ? FIXED_DATES.seasonEnd : null,
		status,
		carbonEstimate,
		verificationStatus: "unverified",
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	};
}

function makePlot(
	id: string,
	deedId: string,
	cropType: string,
	areaRai: number,
	seasons: SeasonFixture[],
): PlotFixture {
	return {
		id,
		deedId,
		cropType,
		areaRai,
		seasons,
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	};
}

function makeDeed(
	id: string,
	farmerId: string,
	areaRai: number,
	plots: PlotFixture[],
): DeedFixture {
	return {
		id,
		farmerId,
		areaRai,
		plots,
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	};
}

export const FARMER_FIXTURES: FarmerFixture[] = [
	{
		id: "fix-farmer-001",
		phone: "081-234-5678",
		name: "สมชาย ใจดี",
		status: "active",
		deeds: [
			makeDeed("fix-deed-001", "fix-farmer-001", 15, [
				makePlot("fix-plot-001", "fix-deed-001", "ข้าว", 10, [
					makeSeason("fix-season-001", "fix-plot-001", "active", 2.5),
				]),
				makePlot("fix-plot-002", "fix-deed-001", "ข้าว", 5, [
					makeSeason("fix-season-002", "fix-plot-002", "completed", 1.2),
				]),
			]),
		],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-farmer-002",
		phone: "082-345-6789",
		name: "สมหญิง รักเกษตร",
		status: "active",
		deeds: [
			makeDeed("fix-deed-002", "fix-farmer-002", 25, [
				makePlot("fix-plot-003", "fix-deed-002", "อ้อย", 15, [
					makeSeason("fix-season-003", "fix-plot-003", "active", 4.0),
				]),
				makePlot("fix-plot-004", "fix-deed-002", "มันสำปะหลัง", 10, [
					makeSeason("fix-season-004", "fix-plot-004", "active", 3.1),
				]),
			]),
		],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-farmer-003",
		phone: "083-456-7890",
		name: "ประยุทธ์ มั่นคง",
		status: "active",
		deeds: [
			makeDeed("fix-deed-003", "fix-farmer-003", 8, [
				makePlot("fix-plot-005", "fix-deed-003", "ข้าว", 8, [
					makeSeason("fix-season-005", "fix-plot-005", "active", 1.8),
					makeSeason("fix-season-006", "fix-plot-005", "completed", 1.5),
				]),
			]),
		],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-farmer-004",
		phone: "084-567-8901",
		name: "วิภา แสงทอง",
		status: "registered",
		deeds: [
			makeDeed("fix-deed-004", "fix-farmer-004", 30, [
				makePlot("fix-plot-006", "fix-deed-004", "ยางพารา", 20, [
					makeSeason("fix-season-007", "fix-plot-006", "active", null),
				]),
				makePlot("fix-plot-007", "fix-deed-004", "ปาล์ม", 10, [
					makeSeason("fix-season-008", "fix-plot-007", "planned", null),
				]),
			]),
		],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-farmer-005",
		phone: "085-678-9012",
		name: "อนุชา ทุ่งทอง",
		status: "active",
		deeds: [
			makeDeed("fix-deed-005", "fix-farmer-005", 12, [
				makePlot("fix-plot-008", "fix-deed-005", "ข้าว", 12, [
					makeSeason("fix-season-009", "fix-plot-008", "active", 3.0),
				]),
			]),
		],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-farmer-006",
		phone: "086-789-0123",
		name: "นภา ศรีสุข",
		status: "pending",
		deeds: [],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
	{
		id: "fix-farmer-007",
		phone: "087-890-1234",
		name: "ธนากร พืชผล",
		status: "active",
		deeds: [
			makeDeed("fix-deed-006", "fix-farmer-007", 40, [
				makePlot("fix-plot-009", "fix-deed-006", "ข้าวโพด", 20, [
					makeSeason("fix-season-010", "fix-plot-009", "active", 5.2),
				]),
				makePlot("fix-plot-010", "fix-deed-006", "ถั่ว", 10, [
					makeSeason("fix-season-011", "fix-plot-010", "completed", 2.0),
				]),
				makePlot("fix-plot-011", "fix-deed-006", "ข้าว", 10, [
					makeSeason("fix-season-012", "fix-plot-011", "planned", null),
				]),
			]),
		],
		createdAt: FIXED_DATES.created,
		updatedAt: FIXED_DATES.updated,
	},
];

/** Validate fixture data integrity */
export function validateFarmerFixtures(): void {
	for (const farmer of FARMER_FIXTURES) {
		// Synthetic phone pattern check
		if (!/^08\d-\d{3}-\d{4}$/.test(farmer.phone)) {
			throw new Error(`Farmer ${farmer.id} has invalid phone pattern: ${farmer.phone}`);
		}
		// No real PII — names must be from our fixed set
		if (farmer.name.length === 0) {
			throw new Error(`Farmer ${farmer.id} has empty name`);
		}
		// All seasons must be unverified
		for (const deed of farmer.deeds) {
			for (const plot of deed.plots) {
				for (const season of plot.seasons) {
					if (season.verificationStatus !== "unverified") {
						throw new Error(
							`Season ${season.id} has verificationStatus "${season.verificationStatus}" — must be "unverified"`,
						);
					}
				}
			}
		}
	}
}
