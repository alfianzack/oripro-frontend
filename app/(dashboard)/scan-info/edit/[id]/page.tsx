'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { scanInfoApi, ScanInfo, CreateScanInfoData, UpdateScanInfoData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, QrCode, Edit, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ScanInfoForm from '@/components/forms/scan-info-form'

export default function EditScanInfoPage() {
  const router = useRouter()
  const params = useParams()
  const scanInfoId = parseInt(params.id as string)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [scanInfo, setScanInfo] = useState<ScanInfo | null>(null)

  // Load scan info data
  useEffect(() => {
    const loadScanInfo = async () => {
      if (!scanInfoId || isNaN(scanInfoId)) return
      
      setInitialLoading(true)
      try {
        const response = await scanInfoApi.getScanInfo(scanInfoId)
        if (response.success && response.data) {
          const responseData = response.data as any
          setScanInfo(responseData.data || responseData)
        } else {
          toast.error(response.error || 'Failed to load scan info')
          router.push('/scan-info')
        }
      } catch (error) {
        console.error('Load scan info error:', error)
        toast.error('An error occurred while loading scan info')
        router.push('/scan-info')
      } finally {
        setInitialLoading(false)
      }
    }

    loadScanInfo()
  }, [scanInfoId, router])

  const handleSubmit = async (data: CreateScanInfoData | UpdateScanInfoData) => {
    setLoading(true)
    try {
      const response = await scanInfoApi.updateScanInfo(scanInfoId, data as UpdateScanInfoData)
      
      if (response.success) {
        toast.success('Scan info updated successfully')
        router.push('/scan-info')
      } else {
        toast.error(response.error || 'Failed to update scan info')
      }
    } catch (error) {
      console.error('Update scan info error:', error)
      toast.error('An error occurred while updating scan info')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/scan-info')
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data scan info...</span>
        </div>
      </div>
    )
  }

  if (!scanInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Scan info tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Scan info yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
        </div>
      </div>
    )
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
              <Edit className="h-4 w-4" />
              Edit: {scanInfo.scan_code}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Scan Info</h1>
          <p className="text-muted-foreground">
            Perbarui informasi scan info: <span className="font-medium">{scanInfo.scan_code}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Scan Info</CardTitle>
        </CardHeader>
        <CardContent>
          <ScanInfoForm
            scanInfo={scanInfo}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

