'use client'

import React, { useState, useEffect } from 'react'
import { Attendance, attendanceApi, authApi, User } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, RefreshCw, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AttendanceHistoryTable() {
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0])
  const [dateError, setDateError] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authApi.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error loading current user:', error)
      }
    }
    loadCurrentUser()
  }, [])

  // Validate date range (max 1 month)
  const validateDateRange = (from: string, to: string): boolean => {
    if (!from || !to) {
      setDateError('Tanggal dari dan sampai harus diisi')
      return false
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    if (fromDate > toDate) {
      setDateError('Tanggal dari tidak boleh lebih besar dari tanggal sampai')
      return false
    }

    // Calculate difference in days
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const maxDays = 31 // Maximum 1 month

    if (diffDays > maxDays) {
      setDateError(`Rentang tanggal maksimal ${maxDays} hari (1 bulan)`)
      return false
    }

    setDateError('')
    return true
  }

  // Load attendance history
  const loadAttendanceHistory = async () => {
    if (!currentUser?.id) return

    if (!validateDateRange(dateFrom, dateTo)) {
      return
    }

    setLoading(true)
    try {
      const response = await attendanceApi.getUserAttendanceHistoryByDate(currentUser.id, dateFrom, dateTo) as any
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const history = Array.isArray(responseData.data) 
          ? responseData.data 
          : (Array.isArray(responseData) ? responseData : [])
        setAttendanceHistory(history)
      } else {
        console.error('Failed to load attendance history:', response.error)
        setAttendanceHistory([])
        toast.error(response.error || 'Gagal memuat riwayat absensi')
      }
    } catch (error) {
      console.error('Error loading attendance history:', error)
      toast.error('Terjadi kesalahan saat memuat riwayat absensi')
      setAttendanceHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.id && mounted) {
      loadAttendanceHistory()
    }
  }, [currentUser?.id, mounted])

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    if (value && dateTo) {
      validateDateRange(value, dateTo)
    }
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    if (dateFrom && value) {
      validateDateRange(dateFrom, value)
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString || !mounted) return '-'
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString || !mounted) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (attendance: Attendance) => {
    if (attendance.status === 'checked_out') {
      return <Badge variant="default" className="bg-green-600">Checked Out</Badge>
    }
    return <Badge variant="default" className="bg-blue-600">Checked In</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          History Absen
        </CardTitle>
        <CardDescription>
          Riwayat absensi berdasarkan tanggal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date-from">Dari Tanggal</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full"
                max={dateTo}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="date-to">Sampai Tanggal</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full"
                min={dateFrom}
              />
            </div>
            <Button
              onClick={loadAttendanceHistory}
              disabled={loading || !currentUser?.id || !!dateError}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          {dateError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {dateError}
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Memuat riwayat absensi...</span>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Tidak ada riwayat absensi untuk tanggal yang dipilih</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>
                      {formatDate(attendance.check_in_time)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatTime(attendance.check_in_time)}</p>
                    </TableCell>
                    <TableCell>
                      {attendance.check_out_time ? (
                        <p className="font-medium">{formatTime(attendance.check_out_time)}</p>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(attendance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

