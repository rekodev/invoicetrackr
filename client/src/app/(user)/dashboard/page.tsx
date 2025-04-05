import { Suspense } from "react";

import { auth } from "@/auth";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import LatestInvoices from "@/components/dashboard/latest-invoices";
import RevenueChart from "@/components/dashboard/revenue-chart";
import {
  DashboardCardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from "@/components/ui/skeletons";

const DashboardPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);

  return (
    <main className="flex flex-col gap-12">
      <Suspense fallback={<DashboardCardsSkeleton />}>
        <DashboardCards userId={userId} currency={session.user.currency} />
      </Suspense>
      <section className="flex flex-col lg:flex-row gap-12 lg:gap-6">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart userId={userId} />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices userId={userId} currency={session.user.currency} />
        </Suspense>
      </section>
    </main>
  );
};

export default DashboardPage;
