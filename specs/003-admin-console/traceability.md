# Traceability Matrix: Admin Console

| REQ-ID | Description | Spec Section | Implementation | Test | Status |
|--------|-------------|--------------|----------------|------|--------|
| AD-AUTH-01 | Branded login | 2.1 | `src/routes/admin.ts` (login page rendering) | Unit + e2e | ✅ |
| AD-AUTH-02 | Email/password/OTP/remember/forgot | 2.1 | `src/auth/session.ts`, `src/auth/otp.ts`, `src/auth/password.ts` | Unit + e2e | ✅ |
| AD-AUTH-03 | Audit logging for reads/writes | 2.1 | `src/admin/audit-log.ts` | Unit | ✅ |
| AD-OV-01 | Overview scope and methodology | 2.2 | `src/admin/overview.ts` | Unit | ✅ |
| AD-OV-02 | Four primary metrics | 2.2 | `src/admin/overview.ts` (totalFarmers, totalPlots, pendingReviews, totalCredits) | Unit | ✅ |
| AD-OV-03 | Work queue | 2.2 | `src/admin/overview.ts` (pendingApplications, photoQueue, missingPhotos, sfwFallback) | Unit | ✅ |
| AD-OV-04 | Credit visualizations | 2.2 | `src/admin/overview.ts` (credit chart data, GHG source breakdown) | Unit | ✅ |
| AD-OV-05 | Filtering | 2.2 | `src/admin/overview.ts` (province table, filter support) | Unit | ✅ |
| AD-OV-06 | Operational actions | 2.2 | `src/admin/overview.ts` (chart, export, photo-review actions) | Unit | ✅ |
| AD-FAR-01 | Farmer registry list | 2.3 | `src/routes/admin.ts` (farmer list page), `src/admin/farmer-detail.ts` | Unit + e2e | ✅ |
| AD-FAR-02 | Personal data protection | 2.3 | `src/auth/middleware.ts` (role-based field access), `src/routes/export.ts` | Unit | ✅ |
| AD-FAR-03 | Filter and export by CPA | 2.3 | `src/admin/reports.ts`, `src/routes/export.ts` | Unit | ✅ |
| AD-FAR-04 | Farmer detail tabs | 2.3 | `src/admin/farmer-detail.ts` (5 tabs: Plots, Credit, Nitrogen, Photo, Audit) | Unit + e2e | ✅ |
| AD-FAR-05 | Plot and deed information | 2.3 | `src/admin/farmer-detail.ts` (Plots & Documents tab) | Unit | ✅ |
| AD-APP-01 | Application queue | 2.4 | `src/admin/applications.ts` | Unit + e2e | ✅ |
| AD-APP-02 | Holding-specific document rules | 2.4 | `src/admin/applications.ts` (DOCS_NEEDED, holding type handling) | Unit | ✅ |
| AD-APP-03 | Document checklist | 2.4 | `src/admin/applications.ts` (doc_count vs DOCS_NEEDED) | Unit | ✅ |
| AD-APP-04 | Review actions | 2.4 | `src/admin/applications.ts` (approve/reject/hold) | Unit + e2e | ✅ |
| AD-APP-05 | Placeholder labeling | 2.4 | `src/admin/applications.ts` (OCR/automation status markers) | Unit | ✅ |
| AD-REV-01 | Evidence review | 2.5 | `src/admin/detail.ts`, `src/admin/queue.ts` | Unit + e2e | ✅ |
| AD-REV-02 | Approve/reject/retake with reason | 2.5 | `src/admin/review.ts` | Unit + e2e | ✅ |
| AD-REV-03 | Review history | 2.5 | `src/admin/audit-log.ts` (`getDecisionHistory`) | Unit | ✅ |
| AD-CHART-01 | Verified vs estimated credits | 2.6 | `src/admin/overview.ts` (credit chart data) | Unit | ✅ |
| AD-CHART-02 | Credit distribution | 2.6 | `src/admin/overview.ts` (province table, season breakdown) | Unit | ✅ |
| AD-CALC-01 | T-VER-P-METH-13-08 calculation | 2.6 | `src/calc/orchestrator.ts`, `src/calc/methane.ts`, `src/calc/n2o.ts`, `src/calc/co2.ts`, `src/calc/burning.ts`, `src/calc/sf-w.ts`, `src/calc/factors.ts` | Unit | ✅ |
| AD-CALC-02 | Traceable calculation inputs | 2.6 | `src/admin/farmer-detail.ts` (CalcTrace tab), `src/season/approve-estimate.ts` | Unit | ✅ |
| AD-ROLE-01 | Five roles | 2.7 | `src/auth/middleware.ts` (`requireRole`), `src/admin/settings.ts` (role-permission matrix) | Unit | ✅ |
| AD-ROLE-02 | Permission categories | 2.7 | `src/admin/settings.ts` (permissions tab), `src/auth/middleware.ts` | Unit | ✅ |
| AD-NAV-01 | Primary navigation | 2.8 | `src/routes/admin.ts` (overview, applications, evidence, farmers, sponsors, reports, settings) | Unit + e2e | ✅ |
