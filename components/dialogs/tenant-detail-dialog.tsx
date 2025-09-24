'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, DURATION_UNIT_LABELS } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!tenant) return null

  const contractStatus = getContractStatus(tenant.contract_end_at)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detail Tenant: {tenant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
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
                    {tenant.user?.name || tenant.user?.email || '-'}
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
              <CardTitle className="text-lg">Informasi Kontrak</CardTitle>
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
                    {tenant.unit_ids && tenant.unit_ids.length > 0 ? (
                      tenant.unit_ids.map((unitId, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {unitId}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dokumen dan Kategori */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokumen dan Kategori</CardTitle>
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
                    {tenant.categories && tenant.categories.length > 0 ? (
                      tenant.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          Kategori {category}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Sistem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Sistem</CardTitle>
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
                  <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                    {tenant.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID User
                  </label>
                  <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                    {tenant.user_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
