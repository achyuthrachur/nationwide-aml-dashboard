import { DAILY_SUMMARIES } from "@/data/synthetic/alerts";
import { REAPPLY_TRANSACTIONS } from "@/data/synthetic/reapply";
import { DISPOSITION_WEEKLY } from "@/data/synthetic/disposition";
import { LIST_FEED_DAILY } from "@/data/synthetic/listFeeds";
import type { TabId } from "@/components/shell/TabNav";

export type BreachLevel = "red" | "amber" | "green";
export type BreachMap = Partial<Record<TabId, BreachLevel>>;

export function computeBreachMap(): BreachMap {
  const map: BreachMap = {};

  // Alert Review: amber if 7-day avg L1H SLA < 95%
  const last7 = DAILY_SUMMARIES.slice(-7);
  const avgSla =
    last7.reduce((s, d) => s + d.l1HighSlaCompliance, 0) / last7.length;
  if (avgSla < 0.95) {
    map["alert-review"] = "amber";
  }

  // Reapply Risk: red if any Type A active_risk records exist
  const hasTypeA = REAPPLY_TRANSACTIONS.some(
    (r) => r.reapplyType === "A" && r.currentStatus === "active_risk"
  );
  if (hasTypeA) {
    map["reapply-risk"] = "red";
  }

  // Disposition Quality: amber if latest QA setback rate > 4%
  const latestWeek = DISPOSITION_WEEKLY[DISPOSITION_WEEKLY.length - 1];
  if (latestWeek && latestWeek.qaSetbackRate > 0.04) {
    map["disposition-quality"] = "amber";
  }

  // List & Feed Health: red if complete_failure in last 7 days
  const cutoff = new Date(DAILY_SUMMARIES[DAILY_SUMMARIES.length - 1].date + "T00:00:00Z");
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const hasFailure = LIST_FEED_DAILY.some(
    (f) => f.date >= cutoffStr && f.status === "complete_failure"
  );
  if (hasFailure) {
    map["list-feed-health"] = "red";
  }

  return map;
}
