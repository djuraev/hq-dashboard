import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Star } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { Card } from "../components/ui";
import FilterBar from "../components/FilterBar";
import RankingTable, { branchColumns } from "../components/RankingTable";
import { BRANCHES } from "../data/branches";
import { useFavorites } from "../lib/favorites";
import { exportCsv } from "../lib/csv";

const PAGE = 25;

const CSV_COLS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Branch" },
  { key: "country", label: "Country" },
  { key: "region", label: "Region" },
  { key: "healthScore", label: "Health Score" },
  { key: "attendance", label: "Attendance %" },
  { key: "lmsActivity", label: "LMS %" },
  { key: "completion", label: "Completion %" },
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
  { key: "studentGrowth", label: "Growth %" },
];

export default function GlobalBranches() {
  const navigate = useNavigate();
  const fav = useFavorites();
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [onlyFav, setOnlyFav] = useState(false);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let rows = t
      ? BRANCHES.filter((b) => b.name.toLowerCase().includes(t) || b.country.toLowerCase().includes(t) || b.id.toLowerCase().includes(t))
      : BRANCHES;
    if (onlyFav) rows = rows.filter((b) => fav.has(b.id));
    return [...rows].sort((a, b) => b.healthScore - a.healthScore);
  }, [q, onlyFav, fav]);

  const favCol = {
    key: "fav",
    label: "",
    render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); fav.toggle(r.id); }}
        aria-label={fav.has(r.id) ? "Unpin branch" : "Pin branch"}
        className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <Star size={15} className={fav.has(r.id) ? "fill-warn text-warn" : "text-ink-300 hover:text-warn"} />
      </button>
    ),
  };
  const cols = [favCol, ...branchColumns(navigate)];

  return (
    <>
      <PageHeader title="Global Branches" subtitle={`${BRANCHES.length} branches across 27 countries`}>
        <button
          onClick={() => exportCsv(`edulime-branches`, filtered, CSV_COLS)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <Download size={15} /> Export CSV
        </button>
      </PageHeader>

      <FilterBar />

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
              placeholder="Search branches…"
              className="w-full rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyFav((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${onlyFav ? "border-warn bg-warn/10 text-warn" : "border-ink-200 text-ink-600 hover:bg-ink-50"}`}
            >
              <Star size={13} className={onlyFav ? "fill-warn" : ""} /> Favorites {fav.ids.length ? `(${fav.ids.length})` : ""}
            </button>
            <span className="text-sm muted">{filtered.length} results</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm muted">
            {onlyFav ? "No favorite branches yet. Tap the star on a branch to pin it." : "No branches match your search."}
          </div>
        ) : (
          <RankingTable rows={filtered.slice(0, shown)} columns={cols} onRowClick={(r) => navigate(`/branches/${r.id}`)} dense />
        )}

        {shown < filtered.length && (
          <div className="mt-4 text-center">
            <button onClick={() => setShown((s) => s + PAGE)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Load more
            </button>
          </div>
        )}
      </Card>
    </>
  );
}
