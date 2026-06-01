import { useState } from "react";
import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard, Card, SectionHeader } from "../components/ui";
import FilterBar from "../components/FilterBar";
import RankingTable from "../components/RankingTable";
import CourseDrawer from "../components/CourseDrawer";
import { Bars, LineTrend } from "../components/charts";
import { Star, ChevronRight } from "lucide-react";
import { COURSES, RATING_TREND } from "../data/metrics";
import { fmtInt } from "../lib/format";

const sortedByCompletion = [...COURSES].sort((a, b) => b.completion - a.completion);

const cols = [
  { key: "name", label: "Course", render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
  { key: "enrolled", label: "Enrolled", align: "right", render: (r) => fmtInt(r.enrolled) },
  { key: "completion", label: "Completion", align: "right", render: (r) => `${r.completion}%` },
  {
    key: "rating",
    label: "Rating",
    align: "right",
    render: (r) => (
      <span className="inline-flex items-center gap-1 font-semibold text-ink-800">
        <Star size={13} className="fill-warn text-warn" /> {r.rating}
      </span>
    ),
  },
  { key: "go", label: "", render: () => <ChevronRight size={15} className="text-ink-300" /> },
];

export default function Courses() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <PageHeader title="Course Analytics" subtitle="Curriculum effectiveness and engagement" />
      <FilterBar extra={null} />

      <MetricStrip
        items={[
          { label: "Total Courses", value: COURSES.length },
          { label: "Avg Completion", value: `${Math.round(COURSES.reduce((a, c) => a + c.completion, 0) / COURSES.length)}%` },
          { label: "Avg Rating", value: (COURSES.reduce((a, c) => a + c.rating, 0) / COURSES.length).toFixed(2) },
          { label: "Most Popular", value: fmtInt(COURSES[0].enrolled), sub: COURSES[0].name },
          { label: "Top Completion", value: `${sortedByCompletion[0].completion}%`, sub: sortedByCompletion[0].name },
          { label: "Lowest Completion", value: `${sortedByCompletion.at(-1).completion}%`, sub: sortedByCompletion.at(-1).name },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Completion Comparison" subtitle="Completion rate by course">
          <Bars data={[...COURSES].sort((a, b) => b.completion - a.completion)} xKey="name" series={[{ key: "completion", name: "Completion %" }]} layout="vertical" height={380} />
        </ChartCard>
        <ChartCard title="Rating Trends" subtitle="Average course rating over time">
          <LineTrend data={RATING_TREND} xKey="month" series={[{ key: "rating", name: "Rating", color: "#d97706" }]} domain={[3.8, 5]} />
        </ChartCard>
      </div>

      <div className="mt-5">
        <Card className="p-4">
          <SectionHeader title="Course Popularity Ranking" subtitle="Click a course for detail" />
          <RankingTable rows={COURSES} columns={cols} onRowClick={(c) => setSelected(c)} dense />
        </Card>
      </div>

      <CourseDrawer course={selected} onClose={() => setSelected(null)} />
    </>
  );
}
