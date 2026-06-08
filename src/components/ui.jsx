import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { BAND_STYLE } from "../lib/format";
import { useCountUp } from "../lib/useCountUp";

// Count-up a leading number inside a string like "1,820", "91%", "27m", "+4.3%".
export function AnimatedValue({ value }) {
  const str = String(value);
  const m = str.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  const num = m ? Number(m[2].replace(/,/g, "")) : NaN;
  const decimals = m && m[2].includes(".") ? (m[2].split(".")[1]?.length ?? 0) : 0;
  const animated = useCountUp(isFinite(num) ? num : 0, { duration: 900, decimals });
  if (!m || !isFinite(num)) return <>{value}</>;
  const shown = decimals ? animated.toFixed(decimals) : Math.round(animated).toLocaleString("en-US");
  return <span className="tabular-nums">{m[1]}{shown}{m[3]}</span>;
}

export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function TrendIndicator({ change, trend, suffix = "" }) {
  const up = trend === "up";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? "text-good" : "text-bad";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${color}`}>
      <Icon size={14} strokeWidth={2.5} />
      {Math.abs(change)}%{suffix}
    </span>
  );
}

export function HealthBadge({ band, score }) {
  const s = BAND_STYLE[band];
  return (
    <span className={`pill ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {score != null ? score : s.label}
    </span>
  );
}

export function StatDot({ band }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${BAND_STYLE[band].dot}`} />;
}

export function MetricStrip({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((m) => (
        <Card key={m.label} className="card-hover p-3.5 transition-transform duration-150 hover:-translate-y-0.5">
          <div className="text-xs font-medium muted">{m.label}</div>
          <div className="mt-1 text-xl font-bold tracking-tight text-ink-900">
            <AnimatedValue value={m.value} />
          </div>
          {m.sub && <div className="mt-0.5 text-[11px] muted">{m.sub}</div>}
        </Card>
      ))}
    </div>
  );
}

export function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <Card className={`p-4 ${className}`}>
      <SectionHeader title={title} subtitle={subtitle} />
      {children}
    </Card>
  );
}

// Lightweight segmented tabs. `tabs`: [{ key, label }]. Controlled via value/onChange.
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5 dark:border-ink-700 dark:bg-ink-800">
      {tabs.map((tb) => (
        <button
          key={tb.key}
          onClick={() => onChange(tb.key)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
            value === tb.key
              ? "bg-white text-brand-700 shadow-sm dark:bg-ink-900 dark:text-brand-300"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {tb.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, band }) {
  const color = band ? BAND_STYLE[band].dot : "bg-brand-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
