import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, Star, ChevronRight, BadgeCheck } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { Card } from "../components/ui";
import RankingTable from "../components/RankingTable";
import TeacherDrawer from "../components/TeacherDrawer";
import { TEACHERS, SUBJECTS, CERTIFICATIONS } from "../data/metrics";
import { fmtInt } from "../lib/format";

const cols = [
  { key: "name", label: "Teacher", render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
  { key: "subject", label: "Subject", render: (r) => <span className="muted">{r.subject}</span> },
  { key: "branch", label: "Branch", render: (r) => <span className="muted">{r.branch}</span> },
  {
    key: "certifications",
    label: "Certifications",
    render: (r) =>
      r.certifications.length ? (
        <div className="flex flex-wrap gap-1">
          {r.certifications.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
              <BadgeCheck size={11} /> {c}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[11px] muted">—</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <span className={`pill ${r.active ? "bg-good/10 text-good" : "bg-ink-100 text-ink-500"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${r.active ? "bg-good" : "bg-ink-400"}`} />
        {r.active ? "Active" : "Inactive"}
      </span>
    ),
  },
  { key: "rating", label: "Rating", align: "right", render: (r) => <span className="inline-flex items-center gap-1 font-semibold text-ink-800"><Star size={12} className="fill-warn text-warn" />{r.rating}</span> },
  { key: "go", label: "", render: () => <ChevronRight size={15} className="text-ink-300" /> },
];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-xs font-medium muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:bg-ink-900 dark:border-ink-700"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default function TeachersAll() {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [cert, setCert] = useState("");

  const status = params.get("status") || "";
  const setStatus = (v) => {
    const next = new URLSearchParams(params);
    if (v) next.set("status", v);
    else next.delete("status");
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEACHERS.filter((t) => {
      if (status && t.status !== status) return false;
      if (subject && t.subject !== subject) return false;
      if (cert && !t.certifications.includes(cert)) return false;
      if (q && !`${t.name} ${t.branch} ${t.country}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, subject, cert, status]);

  return (
    <>
      <PageHeader title="All Teachers" subtitle="Full roster with detailed search">
        <Link to="/teachers" className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
          <ArrowLeft size={15} /> Back to Analytics
        </Link>
      </PageHeader>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, branch, country…"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:bg-ink-900 dark:border-ink-700"
          />
        </div>
        <FilterSelect label="Subject" value={subject} onChange={setSubject} options={SUBJECTS} />
        <FilterSelect label="Certification" value={cert} onChange={setCert} options={CERTIFICATIONS} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["active", "inactive"]} />
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm muted">{fmtInt(rows.length)} of {fmtInt(TEACHERS.length)} teachers</div>
        {rows.length ? (
          <RankingTable rows={rows} columns={cols} onRowClick={(t) => setSelected(t)} dense />
        ) : (
          <div className="py-12 text-center text-sm muted">No teachers match these filters.</div>
        )}
      </Card>

      <TeacherDrawer teacher={selected} onClose={() => setSelected(null)} />
    </>
  );
}
