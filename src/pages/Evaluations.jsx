import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Smile, MessageSquare, Percent, Users } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { MetricStrip, ChartCard, Card, SectionHeader } from "../components/ui";
import FilterBar from "../components/FilterBar";
import RankingTable from "../components/RankingTable";
import { Bars } from "../components/charts";
import { EvalSyncBar, CsatBadge, Stars } from "../components/survey";
import { SURVEYS, SURVEY_SUMMARY } from "../data/surveys";
import { fetchAllSurveys } from "../lib/evalSync";
import { fmtInt } from "../lib/format";

const PAGE = 20;

export default function Evaluations() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = t
      ? SURVEYS.filter((s) => s.branchName.toLowerCase().includes(t) || s.country.toLowerCase().includes(t))
      : SURVEYS;
    return [...list].sort((a, b) => b.csat - a.csat).map((s, i) => ({ ...s, rank: i + 1 }));
  }, [q]);

  const cols = [
    { key: "rank", label: "#", render: (r) => <span className="font-semibold text-ink-400">{r.rank}</span> },
    { key: "branchName", label: "Branch", render: (r) => <span className="font-medium text-ink-800">{r.branchName}</span> },
    { key: "country", label: "Country", render: (r) => <span className="muted">{r.country}</span> },
    { key: "csat", label: "CSAT", align: "right", render: (r) => <CsatBadge csat={r.csat} /> },
    { key: "nps", label: "NPS", align: "right", render: (r) => <span className={`font-semibold ${r.nps >= 30 ? "text-good" : r.nps >= 0 ? "text-warn" : "text-bad"}`}>{r.nps > 0 ? "+" : ""}{r.nps}</span> },
    { key: "responseRate", label: "Response", align: "right", render: (r) => `${r.responseRate}%` },
    { key: "responses", label: "Responses", align: "right", render: (r) => fmtInt(r.responses) },
    { key: "rating", label: "Rating", align: "right", render: (r) => <Stars value={r.csat / 20} size={12} /> },
    { key: "go", label: "", render: () => <ChevronRight size={15} className="text-ink-300" /> },
  ];

  const top = rows.slice(0, 8);
  const bottom = [...SURVEYS].sort((a, b) => a.csat - b.csat).slice(0, 8);

  return (
    <>
      <PageHeader title="Survey & Evaluation" subtitle="Student satisfaction results fetched from EvalSys" />
      <EvalSyncBar onSync={fetchAllSurveys} />
      <FilterBar />

      <MetricStrip
        items={[
          { label: "Avg CSAT", value: SURVEY_SUMMARY.avgCsat },
          { label: "Avg NPS", value: `+${SURVEY_SUMMARY.avgNps}` },
          { label: "Response Rate", value: `${SURVEY_SUMMARY.avgResponseRate}%` },
          { label: "Total Responses", value: fmtInt(SURVEY_SUMMARY.totalResponses) },
          { label: "Promoter Branches", value: SURVEY_SUMMARY.promoters, sub: "CSAT ≥ 80" },
          { label: "Detractor Branches", value: SURVEY_SUMMARY.detractors, sub: "CSAT < 65" },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Category Scores" subtitle="Average across all branches">
          <Bars data={SURVEY_SUMMARY.catAvg} xKey="label" series={[{ key: "score", name: "Score" }]} layout="vertical" height={240} />
        </ChartCard>
        <Card className="p-4">
          <SectionHeader title="Lowest Satisfaction" subtitle="Branches needing attention" />
          <RankingTable
            rows={bottom.map((s, i) => ({ ...s, rank: i + 1 }))}
            columns={cols.filter((c) => ["rank", "branchName", "country", "csat", "responseRate", "go"].includes(c.key))}
            onRowClick={(r) => navigate(`/evaluations/${r.branchId}`)}
            dense
          />
        </Card>
      </div>

      <div className="mt-5">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SectionHeader title="Branch Evaluation Leaderboard" subtitle="Click a branch for full survey detail" />
            <div className="relative w-full max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
                placeholder="Search branches…"
                className="w-full rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <RankingTable rows={rows.slice(0, shown)} columns={cols} onRowClick={(r) => navigate(`/evaluations/${r.branchId}`)} dense />
          {shown < rows.length && (
            <div className="mt-4 text-center">
              <button onClick={() => setShown((s) => s + PAGE)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
                Load more
              </button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
