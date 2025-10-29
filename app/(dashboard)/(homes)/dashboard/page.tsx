import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import DashboardStatCards from "@/app/(dashboard)/(homes)/dashboard/components/dashboard-stat-cards";
import RevenueGrowthChart from "@/app/(dashboard)/(homes)/dashboard/components/revenue-growth-chart";
import TopAssetRevenueCard from "@/app/(dashboard)/(homes)/dashboard/components/top-asset-revenue-card";

const metadata: Metadata = {
  title: "Dashboard Overview | Oripro Property Management",
  description:
    "Dashboard overview untuk monitoring revenue, asset, units, dan tenant dalam sistem manajemen properti Oripro.",
};


export default async function DashboardPage() {
  return (
    <>
      {/* Dashboard Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Suspense fallback={<LoadingSkeleton height="h-32" text="Loading..." />}>
          <DashboardStatCards />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSkeleton height="h-96" text="Memuat chart..." />}>
            <RevenueGrowthChart />
          </Suspense>
        </div>

        {/* Top Asset Revenue */}
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSkeleton height="h-96" text="Memuat data asset..." />}>
            <TopAssetRevenueCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
