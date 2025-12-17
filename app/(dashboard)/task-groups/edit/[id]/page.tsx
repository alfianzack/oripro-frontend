'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { taskGroupsApi, TaskGroup, CreateTaskGroupData, UpdateTaskGroupData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, StickyNote, Edit, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import TaskGroupForm from '@/components/forms/task-group-form'

export default function EditTaskGroupPage() {
  const router = useRouter()
  const params = useParams()
  const taskGroupId = parseInt(params.id as string)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [taskGroup, setTaskGroup] = useState<TaskGroup | null>(null)

  // Load task group data
  useEffect(() => {
    const loadTaskGroup = async () => {
      if (!taskGroupId || isNaN(taskGroupId)) return
      
      setInitialLoading(true)
      try {
        const response = await taskGroupsApi.getTaskGroup(taskGroupId)
        if (response.success && response.data) {
          const responseData = response.data as any
          setTaskGroup(responseData.data || responseData)
        } else {
          toast.error(response.error || 'Failed to load task group')
          router.push('/task_group')
        }
      } catch (error) {
        console.error('Load task group error:', error)
        toast.error('An error occurred while loading task group')
        router.push('/task_group')
      } finally {
        setInitialLoading(false)
      }
    }

    loadTaskGroup()
  }, [taskGroupId, router])

  const handleSubmit = async (data: CreateTaskGroupData | UpdateTaskGroupData) => {
    setLoading(true)
    try {
      const response = await taskGroupsApi.updateTaskGroup(taskGroupId, data as UpdateTaskGroupData)
      
      if (response.success) {
        toast.success('Task group updated successfully')
        router.push('/task-groups')
      } else {
        toast.error(response.error || 'Failed to update task group')
      }
    } catch (error) {
      console.error('Update task group error:', error)
      toast.error('An error occurred while updating task group')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/task-groups')
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data task group...</span>
        </div>
      </div>
    )
  }

  if (!taskGroup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Task group tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Task group yang Anda cari tidak ditemukan atau telah dihapus.
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
            <BreadcrumbLink href="/task-groups" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Task Group
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit: {taskGroup.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Task Group</h1>
          <p className="text-muted-foreground">
            Perbarui informasi task group: <span className="font-medium">{taskGroup.name}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Task Group</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskGroupForm
            taskGroup={taskGroup}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

