'use client'

import React, { useState, useEffect } from 'react'
import { TaskGroup, taskGroupsApi } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Edit, Trash2, Eye, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface TaskGroupsTableProps {
  taskGroups: TaskGroup[]
  onEdit: (taskGroup: TaskGroup) => void
  onView: (taskGroup: TaskGroup) => void
  onRefresh: () => void
  loading?: boolean
}

export default function TaskGroupsTable({ 
  taskGroups, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false 
}: TaskGroupsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskGroupToDelete, setTaskGroupToDelete] = useState<TaskGroup | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteClick = (taskGroup: TaskGroup) => {
    setTaskGroupToDelete(taskGroup)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskGroupToDelete) return

    setDeleting(true)
    try {
      const response = await taskGroupsApi.deleteTaskGroup(taskGroupToDelete.id)
      
      if (response.success) {
        toast.success('Task group deleted successfully')
        onRefresh()
      } else {
        toast.error(response.error || 'Failed to delete task group')
      }
    } catch (error) {
      console.error('Delete task group error:', error)
      toast.error('An error occurred while deleting task group')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setTaskGroupToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No task groups found
                </TableCell>
              </TableRow>
            ) : (
              taskGroups.map((taskGroup, index) => {
                const isLast = index === taskGroups.length - 1;
                return (
                <TableRow key={taskGroup.id}>
                  <TableCell className="font-medium">{String(index + 1)}</TableCell>
                  <TableCell className="font-medium">
                    {taskGroup.name || '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {taskGroup.description || '-'}
                  </TableCell>
                  <TableCell>{taskGroup.start_time}</TableCell>
                  <TableCell>{taskGroup.end_time}</TableCell>
                  <TableCell>
                    <Badge variant={taskGroup.is_active ? 'default' : 'secondary'}>
                      {taskGroup.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(taskGroup.created_at)}
                  </TableCell>
                  <TableCell
                      className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${isLast ? "rounded-bl-lg" : ""
                          }`}
                  >
                      <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onView(taskGroup)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                              <Eye className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(taskGroup)} className="rounded-[50%] text-green-600 bg-green-600/10">
                              <Edit className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(taskGroup)} className="rounded-[50%] text-red-500 bg-red-500/10">
                              <Trash2 className="w-5 h-5" />
                          </Button>
                      </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete task group <strong>{taskGroupToDelete?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

