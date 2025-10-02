'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Unit, unitsApi, Asset, assetsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  
  // Filter dan sorting states
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sizeFilter, setSizeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<string>('asc')
  const [assets, setAssets] = useState<Asset[]>([])

  const loadUnits = async () => {
    setLoading(true)
    try {
      // Prepare filter parameters
      const filterParams: any = {}
      if (searchTerm.trim()) {
        filterParams.name = searchTerm.trim()
      }
      if (assetFilter !== 'all') {
        filterParams.asset_id = assetFilter
      }
      if (statusFilter !== 'all') {
        filterParams.is_deleted = statusFilter === 'active' ? false : true
      }
      if (sizeFilter !== 'all') {
        const sizeRange = sizeFilter.split('-')
        if (sizeRange.length === 2) {
          filterParams.size_min = parseInt(sizeRange[0])
          filterParams.size_max = parseInt(sizeRange[1])
        }
      }
      if (sortBy && sortOrder) {
        filterParams.order = `${sortBy}_${sortOrder}`
      }
      
      const response = await unitsApi.getUnits(filterParams)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const unitsData = Array.isArray(responseData.data) ? responseData.data : []
        setUnits(unitsData)
        setFilteredUnits(unitsData)
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

  const loadAssets = async () => {
    try {
      const response = await assetsApi.getAssets()
      if (response.success && response.data) {
        const responseData = response.data as any
        const assetsData = Array.isArray(responseData.data) ? responseData.data : []
        setAssets(assetsData)
      }
    } catch (error) {
      console.error('Load assets error:', error)
    }
  }

  useEffect(() => {
    loadUnits()
    loadAssets()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    loadUnits()
  }, [searchTerm, assetFilter, statusFilter, sizeFilter, sortBy, sortOrder])

  // Remove the old client-side filtering since we're using server-side filtering
  // useEffect(() => {
  //   if (searchTerm.trim()) {
  //     const filtered = units.filter(unit =>
  //       unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //     setFilteredUnits(filtered)
  //   } else {
  //     setFilteredUnits(units)
  //   }
  // }, [searchTerm, units])

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
    if (!Array.isArray(units)) {
      return {
        total: 0,
        withToilet: 0,
        withoutToilet: 0,
        avgRentPrice: 0,
        totalArea: 0
      }
    }
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 hidden">
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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filter Bar - Horizontal Layout */}
          <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Asset</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ukuran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Ukuran</SelectItem>
                <SelectItem value="0-50">0 - 50 m²</SelectItem>
                <SelectItem value="50-100">50 - 100 m²</SelectItem>
                <SelectItem value="100-200">100 - 200 m²</SelectItem>
                <SelectItem value="200-500">200 - 500 m²</SelectItem>
                <SelectItem value="500-1000">500 - 1000 m²</SelectItem>
                <SelectItem value="1000-9999">1000+ m²</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama Unit</SelectItem>
                <SelectItem value="size">Ukuran</SelectItem>
                <SelectItem value="rent_price">Harga Sewa</SelectItem>
                <SelectItem value="created_at">Tanggal Dibuat</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A - Z</SelectItem>
                <SelectItem value="desc">Z - A</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setAssetFilter('all')
                setStatusFilter('all')
                setSizeFilter('all')
                setSortBy('name')
                setSortOrder('asc')
              }}
            >
              Reset
            </Button>
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
