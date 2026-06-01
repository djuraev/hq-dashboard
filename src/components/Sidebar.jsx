import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Globe2, GraduationCap, Users, BookOpen, ClipboardCheck,
  FileBarChart, FileText, Bell, Settings, Star,
} from "lucide-react";

const NAV = [
  { to: "/", key: "overview", icon: LayoutDashboard, end: true },
  { to: "/branches", key: "branches", icon: Globe2 },
  { to: "/students", key: "students", icon: GraduationCap },
  { to: "/teachers", key: "teachers", icon: Users },
  { to: "/courses", key: "courses", icon: BookOpen },
  { to: "/assessments", key: "assessments", icon: ClipboardCheck },
  { to: "/content", key: "content", icon: FileBarChart },
  { to: "/evaluations", key: "evaluations", icon: Star },
  { to: "/reports", key: "reports", icon: FileText },
  { to: "/alerts", key: "alerts", icon: Bell, badge: 4 },
  { to: "/settings", key: "settings", icon: Settings },
];

export default function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-100 bg-white dark:bg-ink-900 dark:border-ink-700 lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">
          E
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-ink-900">{t("org.name")}</div>
          <div className="text-[11px] leading-tight muted">{t("org.sub")}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map(({ to, key, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="flex-1">{t(`nav.${key}`)}</span>
            {badge && (
              <span className="rounded-full bg-bad px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-3 text-white">
          <div className="text-xs font-semibold">{t("topbar.actionCenter")}</div>
          <p className="mt-1 text-[11px] text-brand-100">{t("topbar.alertsToday", { count: 4 })}</p>
          <NavLink to="/alerts" className="mt-2 inline-block rounded-md bg-white/15 px-2 py-1 text-[11px] font-semibold hover:bg-white/25">
            {t("topbar.reviewNow")}
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
