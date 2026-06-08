import { useState } from "react";
import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard, Card, SectionHeader } from "../components/ui";
import FilterBar from "../components/FilterBar";
import RankingTable from "../components/RankingTable";
import CourseDrawer from "../components/CourseDrawer";
import { Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { LineTrend } from "../components/charts";
import { Star, ChevronRight, Info } from "lucide-react";
import { COURSES, RATING_TREND } from "../data/metrics";
import { fmtInt } from "../lib/format";

const sortedByCompletion = [...COURSES].sort((a, b) => b.completion - a.completion);
const topGraduates = [...COURSES].sort((a, b) => b.graduates - a.graduates)[0];

const cols = [
  { key: "rank", label: "#", render: (_r, i) => <span className="font-semibold text-ink-400">{i + 1}</span> },
  { key: "name", label: "Course", render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
  { key: "enrolled", label: "Enrolled", align: "right", render: (r) => fmtInt(r.enrolled) },
  { key: "graduates", label: "Graduates", align: "right", render: (r) => <span className="font-semibold text-good">{fmtInt(r.graduates)}</span> },
  { key: "completion", label: "Completion", align: "right", render: (r) => `${r.completion}%` },
  {
    key: "rating",
    label: "Rating",
    align: "right",
    render: (r) => (
      <span className="inline-flex items-center gap-1 font-semibold text-ink-800">
        <Star size={13} className="fill-warn text-warn" /> {r.rating}
        <span className="ml-0.5 text-[11px] font-normal text-ink-400">({r.reviews})</span>
      </span>
    ),
  },
  { key: "go", label: "", render: () => <ChevronRight size={15} className="text-ink-300" /> },
];

// Completion bars annotated with cohort size + absolute graduate volume, so a
// high % on a tiny cohort can't be mistaken for a stronger course.
function CompletionWithCohort({ data }) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 64, left: 24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#9aa4b5", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#9aa4b5", fontSize: 12 }} axisLine={false} tickLine={false} />
        <RTooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e1e5ec", fontSize: 13 }}
          formatter={(v, _n, p) => [`${v}%  ·  ${fmtInt(p.payload.graduates)} grads of ${fmtInt(p.payload.enrolled)}`, "Completion"]}
        />
        <Bar dataKey="completion" name="Completion %" fill="#3366ff" radius={[0, 6, 6, 0]} maxBarSize={18}>
          <LabelList
            dataKey="enrolled"
            position="right"
            formatter={(v) => `n=${fmtInt(v)}`}
            style={{ fill: "#9aa4b5", fontSize: 10 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Courses() {
  const [selected, setSelected] = useState(null);
  const byCompletion = [...COURSES].sort((a, b) => b.completion - a.completion);
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
          { label: "Most Graduates", value: fmtInt(topGraduates.graduates), sub: topGraduates.name },
          { label: "Lowest Completion", value: `${sortedByCompletion.at(-1).completion}%`, sub: sortedByCompletion.at(-1).name },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Completion Comparison" subtitle="Completion % with cohort size (n) — read alongside graduate volume">
          <CompletionWithCohort data={byCompletion} />
        </ChartCard>
        <ChartCard title="Rating Trends" subtitle="Average course rating over time — weigh against review counts in the ranking">
          <LineTrend data={RATING_TREND} xKey="month" series={[{ key: "rating", name: "Rating", color: "#d97706" }]} domain={[3.8, 5]} />
        </ChartCard>
      </div>

      <div className="mt-5">
        <Card className="border-brand-100 bg-brand-50/40 p-4 dark:bg-ink-800">
          <SectionHeader
            title="Course Popularity Ranking"
            subtitle="The truest signal — completion % and rating are size-sensitive. Click a course for detail."
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                <Info size={12} /> Primary view
              </span>
            }
          />
          <RankingTable rows={COURSES} columns={cols} onRowClick={(c) => setSelected(c)} dense />
        </Card>
      </div>

      <CourseDrawer course={selected} onClose={() => setSelected(null)} />
    </>
  );
}
