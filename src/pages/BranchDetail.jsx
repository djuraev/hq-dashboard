import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, User, GraduationCap, Users, Mail, ListTodo, CalendarClock,
  Trophy, UserPlus, UserMinus, Clock, BookOpen, ClipboardCheck, Smile, Ratio,
  Phone, AtSign, Globe,
} from "lucide-react";
import { Card, SectionHeader, HealthBadge, ProgressBar, ChartCard } from "../components/ui";
import { LineTrend, Bars, Donut } from "../components/charts";
import LocationMap from "../components/LocationMap";
import { EvalSyncBar, CsatBadge, Stars, CommentItem } from "../components/survey";
import { getSurvey } from "../data/surveys";
import { fetchBranchSurvey } from "../lib/evalSync";
import { getBranch } from "../data/branches";
import {
  branchTrend, branchRank, branchHealthBreakdown, branchMonthly, branchStats, branchDevices,
} from "../data/metrics";
import { TOTAL_BRANCHES } from "../data/branches";
import { BAND_STYLE } from "../lib/format";

const GLOBAL_BENCHMARK = { attendance: 91, lmsActivity: 87, completion: 83, healthScore: 78 };

export default function BranchDetail() {
  const { id } = useParams();
  const branch = getBranch(id);

  if (!branch) {
    return (
      <div className="card p-8 text-center">
        <p className="muted">Branch not found.</p>
        <Link to="/branches" className="mt-2 inline-block text-sm font-medium text-brand-600">← Back to branches</Link>
      </div>
    );
  }

  const trend = branchTrend(branch.id);
  const s = BAND_STYLE[branch.band];

  const timeline = [
    { date: "2 days ago", text: "Monthly attendance report submitted." },
    { date: "1 week ago", text: "LMS onboarding session completed for 4 teachers." },
    { date: "3 weeks ago", text: "New course 'TOPIK II Intensive' launched." },
    { date: "1 month ago", text: "Branch manager review meeting with HQ." },
  ];

  const alerts =
    branch.band === "critical"
      ? ["Health score below threshold — intervention required.", "Attendance declined this month."]
      : branch.band === "attention"
      ? ["LMS adoption below regional average."]
      : ["No active alerts. Branch operating normally."];

  const rank = branchRank(branch.id);
  const breakdown = branchHealthBreakdown(branch);
  const monthly = branchMonthly(branch);
  const stats = branchStats(branch);
  const devices = branchDevices(branch);
  const survey = getSurvey(branch.id);

  const quickStats = [
    { icon: Trophy, label: "Global Rank", value: `#${rank}`, sub: `of ${TOTAL_BRANCHES}` },
    { icon: Ratio, label: "Student / Teacher", value: stats.ratio },
    { icon: UserPlus, label: "New Enrollments", value: stats.newEnrollments, sub: "this month" },
    { icon: UserMinus, label: "Dropouts", value: stats.dropouts, sub: "this quarter" },
    { icon: BookOpen, label: "Active Courses", value: stats.coursesActive },
    { icon: ClipboardCheck, label: "Assignments Graded", value: stats.assignmentsGraded.toLocaleString() },
    { icon: Clock, label: "Avg Session", value: stats.avgSession },
    { icon: Smile, label: "Satisfaction (NPS)", value: stats.nps },
  ];

  return (
    <>
      <Link to="/branches" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to Global Branches
      </Link>

      {/* Branded hero */}
      <Card className="mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-brand-600 to-brand-800 p-5">
          <BranchLogo branch={branch} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white">{branch.name}</h1>
              <span className={`pill ${branch.active ? "bg-good/20 text-white" : "bg-bad/30 text-white"}`}>
                {branch.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-brand-100">
              <MapPin size={14} /> {branch.city}, {branch.country} · {branch.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white">
              Health {branch.healthScore}
            </span>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25">
              <Mail size={15} /> Contact
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              <ListTodo size={15} /> Follow-up
            </button>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {quickStats.map((q) => (
          <Card key={q.label} className="p-3">
            <q.icon size={16} className="text-brand-600" />
            <div className="mt-1.5 text-lg font-bold leading-tight text-ink-900">{q.value}</div>
            <div className="text-[11px] font-medium text-ink-600">{q.label}</div>
            {q.sub && <div className="text-[10px] muted">{q.sub}</div>}
          </Card>
        ))}
      </div>

      {/* Location map + contact + profile */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-4">
          <SectionHeader title="Location" subtitle={branch.address} />
          <LocationMap branch={branch} />
        </Card>

        <Card className="p-4">
          <SectionHeader title="Contact Information" />
          <ul className="space-y-3 text-sm">
            <Info icon={User} label="Branch Manager" value={branch.manager} />
            <Info icon={Phone} label="Phone" value={branch.phone} />
            <Info icon={AtSign} label="Email" value={branch.email} />
            <Info icon={Globe} label="Website" value={branch.website} />
            <Info icon={MapPin} label="Address" value={branch.address} />
          </ul>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Branch Profile" />
          <ul className="space-y-3 text-sm">
            <Info icon={GraduationCap} label="Students" value={branch.students.toLocaleString()} />
            <Info icon={Users} label="Teachers" value={branch.teachers.toLocaleString()} />
            <Info icon={MapPin} label="Region" value={branch.region} />
            <Info icon={Trophy} label="Global Rank" value={`#${rank} of ${TOTAL_BRANCHES}`} />
            <Info icon={CalendarClock} label="Status" value={branch.active ? "Active" : "Inactive"} />
          </ul>
        </Card>
      </div>

      {/* Performance metrics */}
      <div className="mt-5">
        <Card className="p-4">
          <SectionHeader title="Performance Metrics" subtitle="vs global benchmark" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Attendance" value={branch.attendance} bench={GLOBAL_BENCHMARK.attendance} />
            <Metric label="LMS Adoption" value={branch.lmsActivity} bench={GLOBAL_BENCHMARK.lmsActivity} />
            <Metric label="Completion Rate" value={branch.completion} bench={GLOBAL_BENCHMARK.completion} />
            <Metric label="Health Score" value={branch.healthScore} bench={GLOBAL_BENCHMARK.healthScore} band={branch.band} />
          </div>
        </Card>
      </div>

      {/* Trends + alerts/timeline */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Historical Trends" subtitle="Health score & attendance (12 months)">
          <LineTrend
            data={trend}
            xKey="month"
            series={[
              { key: "health", name: "Health Score", color: "#3366ff" },
              { key: "attendance", name: "Attendance", color: "#16a34a" },
            ]}
            domain={[40, 100]}
          />
        </ChartCard>

        <div className="space-y-5">
          <Card className="p-4">
            <SectionHeader title="Recent Alerts" />
            <ul className="space-y-2">
              {alerts.map((a, i) => (
                <li key={i} className={`rounded-lg p-2.5 text-xs ${s.bg} ${s.text}`}>{a}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Health breakdown + enrollment + device */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-4">
          <SectionHeader title="Health Score Breakdown" subtitle="Weighted component contribution" />
          <div className="space-y-3">
            {breakdown.map((p) => (
              <div key={p.key}>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-600">{p.key} <span className="muted">({p.weight}%)</span></span>
                  <span className="font-semibold text-ink-800">{p.value} → +{p.contribution}</span>
                </div>
                <ProgressBar value={p.value} band={p.value >= 80 ? "healthy" : p.value >= 60 ? "attention" : "critical"} />
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2 text-sm">
              <span className="font-medium text-ink-700">Total Health Score</span>
              <HealthBadge band={branch.band} score={branch.healthScore} />
            </div>
          </div>
        </Card>

        <ChartCard className="lg:col-span-2" title="Enrollment & Attendance" subtitle="Monthly enrolled students vs attendance %">
          <Bars
            data={monthly}
            xKey="month"
            series={[
              { key: "enrolled", name: "Enrolled", color: "#3366ff" },
              { key: "attendance", name: "Attendance %", color: "#16a34a" },
            ]}
            height={280}
          />
        </ChartCard>
      </div>

      {/* Device usage + benchmark comparison */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Device Usage" subtitle="LMS access split">
          <Donut data={devices} colors={["#3366ff", "#8b5cf6"]} height={220} />
        </ChartCard>

        <Card className="p-4 lg:col-span-2">
          <SectionHeader title="Global Benchmark Comparison" subtitle="Branch vs global average" />
          <Bars
            data={[
              { metric: "Attendance", Branch: branch.attendance, Global: GLOBAL_BENCHMARK.attendance },
              { metric: "LMS Adoption", Branch: branch.lmsActivity, Global: GLOBAL_BENCHMARK.lmsActivity },
              { metric: "Completion", Branch: branch.completion, Global: GLOBAL_BENCHMARK.completion },
              { metric: "Health Score", Branch: branch.healthScore, Global: GLOBAL_BENCHMARK.healthScore },
            ]}
            xKey="metric"
            series={[
              { key: "Branch", color: "#3366ff" },
              { key: "Global", color: "#cbd2dd" },
            ]}
            height={240}
          />
        </Card>
      </div>

      {/* Survey & Evaluation (from EvalSys) */}
      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">Survey & Evaluation</h2>
            <p className="mt-0.5 text-sm muted">Student satisfaction results — source: EvalSys</p>
          </div>
          <Link to={`/evaluations/${branch.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View full survey →
          </Link>
        </div>
        <EvalSyncBar onSync={() => fetchBranchSurvey(branch.id)} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* score summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium muted">Overall Satisfaction</span>
              <CsatBadge csat={survey.csat} />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-bold text-ink-900">{survey.csat}</span>
              <span className="mb-1 text-sm muted">/ 100</span>
            </div>
            <div className="mt-1"><Stars value={survey.csat / 20} size={16} /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="NPS" value={`${survey.nps > 0 ? "+" : ""}${survey.nps}`} />
              <Mini label="Responses" value={survey.responses.toLocaleString()} />
              <Mini label="Rate" value={`${survey.responseRate}%`} />
            </div>
          </Card>

          {/* category breakdown */}
          <Card className="p-4">
            <SectionHeader title="Category Scores" />
            <div className="space-y-2.5">
              {survey.categories.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-600">{c.label}</span>
                    <span className="font-semibold text-ink-800">{c.score}</span>
                  </div>
                  <ProgressBar value={c.score} band={c.score >= 80 ? "healthy" : c.score >= 65 ? "attention" : "critical"} />
                </div>
              ))}
            </div>
          </Card>

          {/* csat trend */}
          <ChartCard title="Satisfaction Trend" subtitle="CSAT (12 months)">
            <LineTrend data={survey.trend} xKey="month" series={[{ key: "csat", name: "CSAT", color: "#3366ff" }]} domain={[40, 100]} height={210} />
          </ChartCard>
        </div>

        {/* comments */}
        <div className="mt-5">
          <Card className="p-4">
            <SectionHeader title="Recent Feedback" subtitle={`${survey.comments.length} comments from latest survey`} />
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {survey.comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5">
        <Card className="p-4">
          <SectionHeader title="Branch Timeline" subtitle="Recent activity" />
          <ol className="relative ml-2 space-y-4 border-l border-ink-200 pl-5">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 ring-4 ring-brand-50" />
                <div className="flex items-center gap-2 text-xs muted">
                  <CalendarClock size={13} /> {t.date}
                </div>
                <div className="text-sm text-ink-800">{t.text}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}

function BranchLogo({ branch }) {
  const initials = branch.city
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-card">
      <span className="text-xl font-extrabold leading-none text-brand-700">{initials}</span>
      <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-400">Sejong</span>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-ink-50 p-2">
      <div className="text-sm font-bold text-ink-900">{value}</div>
      <div className="text-[10px] muted">{label}</div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
        <Icon size={15} />
      </span>
      <span>
        <span className="block text-xs muted">{label}</span>
        <span className="block font-medium text-ink-900">{value}</span>
      </span>
    </li>
  );
}

function Metric({ label, value, bench, band }) {
  const diff = value - bench;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium muted">{label}</span>
        <span className={`text-xs font-semibold ${diff >= 0 ? "text-good" : "text-bad"}`}>
          {diff >= 0 ? "+" : ""}{diff} vs avg
        </span>
      </div>
      <div className="mt-1 mb-1.5 text-2xl font-bold text-ink-900">{value}{label === "Health Score" ? "" : "%"}</div>
      <ProgressBar value={value} band={band} />
    </div>
  );
}
