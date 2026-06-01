import { FileText, FileSpreadsheet, FileDown, Clock, Bookmark, Plus } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { Card, SectionHeader } from "../components/ui";

const EXPORTS = [
  { icon: FileDown, label: "Export PDF", desc: "Full executive summary as PDF", color: "text-bad" },
  { icon: FileSpreadsheet, label: "Export Excel", desc: "Raw branch metrics as .xlsx", color: "text-good" },
  { icon: Clock, label: "Scheduled Reports", desc: "Weekly digest every Monday 09:00 KST", color: "text-brand-600" },
  { icon: Bookmark, label: "Saved Reports", desc: "Your pinned report templates", color: "text-warn" },
];

const SAVED = [
  { name: "Q2 Executive Summary", type: "PDF", date: "May 30, 2026", owner: "HQ Admin" },
  { name: "Southeast Asia Branch Health", type: "Excel", date: "May 28, 2026", owner: "Regional Ops" },
  { name: "LMS Adoption — Europe", type: "PDF", date: "May 22, 2026", owner: "Academic Dir." },
  { name: "TOPIK Results 2026", type: "Excel", date: "May 18, 2026", owner: "Assessment" },
];

const SCHEDULED = [
  { name: "Weekly Global Digest", cadence: "Every Monday 09:00 KST", recipients: "Executives" },
  { name: "Monthly Branch Health", cadence: "1st of month", recipients: "Regional Supervisors" },
  { name: "Daily Alert Summary", cadence: "Daily 18:00 KST", recipients: "Operations" },
];

export default function Reports() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Export, schedule and manage reports">
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus size={15} /> New Report
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EXPORTS.map((e) => (
          <button key={e.label} className="card card-hover p-4 text-left">
            <e.icon size={22} className={e.color} />
            <div className="mt-3 text-sm font-semibold text-ink-900">{e.label}</div>
            <div className="mt-0.5 text-xs muted">{e.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader title="Saved Reports" />
          <ul className="divide-y divide-ink-50">
            {SAVED.map((r) => (
              <li key={r.name} className="flex items-center gap-3 py-2.5">
                <FileText size={18} className="text-brand-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900">{r.name}</div>
                  <div className="text-xs muted">{r.owner} · {r.date}</div>
                </div>
                <span className="pill bg-ink-100 text-ink-600">{r.type}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Scheduled Reports" />
          <ul className="divide-y divide-ink-50">
            {SCHEDULED.map((r) => (
              <li key={r.name} className="flex items-center gap-3 py-2.5">
                <Clock size={18} className="text-good" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900">{r.name}</div>
                  <div className="text-xs muted">{r.cadence} · {r.recipients}</div>
                </div>
                <span className="pill bg-good/10 text-good">Active</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
