'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { tasksApi, Task, CreateTaskData, UpdateTaskData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, StickyNote, Edit, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import TaskForm from '@/components/forms/task-form'

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = parseInt(params.id as string)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId || isNaN(taskId)) return
      
      setInitialLoading(true)
      try {
        const response = await tasksApi.getTask(taskId)
        console.log('Task API Response:', response)
        
        if (response.success && response.data) {
          const responseData = response.data as any
          const taskData = responseData.data || responseData
          
          // Normalize task data - convert string IDs to numbers where needed
          const normalizedTask: Task = {
            ...taskData,
            id: typeof taskData.id === 'string' ? parseInt(taskData.id) : taskData.id,
            role_id: typeof taskData.role_id === 'string' ? parseInt(taskData.role_id) : taskData.role_id,
            duration: typeof taskData.duration === 'string' ? parseInt(taskData.duration) : taskData.duration,
            task_group_id: taskData.task_group_id ? (typeof taskData.task_group_id === 'string' ? parseInt(taskData.task_group_id) : taskData.task_group_id) : undefined,
            parent_task_id: taskData.parent_task_id ? (typeof taskData.parent_task_id === 'string' ? parseInt(taskData.parent_task_id) : taskData.parent_task_id) : undefined,
            parent_task_ids: taskData.parent_task_ids ? taskData.parent_task_ids.map((id: any) => typeof id === 'string' ? parseInt(id) : id) : undefined,
          }
          
          console.log('Normalized task:', normalizedTask)
          setTask(normalizedTask)
        } else {
          toast.error(response.error || 'Failed to load task')
          router.push('/tasks')
        }
      } catch (error) {
        console.error('Load task error:', error)
        toast.error('An error occurred while loading task')
        router.push('/tasks')
      } finally {
        setInitialLoading(false)
      }
    }

    loadTask()
  }, [taskId, router])

  const handleSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    console.log('EditTaskPage handleSubmit called with:', data)
    setLoading(true)
    try {
      const response = await tasksApi.updateTask(taskId, data as UpdateTaskData)
      console.log('Update task response:', response)
      
      if (response.success) {
        toast.success('Task updated successfully')
        router.push('/task-parents')
      } else {
        toast.error(response.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Update task error:', error)
      toast.error('An error occurred while updating task')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/task-parents')
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data task...</span>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Task tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Task yang Anda cari tidak ditemukan atau telah dihapus.
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
            <BreadcrumbLink href="/task-parents" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Task
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit: {task.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
          <p className="text-muted-foreground">
            Perbarui informasi task: <span className="font-medium">{task.name}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            task={task}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

