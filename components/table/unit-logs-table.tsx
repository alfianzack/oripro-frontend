'use client'

import React, { useState, useEffect } from 'react'
import { UnitLog } from '@/lib/api'
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
import { History, Loader2 } from 'lucide-react'
import JsonDisplay from '@/components/ui/json-display'

interface UnitLogsTableProps {
  unitId: string
  loading?: boolean
}

export default function UnitLogsTable({ unitId, loading = false }: UnitLogsTableProps) {
  const [unitLogs, setUnitLogs] = useState<UnitLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadUnitLogs = async () => {
      
      if (!unitId) {
        console.log('UnitLogsTable: No unitId provided')
        return
      }
      
      setLogsLoading(true)
      try {
        const { unitsApi } = await import('@/lib/api')
        
        const response = await unitsApi.getUnitLogs(unitId)
        
        
        if (response.success && response.data) {
          // Ensure response.data is an array
          const responseData = response.data as any
          const logsData = Array.isArray(responseData.data) ? responseData.data : []
          
          setUnitLogs(logsData)
        } else {
          console.log('UnitLogsTable: No data in response, setting empty array')
          setUnitLogs([])
        }
      } catch (error) {
        console.error('UnitLogsTable: Load unit logs error:', error)
        console.error('UnitLogsTable: Error details:', {
          message: (error as Error).message,
          stack: (error as Error)?.stack,
          unitId: unitId
        })
        setUnitLogs([])
      } finally {
        setLogsLoading(false)
      }
    }

    loadUnitLogs()
  }, [unitId])

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
      'rent_price_change': 'Ubah Harga Sewa',
      'status_change': 'Ubah Status',
      'toilet_change': 'Ubah Status Toilet'
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
      case 'rent_price_change':
        return 'outline'
      case 'status_change':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (loading || logsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History Unit</CardTitle>
          <CardDescription>Riwayat aktivitas unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Memuat history unit...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
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
          {!unitLogs || unitLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Tidak ada history unit
              </TableCell>
            </TableRow>
          ) : (
            unitLogs.map((log, index) => (
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
  )
}
