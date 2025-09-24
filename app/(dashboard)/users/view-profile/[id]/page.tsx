'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, usersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Edit, Mail, Calendar, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"

export default function ViewProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        toast.error('User ID tidak ditemukan')
        router.push('/users')
        return
      }
      
      setLoading(true)
      try {
        const response = await usersApi.getUser(userId)
        
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          toast.error('User tidak ditemukan')
          router.push('/users')
        }
      } catch (error) {
        console.error('Load user error:', error)
        toast.error('Gagal memuat data user')
        router.push('/users')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [userId, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeVariant = (roleName?: string) => {
    switch (roleName?.toLowerCase()) {
      case 'super_admin':
        return 'destructive'
      case 'admin':
        return 'default'
      case 'user':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb title="View Profile" text="View Profile" />
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading user data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <DashboardBreadcrumb title="View Profile" text="View Profile" />
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">User tidak ditemukan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardBreadcrumb title={`View Profile: ${user.name || user.email}`} text="View Profile" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Users
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/users/edit/${user.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informasi User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nama
                </label>
                <p className="text-sm font-medium">{user.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role?.name)}>
                    {user.role?.name || 'No Role'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Level
                </label>
                <p className="text-sm font-medium">{user.role?.level || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Dibuat Pada
                </label>
                <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Diperbarui Pada
                </label>
                <p className="text-sm font-medium">{formatDate(user.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID User
                </label>
                <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID Role
                </label>
                <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                  {user.role_id || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}