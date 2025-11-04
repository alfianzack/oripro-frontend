'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScanInfo, scanInfoApi, Asset, assetsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, QrCode, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import ScanInfosTable from '@/components/table/scan-infos-table'
import ScanInfoDetailDialog from '@/components/dialogs/scan-info-detail-dialog'
import toast from 'react-hot-toast'

export default function ScanInfoPage() {
  const router = useRouter()
  const [scanInfos, setScanInfos] = useState<ScanInfo[]>([])
  const [filteredScanInfos, setFilteredScanInfos] = useState<ScanInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScanInfo, setSelectedScanInfo] = useState<ScanInfo | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [autoGenerateQR, setAutoGenerateQR] = useState(false)
  
  // Filter states
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('code')
  const [sortOrder, setSortOrder] = useState<string>('asc')
  
  // Options for filters
  const [assets, setAssets] = useState<Asset[]>([])

  const loadScanInfos = async () => {
    setLoading(true)
    try {
      const filterParams: any = {}
      // if (searchTerm.trim()) {
      //   filterParams.code = searchTerm.trim()
      // }
      // if (assetFilter !== 'all') {
      //   filterParams.asset_id = assetFilter
      // }
      // if (sortBy && sortOrder) {
      //   filterParams.order = `${sortBy}_${sortOrder}`
      // }
      
      const response = await scanInfoApi.getScanInfos(filterParams)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        let scanInfosData: ScanInfo[] = []
        
        scanInfosData = responseData.data.scanInfos
        
        setScanInfos(scanInfosData)
        setFilteredScanInfos(scanInfosData)
      } else {
        toast.error(response.error || 'Failed to load scan infos')
        setScanInfos([])
        setFilteredScanInfos([])
      }
    } catch (error) {
      console.error('Load scan infos error:', error)
      toast.error('An error occurred while loading scan infos')
      setScanInfos([])
      setFilteredScanInfos([])
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
    loadScanInfos()
    loadAssets()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    loadScanInfos()
  }, [searchTerm, assetFilter, sortBy, sortOrder])

  const handleEdit = (scanInfo: ScanInfo) => {
    router.push(`/scan-info/edit/${scanInfo.id}`)
  }

  const handleView = (scanInfo: ScanInfo) => {
    setSelectedScanInfo(scanInfo)
    setAutoGenerateQR(false)
    setDetailDialogOpen(true)
  }

  const handleGenerateQRCode = async (scanInfo: ScanInfo) => {
    setSelectedScanInfo(scanInfo)
    setAutoGenerateQR(true)
    setDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadScanInfos()
  }

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
              <QrCode className="h-4 w-4" />
              Scan Info
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scan Info</h1>
          <p className="text-muted-foreground">
            Manage scan information and QR codes
          </p>
        </div>
        <Button onClick={() => router.push('/scan-info/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Scan Info
        </Button>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scan Infos List</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code..."
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
                <SelectItem value="all">All Assets</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
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
                setSortBy('code')
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
                <span>Loading scan infos...</span>
              </div>
            </div>
          ) : (
            <ScanInfosTable
              scanInfos={filteredScanInfos}
              onEdit={handleEdit}
              onView={handleView}
              onGenerateQRCode={handleGenerateQRCode}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ScanInfoDetailDialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open)
          if (!open) {
            setAutoGenerateQR(false)
          }
        }}
        scanInfo={selectedScanInfo}
        autoGenerateQR={autoGenerateQR}
      />
    </div>
  )
}

