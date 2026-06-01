import { useState } from "react";
import { Search, Bell, ChevronDown, Calendar, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import { useEscape } from "../lib/a11y";
import { useFilters, RANGE_OPTIONS } from "../lib/filters";
import { LANGUAGES } from "../i18n";

export default function Topbar() {
  const { t, i18n } = useTranslation();
  const { range, setRange } = useFilters();
  const [openR, setOpenR] = useState(false);
  const [openL, setOpenL] = useState(false);
  const lang = LANGUAGES.find((l) => l.code === i18n.language)?.label ?? "English";

  function changeLang(code) {
    i18n.changeLanguage(code);
    localStorage.setItem("edulime-lang", code);
    setOpenL(false);
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/90 px-4 backdrop-blur dark:bg-ink-900/90 dark:border-ink-700 lg:px-6">
      {/* Global search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          placeholder={t("topbar.search")}
          className="w-full rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm text-ink-800 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Date range */}
        <Dropdown
          open={openR}
          setOpen={setOpenR}
          trigger={
            <>
              <Calendar size={15} className="text-ink-500" />
              <span className="hidden sm:inline">{range}</span>
              <ChevronDown size={14} className="text-ink-400" />
            </>
          }
        >
          {RANGE_OPTIONS.map((r) => (
            <MenuItem key={r} active={r === range} onClick={() => { setRange(r); setOpenR(false); }}>{r}</MenuItem>
          ))}
        </Dropdown>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50">
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bad ring-2 ring-white" />
        </button>

        {/* Language */}
        <Dropdown
          open={openL}
          setOpen={setOpenL}
          trigger={
            <>
              <Globe size={15} className="text-ink-500" />
              <span className="hidden sm:inline">{lang}</span>
              <ChevronDown size={14} className="text-ink-400" />
            </>
          }
        >
          {LANGUAGES.map((l) => (
            <MenuItem key={l.code} active={l.code === i18n.language} onClick={() => changeLang(l.code)}>{l.label}</MenuItem>
          ))}
        </Dropdown>

        {/* Profile */}
        <button className="flex items-center gap-2 rounded-lg border border-ink-200 py-1 pl-1 pr-2 hover:bg-ink-50">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">HQ</span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold leading-tight text-ink-900">HQ Admin</span>
            <span className="block text-[10px] leading-tight muted">Seoul HQ</span>
          </span>
          <ChevronDown size={14} className="text-ink-400" />
        </button>
      </div>
    </header>
  );
}

function Dropdown({ open, setOpen, trigger, children }) {
  useEscape(open, () => setOpen(false));
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-ink-300"
      >
        {trigger}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-ink-100 bg-white p-1 shadow-pop dark:bg-ink-800">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ active, onClick, children }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${active ? "bg-brand-50 font-medium text-brand-700" : "text-ink-700 hover:bg-ink-50"}`}
    >
      {children}
    </button>
  );
}
