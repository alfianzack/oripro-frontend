'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Task, tasksApi, TaskGroup, taskGroupsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Home, GitBranch, Plus, Search, RefreshCw, Loader2, ChevronRight, ChevronDown, Trash2, Edit, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import TaskDetailDialog from '@/components/dialogs/task-detail-dialog'

interface TaskWithChildren extends Task {
  children?: TaskWithChildren[]
  parent_task_ids?: number[]
}

export default function TaskParentsPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [taskGroupFilter, setTaskGroupFilter] = useState<string>('all')
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadTasks = async () => {
    setLoading(true)
    try {
      const response = await tasksApi.getTasks({})
      
      if (response.success && response.data) {
        const responseData = response.data as any
        let tasksData: Task[] = []
        
        if (responseData && typeof responseData === 'object') {
          if (responseData.data && Array.isArray(responseData.data.tasks)) {
            tasksData = responseData.data.tasks
          } else if (Array.isArray(responseData.tasks)) {
            tasksData = responseData.tasks
          } else if (Array.isArray(responseData.data)) {
            tasksData = responseData.data
          } else if (Array.isArray(responseData)) {
            tasksData = responseData
          }
        }
        
        if (!Array.isArray(tasksData)) {
          tasksData = []
        }
        
        // Normalize task data
        tasksData = tasksData.map((task: any) => ({
          ...task,
          id: typeof task.id === 'string' ? parseInt(task.id) : task.id,
          role_id: typeof task.role_id === 'string' ? parseInt(task.role_id) : task.role_id,
          duration: typeof task.duration === 'string' ? parseInt(task.duration) : task.duration,
          task_group_id: task.task_group_id ? (typeof task.task_group_id === 'string' ? parseInt(task.task_group_id) : task.task_group_id) : undefined,
          parent_task_ids: task.parent_task_ids ? (Array.isArray(task.parent_task_ids) ? task.parent_task_ids.map((id: any) => typeof id === 'string' ? parseInt(id) : id) : []) : [],
        }))
        
        setTasks(tasksData)
      } else {
        toast.error(response.error || 'Gagal memuat tasks')
        setTasks([])
      }
    } catch (error) {
      console.error('Load tasks error:', error)
      toast.error('Terjadi kesalahan saat memuat tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const loadTaskGroups = async () => {
    try {
      const response = await taskGroupsApi.getTaskGroups()
      if (response.success && response.data) {
        const responseData = response.data as any
        const taskGroupsData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
        setTaskGroups(taskGroupsData)
      }
    } catch (error) {
      console.error('Load task groups error:', error)
    }
  }

  useEffect(() => {
    loadTasks()
    loadTaskGroups()
  }, [])

  // Build hierarchy from tasks
  const buildHierarchy = (): TaskWithChildren[] => {
    const taskMap = new Map<number, TaskWithChildren>()
    const rootTasks: TaskWithChildren[] = []

    // First pass: create map of all tasks
    tasks.forEach(task => {
      taskMap.set(task.id as number, {
        ...task,
        children: [],
        parent_task_ids: (task.parent_task_ids || []).map((id: any) => typeof id === 'string' ? parseInt(id) : id) as number[]
      })
    })

    // Second pass: build hierarchy
    tasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id as number)!
      const parentIds = (task.parent_task_ids || []).map((id: any) => typeof id === 'string' ? parseInt(id) : id) as number[]
      
      if (parentIds.length === 0) {
        // Root task (no parents)
        rootTasks.push(taskWithChildren)
      } else {
        // Child task - add to each parent's children
        parentIds.forEach(parentId => {
          const parent = taskMap.get(parentId)
          if (parent) {
            if (!parent.children) {
              parent.children = []
            }
            // Avoid duplicates
            if (!parent.children.some(t => t.id === task.id)) {
              parent.children.push(taskWithChildren)
            }
          }
        })
      }
    })

    return rootTasks
  }

  // Filter tasks based on search and filters
  const getFilteredHierarchy = (): TaskWithChildren[] => {
    let filtered = buildHierarchy()

    // Filter by task group
    if (taskGroupFilter !== 'all') {
      const groupId = parseInt(taskGroupFilter)
      filtered = filtered.filter(task => {
        const taskGroupId = typeof task.task_group_id === 'string' ? parseInt(task.task_group_id) : task.task_group_id
        return taskGroupId === groupId
      })
    }

    // Filter by search term (recursive)
    const filterBySearch = (tasks: TaskWithChildren[]): TaskWithChildren[] => {
      return tasks.filter(task => {
        const matchesSearch = searchTerm === '' || 
          task.name.toLowerCase().includes(searchTerm.toLowerCase())
        
        const filteredChildren = task.children ? filterBySearch(task.children) : []
        
        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...task,
            children: filteredChildren
          }
        }
        return false
      }).map(task => ({
        ...task,
        children: task.children ? filterBySearch(task.children) : []
      }))
    }

    if (searchTerm) {
      filtered = filterBySearch(filtered)
    }

    return filtered
  }

  const toggleExpand = (taskId: number) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleManageParents = (task: Task) => {
    setSelectedTask(task)
    const normalizedParentIds = (task.parent_task_ids || []).map((id: any) => typeof id === 'string' ? parseInt(id) : id) as number[]
    setSelectedParentIds(normalizedParentIds)
    setIsManageDialogOpen(true)
  }

  const handleEdit = (task: Task) => {
    router.push(`/tasks/edit/${task.id}`)
  }

  const handleView = (task: Task) => {
    setSelectedTask(task)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return

    setDeleting(true)
    try {
      const response = await tasksApi.deleteTask(taskToDelete.id as number)
      
      if (response.success) {
        toast.success('Task berhasil dihapus')
        setDeleteDialogOpen(false)
        setTaskToDelete(null)
        await loadTasks()
      } else {
        toast.error(response.error || 'Gagal menghapus task')
      }
    } catch (error) {
      console.error('Delete task error:', error)
      toast.error('Terjadi kesalahan saat menghapus task')
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveParents = async () => {
    if (!selectedTask) return

    try {
      setIsSaving(true)
      const response = await tasksApi.updateTask(selectedTask.id as number, {
        parent_task_ids: selectedParentIds
      })

      if (response.success) {
        toast.success('Relasi parent task berhasil diperbarui')
        setIsManageDialogOpen(false)
        setSelectedTask(null)
        await loadTasks()
      } else {
        toast.error(response.error || 'Gagal memperbarui relasi parent task')
      }
    } catch (error) {
      console.error('Error updating parent tasks:', error)
      toast.error('Terjadi kesalahan saat memperbarui relasi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveParent = async (childTaskId: number, parentTaskId: number) => {
    try {
      const childTask = tasks.find(t => t.id === childTaskId)
      if (!childTask) return

      const currentParentIds = (childTask.parent_task_ids || []).map((id: any) => typeof id === 'string' ? parseInt(id) : id) as number[]
      const updatedParentIds = currentParentIds.filter(id => id !== parentTaskId)

      const response = await tasksApi.updateTask(childTaskId as number, {
        parent_task_ids: updatedParentIds
      })

      if (response.success) {
        toast.success('Relasi parent task berhasil dihapus')
        await loadTasks()
      } else {
        toast.error(response.error || 'Gagal menghapus relasi parent task')
      }
    } catch (error) {
      console.error('Error removing parent task:', error)
      toast.error('Terjadi kesalahan saat menghapus relasi')
    }
  }

  const renderTaskTree = (task: TaskWithChildren, level: number = 0) => {
    const hasChildren = task.children && task.children.length > 0
    const isExpanded = expandedTasks.has(task.id as number)
    const taskGroupId = typeof task.task_group_id === 'string' ? parseInt(task.task_group_id) : task.task_group_id
    const taskGroup = taskGroups.find(tg => tg.id === taskGroupId)

    return (
      <div key={task.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(task.id as number)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex-1">
              <div className="font-medium">{task.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                {taskGroup && (
                  <span>Group: {taskGroup.name}</span>
                )}
                <span>Duration: {task.duration} menit</span>
                {task.is_main_task && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                    Main Task
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {task.parent_task_ids && task.parent_task_ids.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {task.parent_task_ids.length} parent{task.parent_task_ids.length > 1 ? 's' : ''}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleView(task)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(task)}
              className="text-green-600 hover:text-green-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManageParents(task)}
            >
              <GitBranch className="h-4 w-4 mr-1" />
              Kelola Parents
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(task)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-gray-200 pl-2">
            {task.children!.map(child => renderTaskTree(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const filteredHierarchy = getFilteredHierarchy()

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
              <GitBranch className="h-4 w-4" />
              Task Parents
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Parents</h1>
          <p className="text-muted-foreground">
            Kelola hierarki relasi parent-child antar tasks
          </p>
        </div>
        <Button onClick={() => router.push('/tasks/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Task Baru
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tasks</CardTitle>
          <CardDescription>
            Hierarki tasks dengan relasi parent-child
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={taskGroupFilter} onValueChange={setTaskGroupFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Task Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Task Group</SelectItem>
                {taskGroups.map((tg) => (
                  <SelectItem key={tg.id} value={tg.id.toString()}>
                    {tg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadTasks}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Memuat tasks...</span>
              </div>
            </div>
          ) : filteredHierarchy.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Tidak ada task ditemukan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHierarchy.map(task => renderTaskTree(task))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Parents Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Parent Tasks: {selectedTask?.name}</DialogTitle>
            <DialogDescription>
              Pilih parent tasks untuk task ini. Task akan menjadi child dari parent yang dipilih.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Parent Tasks</Label>
                <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  {tasks
                    .filter(t => t.id !== selectedTask.id)
                    .map(task => {
                      const taskId = task.id as number
                      const isChecked = selectedParentIds.includes(taskId)
                      
                      return (
                        <div key={task.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`parent-${task.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedParentIds([...selectedParentIds, taskId])
                              } else {
                                setSelectedParentIds(selectedParentIds.filter(id => id !== taskId))
                              }
                            }}
                          />
                          <label
                            htmlFor={`parent-${task.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{task.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {taskGroups.find(tg => tg.id === task.task_group_id)?.name || 'No group'}
                            </div>
                          </label>
                        </div>
                      )
                    })}
                </div>
              </div>

              {selectedParentIds.length > 0 && (
                <div className="space-y-2">
                  <Label>Parent Tasks yang Dipilih:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedParentIds.map(parentId => {
                      const parent = tasks.find(t => t.id === parentId)
                      return parent ? (
                        <span
                          key={parentId}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {parent.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsManageDialogOpen(false)}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveParents}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <TaskDetailDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        task={selectedTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Task</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus task "{taskToDelete?.name}"? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait task ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
