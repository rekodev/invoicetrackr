import DashboardMetricGrid from './dashboard-metric-grid';
import LatestInvoicesPanelPreview from './latest-invoices-panel-preview';
import RevenuePanelPreview from './revenue-panel-preview';

export default function DashboardPagePreview() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardMetricGrid />
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <RevenuePanelPreview />
        <LatestInvoicesPanelPreview />
      </div>
    </div>
  );
}
