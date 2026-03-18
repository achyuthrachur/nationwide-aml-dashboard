# Nationwide AML/BSA Dashboard — Enhancement Plan
**Prepared for:** Claude Code  
**Project:** `C:\Users\RachurA\AI Coding Projects\Nationwide Dashboard`  
**Requirements source:** `AML BSA Continuous Monitoring KPI & KRI Framework.docx`  
**Date:** March 17, 2026

---

## Context for Claude Code

This is a Next.js 14 / TypeScript / Tailwind / Recharts dashboard built for Nationwide (a life insurance company). The current dashboard covers **Sanctions / OFAC screening** across six tabs. The requirements document defines a broader **AML/BSA KPI + KRI framework** that the dashboard must be expanded to cover.

The work falls into three phases:
1. **Scrub** — Remove all Bank of America (BofA) references from docs and any residual code
2. **Bug Fixes** — Address critical bugs already catalogued in `FIXES-AND-ENHANCEMENTS.md`
3. **New Features** — Expand the dashboard to cover the four new AML/BSA domains from the requirements doc

All existing brand tokens stay the same: `#003571` (navy), `#0065B3` (blue), `#E61030` (red). This is a Nationwide product delivered by Crowe LLP.

---

## Phase 1 — Remove All Bank of America References

### 1A. Documentation Files (do NOT delete the files — edit them in place)

**`COMPONENT_INVENTORY.md`**  
Find and replace every occurrence:
- `"BofA Sanctions Continuous Monitoring Dashboard"` → `"Nationwide AML/BSA Continuous Monitoring Dashboard"`
- `"BofA logo"` → `"Nationwide logo"` (2 occurrences — TopNav spec and landing page spec)
- `"BANK OF AMERICA | Sanctions Audit — Continuous Monitoring"` → `"Nationwide | AML/BSA Continuous Monitoring"`
- `"bank_of_america_logo.svg"` (all occurrences including the `<Image src="">` example) → `"nationwide_logo.svg"`
- `"Replace with BofA light theme tokens per PRD exactly"` → `"Nationwide light theme tokens per PRD"`
- `"No Crowe colors anywhere — this is a BofA-branded product"` → `"Use Nationwide brand tokens — navy #003571, blue #0065B3, red #E61030"`

**`FIXES-AND-ENHANCEMENTS.md`**  
- Title line: `"BofA Sanctions Dashboard — Fixes & Enhancements"` → `"Nationwide AML/BSA Dashboard — Fixes & Enhancements"`
- `"Jason and the demo audience will notice"` → `"The demo audience will notice"`
- `"the BofA audience"` → `"the Nationwide audience"`
- `"BofA favicon"` → `"Nationwide favicon"`
- `"bank_of_america_logo.svg"` → `"nationwide_logo.svg"` (in ENH-05)

**`HANDOFF.md`**  
- All phase headers: `"BofA Sanctions Dashboard"` → `"Nationwide AML/BSA Dashboard"`
- `"boa-sanctions-app.vercel.app"` → remove or replace with `"[nationwide-aml-dashboard.vercel.app]"`
- `"boa-sanctions-dashboard"` (GitHub repo name in URL) → `"nationwide-aml-dashboard"`
- `"https://boa-sanctions-ip7gocrhf-achyuth-rachurs-projects.vercel.app"` → remove (stale URL)

**`SANCTIONS-DASHBOARD-PRD.md`**  
Scan for any `"BofA"`, `"Bank of America"`, `"bank_of_america"` strings and replace with `"Nationwide"`.

### 1B. Source Code Files

**`src/app/layout.tsx`**  
- Title is already `"Nationwide Sanctions Continuous Monitoring | Crowe LLP"` — update to reflect the broader scope:  
  `"Nationwide AML/BSA Continuous Monitoring | Crowe LLP"`
- Description update: `"AML/BSA continuous monitoring dashboard — Crowe AI Practice"`

**`src/components/shell/TopNav.tsx`**  
- Already uses `"Nationwide"` brand — no BoA strings present. ✅
- Update the subtitle text from `"Sanctions Audit — Continuous Monitoring"` to `"AML/BSA Continuous Monitoring"` to reflect the expanded scope.

**`src/components/tabs/ExecutiveSummary.tsx`**  
- The `SYNTHETIC_INSIGHT` string on lines 10–12 references `"the Acuity vendor backlog"` and `"Volga Meridian corridor"` — these are fine (not BoA-specific). No changes needed for scrub.

**All data files in `data/synthetic/`**  
- Scan all files for `"BofA"`, `"Bank of America"`, `"boa"` — replace any found with Nationwide-appropriate equivalents.
- The email domain `@nationwide.com` in `AlertReview.tsx` (`sanctions-lead@nationwide.com`, `audit-director@nationwide.com`) is already correct ✅.

**Public assets**  
- If `public/bank_of_america_logo.svg` exists, it must be removed. The TopNav currently renders just the text `"Nationwide"` — no SVG logo reference is in `TopNav.tsx` so no code change needed, just delete the file if present.

---

## Phase 2 — Bug Fixes (from FIXES-AND-ENHANCEMENTS.md)

Fix these in order. All were catalogued previously — reproduce here for completeness.

### BUG-01 — IBM Plex Sans Fonts Not Loaded
**File:** `src/app/layout.tsx`  
Add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Condensed:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

### BUG-02 — Executive Summary AI Insight Text
**File:** `src/components/tabs/ExecutiveSummary.tsx`  
Replace `SYNTHETIC_INSIGHT` with:
```
"As of March 11, 2026 — L1 High SLA compliance is at 94.2%, within target range. 22 reapply-tagged transactions have active counterparty sanctions exposure requiring immediate review — estimated total exposure $4.1M across Type A records. 3 OFAC blocked account filings are pending within the 10-day regulatory window. List feed health is nominal across all 6 sources. No maker-checker exceptions detected in the current period."
```
Also update the `l1hCurr` KPI card static display value in `ExecutiveSummary` to reflect 94.2% consistently with the `AlertReview` tab.

### BUG-03 — FilterBar Reset Button Always Visible
**File:** `src/components/shell/FilterBar.tsx`  
Add `isDirty` computed boolean; conditionally render Reset button only when `isDirty === true`.

### BUG-04 — Hardcoded Date in FilterBar
**File:** `src/components/shell/FilterBar.tsx`  
Replace `"2026-03-11"` with `TODAY` imported from `@/lib/utils`.

### BUG-05 — Remove @ts-nocheck from AlertReview
**File:** `src/components/tabs/AlertReview.tsx`  
Remove `// @ts-nocheck`. Add import: `import type { DailySummary } from '@/types/index'`. Fix any remaining type errors properly.

### BUG-06 — BlockedAccounts Missing FilterState Props
**File:** `src/app/dashboard/page.tsx`  
Pass `filter={filter}` to `<BlockedAccounts />`. The component already accepts `FilterState` — the prop just wasn't being passed.

### BUG-07 — FilterBar Tier Not Syncing AlertReview
**File:** `src/components/tabs/AlertReview.tsx`  
Add `useEffect(() => { if (filters.tier && filters.tier !== 'all') { setActiveTier(filters.tier as ActiveTier); setDrillDown(null); } }, [filters.tier]);`

### BUG-08 — TabNav Breach Dots Are Hardcoded
**File:** `src/lib/breachState.ts` (create new), `src/components/shell/TabNav.tsx`  
Create `computeBreachMap()` that derives breach state from live data:
- Alert Review: amber if 7-day avg L1H SLA < 0.95
- Reapply Risk: red if any Type A `active_risk` records exist
- Disposition Quality: amber if latest `qaSetbackRate > 0.04`
- List Feed Health: red if `complete_failure` in last 7 days
Pass `breachMap` as a prop to `TabNav`.

### BUG-09 — KPICard CountUp Doesn't Re-fire on Tab Switch
**File:** `src/components/common/KPICard.tsx`  
Add `animationKey?: string | number` prop. Add to `useEffect` dependency array. Pass `animationKey={activeTab}` from `DashboardPage` through each tab to its KPI cards.

### QA-01 — Missing ARIA Attributes
**Files:** `TopNav.tsx`, `TabNav.tsx`, `FilterBar.tsx`, `dashboard/page.tsx`  
- `TopNav`: change `<nav>` to `<header role="banner">`
- `TabNav`: add `<nav aria-label="Dashboard tabs">`, `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `focus-visible:ring-2`
- `FilterBar`: add `role="toolbar" aria-label="Dashboard filters"`, `aria-pressed` on preset buttons
- `<main>`: add `role="tabpanel"` with `id` matching active tab

### QA-03 / QA-04 — Padding and Max-Width Consistency
**Files:** `AlertReview.tsx`, `BlockedAccounts.tsx`, `ReapplyRisk.tsx`  
Wrap all tab content roots in `<div className="p-6 space-y-6 max-w-[1440px] mx-auto">`.

### ENH-04 — DrillDownTable Height
**File:** `src/components/common/DrillDownTable.tsx`  
Change `max-h-64` to `max-h-[40vh]`.

### ENH-05 — Add Favicon
**File:** `src/app/layout.tsx`  
Add `icons: { icon: "/nationwide_logo.svg" }` to the metadata export (or any suitable SVG/ICO in `/public`).

---

## Phase 3 — New AML/BSA Feature Tabs

The requirements document defines **four AML/BSA domains** with KPIs and **four KRI domains**. The existing dashboard covers "Alert Management" (the first KPI domain) comprehensively. All other domains need new tabs.

### Navigation Restructure

Expand the tab nav from 6 to 9 tabs, organized into two logical groups:

**KPI Tabs (operational performance):**
1. Executive Summary *(existing — expand scope)*
2. Alert Management *(rename from "Alert Review")*
3. SAR/SIRF Reporting *(new)*
4. CIP/KYC Compliance *(new)*
5. Training & Culture *(new)*

**Monitoring & Risk Tabs:**
6. Blocked Accounts *(existing)*
7. Reapply Risk *(existing)*
8. Disposition Quality *(existing)*
9. List Feed Health *(existing)*
10. KRI Dashboard *(new — leading indicators panel)*

**`src/components/shell/TabNav.tsx`**  
Update the `tabs` array to include the four new tabs with appropriate Lucide icons:
- `"sar-sirf"` — icon: `FileText`, label: "SAR/SIRF Reporting"
- `"cip-kyc"` — icon: `UserCheck`, label: "CIP/KYC Compliance"
- `"training"` — icon: `GraduationCap`, label: "Training & Culture"
- `"kri-dashboard"` — icon: `Activity`, label: "KRI Dashboard"

**`src/types/index.ts`**  
Add `"sar-sirf" | "cip-kyc" | "training" | "kri-dashboard"` to the `TabId` union type.

**`src/app/dashboard/page.tsx`**  
Import and render the four new tab components.

---

### Tab 1 — SAR/SIRF Reporting (New)
**File:** `src/components/tabs/SarSirfReporting.tsx`

**Purpose:** Tracks internal referrals (SIRFs) and regulatory SAR filings. Per the requirements doc, for insurance companies under 31 CFR Part 1025, the 30-day SAR filing window is a hard regulatory requirement. Any late filing is a BSA violation.

**KPI Row (5 cards):**
| Label | Value | Status Logic |
|---|---|---|
| Total SIRFs Filed (Period) | ~142 | neutral — track trend |
| Total SARs Filed (Period) | ~34 | neutral — compare to prior period |
| SIRF-to-SAR Conversion Rate | ~24% | green if 15–25%, amber if <15%, red if <10% |
| Avg Days SIRF → SAR | ~18 days | green if ≤25d, amber if 26–30d, red if >30d |
| SARs Filed On Time | 100% | green if 100%, red if <100% |

**Charts:**
1. **SIRF Volume Trend** — `BarChart` weekly SIRF volume by source: "1st Line Associate" vs "2nd Line Monitoring". Distinguishing this split is key — the requirements doc notes that higher associate-sourced SIRFs indicates a healthier compliance culture. Color: `#003571` for 1st line, `#0065B3` for 2nd line.
2. **SAR Filing Timeliness** — `BarChart` or `AreaChart` showing % SARs filed on time each month over 12-month window. `ReferenceLine` at 100% target. Any dip below 100% renders the bar in `#E61030`.
3. **SIRF-to-SAR Conversion Trend** — `LineChart` 12-week conversion rate. `ReferenceLine` at 15% (lower bound of acceptable range) and 25% (upper bound — too-high conversion may signal over-referral).
4. **SAR Typology Breakdown** — `PieChart` (donut) showing count by typology category: Structuring, Rapid Movement, Third-Party Checks, Other. Use muted color palette (not the alert-status colors).

**Table:**
- **SAR Filing Log** — columns: SAR ID | SIRF Date | Detection Date | Filing Date | Days to File | Typology | Status (Filed On Time / Filed Late / Pending)
- Rows where Days to File > 30 render in `bg-[#FDEAED]` with a red `StatusBadge`
- Sortable by Date, Days to File, Status
- Pagination at 20 rows/page

**Synthetic Data to Create (`data/synthetic/sarSirf.ts`):**
```typescript
// Generate ~18 months of SIRF/SAR data
// SIRFs: ~8–12/month, split 60% 1st line / 40% 2nd line
// SARs: ~20–28% conversion rate
// All SARs filed within 30 days (100% compliant — clean baseline)
// Include 2 "near-miss" SARs filed at day 28–29 (show amber)
// Typologies: Structuring (35%), Rapid Movement (25%), Third-Party (20%), Other (20%)
export const SIRF_RECORDS: SirfRecord[]
export const SAR_RECORDS: SarRecord[]
export const SAR_TYPOLOGY_BREAKDOWN: { typology: string; count: number }[]
export const SIRF_WEEKLY: { weekStart: string; firstLine: number; secondLine: number; sarConversionRate: number }[]
```

**Types to add to `types/index.ts`:**
```typescript
interface SirfRecord {
  sirfId: string;
  detectionDate: string;
  source: 'first_line' | 'second_line';
  typology: string;
  sarId: string | null;
  escalatedToSar: boolean;
  daysToEscalate: number | null;
}

interface SarRecord {
  sarId: string;
  sirfId: string;
  detectionDate: string;
  filingDate: string;
  daysToFile: number;
  typology: string;
  status: 'filed_on_time' | 'filed_late' | 'pending';
  filingDeadline: string;
}
```

---

### Tab 2 — CIP/KYC Compliance (New)
**File:** `src/components/tabs/CipKycCompliance.tsx`

**Purpose:** Tracks Customer Identification Program and Know Your Customer compliance for insurance policy issuance. Under 31 CFR Part 1025.220, covered insurance companies must collect and verify specific identity fields at policy onboarding. Full-population testing (not sampling) is the maturity standard.

**KPI Row (5 cards):**
| Label | Value | Status Logic |
|---|---|---|
| New Policies — CIP Complete | 99.3% | green if 100%, amber if ≥99%, red if <99% |
| Null/Anomalous Identity Fields | 47 | red if >0, amber if discovered/pending fix |
| EDD Completion Rate | 98.1% | green if 100%, amber if ≥95%, red if <95% |
| High-Risk Customers Flagged | 23 (this period) | neutral — track QoQ trend |
| Overdue Periodic Reviews | 4 | red if any >0 (each overdue account = control gap) |

> Note: The requirements doc states "Target: 0%; each overdue account is a control gap." This makes the Overdue Periodic Reviews card always red if non-zero — model accordingly.

**Charts:**
1. **CIP Completion Rate Trend** — `LineChart` 12-month weekly CIP completion %. `ReferenceLine` at 100% target. Any dip below 99% renders in amber zone.
2. **Null Field Breakdown** — `BarChart` horizontal showing count of null/anomalous fields by field type: Full Name, DOB, Address, SSN/TIN. Color by severity — SSN/TIN nulls are `#E61030`, others `#F97316`.
3. **High-Risk Customer Additions** — `AreaChart` monthly new additions to high-risk watch list. Annotate any period with an unusually high spike.
4. **Overdue Review Aging** — `BarChart` stacked showing overdue reviews by age bucket: 0–30 days, 31–60 days, 61–90 days, 90+ days. Red intensifies with age.
5. **EDD Completion Rate** — Small `LineChart` or `KPICard` with sparkline, 12-week trend.

**Table:**
- **Null Field Exceptions Log** — columns: Policy ID | Admin System | Missing Field | Detected Date | Status (Open / Remediated) | Assigned Analyst
- Open exceptions render `bg-[#FDEAED]`
- Sortable by Date, Admin System, Field Type

**Synthetic Data to Create (`data/synthetic/cipKyc.ts`):**
```typescript
// 99.3% CIP completion across ~3,400 new policies in monitoring period
// 47 null fields: 18 missing SSN/TIN (red), 12 missing DOB, 10 address, 7 name anomalies
// 4 overdue periodic reviews (30–75 days overdue)
// High-risk customer additions: 8–15/month, with spike in month 9
// EDD: 98.1% — 3 accounts with EDD not yet completed (in progress)
export const CIP_EXCEPTIONS: CipException[]
export const CIP_WEEKLY: { weekStart: string; completionRate: number; nullFieldCount: number }[]
export const HIGH_RISK_MONTHLY: { month: string; newAdditions: number; totalActive: number }[]
export const EDD_STATUS: { total: number; completed: number; pending: number; overdue: number }
export const OVERDUE_REVIEWS: OverdueReview[]
```

**Types to add:**
```typescript
interface CipException {
  exceptionId: string;
  policyId: string;
  adminSystem: string; // e.g. "LifeComm", "iGO", "VANTAGE"
  missingField: 'full_name' | 'dob' | 'address' | 'ssn_tin';
  detectedDate: string;
  status: 'open' | 'remediated';
  analystId: string | null;
}

interface OverdueReview {
  reviewId: string;
  customerId: string;
  riskTier: 'high' | 'enhanced';
  lastReviewDate: string;
  dueDate: string;
  daysOverdue: number;
  assignedAnalyst: string;
}
```

---

### Tab 3 — Training & Culture (New)
**File:** `src/components/tabs/TrainingCulture.tsx`

**Purpose:** Training completion is a BSA program pillar and the primary source of associate-detection referrals in non-bank financial institutions. The requirements doc emphasizes that higher associate-sourced SIRF referrals indicate a healthier compliance culture.

**KPI Row (4 cards):**
| Label | Value | Status Logic |
|---|---|---|
| AML Training Completion | 97.2% | green if 100%, amber if ≥95%, red if <95% |
| Associates Overdue | 83 | amber if >0, red if >50 |
| Internal SIRF Referrals (Period) | 86 | neutral — track trend (higher = healthier culture) |
| Trend vs Prior Period | +12% | green if positive trend, amber if flat, red if declining |

**Charts:**
1. **Training Completion by LOB** — `BarChart` horizontal showing completion % per line of business. Reference line at 100% target. LOBs below 95% render in `#E61030`. Expected LOBs: Life Insurance, Annuities, Property & Casualty, Commercial, Financial Services, Other.
2. **Associate Detection Referrals — Monthly Trend** — `AreaChart` showing SIRF referrals sourced from trained associates over 12 months. Use `#003571` fill with gradient. Annotate any spike months.
3. **Training Completion Trend** — `LineChart` 12-month completion rate. `ReferenceLine` at 100% and 95% (warning threshold).
4. **Overdue Associates by LOB** — `BarChart` stacked by LOB showing count of associates with overdue training. Color: `#E61030`.

**Summary Panel:**
- A summary card showing overall program health: "X of Y associates trained · Z LOBs below target · Training due date: [date]"
- If any LOB is below 95%, show a warning alert banner (using `shadcn/alert` pattern already in codebase)

**Synthetic Data to Create (`data/synthetic/training.ts`):**
```typescript
// 97.2% overall completion — 83 associates overdue
// 6 LOBs with varying rates: Life 99.1%, Annuities 98.7%, P&C 97.5%, Commercial 96.2%, FinSvcs 94.8% (amber), Other 91.3% (red)
// SIRF referrals: 70–95/month, generally trending upward (+12% YoY)
// Training window: Jan 1 – Dec 31 annual
export const TRAINING_BY_LOB: { lob: string; totalAssociates: number; completedCount: number; completionRate: number; overdueCount: number }[]
export const TRAINING_MONTHLY: { month: string; completionRate: number; associateSirfReferrals: number }[]
export const TRAINING_SUMMARY: { totalAssociates: number; completed: number; overdue: number; dueDate: string }
```

---

### Tab 4 — KRI Dashboard (New)
**File:** `src/components/tabs/KriDashboard.tsx`

**Purpose:** Key Risk Indicators are leading indicators — they predict future control failures before KPIs degrade. This is the most strategically differentiated tab in the framework. Per the requirements doc, most institutions track KPIs but lack a formal KRI program. This tab fills that gap.

**Design approach:** Use a **heat-map-style grid** showing all KRIs organized by domain, with status color (green/amber/red) at a glance. Clicking any KRI opens a detail card with the current value, threshold, trend sparkline, and recommended action.

**Four KRI Domains (matching the requirements doc exactly):**

#### Domain 1: Monitoring Program Risk
| KRI | Current Value | Trigger | Status |
|---|---|---|---|
| Rules Not Reviewed in >12 Months | 3 rules | Any = red | 🔴 Red |
| Admin Systems NOT Feeding TM | 1 system | Any = red | 🔴 Red |
| Monitoring Population Coverage % | 97.4% | <100% = amber | 🟡 Amber |
| OFAC Screening Feed Completeness | 6/6 feeds nominal | Any offline = red | 🟢 Green |
| Days Since Last Model Validation | 287 days | >365 = red, >180 = amber | 🟡 Amber |

#### Domain 2: Typology & Trend Risk
| KRI | Current Value | Trigger | Status |
|---|---|---|---|
| Consecutive Policy Loan SAR Cases QoQ | +8% | >10% QoQ increase | 🟢 Green |
| Large/Rapid Cash-Value Surrenders Flagged | 14 this period | Spike above 3-month avg | 🟡 Amber |
| Elder Exploitation Case Volume Trend | Flat | Any upward trend | 🟢 Green |
| 314(a) Matches with SAR-able Activity | 2 | Any unresolved investigation | 🔴 Red |
| Cases Linked to Single Agent/Producer | Max: 2 cases | ≥3 linked = review | 🟢 Green |

#### Domain 3: Regulatory & Program Risk
| KRI | Current Value | Trigger | Status |
|---|---|---|---|
| Days Since Last AML Program Review | 183 days | >365 = red | 🟢 Green |
| Open Audit Findings >90 Days | 2 findings | Any >90 days past due | 🔴 Red |
| Repeat Audit Findings YoY | 1 finding | Any repeat = elevated | 🔴 Red |
| BSA Regulatory Change Lag | 94 days | >180 = red | 🟢 Green |
| Entities Without Current Risk Assessment | 0 | Any without <12mo assessment | 🟢 Green |

#### Domain 4: Operational & Capacity Risk
| KRI | Current Value | Trigger | Status |
|---|---|---|---|
| Investigator Caseload (open cases/FTE) | 11.4 avg | >15 = escalate | 🟢 Green |
| Investigations Approaching 50-Day Threshold | 7 cases | Any case at day 50 | 🟡 Amber |
| Watch List Overdue for Periodic Review | 4 accounts | Any past review cycle | 🔴 Red |
| Cases in QC Queue >5 Days | 2 cases | ≥3 queued >5d | 🟢 Green |

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ KRI SUMMARY BANNER — [4 red] [5 amber] [11 green]           │
│ "4 KRIs require immediate management attention"             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────┬────────────────┬─────────────────┬────────┐
│ Monitoring      │ Typology       │ Regulatory      │ Ops    │
│ Program Risk    │ & Trend Risk   │ & Program Risk  │ Risk   │
│ ─────────────── │ ────────────── │ ─────────────── │ ─────  │
│ [KRI Grid 5×1]  │ [KRI Grid 5×1] │ [KRI Grid 5×1]  │ [4×1]  │
└─────────────────┴────────────────┴─────────────────┴────────┘
```

Each KRI cell:
- Header: KRI name (small, uppercase, `text-[10px]`)
- Large value: current metric value (`font-condensed font-bold text-xl`)
- Status badge: green/amber/red pill
- Trigger threshold in small text (`text-[10px] text-[#8699AF]`)
- Tiny sparkline (6-point, `height={28}` Recharts inline)
- Click → detail card drawer or expand-in-place panel

**Detail Panel (on KRI click):**
- KRI description from requirements doc
- Current value vs threshold
- 90-day trend chart (Recharts LineChart)
- Recommended management action
- Measurement cadence (Daily/Weekly/Monthly/Quarterly)
- "Future Feature" lock icon on escalation routing

**Summary bar at top:**
- Count of red / amber / green KRIs
- Highest-severity KRI callout: "Immediate attention: [X] — 2 open audit findings overdue 90+ days"

**Synthetic Data to Create (`data/synthetic/kri.ts`):**
```typescript
export interface KriRecord {
  kriId: string;
  domain: 'monitoring_program' | 'typology_trend' | 'regulatory_program' | 'operational_capacity';
  name: string;
  description: string;
  currentValue: number | string;
  currentValueDisplay: string; // formatted for display
  triggerThreshold: string; // human-readable
  status: 'green' | 'amber' | 'red';
  trend: number[]; // last 6 periods
  measurementCadence: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recommendedAction: string;
}

export const KRI_DATA: KriRecord[] // all 19 KRIs defined above
export const KRI_SUMMARY: { red: number; amber: number; green: number; totalCount: number }
```

Populate `KRI_DATA` with all 19 records from the table above, including their trend arrays (6 data points each). Make sure red KRIs have visible deteriorating trends in their sparklines.

---

## Phase 3B — Update Executive Summary for Full AML/BSA Scope

**File:** `src/components/tabs/ExecutiveSummary.tsx`

### Expand KPI Row from 4 to 8 Cards

The current 4-card KPI row covers only Sanctions/Reapply metrics. Expand to represent all six dashboard areas plus two new AML/BSA domains:

| # | Label | Value | Status | Links to Tab |
|---|---|---|---|---|
| 1 | L1 High SLA Compliance | 94.2% | amber | Alert Management |
| 2 | Maker-Checker Compliance | 99.8% | green | Alert Management |
| 3 | Active Type A Reapply | 22 records | red | Reapply Risk |
| 4 | Overdue OFAC Filings | 3 accounts | amber | Blocked Accounts |
| 5 | SARs Filed On Time | 100% | green | SAR/SIRF Reporting |
| 6 | CIP Completion Rate | 99.3% | amber (not 100%) | CIP/KYC Compliance |
| 7 | AML Training Completion | 97.2% | amber | Training & Culture |
| 8 | KRI Alerts (Red) | 4 indicators | red | KRI Dashboard |

**Each card must be clickable** — `onClick={() => onTabChange(targetTabId)}`. This requires passing `onTabChange` as a prop into `ExecutiveSummary`. Update `DashboardPage` to pass `onTabChange={setActiveTab}`.

### Add KRI Alert Summary Panel

Below the 8-card KPI row, add a new **KRI Alert Summary** panel that lists the 4 red KRIs:
- "2 monitoring rules not reviewed in >12 months — Monitoring Program Risk"
- "1 admin system not feeding transaction monitoring — Monitoring Program Risk"
- "2 open audit findings overdue >90 days — Regulatory & Program Risk"
- "1 repeat audit finding year-over-year — Regulatory & Program Risk"

Each line has a `→` link that navigates to the KRI Dashboard tab.

### Update AI Insight Banner

Update `SYNTHETIC_INSIGHT` to cover the full AML/BSA picture:
```
"As of March 11, 2026 — AML/BSA program operating with 4 KRI alerts requiring management attention. 
22 reapply transactions carry active OFAC counterparty exposure ($4.1M estimated). 
2 monitoring model rules have not been reviewed in >12 months — stale rules risk undetected typology drift. 
SAR filing timeliness remains at 100% compliance. CIP completion at 99.3% — 47 null identity fields pending remediation across 3 admin systems. 
Training completion at 97.2% with Financial Services LOB below the 95% threshold."
```

---

## Phase 3C — Update Existing Tabs for Broader Terminology

### Alert Management Tab (was "Alert Review")
**File:** `src/components/tabs/AlertReview.tsx`  
- Update tab title and any internal headers from "Alert Review" to "Alert Management" to align with the requirements doc's domain name
- Add a subtle **false positive rate** KPI card alongside the SLA cards in the L1 view. The requirements doc lists "False positive rate (% alerts closed without investigation)" with a benchmark of `<90%` with `>95%` indicating tuning needed. Derive this from `ALERT_RECORDS` where `disposition === 'closed_no_investigation'`. Display as `~88%` (green, within range).
- Update escalation email contacts to `aml-lead@nationwide.com` and `compliance-director@nationwide.com` (replacing sanctions-specific titles)

### Disposition Quality Tab
**File:** `src/components/tabs/DispositionQuality.tsx`  
- Add an **Alert-to-SAR Conversion Rate** KPI card (derived from `SAR_RECORDS.length / totalAlerts`) — this bridges the gap between Disposition and SAR/SIRF tracking
- Add a **Reapply Connection Callout** card at the bottom (currently in COMPONENT_INVENTORY as FEAT item): "22 active reapply transactions flagged. Incorrect disposition at original approval may have enabled indefinite straight-through processing." + "View Reapply Risk →" button

---

## File Change Summary

| File | Change Type | Phase |
|------|-------------|-------|
| `COMPONENT_INVENTORY.md` | BoA scrub | 1 |
| `FIXES-AND-ENHANCEMENTS.md` | BoA scrub | 1 |
| `HANDOFF.md` | BoA scrub | 1 |
| `SANCTIONS-DASHBOARD-PRD.md` | BoA scrub | 1 |
| `src/app/layout.tsx` | Font fix + title update + favicon | 1 + 2 |
| `src/components/shell/TopNav.tsx` | Title text update | 1 |
| `src/components/shell/TabNav.tsx` | Add 4 new tabs + breach dot fix | 2 + 3 |
| `src/components/shell/FilterBar.tsx` | Reset button + date fix | 2 |
| `src/components/common/KPICard.tsx` | animationKey prop | 2 |
| `src/components/common/DrillDownTable.tsx` | Max height | 2 |
| `src/lib/breachState.ts` | New file — breach computation | 2 |
| `src/app/dashboard/page.tsx` | New imports, onTabChange to ExecSummary, BlockedAccounts fix | 2 + 3 |
| `src/components/tabs/ExecutiveSummary.tsx` | Insight text, 8-card KPI row, KRI panel, chart | 2 + 3 |
| `src/components/tabs/AlertReview.tsx` | ts-nocheck, tier sync, padding, false positive KPI | 2 + 3 |
| `src/components/tabs/BlockedAccounts.tsx` | Max-width, FilterState props | 2 |
| `src/components/tabs/ReapplyRisk.tsx` | Max-width fix | 2 |
| `src/components/tabs/DispositionQuality.tsx` | Alert-to-SAR card, Reapply callout | 3 |
| `src/components/tabs/SarSirfReporting.tsx` | **New file** | 3 |
| `src/components/tabs/CipKycCompliance.tsx` | **New file** | 3 |
| `src/components/tabs/TrainingCulture.tsx` | **New file** | 3 |
| `src/components/tabs/KriDashboard.tsx` | **New file** | 3 |
| `data/synthetic/sarSirf.ts` | **New file** | 3 |
| `data/synthetic/cipKyc.ts` | **New file** | 3 |
| `data/synthetic/training.ts` | **New file** | 3 |
| `data/synthetic/kri.ts` | **New file** | 3 |
| `types/index.ts` | New interfaces, expanded TabId union | 3 |

---

## Build Verification

After each phase, run:
```bash
npm run build
npx tsc --noEmit
```
Both must exit `0` with no errors or warnings before proceeding to the next phase.

---

## Design Constraints (Do Not Change)

- Color palette: `#003571` (navy), `#0065B3` (blue), `#E61030` (red), `#F97316` (orange), `#D97706` (amber), `#16A34A` (green)
- Typography: IBM Plex Sans (body), IBM Plex Sans Condensed (KPI numbers), IBM Plex Mono (IDs/codes)
- Chart library: Recharts only (already installed)
- UI components: shadcn/ui (already installed)
- The `viewMode: 'split' | 'combined'` pattern from FilterBar must be respected in all new tabs that have data that can be split by Relationship vs Transaction alert type. For SAR/SIRF, CIP/KYC, Training, and KRI — these do not split by alert type, so `viewMode` is irrelevant; render them the same regardless of split/combine toggle.
- All new tabs must use `<div className="p-6 space-y-6 max-w-[1440px] mx-auto">` as the root wrapper.
- The existing escalation tooltip pattern (hover-triggered, `pointer-events-none`, "Future Feature" lock icon) must be used on any escalation-related KPI cards in new tabs.
- The "Prototype — Synthetic Data" badge visual language must remain consistent.

---

## Measurement Cadence Reference

Per the requirements doc, use these cadences when labeling chart time axes:

| Metric Category | Cadence |
|---|---|
| Alert SLA aging, 50-day threshold cases, OFAC feed status | Daily / Real-time |
| Investigator caseload, QC queue depth, new SIRF volume | Weekly |
| SAR conversion rate, false positive rate, open findings aging, typology trends | Monthly |
| KRI dashboard review, training completion, coverage gap assessment | Quarterly |
| Full program review per entity, regulatory mapping refresh, model validation | Annually |

Use these cadences to determine the appropriate chart time axis — weekly charts for SIRF volume, monthly charts for SAR conversion rate, etc.
