"use client";
import { motion } from "framer-motion";
import type { BreachMap } from "@/lib/breachState";

export type TabId =
  | "executive-summary"
  | "alert-review"
  | "sar-sirf"
  | "cip-kyc"
  | "training"
  | "kri-dashboard";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "executive-summary",   label: "Executive Summary"   },
  { id: "alert-review",        label: "Alert Management"    },
  { id: "sar-sirf",            label: "SAR/SIRF Reporting"  },
  { id: "cip-kyc",             label: "CIP/KYC Compliance"  },
  { id: "training",            label: "Training & Culture"  },
  { id: "kri-dashboard",       label: "KRI Dashboard"       },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  breachMap?: BreachMap;
}

export function TabNav({ activeTab, onTabChange, breachMap = {} }: TabNavProps) {
  return (
    <nav aria-label="Dashboard tabs" className="bg-white border-b border-[#D0D9E8] px-6 shrink-0 z-10 shadow-sm overflow-x-auto">
      <div role="tablist" className="flex items-end min-w-max">
      {TABS.map((tab) => {
        const breach = breachMap[tab.id];
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#0065B3] focus-visible:outline-none
              ${activeTab === tab.id
                ? "text-[#0065B3] border-[#0065B3]"
                : "text-[#4A5D75] border-transparent hover:text-[#0A1628] hover:border-[#D0D9E8]"
              }
            `}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {breach && (
                <span className="relative flex items-center justify-center w-1.5 h-1.5">
                  <span className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${breach === "red" ? "bg-[#E61030]" : "bg-[#D97706]"}`} />
                  <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${breach === "red" ? "bg-[#E61030]" : "bg-[#D97706]"}`} />
                  <span className="sr-only">{breach === "red" ? "Critical breach" : "Warning"}</span>
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0065B3] -mb-px"
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
              />
            )}
          </button>
        );
      })}
      </div>
    </nav>
  );
}
