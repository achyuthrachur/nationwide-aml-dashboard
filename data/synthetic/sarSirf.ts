import type { SirfRecord, SarRecord } from "@/types/index";

// ============================================================
// SAR / SIRF Synthetic Data — Oct 2024 through Mar 2026 (~18 months)
// All values DETERMINISTIC — no Math.random().
//
// SIRFs: ~8-12 per month, 60% first_line / 40% second_line, ~142 total
// SARs:  ~20-28% conversion rate, ~34 total, 100% filed on time
// Includes 2 "near-miss" SARs filed at day 28-29
// Typology mix: Structuring 35%, Rapid Movement 25%,
//               Third-Party 20%, Other 20%
// ============================================================

// --- Helpers ---

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Simple deterministic hash: takes a seed index, returns a stable integer */
function deterministicHash(seed: number): number {
  let h = seed * 2654435761; // Knuth multiplicative hash
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = (h >>> 16) ^ h;
  return Math.abs(h);
}

/** Return a Monday-based week start for a given ISO date */
function weekStartFor(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const dow = d.getUTCDay(); // 0=Sun
  const diff = dow === 0 ? 6 : dow - 1; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

// --- Typology distribution ---

const TYPOLOGIES = [
  "Structuring",
  "Rapid Movement of Funds",
  "Third-Party Transactions",
  "Other",
] as const;

// Pre-built 20-slot cycle matching exact target percentages:
// Structuring: 7/20=35%, Rapid Movement: 5/20=25%, Third-Party: 4/20=20%, Other: 4/20=20%
// Shuffled deterministically so adjacent SIRFs don't always share a typology.
const TYPOLOGY_CYCLE: string[] = [
  TYPOLOGIES[0], TYPOLOGIES[1], TYPOLOGIES[2], TYPOLOGIES[3], // S, R, T, O
  TYPOLOGIES[0], TYPOLOGIES[2], TYPOLOGIES[1], TYPOLOGIES[0], // S, T, R, S
  TYPOLOGIES[3], TYPOLOGIES[0], TYPOLOGIES[1], TYPOLOGIES[2], // O, S, R, T
  TYPOLOGIES[3], TYPOLOGIES[0], TYPOLOGIES[1], TYPOLOGIES[0], // O, S, R, S
  TYPOLOGIES[2], TYPOLOGIES[3], TYPOLOGIES[1], TYPOLOGIES[0], // T, O, R, S
];
// Counts: S=7, R=5, T=4, O=4 — exactly matches target weights

function typologyForIndex(idx: number): string {
  // Cycle guarantees exact distribution over every 20 items;
  // the shuffled order avoids obvious sequential patterns.
  return TYPOLOGY_CYCLE[idx % 20];
}

// --- Month definitions: Oct 2024 – Mar 2026 (18 months) ---

interface MonthSpec {
  year: number;
  month: number; // 1-based
  sirfCount: number;
}

// Deterministic per-month SIRF counts (8-12 range), totalling ~142
const MONTH_SPECS: MonthSpec[] = [
  { year: 2024, month: 10, sirfCount: 8 },
  { year: 2024, month: 11, sirfCount: 9 },
  { year: 2024, month: 12, sirfCount: 7 },
  { year: 2025, month: 1, sirfCount: 8 },
  { year: 2025, month: 2, sirfCount: 9 },
  { year: 2025, month: 3, sirfCount: 8 },
  { year: 2025, month: 4, sirfCount: 7 },
  { year: 2025, month: 5, sirfCount: 8 },
  { year: 2025, month: 6, sirfCount: 9 },
  { year: 2025, month: 7, sirfCount: 8 },
  { year: 2025, month: 8, sirfCount: 7 },
  { year: 2025, month: 9, sirfCount: 8 },
  { year: 2025, month: 10, sirfCount: 9 },
  { year: 2025, month: 11, sirfCount: 8 },
  { year: 2025, month: 12, sirfCount: 7 },
  { year: 2026, month: 1, sirfCount: 8 },
  { year: 2026, month: 2, sirfCount: 8 },
  { year: 2026, month: 3, sirfCount: 6 },
];
// Total: 8+9+7+8+9+8+7+8+9+8+7+8+9+8+7+8+8+6 = 142

// --- Deterministic day offsets within a month (spread SIRFs across the month) ---
// For a given month & SIRF index, pick a day offset deterministically
function dayInMonth(monthIdx: number, sirfIdx: number, maxDay: number): number {
  const h = deterministicHash(monthIdx * 100 + sirfIdx * 7 + 31);
  return (h % maxDay) + 1; // 1-based day
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// --- Deterministic SAR escalation selection ---
// We need ~34 SARs out of 142 SIRFs (~23.9% conversion)
// Mark specific SIRF indices as escalated using a deterministic pattern.
// We select every ~4th SIRF with some hash-based jitter.

function shouldEscalateToSar(globalSirfIdx: number): boolean {
  // Use a deterministic pattern: hash the index, check modulus
  const h = deterministicHash(globalSirfIdx * 13 + 53);
  // ~24% selection rate: h % 100 < 24
  return (h % 100) < 24;
}

// --- Days-to-file for SAR (all within 30 days, deterministic) ---
// Two near-miss SARs at indices that map to day 28-29

const NEAR_MISS_SAR_INDICES = new Set([4, 21]); // SAR global indices (0-based)

function daysToFileForSar(sarGlobalIdx: number, globalSirfIdx: number): number {
  if (NEAR_MISS_SAR_INDICES.has(sarGlobalIdx)) {
    // Near-miss: 28 or 29 days
    return sarGlobalIdx === 4 ? 28 : 29;
  }
  // Deterministic 5-25 day range
  const h = deterministicHash(globalSirfIdx * 11 + 71);
  return 5 + (h % 21); // 5..25
}

// --- Days-to-escalate (how many days from SIRF detection to SAR escalation decision) ---
function daysToEscalateForSirf(globalSirfIdx: number): number {
  const h = deterministicHash(globalSirfIdx * 19 + 43);
  return 1 + (h % 10); // 1..10 days
}

// --- Source assignment: 60% first_line / 40% second_line ---
// 10-slot cycle: 6 first_line, 4 second_line, shuffled to avoid obvious patterns
const SOURCE_CYCLE: Array<"first_line" | "second_line"> = [
  "first_line", "second_line", "first_line", "first_line", "second_line",
  "first_line", "second_line", "first_line", "second_line", "first_line",
];

function sourceForIndex(globalSirfIdx: number): "first_line" | "second_line" {
  return SOURCE_CYCLE[globalSirfIdx % 10];
}

// ============================================================
// GENERATION
// ============================================================

function generateData(): {
  sirfRecords: SirfRecord[];
  sarRecords: SarRecord[];
} {
  const sirfRecords: SirfRecord[] = [];
  const sarRecords: SarRecord[] = [];
  let globalSirfIdx = 0;
  let globalSarIdx = 0;

  for (let mi = 0; mi < MONTH_SPECS.length; mi++) {
    const spec = MONTH_SPECS[mi];
    const maxDay = daysInMonth(spec.year, spec.month);

    for (let si = 0; si < spec.sirfCount; si++) {
      const day = dayInMonth(mi, si, maxDay);
      const dateStr = `${spec.year}-${pad2(spec.month)}-${pad2(day)}`;
      const sirfId = `SIRF-${String(globalSirfIdx + 1).padStart(4, "0")}`;
      const typology = typologyForIndex(globalSirfIdx);
      const source = sourceForIndex(globalSirfIdx);
      const escalated = shouldEscalateToSar(globalSirfIdx);

      let sarId: string | null = null;
      let daysToEscalate: number | null = null;

      if (escalated) {
        sarId = `SAR-${String(globalSarIdx + 1).padStart(4, "0")}`;
        daysToEscalate = daysToEscalateForSirf(globalSirfIdx);
        const daysToFile = daysToFileForSar(globalSarIdx, globalSirfIdx);
        const filingDate = addDays(dateStr, daysToFile);
        const filingDeadline = addDays(dateStr, 30);

        sarRecords.push({
          sarId,
          sirfId,
          detectionDate: dateStr,
          filingDate,
          daysToFile,
          typology,
          status: "filed_on_time",
          filingDeadline,
        });
        globalSarIdx++;
      }

      sirfRecords.push({
        sirfId,
        detectionDate: dateStr,
        source,
        typology,
        sarId,
        escalatedToSar: escalated,
        daysToEscalate,
      });

      globalSirfIdx++;
    }
  }

  return { sirfRecords, sarRecords };
}

// --- Post-generation: adjust SAR count to exactly 34 if needed ---
// The hash-based selection may not land exactly on 34. We handle this
// by running the generation once and then applying a correction pass.

function generateCalibratedData(): {
  sirfRecords: SirfRecord[];
  sarRecords: SarRecord[];
} {
  // First pass: see what the hash gives us
  const firstPass = generateData();
  const currentSarCount = firstPass.sarRecords.length;
  const TARGET_SAR_COUNT = 34;

  if (currentSarCount === TARGET_SAR_COUNT) {
    return firstPass;
  }

  // We need to manually adjust. Rebuild with explicit escalation list.
  // Collect all 142 SIRF indices, pick exactly 34 for escalation deterministically.
  const totalSirfs = 142;
  const escalationScores: { idx: number; score: number }[] = [];
  for (let i = 0; i < totalSirfs; i++) {
    escalationScores.push({ idx: i, score: deterministicHash(i * 13 + 53) });
  }
  // Sort by score and pick top 34
  escalationScores.sort((a, b) => a.score - b.score);
  const escalationSet = new Set(
    escalationScores.slice(0, TARGET_SAR_COUNT).map((e) => e.idx)
  );

  // Rebuild
  const sirfRecords: SirfRecord[] = [];
  const sarRecords: SarRecord[] = [];
  let globalSirfIdx = 0;
  let globalSarIdx = 0;

  for (let mi = 0; mi < MONTH_SPECS.length; mi++) {
    const spec = MONTH_SPECS[mi];
    const maxDay = daysInMonth(spec.year, spec.month);

    for (let si = 0; si < spec.sirfCount; si++) {
      const day = dayInMonth(mi, si, maxDay);
      const dateStr = `${spec.year}-${pad2(spec.month)}-${pad2(day)}`;
      const sirfId = `SIRF-${String(globalSirfIdx + 1).padStart(4, "0")}`;
      const typology = typologyForIndex(globalSirfIdx);
      const source = sourceForIndex(globalSirfIdx);
      const escalated = escalationSet.has(globalSirfIdx);

      let sarId: string | null = null;
      let daysToEscalate: number | null = null;

      if (escalated) {
        sarId = `SAR-${String(globalSarIdx + 1).padStart(4, "0")}`;
        daysToEscalate = daysToEscalateForSirf(globalSirfIdx);
        const daysToFile = daysToFileForSar(globalSarIdx, globalSirfIdx);
        const filingDate = addDays(dateStr, daysToFile);
        const filingDeadline = addDays(dateStr, 30);

        sarRecords.push({
          sarId,
          sirfId,
          detectionDate: dateStr,
          filingDate,
          daysToFile,
          typology,
          status: "filed_on_time",
          filingDeadline,
        });
        globalSarIdx++;
      }

      sirfRecords.push({
        sirfId,
        detectionDate: dateStr,
        source,
        typology,
        sarId,
        escalatedToSar: escalated,
        daysToEscalate,
      });

      globalSirfIdx++;
    }
  }

  return { sirfRecords, sarRecords };
}

// ============================================================
// EXPORTED CONSTANTS
// ============================================================

const { sirfRecords, sarRecords } = generateCalibratedData();

/** ~142 SIRF records, Oct 2024 – Mar 2026 */
export const SIRF_RECORDS: SirfRecord[] = sirfRecords;

/** ~34 SAR records, all filed on time (100% compliant) */
export const SAR_RECORDS: SarRecord[] = sarRecords;

// --- Typology breakdown ---

function buildTypologyBreakdown(
  records: SarRecord[]
): { typology: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    counts.set(r.typology, (counts.get(r.typology) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([typology, count]) => ({ typology, count }))
    .sort((a, b) => b.count - a.count);
}

/** SAR typology breakdown sorted by count desc */
export const SAR_TYPOLOGY_BREAKDOWN: { typology: string; count: number }[] =
  buildTypologyBreakdown(sarRecords);

// --- Weekly aggregation ---

function buildWeeklyAggregation(
  sirfs: SirfRecord[],
  sars: SarRecord[]
): { weekStart: string; firstLine: number; secondLine: number; sarConversionRate: number }[] {
  const weekMap = new Map<
    string,
    { firstLine: number; secondLine: number; sarCount: number }
  >();

  // Index SARs by sirfId for quick lookup
  const sarBySirfId = new Set(sars.map((s) => s.sirfId));

  for (const sirf of sirfs) {
    const ws = weekStartFor(sirf.detectionDate);
    const entry = weekMap.get(ws) ?? { firstLine: 0, secondLine: 0, sarCount: 0 };

    if (sirf.source === "first_line") {
      entry.firstLine++;
    } else {
      entry.secondLine++;
    }
    if (sarBySirfId.has(sirf.sirfId)) {
      entry.sarCount++;
    }

    weekMap.set(ws, entry);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => {
      const total = data.firstLine + data.secondLine;
      return {
        weekStart,
        firstLine: data.firstLine,
        secondLine: data.secondLine,
        sarConversionRate:
          total > 0 ? Math.round((data.sarCount / total) * 1000) / 1000 : 0,
      };
    });
}

/** Weekly SIRF aggregation with SAR conversion rates */
export const SIRF_WEEKLY: {
  weekStart: string;
  firstLine: number;
  secondLine: number;
  sarConversionRate: number;
}[] = buildWeeklyAggregation(sirfRecords, sarRecords);
