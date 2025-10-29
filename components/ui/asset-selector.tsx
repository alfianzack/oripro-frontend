'use client'

import React, { useState, useEffect } from 'react'
import { Asset, assetsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface AssetSelectorProps {
  selectedAssets: string[]
  onAssetChange: (assetIds: string[]) => void
  maxSelection?: number
  className?: string
}

export default function AssetSelector({
  selectedAssets,
  onAssetChange,
  maxSelection,
  className = ""
}: AssetSelectorProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])

  // Load assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true)
        const response = await assetsApi.getAssets()
        
        if (response.success && response.data) {
          const responseData = response.data as any
          console.log('responseData', responseData)
          const assetsData = Array.isArray(responseData.data) ? responseData.data : []
          setAssets(assetsData)
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

    loadAssets()
  }, [])

  // Filter assets based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAssets(assets)
    } else {
      const filtered = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAssets(filtered)
    }
  }, [assets, searchTerm])

  const toggleAsset = (assetId: string) => {
    if (selectedAssets.includes(assetId)) {
      // Remove asset
      onAssetChange(selectedAssets.filter(id => id !== assetId))
    } else {
      // Add asset (check max selection limit)
      if (maxSelection && selectedAssets.length >= maxSelection) {
        toast.error(`Maksimal ${maxSelection} asset yang dapat dipilih`)
        return
      }
      onAssetChange([...selectedAssets, assetId])
    }
  }

  const getAssetStatus = (asset: Asset) => {
    if (asset.status === 1) return { label: 'Aktif', variant: 'default' as const }
    if (asset.status === 0) return { label: 'Tidak Aktif', variant: 'secondary' as const }
    return { label: 'Unknown', variant: 'outline' as const }
  }

  const getAssetTypeLabel = (assetType: string | number) => {
    console.log('assetType', assetType)
    
    // Handle string asset types from API
    if (typeof assetType === 'string') {
      const stringTypes: Record<string, string> = {
        'ESTATE': 'Estate',
        'OFFICE': 'Office',
        'WAREHOUSE': 'Warehouse',
        'SPORT': 'Sport',
        'ENTERTAINMENTRESTAURANT': 'Entertainment/Restaurant',
        'RESIDENCE': 'Residence',
        'MALL': 'Mall',
        'SUPPORTFACILITYMOSQUEITAL': 'Support Facility/Mosque',
        'PARKINGLOT': 'Parking Lot'
      }
      return stringTypes[assetType] || assetType
    }
    
    // Handle numeric asset types (fallback)
    const numericTypes: Record<number, string> = {
      1: 'Estate',
      2: 'Office',
      3: 'Warehouse',
      4: 'Sport',
      5: 'Entertainment/Restaurant',
      6: 'Residence',
      7: 'Mall',
      8: 'Support Facility/Mosque',
      9: 'Parking Lot'
    }
    return numericTypes[assetType] || 'Unknown'
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Pilih Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Memuat assets...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pilih Asset</span>
          {maxSelection && (
            <span className="text-sm font-normal text-muted-foreground">
              {selectedAssets.length}/{maxSelection} dipilih
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari asset berdasarkan nama, kode, atau alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchTerm ? 'Tidak ada asset yang sesuai dengan pencarian' : 'Tidak ada asset tersedia'}
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = selectedAssets.includes(asset.id)
              const status = getAssetStatus(asset)
              
              return (
                <div
                  key={asset.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                  }`}
                  onClick={() => toggleAsset(asset.id)}
                >
                  <div className="space-y-2">
                    {/* Asset Name and Code */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {asset.code}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Dipilih
                        </Badge>
                      )}
                    </div>

                    {/* Asset Details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Alamat:</span>
                        <span className="truncate ml-2 max-w-[150px]" title={asset.address}>
                          {asset.address}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Luas:</span>
                        <span>{asset.area} m²</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tipe:</span>
                        <span>{getAssetTypeLabel(asset.asset_type)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Selected Assets Summary */}
        {selectedAssets.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedAssets.length} asset dipilih
              </span>
              <button
                onClick={() => onAssetChange([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Hapus semua
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
