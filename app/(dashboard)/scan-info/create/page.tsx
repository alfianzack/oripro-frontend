'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanInfoApi, CreateScanInfoData, UpdateScanInfoData } from '@/lib/api'
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
    <>
      <DashboardBreadcrumb title="Create Scan Info" text="Create Scan Info" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/scan-info">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>Create New Scan Info</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <ScanInfoForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}

