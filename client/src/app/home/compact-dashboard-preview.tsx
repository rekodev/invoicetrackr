import DashboardMetricGrid from './dashboard-metric-grid';
import RevenuePanelPreview from './revenue-panel-preview';

export default function CompactDashboardPreview() {
  return (
    <div className="mt-5 space-y-4">
      <DashboardMetricGrid />
      <RevenuePanelPreview />
    </div>
  );
}
