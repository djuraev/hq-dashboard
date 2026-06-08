import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { Card, SectionHeader, ChartCard, MetricStrip, Tabs } from "../components/ui";
import { Bars } from "../components/charts";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, LabelList, ReferenceLine,
} from "recharts";
import { fmtInt } from "../lib/format";
import { FUNNEL_STEPS, COUNTRY_DEMAND } from "../data/metrics";

const MAX = FUNNEL_STEPS[0].count;

// Step-to-step conversion %, excluding the 100% baseline interest step.
const CONVERSION = FUNNEL_STEPS.slice(1).map((s) => ({
  key: s.key,
  label: s.label,
  labelKo: s.labelKo,
  pct: s.pct,
  count: s.count,
  drop: s.drop,
}));
const WORST_PCT = Math.min(...CONVERSION.map((s) => s.pct));
const WORST_KEY = CONVERSION.find((s) => s.pct === WORST_PCT)?.key;
const stepColor = (pct) => (pct >= 60 ? "#16a34a" : pct >= 35 ? "#d97706" : "#dc2626");

// ── View 1: horizontal %-bars, color-graded by health ─────────────────
function ConversionBars({ ko }) {
  return (
    <div className="space-y-2">
      {CONVERSION.map((s) => {
        const worst = s.key === WORST_KEY;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="w-36 shrink-0 text-right text-xs font-medium text-ink-600">{ko ? s.labelKo : s.label}</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-ink-50 dark:bg-ink-800">
              <div className="flex h-full items-center justify-end rounded-lg px-2 text-xs font-bold text-white transition-all"
                style={{ width: `${Math.max(8, s.pct)}%`, background: stepColor(s.pct) }}>
                {s.pct}%
              </div>
            </div>
            <div className="w-24 shrink-0 text-right text-[11px] tabular-nums muted">{fmtInt(s.count)}{worst && <span className="ml-1 font-bold text-bad">◄ low</span>}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── View 2: %-bars + drop-off lost overlay ────────────────────────────
function ConversionDrop({ ko }) {
  return (
    <div className="space-y-2">
      {CONVERSION.map((s) => (
        <div key={s.key} className="flex items-center gap-3">
          <div className="w-36 shrink-0 text-right text-xs font-medium text-ink-600">{ko ? s.labelKo : s.label}</div>
          <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-bad/10">
            <div className="flex h-full items-center justify-end rounded-lg px-2 text-xs font-bold text-white"
              style={{ width: `${Math.max(8, s.pct)}%`, background: stepColor(s.pct) }}>
              {s.pct}%
            </div>
          </div>
          <div className="w-24 shrink-0 text-right text-[11px] font-semibold tabular-nums text-bad">−{s.drop}% {ko ? "이탈" : "lost"}</div>
        </div>
      ))}
    </div>
  );
}

// ── View 3: refined line — area fill + 50% threshold + colored dots ───
function ConversionLine({ ko, height = 300 }) {
  const data = CONVERSION.map((s) => ({ name: ko ? s.labelKo : s.label, pct: s.pct, count: s.count, drop: s.drop }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 24, right: 16, left: -8, bottom: 8 }}>
        <defs>
          <linearGradient id="conv-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3366ff" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#3366ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#9aa4b5", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={64} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#9aa4b5", fontSize: 12 }} axisLine={false} tickLine={false} />
        <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e1e5ec", fontSize: 13 }}
          formatter={(v, _n, p) => [`${v}% conversion · ${fmtInt(p.payload.count)} reached · -${p.payload.drop}% drop`, ko ? "단계" : "Step"]} />
        <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.6}
          label={{ value: "50%", position: "insideTopRight", fill: "#94a3b8", fontSize: 11 }} />
        <Area type="monotone" dataKey="pct" stroke="#3366ff" strokeWidth={2.5} fill="url(#conv-fill)"
          dot={(p) => <circle key={p.key} cx={p.cx} cy={p.cy} r={5} fill={stepColor(p.payload.pct)} stroke="#fff" strokeWidth={1.5} />}>
          <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 12, fontWeight: 700, fill: "#475569" }} />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── View 4: %-bar + momentum delta vs previous step ───────────────────
function ConversionDelta({ ko }) {
  return (
    <div className="space-y-2">
      {CONVERSION.map((s, i) => {
        const prev = i > 0 ? CONVERSION[i - 1].pct : null;
        const delta = prev == null ? null : s.pct - prev;
        const up = delta != null && delta >= 0;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="w-36 shrink-0 text-right text-xs font-medium text-ink-600">{ko ? s.labelKo : s.label}</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-ink-50 dark:bg-ink-800">
              <div className="flex h-full items-center justify-end rounded-lg px-2 text-xs font-bold text-white"
                style={{ width: `${Math.max(8, s.pct)}%`, background: stepColor(s.pct) }}>
                {s.pct}%
              </div>
            </div>
            <div className={`flex w-20 shrink-0 items-center justify-end gap-0.5 text-[11px] font-semibold tabular-nums ${delta == null ? "muted" : up ? "text-good" : "text-bad"}`}>
              {delta == null ? "—" : (
                <>{up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{up ? "+" : ""}{delta}</>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CONV_VIEWS = [
  { key: "bars", label: "% Bars" },
  { key: "drop", label: "Drop-off" },
  { key: "line", label: "Line" },
  { key: "delta", label: "Momentum" },
];

function ConversionPanel({ ko }) {
  const [view, setView] = useState("bars");
  const subtitle = {
    bars: ko ? "전환율(%) 막대 — 짧고 빨간 구간이 문제" : "Conversion % bars — short & red = problem step",
    drop: ko ? "각 단계 이탈률(−%) 강조" : "Drop-off lost at each step (−%)",
    line: ko ? "여정 전체 전환율 추이 (50% 기준선)" : "Conversion trend across journey (50% line)",
    delta: ko ? "이전 단계 대비 모멘텀(↑/↓)" : "Momentum vs previous step (↑/↓)",
  }[view];
  return (
    <>
      <SectionHeader
        title={ko ? "단계별 전환율" : "Step Conversion Rate"}
        subtitle={subtitle}
        action={<Tabs tabs={CONV_VIEWS} value={view} onChange={setView} />}
      />
      {view === "bars" && <ConversionBars ko={ko} />}
      {view === "drop" && <ConversionDrop ko={ko} />}
      {view === "line" && <ConversionLine ko={ko} height={320} />}
      {view === "delta" && <ConversionDelta ko={ko} />}
    </>
  );
}

export default function EnrollmentFunnel() {
  const { t, i18n } = useTranslation();
  const ko = i18n.language === "ko";
  const [scope, setScope] = useState("Global");

  const overall = Math.round((FUNNEL_STEPS.at(-1).count / MAX) * 1000) / 10;
  const strip = [
    { label: ko ? "관심 유입" : "Interest Reach", value: fmtInt(FUNNEL_STEPS[0].count) },
    { label: ko ? "수강 확정" : "Enrolled", value: fmtInt(FUNNEL_STEPS[5].count) },
    { label: ko ? "수료" : "Completed", value: fmtInt(FUNNEL_STEPS[7].count) },
    { label: ko ? "재등록" : "Re-enrolled", value: fmtInt(FUNNEL_STEPS[8].count) },
    { label: ko ? "전체 전환율" : "End-to-end", value: `${overall}%` },
    { label: ko ? "최대 이탈 단계" : "Biggest Drop", value: biggestDrop(ko) },
  ];

  return (
    <>
      <PageHeader
        title={t("pages.funnel.title")}
        subtitle={t("pages.funnel.subtitle")}
      >
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:bg-ink-900 dark:border-ink-700"
        >
          <option>Global</option>
          <option>By Country</option>
          <option>By Institute</option>
        </select>
      </PageHeader>

      <MetricStrip items={strip} />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <ConversionPanel ko={ko} />
          <p className="mt-3 rounded-lg bg-ink-50 p-3 text-xs text-ink-600 dark:bg-ink-800">
            {ko
              ? "이 화면의 목적은 학생 수가 아니라 어디에서 이탈이 발생하는지 파악하는 것입니다."
              : "Purpose: not raw counts, but pinpointing where prospects drop off."}
          </p>
        </Card>

        <ChartCard
          title={ko ? "정원 대비 신청률" : "Demand vs Capacity"}
          subtitle={ko ? "100% 초과(빨강)는 정원 초과 — 증설 검토 대상" : "Over 100% (red) means over capacity — candidates for expansion"}
        >
          <Bars
            data={COUNTRY_DEMAND.slice(0, 8).map((c) => ({ country: c.country, fillRate: c.fillRate }))}
            xKey="country"
            series={[{ key: "fillRate", name: "Fill Rate %" }]}
            layout="vertical"
            height={300}
            tickFormatter={(v) => `${v}%`}
            colorFn={(row) => (row.fillRate > 100 ? "#dc2626" : "#d97706")}
          />
        </ChartCard>
      </div>

      <Card className="mt-6 p-4">
        <SectionHeader
          title={ko ? "국가별 수요 분석" : "Country Demand Analysis"}
          subtitle={ko ? "어느 국가에 학당·강사·온라인 과정이 필요한가" : "Where to add institutes, instructors, online courses"}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500 dark:border-ink-700">
                <th className="py-2 pr-3">{ko ? "국가" : "Country"}</th>
                <th className="px-3 py-2 text-right">{ko ? "신규 가입" : "Sign-ups"}</th>
                <th className="px-3 py-2 text-right">{ko ? "레벨테스트" : "Level Tests"}</th>
                <th className="px-3 py-2 text-right">{ko ? "수강신청" : "Enrollments"}</th>
                <th className="px-3 py-2 text-right">{ko ? "상담 대기" : "Consult Backlog"}</th>
                <th className="px-3 py-2 text-right">{ko ? "정원 대비" : "Fill Rate"}</th>
                <th className="px-3 py-2 text-right">{ko ? "대기자" : "Waitlist"}</th>
                <th className="px-3 py-2 text-right">{ko ? "K-콘텐츠 유입" : "K-Content %"}</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRY_DEMAND.map((c) => (
                <tr key={c.code} className="border-b border-ink-50 last:border-0 dark:border-ink-800">
                  <td className="py-2.5 pr-3 font-medium text-ink-800">{c.country}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(c.signups)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(c.levelTests)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(c.enrollments)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(c.consultBacklog)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={c.fillRate > 100 ? "font-semibold text-bad" : c.fillRate > 85 ? "text-warn" : "text-ink-600"}>
                      {c.fillRate}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-ink-800">
                    {c.waitlist > 0 ? fmtInt(c.waitlist) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">{c.kContentShare}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function biggestDrop(ko) {
  let worst = FUNNEL_STEPS[1];
  for (const s of FUNNEL_STEPS) if (s.pct > 0 && s.pct < worst.pct) worst = s;
  return ko ? worst.labelKo : worst.label;
}
