'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { complaintReportsApi, CreateComplaintReportData, UpdateComplaintReportData } from '@/lib/api'
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
import ComplaintReportForm from '@/components/forms/complaint-report-form'

export default function CreateComplaintReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateComplaintReportData | UpdateComplaintReportData) => {
    setLoading(true)
    try {
      const response = await complaintReportsApi.createComplaintReport(data as CreateComplaintReportData)
      
      if (response.success) {
        toast.success('Findings and issues created successfully')
        router.push('/complaint-reports')
      } else {
        toast.error(response.error || 'Failed to create findings and issues')
      }
    } catch (error) {
      console.error('Create findings and issues error:', error)
      toast.error('An error occurred while creating findings and issues')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/complaint-reports')
  }

  return (
    <>
      <DashboardBreadcrumb title="Create Findings and Issues" text="Create Findings and Issues" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/complaint-reports">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>Create New Findings and Issues</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <ComplaintReportForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}

