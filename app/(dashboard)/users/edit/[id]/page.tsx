'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { usersApi, User, UpdateUserData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
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

  console.log('Render state:', { loadingUser, user: !!user, userId })

  if (loadingUser) {
    console.log('Showing loading state')
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
    console.log('Showing user not found state')
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
    <>
      <DashboardBreadcrumb title="Edit User" text={`Edit User: ${user.name}`} />
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/users">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle>Edit User: {user.name}</CardTitle>
                <CardDescription>
                  Perbarui informasi user
                </CardDescription>
              </div>
            </div>
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
    </>
  )
}