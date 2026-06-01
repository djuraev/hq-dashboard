import { X, Users, Award, Star, Activity, BookOpen } from "lucide-react";
import { LineTrend, Donut } from "./charts";
import { ProgressBar } from "./ui";
import { Stars } from "./survey";
import { useEscape, useFocusTrap, useScrollLock } from "../lib/a11y";
import { MONTHS } from "../data/metrics";
import { mulberry32 } from "../data/seed";

function courseExtras(course) {
  let h = 2166136261;
  for (let i = 0; i < course.id.length; i++) { h ^= course.id.charCodeAt(i); h = Math.imul(h, 16777619); }
  const r = mulberry32(h >>> 0);
  let c = course.completion - 8;
  const trend = MONTHS.map((m) => {
    c = Math.max(40, Math.min(99, c + (r() * 8 - 3)));
    return { month: m, completion: Math.round(c), enrolled: Math.round(course.enrolled / 12 * (0.6 + r())) };
  });
  const outcome = [
    { name: "Completed", value: course.completion },
    { name: "In Progress", value: Math.round((100 - course.completion) * 0.7) },
    { name: "Dropped", value: 100 - course.completion - Math.round((100 - course.completion) * 0.7) },
  ];
  return { trend, outcome };
}

export default function CourseDrawer({ course, onClose }) {
  const open = !!course;
  useEscape(open, onClose);
  useScrollLock(open);
  const ref = useFocusTrap(open);
  if (!course) return null;
  const { trend, outcome } = courseExtras(course);

  const kpis = [
    { icon: Users, label: "Enrolled", value: course.enrolled.toLocaleString() },
    { icon: Award, label: "Completion", value: `${course.completion}%`, color: "text-good" },
    { icon: Star, label: "Rating", value: course.rating, color: "text-warn" },
    { icon: Activity, label: "Engagement", value: course.engagement },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label={`${course.name} details`} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-pop dark:bg-ink-800">
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-800 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700">
            <BookOpen size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{course.name}</h3>
            <div className="mt-0.5"><Stars value={course.rating} size={13} /></div>
          </div>
          <button onClick={onClose} aria-label="Close panel" className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-ink-100 p-3">
                <k.icon size={15} className={k.color ?? "text-brand-600"} />
                <div className="mt-1.5 text-lg font-bold leading-tight text-ink-900">{k.value}</div>
                <div className="text-[11px] font-medium text-ink-600">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-ink-800">Completion Trend (12 months)</div>
            <LineTrend data={trend} xKey="month" series={[{ key: "completion", name: "Completion %", color: "#3366ff" }]} domain={[40, 100]} height={190} />
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-ink-800">Learner Outcomes</div>
            <Donut data={outcome} colors={["#16a34a", "#3366ff", "#dc2626"]} height={200} inner={48} outer={76} />
          </div>

          <div className="mt-4 space-y-3">
            <Bar label="Completion Rate" value={course.completion} />
            <Bar label="Engagement Score" value={course.engagement} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Bar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-ink-600">{label}</span>
        <span className="font-semibold text-ink-800">{value}</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}
