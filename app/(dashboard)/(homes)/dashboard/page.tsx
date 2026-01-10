'use client'

import { useEffect, useState } from 'react'
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import DashboardStatCards from "@/app/(dashboard)/(homes)/dashboard/components/dashboard-stat-cards";
import RevenueGrowthChart from "@/app/(dashboard)/(homes)/dashboard/components/revenue-growth-chart";
import TenantPaymentCard from "@/app/(dashboard)/(homes)/dashboard/components/tenant-payment-card";
import HandlingKomplain from "@/app/(dashboard)/(homes)/dashboard/components/handling-komplain";
import GrafikKomplain from "@/app/(dashboard)/(homes)/dashboard/components/grafik-komplain";
import TenantKontrak from "@/app/(dashboard)/(homes)/dashboard/components/tenant-kontrak";
import TenantKontrakTable from "@/app/(dashboard)/(homes)/dashboard/components/tenant-kontrak-table";
import AssetTableCard from "@/app/(dashboard)/(homes)/dashboard/components/asset-table-card";
import TopAssetRevenueCard from "@/app/(dashboard)/(homes)/dashboard/components/top-asset-revenue-card";
import Pekerja from "@/app/(dashboard)/(homes)/dashboard/components/pekerja";
import DailyTaskCompletion from "@/app/(dashboard)/(homes)/dashboard/components/daily-task-completion";
import { dashboardApi, DashboardData, DashboardStats, assetsApi, unitsApi, Asset } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Building2, Warehouse, Home } from "lucide-react"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [assetsData, setAssetsData] = useState<{ total: number; totalArea: number; warehouseCount: number } | null>(null)
  const [availableUnits, setAvailableUnits] = useState<number>(0)
  const [occupiedUnits, setOccupiedUnits] = useState<number>(0)
  const [totalUnits, setTotalUnits] = useState<number>(0)

  useEffect(() => {
    loadDashboardData()
    loadStats()
    loadAssetsData()
    loadAvailableUnits()
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
          monthlyTaskCompletion: responseDataDashboard.monthlyTaskCompletion || [],
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

  const loadStats = async () => {
    try {
      const response = await dashboardApi.getDashboardStats()
      if (response.success && response.data) {
        const responseData = response.data as any;
        const statsData = responseData.data || responseData;
        if (statsData && typeof statsData === 'object' && 'totalRevenue' in statsData) {
          setStats(statsData as DashboardStats)
        }
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
    }
  }

  const loadAssetsData = async () => {
    try {
      const response = await assetsApi.getAssets({ limit: 1000 })
      if (response.success && response.data) {
        const responseData = response.data as any;
        const assets = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
        
        const total = assets.length
        const totalArea = assets.reduce((sum: number, asset: Asset) => {
          const area = typeof asset.area === 'string' ? parseFloat(asset.area) : (typeof asset.area === 'number' ? asset.area : 0)
          return sum + area
        }, 0)
        const warehouseCount = assets.filter((asset: Asset) => {
          // asset_type 3 = warehouse/gudang
          return asset.asset_type === 3 || asset.asset_type === '3' || asset.asset_type === 'warehouse'
        }).length
        
        setAssetsData({ total, totalArea, warehouseCount })
      }
    } catch (err) {
      console.error('Error loading assets data:', err)
    }
  }

  const loadAvailableUnits = async () => {
    try {
      // Get available units (status 0)
      const availableResponse = await unitsApi.getUnits({ status: 0, limit: 1 })
      // Get occupied units (status 1)
      const occupiedResponse = await unitsApi.getUnits({ status: 1, limit: 1 })
      // Get total units
      const totalResponse = await unitsApi.getUnits({ limit: 1 })

      if (availableResponse.success && availableResponse.data) {
        const responseData = availableResponse.data as any;
        if (availableResponse.pagination) {
          setAvailableUnits(availableResponse.pagination.total || 0)
        } else if (responseData.pagination) {
          setAvailableUnits(responseData.pagination.total || 0)
        } else {
          const units = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
          setAvailableUnits(units.length)
        }
      }

      if (occupiedResponse.success && occupiedResponse.data) {
        const responseData = occupiedResponse.data as any;
        if (occupiedResponse.pagination) {
          setOccupiedUnits(occupiedResponse.pagination.total || 0)
        } else if (responseData.pagination) {
          setOccupiedUnits(responseData.pagination.total || 0)
        } else {
          const units = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
          setOccupiedUnits(units.length)
        }
      }

      if (totalResponse.success && totalResponse.data) {
        const responseData = totalResponse.data as any;
        if (totalResponse.pagination) {
          setTotalUnits(totalResponse.pagination.total || 0)
        } else if (responseData.pagination) {
          setTotalUnits(responseData.pagination.total || 0)
        } else {
          const units = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
          setTotalUnits(units.length)
        }
      }
    } catch (err) {
      console.error('Error loading units:', err)
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
  const monthlyTaskCompletion = dashboardData?.monthlyTaskCompletion || []

  return (
    <>
      {/* Dashboard Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Revenue Card */}
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalRevenue?.formatted || 'Rp 0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stats?.totalRevenue?.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                {stats?.totalRevenue?.change || '+0% vs last year'}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Total Asset Peruri Card */}
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Asset Peruri
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{assetsData?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In all area
            </p>
          </CardContent>
        </Card>

        {/* Total Units Card */}
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Units
            </CardTitle>
            <Home className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUnits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {occupiedUnits || 0} Terisi • {availableUnits || 0} Kosong
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<LoadingSkeleton height="h-96" text="Memuat chart..." />}>
            <RevenueGrowthChart />
          </Suspense>
        </div>

        {/* Top Asset Revenue Card */}
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<LoadingSkeleton height="h-96" text="Memuat data asset revenue..." />}>
            <TopAssetRevenueCard />
          </Suspense>
        </div>
      </div>

      {/* Asset and Tenant Kontrak Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Asset Table */}
        <div className="lg:col-span-1 h-full">
          <AssetTableCard />
        </div>

        {/* Tenant Kontrak Table */}
        <div className="lg:col-span-1 h-full">
          <TenantKontrakTable />
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 hidden">
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
              <DailyTaskCompletion data={dailyTaskCompletion} monthlyData={monthlyTaskCompletion} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
