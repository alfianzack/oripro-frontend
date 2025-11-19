'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Building2, 
  RefreshCw,
  Loader2,
  CreditCard,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { Tenant, tenantsApi, Unit, unitsApi, Asset, assetsApi, TenantPaymentLog, TenantDepositLog, authApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface TenantWithPayment extends Tenant {
  units?: Unit[]
  pendingPayments?: TenantPaymentLog[]
  totalPendingAmount?: number
  depositLogs?: TenantDepositLog[]
}

export default function DashboardTenantPage() {
  const [tenants, setTenants] = useState<TenantWithPayment[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentStatusBadge = (status?: number) => {
    if (status === undefined || status === null) {
      return <Badge variant="secondary">Unknown</Badge>
    }
    switch (status) {
      case 0:
        return <Badge variant="destructive">Unpaid</Badge>
      case 1:
        return <Badge variant="default" className="bg-green-600">Paid</Badge>
      case 2:
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const loadData = async () => {
    try {
      setRefreshing(true)
      
      // Get current user
      const currentUser = await authApi.getCurrentUser()
      if (!currentUser || !currentUser.id) {
        toast.error('User tidak ditemukan. Silakan login kembali.')
        return
      }

      // Load tenants, units, and assets in parallel
      // Filter tenants by current user's ID
      const [tenantsResponse, unitsResponse, assetsResponse] = await Promise.all([
        tenantsApi.getTenants({ user_id: currentUser.id }),
        unitsApi.getUnits(),
        assetsApi.getAssets()
      ])

      let tenantsData: TenantWithPayment[] = []
      if (tenantsResponse.success && tenantsResponse.data) {
        const tenantsDataResponse = tenantsResponse.data as any;
        tenantsData = Array.isArray(tenantsDataResponse.data) 
          ? tenantsDataResponse.data 
          : []
      }

      let unitsData: Unit[] = []
      if (unitsResponse.success && unitsResponse.data) {
        unitsData = Array.isArray(unitsResponse.data) 
          ? unitsResponse.data 
          : []
        setUnits(unitsData)
      }

      if (assetsResponse.success && assetsResponse.data) {
        const assetsData = Array.isArray(assetsResponse.data) 
          ? assetsResponse.data 
          : []
        setAssets(assetsData)
      }

      // Load pending payments and deposit logs for each tenant
      const tenantsWithPayments = await Promise.all(
        tenantsData.map(async (tenant) => {
          try {
            // Get unpaid payments (status = 0)
            const paymentResponse = await tenantsApi.getTenantPaymentLogs(tenant.id, {
              status: 0, // unpaid
              limit: 100
            })

            let pendingPayments: TenantPaymentLog[] = []
            let totalPendingAmount = 0
            
            if (paymentResponse.success && paymentResponse.data) {
              const paymentData = paymentResponse.data as any;
              pendingPayments = Array.isArray(paymentData.data) 
                ? paymentData.data 
                : []
              
              totalPendingAmount = pendingPayments.reduce((sum, payment) => {
                return sum + (payment.amount || 0)
              }, 0)
            }

            // Get deposit logs
            const depositResponse = await tenantsApi.getTenantDepositLogs(tenant.id)
            let depositLogs: TenantDepositLog[] = []

            if (depositResponse.success && depositResponse.data) {
              const depositData = depositResponse.data as any
              depositLogs = Array.isArray(depositData.data) 
                ? depositData.data 
                : (Array.isArray(depositData) ? depositData : [])
            }

            // Get units for this tenant
            let tenantUnits: Unit[] = []
            if (tenant.units && tenant.units.length > 0) {
              tenantUnits = tenant.units
            } else if (tenant.unit_ids && tenant.unit_ids.length > 0) {
              tenantUnits = unitsData.filter(u => tenant.unit_ids?.includes(u.id))
            }

            return {
              ...tenant,
              units: tenantUnits,
              pendingPayments,
              totalPendingAmount,
              depositLogs
            }
          } catch (error) {
            console.error(`Error loading data for tenant ${tenant.id}:`, error)
            return {
              ...tenant,
              units: tenant.units || (tenant.unit_ids ? unitsData.filter(u => tenant.unit_ids?.includes(u.id)) : []),
              pendingPayments: [],
              totalPendingAmount: 0,
              depositLogs: []
            }
          }
        })
      )

      setTenants(tenantsWithPayments)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data dashboard tenant...</span>
        </div>
      </div>
    )
  }

  // Get all pending payments from all tenants
  const allPendingPayments = tenants.flatMap(tenant => 
    (tenant.pendingPayments || []).map(payment => ({
      ...payment,
      tenantName: tenant.name,
      tenantId: tenant.id
    }))
  )

  // Get all deposit logs from all tenants
  const allDepositLogs = tenants.flatMap(tenant => 
    (tenant.depositLogs || []).map(log => ({
      ...log,
      tenantName: tenant.name,
      tenantId: tenant.id
    }))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Tenant</h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang unit yang disewa, pending payment, dan deposit
          </p>
        </div>
        <Button onClick={loadData} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pending Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pending Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allPendingPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Batas Pembayaran</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Pembayaran</TableHead>
                    <TableHead>Metode Pembayaran</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead>Diubah Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPendingPayments.map((log) => {
                    const amount = log.amount || 0
                    const formattedAmount = new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(amount)

                    return (
                      <TableRow key={`${log.tenantId}-${log.id}`}>
                        <TableCell className="font-medium">
                          {log.tenantName}
                        </TableCell>
                        <TableCell>
                          {log.payment_deadline ? formatDate(log.payment_deadline) : '-'}
                        </TableCell>
                        <TableCell>
                          {amount > 0 ? formattedAmount : '-'}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(log.status)}
                        </TableCell>
                        <TableCell>
                          {log.payment_date ? formatDate(log.payment_date) : '-'}
                        </TableCell>
                        <TableCell>
                          {log.payment_method || '-'}
                        </TableCell>
                        <TableCell>
                          {log.notes || '-'}
                        </TableCell>
                        <TableCell>
                          {log.updatedBy ? (
                            <div>
                              <p className="font-medium text-sm">{log.updatedBy.name}</p>
                              <p className="text-xs text-muted-foreground">{log.updatedBy.email}</p>
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
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada pending payment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            History Deposito
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allDepositLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>New Deposit</TableHead>
                    <TableHead>Old Deposit</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDepositLogs.map((log) => {
                    const reason = log.reason || '-'
                    const newDeposit = log.new_deposit || 0
                    const oldDeposit = log.old_deposit || 0
                    
                    return (
                      <TableRow key={`${log.tenantId}-${log.id}`}>
                        <TableCell className="font-medium">
                          {log.tenantName}
                        </TableCell>
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

      {/* Unit yang Disewa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Unit yang Disewa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Belum ada data tenant</p>
                <Button asChild>
                  <Link href="/tenants/create">
                    Tambah Tenant Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tenants.map((tenant) => {
                  const tenantUnits = tenant.units || []
                  
                  if (tenantUnits.length === 0) {
                    return null
                  }

                  return (
                    <Card key={tenant.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{tenant.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">Kode: {tenant.code}</p>
                          </div>
                          {tenant.pendingPayments && tenant.pendingPayments.length > 0 && (
                            <div className="text-right">
                              <Badge variant="destructive" className="mb-1">
                                {tenant.pendingPayments.length} Pending Payment
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0
                                }).format(tenant.totalPendingAmount || 0)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">
                            Unit Disewa ({tenantUnits.length}):
                          </p>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {tenantUnits.map((unit) => {
                              const asset = assets.find(a => a.id === unit.asset_id)
                              return (
                                <div key={unit.id} className="bg-gray-50 p-3 rounded-lg border">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="font-medium text-sm">{unit.name}</p>
                                      {asset && (
                                        <p className="text-xs text-muted-foreground">{asset.name}</p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      Disewa
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>Ukuran: {unit.size} m²</div>
                                    <div>
                                      Harga: {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0
                                      }).format(unit.rent_price || 0)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {tenants.every(t => (t.units?.length || 0) === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada unit yang disewa</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
