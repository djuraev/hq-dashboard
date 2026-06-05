import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/Layout";
import { Card, SectionHeader, ChartCard, HealthBadge } from "../components/ui";
import { Bars } from "../components/charts";
import { fmtInt } from "../lib/format";
import { REGIONAL } from "../data/metrics";

export default function Regional() {
  const { t, i18n } = useTranslation();
  const ko = i18n.language === "ko";

  return (
    <>
      <PageHeader title={t("pages.regional.title")} subtitle={t("pages.regional.subtitle")} />

      {/* Region cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REGIONAL.map((r) => (
          <Card key={r.region} className="card-hover p-4 transition-transform duration-150 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink-900">{r.region}</h3>
              <span className="text-xs font-semibold text-good">+{r.growth}%</span>
            </div>
            <div className="mt-0.5 text-xs muted">{r.branches} {ko ? "개 학당" : "institutes"} · {fmtInt(r.students)} {ko ? "수강생" : "learners"}</div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Mini label={ko ? "출석률" : "Attendance"} value={`${r.attendance}%`} />
              <Mini label={ko ? "수료율" : "Completion"} value={`${r.completion}%`} />
              <Mini label={ko ? "재등록률" : "Re-enroll"} value={`${r.reEnrollment}%`} />
              <Mini label={ko ? "K-콘텐츠" : "K-content"} value={`${r.kContentShare}%`} />
            </dl>
            {r.critical > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-bad/10 px-2 py-1 text-xs font-medium text-bad">
                {r.critical} {ko ? "리스크 학당" : "at-risk"}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Comparison chart */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title={ko ? "지역별 학습 성과" : "Regional Performance"} subtitle={ko ? "출석률 vs 수료율 vs 재등록률" : "Attendance vs completion vs re-enrollment"}>
          <Bars
            data={REGIONAL.map((r) => ({ region: r.region, attendance: r.attendance, completion: r.completion, reEnroll: r.reEnrollment }))}
            xKey="region"
            series={[
              { key: "attendance", name: ko ? "출석률" : "Attendance", color: "#3366ff" },
              { key: "completion", name: ko ? "수료율" : "Completion", color: "#16a34a" },
              { key: "reEnroll", name: ko ? "재등록률" : "Re-enroll", color: "#8b5cf6" },
            ]}
            height={300}
          />
        </ChartCard>

        <ChartCard title={ko ? "지역별 규모 & 성장" : "Scale & Growth"} subtitle={ko ? "수강생 규모" : "Learner volume by region"}>
          <Bars
            data={REGIONAL.map((r) => ({ region: r.region, students: r.students }))}
            xKey="region"
            series={[{ key: "students", name: ko ? "수강생" : "Learners", color: "#0ea5e9" }]}
            layout="vertical"
            height={300}
          />
        </ChartCard>
      </div>

      {/* Scorecard table */}
      <Card className="mt-6 p-4">
        <SectionHeader title={ko ? "지역 Scorecard" : "Regional Scorecard"} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500 dark:border-ink-700">
                <th className="py-2 pr-3">{ko ? "지역" : "Region"}</th>
                <th className="px-3 py-2 text-right">{ko ? "학당" : "Institutes"}</th>
                <th className="px-3 py-2 text-right">{ko ? "수강생" : "Learners"}</th>
                <th className="px-3 py-2 text-right">{ko ? "출석률" : "Attendance"}</th>
                <th className="px-3 py-2 text-right">{ko ? "수료율" : "Completion"}</th>
                <th className="px-3 py-2 text-right">{ko ? "재등록률" : "Re-enroll"}</th>
                <th className="px-3 py-2 text-right">{ko ? "성장률" : "Growth"}</th>
                <th className="px-3 py-2 text-right">{ko ? "상태" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {REGIONAL.map((r) => {
                const band = r.critical >= 2 ? "critical" : r.critical === 1 ? "attention" : "healthy";
                return (
                  <tr key={r.region} className="border-b border-ink-50 last:border-0 dark:border-ink-800">
                    <td className="py-2.5 pr-3 font-medium text-ink-800">{r.region}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{r.branches}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(r.students)}</td>
                    <td className="px-3 py-2.5 text-right">{r.attendance}%</td>
                    <td className="px-3 py-2.5 text-right">{r.completion}%</td>
                    <td className="px-3 py-2.5 text-right">{r.reEnrollment}%</td>
                    <td className="px-3 py-2.5 text-right text-good">+{r.growth}%</td>
                    <td className="px-3 py-2.5 text-right"><HealthBadge band={band} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] muted">{label}</dt>
      <dd className="font-semibold text-ink-800">{value}</dd>
    </div>
  );
}
