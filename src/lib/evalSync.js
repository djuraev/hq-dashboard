// Mock client for the external evaluation system ("EvalSys").
// Simulates fetching survey data over a network with a sync timestamp.
import { SURVEYS, getSurvey } from "../data/surveys";

export const EVAL_SOURCE = {
  name: "EvalSys",
  description: "External Survey & Evaluation Platform",
  endpoint: "https://api.evalsys.sejong-edu.kr/v2",
  // fixed mock timestamp (Date.now unavailable in some envs; keep deterministic)
  lastSync: "2026-06-01 08:42 KST",
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Pretend to call the external API.
export async function fetchAllSurveys() {
  await delay(900);
  return { source: EVAL_SOURCE, syncedAt: EVAL_SOURCE.lastSync, data: SURVEYS };
}

export async function fetchBranchSurvey(branchId) {
  await delay(600);
  return { source: EVAL_SOURCE, syncedAt: EVAL_SOURCE.lastSync, data: getSurvey(branchId) };
}
