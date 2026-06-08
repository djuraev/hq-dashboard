import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Star, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { ChartCard, Card, SectionHeader } from "../components/ui";
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
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Teacher Analytics" subtitle="Teaching activity, outcomes and participation" />
      <FilterBar />

      {/* Active / Inactive route to the full roster pre-filtered by status. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatusCard
          label="Active Teachers"
          value={fmtInt(TEACHER_METRICS.active)}
          sub="View list →"
          onClick={() => navigate("/teachers/all?status=active")}
        />
        <StatusCard
          label="Inactive Teachers"
          value={TEACHER_METRICS.inactive}
          sub="View list →"
          onClick={() => navigate("/teachers/all?status=inactive")}
        />
        <PlainCard label="Avg Graduate Rate" value={`${avg((t) => t.graduateRate)}%`} />
        <PlainCard label="Avg Dropout Rate" value={`${avg((t) => t.dropoutRate)}%`} />
        <PlainCard label="Avg Attendance" value={`${TEACHER_METRICS.avgAttendance}%`} />
        <PlainCard label="Engagement Score" value={TEACHER_METRICS.engagementScore} />
      </div>

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
          <SectionHeader
            title="Teacher Ranking"
            subtitle="Top 10 by engagement — click a teacher for detailed KPIs"
            action={
              <Link
                to="/teachers/all"
                className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                More <ArrowRight size={13} />
              </Link>
            }
          />
          <RankingTable rows={TEACHER_RANKING} columns={cols} onRowClick={(t) => setSelected(t)} dense />
        </Card>
      </div>

      <TeacherDrawer teacher={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function StatusCard({ label, value, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card card-hover p-3.5 text-left transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="text-xs font-medium muted">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight text-ink-900">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold text-brand-600">{sub}</div>
    </button>
  );
}

function PlainCard({ label, value }) {
  return (
    <div className="card p-3.5">
      <div className="text-xs font-medium muted">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight text-ink-900">{value}</div>
    </div>
  );
}
