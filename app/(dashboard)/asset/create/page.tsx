'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assetsApi, CreateAssetData, UpdateAssetData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
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
    <>
      <DashboardBreadcrumb title="Create Asset" text="Create Asset" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/asset">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>Buat Asset Baru</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <AssetForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}