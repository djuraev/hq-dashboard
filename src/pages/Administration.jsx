import { useTranslation } from "react-i18next";
import { FileText, Clock, FileCheck2, Megaphone } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { Card, SectionHeader, ChartCard, MetricStrip, ProgressBar } from "../components/ui";
import { Bars } from "../components/charts";
import { fmtInt } from "../lib/format";
import {
  ADMIN_METRICS, REPORT_SUBMISSION_TREND, PENDING_APPROVALS,
  BUDGET_CATEGORIES, BUDGET_SUMMARY, BUDGET_FLAGS,
} from "../data/metrics";

const PRIORITY_STYLE = {
  high: "bg-bad/10 text-bad",
  medium: "bg-warn/10 text-warn",
  low: "bg-ink-100 text-ink-500",
};

export default function Administration() {
  const { t, i18n } = useTranslation();
  const ko = i18n.language === "ko";

  const strip = [
    { label: ko ? "보고서 제출률" : "Report Submission", value: `${ADMIN_METRICS.reportSubmission}%` },
    { label: ko ? "보고 지연 학당" : "Delayed Institutes", value: fmtInt(ADMIN_METRICS.delayedInstitutes) },
    { label: ko ? "승인 대기" : "Pending Approvals", value: fmtInt(ADMIN_METRICS.pendingApprovals) },
    { label: ko ? "증빙 제출률" : "Evidence Submission", value: `${ADMIN_METRICS.evidenceSubmission}%` },
    { label: ko ? "공지 확인률" : "Notice Read", value: `${ADMIN_METRICS.noticeRead}%` },
    { label: ko ? "요청 처리 시간" : "Req. Handling", value: ADMIN_METRICS.avgRequestHandling },
  ];

  return (
    <>
      <PageHeader title={t("pages.admin.title")} subtitle={t("pages.admin.subtitle")} />

      <MetricStrip items={strip} />

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard
          title={ko ? "보고서 제출 현황" : "Report Submission Status"}
          subtitle={ko ? "월간 정기 보고 (정시/지연/미제출)" : "Monthly reports: on-time / delayed / missing"}
          className="xl:col-span-2"
        >
          <Bars
            data={REPORT_SUBMISSION_TREND}
            xKey="month"
            series={[
              { key: "onTime", name: ko ? "정시" : "On time", color: "#16a34a" },
              { key: "delayed", name: ko ? "지연" : "Delayed", color: "#d97706" },
              { key: "missing", name: ko ? "미제출" : "Missing", color: "#dc2626" },
            ]}
            height={300}
          />
        </ChartCard>

        <Card className="p-4">
          <SectionHeader title={ko ? "행정 처리 요약" : "Admin Throughput"} />
          <ul className="space-y-3 text-sm">
            <AdminRow icon={FileText} label={ko ? "월간 보고서 제출률" : "Report submission"} value={`${ADMIN_METRICS.reportSubmission}%`} pct={ADMIN_METRICS.reportSubmission} />
            <AdminRow icon={FileCheck2} label={ko ? "증빙자료 제출률" : "Evidence submission"} value={`${ADMIN_METRICS.evidenceSubmission}%`} pct={ADMIN_METRICS.evidenceSubmission} />
            <AdminRow icon={Megaphone} label={ko ? "공지 확인률" : "Notice read rate"} value={`${ADMIN_METRICS.noticeRead}%`} pct={ADMIN_METRICS.noticeRead} />
            <AdminRow icon={Clock} label={ko ? "보고 지연 학당" : "Delayed institutes"} value={fmtInt(ADMIN_METRICS.delayedInstitutes)} pct={(ADMIN_METRICS.delayedInstitutes / 252) * 100} bad />
          </ul>
        </Card>
      </div>

      {/* Budget */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-4">
          <SectionHeader title={ko ? "예산 집행 요약" : "Budget Execution"} subtitle={ko ? "₩ 백만 단위" : "₩ million"} />
          <div className="text-3xl font-bold text-ink-900">{BUDGET_SUMMARY.rate}%</div>
          <div className="muted text-xs">{ko ? "전체 집행률" : "Overall execution"}</div>
          <div className="mt-2"><ProgressBar value={BUDGET_SUMMARY.rate} /></div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label={ko ? "배정" : "Allocated"} value={`₩${fmtInt(BUDGET_SUMMARY.allocated)}M`} />
            <Stat label={ko ? "집행" : "Executed"} value={`₩${fmtInt(BUDGET_SUMMARY.executed)}M`} />
            <Stat label={ko ? "미집행" : "Remaining"} value={`₩${fmtInt(BUDGET_SUMMARY.remaining)}M`} />
            <Stat label={ko ? "정산 완료율" : "Settlement"} value={`${BUDGET_SUMMARY.settlementRate}%`} />
          </dl>
        </Card>

        <ChartCard
          title={ko ? "항목별 집행" : "Execution by Category"}
          subtitle={ko ? "강사료·교재·행사·운영비·홍보" : "Instructor / materials / events / ops / marketing"}
          className="xl:col-span-2"
        >
          <Bars
            data={BUDGET_CATEGORIES.map((c) => ({ category: ko ? c.labelKo : c.category, allocated: c.allocated, executed: c.executed }))}
            xKey="category"
            series={[
              { key: "allocated", name: ko ? "배정" : "Allocated", color: "#c7d2fe" },
              { key: "executed", name: ko ? "집행" : "Executed", color: "#3366ff" },
            ]}
            height={300}
          />
        </ChartCard>
      </div>

      {/* Approvals + budget flags */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader title={ko ? "승인 대기 건수" : "Pending Approvals"} subtitle={`${PENDING_APPROVALS.length} ${ko ? "건" : "items"}`} />
          <ul className="space-y-2">
            {PENDING_APPROVALS.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg border border-ink-100 p-2.5 dark:border-ink-700">
                <span className={`pill ${PRIORITY_STYLE[a.priority]}`}>{ko ? a.labelKo : a.type}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink-800">{a.institute}</div>
                  <div className="truncate text-xs muted">{a.requested}</div>
                </div>
                <div className={`shrink-0 text-xs font-semibold ${a.age > 5 ? "text-bad" : "muted"}`}>
                  {a.age}{ko ? "일" : "d"}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionHeader title={ko ? "예산 집행 이상 학당" : "Budget Execution Flags"} subtitle={ko ? "초과 집행 또는 미집행 과다" : "Over- or under-execution"} />
          <ul className="space-y-2">
            {BUDGET_FLAGS.map((b) => (
              <li key={b.id} className="flex items-center gap-3 text-sm">
                <span className="flex-1 truncate font-medium text-ink-800">{b.name}</span>
                <span className="muted text-xs">{b.country}</span>
                <span className={`pill ${b.rate > 92 ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn"}`}>
                  {b.rate}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function AdminRow({ icon: Icon, label, value, pct, bad }) {
  return (
    <li>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-ink-600">
          <Icon size={15} /> {label}
        </span>
        <span className={`font-semibold ${bad ? "text-bad" : "text-ink-800"}`}>{value}</span>
      </div>
      <div className="mt-1"><ProgressBar value={pct} band={bad ? "critical" : undefined} /></div>
    </li>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs muted">{label}</dt>
      <dd className="font-semibold text-ink-800">{value}</dd>
    </div>
  );
}
