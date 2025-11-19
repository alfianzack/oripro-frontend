'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Edit,
  Eye,
  Building2,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { Tenant, Unit, Asset, DURATION_UNIT_LABELS } from '@/lib/api'

interface ContractInfoCardProps {
  tenant: Tenant
  unit?: Unit
  asset?: Asset
  pendingPayments?: any[]
  totalPendingAmount?: number
}

export default function ContractInfoCard({ tenant, unit, asset, pendingPayments, totalPendingAmount }: ContractInfoCardProps) {
  const getContractStatus = (tenant: Tenant) => {
    const now = new Date()
    const endDate = new Date(tenant.contract_end_at)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: 'expired', label: 'Kadaluarsa', color: 'destructive', days: Math.abs(diffDays) }
    } else if (diffDays <= 30) {
      return { status: 'expiring', label: 'Akan Kadaluarsa', color: 'warning', days: diffDays }
    } else {
      return { status: 'active', label: 'Aktif', color: 'success', days: diffDays }
    }
  }

  const getProgressPercentage = (endDate: string) => {
    const now = new Date()
    const start = new Date(tenant.contract_begin_at)
    const end = new Date(endDate)
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const contractStatus = getContractStatus(tenant)
  const progressPercentage = getProgressPercentage(tenant.contract_end_at)

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tenant.name}</CardTitle>
          <Badge 
            variant={contractStatus.color === 'success' ? 'default' : 
                   contractStatus.color === 'warning' ? 'secondary' : 'destructive'}
          >
            {contractStatus.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Kode: {tenant.code}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Unit Information */}
        {unit && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>Unit: {unit.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Ukuran: {unit.size} m²</div>
              <div>Harga: {formatCurrency(unit.rent_price)}</div>
            </div>
            {asset && (
              <div className="text-sm text-muted-foreground">
                Asset: {asset.name}
              </div>
            )}
          </div>
        )}

        {/* Contract Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Informasi Kontrak</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mulai Kontrak:</span>
              <span>{formatDate(tenant.contract_begin_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Berakhir Kontrak:</span>
              <span className={contractStatus.status === 'expired' ? 'text-red-600 font-medium' : ''}>
                {formatDate(tenant.contract_end_at)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Durasi:</span>
              <span>{tenant.rent_duration} {DURATION_UNIT_LABELS[tenant.rent_duration_unit] || tenant.rent_duration_unit || 'Bulan'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress Kontrak</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Days until expiry */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {contractStatus.status === 'expired' 
              ? `Kadaluarsa ${contractStatus.days} hari lalu`
              : contractStatus.status === 'expiring'
              ? `Kadaluarsa dalam ${contractStatus.days} hari`
              : `Masih ${contractStatus.days} hari`
            }
          </span>
        </div>

        {/* Status Icon */}
        <div className="flex items-center gap-2 text-sm">
          {contractStatus.status === 'active' && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {contractStatus.status === 'expiring' && (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          {contractStatus.status === 'expired' && (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <span className={
            contractStatus.status === 'active' ? 'text-green-600' :
            contractStatus.status === 'expiring' ? 'text-yellow-600' : 'text-red-600'
          }>
            {contractStatus.status === 'active' ? 'Kontrak Aktif' :
             contractStatus.status === 'expiring' ? 'Perhatian: Akan Kadaluarsa' : 'Kontrak Kadaluarsa'}
          </span>
        </div>

        {/* Pending Payment Info */}
        {pendingPayments && pendingPayments.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-900">
              <CreditCard className="h-4 w-4" />
              <span>Pending Payment</span>
              <Badge variant="destructive" className="ml-auto">
                {pendingPayments.length} unpaid
              </Badge>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-orange-600">
                {formatCurrency(totalPendingAmount || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/tenants/edit/${tenant.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/tenants`}>
              <Eye className="h-4 w-4 mr-1" />
              Detail
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
