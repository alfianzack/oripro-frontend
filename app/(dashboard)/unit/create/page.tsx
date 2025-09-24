'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateUnitData, unitsApi } from '@/lib/api'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import UnitForm from '@/components/forms/unit-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function CreateUnitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateUnitData) => {
    setLoading(true)
    try {
      const response = await unitsApi.createUnit(data)
      
      if (response.success) {
        toast.success('Unit berhasil dibuat')
        router.push('/unit')
      } else {
        toast.error(response.error || 'Gagal membuat unit')
      }
    } catch (error) {
      console.error('Create unit error:', error)
      toast.error('Terjadi kesalahan saat membuat unit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DashboardBreadcrumb 
        title="Buat Unit Baru" 
        text="Buat Unit Baru" 
      />

      <Card className="card h-full !p-0 !block border-0 overflow-hidden mb-6">
        <CardHeader className="border-b border-neutral-200 dark:border-slate-600 !py-4 px-6">
          <CardTitle className="text-lg font-semibold">
            Formulir Unit Baru
          </CardTitle>
        </CardHeader>

        <CardContent className="card-body p-6">
          <UnitForm
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}