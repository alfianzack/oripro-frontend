import type { Metadata } from "next";
import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import NftPromoBanner from "@/app/(dashboard)/(homes)/nft/components/nft-promo-banner";
import TrendingBidWidgets from "./components/trending-bid-widgets";
import TrendingNftCard from "./components/trending-nft-card";
import RecentBidCard from "./components/recent-bid-card";
import EthPriceCard from "./components/eth-price-card";
import StatisticsCard from "./components/statistics-card";
import FeaturedCreatorsCard from "./components/featured-creators-card";
import TopCreatorsCard from "./components/top-creators-card";

const metadata: Metadata = {
    title: "LMS Dashboard | WowDash Admin Panel",
    description:
        "Manage courses, track student progress, and analyze learning outcomes with the LMS Dashboard in WowDash Admin Template built using Next.js and Tailwind.",
};

const InvestmentPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Dashboard" text="NFT & Gaming" />

            <div className="gap-6 grid grid-cols-1 2xl:grid-cols-12">
                <div className="col-span-12 2xl:col-span-8">
                    <div className="gap-6 grid grid-cols-1 sm:grid-cols-12">
                        <div className="col-span-12">
                            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                                <NftPromoBanner />
                            </Suspense>
                        </div>

                        <div className="col-span-12">
                            <TrendingBidWidgets />
                        </div>

                        <div className="col-span-12">
                            <TrendingNftCard />
                        </div>

                        <div className="col-span-12">
                            <RecentBidCard />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 2xl:col-span-4">
                    <div className="gap-6 grid grid-cols-1 sm:grid-cols-12">
                        <div className="col-span-12 md:col-span-6 2xl:col-span-12">
                            <EthPriceCard />
                        </div>
                        <div className="col-span-12 md:col-span-6 2xl:col-span-12">
                            <StatisticsCard />
                        </div>
                        <div className="col-span-12 md:col-span-6 2xl:col-span-12">
                            <FeaturedCreatorsCard />
                        </div>
                        <div className="col-span-12 md:col-span-6 2xl:col-span-12">
                            <TopCreatorsCard />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default InvestmentPage;
