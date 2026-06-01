import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { HealthBadge } from "./ui";

// Generic ranking table for branches. columns: array of {key,label,render?,align?}
export default function RankingTable({ rows, columns, onRowClick, dense }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
            {columns.map((c) => (
              <th key={c.key} className={`px-3 ${dense ? "py-2" : "py-2.5"} ${c.align === "right" ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-ink-50 last:border-0 ${onRowClick ? "cursor-pointer hover:bg-ink-50" : ""}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-3 ${dense ? "py-2" : "py-2.5"} ${c.align === "right" ? "text-right" : ""}`}>
                  {c.render ? c.render(row, i) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Shared cell renderers for branch ranking panels.
export function GrowthCell({ value }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${up ? "text-good" : "text-bad"}`}>
      <Icon size={14} strokeWidth={2.5} />
      {Math.abs(value)}%
    </span>
  );
}

export function branchColumns(navigate) {
  return [
    { key: "rank", label: "#", render: (_r, i) => <span className="font-semibold text-ink-400">{i + 1}</span> },
    {
      key: "name",
      label: "Branch",
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/branches/${r.id}`);
          }}
          className="font-medium text-ink-800 hover:text-brand-600"
        >
          {r.name}
        </button>
      ),
    },
    { key: "country", label: "Country", render: (r) => <span className="muted">{r.country}</span> },
    { key: "healthScore", label: "Health", align: "right", render: (r) => <HealthBadge band={r.band} score={r.healthScore} /> },
    { key: "attendance", label: "Attend.", align: "right", render: (r) => `${r.attendance}%` },
    { key: "studentGrowth", label: "Growth", align: "right", render: (r) => <GrowthCell value={r.studentGrowth} /> },
  ];
}
