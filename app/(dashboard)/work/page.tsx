'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { userTasksApi, UserTask } from '@/lib/api'
import toast from 'react-hot-toast'
import { GenerateTaskButton } from './components/GenerateTaskButton'
import { TaskList } from './components/TaskList'
import { CompleteTaskDialog } from './components/CompleteTaskDialog'

function WorkContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [userTasks, setUserTasks] = useState<UserTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserTask, setSelectedUserTask] = useState<UserTask | null>(null)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

  // Check if user tasks exist for today
  const hasUserTasksToday = (tasks: UserTask[]): boolean => {
    if (tasks.length === 0) return false
    
    const today = new Date()
    const jakartaToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    
    return tasks.some(task => {
      if (!task.scheduled_at) return true // If no scheduled_at, assume it's for today
      
      try {
        const scheduledDate = new Date(task.scheduled_at)
        const jakartaScheduled = new Date(scheduledDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
        
        return jakartaToday.getDate() === jakartaScheduled.getDate() &&
               jakartaToday.getMonth() === jakartaScheduled.getMonth() &&
               jakartaToday.getFullYear() === jakartaScheduled.getFullYear()
      } catch {
        return true // On error, assume it's for today
      }
    })
  }

  const loadUserTasks = async () => {
    try {
      setIsLoading(true)
      const response = await userTasksApi.getUserTasks()
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const tasks = Array.isArray(responseData.data) ? responseData.data : []
        setUserTasks(tasks)
      } else {
        console.error('Failed to load user tasks:', response.error)
        setUserTasks([])
      }
    } catch (error) {
      console.error('Error loading user tasks:', error)
      toast.error('Terjadi kesalahan saat memuat data')
      setUserTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserTasks()
  }, [])

  const handleGenerateSuccess = () => {
    loadUserTasks()
  }

  const handleStartTask = async (userTaskId: number) => {
    try {
      const response = await userTasksApi.startUserTask(userTaskId)
      
      if (response.success) {
        toast.success('Task berhasil dimulai')
        await loadUserTasks()
      } else {
        throw new Error(response.error || 'Gagal memulai task')
      }
    } catch (error: any) {
      console.error('Error starting task:', error)
      toast.error(error.message || 'Terjadi kesalahan saat memulai task')
      throw error
    }
  }

  const handleCompleteTask = (userTask: UserTask) => {
    setSelectedUserTask(userTask)
    setIsCompleteDialogOpen(true)
  }

  const handleCompleteSuccess = () => {
    loadUserTasks()
  }

  const getPageTitle = () => {
    // Check if there's a taskGroup query parameter
    const taskGroup = searchParams?.get('taskGroup')
    
    if (taskGroup) {
      const routeTitleMap: Record<string, string> = {
        'security-guard': 'Security Guard',
        'cleaning-program': 'Cleaning Program',
      }
      
      // Return mapped title or format the taskGroup parameter
      return routeTitleMap[taskGroup] || taskGroup.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    } else {
      return 'Pekerjaan'
    }
    
  }

  const hasTasksToday = hasUserTasksToday(userTasks)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground">
            Kelola tugas dan selesaikan task sesuai dengan task group
          </p>
        </div>
      </div>

      {/* Generate Button - Show if no tasks for today */}
      {!isLoading && !hasTasksToday && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Belum ada user task untuk hari ini
              </p>
              <GenerateTaskButton onGenerateSuccess={handleGenerateSuccess} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      {hasTasksToday && (
        <TaskList
          userTasks={userTasks}
          isLoading={isLoading}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
        />
      )}

      {/* Complete Task Dialog */}
      <CompleteTaskDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        userTask={selectedUserTask}
        onComplete={handleCompleteSuccess}
      />
    </div>
  )
}

export default function WorkPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Memuat...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <WorkContent />
    </Suspense>
  )
}
