import { rand, randInt, rng } from "./seed";
import { BRANCHES, TOTAL_BRANCHES, ACTIVE_BRANCHES } from "./branches";
import { COUNTRIES } from "./countries";

const sum = (arr, f) => arr.reduce((a, b) => a + f(b), 0);
const avg = (arr, f) => Math.round(sum(arr, f) / arr.length);

const activeStudents = sum(BRANCHES, (b) => b.students);
const activeTeachers = sum(BRANCHES, (b) => b.teachers);

// ---- Executive KPIs (Section 1) ----
export const KPIS = [
  { key: "branches", label: "Total Branches", value: TOTAL_BRANCHES, format: "int", icon: "Building2", change: 1.6, trend: "up", prev: "246" },
  { key: "active", label: "Active Branches", value: ACTIVE_BRANCHES, format: "int", icon: "CheckCircle2", change: 0.8, trend: "up", prev: "241" },
  { key: "students", label: "Active Students", value: 52341, format: "int", icon: "GraduationCap", change: 4.3, trend: "up", prev: "50,180" },
  { key: "teachers", label: "Active Teachers", value: 1820, format: "int", icon: "Users", change: 2.1, trend: "up", prev: "1,782" },
  { key: "attendance", label: "Monthly Attendance", value: 91, format: "pct", icon: "CalendarCheck", change: -1.2, trend: "down", prev: "92.2%" },
  { key: "lms", label: "LMS Adoption Rate", value: 87, format: "pct", icon: "MonitorSmartphone", change: 3.5, trend: "up", prev: "84%" },
  { key: "completion", label: "Course Completion", value: 83, format: "pct", icon: "Award", change: 1.1, trend: "up", prev: "82%" },
];

// scale derived totals to match headline KPIs so pages stay coherent
export const SCALE_STUDENTS = 52341 / activeStudents;
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

export { MONTHS };
