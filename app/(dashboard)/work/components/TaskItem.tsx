'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Clock, Play, Check } from 'lucide-react'
import { UserTask } from '@/lib/api'
import toast from 'react-hot-toast'

interface TaskItemProps {
  userTask: UserTask
  onStart: (userTaskId: number) => Promise<void>
  onComplete: (userTask: UserTask) => void
  showCard?: boolean
}

export function TaskItem({ userTask, onStart, onComplete, showCard = true }: TaskItemProps) {
  const [isStarting, setIsStarting] = React.useState(false)
  const task = userTask.task

  if (!task) return null

  const isPending = userTask.status === 'pending' && !userTask.started_at && !userTask.start_at
  const hasStarted = !!(userTask.started_at || userTask.start_at)
  const isCompleted = userTask.status === 'completed' || userTask.completed_at
  const isInProgress = hasStarted && !isCompleted

  const canStart = isPending && (task.is_need_validation || task.is_scan)
  const canComplete = hasStarted && !isCompleted

  const handleStart = async () => {
    const userTaskId = userTask.user_task_id || userTask.id
    if (!userTaskId) {
      toast.error('User task ID tidak ditemukan')
      return
    }

    try {
      setIsStarting(true)
      await onStart(Number(userTaskId))
    } catch (error) {
      console.error('Error starting task:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          Selesai
        </span>
      )
    }
    if (isInProgress) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3" />
          Sedang Dikerjakan
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3" />
        Pending
      </span>
    )
  }

  // Simple version for inline use
  if (!showCard) {
    return (
      <div className="flex items-center gap-2">
        {canStart && (
          <Button
            onClick={handleStart}
            disabled={isStarting}
            size="sm"
            className="flex items-center gap-2"
          >
            {isStarting ? (
              <>
                <Clock className="h-3 w-3 animate-spin" />
                Memulai...
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Start
              </>
            )}
          </Button>
        )}
        
        {canComplete && (
          <Button
            onClick={() => onComplete(userTask)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Check className="h-3 w-3" />
            Complete
          </Button>
        )}

        {!canStart && !canComplete && getStatusBadge()}
      </div>
    )
  }

  // Full card version
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium">{task.name}</h3>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Task Requirements Info */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {task.is_need_validation && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                Perlu Validasi (Before/After)
              </span>
            )}
            {task.is_scan && (
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                Perlu Scan Barcode
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canStart && (
              <Button
                onClick={handleStart}
                disabled={isStarting}
                className="flex items-center gap-2"
              >
                {isStarting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Memulai...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Task
                  </>
                )}
              </Button>
            )}
            
            {canComplete && (
              <Button
                onClick={() => onComplete(userTask)}
                variant="default"
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Complete Task
              </Button>
            )}
          </div>

          {/* Show scan code if task is started and needs scan */}
          {isInProgress && task.is_scan && userTask.code && (
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">Scan Code:</p>
              <p className="text-lg font-mono">{userTask.code}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
