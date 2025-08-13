import type { Metadata } from "next";
import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import StatsCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/stats-card";
import CoinAnalyticsCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/coin-analytics-card";
import MarketInfoCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/market-info-card";
import MyOrderCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/my-order-card";
import RecentTransactionCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/recent-transaction-card";
import UsersActivateCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/users-activate-card";
import TotalBalanceCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/total-balance-card";
import MasterCard from "@/app/(dashboard)/(homes)/cryptocurrency/components/master-card";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";

const metadata: Metadata = {
  title: "Cryptocurrency Dashboard | WowDash Admin Panel",
  description:
    "Track real-time crypto prices, wallet balances, and market trends with the Cryptocurrency Dashboard in WowDash Admin Template.",
};


const Cryptocurrency = () => {
  return (
    <>
      <DashboardBreadcrumb title="Dashboard" text="Cryptocurrecy" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
          <StatsCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-12 2xl:col-span-8">
          <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
            <div className="col-span-12">
              <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                <CoinAnalyticsCard />
              </Suspense>
            </div>

            <div className="col-span-12 2xl:col-span-6">
              <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                <MarketInfoCard />
              </Suspense>
            </div>

            <div className="col-span-12 2xl:col-span-6">
              <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                <MyOrderCard />
              </Suspense>
            </div>

            <div className="col-span-12">
              <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                <RecentTransactionCard />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="xl:col-span-12 2xl:col-span-4">
          <div className="space-y-6">
            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
              <MasterCard />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
              <TotalBalanceCard />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
              <UsersActivateCard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cryptocurrency;
