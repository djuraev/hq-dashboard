import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Loader2, Star } from "lucide-react";
import { PageHeader } from "../components/Layout";
import { useToast } from "../components/Toast";
import { generateExecutiveReport } from "../lib/report";
import { Card, SectionHeader, HealthBadge, ProgressBar } from "../components/ui";
import KpiCard from "../components/KpiCard";
import RankingTable, { branchColumns } from "../components/RankingTable";
import BranchMap from "../components/BranchMap";
import AlertCard from "../components/AlertCard";
import AiInsights from "../components/AiInsights";
import {
  KPIS, TOP_BRANCHES, BOTTOM_BRANCHES, HEALTH_WEIGHTS, HEALTHIEST_10,
  ATTENTION_10, HEALTH_BAND_COUNTS, ALERTS,
} from "../data/metrics";
import { BRANCHES } from "../data/branches";
import { BAND_STYLE } from "../lib/format";
import { useFilters } from "../lib/filters";
import { useFavorites } from "../lib/favorites";
import { useTranslation } from "react-i18next";

export default function Overview() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { range, factor } = useFilters();
  const fav = useFavorites();
  const cols = branchColumns(navigate);
  const mapRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // Period-flow metrics scale with the selected date range; stock counts don't.
  const kpis = useMemo(
    () =>
      KPIS.map((k) => {
        if (k.key !== "students" && k.key !== "teachers") return k;
        return k; // stock metrics shown as-is
      }),
    []
  );
  const periodEnrollments = Math.round(3120 * factor);
  const favBranches = BRANCHES.filter((b) => fav.has(b.id));

  async function handleExport() {
    setExporting(true);
    try {
      await generateExecutiveReport({ mapNode: mapRef.current });
      toast("Executive report downloaded.");
    } catch (e) {
      console.error(e);
      toast("Report export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader title={t("pages.overview.title")} subtitle={`${range} · ${periodEnrollments.toLocaleString()} enrollments this period`}>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {exporting ? t("common.generating") : t("common.downloadReport")}
        </button>
      </PageHeader>

      {/* Favorite branches */}
      {favBranches.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-800">
            <Star size={14} className="fill-warn text-warn" /> {t("common.favorites")}
          </div>
          <div className="flex flex-wrap gap-2">
            {favBranches.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/branches/${b.id}`)}
                className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm shadow-card hover:shadow-cardhover"
              >
                <span className={`h-2 w-2 rounded-full ${BAND_STYLE[b.band].dot}`} />
                <span className="font-medium text-ink-800">{b.name}</span>
                <HealthBadge band={b.band} score={b.healthScore} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Executive KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      {/* Section 2 + 11: Map + Action Center */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <SectionHeader title="Global Branch Map" subtitle="Branch health by country — hover for details" />
          <div ref={mapRef}>
            <BranchMap />
          </div>
        </Card>

        <div>
          <SectionHeader title="HQ Action Center" subtitle="Turn analytics into action" />
          <div className="space-y-3">
            {ALERTS.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Branch ranking */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader title="Top Performing Branches" subtitle="Highest health scores" />
          <RankingTable rows={TOP_BRANCHES} columns={cols} dense />
        </Card>
        <Card className="p-4">
          <SectionHeader title="Lowest Performing Branches" subtitle="Require intervention" />
          <RankingTable rows={BOTTOM_BRANCHES} columns={cols} dense />
        </Card>
      </div>

      {/* Section 4: Health Score + AI Insights */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-4">
          <SectionHeader title="Branch Health Score" subtitle="Weighted operational indicator" />
          <div className="grid grid-cols-3 gap-2 text-center">
            <BandStat band="healthy" count={HEALTH_BAND_COUNTS.healthy} range="80–100" />
            <BandStat band="attention" count={HEALTH_BAND_COUNTS.attention} range="60–79" />
            <BandStat band="critical" count={HEALTH_BAND_COUNTS.critical} range="< 60" />
          </div>
          <div className="mt-4 space-y-2">
            {HEALTH_WEIGHTS.map((w) => (
              <div key={w.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-600">{w.label}</span>
                  <span className="font-semibold text-ink-800">{w.weight}%</span>
                </div>
                <ProgressBar value={w.weight} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Top 10 Healthiest" />
          <ScoreList rows={HEALTHIEST_10} navigate={navigate} />
        </Card>

        <Card className="p-4">
          <SectionHeader title="Bottom 10 — Attention" />
          <ScoreList rows={ATTENTION_10} navigate={navigate} />
        </Card>
      </div>

      <div className="mt-6">
        <AiInsights />
      </div>
    </>
  );
}

function BandStat({ band, count, range }) {
  const s = BAND_STYLE[band];
  return (
    <div className={`rounded-xl p-3 ${s.bg}`}>
      <div className={`text-2xl font-bold ${s.text}`}>{count}</div>
      <div className="text-[11px] font-medium text-ink-600">{s.label}</div>
      <div className="text-[10px] muted">{range}</div>
    </div>
  );
}

function ScoreList({ rows, navigate }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((b, i) => (
        <li key={b.id}>
          <button
            onClick={() => navigate(`/branches/${b.id}`)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-ink-50"
          >
            <span className="w-5 text-xs font-semibold text-ink-400">{i + 1}</span>
            <span className="flex-1 truncate font-medium text-ink-800">{b.name}</span>
            <HealthBadge band={b.band} score={b.healthScore} />
          </button>
        </li>
      ))}
    </ul>
  );
}
