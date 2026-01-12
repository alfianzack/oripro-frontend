'use client'

import React, { useState, useEffect } from 'react'
import { UserTask } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, Clock, Building2, CheckCircle2, XCircle, Play, User } from 'lucide-react'

interface WorkerTaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userTask: UserTask | null
}

export default function WorkerTaskDetailDialog({
  open,
  onOpenChange,
  userTask
}: WorkerTaskDetailDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!userTask || !open) return null

  const formatDate = (dateString: string | undefined | null) => {
    if (!mounted) return 'Loading...'
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string | undefined | null) => {
    if (!mounted) return 'Loading...'
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusBadge = () => {
    const isPending = userTask.status === 'pending' && !userTask.started_at && !userTask.start_at
    const isInProgress = (userTask.status === 'in_progress' || userTask.status === 'inprogress') && 
                         (userTask.started_at || userTask.start_at) && 
                         !userTask.completed_at
    const isCompleted = userTask.status === 'completed' || userTask.completed_at

    if (isCompleted) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    }
    if (isInProgress) {
      return (
        <Badge variant="default" className="bg-blue-600">
          <Play className="h-3 w-3 mr-1" />
          Sedang Dikerjakan
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const task = userTask.task

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Detail Task Pekerja
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {task?.name || 'Task Detail'}
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
            {/* Task Information */}
            {task && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nama Task
                      </label>
                      <p className="text-sm font-medium">{task.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tipe Task
                      </label>
                      <div className="mt-1">
                        <Badge variant={task.is_main_task ? 'default' : 'outline'}>
                          {task.is_main_task ? 'Main Task' : 'Child Task'}
                        </Badge>
                      </div>
                    </div>
                    {task.duration && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Durasi
                        </label>
                        <p className="text-sm font-medium">{task.duration} menit</p>
                      </div>
                    )}
                    {task.scan_code && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Scan Code
                        </label>
                        <p className="text-sm font-medium">{task.scan_code}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge()}
                    </div>
                  </div>
                  {userTask.scheduled_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Jadwal
                      </label>
                      <p className="text-sm font-medium">{formatDate(userTask.scheduled_at)}</p>
                    </div>
                  )}
                  {userTask.time && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Waktu
                      </label>
                      <p className="text-sm font-medium">{userTask.time}</p>
                    </div>
                  )}
                  {(userTask.started_at || userTask.start_at) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Dimulai Pada
                      </label>
                      <p className="text-sm font-medium">
                        {formatDate(userTask.started_at || userTask.start_at || null)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(userTask.started_at || userTask.start_at || null)}
                      </p>
                    </div>
                  )}
                  {userTask.completed_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Selesai Pada
                      </label>
                      <p className="text-sm font-medium">{formatDate(userTask.completed_at)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(userTask.completed_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Asset & Location */}
            {task?.asset && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Lokasi & Asset
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Asset
                      </label>
                      <p className="text-sm font-medium">{task.asset.name}</p>
                      {task.asset.code && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Code: {task.asset.code}
                        </p>
                      )}
                    </div>
                    {task.asset.address && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Alamat
                        </label>
                        <p className="text-sm">{task.asset.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Information */}
            {userTask.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pekerja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nama
                      </label>
                      <p className="text-sm font-medium">{userTask.user.name}</p>
                    </div>
                    {userTask.user.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-sm font-medium">{userTask.user.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {userTask.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{userTask.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Evidence */}
            {userTask.evidences && userTask.evidences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bukti Pengerjaan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userTask.evidences.map((evidence: any, index: number) => (
                      <div key={index} className="space-y-2">
                        {evidence.photo_url && (
                          <img
                            src={evidence.photo_url}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        {evidence.notes && (
                          <p className="text-xs text-muted-foreground">{evidence.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informasi Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTask.created_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Dibuat
                      </label>
                      <p className="text-sm font-medium">{formatDate(userTask.created_at)}</p>
                    </div>
                  )}
                  {userTask.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Diupdate
                      </label>
                      <p className="text-sm font-medium">{formatDate(userTask.updated_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

