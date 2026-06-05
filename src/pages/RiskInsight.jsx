import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles, BookOpen, Users, Award, FileText, TrendingDown, ArrowRight,
} from "lucide-react";
import { PageHeader } from "../components/Layout";
import { Card, SectionHeader } from "../components/ui";
import {
  RISK_TYPES, AI_NARRATIVES, RECOMMENDATIONS, HQ_ACTIONS, ACTION_STATUS_STYLE,
} from "../data/metrics";

const SEV_STYLE = {
  critical: "border-bad/30 bg-bad/5",
  warning: "border-warn/30 bg-warn/5",
  info: "border-brand-200 bg-brand-50/40",
};
const SEV_TEXT = { critical: "text-bad", warning: "text-warn", info: "text-brand-700" };
const REC_ICON = { BookOpen, Users, Award, FileText };

export default function RiskInsight() {
  const { t, i18n } = useTranslation();
  const ko = i18n.language === "ko";
  const [actions, setActions] = useState(HQ_ACTIONS);

  function advance(id) {
    const flow = ["New", "Assigned", "In Progress", "Resolved"];
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = flow[Math.min(flow.length - 1, flow.indexOf(a.status) + 1)];
        return { ...a, status: next };
      })
    );
  }

  return (
    <>
      <PageHeader title={t("pages.risk.title")} subtitle={t("pages.risk.subtitle")} />

      {/* AI narratives */}
      <Card className="p-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Sparkles size={18} className="text-brand-600" /> {ko ? "AI Insight" : "AI Insights"}
            </span>
          }
          subtitle={ko ? "숫자가 아닌 문장으로 상황을 요약" : "Situations summarised in plain language"}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {AI_NARRATIVES.map((n, i) => (
            <div key={i} className={`rounded-xl border-l-4 p-3 text-sm ${n.tone === "up" ? "border-good bg-good/5 text-ink-700" : n.tone === "alert" ? "border-bad bg-bad/5 text-ink-700" : "border-warn bg-warn/5 text-ink-700"}`}>
              {n.text}
            </div>
          ))}
        </div>
      </Card>

      {/* Risk types */}
      <Card className="mt-6 p-4">
        <SectionHeader title={ko ? "주요 리스크 유형" : "Risk Types"} subtitle={ko ? "AI·규칙 기반 자동 감지" : "AI / rule-based detection"} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {RISK_TYPES.map((r) => (
            <div key={r.key} className={`rounded-xl border p-3 ${SEV_STYLE[r.severity]}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-800">{ko ? r.labelKo : r.label}</span>
                <span className={`text-lg font-bold tabular-nums ${SEV_TEXT[r.severity]}`}>{r.count}</span>
              </div>
              <p className="mt-1 text-[11px] muted">{r.rule}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recommendations */}
        <Card className="p-4">
          <SectionHeader title={ko ? "운영 개선 제안" : "Recommendations"} subtitle={ko ? "강좌 개설·강사 지원 자동 추천" : "Course opening & instructor support"} />
          <ul className="space-y-2.5">
            {RECOMMENDATIONS.map((r) => {
              const Icon = REC_ICON[r.icon] ?? TrendingDown;
              return (
                <li key={r.id} className="flex gap-3 rounded-lg border border-ink-100 p-3 dark:border-ink-700">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-800">{r.title}</div>
                    <div className="text-xs muted">{r.detail}</div>
                  </div>
                  <span className={`pill h-fit ${r.impact === "high" ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn"}`}>
                    {r.impact}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* HQ action list */}
        <Card className="p-4">
          <SectionHeader title={ko ? "HQ 액션 리스트" : "HQ Action List"} subtitle={ko ? "오늘 처리해야 할 업무 — 클릭하여 상태 전환" : "Today's tasks — click to advance status"} />
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg border border-ink-100 p-2.5 dark:border-ink-700">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink-800">{ko ? a.labelKo : a.label}</div>
                  <div className="truncate text-xs muted">{a.action}</div>
                </div>
                <button
                  onClick={() => advance(a.id)}
                  disabled={a.status === "Resolved"}
                  className={`pill shrink-0 ${ACTION_STATUS_STYLE[a.status]} ${a.status === "Resolved" ? "" : "hover:opacity-80"}`}
                >
                  {a.status}
                  {a.status !== "Resolved" && <ArrowRight size={11} />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
