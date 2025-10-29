'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Tenant, Unit } from '@/lib/api'

interface TenantStatsCardsProps {
  tenants: Tenant[]
  units: Unit[]
}

export default function TenantStatsCards({ tenants, units }: TenantStatsCardsProps) {
  const getContractStatus = (tenant: Tenant) => {
    const now = new Date()
    const endDate = new Date(tenant.contract_end_at)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return 'expired'
    } else if (diffDays <= 30) {
      return 'expiring'
    } else {
      return 'active'
    }
  }

  const getStats = () => {
    const totalTenants = tenants.length
    const activeContracts = tenants.filter(tenant => getContractStatus(tenant) === 'active').length
    const expiringContracts = tenants.filter(tenant => getContractStatus(tenant) === 'expiring').length
    const expiredContracts = tenants.filter(tenant => getContractStatus(tenant) === 'expired').length

    const totalUnits = units.length
    const rentedUnits = tenants.length // Assuming each tenant has one unit
    const availableUnits = totalUnits - rentedUnits

    const totalRevenue = tenants.reduce((sum, tenant) => {
      const unit = units.find(u => u.id === tenant.unit?.id)
      return sum + (unit?.rent_price || 0)
    }, 0)

    const avgRevenue = totalTenants > 0 ? totalRevenue / totalTenants : 0

    return {
      totalTenants,
      activeContracts,
      expiringContracts,
      expiredContracts,
      totalUnits,
      rentedUnits,
      availableUnits,
      totalRevenue,
      avgRevenue
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const stats = getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTenants}</div>
          <p className="text-xs text-muted-foreground">
            Semua tenant terdaftar
          </p>
        </CardContent>
      </Card>

      {/* Active Contracts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kontrak Aktif</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activeContracts}</div>
          <p className="text-xs text-muted-foreground">
            Kontrak masih berlaku
          </p>
        </CardContent>
      </Card>

      {/* Expiring Contracts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Akan Kadaluarsa</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.expiringContracts}</div>
          <p className="text-xs text-muted-foreground">
            Kadaluarsa dalam 30 hari
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Per bulan
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function UnitStatsCards({ tenants, units }: TenantStatsCardsProps) {
  const getStats = () => {
    const totalUnits = units.length
    const rentedUnits = tenants.length // Assuming each tenant has one unit
    const availableUnits = totalUnits - rentedUnits

    const totalRevenue = tenants.reduce((sum, tenant) => {
      const unit = units.find(u => u.id === tenant.unit?.id)
      return sum + (unit?.rent_price || 0)
    }, 0)

    const avgRevenue = tenants.length > 0 ? totalRevenue / tenants.length : 0

    return {
      totalUnits,
      rentedUnits,
      availableUnits,
      totalRevenue,
      avgRevenue
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const stats = getStats()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUnits}</div>
          <p className="text-xs text-muted-foreground">
            Semua unit tersedia
          </p>
        </CardContent>
      </Card>

      {/* Rented Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unit Disewa</CardTitle>
          <div className="h-4 w-4 rounded-full bg-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rentedUnits}</div>
          <p className="text-xs text-muted-foreground">
            Sedang disewa
          </p>
        </CardContent>
      </Card>

      {/* Available Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unit Tersedia</CardTitle>
          <div className="h-4 w-4 rounded-full bg-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.availableUnits}</div>
          <p className="text-xs text-muted-foreground">
            Belum disewa
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
