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
import { dashboardApi, DashboardData, DashboardStats, assetsApi, unitsApi, tenantsApi, Asset, Tenant } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Building2, Warehouse, Home, FileText } from "lucide-react"
import AssetCarousel from "./components/asset-carousel"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [assetsData, setAssetsData] = useState<{ total: number; totalArea: number; warehouseCount: number } | null>(null)
  const [availableUnits, setAvailableUnits] = useState<number>(0)
  const [occupiedUnits, setOccupiedUnits] = useState<number>(0)
  const [totalUnits, setTotalUnits] = useState<number>(0)
  const [activeContracts, setActiveContracts] = useState<number>(0)
  const [averageContractPerYear, setAverageContractPerYear] = useState<string>('Rp 0')

  useEffect(() => {
    loadDashboardData()
    loadStats()
    loadAssetsData()
    loadAvailableUnits()
  }, [])

  // Load contract stats when stats are available
  useEffect(() => {
    if (stats) {
      loadContractStats()
    }
  }, [stats])

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

  const loadContractStats = async (statsData?: DashboardStats) => {
    try {
      const currentStats = statsData || stats
      
      // Load all tenants
      const tenantsResponse = await tenantsApi.getTenants({ limit: 10000 })
      if (!tenantsResponse.success || !tenantsResponse.data) {
        return
      }

      const responseData = tenantsResponse.data as any
      const tenantsList: Tenant[] = Array.isArray(responseData.data) 
        ? responseData.data 
        : (Array.isArray(responseData) ? responseData : [])

      // Calculate active contracts (contract_end_at > now)
      const now = new Date()
      const activeTenants = tenantsList.filter(tenant => {
        if (!tenant.contract_end_at) return false
        const endDate = new Date(tenant.contract_end_at)
        return endDate > now
      })

      setActiveContracts(activeTenants.length)

      // Calculate average contract per year
      // Rata-rata kontrak/tahun = Total Revenue / Jumlah Kontrak Aktif
      if (currentStats?.totalRevenue?.value && activeTenants.length > 0) {
        const totalRevenue = currentStats.totalRevenue.value
        
        const average = totalRevenue / activeTenants.length
        
        // Format as currency
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(average)
        
        // Shorten format (e.g., Rp 59 Juta instead of Rp 59.000.000)
        const millions = average / 1000000
        if (millions >= 1) {
          setAverageContractPerYear(`Rp${Math.round(millions)}Juta`)
        } else {
          const thousands = average / 1000
          if (thousands >= 1) {
            setAverageContractPerYear(`Rp${Math.round(thousands)}Rb`)
          } else {
            setAverageContractPerYear(formatted.replace('Rp', 'Rp '))
          }
        }
      } else {
        setAverageContractPerYear('Rp 0')
      }
    } catch (err) {
      console.error('Error loading contract stats:', err)
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

      {/* Stats Cards - New Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Side - Revenue and Contract Stats in One Card */}
        <Card className="p-6 shadow-sm">
          {/* Total Revenue Section */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0">
            <CardTitle className="text-base font-medium text-gray-700">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="pb-6 px-0">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalRevenue?.formatted || 'Rp 0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stats?.totalRevenue?.changeType === "positive" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {stats?.totalRevenue?.change || '+0% vs last year'}
              </span>
            </p>
          </CardContent>

          {/* Two Small Cards Below */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
            {/* Total Kontrak Aktif */}
            <div className="text-center">
              <div className="flex flex-row items-center justify-center gap-2 mb-3">
                <CardTitle className="text-xs font-medium text-gray-700">
                  Total Kontrak
                </CardTitle>
                <FileText className="h-3 w-3 text-gray-500" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{activeContracts}</div>
              <p className="text-xs text-green-600 font-medium">
                Aktif
              </p>
            </div>

            {/* Rata-rata Kontrak/Tahun */}
            <div className="text-center">
              <div className="flex flex-row items-center justify-center gap-2 mb-3">
                <CardTitle className="text-xs font-medium text-gray-700">
                  Rata-rata Kontrak/Tahun
                </CardTitle>
                <DollarSign className="h-3 w-3 text-gray-500" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{averageContractPerYear}</div>
              <p className="text-xs text-green-600 font-medium">
                Per kontrak
              </p>
            </div>
          </div>
        </Card>

        {/* Right Side - Asset Carousel */}
        <div>
          <AssetCarousel />
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Asset Table */}
        <div className="lg:col-span-1 h-full">
          <AssetTableCard />
        </div>

        {/* Tenant Kontrak Table */}
        <div className="lg:col-span-3 h-full">
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
