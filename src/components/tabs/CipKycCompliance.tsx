"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { KPICard } from "@/components/common/KPICard";
import {
  CIP_EXCEPTIONS, CIP_WEEKLY, HIGH_RISK_MONTHLY, EDD_STATUS, OVERDUE_REVIEWS,
} from "@/data/synthetic/cipKyc";
import type { FilterState, CipException } from "@/types/index";

// ── Design tokens ──────────────────────────────────────────────
const BLUE_DARK  = "#003571";
const BLUE_MID   = "#0065B3";
const RED        = "#E61030";
const ORANGE     = "#F97316";

const CARD_CLS   = "bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5";
const HEADER_CLS = "text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-3";

const tooltipStyle = {
  contentStyle: {
    background: "#0A1628",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#fff",
    fontSize: 11,
    border: "1px solid #1E3A5F",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  itemStyle: { color: "#fff", fontSize: 11 },
  labelStyle: { color: "#8699AF", fontSize: 10, marginBottom: 2 },
};

// ── Helpers ────────────────────────────────────────────────────
function fmtShortDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function fmtMonth(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", year: "2-digit", timeZone: "UTC",
  });
}

const FIELD_LABELS: Record<CipException["missingField"], string> = {
  ssn_tin: "SSN / TIN",
  dob: "Date of Birth",
  address: "Address",
  full_name: "Full Name",
};

const PAGE_SIZE = 15;

// ── Component ──────────────────────────────────────────────────
interface CipKycComplianceProps {
  filter: FilterState;
}

export default function CipKycCompliance({ filter }: CipKycComplianceProps) {
  // ── Sort state for table ─────────────────────────────────────
  const [sortField, setSortField] = useState<keyof CipException>("detectedDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // ── KPI statuses ─────────────────────────────────────────────
  const cipRate = 99.3;
  const cipStatus = cipRate >= 100 ? "green" as const : cipRate >= 99 ? "amber" as const : "red" as const;
  const nullFields = 47;
  const eddRate = 98.1;
  const eddStatus = eddRate >= 100 ? "green" as const : eddRate >= 95 ? "amber" as const : "red" as const;
  const highRiskFlagged = 23;
  const overdueCount = OVERDUE_REVIEWS.length; // 4

  // ── Chart 1: CIP Completion Rate Trend (last 26 weeks) ──────
  const cipTrend = useMemo(() => {
    return CIP_WEEKLY.slice(-26).map((w) => ({
      weekStart: w.weekStart,
      label: fmtShortDate(w.weekStart),
      rate: w.completionRate,
    }));
  }, []);

  // ── Chart 2: Null Field Breakdown (horizontal bar) ──────────
  const nullBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ex of CIP_EXCEPTIONS) {
      counts[ex.missingField] = (counts[ex.missingField] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([field, count]) => ({
        field,
        label: FIELD_LABELS[field as CipException["missingField"]] ?? field,
        count,
        fill: field === "ssn_tin" ? RED : ORANGE,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // ── Chart 3: High-Risk Customer Additions (area) ────────────
  const highRiskData = useMemo(() => {
    return HIGH_RISK_MONTHLY.map((m) => ({
      month: m.month,
      label: fmtMonth(m.month),
      newAdditions: m.newAdditions,
      totalActive: m.totalActive,
    }));
  }, []);

  // ── Chart 4: Overdue Review Aging (buckets) ─────────────────
  const agingBuckets = useMemo(() => {
    const buckets = [
      { bucket: "0-30 days", min: 0, max: 30, count: 0 },
      { bucket: "31-60 days", min: 31, max: 60, count: 0 },
      { bucket: "61-90 days", min: 61, max: 90, count: 0 },
      { bucket: "90+ days", min: 91, max: Infinity, count: 0 },
    ];
    for (const r of OVERDUE_REVIEWS) {
      for (const b of buckets) {
        if (r.daysOverdue >= b.min && r.daysOverdue <= b.max) {
          b.count++;
          break;
        }
      }
    }
    return buckets;
  }, []);

  // ── Chart 5: EDD sparkline data ─────────────────────────────
  // Build a small trend from the weekly completion data to use as sparkline
  const eddSparkline = useMemo(() => {
    // Sample every 6th week from CIP_WEEKLY to create an EDD-correlated sparkline
    const samples: number[] = [];
    for (let i = 0; i < CIP_WEEKLY.length; i += 6) {
      // EDD rate tracks near CIP rate but offset downward slightly
      samples.push(CIP_WEEKLY[i].completionRate - 1.2 + (i % 12 === 0 ? 0.1 : 0));
    }
    return samples;
  }, []);

  // ── Table: sorted & paged CIP exceptions ────────────────────
  const sortedExceptions = useMemo(() => {
    const sorted = [...CIP_EXCEPTIONS].sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sortField, sortDir]);

  const totalPages = Math.ceil(sortedExceptions.length / PAGE_SIZE);
  const pagedExceptions = sortedExceptions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(field: keyof CipException) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  }

  const sortIndicator = (field: keyof CipException) =>
    sortField === field ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="New Policies \u2014 CIP Complete"
          value={cipRate}
          unit="%"
          status={cipStatus}
          trend={CIP_WEEKLY.slice(-12).map((w) => w.completionRate)}
          subLabel="Target 100% · Null fields = findings"
        />
        <KPICard
          label="Null / Anomalous Fields"
          value={nullFields}
          status="red"
          subLabel={`${CIP_EXCEPTIONS.filter((e) => e.status === "open").length} open exceptions`}
        />
        <KPICard
          label="EDD Completion Rate"
          value={eddRate}
          unit="%"
          status={eddStatus}
          trend={eddSparkline}
          subLabel={`${EDD_STATUS.pending} pending, ${EDD_STATUS.overdue} overdue`}
        />
        <KPICard
          label="High-Risk Flagged"
          value={highRiskFlagged}
          unit="this period"
          status="neutral"
          trend={HIGH_RISK_MONTHLY.slice(-8).map((m) => m.newAdditions)}
          subLabel="New additions to watch list"
        />
        <KPICard
          label="Overdue Reviews"
          value={overdueCount}
          status={overdueCount > 0 ? "red" : "green"}
          subLabel={overdueCount > 0 ? `Max ${Math.max(...OVERDUE_REVIEWS.map((r) => r.daysOverdue))} days overdue` : "All current"}
        />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: CIP Completion Rate Trend */}
        <div className={CARD_CLS}>
          <h3 className={HEADER_CLS}>CIP Completion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cipTrend} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#8699AF" }}
                interval={Math.floor(cipTrend.length / 6)}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
              />
              <YAxis
                domain={[98, 100.5]}
                tick={{ fontSize: 10, fill: "#8699AF" }}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <RTooltip
                {...tooltipStyle}
                formatter={(value: number) => [`${value.toFixed(2)}%`, "Completion Rate"]}
              />
              <ReferenceLine y={100} stroke="#1A6632" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "100%", position: "insideTopRight", fill: "#1A6632", fontSize: 10 }} />
              <ReferenceLine y={99} stroke={ORANGE} strokeDasharray="3 3" strokeWidth={1} label={{ value: "99% threshold", position: "insideBottomRight", fill: ORANGE, fontSize: 9 }} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={BLUE_DARK}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: BLUE_DARK }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Null Field Breakdown (horizontal bar) */}
        <div className={CARD_CLS}>
          <h3 className={HEADER_CLS}>Null Field Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={nullBreakdown}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 0, left: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#8699AF" }}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "#4A5D75" }}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
                width={90}
              />
              <RTooltip
                {...tooltipStyle}
                formatter={(value: number, name: string) => [value, "Exceptions"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                {nullBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2 ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 3: High-Risk Customer Additions */}
        <div className={CARD_CLS}>
          <h3 className={HEADER_CLS}>High-Risk Customer Additions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={highRiskData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE_MID} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={BLUE_MID} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#8699AF" }}
                interval={2}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8699AF" }}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
              />
              <RTooltip
                {...tooltipStyle}
                formatter={(value: number, name: string) => {
                  const label = name === "newAdditions" ? "New Additions" : "Total Active";
                  return [value, label];
                }}
              />
              <Area
                type="monotone"
                dataKey="newAdditions"
                stroke={BLUE_MID}
                strokeWidth={2}
                fill="url(#hrGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Overdue Review Aging */}
        <div className={CARD_CLS}>
          <h3 className={HEADER_CLS}>Overdue Review Aging</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={agingBuckets} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 10, fill: "#8699AF" }}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#8699AF" }}
                tickLine={false}
                axisLine={{ stroke: "#D0D9E8" }}
              />
              <RTooltip
                {...tooltipStyle}
                formatter={(value: number) => [value, "Reviews"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                {agingBuckets.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={i >= 2 ? RED : i === 1 ? ORANGE : BLUE_MID}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── EDD Completion Sparkline (small chart) ───────────── */}
      <div className={CARD_CLS}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={HEADER_CLS + " mb-0"}>EDD Completion Trend</h3>
          <div className="flex items-center gap-3 text-xs text-[#4A5D75]">
            <span>Total: <strong>{EDD_STATUS.total}</strong></span>
            <span>Completed: <strong className="text-[#1A6632]">{EDD_STATUS.completed}</strong></span>
            <span>Pending: <strong className="text-[#C45A00]">{EDD_STATUS.pending}</strong></span>
            <span>Overdue: <strong className="text-[#E61030]">{EDD_STATUS.overdue}</strong></span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart
            data={CIP_WEEKLY.slice(-26).map((w, i) => ({
              label: fmtShortDate(w.weekStart),
              edd: Math.min(100, 97.0 + (1.1 * i) / 25 + [0.05, -0.02, 0.03, -0.01, 0.04, -0.03][i % 6]),
            }))}
            margin={{ top: 4, right: 16, bottom: 0, left: -8 }}
          >
            <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
            <YAxis domain={[96, 100]} tick={{ fontSize: 9, fill: "#8699AF" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
            <RTooltip
              {...tooltipStyle}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "EDD Rate"]}
            />
            <Line
              type="monotone"
              dataKey="edd"
              stroke={BLUE_DARK}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Table: Null Field Exceptions Log ─────────────────── */}
      <div className={CARD_CLS}>
        <h3 className={HEADER_CLS}>Null Field Exceptions Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#D0D9E8]">
                {([
                  ["exceptionId", "Exception ID"],
                  ["policyId", "Policy ID"],
                  ["adminSystem", "Admin System"],
                  ["missingField", "Missing Field"],
                  ["detectedDate", "Detected Date"],
                  ["status", "Status"],
                  ["analystId", "Analyst"],
                ] as [keyof CipException, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    className="px-3 py-2.5 font-semibold text-[#4A5D75] cursor-pointer hover:text-[#003571] select-none whitespace-nowrap"
                    onClick={() => handleSort(field)}
                  >
                    {label}{sortIndicator(field)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedExceptions.map((ex) => (
                <tr
                  key={ex.exceptionId}
                  className={
                    ex.status === "open"
                      ? "bg-[#FDEAED] border-b border-[#F3D0D5] hover:bg-[#FBD7DC] transition-colors"
                      : "border-b border-[#E8EDF3] hover:bg-[#F7F9FC] transition-colors"
                  }
                >
                  <td className="px-3 py-2 font-mono text-[11px] text-[#003571]">{ex.exceptionId}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{ex.policyId}</td>
                  <td className="px-3 py-2">{ex.adminSystem}</td>
                  <td className="px-3 py-2">
                    <span className={
                      ex.missingField === "ssn_tin"
                        ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E61030]/10 text-[#E61030]"
                        : "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F97316]/10 text-[#C45A00]"
                    }>
                      {FIELD_LABELS[ex.missingField]}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{fmtShortDate(ex.detectedDate)}</td>
                  <td className="px-3 py-2">
                    <span className={
                      ex.status === "open"
                        ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E61030]/15 text-[#E61030]"
                        : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1A6632]/10 text-[#1A6632]"
                    }>
                      <span className={
                        ex.status === "open"
                          ? "w-1.5 h-1.5 rounded-full bg-[#E61030] animate-pulse"
                          : "w-1.5 h-1.5 rounded-full bg-[#1A6632]"
                      } />
                      {ex.status === "open" ? "Open" : "Remediated"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[#4A5D75]">{ex.analystId ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8EDF3]">
            <span className="text-[11px] text-[#8699AF]">
              Showing {page * PAGE_SIZE + 1}\u2013{Math.min((page + 1) * PAGE_SIZE, sortedExceptions.length)} of {sortedExceptions.length} exceptions
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 text-[11px] rounded border border-[#D0D9E8] text-[#4A5D75] hover:bg-[#F0F4F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={
                    i === page
                      ? "px-2.5 py-1 text-[11px] rounded bg-[#003571] text-white font-semibold"
                      : "px-2.5 py-1 text-[11px] rounded border border-[#D0D9E8] text-[#4A5D75] hover:bg-[#F0F4F9] transition-colors"
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 text-[11px] rounded border border-[#D0D9E8] text-[#4A5D75] hover:bg-[#F0F4F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
