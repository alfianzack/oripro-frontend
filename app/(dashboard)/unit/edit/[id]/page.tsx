'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Unit, UpdateUnitData, unitsApi } from '@/lib/api'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import UnitForm from '@/components/forms/unit-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditUnitPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = params.id as string
  
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Load unit data
  useEffect(() => {
    const loadUnit = async () => {
      if (!unitId) return

      try {
        const response = await unitsApi.getUnit(unitId)
        
        if (response.success && response.data) {
          setUnit(response.data)
        } else {
          toast.error(response.error || 'Unit tidak ditemukan')
          router.push('/unit')
        }
      } catch (error) {
        console.error('Load unit error:', error)
        toast.error('Terjadi kesalahan saat memuat data unit')
        router.push('/unit')
      } finally {
        setInitialLoading(false)
      }
    }

    loadUnit()
  }, [unitId, router])

  const handleSubmit = async (data: UpdateUnitData) => {
    setLoading(true)
    try {
      const response = await unitsApi.updateUnit(unitId, data)
      
      if (response.success) {
        toast.success('Unit berhasil diperbarui')
        router.push('/unit')
      } else {
        toast.error(response.error || 'Gagal memperbarui unit')
      }
    } catch (error) {
      console.error('Update unit error:', error)
      toast.error('Terjadi kesalahan saat memperbarui unit')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <>
        <DashboardBreadcrumb 
          title="Edit Unit" 
          text="Edit Unit" 
        />

        <Card className="card h-full !p-0 !block border-0 overflow-hidden mb-6">
          <CardContent className="card-body p-6 flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Memuat data unit...</span>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (!unit) {
    return (
      <>
        <DashboardBreadcrumb 
          title="Edit Unit" 
          text="Edit Unit" 
        />

        <Card className="card h-full !p-0 !block border-0 overflow-hidden mb-6">
          <CardContent className="card-body p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground">Unit tidak ditemukan</p>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <DashboardBreadcrumb 
        title={`Edit Unit: ${unit.name}`} 
        text="Edit Unit" 
      />

      <Card className="card h-full !p-0 !block border-0 overflow-hidden mb-6">
        <CardHeader className="border-b border-neutral-200 dark:border-slate-600 !py-4 px-6">
          <CardTitle className="text-lg font-semibold">
            Edit Unit: {unit.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="card-body p-6">
          <UnitForm
            unit={unit}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}