'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usersApi, CreateUserData, UpdateUserData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, UsersRound, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import UserForm from '@/components/forms/user-form'

export default function CreateUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateUserData | UpdateUserData) => {
    setLoading(true)
    try {
      const response = await usersApi.createUser(data as CreateUserData)

      if (response.success) {
        toast.success('User berhasil dibuat')
        router.push('/users')
      } else {
        toast.error(response.error || 'Gagal membuat user')
      }
    } catch (error) {
      console.error('Create user error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/users')
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
            <BreadcrumbLink href="/users" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Users
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat User Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat User Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan user baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}