export function fmtInt(n) {
  return n.toLocaleString("en-US");
}
export function fmtPct(n) {
  return `${n}%`;
}
export function fmtMetric(value, format) {
  if (format === "pct") return fmtPct(value);
  return fmtInt(value);
}

export const BAND_STYLE = {
  healthy: { dot: "bg-good", text: "text-good", bg: "bg-good/10", label: "Healthy", chip: "bg-good/10 text-good" },
  attention: { dot: "bg-warn", text: "text-warn", bg: "bg-warn/10", label: "Needs Attention", chip: "bg-warn/10 text-warn" },
  critical: { dot: "bg-bad", text: "text-bad", bg: "bg-bad/10", label: "Critical", chip: "bg-bad/10 text-bad" },
};

export function scoreBand(score) {
  if (score >= 80) return "healthy";
  if (score >= 60) return "attention";
  return "critical";
}
