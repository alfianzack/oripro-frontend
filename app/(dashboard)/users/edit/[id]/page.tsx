'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { usersApi, User, UpdateUserData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, UsersRound, Edit, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import UserForm from '@/components/forms/user-form'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        console.log('No userId provided')
        return
      }
      
      console.log('Loading user with ID:', userId)
      setLoadingUser(true)
      
      try {
        const response = await usersApi.getUser(userId)
        
        console.log('API Response:', response) // Debug log
        
        if (response.success && response.data) {
          // Handle different response formats
          let userData = response.data
          
          // If data is nested (backend wraps in another data object)
          if (userData && typeof userData === 'object' && 'data' in userData) {
            userData = (userData as any).data
          }
          
          console.log('User data:', userData) // Debug log
          
          if (userData && (userData as any).id) {
            console.log('Setting user data:', userData)
            setUser(userData as User)
          } else {
            console.error('Invalid user data structure:', userData)
            toast.error('Data user tidak valid')
            router.push('/users')
          }
        } else {
          console.error('User not found:', response) // Debug log
          toast.error(response.error || 'User tidak ditemukan')
          router.push('/users')
        }
      } catch (error) {
        console.error('Load user error:', error)
        toast.error('Gagal memuat data user')
        router.push('/users')
      } finally {
        console.log('Setting loadingUser to false')
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [userId, router])

  const handleSubmit = async (data: UpdateUserData) => {
    setLoading(true)
    try {
      console.log('Updating user with data:', data) // Debug log
      const response = await usersApi.updateUser(userId, data)
      console.log('Update response:', response) // Debug log

      if (response.success) {
        toast.success('User berhasil diperbarui')
        router.push('/users')
      } else {
        console.error('Update failed:', response) // Debug log
        toast.error(response.error || 'Gagal memperbarui user')
      }
    } catch (error) {
      console.error('Update user error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/users')
  }

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data user...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">User tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            User yang Anda cari tidak ditemukan atau telah dihapus.
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
            <BreadcrumbLink href="/users" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Users
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit: {user.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">
            Perbarui informasi user: <span className="font-medium">{user.name}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}