import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/Layout";
import { Card, SectionHeader, ChartCard, MetricStrip } from "../components/ui";
import { Bars } from "../components/charts";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
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
}));
const WORST_PCT = Math.min(...CONVERSION.map((s) => s.pct));
const stepColor = (pct) => (pct >= 60 ? "#16a34a" : pct >= 35 ? "#d97706" : "#dc2626");

// Line chart of step conversion %, so weak steps stand out at a glance
// instead of being flattened by absolute-count bars.
function ConversionLine({ ko }) {
  const data = CONVERSION.map((s) => ({ name: ko ? s.labelKo : s.label, pct: s.pct }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 20, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#9aa4b5", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={56} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#9aa4b5", fontSize: 12 }} axisLine={false} tickLine={false} />
        <RTooltip formatter={(v) => [`${v}%`, "Conversion"]} contentStyle={{ borderRadius: 12, border: "1px solid #e1e5ec", fontSize: 13 }} />
        <ReferenceLine y={WORST_PCT} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.5} />
        <Line type="monotone" dataKey="pct" stroke="#3366ff" strokeWidth={2.5}
          dot={(p) => <circle key={p.key} cx={p.cx} cy={p.cy} r={4} fill={stepColor(p.payload.pct)} stroke="#fff" strokeWidth={1.5} />}>
          <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
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

      <Card className="mt-6 p-4">
        <SectionHeader
          title={ko ? "단계별 전환율" : "Step Conversion Rate"}
          subtitle={ko ? "수치(모수)가 아니라 전환율(%) 기준 — 낮은 구간이 문제 구간" : "Read on % conversion, not raw counts — the dips are where prospects are lost"}
        />
        <ConversionLine ko={ko} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <SectionHeader
            title={ko ? "학습자 유입 Funnel" : "Learner Acquisition Funnel"}
            subtitle={ko ? "K-콘텐츠 관심 → 재등록까지 단계별 전환" : "K-content interest → re-enrollment, step conversion"}
          />
          <div className="space-y-1.5">
            {FUNNEL_STEPS.map((s, i) => {
              const widthPct = Math.max(6, (s.count / MAX) * 100);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 text-right text-xs font-medium text-ink-600">
                    {ko ? s.labelKo : s.label}
                  </div>
                  <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-ink-50 dark:bg-ink-800">
                    <div
                      className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-3 text-xs font-semibold text-white transition-all"
                      style={{ width: `${widthPct}%` }}
                    >
                      {fmtInt(s.count)}
                    </div>
                  </div>
                  <div className="w-14 shrink-0 text-right text-xs tabular-nums">
                    {i === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      <span className={s.pct >= 60 ? "text-good" : s.pct >= 35 ? "text-warn" : "text-bad"}>
                        {s.pct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 rounded-lg bg-ink-50 p-3 text-xs text-ink-600 dark:bg-ink-800">
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
