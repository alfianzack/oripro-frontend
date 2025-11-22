'use client'

import React, { useState } from 'react'
import { UserTask } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ChevronRight, Play, Check, CheckCircle2, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface TaskListProps {
  userTasks: UserTask[]
  isLoading?: boolean
  onStartTask: (userTaskId: number) => Promise<void>
  onCompleteTask: (userTask: UserTask) => void
}

export function TaskList({ userTasks, isLoading, onStartTask, onCompleteTask }: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string | number>>(new Set())

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Memuat task...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (userTasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Tidak ada task untuk hari ini</p>
        </CardContent>
      </Card>
    )
  }

  // Filter tasks yang bisa ditampilkan (is_need_validation atau is_scan)
  // Tampilkan main task jika memenuhi kriteria atau punya sub_task yang memenuhi kriteria
  const getDisplayableMainTasks = (tasks: UserTask[]): UserTask[] => {
    return tasks.filter(userTask => {
      const task = userTask.task
      
      // Check if main task itself meets criteria
      if (task && (task.is_need_validation || task.is_scan)) {
        return true
      }
      
      // Check if any sub_user_task meets criteria
      if (userTask.sub_user_task && Array.isArray(userTask.sub_user_task)) {
        return userTask.sub_user_task.some(subTask => {
          const subTaskData = subTask.task
          return subTaskData && (subTaskData.is_need_validation || subTaskData.is_scan)
        })
      }
      
      return false
    })
  }

  const displayableMainTasks = getDisplayableMainTasks(userTasks)

  if (displayableMainTasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Tidak ada task yang memerlukan validasi atau scan untuk hari ini
          </p>
        </CardContent>
      </Card>
    )
  }

  const toggleExpand = (taskId: string | number) => {
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

  const getSubTasks = (userTask: UserTask): UserTask[] => {
    if (!userTask.sub_user_task || !Array.isArray(userTask.sub_user_task)) {
      return []
    }
    
    return userTask.sub_user_task.filter(subTask => {
      const subTaskData = subTask.task
      return subTaskData && (subTaskData.is_need_validation || subTaskData.is_scan)
    })
  }

  const getStatusBadge = (userTask: UserTask) => {
    const isPending = userTask.status === 'pending' && !userTask.started_at && !userTask.start_at
    const isInProgress = (userTask.status === 'in_progress' || userTask.status === 'inprogress') && 
                         (userTask.started_at || userTask.start_at) && 
                         !userTask.completed_at
    const isCompleted = userTask.status === 'completed' || userTask.completed_at

    if (isCompleted) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    }
    if (isInProgress) {
      return (
        <Badge variant="default" className="bg-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          Sedang Dikerjakan
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const handleStartTaskInline = async (userTask: UserTask) => {
    const userTaskId = userTask.user_task_id || userTask.id
    if (!userTaskId) {
      toast.error('User task ID tidak ditemukan')
      return
    }
    try {
      await onStartTask(Number(userTaskId))
    } catch (error) {
      console.error('Error starting task:', error)
    }
  }

  const getTaskActions = (userTask: UserTask) => {
    const task = userTask.task
    if (!task) return null

    const isPending = userTask.status === 'pending' && !userTask.started_at && !userTask.start_at
    const hasStarted = !!(userTask.started_at || userTask.start_at)
    const isCompleted = userTask.status === 'completed' || userTask.completed_at
    const isInProgress = hasStarted && !isCompleted

    const canStart = isPending && (task.is_need_validation || task.is_scan)
    const canComplete = hasStarted && !isCompleted

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {canStart && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleStartTaskInline(userTask)
            }}
            size="sm"
            className="flex items-center gap-1 min-h-[36px] px-3"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Start</span>
          </Button>
        )}
        
        {canComplete && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onCompleteTask(userTask)
            }}
            size="sm"
            className="flex items-center gap-1 min-h-[36px] px-3"
          >
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Complete</span>
          </Button>
        )}

        {!canStart && !canComplete && getStatusBadge(userTask)}
      </div>
    )
  }

  // Mobile card view
  const renderMobileCard = (userTask: UserTask, isSubTask = false, parentTask?: UserTask) => {
    const task = userTask.task
    if (!task) return null

    const taskId = userTask.user_task_id || userTask.id || userTask.task_id
    const subTasks = getSubTasks(userTask)
    const hasSubTasks = subTasks.length > 0
    const isExpanded = expandedTasks.has(taskId)
    const shouldShowMainTask = task.is_need_validation || task.is_scan

    if (isSubTask && !shouldShowMainTask) return null

    const handleCardClick = (e: React.MouseEvent) => {
      // Don't trigger card click if clicking on buttons or expand button
      const target = e.target as HTMLElement
      if (target.closest('button')) {
        return
      }
      
      // If task has child tasks, expand/collapse them
      if (hasSubTasks) {
        toggleExpand(taskId)
        return
      }
      
      // Otherwise, handle task actions
      const isPending = userTask.status === 'pending' && !userTask.started_at && !userTask.start_at
      const hasStarted = !!(userTask.started_at || userTask.start_at)
      const isCompleted = userTask.status === 'completed' || userTask.completed_at
      const isInProgress = hasStarted && !isCompleted
      const canComplete = hasStarted && !isCompleted

      if (canComplete) {
        onCompleteTask(userTask)
      } else if (isPending && (task.is_need_validation || task.is_scan)) {
        handleStartTaskInline(userTask)
      }
    }

    return (
      <div key={taskId}>
        <button
          onClick={handleCardClick}
          className={`w-full text-left border rounded-lg p-4 space-y-3 transition-colors hover:bg-muted/50 active:bg-muted ${isSubTask ? 'ml-4 bg-muted/30' : 'bg-card'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {hasSubTasks && !isSubTask && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(taskId)
                    }}
                    className="flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                )}
                {isSubTask && (
                  <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 flex-shrink-0"></div>
                )}
                <h3 className="font-medium text-sm md:text-base truncate">{task.name}</h3>
                {shouldShowMainTask && (
                  <div 
                    className="flex-shrink-0 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  >
                    {getTaskActions(userTask)}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground overflow-x-auto">
                {task.is_main_task && (
                  <>
                    <span className="whitespace-nowrap">{task.duration} menit</span>
                    {task.asset?.name && <span>•</span>}
                  </>
                )}
                {!task.is_main_task && task.asset?.name && (
                  <span>•</span>
                )}
                {task.asset?.name && (
                  <span className="truncate whitespace-nowrap">{task.asset.name}</span>
                )}
              </div>
            </div>
          </div>
        </button>
        {hasSubTasks && isExpanded && !isSubTask && (
          <div className="mt-2 space-y-2">
            {subTasks.map((subTask) => renderMobileCard(subTask, true, userTask))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Main_task or Child_task</TableHead>
                <TableHead>Asset_name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayableMainTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Tidak ada task yang memerlukan validasi atau scan untuk hari ini
                  </TableCell>
                </TableRow>
              ) : (
                displayableMainTasks.map((userTask) => {
                  const task = userTask.task
                  if (!task) return null

                  const taskId = userTask.user_task_id || userTask.id || userTask.task_id
                  const subTasks = getSubTasks(userTask)
                  const hasSubTasks = subTasks.length > 0
                  const isExpanded = expandedTasks.has(taskId)
                  const shouldShowMainTask = task.is_need_validation || task.is_scan
                  const shouldShowMainTaskRow = shouldShowMainTask || hasSubTasks

                  if (!shouldShowMainTaskRow) return null

                  return (
                    <React.Fragment key={taskId}>
                      {/* Main Task Row */}
                      <TableRow className={isExpanded && hasSubTasks ? 'bg-muted/50' : ''}>
                        <TableCell>
                          {hasSubTasks ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(taskId)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{task.name}</span>
                            {task.is_main_task && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {task.duration} menit
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={task.is_main_task ? 'default' : 'outline'}>
                            {task.is_main_task ? 'Main Task' : 'Child Task'}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.asset?.name || '-'}</TableCell>
                        <TableCell>
                          {shouldShowMainTask ? getTaskActions(userTask) : '-'}
                        </TableCell>
                      </TableRow>

                      {/* Sub Tasks Rows */}
                      {hasSubTasks && isExpanded && subTasks.map((subTask) => {
                        const subTaskId = subTask.user_task_id || subTask.id || subTask.task_id
                        const subTaskData = subTask.task
                        
                        if (!subTaskData) return null

                        return (
                          <TableRow key={subTaskId} className="bg-muted/30">
                            <TableCell>
                              <div className="w-8 flex items-center justify-center">
                                <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium pl-8">
                              {subTaskData.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant={subTaskData.is_main_task ? 'default' : 'outline'}>
                                {subTaskData.is_main_task ? 'Main Task' : 'Child Task'}
                              </Badge>
                            </TableCell>
                            <TableCell>{subTaskData.asset?.name || '-'}</TableCell>
                            <TableCell>
                              {getTaskActions(subTask)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </React.Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-3 overflow-x-hidden">
          {displayableMainTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Tidak ada task yang memerlukan validasi atau scan untuk hari ini
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
              {displayableMainTasks.map((userTask) => renderMobileCard(userTask))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
