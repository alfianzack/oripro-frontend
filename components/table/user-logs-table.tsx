'use client'

import React, { useState, useEffect } from 'react'
import { UserLog } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import JsonDisplay from '@/components/ui/json-display'

interface UserLogsTableProps {
  userId: string
  loading?: boolean
}

export default function UserLogsTable({ userId, loading = false }: UserLogsTableProps) {
  const [userLogs, setUserLogs] = useState<UserLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadUserLogs = async () => {
      if (!userId) return
      
      setLogsLoading(true)
      try {
        const { usersApi } = await import('@/lib/api')
        const response = await usersApi.getUserLogs(userId)
        
        if (response.success && response.data) {
          const responseData = response.data as any
          // Ensure response.data is an array
          const logsData = Array.isArray(responseData.data) ? responseData.data : []
          setUserLogs(logsData)
        } else {
          setUserLogs([])
        }
      } catch (error) {
        console.error('Load user logs error:', error)
      } finally {
        setLogsLoading(false)
      }
    }

    loadUserLogs()
  }, [userId])

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionLabel = (action: string) => {
    const actionLabels: Record<string, string> = {
      'create': 'Dibuat',
      'update': 'Diperbarui',
      'delete': 'Dihapus',
      'login': 'Login',
      'logout': 'Logout',
      'password_change': 'Ubah Password',
      'status_change': 'Ubah Status'
    }
    return actionLabels[action] || action
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return 'default'
      case 'update':
        return 'secondary'
      case 'delete':
        return 'destructive'
      case 'login':
        return 'outline'
      case 'logout':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (loading || logsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History User</CardTitle>
          <CardDescription>Riwayat aktivitas user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Memuat history user...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>History User</CardTitle>
        <CardDescription>Riwayat aktivitas user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Data Lama</TableHead>
                <TableHead>Data Baru</TableHead>
                <TableHead>Dibuat Oleh</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!userLogs || userLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada history user
                  </TableCell>
                </TableRow>
              ) : (
                userLogs.map((log, index) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] min-w-[200px]">
                      {log.old_data ? (
                        <JsonDisplay 
                          data={log.old_data}
                          className="text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] min-w-[200px]">
                      {log.new_data ? (
                        <JsonDisplay 
                          data={log.new_data}
                          className="text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.created_by ? (
                        <div>
                          <div className="font-medium">{log.created_by.name}</div>
                          <div className="text-xs text-muted-foreground">{log.created_by.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
