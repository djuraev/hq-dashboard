import * as Icons from "lucide-react";
import { Card, TrendIndicator } from "./ui";
import { fmtMetric } from "../lib/format";
import { useCountUp } from "../lib/useCountUp";

export default function KpiCard({ kpi }) {
  const Icon = Icons[kpi.icon] ?? Icons.Activity;
  const animated = useCountUp(kpi.value, { duration: 1000 });
  return (
    <Card className="card-hover p-4 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-transform duration-200 group-hover:scale-105">
          <Icon size={18} strokeWidth={2} />
        </div>
        <TrendIndicator change={kpi.change} trend={kpi.trend} />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
        {fmtMetric(animated, kpi.format)}
      </div>
      <div className="mt-0.5 text-[13px] font-medium muted">{kpi.label}</div>
      <div className="mt-2 border-t border-ink-100 pt-2 text-xs muted">
        vs last month <span className="font-medium text-ink-700">{kpi.prev}</span>
      </div>
    </Card>
  );
}
