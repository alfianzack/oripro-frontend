'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Role, UpdateRoleData, rolesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, ShieldCheck, Edit, Loader2 } from 'lucide-react'
import RoleForm from '@/components/forms/role-form'
import toast from 'react-hot-toast'

export default function EditRolePage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const loadRole = async () => {
      if (!roleId) return
      
      try {
        const response = await rolesApi.getRole(roleId)
        
        if (response.success && response.data) {
          setRole(response.data)
        } else {
          toast.error(response.error || 'Role tidak ditemukan')
          router.push('/roles')
        }
      } catch (error) {
        console.error('Load role error:', error)
        toast.error('Terjadi kesalahan saat memuat data role')
        router.push('/roles')
      } finally {
        setInitialLoading(false)
      }
    }

    loadRole()
  }, [roleId, router])

  const handleSubmit = async (data: UpdateRoleData) => {
    setLoading(true)
    try {
      const response = await rolesApi.updateRole(roleId, data)
      
      if (response.success && response.data) {
        toast.success('Role berhasil diperbarui')
        router.push('/roles')
      } else {
        toast.error(response.error || 'Gagal memperbarui role')
      }
    } catch (error) {
      console.error('Update role error:', error)
      toast.error('Terjadi kesalahan saat memperbarui role')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data role...</span>
        </div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Role tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Role yang Anda cari tidak ditemukan atau telah dihapus.
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
            <BreadcrumbLink href="/roles" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Roles
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit: {role.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
          <p className="text-muted-foreground">
            Perbarui informasi role: <span className="font-medium">{role.name}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Role</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleForm 
            role={role} 
            onSubmit={handleSubmit} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
