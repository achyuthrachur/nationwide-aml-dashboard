"use client";

import type { FilterState } from "@/types/index";
import { KPICard } from "@/components/common/KPICard";
import {
  TRAINING_BY_LOB,
  TRAINING_MONTHLY,
  TRAINING_SUMMARY,
} from "@/data/synthetic/training";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TrainingCultureProps {
  filter: FilterState;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtMonth(iso: string): string {
  const [year, month] = iso.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

function barColorForRate(rate: number): string {
  if (rate >= 100) return "#16A34A";
  if (rate >= 95) return "#D97706";
  return "#E61030";
}

// ─── Custom Tooltips ────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A1628] rounded-lg px-3 py-2 shadow-xl border border-[#1E3A5F] text-white text-[11px]">
      <div className="font-semibold mb-1.5 text-white/90">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div
            className="w-2 h-2 rounded-sm flex-shrink-0"
            style={{ backgroundColor: p.color ?? p.fill ?? p.stroke }}
          />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-medium tabular-nums">
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Section label ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#4A5D75] mb-3">
      {label}
    </h3>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TrainingCulture({ filter }: TrainingCultureProps) {
  // Derive summary metrics
  const lobsBelowTarget = TRAINING_BY_LOB.filter((l) => l.completionRate < 95);
  const financialServicesLob = TRAINING_BY_LOB.find(
    (l) => l.lob === "Financial Services" && l.completionRate < 95
  );

  // Horizontal bar chart data — sorted ascending by completion rate for readability
  const lobChartData = [...TRAINING_BY_LOB].sort(
    (a, b) => a.completionRate - b.completionRate
  );

  // Overdue by LOB — sorted descending by overdue count
  const overdueChartData = [...TRAINING_BY_LOB].sort(
    (a, b) => b.overdueCount - a.overdueCount
  );

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel label="Training & Culture — Key Metrics" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="AML Training Completion"
            value={97.2}
            unit="%"
            status="amber"
            subLabel="Target: 100% · Annual window"
          />
          <KPICard
            label="Associates Overdue"
            value={83}
            status="red"
            subLabel={`${TRAINING_SUMMARY.totalAssociates.toLocaleString()} total associates`}
          />
          <KPICard
            label="Internal SIRF Referrals"
            value={86}
            unit="period"
            status="neutral"
            subLabel="Higher = healthier compliance culture"
          />
          <KPICard
            label="Trend vs Prior Period"
            value="+12%"
            status="green"
            subLabel="YoY associate detection growth"
          />
        </div>
      </div>

      {/* ── Charts 2x2 Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Chart 1: Training Completion by LOB (Horizontal Bar) ─────────── */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <SectionLabel label="Training Completion by LOB" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lobChartData}
                layout="vertical"
                margin={{ top: 4, right: 32, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8EDF2"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[80, 105]}
                  tick={{
                    fill: "#8699AF",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="lob"
                  width={120}
                  tick={{
                    fill: "#4A5D75",
                    fontSize: 11,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(0,101,179,0.06)" }}
                />
                <ReferenceLine
                  x={100}
                  stroke="#16A34A"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: "100%",
                    position: "top",
                    fill: "#16A34A",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="completionRate"
                  name="Completion Rate"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  {lobChartData.map((entry, idx) => (
                    <Cell
                      key={`lob-bar-${idx}`}
                      fill={barColorForRate(entry.completionRate)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Chart 2: Associate Detection Referrals (Area) ───────────────── */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <SectionLabel label="Associate Detection Referrals" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={TRAINING_MONTHLY}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="sirfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#003571" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#003571" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8EDF2"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={fmtMonth}
                  tick={{
                    fill: "#8699AF",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{
                    fill: "#8699AF",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <RTooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "#003571", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="associateSirfReferrals"
                  name="SIRF Referrals"
                  stroke="#003571"
                  strokeWidth={2}
                  fill="url(#sirfGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Chart 3: Training Completion Trend (Line) ───────────────────── */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <SectionLabel label="Training Completion Trend" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={TRAINING_MONTHLY}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8EDF2"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={fmtMonth}
                  tick={{
                    fill: "#8699AF",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  domain={[70, 105]}
                  tick={{
                    fill: "#8699AF",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <RTooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "#0065B3", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <ReferenceLine
                  y={100}
                  stroke="#16A34A"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: "100% Target",
                    position: "right",
                    fill: "#16A34A",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <ReferenceLine
                  y={95}
                  stroke="#D97706"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: "95% Threshold",
                    position: "right",
                    fill: "#D97706",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  name="Completion Rate"
                  stroke="#0065B3"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#0065B3", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#003571", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Chart 4: Overdue by LOB (Vertical Bar) ──────────────────────── */}
        <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
          <SectionLabel label="Overdue by LOB" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overdueChartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8EDF2"
                  vertical={false}
                />
                <XAxis
                  dataKey="lob"
                  tick={{
                    fill: "#4A5D75",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{
                    fill: "#8699AF",
                    fontSize: 10,
                    fontFamily: "IBM Plex Sans",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <RTooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(230,16,48,0.06)" }}
                />
                <Bar
                  dataKey="overdueCount"
                  name="Overdue Associates"
                  fill="#E61030"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Summary Panel ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#D0D9E8] shadow-sm p-5">
        <SectionLabel label="Training Summary" />
        <p className="text-sm text-[#0A1628] leading-relaxed">
          <span className="font-semibold tabular-nums">
            {TRAINING_SUMMARY.completed.toLocaleString()}
          </span>{" "}
          of{" "}
          <span className="font-semibold tabular-nums">
            {TRAINING_SUMMARY.totalAssociates.toLocaleString()}
          </span>{" "}
          associates trained{" "}
          <span className="text-[#4A5D75] mx-1">·</span>{" "}
          <span className="font-semibold tabular-nums text-[#E61030]">
            {lobsBelowTarget.length}
          </span>{" "}
          LOB{lobsBelowTarget.length !== 1 ? "s" : ""} below target{" "}
          <span className="text-[#4A5D75] mx-1">·</span>{" "}
          Training due date:{" "}
          <span className="font-semibold">{TRAINING_SUMMARY.dueDate}</span>
        </p>

        {/* Warning banner for Financial Services LOB */}
        {financialServicesLob && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#D97706] bg-[#FFF7ED] px-4 py-3">
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#E61030] animate-pulse" />
            <p className="text-sm font-semibold text-[#C45A00]">
              Financial Services LOB below 95% threshold at{" "}
              <span className="tabular-nums text-[#E61030]">
                {financialServicesLob.completionRate}%
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
