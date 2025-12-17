'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanInfoApi, CreateScanInfoData, UpdateScanInfoData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, QrCode, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import ScanInfoForm from '@/components/forms/scan-info-form'

export default function CreateScanInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateScanInfoData | UpdateScanInfoData) => {
    setLoading(true)
    try {
      const response = await scanInfoApi.createScanInfo(data as CreateScanInfoData)
      
      if (response.success) {
        toast.success('Scan info created successfully')
        router.push('/scan-info')
      } else {
        toast.error(response.error || 'Failed to create scan info')
      }
    } catch (error) {
      console.error('Create scan info error:', error)
      toast.error('An error occurred while creating scan info')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/scan-info')
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
            <BreadcrumbLink href="/scan-info" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scan Info
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Scan Info Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Scan Info Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan scan info baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Scan Info</CardTitle>
        </CardHeader>
        <CardContent>
          <ScanInfoForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

