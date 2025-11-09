'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, DURATION_UNIT_LABELS, TenantDepositLog, tenantsApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { History, Building2, X, Edit, Wallet } from 'lucide-react'
import Link from 'next/link'
import TenantLogsTable from '@/components/table/tenant-logs-table'

interface TenantDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant | null
}

export default function TenantDetailDialog({
  open,
  onOpenChange,
  tenant
}: TenantDetailDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [depositLogs, setDepositLogs] = useState<TenantDepositLog[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch deposit logs when dialog opens and tenant is available
  useEffect(() => {
    const loadDepositLogs = async () => {
      if (open && tenant?.id) {
        try {
          const response = await tenantsApi.getTenantDepositLogs(tenant.id)
          if (response.success && response.data) {
            const logsData = response.data as any
            const logs = Array.isArray(logsData.data) ? logsData.data : (Array.isArray(logsData) ? logsData : [])
            console.log('logs', logs)
            setDepositLogs(logs)
          }
        } catch (error) {
          console.error('Load deposit logs error:', error)
        }
      }
    }

    loadDepositLogs()
  }, [open, tenant?.id])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getContractStatus = (contractEndAt: string) => {
    const endDate = new Date(contractEndAt)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'expired', label: 'Kadaluarsa', variant: 'destructive' as const }
    } else if (diffDays <= 30) {
      return { status: 'expiring', label: 'Akan Kadaluarsa', variant: 'warning' as const }
    } else {
      return { status: 'active', label: 'Aktif', variant: 'default' as const }
    }
  }

  if (!tenant || !open) return null

  const contractStatus = getContractStatus(tenant.contract_end_at)

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Detail Tenant: {tenant.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Informasi lengkap dan riwayat aktivitas tenant
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={contractStatus.variant}>
                  {contractStatus.label}
                </Badge>
              </div>
              <Button asChild>
                <Link href={`/tenants/edit/${tenant.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Tenant
                </Link>
              </Button>
            </div>

            {/* Custom Tabs */}
            <div className="w-full">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Informasi Tenant
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  History Aktivitas
                </button>
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'deposit'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  History Deposito
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* Informasi Dasar */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Informasi Dasar
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Kode Tenant
                            </label>
                            <p className="text-sm font-mono bg-muted p-2 rounded">
                              {tenant.code}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Nama Tenant
                            </label>
                            <p className="text-sm font-medium">{tenant.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              User
                            </label>
                            <p className="text-sm font-medium">
                             
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Status Kontrak
                            </label>
                            <div className="mt-1">
                              <Badge variant={contractStatus.variant}>
                                {contractStatus.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Informasi Kontrak */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Informasi Kontrak
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Mulai Kontrak
                            </label>
                            <p className="text-sm font-medium">{formatDate(tenant.contract_begin_at)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Berakhir Kontrak
                            </label>
                            <p className="text-sm font-medium">{formatDate(tenant.contract_end_at)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Durasi Sewa
                            </label>
                            <p className="text-sm font-medium">
                              {tenant.rent_duration} {DURATION_UNIT_LABELS[tenant.rent_duration_unit] || tenant.rent_duration_unit}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Unit ID
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dokumen dan Kategori */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Dokumen dan Kategori
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Dokumen Identitas
                            </label>
                            <div className="mt-1 space-y-1">
                              {tenant.tenant_identifications && tenant.tenant_identifications.length > 0 ? (
                                tenant.tenant_identifications.map((doc, index) => (
                                  <div key={index} className="text-sm text-blue-600 hover:underline cursor-pointer">
                                    {doc}
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Dokumen Kontrak
                            </label>
                            <div className="mt-1 space-y-1">
                              {tenant.contract_documents && tenant.contract_documents.length > 0 ? (
                                tenant.contract_documents.map((doc, index) => (
                                  <div key={index} className="text-sm text-blue-600 hover:underline cursor-pointer">
                                    {doc}
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Kategori
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Informasi Sistem */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Informasi Sistem
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Dibuat Pada
                            </label>
                            <p className="text-sm font-medium">{formatDate(tenant.created_at)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Diperbarui Pada
                            </label>
                            <p className="text-sm font-medium">{formatDate(tenant.updated_at)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              ID Tenant
                            </label>
                            <p className="text-xs font-mono bg-muted p-2 rounded">
                              {tenant.id}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              ID User
                            </label>
                            <p className="text-xs font-mono bg-muted p-2 rounded">
                              {tenant.user_id}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          History Aktivitas Tenant
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TenantLogsTable tenantId={tenant.id} loading={false} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'deposit' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5" />
                          History Deposito
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {depositLogs.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tanggal</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>New Deposit</TableHead>
                                  <TableHead>Old Deposit</TableHead>
                                  <TableHead>Dibuat Oleh</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {depositLogs.map((log) => {
                                  const reason = log.reason || '-'
                                  const newDeposit = log.new_deposit || 0
                                  const oldDeposit = log.old_deposit || 0
                                  
                                  return (
                                    <TableRow key={log.id}>
                                      <TableCell className="text-sm">
                                        {formatDate(log.created_at)}
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">{reason}</span>
                                      </TableCell>
                                      <TableCell>
                                        {newDeposit > 0 ? (
                                          <span className="text-sm font-medium">
                                            {new Intl.NumberFormat('id-ID', {
                                              style: 'currency',
                                              currency: 'IDR',
                                              minimumFractionDigits: 0,
                                            }).format(Number(newDeposit))}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {oldDeposit > 0 ? (
                                          <span className="text-sm font-medium">
                                            {new Intl.NumberFormat('id-ID', {
                                              style: 'currency',
                                              currency: 'IDR',
                                              minimumFractionDigits: 0,
                                            }).format(Number(oldDeposit))}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {log.created_by ? (
                                          <div>
                                            <p className="font-medium text-sm">{log.created_by.name}</p>
                                            <p className="text-xs text-muted-foreground">{log.created_by.email}</p>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada history deposito</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
