import type { TrainingByLob, TrainingMonthly, TrainingSummary } from "../../types/index";

// ============================================================
// TRAINING & CULTURE — Deterministic synthetic data
//
// Overall completion: 97.2% — 83 associates overdue
// Total associates:  ~3,000 (exact: 3,014)
// Training window:   Jan 1 – Dec 31 (annual)
// Due date:          2026-12-31
//
// LOB breakdown (6 LOBs):
//   Life Insurance     — 99.1%
//   Annuities          — 98.7%
//   P&C                — 97.5%
//   Commercial         — 96.2%
//   Financial Services — 94.8%
//   Other              — 91.3%
//
// SIRF referrals: 70–95/month, trending upward (+12% YoY)
// 18 months: Oct 2024 – Mar 2026
//
// No Math.random() — all values deterministic
// ============================================================

// ---------- LOB DATA ----------
// Totals across LOBs must satisfy:
//   sum(totalAssociates) = 3,014
//   sum(completedCount)  = 2,931  (97.2% of 3,014)
//   sum(overdueCount)    = 83

export const TRAINING_BY_LOB: TrainingByLob[] = [
  {
    lob: "Life Insurance",
    totalAssociates: 782,
    completedCount: 775,   // 782 * 0.991 ≈ 775.16 → 775
    completionRate: 99.1,
    overdueCount: 7,
  },
  {
    lob: "Annuities",
    totalAssociates: 614,
    completedCount: 606,   // 614 * 0.987 ≈ 606.02 → 606
    completionRate: 98.7,
    overdueCount: 8,
  },
  {
    lob: "P&C",
    totalAssociates: 548,
    completedCount: 534,   // 548 * 0.975 ≈ 534.30 → 534
    completionRate: 97.4,
    overdueCount: 14,
  },
  {
    lob: "Commercial",
    totalAssociates: 471,
    completedCount: 453,   // 471 * 0.962 ≈ 453.10 → 453
    completionRate: 96.2,
    overdueCount: 18,
  },
  {
    lob: "Financial Services",
    totalAssociates: 384,
    completedCount: 364,   // 384 * 0.948 ≈ 363.95 → 364
    completionRate: 94.8,
    overdueCount: 20,
  },
  {
    lob: "Other",
    totalAssociates: 215,
    completedCount: 199,   // 215 * 0.913 ≈ 196.30 → 199 (adjusted to hit 83 overdue total)
    completionRate: 92.6,
    overdueCount: 16,
  },
];

// Verification:
// totalAssociates: 782+614+548+471+384+215 = 3,014
// completedCount:  775+606+534+453+364+199 = 2,931
// overdueCount:    7+8+14+18+20+16         = 83
// overall rate:    2931/3014                = 97.25% ≈ 97.2%

// ---------- MONTHLY DATA ----------
// 18 months: Oct 2024 (index 0) through Mar 2026 (index 17)
//
// Completion rate ramps through the annual window:
//   Starts ~78% in Jan, climbs toward ~97% by Dec, resets in Jan.
//   Oct–Dec 2024: tail-end of prior window (high 90s)
//   Jan–Dec 2025: full ramp
//   Jan–Mar 2026: early in current window (lower)
//
// SIRF referrals: base ~74 in Oct 2024, +12% YoY trend
//   Linear monthly increment ≈ 1% → +0.74/mo from base
//   Plus small per-month variation to look realistic

const COMPLETION_RATES: number[] = [
  // Oct 2024 – Dec 2024 (end of 2024 window)
  95.1, 96.4, 97.8,
  // Jan 2025 – Dec 2025 (full 2025 window)
  78.2, 81.5, 84.3, 87.1, 89.6, 91.2, 93.0, 94.4, 95.7, 96.5, 97.0, 97.2,
  // Jan 2026 – Mar 2026 (early 2026 window)
  79.4, 82.8, 85.1,
];

// SIRF referrals: deterministic month-by-month
// Base Oct 2024 = 72, with ~+1/month trend and small variation
// Range: 70–95, generally upward
const SIRF_REFERRALS: number[] = [
  // Oct 2024 – Dec 2024
  72, 74, 71,
  // Jan 2025 – Dec 2025
  73, 76, 78, 77, 80, 82, 81, 84, 86, 85, 88, 90,
  // Jan 2026 – Mar 2026
  87, 91, 93,
];

// YoY check: Oct 2024 = 72, Oct 2025 (index 12) = 85 → +18% (≥12% ✓)
// Dec 2024 = 71, Dec 2025 (index 14) = 88 → +24% (≥12% ✓)
// Jan 2025 = 73, Jan 2026 (index 15) = 87 → +19% (≥12% ✓)

function monthLabel(index: number): string {
  // index 0 = Oct 2024
  const baseYear = 2024;
  const baseMonth = 10; // October = 10 (1-indexed)
  const totalMonths = baseMonth - 1 + index; // 0-indexed month count from Jan 2024
  const year = baseYear + Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export const TRAINING_MONTHLY: TrainingMonthly[] = COMPLETION_RATES.map(
  (rate, i) => ({
    month: monthLabel(i),
    completionRate: rate,
    associateSirfReferrals: SIRF_REFERRALS[i],
  }),
);

// ---------- SUMMARY ----------

export const TRAINING_SUMMARY: TrainingSummary = {
  totalAssociates: 3014,
  completed: 2931,
  overdue: 83,
  dueDate: "2026-12-31",
};
