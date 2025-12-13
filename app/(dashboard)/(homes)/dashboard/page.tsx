'use client'

import { useEffect, useState } from 'react'
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import DashboardStatCards from "@/app/(dashboard)/(homes)/dashboard/components/dashboard-stat-cards";
import RevenueGrowthChart from "@/app/(dashboard)/(homes)/dashboard/components/revenue-growth-chart";
import TopAssetRevenueCard from "@/app/(dashboard)/(homes)/dashboard/components/top-asset-revenue-card";
import HandlingKomplain from "@/app/(dashboard)/(homes)/dashboard/components/handling-komplain";
import GrafikKomplain from "@/app/(dashboard)/(homes)/dashboard/components/grafik-komplain";
import TenantKontrak from "@/app/(dashboard)/(homes)/dashboard/components/tenant-kontrak";
import Pekerja from "@/app/(dashboard)/(homes)/dashboard/components/pekerja";
import DailyTaskCompletion from "@/app/(dashboard)/(homes)/dashboard/components/daily-task-completion";
import { dashboardApi, DashboardData } from '@/lib/api'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getDashboardData()
      const responseData = response.data as any;
      const responseDataDashboard = responseData.data as any;
      
      if (responseData) {
        const data: DashboardData = {
          complaints: responseData.complaints || {
            recent: [],
            stats: {
              total: 0,
              pending: 0,
              in_progress: 0,
              resolved: 0,
              closed: 0,
            }
          },
          expiringTenants: responseDataDashboard.expiringTenants || [],
          workers: responseDataDashboard.workers || [],
          dailyTaskCompletion: responseDataDashboard.dailyTaskCompletion || [],
        }
        setDashboardData(data)
      } else {
        setError(response.error || response.message || 'Gagal memuat data dashboard')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data dashboard')
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Safe defaults untuk menghindari undefined errors
  const complaints = dashboardData?.complaints || {
    recent: [],
    stats: {
      total: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    }
  }

  const expiringTenants = dashboardData?.expiringTenants || []
  const workers = dashboardData?.workers || []
  const dailyTaskCompletion = dashboardData?.dailyTaskCompletion || []

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<LoadingSkeleton height="h-96" text="Memuat chart..." />}>
            <RevenueGrowthChart />
          </Suspense>
        </div>

        {/* Top Asset Revenue */}
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<LoadingSkeleton height="h-96" text="Memuat data asset..." />}>
            <TopAssetRevenueCard />
          </Suspense>
        </div>
      </div>

      {/* Dashboard Content - Complaints, Tenants, Workers, Tasks */}
      {loading ? (
        <LoadingSkeleton height="h-96" text="Memuat data dashboard..." />
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Section - Three Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Handling Komplain */}
            <div className="lg:col-span-1 h-full">
              <HandlingKomplain complaints={complaints.recent || []} />
            </div>

            {/* Grafik Komplain */}
            <div className="lg:col-span-1 h-full">
              <GrafikKomplain stats={complaints.stats || {
                total: 0,
                pending: 0,
                in_progress: 0,
                resolved: 0,
                closed: 0,
              }} />
            </div>

            {/* Tenant Kontrak */}
            <div className="lg:col-span-1 h-full">
              <TenantKontrak tenants={expiringTenants} />
            </div>
          </div>

          {/* Bottom Section - Two Rows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pekerja */}
            <div className="lg:col-span-1 h-full">
              <Pekerja workers={workers} />
            </div>

            {/* Daily Task Completion */}
            <div className="lg:col-span-1 h-full">
              <DailyTaskCompletion data={dailyTaskCompletion} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
