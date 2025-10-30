'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  FileText,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Tenant, tenantsApi, Unit, unitsApi, Asset, assetsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import TenantStatsCards, { UnitStatsCards } from '@/components/dashboard/tenant-stats-cards'
import ContractInfoCard from '@/components/dashboard/contract-info-card'

interface TenantWithUnit extends Tenant {
  unit?: Unit
  asset?: Asset
}

export default function DashboardTenantPage() {
  const [tenants, setTenants] = useState<TenantWithUnit[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setRefreshing(true)
      
      // Load tenants, units, and assets in parallel
      const [tenantsResponse, unitsResponse, assetsResponse] = await Promise.all([
        tenantsApi.getTenants(),
        unitsApi.getUnits(),
        assetsApi.getAssets()
      ])

      if (tenantsResponse.success && tenantsResponse.data) {
        const tenantsData = Array.isArray(tenantsResponse.data.data) 
          ? tenantsResponse.data.data 
          : Array.isArray(tenantsResponse.data) 
            ? tenantsResponse.data 
            : []
        setTenants(tenantsData)
      }

      if (unitsResponse.success && unitsResponse.data) {
        const unitsData = Array.isArray(unitsResponse.data.data) 
          ? unitsResponse.data.data 
          : Array.isArray(unitsResponse.data) 
            ? unitsResponse.data 
            : []
        setUnits(unitsData)
      }

      if (assetsResponse.success && assetsResponse.data) {
        const assetsData = Array.isArray(assetsResponse.data.data) 
          ? assetsResponse.data.data 
          : Array.isArray(assetsResponse.data) 
            ? assetsResponse.data 
            : []
        setAssets(assetsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data dashboard tenant...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Tenant</h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang unit yang disewa dan kontrak kerjasama
          </p>
        </div>
        <Button onClick={loadData} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <TenantStatsCards tenants={tenants} units={units} />

      {/* Unit Statistics */}
      <UnitStatsCards tenants={tenants} units={units} />

      {/* Contract Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Status Kontrak Kerjasama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Belum ada data tenant</p>
                <Button asChild>
                  <Link href="/tenants/create">
                    Tambah Tenant Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenants.map((tenant) => {
                  const unit = units.find(u => u.id === tenant.unit?.id)
                  const asset = assets.find(a => a.id === unit?.asset_id)
                  
                  return (
                    <ContractInfoCard 
                      key={tenant.id} 
                      tenant={tenant} 
                      unit={unit}
                      asset={asset}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
