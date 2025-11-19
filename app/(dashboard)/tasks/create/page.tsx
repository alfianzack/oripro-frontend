'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tasksApi, CreateTaskData, UpdateTaskData } from '@/lib/api'
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
import TaskForm from '@/components/forms/task-form'

export default function CreateTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    setLoading(true)
    try {
      const response = await tasksApi.createTask(data as CreateTaskData)
      
      if (response.success) {
        toast.success('Task created successfully')
        router.push('/task-parents')
      } else {
        toast.error(response.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Create task error:', error)
      toast.error('An error occurred while creating task')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/task-parents')
  }

  return (
    <>
      <DashboardBreadcrumb title="Create Task" text="Create Task" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/tasks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>Create New Task</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  )
}

