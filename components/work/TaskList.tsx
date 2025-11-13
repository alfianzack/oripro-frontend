'use client'

import React, { useState } from 'react'
import { UserTask } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { TaskItem } from './TaskItem'

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

  return (
    <div className="space-y-1.5">
      {displayableMainTasks.map((userTask) => {
        const task = userTask.task
        if (!task) return null

        const taskId = userTask.user_task_id || userTask.id || userTask.task_id
        const subTasks = getSubTasks(userTask)
        const hasSubTasks = subTasks.length > 0
        const isExpanded = expandedTasks.has(taskId)
        const shouldShowMainTask = task.is_need_validation || task.is_scan

        // Only show main task if it meets criteria OR has sub-tasks that meet criteria
        const shouldShowMainTaskCard = shouldShowMainTask || hasSubTasks

        // Get status for visual indicator
        const isPending = userTask.status === 'pending' && !userTask.started_at && !userTask.start_at
        const isInProgress = (userTask.status === 'in_progress' || userTask.status === 'inprogress') && 
                             (userTask.started_at || userTask.start_at) && 
                             !userTask.completed_at
        const isCompleted = userTask.status === 'completed' || userTask.completed_at

        return (
          <div key={taskId} className="space-y-1.5">
            {/* Main Task */}
            {shouldShowMainTaskCard && (
              <div className={`flex items-center gap-2 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-all duration-200 ${
                isCompleted ? 'border-green-200 bg-green-50/30' : 
                isInProgress ? 'border-blue-200 bg-blue-50/30' : 
                'border-gray-200'
              }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {hasSubTasks && (
                    <button
                      onClick={() => toggleExpand(taskId)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  )}
                  {!hasSubTasks && <div className="w-6 flex-shrink-0" />}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{task.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap mt-0.5">
                      <span>Duration: {task.duration} menit</span>
                      {shouldShowMainTask && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Main Task
                        </span>
                      )}
                      {task.is_need_validation && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          Validasi
                        </span>
                      )}
                      {task.is_scan && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                          Scan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {shouldShowMainTask && (
                  <div className="ml-4 flex-shrink-0">
                    <TaskItem
                      userTask={userTask}
                      onStart={onStartTask}
                      onComplete={onCompleteTask}
                      showCard={false}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sub Tasks */}
            {hasSubTasks && isExpanded && (
              <div className="ml-6 border-l-2 border-gray-200 pl-3 space-y-1.5">
                {subTasks.map((subTask) => {
                  const subTaskId = subTask.user_task_id || subTask.id || subTask.task_id
                  const subTaskData = subTask.task
                  
                  if (!subTaskData) return null

                  const subIsPending = subTask.status === 'pending' && !subTask.started_at && !subTask.start_at
                  const subIsInProgress = (subTask.status === 'in_progress' || subTask.status === 'inprogress') && 
                                         (subTask.started_at || subTask.start_at) && 
                                         !subTask.completed_at
                  const subIsCompleted = subTask.status === 'completed' || subTask.completed_at

                  return (
                    <div
                      key={subTaskId}
                      className={`flex items-center gap-2 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-all duration-200 ${
                        subIsCompleted ? 'border-green-200 bg-green-50/30' : 
                        subIsInProgress ? 'border-blue-200 bg-blue-50/30' : 
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{subTaskData.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap mt-0.5">
                          <span>Duration: {subTaskData.duration} menit</span>
                          {subTaskData.is_need_validation && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              Validasi
                            </span>
                          )}
                          {subTaskData.is_scan && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                              Scan
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        <TaskItem
                          userTask={subTask}
                          onStart={onStartTask}
                          onComplete={onCompleteTask}
                          showCard={false}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
