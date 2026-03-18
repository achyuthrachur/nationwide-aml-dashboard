/**
 * CIP/KYC Compliance – Deterministic Synthetic Data
 *
 * Monitoring period: Oct 2024 – Mar 2026 (~78 weeks, 18 months)
 *   - ~3,400 new policies in monitoring window
 *   - 99.3% CIP completion  =>  ~24 still-open null-field exceptions
 *   - 47 total CIP exceptions (23 remediated, 24 open)
 *   - 4 overdue periodic reviews (30–75 days overdue)
 *   - High-risk additions 8-15/month, spike in Feb 2026 (month 9 mapped to index 16)
 *   - EDD: 98.1% complete — 3 accounts pending/overdue
 *
 * ALL data is deterministic — no Math.random().
 */

import type { CipException, OverdueReview } from "@/types/index";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Simple seeded pseudo-random (mulberry32). Only used for deterministic shuffling. */
function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seeded(20240301);

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Days in month (non-leap 2025, leap-aware 2024/2026 not needed at day precision). */
function daysInMonth(y: number, m: number): number {
  return [0, 31, y % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
}

// ──────────────────────────────────────────────
// Admin systems & analyst pool
// ──────────────────────────────────────────────

const ADMIN_SYSTEMS = ["LifeComm", "iGO", "VANTAGE"] as const;
const ANALYSTS = [
  "M.Chen", "R.Gupta", "T.Alvarez", "K.Novak", "D.Okafor",
  "S.Patel", "J.Torres", "A.Kim", "L.Wright", "P.Johansson",
];

// ──────────────────────────────────────────────
// CIP_EXCEPTIONS  (47 records)
//   18 ssn_tin  |  12 dob  |  10 address  |  7 full_name
//   23 remediated  |  24 open
// ──────────────────────────────────────────────

const FIELD_DISTRIBUTION: CipException["missingField"][] = [
  // 18 ssn_tin
  ...Array.from<CipException["missingField"]>({ length: 18 }).fill("ssn_tin"),
  // 12 dob
  ...Array.from<CipException["missingField"]>({ length: 12 }).fill("dob"),
  // 10 address
  ...Array.from<CipException["missingField"]>({ length: 10 }).fill("address"),
  // 7 full_name
  ...Array.from<CipException["missingField"]>({ length: 7 }).fill("full_name"),
];

// Deterministic shuffle of field distribution
const shuffledFields = [...FIELD_DISTRIBUTION];
for (let i = shuffledFields.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [shuffledFields[i], shuffledFields[j]] = [shuffledFields[j], shuffledFields[i]];
}

// Deterministic status: first 23 = remediated, rest = open (after shuffle position)
const statusOrder: CipException["status"][] = [
  ...Array.from<CipException["status"]>({ length: 23 }).fill("remediated"),
  ...Array.from<CipException["status"]>({ length: 24 }).fill("open"),
];

// Build exception records spread across Oct 2024 – Mar 2026
export const CIP_EXCEPTIONS: CipException[] = shuffledFields.map((field, idx) => {
  // Spread detected dates across 18 months deterministically
  const monthOffset = idx % 18;
  const baseMonth = 10 + monthOffset; // Oct 2024 start
  const year = 2024 + Math.floor((baseMonth - 1) / 12);
  const month = ((baseMonth - 1) % 12) + 1;
  const day = ((idx * 7 + 3) % daysInMonth(year, month)) + 1;

  const status = statusOrder[idx];

  return {
    exceptionId: `CIP-EX-${String(idx + 1).padStart(4, "0")}`,
    policyId: `POL-${String(300000 + idx * 73).padStart(7, "0")}`,
    adminSystem: ADMIN_SYSTEMS[idx % 3],
    missingField: field,
    detectedDate: isoDate(year, month, day),
    status,
    analystId: status === "open" ? ANALYSTS[idx % ANALYSTS.length] : null,
  };
});

// ──────────────────────────────────────────────
// CIP_WEEKLY  (~78 weeks)
// Oct 7 2024  –  Mar 16 2026
// Completion rate hovers near 99.3%, null fields decline
// ──────────────────────────────────────────────

const TOTAL_WEEKS = 78;

// Deterministic completion-rate pattern: starts ~98.8%, climbs to ~99.5%, averages 99.3%
function weeklyCompletion(weekIndex: number): number {
  // Sigmoid-ish ramp from 98.8 to 99.55
  const progress = weekIndex / (TOTAL_WEEKS - 1);
  const base = 98.8 + 0.75 * progress;
  // Small deterministic oscillation
  const wobble = [0.05, -0.03, 0.02, -0.04, 0.06, -0.02, 0.03, -0.05, 0.04, -0.01];
  const osc = wobble[weekIndex % wobble.length];
  return Math.round((base + osc) * 100) / 100;
}

function weeklyNullFields(weekIndex: number): number {
  // Start high (~12), taper to ~2-3 as remediation progresses
  const base = Math.max(2, Math.round(12 - (10 * weekIndex) / (TOTAL_WEEKS - 1)));
  const bump = [0, 1, 0, -1, 0, 1, -1, 0, 1, 0];
  return Math.max(0, base + bump[weekIndex % bump.length]);
}

/** Add `days` to a {year, month, day} tuple — pure arithmetic, no Date objects. */
function addDays(y: number, m: number, d: number, days: number): [number, number, number] {
  let dy = y, dm = m, dd = d + days;
  while (dd > daysInMonth(dy, dm)) {
    dd -= daysInMonth(dy, dm);
    dm++;
    if (dm > 12) { dm = 1; dy++; }
  }
  return [dy, dm, dd];
}

export const CIP_WEEKLY: {
  weekStart: string;
  completionRate: number;
  nullFieldCount: number;
}[] = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
  const [wy, wm, wd] = addDays(2024, 10, 7, i * 7);
  return {
    weekStart: isoDate(wy, wm, wd),
    completionRate: weeklyCompletion(i),
    nullFieldCount: weeklyNullFields(i),
  };
});

// ──────────────────────────────────────────────
// HIGH_RISK_MONTHLY  (18 months: Oct 2024 – Mar 2026)
// 8-15 new additions/month, spike in Feb 2026 (index 16)
// ──────────────────────────────────────────────

const HR_NEW_ADDS = [
  10, 9, 11, 12, 8, 10, 13, 9, 11, 10,  // Oct 24 – Jul 25
  12, 14, 11, 9, 10, 13, 22, 12,         // Aug 25 – Mar 26  (index 16 = Feb 26 spike)
];

export const HIGH_RISK_MONTHLY: {
  month: string;
  newAdditions: number;
  totalActive: number;
}[] = (() => {
  const result: { month: string; newAdditions: number; totalActive: number }[] = [];
  let cumulative = 84; // pre-existing high-risk customers before monitoring window
  for (let i = 0; i < 18; i++) {
    const baseMonth = 10 + i;
    const year = 2024 + Math.floor((baseMonth - 1) / 12);
    const month = ((baseMonth - 1) % 12) + 1;
    const additions = HR_NEW_ADDS[i];
    // Small deterministic attrition each month (policy closures / downgrades)
    const attrition = [1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 2, 0, 1][i];
    cumulative = cumulative + additions - attrition;
    result.push({
      month: isoDate(year, month, 1),
      newAdditions: additions,
      totalActive: cumulative,
    });
  }
  return result;
})();

// ──────────────────────────────────────────────
// EDD_STATUS
// 98.1% completed — 3 accounts not yet completed
// total = 158, completed = 155, pending = 2, overdue = 1
// 155/158 = 98.1%
// ──────────────────────────────────────────────

export const EDD_STATUS: {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
} = {
  total: 158,
  completed: 155,
  pending: 2,
  overdue: 1,
};

// ──────────────────────────────────────────────
// OVERDUE_REVIEWS  (4 records, 30–75 days overdue)
// ──────────────────────────────────────────────

export const OVERDUE_REVIEWS: OverdueReview[] = [
  {
    reviewId: "REV-2026-0041",
    customerId: "CUST-881204",
    riskTier: "high",
    lastReviewDate: "2025-03-12",
    dueDate: "2026-01-08",
    daysOverdue: 69,
    assignedAnalyst: "M.Chen",
  },
  {
    reviewId: "REV-2026-0055",
    customerId: "CUST-770318",
    riskTier: "enhanced",
    lastReviewDate: "2025-06-20",
    dueDate: "2026-02-04",
    daysOverdue: 42,
    assignedAnalyst: "R.Gupta",
  },
  {
    reviewId: "REV-2026-0063",
    customerId: "CUST-993507",
    riskTier: "high",
    lastReviewDate: "2025-05-01",
    dueDate: "2026-02-16",
    daysOverdue: 30,
    assignedAnalyst: "T.Alvarez",
  },
  {
    reviewId: "REV-2026-0028",
    customerId: "CUST-615742",
    riskTier: "high",
    lastReviewDate: "2025-01-05",
    dueDate: "2026-01-02",
    daysOverdue: 75,
    assignedAnalyst: "K.Novak",
  },
];
