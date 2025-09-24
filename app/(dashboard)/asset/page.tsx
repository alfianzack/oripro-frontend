'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Asset, assetsApi, ASSET_TYPE_LABELS } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, Boxes, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import AssetsTable from '@/components/table/assets-table'
import AssetDetailDialog from '@/components/dialogs/asset-detail-dialog'
import toast from 'react-hot-toast'

export default function AssetsPage() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const loadAssets = async () => {
    setLoading(true)
    try {
      const response = await assetsApi.getAssets()
      
      if (response.success && response.data) {
        setAssets(response.data)
        setFilteredAssets(response.data)
      } else {
        toast.error(response.error || 'Gagal memuat data assets')
      }
    } catch (error) {
      console.error('Load assets error:', error)
      toast.error('Terjadi kesalahan saat memuat data assets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAssets(filtered)
    } else {
      setFilteredAssets(assets)
    }
  }, [searchTerm, assets])

  const handleEdit = (asset: Asset) => {
    router.push(`/asset/edit/${asset.id}`)
  }

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset)
    setDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadAssets()
  }

  const getStats = () => {
    const total = assets.length
    const estate = assets.filter(asset => asset.asset_type === 1).length
    const office = assets.filter(asset => asset.asset_type === 2).length
    const warehouse = assets.filter(asset => asset.asset_type === 3).length
    const residence = assets.filter(asset => asset.asset_type === 6).length
    const mall = assets.filter(asset => asset.asset_type === 7).length
    const other = assets.filter(asset => ![1, 2, 3, 6, 7].includes(asset.asset_type)).length

    return { total, estate, office, warehouse, residence, mall, other }
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
              <Boxes className="h-4 w-4" />
              Assets
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Kelola data aset dan properti
          </p>
        </div>
        <Button onClick={() => router.push('/asset/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua aset terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estate</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estate}</div>
            <p className="text-xs text-muted-foreground">
              Properti Estate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Office</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.office}</div>
            <p className="text-xs text-muted-foreground">
              Gedung Kantor
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouse</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warehouse}</div>
            <p className="text-xs text-muted-foreground">
              Gudang
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residence</CardTitle>
            <div className="h-4 w-4 rounded-full bg-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.residence}</div>
            <p className="text-xs text-muted-foreground">
              Perumahan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mall</CardTitle>
            <div className="h-4 w-4 rounded-full bg-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mall}</div>
            <p className="text-xs text-muted-foreground">
              Pusat Perbelanjaan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lainnya</CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.other}</div>
            <p className="text-xs text-muted-foreground">
              Jenis Lain
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Assets</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari asset..."
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
                <span>Memuat data assets...</span>
              </div>
            </div>
          ) : (
            <AssetsTable
              assets={filteredAssets}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <AssetDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        asset={selectedAsset}
      />
    </div>
  )
}
