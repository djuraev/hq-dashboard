import { X, GraduationCap, UserMinus, CalendarCheck, Star, ClipboardCheck, BookOpen, Award, Users } from "lucide-react";
import { LineTrend } from "./charts";
import { ProgressBar } from "./ui";
import { teacherTrend } from "../data/metrics";
import { useEscape, useFocusTrap, useScrollLock } from "../lib/a11y";

export default function TeacherDrawer({ teacher, onClose }) {
  const open = !!teacher;
  useEscape(open, onClose);
  useScrollLock(open);
  const ref = useFocusTrap(open);
  if (!teacher) return null;
  const trend = teacherTrend(teacher);
  const initials = teacher.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const kpis = [
    { icon: Users, label: "Students Taught", value: teacher.studentsTaught },
    { icon: GraduationCap, label: "Graduates", value: teacher.graduates, sub: `${teacher.graduateRate}% rate`, color: "text-good" },
    { icon: UserMinus, label: "Dropouts", value: teacher.dropouts, sub: `${teacher.dropoutRate}% rate`, color: "text-bad" },
    { icon: CalendarCheck, label: "Attendance", value: `${teacher.attendance}%` },
    { icon: BookOpen, label: "Classes Conducted", value: teacher.classes },
    { icon: ClipboardCheck, label: "Assignments Graded", value: teacher.graded },
    { icon: Award, label: "Avg Student Score", value: teacher.avgScore },
    { icon: Star, label: "Rating", value: teacher.rating, color: "text-warn" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label={`${teacher.name} details`} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-pop dark:bg-ink-800">
        {/* header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-800 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-brand-700">
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
            <p className="text-sm text-brand-100">{teacher.subject} · {teacher.branch}</p>
            <p className="text-xs text-brand-200">{teacher.country} · Since {teacher.since} · {teacher.id}</p>
          </div>
          <button onClick={onClose} aria-label="Close panel" className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-ink-100 p-3">
                <k.icon size={15} className={k.color ?? "text-brand-600"} />
                <div className="mt-1.5 text-lg font-bold leading-tight text-ink-900">{k.value}</div>
                <div className="text-[11px] font-medium text-ink-600">{k.label}</div>
                {k.sub && <div className="text-[10px] muted">{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* graduate vs dropout bar */}
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-good">Graduate {teacher.graduateRate}%</span>
              <span className="font-medium text-bad">Dropout {teacher.dropoutRate}%</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-ink-100">
              <div className="bg-good" style={{ width: `${teacher.graduateRate}%` }} />
              <div className="bg-bad" style={{ width: `${teacher.dropoutRate}%` }} />
            </div>
          </div>

          {/* engagement + grading */}
          <div className="mt-5 space-y-3">
            <Bar label="Engagement Score" value={teacher.engagement} />
            <Bar label="On-time Grading" value={teacher.onTimeGrading} />
            <Bar label="Attendance" value={teacher.attendance} />
          </div>

          {/* trend */}
          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-ink-800">Activity Trend (12 months)</div>
            <LineTrend
              data={trend}
              xKey="month"
              series={[
                { key: "classes", name: "Classes", color: "#3366ff" },
                { key: "attendance", name: "Attendance %", color: "#16a34a" },
              ]}
              height={200}
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-ink-100 p-4">
          <button className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Message</button>
          <button className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">View Full Profile</button>
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
