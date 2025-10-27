'use client'

import React, { useState, useEffect } from 'react'
import { TenantLog } from '@/lib/api'
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

interface TenantLogsTableProps {
  tenantId: string
  loading?: boolean
}

export default function TenantLogsTable({ tenantId, loading = false }: TenantLogsTableProps) {
  const [tenantLogs, setTenantLogs] = useState<TenantLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadTenantLogs = async () => {
      if (!tenantId) return
      
      setLogsLoading(true)
      try {
        const { tenantsApi } = await import('@/lib/api')
        const response = await tenantsApi.getTenantLogs(tenantId)
        console.log("tenant logs response", response)
        
        if (response.success && response.data) {
          const responseData = response.data as any
          // Ensure response.data is an array
          const logsData = Array.isArray(responseData.data) ? responseData.data : []
          setTenantLogs(logsData)
        } else {
          setTenantLogs([])
        }
      } catch (error) {
        console.error('Load tenant logs error:', error)
      } finally {
        setLogsLoading(false)
      }
    }

    loadTenantLogs()
  }, [tenantId])

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
      'contract_renewal': 'Perpanjangan Kontrak',
      'status_change': 'Ubah Status',
      'rent_change': 'Ubah Sewa',
      'contract_termination': 'Pemutusan Kontrak'
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
      case 'contract_renewal':
        return 'outline'
      case 'status_change':
        return 'secondary'
      case 'rent_change':
        return 'secondary'
      case 'contract_termination':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (loading || logsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History Tenant</CardTitle>
          <CardDescription>Riwayat aktivitas tenant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Memuat history tenant...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>History Tenant</CardTitle>
        <CardDescription>Riwayat aktivitas tenant</CardDescription>
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
              {!tenantLogs || tenantLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada history tenant
                  </TableCell>
                </TableRow>
              ) : (
                tenantLogs.map((log, index) => {
                  // Debug: Log log data to identify the problematic field
                  console.log('Tenant log data:', log);
                  
                  return (
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
                        {(() => {
                          try {
                            if (log.created_by && typeof log.created_by === 'object') {
                              return (
                                <div>
                                  <div className="font-medium">{log.created_by.name || '-'}</div>
                                  <div className="text-xs text-muted-foreground">{log.created_by.email || '-'}</div>
                                </div>
                              );
                            }
                            return <span className="text-muted-foreground">-</span>;
                          } catch (error) {
                            console.error('Error rendering created_by field:', error, log.created_by);
                            return <span className="text-muted-foreground">-</span>;
                          }
                        })()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}