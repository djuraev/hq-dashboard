import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { COUNTRIES, REGIONS } from "../data/countries";

function Select({ label, options }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-xs font-medium muted">{label}</span>
      <select className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
        <option>All</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ extra }) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 bg-white p-3 shadow-card">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
        <SlidersHorizontal size={15} className="text-brand-600" /> {t("common.filters")}
      </span>
      <Select label={t("common.region")} options={REGIONS} />
      <Select label={t("common.country")} options={COUNTRIES.map((c) => c.name)} />
      <Select label={t("common.date")} options={["Last 7 days", "Last 30 days", "This quarter", "This year"]} />
      {extra}
      <button className="ml-auto rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
        {t("common.apply")}
      </button>
    </div>
  );
}
