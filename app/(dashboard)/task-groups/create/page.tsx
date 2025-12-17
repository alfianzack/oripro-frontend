'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { taskGroupsApi, CreateTaskGroupData, UpdateTaskGroupData } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, StickyNote, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
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
        router.push('/task-groups')
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
    router.push('/task-groups')
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
              <Plus className="h-4 w-4" />
              Buat Task Group Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Task Group Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan task group baru ke sistem dengan informasi lengkap
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Task Group</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskGroupForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

