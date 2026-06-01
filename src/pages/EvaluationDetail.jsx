import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, ThumbsUp, Percent, Users, Building2, Globe2,
} from "lucide-react";
import { Card, SectionHeader, ProgressBar, ChartCard } from "../components/ui";
import { AreaTrend, Bars } from "../components/charts";
import { EvalSyncBar, Stars } from "../components/survey";
import { getSurvey, SURVEY_CATEGORIES, SURVEY_SUMMARY } from "../data/surveys";
import { getBranch } from "../data/branches";
import { fetchBranchSurvey } from "../lib/evalSync";

const FILTERS = ["All", "positive", "neutral", "negative"];

export default function EvaluationDetail() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const survey = getSurvey(branchId);
  const branch = getBranch(branchId);
  const [filter, setFilter] = useState("All");

  if (!survey) {
    return (
      <div className="card p-8 text-center">
        <p className="muted">Survey not found.</p>
        <Link to="/evaluations" className="mt-2 inline-block text-sm font-medium text-brand-600">← Back to Evaluations</Link>
      </div>
    );
  }

  const comments = filter === "All" ? survey.comments : survey.comments.filter((c) => c.sentiment === filter);
  const totalStars = survey.stars.reduce((a, s) => a + s.count, 0) || 1;

  return (
    <>
      <Link to="/evaluations" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to Evaluations
      </Link>

      {/* hero */}
      <Card className="mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-brand-600 to-brand-800 p-5">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white">
            <span className="text-2xl font-extrabold leading-none text-brand-700">{survey.csat}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-brand-400">CSAT</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight text-white">{survey.branchName}</h1>
            <p className="mt-0.5 flex items-center gap-3 text-sm text-brand-100">
              <span className="flex items-center gap-1"><Globe2 size={14} /> {survey.country}</span>
              <Stars value={survey.csat / 20} size={14} />
            </p>
          </div>
          <button
            onClick={() => navigate(`/branches/${branchId}`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25"
          >
            <Building2 size={15} /> View Branch
          </button>
        </div>
      </Card>

      <EvalSyncBar onSync={() => fetchBranchSurvey(branchId)} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi icon={ThumbsUp} label="NPS" value={`${survey.nps > 0 ? "+" : ""}${survey.nps}`} />
        <Kpi icon={Percent} label="Recommend" value={`${survey.recommend}%`} />
        <Kpi icon={Percent} label="Response Rate" value={`${survey.responseRate}%`} />
        <Kpi icon={Users} label="Responses" value={survey.responses.toLocaleString()} />
        <Kpi icon={MessageSquare} label="Pending" value={survey.pendingSurveys.toLocaleString()} />
        <Kpi icon={Percent} label="vs Global CSAT" value={`${survey.csat - SURVEY_SUMMARY.avgCsat >= 0 ? "+" : ""}${survey.csat - SURVEY_SUMMARY.avgCsat}`} />
      </div>

      {/* trend + star distribution */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Satisfaction & Responses" subtitle="CSAT and monthly responses (12 months)">
          <AreaTrend
            data={survey.trend}
            xKey="month"
            series={[
              { key: "csat", name: "CSAT", color: "#3366ff" },
              { key: "responses", name: "Responses", color: "#16a34a" },
            ]}
          />
        </ChartCard>

        <Card className="p-4">
          <SectionHeader title="Rating Distribution" />
          <div className="space-y-2">
            {[...survey.stars].reverse().map((s) => {
              const pct = Math.round((s.count / totalStars) * 100);
              return (
                <div key={s.star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-ink-600">{s.star}★</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-warn" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right font-medium text-ink-700">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* category + question breakdown */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Category Scores" subtitle="vs global average">
          <Bars
            data={survey.categories.map((c) => ({
              label: c.label,
              Branch: c.score,
              Global: SURVEY_SUMMARY.catAvg.find((x) => x.label === c.label)?.score ?? 0,
            }))}
            xKey="label"
            series={[
              { key: "Branch", color: "#3366ff" },
              { key: "Global", color: "#cbd2dd" },
            ]}
            layout="vertical"
            height={260}
          />
        </ChartCard>

        <Card className="p-4 lg:col-span-2">
          <SectionHeader title="Question Breakdown" subtitle="Average score per survey question" />
          <div className="space-y-2.5">
            {SURVEY_CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{cat.label}</div>
                {survey.questions.filter((q) => q.cat === cat.key).map((q) => (
                  <div key={q.id} className="mb-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-700">{q.q}</span>
                      <span className="font-semibold text-ink-800">{q.score}</span>
                    </div>
                    <ProgressBar value={q.score} band={q.score >= 80 ? "healthy" : q.score >= 65 ? "attention" : "critical"} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* comments */}
      <div className="mt-5">
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SectionHeader title="Student Feedback" subtitle={`${survey.comments.length} comments`} />
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${
                    filter === f ? "bg-brand-600 text-white" : "border border-ink-200 text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {comments.length ? (
              comments.map((c) => <CommentItemWithMeta key={c.id} comment={c} />)
            ) : (
              <li className="muted text-sm">No {filter} comments.</li>
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Kpi({ icon: Icon, label, value }) {
  return (
    <Card className="p-3">
      <Icon size={15} className="text-brand-600" />
      <div className="mt-1.5 text-lg font-bold leading-tight text-ink-900">{value}</div>
      <div className="text-[11px] font-medium text-ink-600">{label}</div>
    </Card>
  );
}

function CommentItemWithMeta({ comment }) {
  return (
    <li className={`rounded-lg border-l-4 p-2.5 text-xs ${
      comment.sentiment === "positive" ? "border-l-good bg-good/5" : comment.sentiment === "negative" ? "border-l-bad bg-bad/5" : "border-l-ink-300 bg-ink-50"
    }`}>
      <div className="mb-0.5 flex items-center justify-between">
        <Stars value={comment.stars} size={11} />
        <span className="muted">{comment.reviewer} · {comment.daysAgo}d ago</span>
      </div>
      <p className="text-ink-700">"{comment.text}"</p>
    </li>
  );
}
