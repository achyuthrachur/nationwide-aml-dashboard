import type { KriRecord, KriSummary } from "@/types/index";

// ---------------------------------------------------------------------------
// KRI Dashboard – deterministic synthetic data
// 19 KRIs across 4 domains.  NO Math.random().
// ---------------------------------------------------------------------------

export const KRI_DATA: KriRecord[] = [
  // =========================================================================
  // Domain 1 — Monitoring Program Risk  (5 KRIs)
  // =========================================================================
  {
    kriId: "KRI-MP-001",
    domain: "monitoring_program",
    name: "Rules Not Reviewed >12 Months",
    description:
      "Count of transaction-monitoring rules whose last review date exceeds 12 months. Stale rules may fail to detect emerging typologies or generate excessive false positives.",
    currentValue: 3,
    currentValueDisplay: "3 rules",
    triggerThreshold: "≥ 1 rule",
    status: "red",
    trend: [0, 1, 1, 2, 2, 3],
    measurementCadence: "monthly",
    recommendedAction:
      "Initiate an expedited rule-review cycle for the three overdue rules and update the review schedule to prevent future lapses.",
  },
  {
    kriId: "KRI-MP-002",
    domain: "monitoring_program",
    name: "Admin Systems NOT Feeding TM",
    description:
      "Number of administration systems whose data feeds are not connected to the transaction-monitoring platform. Missing feeds create blind spots in surveillance coverage.",
    currentValue: 1,
    currentValueDisplay: "1 system",
    triggerThreshold: "≥ 1 system",
    status: "red",
    trend: [0, 0, 0, 0, 1, 1],
    measurementCadence: "monthly",
    recommendedAction:
      "Engage IT and the vendor to restore or establish the data feed from the disconnected admin system within 30 days.",
  },
  {
    kriId: "KRI-MP-003",
    domain: "monitoring_program",
    name: "Monitoring Population Coverage",
    description:
      "Percentage of in-scope accounts and policies actively monitored by the TM system. Declining coverage may indicate onboarding gaps or feed failures.",
    currentValue: 97.4,
    currentValueDisplay: "97.4%",
    triggerThreshold: "< 98%",
    status: "amber",
    trend: [99.1, 98.8, 98.5, 98.0, 97.7, 97.4],
    measurementCadence: "weekly",
    recommendedAction:
      "Investigate the root cause of the declining coverage trend and reconcile the monitoring population against the master account register.",
  },
  {
    kriId: "KRI-MP-004",
    domain: "monitoring_program",
    name: "OFAC Screening Feed Completeness",
    description:
      "Ratio of OFAC screening list feeds confirmed current and complete versus total expected feeds. Full completeness is critical for sanctions compliance.",
    currentValue: "6/6 nominal",
    currentValueDisplay: "6/6 nominal",
    triggerThreshold: "< 6/6",
    status: "green",
    trend: [6, 6, 6, 6, 6, 6],
    measurementCadence: "daily",
    recommendedAction:
      "No action required. Continue daily validation of all six OFAC screening feeds.",
  },
  {
    kriId: "KRI-MP-005",
    domain: "monitoring_program",
    name: "Days Since Last Model Validation",
    description:
      "Elapsed calendar days since the most recent independent validation of the transaction-monitoring model. Regulatory guidance expects validation at least annually.",
    currentValue: 287,
    currentValueDisplay: "287 days",
    triggerThreshold: "≥ 270 days",
    status: "amber",
    trend: [197, 215, 233, 251, 269, 287],
    measurementCadence: "monthly",
    recommendedAction:
      "Schedule the next independent model validation within 30 days to remain within the annual validation window.",
  },

  // =========================================================================
  // Domain 2 — Typology & Trend Risk  (5 KRIs)
  // =========================================================================
  {
    kriId: "KRI-TT-001",
    domain: "typology_trend",
    name: "Consecutive Policy Loan SAR Cases QoQ",
    description:
      "Quarter-over-quarter percentage change in SAR filings linked to suspicious policy-loan activity. Sustained increases may indicate an emerging typology.",
    currentValue: 8,
    currentValueDisplay: "+8%",
    triggerThreshold: "> 15% QoQ",
    status: "green",
    trend: [2, 3, 2, 4, 3, 3],
    measurementCadence: "quarterly",
    recommendedAction:
      "No action required. Continue monitoring the trend for consecutive quarterly increases.",
  },
  {
    kriId: "KRI-TT-002",
    domain: "typology_trend",
    name: "Large/Rapid Cash-Value Surrenders",
    description:
      "Count of cash-value surrender transactions exceeding size or velocity thresholds within the reporting period. Rapid surrenders may signal placement or layering activity.",
    currentValue: 14,
    currentValueDisplay: "14",
    triggerThreshold: "≥ 12",
    status: "amber",
    trend: [8, 9, 10, 11, 12, 14],
    measurementCadence: "monthly",
    recommendedAction:
      "Conduct a thematic review of recent large/rapid surrender cases and assess whether rule thresholds require recalibration.",
  },
  {
    kriId: "KRI-TT-003",
    domain: "typology_trend",
    name: "Elder Exploitation Case Volume",
    description:
      "Number of investigation cases flagged for potential elder financial exploitation during the period. Stable volume indicates consistent detection; spikes warrant deeper review.",
    currentValue: "Flat",
    currentValueDisplay: "Flat",
    triggerThreshold: "> 8 cases/month",
    status: "green",
    trend: [5, 4, 5, 5, 4, 5],
    measurementCadence: "monthly",
    recommendedAction:
      "No action required. Volume remains stable within expected range.",
  },
  {
    kriId: "KRI-TT-004",
    domain: "typology_trend",
    name: "314(a) Matches with SAR-able Activity",
    description:
      "Number of FinCEN 314(a) information-sharing matches where the matched subject also has SAR-reportable activity. Rising matches may indicate heightened exposure to law-enforcement subjects.",
    currentValue: 2,
    currentValueDisplay: "2",
    triggerThreshold: "≥ 2",
    status: "red",
    trend: [0, 0, 1, 1, 1, 2],
    measurementCadence: "monthly",
    recommendedAction:
      "Escalate to the BSA Officer for review. Assess whether the matched subjects share common attributes that warrant a broader look-back.",
  },
  {
    kriId: "KRI-TT-005",
    domain: "typology_trend",
    name: "Cases Linked to Single Agent/Producer",
    description:
      "Maximum number of open investigation cases associated with any single insurance agent or producer. Concentration may indicate facilitator risk.",
    currentValue: "Max: 2",
    currentValueDisplay: "Max: 2",
    triggerThreshold: "≥ 3 cases",
    status: "green",
    trend: [1, 1, 2, 1, 2, 2],
    measurementCadence: "monthly",
    recommendedAction:
      "No action required. Continue monitoring for agent-level concentration patterns.",
  },

  // =========================================================================
  // Domain 3 — Regulatory & Program Risk  (5 KRIs)
  // =========================================================================
  {
    kriId: "KRI-RP-001",
    domain: "regulatory_program",
    name: "Days Since Last AML Program Review",
    description:
      "Elapsed calendar days since the most recent comprehensive review of the AML/BSA program. Regular reviews ensure the program remains adequate for evolving risk.",
    currentValue: 183,
    currentValueDisplay: "183 days",
    triggerThreshold: "≥ 330 days",
    status: "green",
    trend: [93, 111, 129, 147, 165, 183],
    measurementCadence: "monthly",
    recommendedAction:
      "No action required. The next program review should be planned within the coming quarter to stay ahead of the annual cycle.",
  },
  {
    kriId: "KRI-RP-002",
    domain: "regulatory_program",
    name: "Open Audit Findings >90 Days",
    description:
      "Count of audit findings that remain open beyond the 90-day remediation window. Aging findings increase regulatory and reputational risk.",
    currentValue: 2,
    currentValueDisplay: "2 findings",
    triggerThreshold: "≥ 1 finding",
    status: "red",
    trend: [0, 0, 1, 1, 1, 2],
    measurementCadence: "monthly",
    recommendedAction:
      "Escalate the two overdue findings to senior management and establish remediation milestones with accountable owners.",
  },
  {
    kriId: "KRI-RP-003",
    domain: "regulatory_program",
    name: "Repeat Audit Findings YoY",
    description:
      "Number of audit findings that recurred within the current year after being closed in the prior year. Repeat findings indicate ineffective root-cause remediation.",
    currentValue: 1,
    currentValueDisplay: "1 finding",
    triggerThreshold: "≥ 1 finding",
    status: "red",
    trend: [0, 0, 0, 0, 0, 1],
    measurementCadence: "quarterly",
    recommendedAction:
      "Conduct a root-cause analysis of the repeat finding and implement durable controls to prevent recurrence.",
  },
  {
    kriId: "KRI-RP-004",
    domain: "regulatory_program",
    name: "BSA Regulatory Change Lag",
    description:
      "Average number of calendar days between publication of a BSA/AML regulatory change and full implementation in Nationwide's program. Lower lag reduces compliance exposure.",
    currentValue: 94,
    currentValueDisplay: "94 days",
    triggerThreshold: "≥ 120 days",
    status: "green",
    trend: [120, 110, 100, 98, 96, 94],
    measurementCadence: "quarterly",
    recommendedAction:
      "No action required. Implementation lag continues to trend downward. Maintain current regulatory-change-management processes.",
  },
  {
    kriId: "KRI-RP-005",
    domain: "regulatory_program",
    name: "Entities Without Current Risk Assessment",
    description:
      "Number of in-scope legal entities lacking a current enterprise-wide BSA/AML risk assessment. Missing assessments leave risk exposure unquantified.",
    currentValue: 0,
    currentValueDisplay: "0",
    triggerThreshold: "≥ 1 entity",
    status: "green",
    trend: [2, 1, 1, 0, 0, 0],
    measurementCadence: "quarterly",
    recommendedAction:
      "No action required. All entities have current risk assessments. Continue the scheduled assessment refresh cycle.",
  },

  // =========================================================================
  // Domain 4 — Operational & Capacity Risk  (4 KRIs)
  // =========================================================================
  {
    kriId: "KRI-OC-001",
    domain: "operational_capacity",
    name: "Investigator Caseload (open/FTE)",
    description:
      "Average number of open investigation cases per full-time-equivalent investigator. Elevated caseloads increase the risk of missed red flags and untimely SAR filings.",
    currentValue: 11.4,
    currentValueDisplay: "11.4",
    triggerThreshold: "≥ 14.0",
    status: "green",
    trend: [10.2, 10.8, 11.0, 11.1, 11.2, 11.4],
    measurementCadence: "weekly",
    recommendedAction:
      "No action required. Caseload is within acceptable limits but trending upward; monitor for sustained increases.",
  },
  {
    kriId: "KRI-OC-002",
    domain: "operational_capacity",
    name: "Investigations Near 50-Day Threshold",
    description:
      "Count of open investigations that have reached or are within 5 days of the 50-calendar-day internal completion target. Breaches may trigger regulatory scrutiny.",
    currentValue: 7,
    currentValueDisplay: "7",
    triggerThreshold: "≥ 5",
    status: "amber",
    trend: [3, 4, 5, 5, 6, 7],
    measurementCadence: "weekly",
    recommendedAction:
      "Reassign or prioritize the seven near-threshold cases to ensure completion before the 50-day deadline.",
  },
  {
    kriId: "KRI-OC-003",
    domain: "operational_capacity",
    name: "Watch List Overdue for Periodic Review",
    description:
      "Number of internal watch-list entries whose periodic review date has passed without completion. Overdue reviews leave potentially outdated risk classifications in place.",
    currentValue: 4,
    currentValueDisplay: "4",
    triggerThreshold: "≥ 2",
    status: "red",
    trend: [1, 1, 2, 2, 3, 4],
    measurementCadence: "monthly",
    recommendedAction:
      "Assign dedicated resources to clear the four overdue watch-list reviews within the next two weeks and reinforce the periodic-review schedule.",
  },
  {
    kriId: "KRI-OC-004",
    domain: "operational_capacity",
    name: "Cases in QC Queue >5 Days",
    description:
      "Number of completed investigation cases awaiting quality-control review for more than five business days. Prolonged QC backlogs delay SAR filing timelines.",
    currentValue: 2,
    currentValueDisplay: "2",
    triggerThreshold: "≥ 4",
    status: "green",
    trend: [3, 2, 3, 2, 2, 2],
    measurementCadence: "weekly",
    recommendedAction:
      "No action required. QC queue is within target. Continue monitoring for backlog accumulation.",
  },
];

// ---------------------------------------------------------------------------
// Aggregate summary — 6 red, 4 amber, 9 green, 19 total
// (Derived from individual KRI statuses above)
// ---------------------------------------------------------------------------
export const KRI_SUMMARY: KriSummary = {
  red: 6,
  amber: 4,
  green: 9,
  totalCount: 19,
};
