import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard } from "../components/ui";
import FilterBar from "../components/FilterBar";
import { AreaTrend, Bars, Donut } from "../components/charts";
import { STUDENT_METRICS, ENROLLMENT_TREND, STUDENTS_BY_COUNTRY, STUDENT_DISTRIBUTION } from "../data/metrics";
import { fmtInt } from "../lib/format";

export default function Students() {
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
        <ChartCard className="lg:col-span-2" title="Enrollment Trend" subtitle="Cumulative enrollments vs monthly dropouts">
          <AreaTrend
            data={ENROLLMENT_TREND}
            xKey="month"
            series={[
              { key: "enrollments", name: "Enrollments", color: "#3366ff" },
              { key: "dropouts", name: "Dropouts", color: "#dc2626" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Student Distribution" subtitle="By proficiency level">
          <Donut data={STUDENT_DISTRIBUTION} />
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
