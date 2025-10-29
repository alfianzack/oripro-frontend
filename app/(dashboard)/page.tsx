'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Building, Package, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import AttendanceWidget from '@/components/attendance/attendance-widget'
import { api, assetsApi } from '@/lib/api'

interface Asset {
  id: string
  name: string
  code: string
  latitude: number
  longitude: number
  address: string
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load assets for attendance
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await assetsApi.getAssets()
        if (response.success && response.data) {
          setAssets(response.data)
          if (response.data.length > 0) {
            setSelectedAsset(response.data[0])
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di sistem manajemen aset ONEPROX
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assets
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Units
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +5 dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +1 dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 125.000.000</div>
            <p className="text-xs text-muted-foreground">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kelola aset perusahaan Anda
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/asset">
                  Lihat Assets
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/asset/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Asset
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kelola unit-unit dalam aset
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/unit">
                  Lihat Units
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/unit/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Unit
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kelola pengguna sistem
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/users">
                  Lihat Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/users/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Memuat data assets...</p>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Tidak ada assets tersedia</p>
          <Button asChild>
            <Link href="/asset/create">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Asset Pertama
            </Link>
          </Button>
        </div>
      ) : selectedAsset ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Absensi</h2>
            <p className="text-muted-foreground mb-6">
              Absensi dengan radius 200 meter dari asset
            </p>
            
            {/* Asset Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Pilih Asset:</label>
              <select
                value={selectedAsset.id}
                onChange={(e) => {
                  const asset = assets.find(a => a.id === e.target.value)
                  if (asset) setSelectedAsset(asset)
                }}
                className="w-full p-2 border rounded-md"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} - {asset.code}
                  </option>
                ))}
              </select>
            </div>

            <AttendanceWidget
              assetId={parseInt(selectedAsset.id)}
              assetName={selectedAsset.name}
              assetLatitude={selectedAsset.latitude}
              assetLongitude={selectedAsset.longitude}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Informasi Asset</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {selectedAsset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Kode:</span>
                  <p className="text-sm text-muted-foreground">{selectedAsset.code}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Alamat:</span>
                  <p className="text-sm text-muted-foreground">{selectedAsset.address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Koordinat:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedAsset.latitude}, {selectedAsset.longitude}
                  </p>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href={`/asset/${selectedAsset.id}`}>
                    Lihat Detail Asset
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
