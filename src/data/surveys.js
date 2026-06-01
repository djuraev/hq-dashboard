// Survey / evaluation results.
// In production these are fetched from an EXTERNAL evaluation system ("EvalSys")
// via its API; here we mock the payload + sync metadata. See lib/evalSync.js.
import { mulberry32 } from "./seed";
import { BRANCHES } from "./branches";
import { MONTHS } from "./metrics";

function branchRng(id, salt = "") {
  let h = 2166136261;
  const s = id + salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return mulberry32(h >>> 0);
}

export const SURVEY_CATEGORIES = [
  { key: "teaching", label: "Teaching Quality" },
  { key: "curriculum", label: "Curriculum" },
  { key: "facilities", label: "Facilities" },
  { key: "support", label: "Student Support" },
  { key: "value", label: "Value for Money" },
];

const COMMENTS_POS = [
  "Teachers are very supportive and patient.",
  "Loved the conversation classes — huge improvement.",
  "Great preparation for the TOPIK exam.",
  "Modern classrooms and excellent materials.",
  "The LMS app makes studying at home easy.",
  "Highly recommend the business Korean track.",
];
const COMMENTS_NEU = [
  "Good overall, but class sizes could be smaller.",
  "Schedule flexibility would help working students.",
  "More speaking practice would be useful.",
];
const COMMENTS_NEG = [
  "Wi-Fi in the building is unreliable.",
  "Front desk response was slow this term.",
  "Some materials felt outdated.",
];

function pickFrom(r, arr) {
  return arr[Math.floor(r() * arr.length)];
}

// Individual survey questions, grouped under categories.
export const SURVEY_QUESTIONS = [
  { cat: "teaching", q: "Teachers explain concepts clearly" },
  { cat: "teaching", q: "Teachers are responsive to questions" },
  { cat: "curriculum", q: "Course content matches my goals" },
  { cat: "curriculum", q: "Pace of the course is appropriate" },
  { cat: "facilities", q: "Classrooms are comfortable and well-equipped" },
  { cat: "facilities", q: "Online platform (LMS) works reliably" },
  { cat: "support", q: "Staff respond quickly to my requests" },
  { cat: "support", q: "I feel supported in my learning journey" },
  { cat: "value", q: "The program is worth the tuition" },
  { cat: "value", q: "I would recommend Sejong to a friend" },
];

const REVIEWERS = ["Anonymous", "Beginner student", "Intermediate student", "TOPIK candidate", "Working professional", "Parent", "Returning student"];

// CSAT 0-100 derived loosely from branch health so it stays coherent.
function surveyFor(branch) {
  const r = branchRng(branch.id, "survey");
  const base = Math.round(branch.healthScore * 0.6 + 35 + (r() * 10 - 5));
  const csat = Math.max(48, Math.min(98, base));
  const nps = Math.round((csat - 60) * 1.6 + (r() * 16 - 8)); // ~ -20..+70
  const responses = Math.round(branch.students * (0.35 + r() * 0.45));
  const responseRate = Math.round((responses / branch.students) * 100);

  const categories = SURVEY_CATEGORIES.map((c) => ({
    ...c,
    score: Math.max(45, Math.min(99, Math.round(csat + (r() * 18 - 9)))),
  }));

  // distribution of 1-5 star ratings
  const stars = [1, 2, 3, 4, 5].map((s) => ({
    star: s,
    count: Math.round(responses * Math.max(0, (s - 1) / 10 + (s >= 4 ? r() * 0.4 : r() * 0.12))),
  }));

  // recent comments mix weighted by csat
  const comments = [];
  const nComments = 4 + Math.floor(r() * 3);
  for (let i = 0; i < nComments; i++) {
    const roll = r();
    const pool = csat >= 80 ? (roll < 0.7 ? COMMENTS_POS : roll < 0.9 ? COMMENTS_NEU : COMMENTS_NEG)
      : csat >= 65 ? (roll < 0.45 ? COMMENTS_POS : roll < 0.8 ? COMMENTS_NEU : COMMENTS_NEG)
      : (roll < 0.3 ? COMMENTS_POS : roll < 0.55 ? COMMENTS_NEU : COMMENTS_NEG);
    const sentiment = pool === COMMENTS_POS ? "positive" : pool === COMMENTS_NEG ? "negative" : "neutral";
    comments.push({
      id: `${branch.id}-cm-${i}`,
      text: pickFrom(r, pool),
      sentiment,
      stars: sentiment === "positive" ? 5 : sentiment === "neutral" ? 3 : 2,
      reviewer: pickFrom(r, REVIEWERS),
      daysAgo: 1 + Math.floor(r() * 28),
    });
  }

  // per-question scores anchored to their category score
  const catScore = Object.fromEntries(categories.map((c) => [c.key, c.score]));
  const questions = SURVEY_QUESTIONS.map((q, qi) => ({
    id: `${branch.id}-q${qi}`,
    cat: q.cat,
    q: q.q,
    score: Math.max(40, Math.min(99, Math.round(catScore[q.cat] + (r() * 14 - 7)))),
  }));

  const recommend = Math.max(40, Math.min(99, Math.round(catScore.value + (r() * 10 - 5))));

  let t = csat - 6;
  const trend = MONTHS.map((m) => {
    t = Math.max(45, Math.min(99, t + (r() * 8 - 3.5)));
    return { month: m, csat: Math.round(t), responses: Math.round(responses / 12 * (0.7 + r() * 0.6)) };
  });

  return {
    branchId: branch.id,
    branchName: branch.name,
    country: branch.country,
    csat,
    nps,
    responses,
    responseRate,
    recommend,
    categories,
    questions,
    stars,
    comments,
    trend,
    completedSurveys: responses,
    pendingSurveys: branch.students - responses,
  };
}

export const SURVEYS = BRANCHES.map(surveyFor);

const byId = Object.fromEntries(SURVEYS.map((s) => [s.branchId, s]));
export function getSurvey(branchId) {
  return byId[branchId];
}

export function csatBand(csat) {
  if (csat >= 80) return "healthy";
  if (csat >= 65) return "attention";
  return "critical";
}

// Aggregates for the Evaluations page.
export const SURVEY_SUMMARY = (() => {
  const n = SURVEYS.length;
  const avg = (f) => Math.round(SURVEYS.reduce((a, s) => a + f(s), 0) / n);
  const totalResponses = SURVEYS.reduce((a, s) => a + s.responses, 0);
  const catAvg = SURVEY_CATEGORIES.map((c) => ({
    label: c.label,
    score: Math.round(SURVEYS.reduce((a, s) => a + s.categories.find((x) => x.key === c.key).score, 0) / n),
  }));
  return {
    avgCsat: avg((s) => s.csat),
    avgNps: avg((s) => s.nps),
    avgResponseRate: avg((s) => s.responseRate),
    totalResponses,
    catAvg,
    promoters: SURVEYS.filter((s) => s.csat >= 80).length,
    detractors: SURVEYS.filter((s) => s.csat < 65).length,
  };
})();
