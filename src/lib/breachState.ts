import { DAILY_SUMMARIES } from "@/data/synthetic/alerts";
import { KRI_DATA } from "@/data/synthetic/kri";
import type { TabId } from "@/components/shell/TabNav";

export type BreachLevel = "red" | "amber" | "green";
export type BreachMap = Partial<Record<TabId, BreachLevel>>;

export function computeBreachMap(): BreachMap {
  const map: BreachMap = {};

  // Alert Management: amber if 7-day avg L1H SLA < 95%
  const last7 = DAILY_SUMMARIES.slice(-7);
  const avgSla =
    last7.reduce((s, d) => s + d.l1HighSlaCompliance, 0) / last7.length;
  if (avgSla < 0.95) {
    map["alert-review"] = "amber";
  }

  // KRI Dashboard: red if any KRI is red
  const hasRedKri = KRI_DATA.some((k) => k.status === "red");
  if (hasRedKri) {
    map["kri-dashboard"] = "red";
  }

  return map;
}
