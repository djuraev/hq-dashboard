import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard, Card, SectionHeader } from "../components/ui";
import FilterBar from "../components/FilterBar";
import RankingTable from "../components/RankingTable";
import { LineTrend, Bars, Donut } from "../components/charts";
import {
  CONTENT_METRICS, CONTENT_RANKING, CONTENT_USAGE_TREND,
  LMS_METRICS, LMS_TREND, DEVICE_USAGE, LMS_LEADERBOARD,
} from "../data/metrics";
import { fmtInt } from "../lib/format";

const contentCols = [
  { key: "name", label: "Material", render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
  { key: "type", label: "Type", render: (r) => <span className="pill bg-brand-50 text-brand-700">{r.type}</span> },
  { key: "usage", label: "Usage", align: "right", render: (r) => fmtInt(r.usage) },
];

const lmsCols = [
  { key: "rank", label: "#", render: (r) => <span className="font-semibold text-ink-400">{r.rank}</span> },
  { key: "branch", label: "Branch", render: (r) => <span className="font-medium text-ink-800">{r.branch}</span> },
  { key: "country", label: "Country", render: (r) => <span className="muted">{r.country}</span> },
  { key: "adoption", label: "Adoption", align: "right", render: (r) => <span className="font-semibold text-brand-600">{r.adoption}%</span> },
  { key: "go", label: "", render: () => <ChevronRight size={15} className="text-ink-300" /> },
];

export default function Content() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Content & LMS Analytics" subtitle="Platform usage and learning material effectiveness" />
      <FilterBar />

      {/* LMS adoption (Section 7) */}
      <SectionHeader title="LMS Adoption" subtitle="Actual platform usage across branches" />
      <MetricStrip
        items={[
          { label: "Daily Active Users", value: fmtInt(LMS_METRICS.dau) },
          { label: "Weekly Active Users", value: fmtInt(LMS_METRICS.wau) },
          { label: "Monthly Active Users", value: fmtInt(LMS_METRICS.mau) },
          { label: "Avg Session", value: LMS_METRICS.avgSession },
          { label: "Mobile Usage", value: `${LMS_METRICS.mobile}%` },
          { label: "Web Usage", value: `${LMS_METRICS.web}%` },
        ]}
      />
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="DAU / WAU / MAU Trend">
          <LineTrend
            data={LMS_TREND}
            xKey="month"
            series={[
              { key: "DAU", color: "#3366ff" },
              { key: "WAU", color: "#16a34a" },
              { key: "MAU", color: "#d97706" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Device Usage">
          <Donut data={DEVICE_USAGE} colors={["#3366ff", "#8b5cf6"]} />
        </ChartCard>
      </div>
      <div className="mt-5">
        <Card className="p-4">
          <SectionHeader title="LMS Adoption Leaderboard" subtitle="Top 10 branches — click to open" />
          <RankingTable rows={LMS_LEADERBOARD} columns={lmsCols} onRowClick={(r) => navigate(`/branches/${r.id}`)} dense />
        </Card>
      </div>

      {/* Content analytics (Section 10) */}
      <div className="mt-8">
        <SectionHeader title="Content Analytics" subtitle="Most-used materials and learning time" />
      </div>
      <MetricStrip
        items={[
          { label: "PDF Downloads", value: fmtInt(CONTENT_METRICS.pdfDownloads) },
          { label: "Video Views", value: fmtInt(CONTENT_METRICS.videoViews) },
          { label: "Quiz Attempts", value: fmtInt(CONTENT_METRICS.quizAttempts) },
          { label: "Avg Learning Time", value: CONTENT_METRICS.avgLearningTime },
          { label: "Materials", value: "1,240" },
          { label: "Active Uploads", value: "318" },
        ]}
      />
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Usage Trend" subtitle="PDF / Video / Quiz over time">
          <Bars
            data={CONTENT_USAGE_TREND}
            xKey="month"
            series={[
              { key: "pdf", name: "PDF", color: "#3366ff" },
              { key: "video", name: "Video", color: "#16a34a" },
              { key: "quiz", name: "Quiz", color: "#d97706" },
            ]}
          />
        </ChartCard>
        <Card className="p-4">
          <SectionHeader title="Content Popularity Ranking" subtitle="Most used materials" />
          <RankingTable rows={CONTENT_RANKING} columns={contentCols} dense />
        </Card>
      </div>
    </>
  );
}
