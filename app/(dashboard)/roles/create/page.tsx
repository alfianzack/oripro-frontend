'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateRoleData, UpdateRoleData, rolesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, ShieldCheck, Plus } from 'lucide-react'
import RoleForm from '@/components/forms/role-form'
import toast from 'react-hot-toast'

export default function CreateRolePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateRoleData | UpdateRoleData) => {
    setLoading(true)
    try {
      // Form always sends required fields, so we can safely cast
      // menuPermissions is sent by form but not in TypeScript type definition
      const response = await rolesApi.createRole(data as any)
      
      if (response.success && response.data) {
        toast.success('Role berhasil dibuat')
        router.push('/roles')
      } else {
        toast.error(response.error || 'Gagal membuat role')
      }
    } catch (error) {
      console.error('Create role error:', error)
      toast.error('Terjadi kesalahan saat membuat role')
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
            <BreadcrumbLink href="/roles" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Roles
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Role Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Role Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan role baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Buat Role</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleForm 
            onSubmit={handleSubmit} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
