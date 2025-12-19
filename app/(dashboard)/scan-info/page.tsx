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
  const [order, setOrder] = useState<string>('newest')
  
  // Pagination states
  const [limit] = useState<number>(10)
  const [offset, setOffset] = useState<number>(0)
  const [pagination, setPagination] = useState<{ total: number; limit: number; offset: number } | undefined>(undefined)
  
  // Options for filters
  const [assets, setAssets] = useState<Asset[]>([])

  const loadScanInfos = async () => {
    setLoading(true)
    try {
      const filterParams: any = {
        limit,
        offset
      }
      if (searchTerm.trim()) {
        filterParams.scan_code = searchTerm.trim()
      }
      if (assetFilter !== 'all') {
        filterParams.asset_id = assetFilter
      }
      if (order) {
        filterParams.order = order
      }
      
      const response = await scanInfoApi.getScanInfos(filterParams)
      
      if (response.success && response.data) {
        // Handle new nested structure: response.data.data contains the array - sama seperti asset
        const responseData = response.data as any
        let scanInfosData: ScanInfo[] = []
        
        // Handle different response structures - sama seperti asset
        if (responseData && typeof responseData === 'object') {
          if (responseData.data && Array.isArray(responseData.data.scanInfos)) {
            // Format nested: { data: { scanInfos: [...], total: ... } }
            scanInfosData = responseData.data.scanInfos
          } else if (Array.isArray(responseData.scanInfos)) {
            // Format langsung: { scanInfos: [...], total: ... }
            scanInfosData = responseData.scanInfos
          } else if (Array.isArray(responseData.data)) {
            scanInfosData = responseData.data
          } else if (Array.isArray(responseData)) {
            scanInfosData = responseData
          }
        }
        
        if (!Array.isArray(scanInfosData)) {
          scanInfosData = []
        }
        
        // Extract pagination from response
        // Backend now returns pagination in response.pagination (via createResponse with is_list=true)
        let paginationData: { total: number; limit: number; offset: number } | undefined = undefined
        
        // Check response.pagination first (from ApiClient - backend now includes this via createResponse)
        if (response.pagination) {
          paginationData = {
            total: response.pagination.total || 0,
            limit: response.pagination.limit || limit,
            offset: response.pagination.offset || offset
          }
        }
        // Fallback: Check responseData directly (if backend returns { scanInfos, total, limit, offset } in data)
        else if (responseData && typeof responseData === 'object' && responseData.total !== undefined) {
          paginationData = {
            total: responseData.total || 0,
            limit: responseData.limit || limit,
            offset: responseData.offset || offset
          }
        }
        // Fallback: Check responseData.data for nested structure
        else if (responseData.data && typeof responseData.data === 'object' && responseData.data.total !== undefined) {
          paginationData = {
            total: responseData.data.total || 0,
            limit: responseData.data.limit || limit,
            offset: responseData.data.offset || offset
          }
        }
        // Fallback: Check responseData.pagination
        else if (responseData.pagination) {
          paginationData = {
            total: responseData.pagination.total || 0,
            limit: responseData.pagination.limit || limit,
            offset: responseData.pagination.offset || offset
          }
        }
        
        setScanInfos(scanInfosData)
        setFilteredScanInfos(scanInfosData)
        setPagination(paginationData)
      } else {
        toast.error(response.error || 'Failed to load scan infos')
        setScanInfos([])
        setFilteredScanInfos([])
        setPagination(undefined)
      }
    } catch (error) {
      console.error('Load scan infos error:', error)
      toast.error('An error occurred while loading scan infos')
      setScanInfos([])
      setFilteredScanInfos([])
      setPagination(undefined)
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

  // Reset to first page when filters change
  useEffect(() => {
    setOffset(0)
  }, [searchTerm, assetFilter, order])

  // Reload data when filters or pagination change
  useEffect(() => {
    loadScanInfos()
  }, [searchTerm, assetFilter, order, offset])

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
    setOffset(0)
    loadScanInfos()
  }

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset)
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
                className="pl-8 bg-white"
              />
            </div>
            
            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="w-[150px] bg-white">
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
            
            <Select value={order} onValueChange={setOrder}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="a-z">Kode A-Z</SelectItem>
                <SelectItem value="z-a">Kode Z-A</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setAssetFilter('all')
                setOrder('newest')
                setOffset(0)
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
              pagination={pagination}
              onPageChange={handlePageChange}
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

