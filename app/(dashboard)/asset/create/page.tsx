'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assetsApi, CreateAssetData, UpdateAssetData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, Boxes, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import AssetForm from '@/components/forms/asset-form'

export default function CreateAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateAssetData | UpdateAssetData | FormData) => {
    setLoading(true)
    try {
      const response = await assetsApi.createAsset(data as CreateAssetData | FormData)
      
      if (response.success) {
        toast.success('Asset berhasil dibuat')
        router.push('/asset')
      } else {
        toast.error(response.error || 'Gagal membuat asset')
      }
    } catch (error) {
      console.error('Create asset error:', error)
      toast.error('Terjadi kesalahan saat membuat asset')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/asset')
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
            <BreadcrumbLink href="/asset" className="flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              Asset
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Asset Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Asset Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan asset baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}