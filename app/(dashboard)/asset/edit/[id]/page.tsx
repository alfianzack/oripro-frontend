'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { assetsApi, Asset, CreateAssetData, UpdateAssetData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
import AssetForm from '@/components/forms/asset-form'
import AssetLogsTable from '@/components/table/asset-logs-table'

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [asset, setAsset] = useState<Asset | null>(null)

  // Load asset data
  useEffect(() => {
    const loadAsset = async () => {
      if (!assetId) return
      
      setInitialLoading(true)
      try {
        const response = await assetsApi.getAsset(assetId)
        if (response.success && response.data) {
          const responseData = response.data as any
          
          setAsset(responseData.data)
        } else {
          toast.error(response.error || 'Gagal memuat data asset')
          router.push('/asset')
        }
      } catch (error) {
        console.error('Load asset error:', error)
        toast.error('Terjadi kesalahan saat memuat data asset')
        router.push('/asset')
      } finally {
        setInitialLoading(false)
      }
    }

    loadAsset()
  }, [assetId, router])

  const handleSubmit = async (data: CreateAssetData | UpdateAssetData | FormData) => {
    setLoading(true)
    try {
      // Convert FormData to UpdateAssetData if needed
      const updateData = data instanceof FormData ? Object.fromEntries(data.entries()) as UpdateAssetData : data as UpdateAssetData
      
      const response = await assetsApi.updateAsset(assetId, updateData)
      
      if (response.success) {
        toast.success('Asset berhasil diperbarui')
        router.push('/asset')
      } else {
        toast.error(response.error || 'Gagal memperbarui asset')
      }
    } catch (error) {
      console.error('Update asset error:', error)
      toast.error('Terjadi kesalahan saat memperbarui asset')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/asset')
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data asset...</span>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Asset tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Asset yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardBreadcrumb title="Edit Asset" text={`Edit Asset: ${asset.name}`} />
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/asset">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <CardTitle>Edit Asset: {asset.name}</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <AssetForm
              asset={asset}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}