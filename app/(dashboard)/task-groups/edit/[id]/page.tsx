'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { taskGroupsApi, TaskGroup, CreateTaskGroupData, UpdateTaskGroupData } from '@/lib/api'
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
          <span>Loading task group...</span>
        </div>
      </div>
    )
  }

  if (!taskGroup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Task group not found</h2>
          <p className="text-muted-foreground mt-2">
            The task group you are looking for was not found or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardBreadcrumb title="Edit Task Group" text={`Edit Task Group: ${taskGroup.name}`} />
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/task-groups">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <CardTitle>Edit Task Group: {taskGroup.name}</CardTitle>
            </div>
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
    </>
  )
}

