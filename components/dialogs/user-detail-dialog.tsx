'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Mail, Calendar, Shield, User as UserIcon, History, X } from 'lucide-react'
import Link from 'next/link'
import UserLogsTable from '@/components/table/user-logs-table'

interface UserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export default function UserDetailDialog({ open, onOpenChange, user }: UserDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!user || !open) return null

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Detail User: {user.name || user.email}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Informasi lengkap dan riwayat aktivitas user
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(user.role?.name)}>
                  {user.role?.name || 'No Role'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Level {user.role?.level || 0}
                </span>
              </div>
              <Button asChild>
                <Link href={`/users/edit/${user.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </Link>
              </Button>
            </div>

            {/* Custom Tabs */}
            <div className="w-full">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Informasi User
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  History Aktivitas
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* User Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Informasi User
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              Phone
                            </label>
                            <p className="text-sm font-medium">{user.phone || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Gender
                            </label>
                            <p className="text-sm font-medium">
                              {user.gender === 'male' ? 'Laki-laki' : user.gender === 'female' ? 'Perempuan' : '-'}
                            </p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <p className="text-sm font-mono text-xs bg-muted p-2 rounded break-all">
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
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          History Aktivitas User
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <UserLogsTable userId={user.id} loading={false} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
