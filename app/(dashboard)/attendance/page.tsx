'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, MapPin, Loader2 } from 'lucide-react'
import AttendanceWidget from '@/components/attendance/attendance-widget'
import AttendanceCard from '@/components/attendance/attendance-card'
import AttendanceHistoryTable from '@/components/attendance/attendance-history-table'
import { assetsApi } from '@/lib/api'

interface Asset {
  id: string
  name: string
  code: string
  latitude: number
  longitude: number
  address: string
}

export default function AttendancePage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'auto' | 'manual'>('auto')

  // Load assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true)
        const response = await assetsApi.getAssets()
        
        if (response.success && response.data) {
          const responseData = response.data as any
          const assetsData = Array.isArray(responseData.data) ? responseData.data : responseData
          console.log('assetsData', assetsData)
          setAssets(assetsData)
          
          // Set first asset as default if available
          if (assetsData.length > 0) {
            setSelectedAsset(assetsData[0])
          }
        }
      } catch (error) {
        console.error('Error loading assets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Absensi</h1>
          <p className="text-muted-foreground">
            Lakukan absensi masuk dan keluar berdasarkan lokasi asset
          </p>
        </div>
      </div>


      {/* Attendance Content */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Memuat data assets...</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'auto' ? (
        // Auto Detection Mode - menggunakan AttendanceCard
        <div className="space-y-6">
          <div>
            <AttendanceCard />
          </div>
          <AttendanceHistoryTable />
        </div>
      ) : (
        // Manual Selection Mode - menggunakan AttendanceWidget
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Asset Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pilih Asset
              </CardTitle>
              <CardDescription>
                Pilih asset untuk melakukan absensi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Tidak ada assets tersedia</p>
                </div>
              ) : (
                <Select
                  value={selectedAsset?.id || ''}
                  onValueChange={(value) => {
                    const asset = assets.find(a => a.id === value)
                    if (asset) setSelectedAsset(asset)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} - {asset.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Attendance Widget */}
          {selectedAsset && (
            <div className="lg:col-span-2">
              <AttendanceWidget
                assetId={Number(selectedAsset.id)}
                assetName={selectedAsset.name}
                assetLatitude={selectedAsset.latitude}
                assetLongitude={selectedAsset.longitude}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

