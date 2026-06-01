import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard, Card, SectionHeader } from "../components/ui";
import FilterBar from "../components/FilterBar";
import RankingTable from "../components/RankingTable";
import { LineTrend } from "../components/charts";
import TeacherDrawer from "../components/TeacherDrawer";
import { TEACHER_METRICS, TEACHER_ACTIVITY_TREND, TEACHER_RANKING, TEACHERS } from "../data/metrics";
import { fmtInt } from "../lib/format";

const cols = [
  { key: "rank", label: "#", render: (r) => <span className="font-semibold text-ink-400">{r.rank}</span> },
  { key: "name", label: "Teacher", render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
  { key: "subject", label: "Subject", render: (r) => <span className="muted">{r.subject}</span> },
  { key: "branch", label: "Branch", render: (r) => <span className="muted">{r.branch}</span> },
  { key: "graduateRate", label: "Graduate", align: "right", render: (r) => <span className="font-medium text-good">{r.graduateRate}%</span> },
  { key: "dropoutRate", label: "Dropout", align: "right", render: (r) => <span className="font-medium text-bad">{r.dropoutRate}%</span> },
  { key: "attendance", label: "Attend.", align: "right", render: (r) => `${r.attendance}%` },
  { key: "rating", label: "Rating", align: "right", render: (r) => <span className="inline-flex items-center gap-1 font-semibold text-ink-800"><Star size={12} className="fill-warn text-warn" />{r.rating}</span> },
  { key: "engagement", label: "Engagement", align: "right", render: (r) => <span className="font-semibold text-brand-600">{r.engagement}</span> },
  { key: "go", label: "", render: () => <ChevronRight size={15} className="text-ink-300" /> },
];

const avg = (f) => Math.round(TEACHERS.reduce((a, t) => a + f(t), 0) / TEACHERS.length);

export default function Teachers() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <PageHeader title="Teacher Analytics" subtitle="Teaching activity, outcomes and participation" />
      <FilterBar />

      <MetricStrip
        items={[
          { label: "Active Teachers", value: fmtInt(TEACHER_METRICS.active) },
          { label: "Inactive Teachers", value: TEACHER_METRICS.inactive },
          { label: "Avg Graduate Rate", value: `${avg((t) => t.graduateRate)}%` },
          { label: "Avg Dropout Rate", value: `${avg((t) => t.dropoutRate)}%` },
          { label: "Avg Attendance", value: `${TEACHER_METRICS.avgAttendance}%` },
          { label: "Engagement Score", value: TEACHER_METRICS.engagementScore },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Activity Trend" subtitle="Classes & assignments graded">
          <LineTrend
            data={TEACHER_ACTIVITY_TREND}
            xKey="month"
            series={[
              { key: "classes", name: "Classes", color: "#3366ff" },
              { key: "graded", name: "Graded", color: "#16a34a" },
            ]}
          />
        </ChartCard>
        <Card className="p-4 lg:col-span-2">
          <SectionHeader title="Teacher Ranking" subtitle="Click a teacher for detailed KPIs" />
          <RankingTable rows={TEACHER_RANKING} columns={cols} onRowClick={(t) => setSelected(t)} dense />
        </Card>
      </div>

      <TeacherDrawer teacher={selected} onClose={() => setSelected(null)} />
    </>
  );
}
