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
import { Edit, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaginationInfo {
  total: number
  limit: number
  offset: number
}

interface TaskGroupsTableProps {
  taskGroups: TaskGroup[]
  onEdit: (taskGroup: TaskGroup) => void
  onView: (taskGroup: TaskGroup) => void
  onRefresh: () => void
  loading?: boolean
  pagination?: PaginationInfo
  onPageChange?: (offset: number) => void
}

export default function TaskGroupsTable({ 
  taskGroups, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false,
  pagination,
  onPageChange
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

  const handlePageChange = (newOffset: number) => {
    if (onPageChange && pagination) {
      onPageChange(newOffset)
    }
  }

  const getCurrentPage = () => {
    if (!pagination) return 1
    return Math.floor(pagination.offset / pagination.limit) + 1
  }

  const getTotalPages = () => {
    if (!pagination) return 1
    return Math.ceil(pagination.total / pagination.limit)
  }

  const getPageStart = () => {
    if (!pagination) return 0
    return pagination.offset + 1
  }

  const getPageEnd = () => {
    if (!pagination) return taskGroups.length
    return Math.min(pagination.offset + pagination.limit, pagination.total)
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
              <TableHead>Updated</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No task groups found
                </TableCell>
              </TableRow>
            ) : (
              taskGroups.map((taskGroup, index) => {
                const isLast = index === taskGroups.length - 1;
                const displayNumber = pagination ? pagination.offset + index + 1 : index + 1;
                return (
                <TableRow key={taskGroup.id}>
                  <TableCell className="font-medium">{String(displayNumber)}</TableCell>
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
                    {taskGroup.created_at ? formatDate(taskGroup.created_at) : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {taskGroup.updated_at ? formatDate(taskGroup.updated_at) : '-'}
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

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {getPageStart()} - {getPageEnd()} dari {pagination.total} task group
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(0)}
              disabled={pagination.offset === 0 || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0 || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = getTotalPages()
                const currentPage = getCurrentPage()
                const pageNumbers: number[] = []
                
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i)
                  }
                } else if (currentPage <= 3) {
                  for (let i = 1; i <= 5; i++) {
                    pageNumbers.push(i)
                  }
                } else if (currentPage >= totalPages - 2) {
                  for (let i = totalPages - 4; i <= totalPages; i++) {
                    pageNumbers.push(i)
                  }
                } else {
                  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pageNumbers.push(i)
                  }
                }
                
                return pageNumbers.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                    disabled={loading}
                    className="h-9 w-9 p-0"
                  >
                    {pageNum}
                  </Button>
                ))
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(
                (getTotalPages() - 1) * pagination.limit,
                pagination.offset + pagination.limit
              ))}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((getTotalPages() - 1) * pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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

