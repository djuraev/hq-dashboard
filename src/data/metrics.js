import { rand, randInt } from "./seed";
import { BRANCHES, TOTAL_BRANCHES, ACTIVE_BRANCHES } from "./branches";
import { COUNTRIES } from "./countries";

const sum = (arr, f) => arr.reduce((a, b) => a + f(b), 0);
const avg = (arr, f) => Math.round(sum(arr, f) / arr.length);

const activeStudents = sum(BRANCHES, (b) => b.students);
const activeTeachers = sum(BRANCHES, (b) => b.teachers);

// Operational-risk = active branches whose health band is critical/attention-low.
const RISK_BRANCHES = BRANCHES.filter((b) => b.band === "critical").length;
const OPERATING_BRANCHES = ACTIVE_BRANCHES;

// ---- Global Overview KPIs (Section 1 — per HQ spec) ----
// 8 headline cards: 운영 학당 / 등록 수강생 / 활성 학습자 / 개설 강좌 /
// 평균 출석률 / 평균 수료율 / 이탈 위험 학생 / 운영 리스크 학당.
export const KPIS = [
  { key: "operating", label: "Operating Institutes", labelKo: "운영 학당 수", value: OPERATING_BRANCHES, format: "int", icon: "Building2", change: 0.8, trend: "up", prev: `${TOTAL_BRANCHES} total` },
  { key: "students", label: "Enrolled Learners", labelKo: "등록 수강생 수", value: 128450, format: "int", icon: "GraduationCap", change: 18.5, trend: "up", prev: "108,400" },
  { key: "active", label: "Active Learners (30d)", labelKo: "활성 학습자 수", value: 96320, format: "int", icon: "Activity", change: 6.4, trend: "up", prev: "90,510" },
  { key: "courses", label: "Open Courses", labelKo: "개설 강좌 수", value: 4820, format: "int", icon: "BookOpen", change: 3.2, trend: "up", prev: "4,670" },
  { key: "attendance", label: "Avg Attendance", labelKo: "평균 출석률", value: 89, format: "pct", icon: "CalendarCheck", change: -1.2, trend: "down", prev: "90.4%" },
  { key: "completion", label: "Avg Completion", labelKo: "평균 수료율", value: 81, format: "pct", icon: "Award", change: 1.1, trend: "up", prev: "80%" },
  { key: "dropoutRisk", label: "Dropout-Risk Learners", labelKo: "중도 이탈 위험 학생 수", value: 3140, format: "int", icon: "UserMinus", change: 4.8, trend: "down", prev: "2,990" },
  { key: "riskBranches", label: "At-Risk Institutes", labelKo: "운영 리스크 학당 수", value: RISK_BRANCHES, format: "int", icon: "AlertTriangle", change: 0, trend: "down", prev: `${OPERATING_BRANCHES} operating` },
];

// Headline summary line for Global Overview.
export const GLOBAL_SUMMARY = {
  total: TOTAL_BRANCHES,
  operating: OPERATING_BRANCHES,
  risk: RISK_BRANCHES,
  learners: 128450,
  countries: COUNTRIES.length,
  completion: 81,
};

// scale derived totals to match headline KPIs so pages stay coherent
export const SCALE_STUDENTS = 128450 / activeStudents;
export const SCALE_TEACHERS = 1820 / activeTeachers;

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function trendSeries(base, vol, drift) {
  let v = base;
  return MONTHS.map((m, i) => {
    v = Math.max(0, v + rand(-vol, vol) + drift);
    return { month: m, value: Math.round(v) };
  });
}

// ---- Student Analytics (Section 5) ----
export const STUDENT_METRICS = {
  totalEnrollments: 52341,
  newEnrollments: 3120,
  growthPct: 4.3,
  dropouts: 1184,
  completionRate: 83,
};

export const ENROLLMENT_TREND = (() => {
  let v = 44000;
  return MONTHS.map((m) => {
    v += randInt(400, 1300);
    return { month: m, enrollments: v, dropouts: randInt(60, 180) };
  });
})();

export const STUDENTS_BY_COUNTRY = COUNTRIES.map((c) => {
  const bs = BRANCHES.filter((b) => b.countryCode === c.code);
  return { country: c.name, code: c.code, students: Math.round(sum(bs, (b) => b.students) * SCALE_STUDENTS) };
})
  .sort((a, b) => b.students - a.students)
  .slice(0, 12);

export const STUDENT_DISTRIBUTION = [
  { name: "Beginner (1-2급)", value: 41 },
  { name: "Intermediate (3-4급)", value: 34 },
  { name: "Advanced (5-6급)", value: 18 },
  { name: "TOPIK Prep", value: 7 },
];

// ---- Teacher Analytics (Section 6) ----
export const TEACHER_METRICS = {
  active: 1820,
  inactive: 96,
  avgAttendance: 94,
  assignmentsGraded: 48230,
  classesConducted: 12940,
  engagementScore: 88,
};

export const TEACHER_ACTIVITY_TREND = trendSeries(10800, 600, 180).map((d) => ({
  month: d.month,
  classes: d.value,
  graded: Math.round(d.value * rand(3.4, 4.1)),
}));

const TEACHER_FIRST = ["Min-seo", "Joon-ho", "Hye-jin", "Sang-woo", "Yu-na", "Tae-hyung", "Bo-ram", "Ji-sung", "Elena", "Marco", "Lan", "Aziza", "Chen", "Nadia", "Ken", "Priya"];
const TEACHER_LAST = ["Kim", "Lee", "Park", "Choi", "Han", "Seo", "Oh", "Im", "Petrova", "Rossi", "Tran", "Karimova", "Wang", "Hassan"];
const SUBJECTS = ["Grammar", "Conversation", "TOPIK Prep", "Writing", "Listening", "Business Korean", "Beginner Track"];

function teacherName(i) {
  return `${TEACHER_FIRST[i % TEACHER_FIRST.length]} ${TEACHER_LAST[(i * 3) % TEACHER_LAST.length]}`;
}

// Rich teacher roster. graduates/dropouts/attendance + drillable KPIs.
export const TEACHERS = BRANCHES.slice()
  .sort((a, b) => b.teacherEngagement - a.teacherEngagement)
  .slice(0, 20)
  .map((b, i) => {
    const studentsTaught = randInt(40, 140);
    const graduates = Math.round(studentsTaught * rand(0.55, 0.92));
    const dropouts = Math.round(studentsTaught * rand(0.02, 0.14));
    return {
      id: `T-${String(i + 1).padStart(3, "0")}`,
      rank: i + 1,
      name: teacherName(i),
      branch: b.name,
      country: b.country,
      subject: SUBJECTS[i % SUBJECTS.length],
      since: 2018 + (i % 7),
      classes: randInt(80, 220),
      graded: randInt(300, 900),
      engagement: b.teacherEngagement,
      attendance: Math.round(rand(85, 99)),
      studentsTaught,
      graduates,
      graduateRate: Math.round((graduates / studentsTaught) * 100),
      dropouts,
      dropoutRate: Math.round((dropouts / studentsTaught) * 100),
      avgScore: randInt(68, 92),
      rating: +rand(3.8, 5).toFixed(1),
      onTimeGrading: Math.round(rand(78, 99)),
    };
  });

export const TEACHER_RANKING = TEACHERS.slice(0, 10);

export function getTeacher(id) {
  return TEACHERS.find((t) => t.id === id);
}

// 12-month activity trend for one teacher (deterministic by rank).
export function teacherTrend(teacher) {
  let cls = 8 + (teacher.rank % 6);
  let att = teacher.attendance;
  return MONTHS.map((m) => {
    cls = Math.max(4, cls + Math.round(rand(-2, 3)));
    att = Math.round(Math.max(80, Math.min(100, att + rand(-4, 4))));
    return { month: m, classes: cls, attendance: att };
  });
}

// ---- LMS Adoption Analytics (Section 7) ----
export const LMS_METRICS = {
  dau: 18420,
  wau: 34110,
  mau: 47980,
  avgSession: "27m",
  mobile: 64,
  web: 36,
};

export const LMS_TREND = (() => {
  let dau = 14000, wau = 28000, mau = 40000;
  return MONTHS.map((m) => {
    dau += randInt(120, 520);
    wau += randInt(220, 700);
    mau += randInt(300, 900);
    return { month: m, DAU: dau, WAU: wau, MAU: mau };
  });
})();

export const DEVICE_USAGE = [
  { name: "Mobile", value: 64 },
  { name: "Web", value: 36 },
];

export const LMS_LEADERBOARD = BRANCHES.slice()
  .sort((a, b) => b.lmsActivity - a.lmsActivity)
  .slice(0, 10)
  .map((b, i) => ({ rank: i + 1, id: b.id, branch: b.name, country: b.country, adoption: b.lmsActivity }));

// ---- Course Analytics (Section 8) ----
const COURSE_NAMES = [
  "Korean for Beginners A1", "Everyday Korean A2", "Intermediate Grammar B1",
  "Korean Conversation B2", "Business Korean", "TOPIK I Intensive",
  "TOPIK II Intensive", "Hangul Foundations", "K-Culture & Language",
  "Advanced Writing C1", "Korean Listening Lab", "Pronunciation Clinic",
];
export const COURSES = COURSE_NAMES.map((name, i) => {
  const enrolled = randInt(1800, 9400);
  const completion = randInt(54, 96);
  const rating = +(rand(3.6, 4.9)).toFixed(1);
  return {
    id: `C-${100 + i}`,
    name,
    enrolled,
    completion,
    rating,
    engagement: randInt(55, 95),
  };
}).sort((a, b) => b.enrolled - a.enrolled);

export const RATING_TREND = MONTHS.map((m) => ({
  month: m,
  rating: +(rand(4.1, 4.7)).toFixed(2),
}));

// ---- Assessment Analytics (Section 9) ----
export const ASSESSMENT_METRICS = {
  participation: 38420,
  avgScore: 74,
  passRate: 81,
  topikPass: 68,
};

export const SCORE_DISTRIBUTION = [
  { band: "0-40", students: 1240 },
  { band: "41-50", students: 2890 },
  { band: "51-60", students: 5410 },
  { band: "61-70", students: 9120 },
  { band: "71-80", students: 10240 },
  { band: "81-90", students: 6310 },
  { band: "91-100", students: 3210 },
];

export const PASS_FAIL = [
  { name: "Pass", value: 81 },
  { name: "Fail", value: 19 },
];

export const ASSESSMENT_BY_COUNTRY = STUDENTS_BY_COUNTRY.slice(0, 8).map((c) => ({
  country: c.country,
  avgScore: randInt(64, 88),
  passRate: randInt(70, 92),
}));

// ---- Content Analytics (Section 10) ----
export const CONTENT_METRICS = {
  pdfDownloads: 214300,
  videoViews: 589200,
  quizAttempts: 173400,
  avgLearningTime: "42m / day",
};

export const CONTENT_RANKING = [
  { name: "Hangul Workbook (PDF)", type: "PDF", usage: 41200 },
  { name: "TOPIK II Mock Exam", type: "Quiz", usage: 38900 },
  { name: "Daily Conversation Video Pack", type: "Video", usage: 35600 },
  { name: "Grammar Cheat Sheet B1", type: "PDF", usage: 29800 },
  { name: "Listening Drills Vol.3", type: "Video", usage: 27100 },
  { name: "Vocabulary Flashcards 2000", type: "Interactive", usage: 24400 },
  { name: "Pronunciation Lab Audio", type: "Audio", usage: 19800 },
  { name: "Business Email Templates", type: "PDF", usage: 16200 },
];

export const CONTENT_USAGE_TREND = MONTHS.map((m) => ({
  month: m,
  pdf: randInt(12000, 22000),
  video: randInt(30000, 55000),
  quiz: randInt(9000, 18000),
}));

// ---- Branch ranking (Section 3) ----
export const TOP_BRANCHES = BRANCHES.slice().sort((a, b) => b.healthScore - a.healthScore).slice(0, 8);
export const BOTTOM_BRANCHES = BRANCHES.slice().sort((a, b) => a.healthScore - b.healthScore).slice(0, 8);

// ---- Health Score module (Section 4) ----
export const HEALTH_WEIGHTS = [
  { label: "Attendance Rate", weight: 30 },
  { label: "LMS Activity", weight: 25 },
  { label: "Course Completion", weight: 20 },
  { label: "Teacher Engagement", weight: 15 },
  { label: "Student Growth", weight: 10 },
];
export const HEALTHIEST_10 = BRANCHES.slice().sort((a, b) => b.healthScore - a.healthScore).slice(0, 10);
export const ATTENTION_10 = BRANCHES.slice().sort((a, b) => a.healthScore - b.healthScore).slice(0, 10);

export const HEALTH_BAND_COUNTS = (() => {
  let healthy = 0, attention = 0, critical = 0;
  for (const b of BRANCHES) {
    if (b.band === "healthy") healthy++;
    else if (b.band === "attention") attention++;
    else critical++;
  }
  return { healthy, attention, critical };
})();

// ---- HQ Action Center (Section 11) ----
export const ALERTS = [
  { id: "A1", severity: "critical", icon: "TrendingDown", title: "5 branches with declining attendance", detail: "Attendance dropped >8% MoM in Vietnam, Indonesia and Russia clusters.", count: 5, branches: BRANCHES.filter((b) => b.attendance < 72).slice(0, 5).map((b) => b.id) },
  { id: "A2", severity: "critical", icon: "UserX", title: "3 branches with inactive administrators", detail: "No admin login in the last 14 days. Operational risk.", count: 3, branches: BRANCHES.filter((b) => !b.active).slice(0, 3).map((b) => b.id) },
  { id: "A3", severity: "warning", icon: "MonitorX", title: "8 branches with low LMS adoption", detail: "LMS adoption below 55%. Onboarding follow-up recommended.", count: 8, branches: BRANCHES.filter((b) => b.lmsActivity < 55).slice(0, 8).map((b) => b.id) },
  { id: "A4", severity: "critical", icon: "LogOut", title: "2 branches with high student dropout", detail: "Dropout rate exceeds 12% this quarter.", count: 2, branches: BRANCHES.filter((b) => b.studentGrowth < -10).slice(0, 2).map((b) => b.id) },
];

// ---- AI Insights ----
export const AI_INSIGHTS = [
  { tone: "down", text: "Monthly attendance decreased 1.2% globally, driven by Southeast Asia branches." },
  { tone: "up", text: "Enrollment increased 6.8% in Southeast Asia — strongest growth this quarter." },
  { tone: "alert", text: "Three branches require immediate intervention based on health score decline." },
  { tone: "up", text: "LMS adoption improved 3.5% in Europe after the mobile app rollout." },
  { tone: "up", text: "Student retention increased 2.1% globally; dropout rate at a 12-month low." },
];

// ---- Historical trend per branch (used in detail page) ----
export function branchTrend(seedId) {
  const start = 50 + (seedId.charCodeAt(seedId.length - 1) % 30);
  let h = start;
  return MONTHS.map((m) => {
    h = Math.max(40, Math.min(99, h + rand(-4, 5)));
    return { month: m, health: Math.round(h), attendance: Math.round(Math.min(99, h + rand(-6, 6))) };
  });
}

// Deterministic per-branch RNG so detail stats stay stable.
function branchRng(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Branch rank (1-based) among all branches by health score.
const RANKED_BY_HEALTH = [...BRANCHES].sort((a, b) => b.healthScore - a.healthScore);
export function branchRank(id) {
  return RANKED_BY_HEALTH.findIndex((b) => b.id === id) + 1;
}

// Health-score component breakdown for one branch (value + weighted contribution).
export function branchHealthBreakdown(branch) {
  const growthScore = Math.max(0, Math.min(100, 50 + branch.studentGrowth * 2.5));
  const parts = [
    { key: "Attendance", value: branch.attendance, weight: 30 },
    { key: "LMS Activity", value: branch.lmsActivity, weight: 25 },
    { key: "Completion", value: branch.completion, weight: 20 },
    { key: "Teacher Eng.", value: branch.teacherEngagement, weight: 15 },
    { key: "Student Growth", value: Math.round(growthScore), weight: 10 },
  ];
  return parts.map((p) => ({ ...p, contribution: +((p.value * p.weight) / 100).toFixed(1) }));
}

// Monthly enrollment + attendance series for a branch.
export function branchMonthly(branch) {
  const r = branchRng(branch.id);
  let enrolled = Math.round(branch.students * 0.82);
  return MONTHS.map((m) => {
    enrolled = Math.min(branch.students, enrolled + Math.round(r() * 18 - 4));
    return {
      month: m,
      enrolled,
      attendance: Math.round(Math.max(55, Math.min(99, branch.attendance + r() * 12 - 6))),
      sessions: Math.round(branch.students * (0.5 + r() * 0.5)),
    };
  });
}

// Misc operational stats for a branch.
export function branchStats(branch) {
  const r = branchRng(branch.id + "stats");
  return {
    ratio: (branch.students / branch.teachers).toFixed(1),
    dropouts: Math.round(branch.students * (0.04 + r() * 0.08)),
    newEnrollments: Math.round(branch.students * (0.06 + r() * 0.1)),
    avgSession: `${Math.round(18 + r() * 22)}m`,
    coursesActive: Math.round(6 + r() * 10),
    assignmentsGraded: Math.round(branch.students * (8 + r() * 14)),
    nps: Math.round(30 + r() * 55),
  };
}

// Device usage split for a branch.
export function branchDevices(branch) {
  const r = branchRng(branch.id + "dev");
  const mobile = Math.round(50 + r() * 30);
  return [
    { name: "Mobile", value: mobile },
    { name: "Web", value: 100 - mobile },
  ];
}

// =====================================================================
//  HQ Spec additions — Funnel, Demand, Regional, Administration, Risk
// =====================================================================

// ---- Enrollment Funnel (Learner & Enrollment Analytics) ----
// K-content interest → … → re-enrollment. counts cascade off conversion %.
export const FUNNEL_STEPS = (() => {
  const base = 1_240_000; // K-content interest reach
  const conv = [
    { key: "interest", label: "K-Content Interest", labelKo: "K-콘텐츠 관심 유입", pct: 100 },
    { key: "signup", label: "Sign-up", labelKo: "회원가입", pct: 18 },
    { key: "leveltest", label: "Free Level Test", labelKo: "무료 레벨 테스트", pct: 42 },
    { key: "consult", label: "Consultation", labelKo: "상담 신청", pct: 35 },
    { key: "enroll", label: "Enrollment", labelKo: "수강 신청", pct: 68 },
    { key: "payment", label: "Payment Confirmed", labelKo: "결제·등록 확정", pct: 88 },
    { key: "attend", label: "Class Participation", labelKo: "수업 참여", pct: 94 },
    { key: "complete", label: "Completion", labelKo: "수료", pct: 82 },
    { key: "reenroll", label: "Re-enrollment", labelKo: "재등록", pct: 54 },
  ];
  let count = base;
  return conv.map((s, i) => {
    if (i > 0) count = Math.round(count * (s.pct / 100));
    return { ...s, count, drop: i === 0 ? 0 : 100 - s.pct };
  });
})();

// ---- Country demand analysis ----
export const COUNTRY_DEMAND = STUDENTS_BY_COUNTRY.slice(0, 10).map((c) => {
  const capacity = c.students + randInt(80, 900);
  const applied = Math.round(capacity * rand(0.74, 1.18));
  const waitlist = Math.max(0, applied - capacity);
  return {
    country: c.country,
    code: c.code,
    signups: Math.round(c.students * rand(1.4, 2.6)),
    levelTests: Math.round(c.students * rand(0.9, 1.5)),
    enrollments: c.students,
    consultBacklog: randInt(20, 340),
    capacity,
    applied,
    fillRate: Math.min(140, Math.round((applied / capacity) * 100)),
    waitlist,
    kContentShare: randInt(28, 72),
  };
}).sort((a, b) => b.waitlist - a.waitlist);

// ---- Regional comparison (Asia / Europe / Americas / MEA / CIS) ----
const REGION_GROUPS = {
  "Asia": ["East Asia", "Southeast Asia", "South Asia"],
  "CIS": ["Central Asia"],
  "Europe": ["Europe"],
  "Americas": ["North America", "South America"],
  "MEA": ["Middle East & Africa"],
  "Oceania": ["Oceania"],
};
export const REGIONAL = Object.entries(REGION_GROUPS).map(([region, subs]) => {
  const bs = BRANCHES.filter((b) => subs.includes(b.region));
  if (!bs.length) return null;
  const students = Math.round(sum(bs, (b) => b.students) * SCALE_STUDENTS);
  return {
    region,
    branches: bs.length,
    students,
    attendance: avg(bs, (b) => b.attendance),
    completion: avg(bs, (b) => b.completion),
    reEnrollment: randInt(46, 64),
    growth: +rand(4, 33).toFixed(1),
    kContentShare: randInt(24, 68),
    critical: bs.filter((b) => b.band === "critical").length,
  };
}).filter(Boolean).sort((a, b) => b.students - a.students);

// ---- Institute Scorecard fields (Regional & Institute Status) ----
// derived per-branch on demand to keep payload small.
export function instituteScorecard(branch) {
  return {
    status: branch.band,
    enrolled: branch.students,
    growth: branch.studentGrowth,
    attendance: branch.attendance,
    completion: branch.completion,
    reEnrollment: Math.round(rand(42, 68)),
    teacherFillRate: Math.round(rand(72, 100)),
    reportStatus: pick3(branch.id),
    dataReliability: Math.round(rand(68, 99)),
  };
}
function pick3(id) {
  const n = id.charCodeAt(id.length - 1) % 10;
  return n < 7 ? "submitted" : n < 9 ? "delayed" : "missing";
}

// ---- Learning Performance KPIs (Learning Performance Analytics) ----
export const PERFORMANCE_KPIS = [
  { key: "attendance", label: "Avg Attendance", labelKo: "평균 출석률", value: 89, format: "pct" },
  { key: "assignment", label: "Assignment Submission", labelKo: "과제 제출률", value: 76, format: "pct" },
  { key: "quiz", label: "Quiz / Exam Participation", labelKo: "퀴즈·시험 응시율", value: 71, format: "pct" },
  { key: "achievement", label: "Avg Achievement", labelKo: "평균 성취도", value: 74, format: "pct" },
  { key: "completion", label: "Completion Rate", labelKo: "수료율", value: 81, format: "pct" },
  { key: "dropout", label: "Dropout Rate", labelKo: "중도 이탈률", value: 11, format: "pct" },
  { key: "reEnroll", label: "Re-enrollment", labelKo: "재등록률", value: 54, format: "pct" },
  { key: "studyTime", label: "Avg Study Time", labelKo: "평균 학습 시간", value: "42m/day", format: "raw" },
];

// Country performance comparison (achievement vs re-enrollment).
export const PERFORMANCE_BY_COUNTRY = STUDENTS_BY_COUNTRY.slice(0, 8).map((c) => ({
  country: c.country,
  attendance: randInt(72, 95),
  completion: randInt(62, 92),
  reEnrollment: randInt(38, 66),
}));

// Course-level performance (세종한국어 1A / 1B / 2A …).
export const COURSE_PERFORMANCE = [
  "세종한국어 1A", "세종한국어 1B", "세종한국어 2A", "세종한국어 2B",
  "세종한국어 3A", "TOPIK I", "TOPIK II", "Business Korean",
].map((name) => ({
  name,
  attendance: randInt(74, 95),
  completion: randInt(60, 92),
  reEnrollment: randInt(40, 64),
  dropout: randInt(6, 22),
}));

// ---- Administration & Financial Status ----
export const ADMIN_METRICS = {
  reportSubmission: 87,   // 월간 보고서 제출률
  delayedInstitutes: 18,  // 보고 지연 학당
  pendingApprovals: 42,   // 승인 대기 건수
  evidenceSubmission: 79, // 증빙자료 제출률
  noticeRead: 91,         // 공지 확인률
  avgRequestHandling: "2.4d", // 요청 처리 시간
};

export const REPORT_SUBMISSION_TREND = MONTHS.map((m) => ({
  month: m,
  onTime: randInt(70, 92),
  delayed: randInt(6, 22),
  missing: randInt(2, 10),
}));

export const PENDING_APPROVALS = [
  { id: "AP-301", type: "Budget", labelKo: "예산", institute: "Tashkent Sejong", requested: "₩ 12,400,000", age: 3, priority: "high" },
  { id: "AP-302", type: "Event", labelKo: "행사", institute: "Hanoi Sejong", requested: "K-Culture Day", age: 1, priority: "medium" },
  { id: "AP-303", type: "Change", labelKo: "변경", institute: "Almaty Sejong", requested: "Schedule revision", age: 6, priority: "high" },
  { id: "AP-304", type: "Budget", labelKo: "예산", institute: "Jakarta Sejong", requested: "₩ 8,900,000", age: 2, priority: "low" },
  { id: "AP-305", type: "Document", labelKo: "문서", institute: "Cairo Sejong", requested: "Contract renewal", age: 9, priority: "high" },
  { id: "AP-306", type: "Event", labelKo: "행사", institute: "Sao Paulo Sejong", requested: "Speech contest", age: 4, priority: "medium" },
];

// Budget execution — 배정/집행/정산 per category (₩ million).
export const BUDGET_CATEGORIES = [
  { category: "Instructor Pay", labelKo: "강사료", allocated: 4200, executed: 3680 },
  { category: "Materials", labelKo: "교재", allocated: 1100, executed: 1020 },
  { category: "Events", labelKo: "행사", allocated: 860, executed: 540 },
  { category: "Operations", labelKo: "운영비", allocated: 1500, executed: 1390 },
  { category: "Marketing", labelKo: "홍보", allocated: 720, executed: 690 },
].map((c) => ({
  ...c,
  rate: Math.round((c.executed / c.allocated) * 100),
  remaining: c.allocated - c.executed,
}));

export const BUDGET_SUMMARY = (() => {
  const allocated = sum(BUDGET_CATEGORIES, (c) => c.allocated);
  const executed = sum(BUDGET_CATEGORIES, (c) => c.executed);
  return {
    allocated, executed,
    rate: Math.round((executed / allocated) * 100),
    remaining: allocated - executed,
    settlementRate: 73, // 정산 완료율
    overrunRisk: 4,     // 초과 집행 위험 학당
  };
})();

// Institutes flagged for budget over/under-execution.
export const BUDGET_FLAGS = BRANCHES.slice(0, 60)
  .map((b) => ({ id: b.id, name: b.name, country: b.country, rate: Math.round(rand(38, 102)) }))
  .filter((x) => x.rate > 92 || x.rate < 55)
  .slice(0, 8)
  .sort((a, b) => b.rate - a.rate);

// ---- Risk, Alert & AI Insight ----
export const RISK_TYPES = [
  { key: "attendance", label: "Attendance Decline", labelKo: "출석률 하락", rule: "4-wk attendance down >15% vs prior", count: 14, severity: "warning" },
  { key: "completion", label: "Low Completion", labelKo: "수료율 저하", rule: "20%+ below same-course average", count: 9, severity: "critical" },
  { key: "dropout", label: "Rising Dropout", labelKo: "중도 이탈 증가", rule: "No-login + absence + missed work累積", count: 22, severity: "critical" },
  { key: "report", label: "Report Delay", labelKo: "행정 보고 지연", rule: ">7 days past deadline", count: 18, severity: "warning" },
  { key: "teacher", label: "Instructor Risk", labelKo: "강사 운영 리스크", rule: "Late attendance entry + feedback backlog", count: 7, severity: "warning" },
  { key: "complaint", label: "Learner Complaints", labelKo: "학습자 민원 증가", rule: "Q&A / complaint keyword spike", count: 5, severity: "warning" },
  { key: "budget", label: "Budget Anomaly", labelKo: "예산 집행 이상", rule: "Category spike or large under-execution", count: 4, severity: "warning" },
  { key: "data", label: "Data Quality", labelKo: "데이터 품질 저하", rule: "Attendance/grade/report data gaps rising", count: 11, severity: "info" },
];

// AI narrative insights (full-sentence summaries per spec).
export const AI_NARRATIVES = [
  { tone: "down", text: "Over the last 4 weeks, attendance in Beginner 1A across Central Asia fell 8.5% on average. Namangan, Bishkek and Almaty also show declining assignment submission — learning continuity needs attention." },
  { tone: "alert", text: "Europe's new sign-ups are rising but consultation conversion is low. Improving the post-level-test consultation booking message is recommended." },
  { tone: "up", text: "CIS institutes have smaller cohorts but the highest completion and re-enrollment rates — strong long-term learning potential." },
  { tone: "down", text: "Southeast Asia shows high new enrollment yet weak re-enrollment, signalling retention rather than acquisition as the priority." },
];

// HQ recommendations + today's action list.
export const RECOMMENDATIONS = [
  { id: "R1", kind: "course", icon: "BookOpen", title: "Open additional Beginner 1A class — Tashkent", detail: "Waitlist 312, fill rate 138%. Demand supports 2 new sections.", impact: "high" },
  { id: "R2", kind: "teacher", icon: "Users", title: "Assign instructor support — Almaty", detail: "Feedback backlog 4.1 days, 2 unfilled positions.", impact: "high" },
  { id: "R3", kind: "quality", icon: "Award", title: "Quality review — Bishkek 1A completion", detail: "Completion 21% below global course average.", impact: "medium" },
  { id: "R4", kind: "ops", icon: "FileText", title: "Follow up report delay — Cairo Sejong", detail: "Monthly report 9 days overdue.", impact: "medium" },
];

export const HQ_ACTIONS = [
  { id: "H1", status: "New", label: "Institute A monthly report 10 days late", action: "Auto-notify owner", labelKo: "A 학당 월간 보고서 10일 지연" },
  { id: "H2", status: "Assigned", label: "Institute B attendance down 4 weeks straight", action: "Request root-cause review", labelKo: "B 학당 출석률 4주 연속 하락" },
  { id: "H3", status: "In Progress", label: "Country C beginner waitlist over 300", action: "Review new section", labelKo: "C 국가 초급반 대기자 300명 초과" },
  { id: "H4", status: "New", label: "Institute D budget execution over 95%", action: "Budget owner review", labelKo: "D 학당 예산 집행률 95% 초과" },
  { id: "H5", status: "Resolved", label: "Course E completion 20% below global avg", action: "Quality check requested", labelKo: "E 과정 수료율 글로벌 평균 대비 20% 낮음" },
];

export const ACTION_STATUS_STYLE = {
  New: "bg-bad/10 text-bad",
  Assigned: "bg-warn/10 text-warn",
  "In Progress": "bg-brand-50 text-brand-700",
  Resolved: "bg-good/10 text-good",
  Deferred: "bg-ink-100 text-ink-500",
};

export { MONTHS };
