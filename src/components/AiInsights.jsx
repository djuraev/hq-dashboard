import { Sparkles, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { AI_INSIGHTS } from "../data/metrics";

const TONE = {
  up: { icon: TrendingUp, color: "text-good" },
  down: { icon: TrendingDown, color: "text-warn" },
  alert: { icon: AlertTriangle, color: "text-bad" },
};

export default function AiInsights() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-gradient-to-r from-brand-50 to-white px-4 py-3">
        <Sparkles size={16} className="text-brand-600" />
        <span className="text-sm font-semibold text-ink-900">AI Insights</span>
        <span className="pill bg-brand-100 text-brand-700">Auto-generated</span>
      </div>
      <ul className="divide-y divide-ink-50">
        {AI_INSIGHTS.map((ins, i) => {
          const t = TONE[ins.tone];
          const Icon = t.icon;
          return (
            <li key={i} className="flex items-start gap-3 px-4 py-3">
              <Icon size={16} className={`mt-0.5 shrink-0 ${t.color}`} />
              <span className="text-sm text-ink-700">{ins.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
