'use client'

import React, { useState, useEffect } from 'react'
import { Task } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, Clock, CheckCircle2, QrCode, Building2, User } from 'lucide-react'

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function TaskDetailDialog({
  open,
  onOpenChange,
  task
}: TaskDetailDialogProps) {
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

  if (!task || !open) return null

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
              Task: {task.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Task details
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
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={task.is_main_task ? 'default' : 'outline'}>
                {task.is_main_task ? 'Main Task' : 'Sub Task'}
              </Badge>
              {task.is_need_validation && (
                <Badge variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Requires Validation
                </Badge>
              )}
              {task.is_scan && (
                <Badge variant="default">
                  <QrCode className="h-3 w-3 mr-1" />
                  Requires Scan
                </Badge>
              )}
              <Badge variant={task.is_all_times ? 'default' : 'outline'}>
                {task.is_all_times ? 'All Times' : 'Scheduled'}
              </Badge>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm font-medium">{task.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Duration
                    </label>
                    <p className="text-sm font-medium">{task.duration} minutes</p>
                  </div>
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

            {/* Asset and Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Asset & Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Asset
                    </label>
                    <p className="text-sm font-medium">{task.asset?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Role
                    </label>
                    <p className="text-sm font-medium">{task.role?.name || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Group */}
            {task.task_group && (
              <Card>
                <CardHeader>
                  <CardTitle>Task Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Task Group Name
                    </label>
                    <p className="text-sm font-medium">{task.task_group.name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parent Tasks */}
            {task.parent_task && (
              <Card>
                <CardHeader>
                  <CardTitle>Parent Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Parent Task Name
                    </label>
                    <p className="text-sm font-medium">{task.parent_task.name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Days */}
            {!task.is_all_times && task.days && task.days.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Days of Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.days.map((day) => (
                      <Badge key={day} variant="outline">
                        {DAYS_OF_WEEK[day]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Times */}
            {!task.is_all_times && task.times && task.times.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Scheduled Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.times.map((time, index) => (
                      <Badge key={index} variant="outline">
                        {time}
                      </Badge>
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
                  Date Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created
                    </label>
                    <p className="text-sm font-medium">{formatDate(task.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Updated
                    </label>
                    <p className="text-sm font-medium">{formatDate(task.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

