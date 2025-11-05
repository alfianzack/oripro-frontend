'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TaskGroup, taskGroupsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, FolderTree, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import TaskGroupsTable from '@/components/table/task-groups-table'
import TaskGroupDetailDialog from '@/components/dialogs/task-group-detail-dialog'
import toast from 'react-hot-toast'

export default function TaskGroupsPage() {
  const router = useRouter()
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [filteredTaskGroups, setFilteredTaskGroups] = useState<TaskGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskGroup | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<string>('asc')

  const loadTaskGroups = async () => {
    setLoading(true)
    try {
      const filterParams: any = {}
      if (searchTerm.trim()) {
        filterParams.name = searchTerm.trim()
      }
      if (statusFilter !== 'all') {
        filterParams.is_active = statusFilter === 'active'
      }
      if (sortBy && sortOrder) {
        filterParams.order = `${sortBy}_${sortOrder}`
      }
      
      const response = await taskGroupsApi.getTaskGroups(filterParams)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const taskGroupsData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
        setTaskGroups(taskGroupsData)
        setFilteredTaskGroups(taskGroupsData)
      } else {
        toast.error(response.error || 'Failed to load task groups')
        setTaskGroups([])
        setFilteredTaskGroups([])
      }
    } catch (error) {
      console.error('Load task groups error:', error)
      toast.error('An error occurred while loading task groups')
      setTaskGroups([])
      setFilteredTaskGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTaskGroups()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    loadTaskGroups()
  }, [searchTerm, statusFilter, sortBy, sortOrder])

  const handleEdit = (taskGroup: TaskGroup) => {
    router.push(`/task-groups/edit/${taskGroup.id}`)
  }

  const handleView = (taskGroup: TaskGroup) => {
    setSelectedTaskGroup(taskGroup)
    setDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadTaskGroups()
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
            <BreadcrumbPage className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Task Groups
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Groups</h1>
          <p className="text-muted-foreground">
            Manage task groups and their schedules
          </p>
        </div>
        <Button onClick={() => router.push('/task-groups/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task Group
        </Button>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Groups List</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search task groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="start_time">Start Time</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A - Z</SelectItem>
                <SelectItem value="desc">Z - A</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setSortBy('name')
                setSortOrder('asc')
              }}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading task groups...</span>
              </div>
            </div>
          ) : (
            <TaskGroupsTable
              taskGroups={filteredTaskGroups}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <TaskGroupDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        taskGroup={selectedTaskGroup}
      />
    </div>
  )
}

