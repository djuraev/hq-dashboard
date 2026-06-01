import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTheme } from "./ThemeToggle";

export const BRAND = "#3366ff";
export const PALETTE = ["#3366ff", "#16a34a", "#d97706", "#dc2626", "#8b5cf6", "#0ea5e9", "#ec4899", "#14b8a6"];

function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    gridStroke: dark ? "#2e3543" : "#eef0f4",
    tickFill: dark ? "#7e8a9c" : "#9aa4b5",
    tooltip: {
      contentStyle: {
        borderRadius: 12,
        border: `1px solid ${dark ? "#3a4151" : "#e1e5ec"}`,
        background: dark ? "#1c222c" : "#fff",
        color: dark ? "#e1e5ec" : "#262c38",
        boxShadow: "0 12px 32px rgba(0,0,0,.25)",
        fontSize: 13,
      },
      labelStyle: { color: dark ? "#e1e5ec" : "#262c38" },
    },
  };
}

export function AreaTrend({ data, xKey, series, height = 260 }) {
  const t = useChartTheme();
  const axis = { tick: { fill: t.tickFill, fontSize: 12 }, axisLine: false, tickLine: false };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color ?? PALETTE[i]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={s.color ?? PALETTE[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} />
        <Tooltip {...t.tooltip} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color ?? PALETTE[i]} fill={`url(#g-${s.key})`} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({ data, xKey, series, height = 260, domain }) {
  const t = useChartTheme();
  const axis = { tick: { fill: t.tickFill, fontSize: 12 }, axisLine: false, tickLine: false };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} domain={domain} />
        <Tooltip {...t.tooltip} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color ?? PALETTE[i]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, xKey, series, height = 260, layout = "horizontal" }) {
  const t = useChartTheme();
  const axis = { tick: { fill: t.tickFill, fontSize: 12 }, axisLine: false, tickLine: false };
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 8, right: 8, left: vertical ? 24 : -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} horizontal={!vertical} vertical={vertical} />
        {vertical ? (
          <>
            <XAxis type="number" {...axis} />
            <YAxis type="category" dataKey={xKey} {...axis} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axis} />
            <YAxis {...axis} />
          </>
        )}
        <Tooltip {...t.tooltip} cursor={{ fill: t.gridStroke, fillOpacity: 0.4 }} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name ?? s.key} fill={s.color ?? PALETTE[i]} radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={vertical ? 18 : 42} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 240, inner = 58, outer = 88, colors = PALETTE }) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={outer} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip {...t.tooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
