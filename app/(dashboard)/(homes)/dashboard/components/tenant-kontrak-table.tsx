'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import Link from "next/link"
import { DashboardExpiringTenant, Tenant, TenantPaymentLog } from "@/lib/api"
import { tenantsApi } from "@/lib/api"
import { useEffect, useState } from "react"

interface TenantWithPayment extends Tenant {
  paymentDate?: string
  paymentStatus?: 'overdue' | 'reminder_needed' | 'scheduled'
  lastPayment?: TenantPaymentLog | null
}

export default function TenantKontrakTable() {
  const [tenants, setTenants] = useState<TenantWithPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      
      // Get all tenants
      const tenantsResponse = await tenantsApi.getTenants({ limit: 100 })
      
      if (!tenantsResponse.success || !tenantsResponse.data) {
        setTenants([])
        return
      }

      const responseData = tenantsResponse.data as any
      const allTenants = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])

      const now = new Date()
      const tenantsWithPayment: TenantWithPayment[] = []

      // Process each tenant
      for (const tenant of allTenants) {
        // Get payment logs for this tenant
        let lastPayment: TenantPaymentLog | null = null
        let paymentStatus: 'overdue' | 'reminder_needed' | 'scheduled' = 'scheduled'
        let paymentDate: string | undefined

        try {
          const paymentsResponse = await tenantsApi.getTenantPaymentLogs(tenant.id, { limit: 10 })
          if (paymentsResponse.success && paymentsResponse.data) {
            const paymentsData = paymentsResponse.data as any
            const payments = Array.isArray(paymentsData.data) ? paymentsData.data : (Array.isArray(paymentsData) ? paymentsData : [])
            
            if (payments.length > 0) {
              // Get the most recent payment (sorted by deadline)
              lastPayment = payments.sort((a: TenantPaymentLog, b: TenantPaymentLog) => {
                const dateA = a.payment_deadline ? new Date(a.payment_deadline).getTime() : 0
                const dateB = b.payment_deadline ? new Date(b.payment_deadline).getTime() : 0
                return dateB - dateA
              })[0]

              if (lastPayment && lastPayment.payment_deadline) {
                paymentDate = lastPayment.payment_deadline
                const deadlineDate = new Date(lastPayment.payment_deadline)
                const diffTime = deadlineDate.getTime() - now.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // Determine status based on payment status and days
                if (lastPayment.status === 0 || lastPayment.status === 2) {
                  // Unpaid or expired
                  if (diffDays < 0) {
                    paymentStatus = 'overdue'
                  } else if (diffDays <= 7) {
                    paymentStatus = 'reminder_needed'
                  } else {
                    paymentStatus = 'scheduled'
                  }
                } else {
                  // Paid
                  paymentStatus = 'scheduled'
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error loading payments for tenant ${tenant.id}:`, error)
        }

        // Only include tenants with payment information
        if (lastPayment) {
          tenantsWithPayment.push({
            ...tenant,
            paymentDate,
            paymentStatus,
            lastPayment
          })
        }
      }

      // Sort by payment date (overdue first, then by date)
      tenantsWithPayment.sort((a, b) => {
        if (a.paymentStatus === 'overdue' && b.paymentStatus !== 'overdue') return -1
        if (a.paymentStatus !== 'overdue' && b.paymentStatus === 'overdue') return 1
        if (a.paymentDate && b.paymentDate) {
          return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
        }
        return 0
      })

      setTenants(tenantsWithPayment.slice(0, 6)) // Limit to 6
    } catch (err) {
      console.error('Error loading tenant kontrak data:', err)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: 'overdue' | 'reminder_needed' | 'scheduled') => {
    switch (status) {
      case 'overdue':
        return (
          <span className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300">
            Overdue
          </span>
        )
      case 'reminder_needed':
        return (
          <span className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
            Reminder Needed
          </span>
        )
      case 'scheduled':
        return (
          <span className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
            Scheduled
          </span>
        )
    }
  }

  const getTenantUnitName = (tenant: Tenant) => {
    const tenantName = tenant.name || 'Unknown'
    if (tenant.units && tenant.units.length > 0) {
      const assetName = tenant.units[0].asset?.name
      if (assetName) {
        return `${tenantName} (${assetName})`
      }
    }
    return tenantName
  }

  if (loading) {
    return (
      <Card className="p-6 h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Tenant Kontrak
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-6 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Tenant Kontrak
        </CardTitle>
        <Link href="/tenants">
          <span className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
            Lihat Semua &gt;
          </span>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {tenants.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-semibold text-gray-700">Nama Tenant</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Tanggal Pembayaran</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium text-sm text-gray-900">
                      {getTenantUnitName(tenant)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(tenant.paymentDate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tenant.paymentStatus || 'scheduled')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex-1 flex items-center justify-center">
            <div>
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada data tenant kontrak</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

