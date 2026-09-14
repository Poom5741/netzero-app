# Traceability Matrix: Sponsor Dashboard

| REQ-ID | Description | Spec Section | Implementation | Test | Status |
|--------|-------------|--------------|----------------|------|--------|
| SP-AUTH-01 | Branded sponsor login | 3.1 | `src/routes/sponsor.ts` (login page rendering) | Unit + e2e | ✅ |
| SP-AUTH-02 | Sponsor scope restriction | 3.1 | `src/routes/sponsor.ts` (`getAreasForRequest`), `src/auth/middleware.ts` | Unit | ✅ |
| SP-OV-01 | Supported area and methodology | 3.2 | `src/sponsor/dashboard.ts` (`getSponsorAreas`) | Unit | ✅ |
| SP-OV-02 | PDPA/data boundary notice | 3.2 | `src/routes/sponsor.ts` (page rendering with CPA-only notice) | Unit | ✅ |
| SP-OV-03 | Certified credits card | 3.2 | `src/sponsor/dashboard.ts` (`getSponsorSummary`, `getSeasonCredits`) | Unit + e2e | ✅ |
| SP-OV-04 | Supported area details | 3.2 | `src/sponsor/dashboard.ts` (`getPlotsByProvince`, `getPlotsByProvinceScoped`) | Unit | ✅ |
| SP-OV-05 | Households benefited | 3.2 | `src/sponsor/dashboard.ts` (`getSponsorFarmers`) | Unit | ✅ |
| SP-OV-06 | Credits by season chart | 3.2 | `src/sponsor/dashboard.ts` (`getSeasonCredits`) | Unit | ✅ |
| SP-OV-07 | Estimate uncertainty note | 3.2 | `src/routes/sponsor.ts` (page rendering with SF_w fallback explanation) | Unit | ✅ |
| SP-OV-08 | Credit difference source | 3.2 | `src/sponsor/dashboard.ts` (`getGhgSourceBreakdown`) | Unit | ✅ |
| SP-OV-09 | Filter sponsor data | 3.2 | `src/sponsor/dashboard.ts` (`getPlotsByProvinceScoped`, `SponsorFilters`), `src/routes/sponsor.ts` (province/season query params) | Unit | ✅ |
| SP-OV-10 | Export sponsor summary | 3.2 | `src/routes/export.ts` (CSV/JSON, sponsor role check, area/season scoping) | Unit | ✅ |
| SP-BR-01 | Sponsor sees only configured areas | 3.3 | `src/routes/sponsor.ts` (`getAreasForRequest`) | Unit | ✅ |
| SP-BR-02 | No cross-sponsor browsing | 3.3 | `src/routes/sponsor.ts` (403 on empty areas) | Unit | ✅ |
| SP-BR-03 | No PII access | 3.3 | `src/routes/sponsor.ts` (CPA-only data shape) | Unit | ✅ |
| SP-BR-04 | CPA codes in exports | 3.3 | `src/routes/export.ts`, `src/export/estimates.ts` | Unit | ✅ |
| SP-BR-05 | Verified vs estimate distinction | 3.3 | `src/sponsor/dashboard.ts` (`getSeasonCredits` separates verified/estimated), `src/export/estimates.ts` (`verification_label` by status) | Unit | ✅ |
| SP-NAV-01 | Primary navigation | 3.4 | `src/routes/sponsor.ts` (overview, areas, reports/certificates) | Unit + e2e | ✅ |
