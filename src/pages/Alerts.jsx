import { PageHeader } from "../components/Layout";
import { Card } from "../components/ui";
import AlertCard from "../components/AlertCard";
import { ALERTS } from "../data/metrics";

export default function Alerts() {
  const critical = ALERTS.filter((a) => a.severity === "critical");
  const warning = ALERTS.filter((a) => a.severity === "warning");

  return (
    <>
      <PageHeader title="Alerts" subtitle="Operational risks requiring HQ attention" />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Alerts" value={ALERTS.length} />
        <Stat label="Critical" value={critical.length} color="text-bad" />
        <Stat label="Warning" value={warning.length} color="text-warn" />
        <Stat label="Branches Affected" value={ALERTS.reduce((a, x) => a + x.count, 0)} />
      </div>

      <h2 className="mb-2 text-sm font-semibold text-bad">Critical</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {critical.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </div>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-warn">Warning</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {warning.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, color = "text-ink-900" }) {
  return (
    <Card className="p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs muted">{label}</div>
    </Card>
  );
}
