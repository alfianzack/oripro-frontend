'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Unit, unitsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, Building2, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import UnitsTable from '@/components/table/units-table'
import UnitDetailDialog from '@/components/dialogs/unit-detail-dialog'
import toast from 'react-hot-toast'

export default function UnitsPage() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const loadUnits = async () => {
    setLoading(true)
    try {
      const response = await unitsApi.getUnits()
      
      if (response.success && response.data) {
        setUnits(response.data)
        setFilteredUnits(response.data)
      } else {
        toast.error(response.error || 'Gagal memuat data units')
      }
    } catch (error) {
      console.error('Load units error:', error)
      toast.error('Terjadi kesalahan saat memuat data units')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnits()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = units.filter(unit =>
        unit.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUnits(filtered)
    } else {
      setFilteredUnits(units)
    }
  }, [searchTerm, units])

  const handleEdit = (unit: Unit) => {
    router.push(`/unit/edit/${unit.id}`)
  }

  const handleView = (unit: Unit) => {
    setSelectedUnit(unit)
    setDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadUnits()
  }

  const getStats = () => {
    const total = units.length
    const withToilet = units.filter(unit => unit.is_toilet_exist).length
    const withoutToilet = units.filter(unit => !unit.is_toilet_exist).length
    const avgRentPrice = units.length > 0 ? Math.round(units.reduce((sum, unit) => sum + unit.rent_price, 0) / units.length) : 0
    const totalArea = units.reduce((sum, unit) => sum + unit.size, 0)

    return { total, withToilet, withoutToilet, avgRentPrice, totalArea }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Units
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Kelola unit dan ruang sewa
          </p>
        </div>
        <Button onClick={() => router.push('/unit/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Unit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua unit terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dengan Toilet</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withToilet}</div>
            <p className="text-xs text-muted-foreground">
              Unit dengan toilet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tanpa Toilet</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withoutToilet}</div>
            <p className="text-xs text-muted-foreground">
              Unit tanpa toilet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Harga Sewa Rata-rata</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.avgRentPrice.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per bulan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Luas</CardTitle>
            <div className="h-4 w-4 rounded-full bg-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArea.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              m²
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Units</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Memuat data units...</span>
              </div>
            </div>
          ) : (
            <UnitsTable
              units={filteredUnits}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <UnitDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        unit={selectedUnit}
      />
    </div>
  )
}
