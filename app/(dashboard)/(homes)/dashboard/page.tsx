import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import SalesStaticCard from "@/app/(dashboard)/(homes)/dashboard/components/sales-static-card";
import TotalSubscriberCard from "@/app/(dashboard)/(homes)/dashboard/components/total-subscriber-card";
import UserOverviewCard from "@/app/(dashboard)/(homes)/dashboard/components/user-overview-card";
import TabsWithTableCard from "@/app/(dashboard)/(homes)/dashboard/components/tabs-with-table-card";
import TopPerformerCard from "@/app/(dashboard)/(homes)/dashboard/components/top-performer-card";
import GenerateContentCard from "@/app/(dashboard)/(homes)/dashboard/components/generate-content-card";
import TopCountriesCard from "@/app/(dashboard)/(homes)/dashboard/components/top-countries-card";
import LoadingSkeleton from "@/components/loading-skeleton";
import DetailBreadcrumb from "@/components/layout/detail-breadcrumb";

const metadata: Metadata = {
  title: "AI Dashboard | WowDash Admin Panel",
  description:
    "Explore AI analytics, monitor model performance, and track intelligent automation workflows in the AI Dashboard of WowDash Admin Template.",
};


export default async function DashboardPage() {
  return (
    <>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
          <StatCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <SalesStaticCard />
          </Suspense>
        </div>

        <div className="xl:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TotalSubscriberCard />
          </Suspense>
        </div>

        <div className="xl:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <UserOverviewCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-9">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TabsWithTableCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TopPerformerCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TopCountriesCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <GenerateContentCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
