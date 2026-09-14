export type PlotSummary = {
  plot_id: string;
  plot_code: string;
  area_rai: number;
  cpa_code: string;
  province: string;
  district: string;
  total_offset_tco2e: number | null;
  latest_season_id: string | null;
  estimate_status: string | null;
  water_state_tallies?: { flooded: number; dry: number };
  provenance_counts?: { machine: number; human: number };
};

export type ProvinceGroup = {
  province: string;
  plots: PlotSummary[];
};

export type SponsorOverview = {
  totalCO2Tons: number;
  totalPlots: number;
  totalInvestmentUSD: number;
};

export type SponsorSummary = {
  totalCO2Tons: number;
  totalPlots: number;
  totalFarmers: number;
  totalAreaRai: number;
  totalHouseholds: number;
  paymentEstimateUSD: number;
  methodologyBreakdown: { awd: number; biochar: number; fertilization: number };
};

export type SponsorFarmerRow = {
  farmer_id: string;
  cpa_code: string;
  province: string;
  plotCount: number;
  totalTCO2e: number;
  progressPercent: number;
};

// ─── Certificate type ───

export type Certificate = {
  id: string;
  certificate_number: string;
  season_id: string;
  volume_tco2e: number;
  status: string;
  issued_at: string;
};

// ─── GHG source breakdown ───

export type GhgSourceRow = {
  source: string;
  baseline: number;
  project: number;
  reduction: number;
};

// ─── Season credit chart ───

export type SeasonCreditRow = {
  season_id: string;
  season_name: string;
  estimated_tco2e: number;
  verified_tco2e: number;
};

// ─── Sponsor profile ───

export type SponsorProfile = {
  user: { id: string; email: string; name: string | null; role: string };
  areas: string[] | null;
};

// ─── Certificate status vocab ───

export const CERT_STATUS: Record<string, { label: string; color: string }> = {
  verified: { label: "คงเหลือในบัญชี", color: "text-primary" },
  retired: { label: "ยกเลิกเพื่อชดเชยแล้ว", color: "text-error" },
  pending: { label: "รอทวนสอบ", color: "text-tertiary" },
};

// ─── Pure helpers ───

/** Format a number with comma separators. */
export function formatWithCommas(n: number): string {
  return n.toLocaleString("en-US");
}

/** Format tons value with comma separators. */
export function formatTons(n: number): string {
  if (Number.isInteger(n)) return formatWithCommas(n);
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format a USD amount with $ prefix and comma separators. */
export function formatUSD(n: number): string {
  return `$${formatWithCommas(n)}`;
}

// ─── CSV export ───

/** Generate a CSV string from province groups for download. */
export function generateExportCSV(groups: ProvinceGroup[]): string {
  const header = [
    "plot_code",
    "cpa_code",
    "province",
    "district",
    "area_rai",
    "total_offset_tco2e",
    "estimate_status",
  ].join(",");

  const rows = groups.flatMap((g) =>
    g.plots.map((p) =>
      [
        p.plot_code,
        `"${p.cpa_code.replace(/"/g, '""')}"`,
        `"${p.province.replace(/"/g, '""')}"`,
        `"${p.district.replace(/"/g, '""')}"`,
        p.area_rai,
        p.total_offset_tco2e ?? "",
        p.estimate_status ?? "",
      ].join(","),
    ),
  );

  return [header, ...rows].join("\n");
}

// ─── Fallback sample data (Thai text, realistic structure) ───

export function getFallbackData(): ProvinceGroup[] {
  return [
    {
      province: "พระนครศรีอยุธยา",
      plots: [
        {
          plot_id: "fb-1",
          plot_code: "AY-001",
          area_rai: 15,
          cpa_code: "CPA-AY-001",
          province: "พระนครศรีอยุธยา",
          district: "พระนครศรีอยุธยา",
          total_offset_tco2e: 12.5,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
        {
          plot_id: "fb-2",
          plot_code: "AY-042",
          area_rai: 20,
          cpa_code: "CPA-AY-042",
          province: "พระนครศรีอยุธยา",
          district: "บางปะอิน",
          total_offset_tco2e: 8.3,
          latest_season_id: "S1",
          estimate_status: "pending",
        },
        {
          plot_id: "fb-3",
          plot_code: "AY-078",
          area_rai: 12,
          cpa_code: "CPA-AY-078",
          province: "พระนครศรีอยุธยา",
          district: "วังน้อย",
          total_offset_tco2e: 9.7,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
      ],
    },
    {
      province: "สุพรรณบุรี",
      plots: [
        {
          plot_id: "fb-4",
          plot_code: "SP-112",
          area_rai: 25,
          cpa_code: "CPA-SP-112",
          province: "สุพรรณบุรี",
          district: "สุพรรณบุรี",
          total_offset_tco2e: 14.5,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
        {
          plot_id: "fb-5",
          plot_code: "SP-205",
          area_rai: 18,
          cpa_code: "CPA-SP-205",
          province: "สุพรรณบุรี",
          district: "เดิมบางนางบวช",
          total_offset_tco2e: 11.0,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
        {
          plot_id: "fb-6",
          plot_code: "SP-218",
          area_rai: 22,
          cpa_code: "CPA-SP-218",
          province: "สุพรรณบุรี",
          district: "บางปลาม้า",
          total_offset_tco2e: 7.2,
          latest_season_id: "S1",
          estimate_status: "pending",
        },
      ],
    },
    {
      province: "นครปฐม",
      plots: [
        {
          plot_id: "fb-7",
          plot_code: "NP-034",
          area_rai: 10,
          cpa_code: "CPA-NP-034",
          province: "นครปฐม",
          district: "นครปฐม",
          total_offset_tco2e: 6.8,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
        {
          plot_id: "fb-8",
          plot_code: "NP-091",
          area_rai: 14,
          cpa_code: "CPA-NP-091",
          province: "นครปฐม",
          district: "สามพราน",
          total_offset_tco2e: 8.1,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
      ],
    },
  ];
}

// ─── Fallback sample data (Thai text, realistic structure) ───
