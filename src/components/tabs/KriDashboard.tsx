"use client";

import { useState } from "react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { KRI_DATA, KRI_SUMMARY } from "@/data/synthetic/kri";
import type { FilterState, KriRecord, KriDomain } from "@/types/index";

interface KriDashboardProps {
  filter: FilterState;
}

const STATUS_COLORS: Record<string, string> = {
  red: "#E61030",
  amber: "#D97706",
  green: "#16A34A",
};

const STATUS_BG: Record<string, string> = {
  red: "bg-red-50 border-red-200 text-red-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  green: "bg-green-50 border-green-200 text-green-700",
};

const DOMAIN_LABELS: Record<KriDomain, string> = {
  monitoring_program: "Monitoring Program Risk",
  typology_trend: "Typology & Trend Risk",
  regulatory_program: "Regulatory & Program Risk",
  operational_capacity: "Operational & Capacity Risk",
};

const DOMAIN_ORDER: KriDomain[] = [
  "monitoring_program",
  "typology_trend",
  "regulatory_program",
  "operational_capacity",
];

function MiniSparkline({ data, status }: { data: number[]; status: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const color = STATUS_COLORS[status] || "#8699AF";
  return (
    <div className="h-7 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function KriDetailPanel({ kri }: { kri: KriRecord }) {
  const trendData = kri.trend.map((v, i) => ({ period: `P${i + 1}`, value: v }));

  return (
    <div className="border-t border-[#D0D9E8] bg-[#F5F7FA] p-4 space-y-3">
      <p className="text-xs text-[#4A5D75] leading-relaxed">{kri.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#8699AF] font-semibold">Current Value</span>
          <p className="text-sm font-bold text-[#0A1628]">{kri.currentValueDisplay}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#8699AF] font-semibold">Trigger</span>
          <p className="text-sm text-[#4A5D75]">{kri.triggerThreshold}</p>
        </div>
      </div>

      {/* 90-day trend chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" vertical={false} />
            <XAxis dataKey="period" tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
            <RTooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                    <div className="tabular-nums">{payload[0].value}</div>
                  </div>
                ) : null
              }
            />
            <Line
              dataKey="value"
              stroke={STATUS_COLORS[kri.status]}
              strokeWidth={2}
              dot={{ r: 3, fill: STATUS_COLORS[kri.status], stroke: "#fff", strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#8699AF] font-semibold">Cadence</span>
          <p className="text-xs text-[#4A5D75] capitalize">{kri.measurementCadence}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#8699AF] font-semibold">Recommended Action</span>
          <p className="text-xs text-[#4A5D75] leading-relaxed">{kri.recommendedAction}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-[#8699AF]">
        <Lock size={10} />
        <span>Escalation routing — Future Feature</span>
      </div>
    </div>
  );
}

function KriCell({ kri, isExpanded, onToggle }: { kri: KriRecord; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="bg-white rounded-lg border border-[#D0D9E8] shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onToggle}
    >
      <div className="p-3.5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4A5D75] leading-tight flex-1 pr-2">
            {kri.name}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${STATUS_BG[kri.status]}`}>
            {kri.status.toUpperCase()}
          </span>
        </div>
        <div className="font-['IBM_Plex_Sans_Condensed'] font-bold text-xl leading-none mb-1.5"
          style={{ color: STATUS_COLORS[kri.status] }}>
          {kri.currentValueDisplay}
        </div>
        <div className="text-[10px] text-[#8699AF] mb-2">
          Trigger: {kri.triggerThreshold}
        </div>
        <div className="flex items-center justify-between">
          <MiniSparkline data={kri.trend} status={kri.status} />
          {isExpanded
            ? <ChevronUp size={14} className="text-[#8699AF]" />
            : <ChevronDown size={14} className="text-[#8699AF]" />
          }
        </div>
      </div>
      {isExpanded && <KriDetailPanel kri={kri} />}
    </div>
  );
}

export default function KriDashboard({ filter }: KriDashboardProps) {
  const [expandedKri, setExpandedKri] = useState<string | null>(null);

  // Find highest-severity callout
  const redKris = KRI_DATA.filter((k) => k.status === "red");
  const highestCallout = redKris.length > 0
    ? `${redKris[0].name} — ${redKris[0].currentValueDisplay}`
    : null;

  // Group KRIs by domain
  const byDomain = DOMAIN_ORDER.map((domain) => ({
    domain,
    label: DOMAIN_LABELS[domain],
    kris: KRI_DATA.filter((k) => k.domain === domain),
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">

      {/* Summary Banner */}
      <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold text-[#003571]">KRI Summary</h2>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E61030]" />
                <span className="text-sm font-bold text-[#E61030]">{KRI_SUMMARY.red}</span>
                <span className="text-xs text-[#8699AF]">Red</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                <span className="text-sm font-bold text-[#D97706]">{KRI_SUMMARY.amber}</span>
                <span className="text-xs text-[#8699AF]">Amber</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span className="text-sm font-bold text-[#16A34A]">{KRI_SUMMARY.green}</span>
                <span className="text-xs text-[#8699AF]">Green</span>
              </span>
            </div>
          </div>
          {highestCallout && (
            <div className="flex items-center gap-2 bg-[#FDEAED] px-3 py-1.5 rounded-lg">
              <AlertTriangle size={14} className="text-[#E61030] flex-shrink-0" />
              <span className="text-xs text-[#E61030] font-medium">
                Immediate attention: {highestCallout}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-[#4A5D75] mt-2">
          {KRI_SUMMARY.red} KRI{KRI_SUMMARY.red !== 1 ? "s" : ""} require immediate management attention
        </p>
      </div>

      {/* 4-Column KRI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {byDomain.map(({ domain, label, kris }) => (
          <div key={domain}>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-3 px-1">
              {label}
            </h3>
            <div className="space-y-3">
              {kris.map((kri) => (
                <KriCell
                  key={kri.kriId}
                  kri={kri}
                  isExpanded={expandedKri === kri.kriId}
                  onToggle={() =>
                    setExpandedKri((prev) => (prev === kri.kriId ? null : kri.kriId))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
