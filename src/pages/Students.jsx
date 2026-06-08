import { useState } from "react";
import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard, Card, SectionHeader, Tabs } from "../components/ui";
import FilterBar from "../components/FilterBar";
import { AreaTrend, Bars } from "../components/charts";
import { STUDENT_METRICS, ENROLLMENT_TREND, STUDENTS_BY_COUNTRY, STUDENT_DISTRIBUTION } from "../data/metrics";
import { fmtInt } from "../lib/format";

// Sequential difficulty progression — distinct hues, no red (reserved for dropout/risk).
const LEVEL_COLORS = ["#8b5cf6", "#6366f1", "#3366ff", "#0ea5e9"];

const TREND_TABS = [
  { key: "enrollments", label: "Enrollments" },
  { key: "dropouts", label: "Dropouts" },
];

export default function Students() {
  const [trendTab, setTrendTab] = useState("enrollments");
  const trendSeries =
    trendTab === "enrollments"
      ? [{ key: "enrollments", name: "Enrollments", color: "#3366ff" }]
      : [{ key: "dropouts", name: "Dropouts", color: "#dc2626" }];
  return (
    <>
      <PageHeader title="Student Analytics" subtitle="Growth, engagement and retention across all branches" />
      <FilterBar />

      <MetricStrip
        items={[
          { label: "Total Enrollments", value: fmtInt(STUDENT_METRICS.totalEnrollments) },
          { label: "New Enrollments", value: fmtInt(STUDENT_METRICS.newEnrollments), sub: "this month" },
          { label: "Student Growth", value: `+${STUDENT_METRICS.growthPct}%`, sub: "MoM" },
          { label: "Dropouts", value: fmtInt(STUDENT_METRICS.dropouts) },
          { label: "Completion Rate", value: `${STUDENT_METRICS.completionRate}%` },
          { label: "Active Branches", value: "243" },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionHeader
            title="Enrollment Trend"
            subtitle={trendTab === "enrollments" ? "Cumulative enrollments by month" : "Monthly dropouts by month"}
            action={<Tabs tabs={TREND_TABS} value={trendTab} onChange={setTrendTab} />}
          />
          <AreaTrend data={ENROLLMENT_TREND} xKey="month" series={trendSeries} />
        </Card>
        <ChartCard title="Student Distribution" subtitle="By proficiency level (beginner → advanced)">
          <Bars
            data={STUDENT_DISTRIBUTION}
            xKey="name"
            series={[{ key: "value", name: "Share %" }]}
            layout="vertical"
            height={240}
            tickFormatter={(v) => `${v}%`}
            colorFn={(row) => LEVEL_COLORS[STUDENT_DISTRIBUTION.indexOf(row)] ?? LEVEL_COLORS[0]}
          />
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard title="Country Comparison" subtitle="Active students by country (top 12)">
          <Bars data={STUDENTS_BY_COUNTRY} xKey="country" series={[{ key: "students", name: "Students" }]} layout="vertical" height={360} />
        </ChartCard>
      </div>
    </>
  );
}
