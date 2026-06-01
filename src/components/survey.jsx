import { useState } from "react";
import { Star, RefreshCw, Plug, CheckCircle2 } from "lucide-react";
import { EVAL_SOURCE } from "../lib/evalSync";
import { csatBand } from "../data/surveys";
import { BAND_STYLE } from "../lib/format";

// Banner showing the data comes from the external EvalSys + a mock Sync button.
export function EvalSyncBar({ syncedAt = EVAL_SOURCE.lastSync, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [stamp, setStamp] = useState(syncedAt);

  async function sync() {
    setSyncing(true);
    if (onSync) await onSync();
    else await new Promise((r) => setTimeout(r, 900));
    setStamp("just now");
    setSyncing(false);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 bg-white p-3 shadow-card">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Plug size={16} />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          {EVAL_SOURCE.name}
          <span className="pill bg-good/10 text-good"><CheckCircle2 size={11} /> Connected</span>
        </div>
        <div className="text-xs muted">{EVAL_SOURCE.description} · {EVAL_SOURCE.endpoint}</div>
      </div>
      <div className="text-right text-xs muted">
        Last synced<br />
        <span className="font-medium text-ink-700">{stamp}</span>
      </div>
      <button
        onClick={sync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
      >
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> {syncing ? "Syncing…" : "Sync now"}
      </button>
    </div>
  );
}

export function CsatBadge({ csat }) {
  const s = BAND_STYLE[csatBand(csat)];
  return <span className={`pill ${s.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{csat}</span>;
}

export function Stars({ value, size = 13 }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-warn text-warn" : "text-ink-200"} />
      ))}
    </span>
  );
}

const SENT = {
  positive: "border-l-good bg-good/5",
  neutral: "border-l-ink-300 bg-ink-50",
  negative: "border-l-bad bg-bad/5",
};

export function CommentItem({ comment }) {
  return (
    <li className={`rounded-lg border-l-4 p-2.5 text-xs ${SENT[comment.sentiment]}`}>
      <div className="mb-0.5 flex items-center justify-between">
        <Stars value={comment.stars} size={11} />
        <span className="capitalize muted">{comment.sentiment}</span>
      </div>
      <p className="text-ink-700">"{comment.text}"</p>
    </li>
  );
}
