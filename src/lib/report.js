import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas-pro";
import {
  KPIS, HEALTH_BAND_COUNTS, TOP_BRANCHES, BOTTOM_BRANCHES, ALERTS, AI_INSIGHTS,
} from "../data/metrics";
import { TOTAL_BRANCHES, ACTIVE_BRANCHES } from "../data/branches";
import { SURVEYS, SURVEY_SUMMARY } from "../data/surveys";
import { EVAL_SOURCE } from "./evalSync";
import { fmtMetric } from "./format";

const BRAND = [31, 72, 240]; // #1f48f0
const INK = [38, 44, 56];
const MUTED = [107, 118, 137];
const GOOD = [22, 163, 74];
const WARN = [217, 119, 6];
const BAD = [220, 38, 38];

const A4 = { w: 210, h: 297 };
const MARGIN = 14;

function header(doc, title, sub) {
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, A4.w, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Edulime HQ", MARGIN, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Sejong Korean Language Schools", MARGIN, 18);
  doc.setFontSize(8);
  doc.text(title, A4.w - MARGIN, 12, { align: "right" });
  doc.text(sub, A4.w - MARGIN, 18, { align: "right" });
}

function footer(doc, page, pages) {
  doc.setDrawColor(225, 229, 236);
  doc.line(MARGIN, A4.h - 12, A4.w - MARGIN, A4.h - 12);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Confidential — Edulime HQ Executive Report", MARGIN, A4.h - 7);
  doc.text(`Page ${page} of ${pages}`, A4.w - MARGIN, A4.h - 7, { align: "right" });
}

function sectionTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(text, MARGIN, y);
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 1.5, MARGIN + 32, y + 1.5);
  return y + 7;
}

// Render a DOM node to an image and place it on the PDF, scaled to width.
async function placeNode(doc, node, x, y, maxW) {
  if (!node) return y;
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
  });
  const img = canvas.toDataURL("image/png");
  const ratio = canvas.height / canvas.width;
  const h = maxW * ratio;
  doc.addImage(img, "PNG", x, y, maxW, h);
  return y + h;
}

const todayLabel = "2026-06-01";

export async function generateExecutiveReport({ mapNode } = {}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const contentW = A4.w - MARGIN * 2;

  // ---------- PAGE 1 ----------
  header(doc, "Executive Overview", todayLabel);
  let y = 38;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Global Operations Report", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Reporting period: Last 30 days  ·  ${TOTAL_BRANCHES} branches  ·  ${ACTIVE_BRANCHES} active`, MARGIN, y);
  y += 8;

  // KPI table
  y = sectionTitle(doc, "Key Performance Indicators", y);
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "vs Last Month", "Change"]],
    body: KPIS.map((k) => [
      k.label,
      fmtMetric(k.value, k.format),
      k.prev,
      `${k.trend === "up" ? "+" : "-"}${Math.abs(k.change)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: BRAND, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: INK },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 3) {
        const up = d.cell.raw.startsWith("+");
        d.cell.styles.textColor = up ? GOOD : BAD;
        d.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Branch health summary (drawn bars)
  y = sectionTitle(doc, "Branch Health Distribution", y);
  const bands = [
    { label: "Healthy (80-100)", count: HEALTH_BAND_COUNTS.healthy, color: GOOD },
    { label: "Needs Attention (60-79)", count: HEALTH_BAND_COUNTS.attention, color: WARN },
    { label: "Critical (<60)", count: HEALTH_BAND_COUNTS.critical, color: BAD },
  ];
  const maxCount = Math.max(...bands.map((b) => b.count));
  const barMaxW = contentW - 70;
  bands.forEach((b) => {
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(b.label, MARGIN, y + 3);
    const w = (b.count / maxCount) * barMaxW;
    doc.setFillColor(238, 240, 244);
    doc.roundedRect(MARGIN + 55, y, barMaxW, 4.5, 1, 1, "F");
    doc.setFillColor(...b.color);
    doc.roundedRect(MARGIN + 55, y, Math.max(2, w), 4.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.text(String(b.count), MARGIN + 55 + barMaxW + 4, y + 3.5);
    doc.setFont("helvetica", "normal");
    y += 9;
  });
  y += 4;

  // AI insights
  y = sectionTitle(doc, "AI Executive Summary", y);
  doc.setFontSize(9);
  AI_INSIGHTS.forEach((ins) => {
    const color = ins.tone === "up" ? GOOD : ins.tone === "alert" ? BAD : WARN;
    doc.setFillColor(...color);
    doc.circle(MARGIN + 1.5, y - 1, 1, "F");
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(ins.text, contentW - 8);
    doc.text(lines, MARGIN + 6, y);
    y += lines.length * 4.5 + 2;
  });

  footer(doc, 1, 4);

  // ---------- PAGE 2: Map snapshot ----------
  doc.addPage();
  header(doc, "Global Branch Map", todayLabel);
  y = 38;
  y = sectionTitle(doc, "Branch Health by Country", y);
  if (mapNode) {
    y = await placeNode(doc, mapNode, MARGIN, y, contentW);
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Map snapshot unavailable.", MARGIN, y);
  }
  footer(doc, 2, 4);

  // ---------- PAGE 3: Branch rankings ----------
  doc.addPage();
  header(doc, "Branch Performance", todayLabel);
  y = 38;

  y = sectionTitle(doc, "Top Performing Branches", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Branch", "Country", "Health", "Attendance", "Growth"]],
    body: TOP_BRANCHES.map((b, i) => [i + 1, b.name, b.country, b.healthScore, `${b.attendance}%`, `${b.studentGrowth > 0 ? "+" : ""}${b.studentGrowth}%`]),
    theme: "striped",
    headStyles: { fillColor: GOOD, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: INK },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = sectionTitle(doc, "Lowest Performing Branches", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Branch", "Country", "Health", "Attendance", "Growth"]],
    body: BOTTOM_BRANCHES.map((b, i) => [i + 1, b.name, b.country, b.healthScore, `${b.attendance}%`, `${b.studentGrowth > 0 ? "+" : ""}${b.studentGrowth}%`]),
    theme: "striped",
    headStyles: { fillColor: BAD, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: INK },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = sectionTitle(doc, "Active Alerts", y);
  autoTable(doc, {
    startY: y,
    head: [["Severity", "Alert", "Branches"]],
    body: ALERTS.map((a) => [a.severity.toUpperCase(), a.title, a.count]),
    theme: "grid",
    headStyles: { fillColor: WARN, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: INK },
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 0) {
        d.cell.styles.textColor = d.cell.raw === "CRITICAL" ? BAD : WARN;
        d.cell.styles.fontStyle = "bold";
      }
    },
  });

  footer(doc, 3, 4);

  // ---------- PAGE 4: Survey & Evaluation (EvalSys) ----------
  doc.addPage();
  header(doc, "Survey & Evaluation", todayLabel);
  y = 38;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("Student Satisfaction Results", MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Source: ${EVAL_SOURCE.name} (${EVAL_SOURCE.endpoint})  ·  Last synced: ${EVAL_SOURCE.lastSync}`, MARGIN, y);
  y += 8;

  // summary KPI tiles (drawn)
  const tiles = [
    { label: "Avg CSAT", value: `${SURVEY_SUMMARY.avgCsat}` },
    { label: "Avg NPS", value: `+${SURVEY_SUMMARY.avgNps}` },
    { label: "Response Rate", value: `${SURVEY_SUMMARY.avgResponseRate}%` },
    { label: "Total Responses", value: SURVEY_SUMMARY.totalResponses.toLocaleString() },
    { label: "Promoters", value: `${SURVEY_SUMMARY.promoters}` },
    { label: "Detractors", value: `${SURVEY_SUMMARY.detractors}` },
  ];
  const tileW = (contentW - 5 * 3) / 6;
  tiles.forEach((t, i) => {
    const x = MARGIN + i * (tileW + 3);
    doc.setFillColor(247, 248, 250);
    doc.roundedRect(x, y, tileW, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BRAND);
    doc.text(t.value, x + tileW / 2, y + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(t.label, x + tileW / 2, y + 14, { align: "center" });
  });
  y += 26;

  // category scores (drawn bars)
  y = sectionTitle(doc, "Category Scores (avg)", y);
  const catMaxW = contentW - 70;
  SURVEY_SUMMARY.catAvg.forEach((c) => {
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(c.label, MARGIN, y + 3);
    const col = c.score >= 80 ? GOOD : c.score >= 65 ? WARN : BAD;
    doc.setFillColor(238, 240, 244);
    doc.roundedRect(MARGIN + 55, y, catMaxW, 4.5, 1, 1, "F");
    doc.setFillColor(...col);
    doc.roundedRect(MARGIN + 55, y, Math.max(2, (c.score / 100) * catMaxW), 4.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.text(String(c.score), MARGIN + 55 + catMaxW + 4, y + 3.5);
    doc.setFont("helvetica", "normal");
    y += 9;
  });
  y += 4;

  // top & bottom satisfaction tables
  const ranked = [...SURVEYS].sort((a, b) => b.csat - a.csat);
  const top5 = ranked.slice(0, 5);
  const bottom5 = ranked.slice(-5).reverse();

  y = sectionTitle(doc, "Highest Satisfaction Branches", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Branch", "Country", "CSAT", "NPS", "Response"]],
    body: top5.map((s, i) => [i + 1, s.branchName, s.country, s.csat, `${s.nps > 0 ? "+" : ""}${s.nps}`, `${s.responseRate}%`]),
    theme: "striped",
    headStyles: { fillColor: GOOD, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: INK },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = sectionTitle(doc, "Lowest Satisfaction Branches", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Branch", "Country", "CSAT", "NPS", "Response"]],
    body: bottom5.map((s, i) => [i + 1, s.branchName, s.country, s.csat, `${s.nps > 0 ? "+" : ""}${s.nps}`, `${s.responseRate}%`]),
    theme: "striped",
    headStyles: { fillColor: BAD, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: INK },
    margin: { left: MARGIN, right: MARGIN },
  });

  footer(doc, 4, 4);

  doc.save(`Edulime-HQ-Executive-Report-${todayLabel}.pdf`);
}
