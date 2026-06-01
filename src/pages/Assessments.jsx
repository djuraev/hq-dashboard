import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard } from "../components/ui";
import FilterBar from "../components/FilterBar";
import { Bars, Donut } from "../components/charts";
import { ASSESSMENT_METRICS, SCORE_DISTRIBUTION, PASS_FAIL, ASSESSMENT_BY_COUNTRY } from "../data/metrics";
import { fmtInt } from "../lib/format";

export default function Assessments() {
  return (
    <>
      <PageHeader title="Assessment Analytics" subtitle="Educational outcomes and TOPIK preparation results" />
      <FilterBar />

      <MetricStrip
        items={[
          { label: "Exam Participation", value: fmtInt(ASSESSMENT_METRICS.participation) },
          { label: "Average Score", value: ASSESSMENT_METRICS.avgScore, sub: "/ 100" },
          { label: "Pass Rate", value: `${ASSESSMENT_METRICS.passRate}%` },
          { label: "TOPIK Pass Rate", value: `${ASSESSMENT_METRICS.topikPass}%` },
          { label: "Avg TOPIK Level", value: "3.4급" },
          { label: "Exams / Month", value: "3,180" },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Score Distribution" subtitle="Students by score band">
          <Bars data={SCORE_DISTRIBUTION} xKey="band" series={[{ key: "students", name: "Students" }]} />
        </ChartCard>
        <ChartCard title="Pass / Fail" subtitle="Global outcome split">
          <Donut data={PASS_FAIL} colors={["#16a34a", "#dc2626"]} />
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard title="Country Ranking" subtitle="Average score & pass rate by country">
          <Bars
            data={ASSESSMENT_BY_COUNTRY}
            xKey="country"
            series={[
              { key: "avgScore", name: "Avg Score", color: "#3366ff" },
              { key: "passRate", name: "Pass Rate %", color: "#16a34a" },
            ]}
            height={320}
          />
        </ChartCard>
      </div>
    </>
  );
}
