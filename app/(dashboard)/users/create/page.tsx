'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usersApi, CreateUserData, UpdateUserData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
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
    <>
      <DashboardBreadcrumb title="Create User" text="Create User" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <CardTitle>Buat User Baru</CardTitle>
              <CardDescription>
                Tambahkan user baru ke dalam sistem
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}