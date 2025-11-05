'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { taskGroupsApi, CreateTaskGroupData, UpdateTaskGroupData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
import TaskGroupForm from '@/components/forms/task-group-form'

export default function CreateTaskGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateTaskGroupData | UpdateTaskGroupData) => {
    setLoading(true)
    try {
      const response = await taskGroupsApi.createTaskGroup(data as CreateTaskGroupData)
      
      if (response.success) {
        toast.success('Task group created successfully')
        router.push('/task_group')
      } else {
        toast.error(response.error || 'Failed to create task group')
      }
    } catch (error) {
      console.error('Create task group error:', error)
      toast.error('An error occurred while creating task group')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/task_group')
  }

  return (
    <>
      <DashboardBreadcrumb title="Create Task Group" text="Create Task Group" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/task-groups">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>Create New Task Group</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <TaskGroupForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}

