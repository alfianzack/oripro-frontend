'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { userTasksApi, UserTask } from '@/lib/api'
import toast from 'react-hot-toast'
import { GenerateTaskButton } from '../../../components/work/GenerateTaskButton'
import { TaskList } from '../../../components/work/TaskList'
import { CompleteTaskDialog } from '../../../components/work/CompleteTaskDialog'

function WorkContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [userTasks, setUserTasks] = useState<UserTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserTask, setSelectedUserTask] = useState<UserTask | null>(null)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

  // Filter tasks for today only
  const filterTasksForToday = (tasks: UserTask[]): UserTask[] => {
    if (tasks.length === 0) return []
    
    // Get today's date string in Jakarta timezone (YYYY-MM-DD format)
    const now = new Date()
    const jakartaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) // en-CA gives YYYY-MM-DD format
    
    return tasks.filter(task => {
      // Only include tasks with created_at (format: 2025-11-13T02:19:33.129Z)
      if (!task.created_at) return false
      
      try {
        // Parse ISO string format (2025-11-13T02:19:33.129Z)
        const createdDate = new Date(task.created_at)
        const createdDateStr = createdDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
        
        // Compare date strings (YYYY-MM-DD format)
        return createdDateStr === jakartaDateStr
      } catch {
        return false // On error, exclude the task
      }
    })
  }

  // Check if user tasks exist for today
  const hasUserTasksToday = (tasks: UserTask[]): boolean => {
    return filterTasksForToday(tasks).length > 0
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

  const tasksForToday = filterTasksForToday(userTasks)
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
          userTasks={tasksForToday}
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
