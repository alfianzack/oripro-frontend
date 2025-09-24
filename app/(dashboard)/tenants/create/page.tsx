'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateTenantData, tenantsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, Users, Plus } from 'lucide-react'
import TenantForm from '@/components/forms/tenant-form'
import toast from 'react-hot-toast'

export default function CreateTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateTenantData) => {
    setLoading(true)
    try {
      const response = await tenantsApi.createTenant(data)
      
      if (response.success && response.data) {
        toast.success('Tenant berhasil dibuat')
        router.push('/tenants')
      } else {
        toast.error(response.error || 'Gagal membuat tenant')
      }
    } catch (error) {
      console.error('Create tenant error:', error)
      toast.error('Terjadi kesalahan saat membuat tenant')
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
            <BreadcrumbLink href="/tenants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tenants
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Tenant Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Tenant Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan tenant baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <TenantForm onSubmit={handleSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
