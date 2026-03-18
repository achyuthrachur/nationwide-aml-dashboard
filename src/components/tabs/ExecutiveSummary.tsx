"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { AIInsightBanner } from "@/components/common/AIInsightBanner";
import { KPICard } from "@/components/common/KPICard";
import { DAILY_SUMMARIES, ALERT_RECORDS } from "@/data/synthetic/alerts";
import { SAR_RECORDS } from "@/data/synthetic/sarSirf";
import { SIRF_WEEKLY } from "@/data/synthetic/sarSirf";
import { TRAINING_BY_LOB, TRAINING_SUMMARY } from "@/data/synthetic/training";
import { KRI_DATA, KRI_SUMMARY } from "@/data/synthetic/kri";
import { SPIKE_EVENTS } from "@/data/synthetic/spikes";
import { ChevronRight } from "lucide-react";
import type { FilterState, DailySummary } from "@/types/index";
import type { TabId } from "@/components/shell/TabNav";

const SYNTHETIC_INSIGHT =
  "As of March 11, 2026 — AML/BSA program operating with " + KRI_SUMMARY.red + " KRI alerts requiring management attention. " +
  "2 monitoring model rules have not been reviewed in >12 months — stale rules risk undetected typology drift. " +
  "SAR filing timeliness remains at 100% compliance with 24% SIRF-to-SAR conversion rate. " +
  "CIP completion at 99.3% — 47 null identity fields pending remediation across 3 admin systems. " +
  "Training completion at 97.2% with Financial Services LOB below the 95% threshold.";

interface ExecutiveSummaryProps {
  filter: FilterState;
  onTabChange?: (id: TabId) => void;
}

function fmtShortDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export default function ExecutiveSummary({ filter, onTabChange }: ExecutiveSummaryProps) {
  // ── Filter summaries ──────────────────────────────────────────────────────
  const filteredSummaries = useMemo<DailySummary[]>(() => {
    if (!filter.dateRange) return DAILY_SUMMARIES;
    return DAILY_SUMMARIES.filter(
      (d) => d.date >= filter.dateRange!.start && d.date <= filter.dateRange!.end
    );
  }, [filter.dateRange]);

  // ── Alert volume chart data: last 60 days ─────────────────────────────────
  const chartData = useMemo(() => {
    return filteredSummaries.slice(-60).map((d) => ({
      date: d.date,
      totalAlerts: d.totalAlerts,
      l1: d.l1Count,
      l2: d.l2Count,
      l3: d.l3Count,
    }));
  }, [filteredSummaries]);

  // ── KPI values ────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const slice7 = filteredSummaries.slice(-7);
    const prior7 = filteredSummaries.slice(-14, -7);
    const l1hCurr = avg(slice7.map((d) => d.l1HighSlaCompliance)) * 100;
    const l1hPrev = avg(prior7.map((d) => d.l1HighSlaCompliance)) * 100;
    const totalAvg = avg(slice7.map((d) => d.totalAlerts));

    // False positive rate from alert records
    const l1Records = ALERT_RECORDS.filter((r) => r.tier === "L1");
    const fpRate = l1Records.length > 0
      ? (l1Records.filter((r) => r.disposition === "false_positive").length / l1Records.length) * 100
      : 0;

    // SAR conversion rate
    const sarOnTime = SAR_RECORDS.length > 0
      ? (SAR_RECORDS.filter((r) => r.status === "filed_on_time").length / SAR_RECORDS.length) * 100
      : 100;

    return { l1hCurr, l1hDelta: l1hCurr - l1hPrev, totalAvg, fpRate, sarOnTime };
  }, [filteredSummaries]);

  // ── Spike references ──────────────────────────────────────────────────────
  const chartDates = useMemo(() => new Set(chartData.map((d) => d.date)), [chartData]);
  const chartSpikes = useMemo(
    () => SPIKE_EVENTS.filter((s) => chartDates.has(s.startDate)),
    [chartDates]
  );

  // ── Training LOBs below target ────────────────────────────────────────────
  const lobsBelowTarget = TRAINING_BY_LOB.filter((l) => l.completionRate < 95);

  // ── SAR weekly conversion for sparkline ───────────────────────────────────
  const sarConversionTrend = SIRF_WEEKLY.slice(-8).map((w) => w.sarConversionRate * 100);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">

      {/* AI Insight Banner */}
      <AIInsightBanner insight={SYNTHETIC_INSIGHT} mode="prototype" />

      {/* ── KPI Row — one per domain + KRI ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Alert Management */}
        <KPICard
          label="Alert SLA Compliance"
          value={kpi.l1hCurr}
          unit="%"
          delta={kpi.l1hDelta}
          deltaLabel="vs prior 7d"
          status={kpi.l1hCurr >= 95 ? "green" : kpi.l1hCurr >= 90 ? "amber" : "red"}
          trend={filteredSummaries.slice(-7).map((d) => d.l1HighSlaCompliance * 100)}
          onClick={() => onTabChange?.("alert-review")}
        />
        {/* 2. SAR/SIRF */}
        <KPICard
          label="SARs Filed On Time"
          value={kpi.sarOnTime}
          unit="%"
          status={kpi.sarOnTime === 100 ? "green" : "red"}
          trend={sarConversionTrend}
          onClick={() => onTabChange?.("sar-sirf")}
        />
        {/* 3. CIP/KYC */}
        <KPICard
          label="CIP Completion"
          value={99.3}
          unit="%"
          status="amber"
          subLabel="47 null fields pending"
          onClick={() => onTabChange?.("cip-kyc")}
        />
        {/* 4. Training */}
        <KPICard
          label="AML Training"
          value={97.2}
          unit="%"
          status="amber"
          subLabel={`${lobsBelowTarget.length} LOB${lobsBelowTarget.length !== 1 ? "s" : ""} below 95%`}
          onClick={() => onTabChange?.("training")}
        />
        {/* 5. False Positive Rate (Alert Mgmt) */}
        <KPICard
          label="False Positive Rate"
          value={kpi.fpRate}
          unit="%"
          status={kpi.fpRate < 90 ? "green" : kpi.fpRate < 95 ? "amber" : "red"}
          subLabel="Target <90%"
          onClick={() => onTabChange?.("alert-review")}
        />
        {/* 6. KRI */}
        <KPICard
          label="KRI Alerts (Red)"
          value={KRI_SUMMARY.red}
          unit="indicators"
          status="red"
          onClick={() => onTabChange?.("kri-dashboard")}
        />
      </div>

      {/* ── KRI Alert Summary Panel ──────────────────────────────────────────── */}
      {KRI_DATA.filter((k) => k.status === "red").length > 0 && (
        <div className="bg-white rounded-xl border border-[#D0D9E8] border-l-4 border-l-[#E61030] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-3">
            KRI Alerts — Immediate Attention Required
          </h3>
          <div className="space-y-2">
            {KRI_DATA.filter((k) => k.status === "red").map((kri) => (
              <div key={kri.kriId} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#E61030] flex-shrink-0" />
                <span className="text-xs text-[#4A5D75] flex-1">
                  {kri.currentValueDisplay} — {kri.name}
                </span>
                <button
                  onClick={() => onTabChange?.("kri-dashboard")}
                  className="text-xs text-[#0065B3] hover:text-[#003571] font-medium flex items-center gap-0.5"
                >
                  View <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Daily Alert Volume Chart ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75]">
            Daily Alert Volume — Last 60 Days
          </h3>
          <span className="text-[11px] text-[#8699AF]">
            Avg {Math.round(kpi.totalAvg).toLocaleString()}/day
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0065B3" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0065B3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtShortDate}
                tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} interval={7} />
              <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <RTooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-[#0A1628] rounded-lg px-3 py-2.5 shadow-xl border border-[#1E3A5F] text-white text-[12px]">
                      <div className="font-semibold mb-1.5">{fmtShortDate(label)}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm bg-[#0065B3]" />
                        <span className="text-white/60">Total:</span>
                        <span className="font-medium tabular-nums">{Number(payload[0]?.value ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }}
              />
              {chartSpikes.map((s) => (
                <ReferenceLine key={s.spikeId} x={s.startDate} stroke="#0065B3"
                  strokeDasharray="4 3" strokeWidth={1.5} />
              ))}
              <Area dataKey="totalAlerts" name="Total Alerts" type="monotone"
                fill="url(#totalGrad)" stroke="#0065B3" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: "#0065B3", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom row: Training by LOB + KRI Status Distribution ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Training Completion by LOB */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-1">
            Training Completion by LOB
          </h3>
          <p className="text-[11px] text-[#8699AF] mb-3">Target: 100% · Red if below 95%</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...TRAINING_BY_LOB].sort((a, b) => a.completionRate - b.completionRate)}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" horizontal={false} />
                <XAxis type="number" domain={[85, 105]} tickFormatter={(v) => v + "%"}
                  tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="lob" width={110}
                  tick={{ fill: "#4A5D75", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ReferenceLine x={100} stroke="#16A34A" strokeDasharray="4 3" strokeWidth={1.5} />
                <ReferenceLine x={95} stroke="#D97706" strokeDasharray="4 3" strokeWidth={1} />
                <RTooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                        <div className="font-semibold">{payload[0].payload.lob}</div>
                        <div>{Number(payload[0].value).toFixed(1)}%</div>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="completionRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {[...TRAINING_BY_LOB].sort((a, b) => a.completionRate - b.completionRate).map((entry, i) => (
                    <Cell key={i} fill={entry.completionRate >= 100 ? "#16A34A" : entry.completionRate >= 95 ? "#D97706" : "#E61030"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KRI Status Distribution */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-1">
            KRI Status Distribution
          </h3>
          <p className="text-[11px] text-[#8699AF] mb-3">{KRI_SUMMARY.totalCount} indicators across 4 risk domains</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Red", value: KRI_SUMMARY.red, fill: "#E61030" },
                  { name: "Amber", value: KRI_SUMMARY.amber, fill: "#D97706" },
                  { name: "Green", value: KRI_SUMMARY.green, fill: "#16A34A" },
                ]}
                margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <RTooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                        <div className="font-semibold">{payload[0].payload.name}</div>
                        <div>{payload[0].value} KRIs</div>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={48}>
                  {["#E61030", "#D97706", "#16A34A"].map((fill, i) => (
                    <Cell key={i} fill={fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
