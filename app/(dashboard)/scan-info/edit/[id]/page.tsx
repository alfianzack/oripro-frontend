'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { scanInfoApi, ScanInfo, CreateScanInfoData, UpdateScanInfoData } from '@/lib/api'
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
          <span>Loading scan info...</span>
        </div>
      </div>
    )
  }

  if (!scanInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Scan info not found</h2>
          <p className="text-muted-foreground mt-2">
            The scan info you are looking for was not found or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardBreadcrumb title="Edit Scan Info" text={`Edit Scan Info: ${scanInfo.code}`} />
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/scan-info">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <CardTitle>Edit Scan Info: {scanInfo.code}</CardTitle>
            </div>
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
    </>
  )
}

