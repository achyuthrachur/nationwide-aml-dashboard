"use client";

import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { KPICard } from "@/components/common/KPICard";
import { SIRF_RECORDS, SAR_RECORDS, SAR_TYPOLOGY_BREAKDOWN, SIRF_WEEKLY } from "@/data/synthetic/sarSirf";
import type { FilterState, SarRecord } from "@/types/index";

interface SarSirfReportingProps {
  filter: FilterState;
}

function fmtShortDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

const TYPOLOGY_COLORS: Record<string, string> = {
  "Structuring": "#003571",
  "Rapid Movement of Funds": "#0065B3",
  "Third-Party Transactions": "#5B9BD5",
  "Other": "#8699AF",
};

const PAGE_SIZE = 20;

export default function SarSirfReporting({ filter }: SarSirfReportingProps) {
  const [sortField, setSortField] = useState<keyof SarRecord>("detectionDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // KPI values
  const totalSirfs = SIRF_RECORDS.length;
  const totalSars = SAR_RECORDS.length;
  const conversionRate = totalSirfs > 0 ? (totalSars / totalSirfs) * 100 : 0;
  const avgDaysToFile = SAR_RECORDS.length > 0
    ? SAR_RECORDS.reduce((s, r) => s + r.daysToFile, 0) / SAR_RECORDS.length
    : 0;
  const onTimeRate = SAR_RECORDS.length > 0
    ? (SAR_RECORDS.filter((r) => r.status === "filed_on_time").length / SAR_RECORDS.length) * 100
    : 100;

  // SIRF weekly chart data (last 26 weeks)
  const weeklyChartData = useMemo(() => {
    return SIRF_WEEKLY.slice(-26).map((w) => ({
      weekStart: w.weekStart,
      firstLine: w.firstLine,
      secondLine: w.secondLine,
      total: w.firstLine + w.secondLine,
    }));
  }, []);

  // SAR timeliness by month
  const sarByMonth = useMemo(() => {
    const map = new Map<string, { total: number; onTime: number }>();
    for (const sar of SAR_RECORDS) {
      const month = sar.filingDate.slice(0, 7);
      const entry = map.get(month) ?? { total: 0, onTime: 0 };
      entry.total++;
      if (sar.status === "filed_on_time") entry.onTime++;
      map.set(month, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        onTimeRate: data.total > 0 ? (data.onTime / data.total) * 100 : 100,
      }));
  }, []);

  // Conversion trend (12-week rolling)
  const conversionTrend = useMemo(() => {
    return SIRF_WEEKLY.slice(-12).map((w) => ({
      weekStart: w.weekStart,
      rate: w.sarConversionRate * 100,
    }));
  }, []);

  // Typology donut data
  const typologyData = useMemo(() => {
    return SAR_TYPOLOGY_BREAKDOWN.map((t) => ({
      name: t.typology,
      value: t.count,
      fill: TYPOLOGY_COLORS[t.typology] || "#8699AF",
    }));
  }, []);

  // Sorted + paginated SAR table
  const sortedSars = useMemo(() => {
    const sorted = [...SAR_RECORDS].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [sortField, sortDir]);

  const pagedSars = sortedSars.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sortedSars.length / PAGE_SIZE);

  function toggleSort(field: keyof SarRecord) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Total SIRFs Filed" value={totalSirfs} unit="period" status="neutral"
          subLabel="Internal referrals by 1st/2nd line" />
        <KPICard label="Total SARs Filed" value={totalSars} unit="period" status="neutral"
          subLabel="Regulatory filings by typology" />
        <KPICard
          label="Conversion Rate"
          value={conversionRate}
          unit="%"
          status={conversionRate >= 15 && conversionRate <= 25 ? "green" : conversionRate >= 10 ? "amber" : "red"}
          subLabel="Target 15–25% · Low = under-detection"
        />
        <KPICard
          label="Avg Days SIRF→SAR"
          value={avgDaysToFile}
          unit="days"
          status={avgDaysToFile <= 25 ? "green" : avgDaysToFile <= 30 ? "amber" : "red"}
          subLabel="Must not exceed 30-day window"
        />
        <KPICard
          label="SARs Filed On Time"
          value={onTimeRate}
          unit="%"
          status={onTimeRate === 100 ? "green" : "red"}
          subLabel="Any late filing is a BSA violation"
        />
      </div>

      {/* Charts Row 1: SIRF Volume + SAR Timeliness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SIRF Volume Trend */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-1">
            SIRF Volume — Weekly (1st vs 2nd Line)
          </h3>
          <p className="text-[11px] text-[#8699AF] mb-3">Last 26 weeks</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" vertical={false} />
                <XAxis dataKey="weekStart" tickFormatter={fmtShortDate}
                  tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <RTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                        <div className="font-semibold mb-1">{fmtShortDate(label as string)}</div>
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
                            <span className="text-white/60">{p.name}:</span>
                            <span className="tabular-nums">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="firstLine" name="1st Line" fill="#003571" stackId="sirf" radius={[0, 0, 0, 0]} />
                <Bar dataKey="secondLine" name="2nd Line" fill="#0065B3" stackId="sirf" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#003571]" /><span className="text-[11px] text-[#4A5D75]">1st Line Associate</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#0065B3]" /><span className="text-[11px] text-[#4A5D75]">2nd Line Monitoring</span></div>
          </div>
        </div>

        {/* SAR Filing Timeliness */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-1">
            SAR Filing Timeliness — Monthly
          </h3>
          <p className="text-[11px] text-[#8699AF] mb-3">% filed within 30-day window</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sarByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} width={32}
                  tickFormatter={(v) => v + "%"} />
                <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="4 3" strokeWidth={1.5} />
                <RTooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                        <div className="font-semibold">{payload[0].payload.month}</div>
                        <div>{Number(payload[0].value).toFixed(1)}% on time</div>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="onTimeRate" name="On Time %" radius={[3, 3, 0, 0]} maxBarSize={32}>
                  {sarByMonth.map((entry, i) => (
                    <Cell key={i} fill={entry.onTimeRate < 100 ? "#E61030" : "#16A34A"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Conversion Trend + Typology Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Conversion Trend */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-1">
            SIRF-to-SAR Conversion Trend — 12 Weeks
          </h3>
          <p className="text-[11px] text-[#8699AF] mb-3">Target range: 15–25%</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" vertical={false} />
                <XAxis dataKey="weekStart" tickFormatter={fmtShortDate}
                  tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis domain={[0, 50]} tickFormatter={(v) => v + "%"}
                  tick={{ fill: "#8699AF", fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                <ReferenceLine y={15} stroke="#D97706" strokeDasharray="4 3" strokeWidth={1} label={{ value: "15%", fill: "#D97706", fontSize: 10, position: "right" }} />
                <ReferenceLine y={25} stroke="#D97706" strokeDasharray="4 3" strokeWidth={1} label={{ value: "25%", fill: "#D97706", fontSize: 10, position: "right" }} />
                <RTooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                        <div className="font-semibold">{fmtShortDate(label as string)}</div>
                        <div>{Number(payload[0].value).toFixed(1)}%</div>
                      </div>
                    ) : null
                  }
                />
                <Line dataKey="rate" stroke="#003571" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: "#003571", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Typology Donut */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-1">
            SAR Typology Breakdown
          </h3>
          <p className="text-[11px] text-[#8699AF] mb-3">Distribution by category</p>
          <div className="h-48 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typologyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {typologyData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RTooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-[#0A1628] rounded-lg px-3 py-2 text-white text-[11px] shadow-xl border border-[#1E3A5F]">
                          <div className="font-semibold">{payload[0].name}</div>
                          <div>{payload[0].value} SARs</div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 pl-4">
              {typologyData.map((t) => (
                <div key={t.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: t.fill }} />
                  <span className="text-xs text-[#4A5D75] flex-1">{t.name}</span>
                  <span className="text-xs font-semibold text-[#0A1628] tabular-nums">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SAR Filing Log Table */}
      <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#D0D9E8] flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75]">
            SAR Filing Log
          </h3>
          <span className="text-[11px] text-[#8699AF]">{sortedSars.length} records</span>
        </div>
        <div className="overflow-x-auto max-h-[40vh] overflow-y-auto">
          <table className="w-full text-xs font-sans">
            <thead className="sticky top-0 bg-[#F5F7FA] border-b border-[#D0D9E8] z-10">
              <tr>
                {([
                  ["sarId", "SAR ID"],
                  ["sirfId", "SIRF ID"],
                  ["detectionDate", "Detection Date"],
                  ["filingDate", "Filing Date"],
                  ["daysToFile", "Days to File"],
                  ["typology", "Typology"],
                  ["status", "Status"],
                ] as [keyof SarRecord, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#4A5D75] cursor-pointer hover:text-[#0065B3] whitespace-nowrap"
                  >
                    {label}
                    {sortField === field && (
                      <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedSars.map((sar) => (
                <tr
                  key={sar.sarId}
                  className={`border-b border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors ${
                    sar.daysToFile > 30 ? "bg-[#FDEAED]" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-[#0065B3] font-medium">{sar.sarId}</td>
                  <td className="px-3 py-2 font-mono text-[#4A5D75]">{sar.sirfId}</td>
                  <td className="px-3 py-2 text-[#4A5D75] whitespace-nowrap">{fmtShortDate(sar.detectionDate)}</td>
                  <td className="px-3 py-2 text-[#4A5D75] whitespace-nowrap">{fmtShortDate(sar.filingDate)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    <span className={sar.daysToFile >= 28 ? "text-[#D97706] font-semibold" : "text-[#4A5D75]"}>
                      {sar.daysToFile}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[#4A5D75]">{sar.typology}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      sar.status === "filed_on_time"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : sar.status === "filed_late"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {sar.status === "filed_on_time" ? "On Time" : sar.status === "filed_late" ? "Late" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-5 py-2.5 border-t border-[#D0D9E8] flex items-center justify-between">
            <span className="text-[11px] text-[#8699AF]">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 text-xs rounded bg-[#F5F7FA] text-[#4A5D75] hover:bg-[#E6F0FA] disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 text-xs rounded bg-[#F5F7FA] text-[#4A5D75] hover:bg-[#E6F0FA] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
