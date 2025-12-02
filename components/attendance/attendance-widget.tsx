'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, CheckCircle, XCircle, History, Navigation } from 'lucide-react'
import { useApiError } from '@/hooks/useApiError'
import { attendanceApi } from '@/lib/api'

interface AttendanceWidgetProps {
  assetId: number
  assetName: string
  assetLatitude: number
  assetLongitude: number
  className?: string
}

interface AttendanceRecord {
  id: number
  check_in_time: string
  check_out_time?: string
  status: 'checked_in' | 'checked_out'
  check_in_latitude: number
  check_in_longitude: number
  check_out_latitude?: number
  check_out_longitude?: number
  notes?: string
  created_at: string
  asset: {
    id: number
    name: string
    code: string
    address: string
  }
}

interface TodayStatus {
  id?: number
  check_in_time?: string
  check_out_time?: string
  status: 'checked_in' | 'checked_out' | 'not_checked_in'
  hasCheckedIn?: boolean
  hasCheckedOut?: boolean
  attendance?: {
    id: number
    check_in_time: string
    check_out_time?: string
    status: 'checked_in' | 'checked_out'
    asset?: {
      id: number
      name: string
      code: string
      address: string
    }
  }
  asset?: {
    id: number
    name: string
    code: string
    address: string
  }
}

export default function AttendanceWidget({
  assetId,
  assetName,
  assetLatitude,
  assetLongitude,
  className = ''
}: AttendanceWidgetProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingRadius, setIsCheckingRadius] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [radiusInfo, setRadiusInfo] = useState<{isInRadius: boolean, distance: number} | null>(null)
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null)
  const [weeklyHistory, setWeeklyHistory] = useState<AttendanceRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { handleApiError } = useApiError()

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung geolocation')
      return
    }

    setIsCheckingRadius(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation({ lat, lng })
        checkRadius(lat, lng)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Tidak dapat mengakses lokasi saat ini. Pastikan izin lokasi diaktifkan.')
        setIsCheckingRadius(false)
      }
    )
  }

  // Check if user is within radius
  const checkRadius = async (lat: number, lng: number) => {
    try {
      const response = await attendanceApi.checkRadius(lat, lng, assetId)
      if (response.success && response.data) {
        setRadiusInfo(response.data)
      } else {
        handleApiError(response)
      }
      setIsCheckingRadius(false)
    } catch (error) {
      handleApiError({ success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan' })
      setIsCheckingRadius(false)
    }
  }

  // Check in
  const handleCheckIn = async () => {
    if (!userLocation) {
      alert('Lokasi tidak tersedia. Silakan refresh lokasi.')
      return
    }

    // Validasi data sebelum dikirim
    if (!assetId || assetId === null || assetId === undefined) {
      alert('Asset ID tidak valid. Silakan refresh halaman.')
      return
    }

    if (typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      alert('Koordinat lokasi tidak valid. Silakan refresh lokasi.')
      return
    }

    if (isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      alert('Koordinat lokasi tidak valid. Silakan refresh lokasi.')
      return
    }

    console.log('Check-in data:', { assetId, latitude: userLocation.lat, longitude: userLocation.lng })
    
    setIsLoading(true)
    try {
      const response = await attendanceApi.checkIn(assetId, userLocation.lat, userLocation.lng)
      if (response.success) {
        alert('Check-in berhasil!')
        // Wait a bit for database to update, then reload status
        setTimeout(() => {
          loadTodayStatus()
          loadWeeklyHistory()
        }, 500)
      } else {
        handleApiError(response)
      }
    } catch (error) {
      console.error('Check-in error:', error)
      handleApiError({ success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan' })
    } finally {
      setIsLoading(false)
    }
  }

  // Check out
  const handleCheckOut = async () => {
    if (!userLocation) {
      alert('Lokasi tidak tersedia. Silakan refresh lokasi.')
      return
    }

    // Validasi data sebelum dikirim
    if (!assetId || assetId === null || assetId === undefined) {
      alert('Asset ID tidak valid. Silakan refresh halaman.')
      return
    }

    if (typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      alert('Koordinat lokasi tidak valid. Silakan refresh lokasi.')
      return
    }

    if (isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      alert('Koordinat lokasi tidak valid. Silakan refresh lokasi.')
      return
    }

    console.log('Check-out data:', { assetId, latitude: userLocation.lat, longitude: userLocation.lng })

    setIsLoading(true)
    try {
      const response = await attendanceApi.checkOut(assetId, userLocation.lat, userLocation.lng)
      if (response.success) {
        alert('Check-out berhasil!')
        // Wait a bit for database to update, then reload status
        setTimeout(() => {
          loadTodayStatus()
          loadWeeklyHistory()
        }, 500)
      } else {
        handleApiError(response)
      }
    } catch (error) {
      console.error('Check-out error:', error)
      handleApiError({ success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan' })
    } finally {
      setIsLoading(false)
    }
  }

  // Load today's status
  const loadTodayStatus = async () => {
    try {
      const response = await attendanceApi.getTodayStatus(assetId)
      console.log('Today status response:', response)
      
      if (response.success) {
        if (response.data) {
          // Handle backend response structure
          const statusData = response.data
          
          // If backend returns wrapped structure with hasCheckedIn/hasCheckedOut
          if (statusData.hasCheckedIn !== undefined || statusData.hasCheckedOut !== undefined) {
            // Use attendance object if available, otherwise construct from status
            const attendance = statusData.attendance || null
            
            if (attendance) {
              setTodayStatus({
                id: attendance.id,
                check_in_time: attendance.check_in_time,
                check_out_time: attendance.check_out_time,
                status: attendance.status as 'checked_in' | 'checked_out',
                asset: attendance.asset
              })
            } else if (statusData.hasCheckedIn || statusData.hasCheckedOut) {
              // If we have status but no attendance object, set status anyway
              setTodayStatus({
                status: statusData.status as 'checked_in' | 'checked_out',
                hasCheckedIn: statusData.hasCheckedIn,
                hasCheckedOut: statusData.hasCheckedOut
              })
            } else {
              // No attendance today
              setTodayStatus(null)
            }
          } else {
            // Direct attendance object structure
            setTodayStatus(statusData)
          }
        } else {
          // No data means no attendance today
          setTodayStatus(null)
        }
      } else {
        console.error('Failed to load today status:', response.error)
        setTodayStatus(null)
      }
    } catch (error) {
      console.error('Error loading today status:', error)
      setTodayStatus(null)
    }
  }

  // Load weekly history
  const loadWeeklyHistory = async () => {
    try {
      const response = await attendanceApi.getWeeklyHistory(assetId)
      if (response.success && response.data) {
        setWeeklyHistory(response.data)
      }
    } catch (error) {
      console.error('Error loading weekly history:', error)
    }
  }

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: undefined
    })
  }

  // Format date with day
  const formatDateWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  useEffect(() => {
    loadTodayStatus()
    loadWeeklyHistory()
  }, [assetId])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Attendance Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Absensi - {assetName}
          </CardTitle>
          <CardDescription>
            Absensi dengan radius 200 meter dari asset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Status Lokasi:</span>
            </div>
            {radiusInfo ? (
              <Badge variant={radiusInfo.isInRadius ? 'default' : 'destructive'}>
                {radiusInfo.isInRadius 
                  ? `Dalam radius (${radiusInfo.distance}m)` 
                  : `Di luar radius (${radiusInfo.distance}m)`
                }
              </Badge>
            ) : (
              <Badge variant="secondary">Belum dicek</Badge>
            )}
          </div>

          {/* Location Button */}
          <Button
            onClick={getCurrentLocation}
            disabled={isCheckingRadius}
            variant="outline"
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isCheckingRadius ? 'Mengecek lokasi...' : 'Cek Lokasi'}
          </Button>

          {/* Today's Status */}
          {todayStatus && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2 font-medium">
                {formatDateWithDay(new Date().toISOString())}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status Hari Ini:</span>
                <Badge variant={todayStatus.status === 'checked_in' ? 'default' : 'secondary'}>
                  {todayStatus.status === 'checked_in' ? 'Sudah Check-in' : todayStatus.status === 'checked_out' ? 'Sudah Check-out' : 'Belum Check-in'}
                </Badge>
              </div>
              {todayStatus.check_in_time && (
                <div className="text-sm text-gray-600 mt-1">
                  Check-in: {formatTime(todayStatus.check_in_time)}
                </div>
              )}
              {todayStatus.check_out_time && (
                <div className="text-sm text-gray-600">
                  Check-out: {formatTime(todayStatus.check_out_time)}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCheckIn}
              disabled={!radiusInfo?.isInRadius || (todayStatus && (todayStatus.status === 'checked_in' || todayStatus.hasCheckedIn)) || isLoading}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!todayStatus || todayStatus.status === 'checked_out' || todayStatus.hasCheckedOut || isLoading}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </div>

          {/* History Toggle */}
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            className="w-full"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? 'Sembunyikan' : 'Tampilkan'} Riwayat Seminggu
          </Button>
        </CardContent>
      </Card>

      {/* Weekly History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Absensi Seminggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyHistory.length > 0 ? (
              <div className="space-y-3">
                {weeklyHistory.map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{formatDate(record.created_at)}</div>
                        <div className="text-sm text-gray-600">
                          {formatTime(record.check_in_time)}
                          {record.check_out_time && ` - ${formatTime(record.check_out_time)}`}
                        </div>
                      </div>
                      <Badge variant={record.status === 'checked_in' ? 'default' : 'secondary'}>
                        {record.status === 'checked_in' ? 'Check-in' : 'Check-out'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada riwayat absensi
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
