'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Clock, CheckCircle2, Calendar, MapPin, ClipboardList } from 'lucide-react'
import { attendanceApi, userTasksApi, Attendance, UserTask } from '@/lib/api'
import toast from 'react-hot-toast'
import LoadingSkeleton from '@/components/loading-skeleton'
import AttendanceCard from '@/components/attendance/attendance-card'

function DashboardWorkerContent() {
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])
  const [userTasks, setUserTasks] = useState<UserTask[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

  // Load attendance history
  const loadAttendanceHistory = async () => {
    try {
      setIsLoadingAttendance(true)
      const response = await attendanceApi.getUserAttendanceHistory(10)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const history = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
        setAttendanceHistory(history)
      } else {
        console.error('Failed to load attendance history:', response.error)
        setAttendanceHistory([])
      }
    } catch (error) {
      console.error('Error loading attendance history:', error)
      toast.error('Terjadi kesalahan saat memuat riwayat absensi')
      setAttendanceHistory([])
    } finally {
      setIsLoadingAttendance(false)
    }
  }

  // Load user tasks
  const loadUserTasks = async () => {
    try {
      setIsLoadingTasks(true)
      const response = await userTasksApi.getUserTasks({ limit: 10 })
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const tasks = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
        setUserTasks(tasks)
      } else {
        console.error('Failed to load user tasks:', response.error)
        setUserTasks([])
      }
    } catch (error) {
      console.error('Error loading user tasks:', error)
      toast.error('Terjadi kesalahan saat memuat data task')
      setUserTasks([])
    } finally {
      setIsLoadingTasks(false)
    }
  }

  useEffect(() => {
    loadAttendanceHistory()
    loadUserTasks()
  }, [])

  // Format date untuk display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get task status badge
  const getTaskStatusBadge = (task: UserTask) => {
    const isPending = task.status === 'pending' && !task.started_at && !task.start_at
    const isInProgress = (task.status === 'in_progress' || task.status === 'inprogress') && 
                         (task.started_at || task.start_at) && 
                         !task.completed_at
    const isCompleted = task.status === 'completed' || task.completed_at

    if (isCompleted) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
          Selesai
        </span>
      )
    } else if (isInProgress) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          Sedang Dikerjakan
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
          Pending
        </span>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Worker</h1>
        <p className="text-muted-foreground">
          Informasi absensi dan tugas Anda
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Section */}
        <div className="space-y-6">
          {/* Today's Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Absensi Hari Ini
              </CardTitle>
              <CardDescription>
                Status absensi masuk dan keluar Anda hari ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSkeleton height="h-64" text="Memuat..." />}>
                <AttendanceCard />
              </Suspense>
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Riwayat Absensi
              </CardTitle>
              <CardDescription>
                Riwayat absensi 10 hari terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-muted-foreground">Memuat riwayat absensi...</p>
                  </div>
                </div>
              ) : attendanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada riwayat absensi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendanceHistory.map((attendance) => (
                    <div
                      key={attendance.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {attendance.asset?.name || 'Asset'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">Masuk:</span>
                            <span>{formatDate(attendance.check_in_time)}</span>
                            <span>{formatTime(attendance.check_in_time)}</span>
                          </div>
                          {attendance.check_out_time && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 font-medium">Keluar:</span>
                              <span>{formatDate(attendance.check_out_time)}</span>
                              <span>{formatTime(attendance.check_out_time)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {attendance.status === 'checked_out' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Tasks Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Tugas Saya
              </CardTitle>
              <CardDescription>
                Daftar tugas yang perlu dikerjakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-muted-foreground">Memuat data task...</p>
                  </div>
                </div>
              ) : userTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Belum ada tugas untuk hari ini</p>
                  <a
                    href="/work"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Lihat semua tugas →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTasks.slice(0, 10).map((task) => {
                    const taskId = task.user_task_id || task.id || task.task_id
                    return (
                      <div
                        key={taskId}
                        className={`p-3 rounded-lg border transition-colors ${
                          task.status === 'completed' || task.completed_at
                            ? 'border-green-200 bg-green-50/30'
                            : task.status === 'in_progress' || task.status === 'inprogress'
                            ? 'border-blue-200 bg-blue-50/30'
                            : 'border-gray-200 bg-white'
                        } hover:bg-gray-50`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 mb-1">
                              {task.task?.name || 'Task'}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              {task.task?.duration && (
                                <div>Durasi: {task.task.duration} menit</div>
                              )}
                              {task.scheduled_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(task.scheduled_at)}</span>
                                </div>
                              )}
                              {task.started_at || task.start_at ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Dimulai: {formatTime(task.started_at || task.start_at || '')}</span>
                                </div>
                              ) : null}
                              {task.completed_at && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Selesai: {formatTime(task.completed_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getTaskStatusBadge(task)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {userTasks.length > 10 && (
                    <div className="text-center pt-2">
                      <a
                        href="/work"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Lihat semua tugas ({userTasks.length}) →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Statistik Tugas
              </CardTitle>
              <CardDescription>
                Ringkasan status tugas Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-gray-900">
                      {userTasks.filter(t => t.status === 'pending' && !t.started_at && !t.start_at).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pending</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-900">
                      {userTasks.filter(t => (t.status === 'in_progress' || t.status === 'inprogress') && (t.started_at || t.start_at) && !t.completed_at).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Sedang Dikerjakan</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-900">
                      {userTasks.filter(t => t.status === 'completed' || t.completed_at).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Selesai</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardWorkerPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Memuat dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <DashboardWorkerContent />
    </Suspense>
  )
}

