import { createContext, useContext, useMemo, useState } from "react";

// Global dashboard filters. Date range applies a scaling factor to
// volume metrics so KPIs/charts visibly respond to the selector.
const RANGES = {
  "Last 7 days": { factor: 0.24, label: "Last 7 days" },
  "Last 30 days": { factor: 1, label: "Last 30 days" },
  "This quarter": { factor: 2.8, label: "This quarter" },
  "This year": { factor: 11.5, label: "This year" },
};

const FilterCtx = createContext(null);
export const useFilters = () => useContext(FilterCtx);
export const RANGE_OPTIONS = Object.keys(RANGES);

export function FiltersProvider({ children }) {
  const [range, setRange] = useState("Last 30 days");
  const value = useMemo(() => ({ range, setRange, factor: RANGES[range].factor }), [range]);
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

// Scale a volume metric by the active range factor (counts only, not %/scores).
export function scaleVolume(n, factor) {
  return Math.round(n * factor);
}
