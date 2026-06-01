import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { branchesByCountry, BRANCHES } from "../data/branches";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const STATUS_COLOR = { healthy: "#16a34a", attention: "#d97706", critical: "#dc2626" };

export default function BranchMap() {
  const navigate = useNavigate();
  const [view, setView] = useState("country"); // "country" | "branch"
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });

  return (
    <div className="relative">
      {/* view toggle */}
      <div className="absolute right-2 top-2 z-10 flex rounded-lg border border-ink-200 bg-white p-0.5 text-xs font-medium shadow-card dark:bg-ink-800">
        {["country", "branch"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-md px-2.5 py-1 capitalize ${view === v ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"}`}
          >
            {v} view
          </button>
        ))}
      </div>

      <ComposableMap projectionConfig={{ scale: 145 }} width={900} height={420} style={{ width: "100%", height: "auto" }}>
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#eef0f4"
                  stroke="#dde2ea"
                  strokeWidth={0.4}
                  style={{ default: { outline: "none" }, hover: { fill: "#e1e6f0", outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
            }
          </Geographies>

          {view === "country"
            ? branchesByCountry.map((c) => {
                const r = Math.max(4, Math.min(13, Math.sqrt(c.branches) * 2.4));
                return (
                  <Marker
                    key={c.code}
                    coordinates={c.coords}
                    onMouseEnter={(e) => { setHover({ type: "country", c }); onMove(e); }}
                    onMouseMove={onMove}
                    onMouseLeave={() => setHover(null)}
                  >
                    <circle r={r} fill={STATUS_COLOR[c.status]} fillOpacity={0.25} stroke={STATUS_COLOR[c.status]} strokeWidth={1.2} />
                    <circle r={Math.max(2.5, r * 0.4)} fill={STATUS_COLOR[c.status]} />
                  </Marker>
                );
              })
            : BRANCHES.map((b) => (
                <Marker
                  key={b.id}
                  coordinates={b.location}
                  onMouseEnter={(e) => { setHover({ type: "branch", b }); onMove(e); }}
                  onMouseMove={onMove}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => navigate(`/branches/${b.id}`)}
                  style={{ default: { cursor: "pointer" } }}
                >
                  <circle r={2.6} fill={STATUS_COLOR[b.band]} fillOpacity={0.9} stroke="#fff" strokeWidth={0.5} />
                </Marker>
              ))}
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute bottom-2 left-2 flex gap-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs shadow-card dark:bg-ink-800/90">
        <Legend color="#16a34a" label="Healthy" />
        <Legend color="#d97706" label="Needs Attention" />
        <Legend color="#dc2626" label="Critical" />
        {view === "branch" && <span className="muted">· scroll to zoom · click pin → branch</span>}
      </div>

      {hover?.type === "country" && (
        <Tooltip pos={pos} color={STATUS_COLOR[hover.c.status]} title={hover.c.country} status={hover.c.status}>
          <Row label="Branches" value={hover.c.branches} />
          <Row label="Students" value={hover.c.students.toLocaleString()} />
          <Row label="Teachers" value={hover.c.teachers.toLocaleString()} />
          <Row label="Attendance" value={`${hover.c.attendance}%`} />
          <Row label="LMS Adoption" value={`${hover.c.lmsAdoption}%`} />
        </Tooltip>
      )}
      {hover?.type === "branch" && (
        <Tooltip pos={pos} color={STATUS_COLOR[hover.b.band]} title={hover.b.name} status={hover.b.band}>
          <Row label="Country" value={hover.b.country} />
          <Row label="Health Score" value={hover.b.healthScore} />
          <Row label="Students" value={hover.b.students.toLocaleString()} />
          <Row label="Attendance" value={`${hover.b.attendance}%`} />
          <div className="mt-1 text-[10px] text-brand-600">Click to open branch →</div>
        </Tooltip>
      )}
    </div>
  );
}

function Tooltip({ pos, color, title, status, children }) {
  return (
    <div
      className="pointer-events-none fixed z-50 w-56 rounded-xl border border-ink-100 bg-white p-3 text-sm shadow-pop dark:bg-ink-800"
      style={{ left: pos.x + 14, top: pos.y + 14 }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate font-semibold text-ink-900">{title}</span>
        <span className="pill" style={{ background: color + "1a", color }}>{status}</span>
      </div>
      {children}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-600">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-0.5 text-xs">
      <span className="muted">{label}</span>
      <span className="font-medium text-ink-800">{value}</span>
    </div>
  );
}
