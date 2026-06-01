import { PageHeader } from "../components/Layout";
import { Card, SectionHeader } from "../components/ui";

function Toggle({ on }) {
  return (
    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-brand-600" : "bg-ink-200"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </span>
  );
}

function Row({ label, desc, control }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-ink-900">{label}</div>
        {desc && <div className="text-xs muted">{desc}</div>}
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Workspace and account preferences" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader title="Organization" />
          <div className="divide-y divide-ink-50">
            <Row label="Organization" desc="Sejong Korean Language Schools" control={<span className="text-sm muted">HQ — Seoul</span>} />
            <Row label="Default Region" control={<span className="text-sm font-medium text-ink-800">All Regions</span>} />
            <Row label="Default Date Range" control={<span className="text-sm font-medium text-ink-800">Last 30 days</span>} />
            <Row label="Language" control={<span className="text-sm font-medium text-ink-800">English</span>} />
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Notifications" />
          <div className="divide-y divide-ink-50">
            <Row label="Critical Alerts" desc="Email when a branch turns critical" control={<Toggle on />} />
            <Row label="Weekly Digest" desc="Monday morning summary" control={<Toggle on />} />
            <Row label="LMS Adoption Drops" desc="Notify on >10% weekly drop" control={<Toggle on />} />
            <Row label="Marketing Updates" control={<Toggle on={false} />} />
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Health Score Weights" subtitle="Used to compute branch health" />
          <div className="divide-y divide-ink-50">
            <Row label="Attendance Rate" control={<span className="font-semibold text-ink-800">30%</span>} />
            <Row label="LMS Activity" control={<span className="font-semibold text-ink-800">25%</span>} />
            <Row label="Course Completion" control={<span className="font-semibold text-ink-800">20%</span>} />
            <Row label="Teacher Engagement" control={<span className="font-semibold text-ink-800">15%</span>} />
            <Row label="Student Growth" control={<span className="font-semibold text-ink-800">10%</span>} />
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Account" />
          <div className="divide-y divide-ink-50">
            <Row label="Name" control={<span className="text-sm font-medium text-ink-800">HQ Admin</span>} />
            <Row label="Role" control={<span className="pill bg-brand-50 text-brand-700">HQ Executive</span>} />
            <Row label="Two-Factor Auth" desc="Extra security on login" control={<Toggle on />} />
          </div>
          <button className="mt-3 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Sign out
          </button>
        </Card>
      </div>
    </>
  );
}
