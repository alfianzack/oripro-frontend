'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateUnitData, UpdateUnitData, unitsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Building2, Home, Menu, Plus } from 'lucide-react'
import UnitForm from '@/components/forms/unit-form'
import toast from 'react-hot-toast'

export default function CreateUnitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateUnitData | UpdateUnitData) => {
    setLoading(true)
    try {
      // Form always sends required fields for create, so we can safely cast
      const response = await unitsApi.createUnit(data as CreateUnitData)
      
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
            <BreadcrumbLink href="/unit" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Unit
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Unit Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Unit Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan unit baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <UnitForm onSubmit={handleSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}