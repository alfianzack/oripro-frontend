'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { tasksApi, Task, CreateTaskData, UpdateTaskData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
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
        router.push('/tasks')
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
    router.push('/tasks')
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading task...</span>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Task not found</h2>
          <p className="text-muted-foreground mt-2">
            The task you are looking for was not found or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardBreadcrumb title="Edit Task" text={`Edit Task: ${task.name}`} />
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/tasks">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <CardTitle>Edit Task: {task.name}</CardTitle>
            </div>
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
    </>
  )
}

