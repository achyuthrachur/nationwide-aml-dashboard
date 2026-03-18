"use client";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopNav } from "@/components/shell/TopNav";
import { FilterBar } from "@/components/shell/FilterBar";
import { TabNav, type TabId } from "@/components/shell/TabNav";
import ExecutiveSummary from "@/components/tabs/ExecutiveSummary";
import AlertReview from "@/components/tabs/AlertReview";
import BlockedAccounts from "@/components/tabs/BlockedAccounts";
import ReapplyRisk from "@/components/tabs/ReapplyRisk";
import DispositionQuality from "@/components/tabs/DispositionQuality";
import ListFeedHealth from "@/components/tabs/ListFeedHealth";
import SarSirfReporting from "@/components/tabs/SarSirfReporting";
import CipKycCompliance from "@/components/tabs/CipKycCompliance";
import TrainingCulture from "@/components/tabs/TrainingCulture";
import KriDashboard from "@/components/tabs/KriDashboard";
import { computeBreachMap } from "@/lib/breachState";
import type { FilterState } from "@/types/index";

const DEFAULT_FILTER: FilterState = {
  dateRange: null,
  tier: "all",
  priority: "all",
  slaStatus: "all",
  lob: "all",
  disposition: "all",
  viewMode: "split",
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("executive-summary");
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const breachMap = useMemo(() => computeBreachMap(), []);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <TopNav />
      <FilterBar filter={filter} onChange={setFilter} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} breachMap={breachMap} />

      <main role="tabpanel" id={`tabpanel-${activeTab}`} className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "executive-summary"   && <ExecutiveSummary filter={filter} onTabChange={setActiveTab} />}
            {activeTab === "alert-review"        && <AlertReview filters={filter} />}
            {activeTab === "blocked-accounts"    && <BlockedAccounts filter={filter} />}
            {activeTab === "reapply-risk"        && <ReapplyRisk filter={filter} />}
            {activeTab === "disposition-quality" && <DispositionQuality filter={filter} onTabChange={setActiveTab} />}
            {activeTab === "list-feed-health"    && <ListFeedHealth filter={filter} />}
            {activeTab === "sar-sirf"            && <SarSirfReporting filter={filter} />}
            {activeTab === "cip-kyc"             && <CipKycCompliance filter={filter} />}
            {activeTab === "training"            && <TrainingCulture filter={filter} />}
            {activeTab === "kri-dashboard"       && <KriDashboard filter={filter} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
