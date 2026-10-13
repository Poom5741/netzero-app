## baseline-feedback
Baseline candidate main@`6b0aa0e` (deploy FE `3a92cb9`, BE `900a268`). Observed defect baseline, evidence-backed:
- CSV จำนวนเกษตรกร=2 vs `/sponsor/farmers`=1 vs ครัวเรือน=1 — r5 appendix footnote 1 (`tests/verification/staging-e2e-2026-10-05.md`), reproduced live 2026-10-13 (`.super-speckit/qa/2026-10-13-pre-client-smoke/report.md`, full CSV lines captured).
- Province filter options scoped on staging since PR #177 (live check 2026-10-13: ทุกจังหวัด, สุพรรณบุรี only) — r2's unscoped sighting traced to D-5's 401→fallback path.
Feedback carried: keep the failing-first regression test; verify R-2 live instead of editing FE.
