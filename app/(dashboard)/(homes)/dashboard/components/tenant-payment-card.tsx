'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, Loader2 } from "lucide-react"
import { tenantsApi, Tenant, TenantPaymentLog } from "@/lib/api"
import LoadingSkeleton from "@/components/loading-skeleton"

interface TenantWithPaymentStatus extends Tenant {
  paymentStatus?: 'overdue' | 'expiring'
  daysRemaining?: number
  daysOverdue?: number
  lastPayment?: TenantPaymentLog | null
}

export default function TenantPaymentCard() {
  const [overdueTenants, setOverdueTenants] = useState<TenantWithPaymentStatus[]>([])
  const [expiringTenants, setExpiringTenants] = useState<TenantWithPaymentStatus[]>([])
  const [loading, setLoading] = useState(true)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      
      // Get all tenants
      const tenantsResponse = await tenantsApi.getTenants({ limit: 1000 })
      
      if (!tenantsResponse.success || !tenantsResponse.data) {
        setOverdueTenants([])
        setExpiringTenants([])
        return
      }

      const responseData = tenantsResponse.data as any
      const tenants = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      // Helper: Parse rent duration unit
      const getRentType = (unit: string | number) => {
        const unitStr = String(unit).toLowerCase()
        return {
          isMonthly: unitStr === 'month' || unitStr === '0',
          isYearly: unitStr === 'year' || unitStr === '1'
        }
      }
      
      // Helper: Get period boundaries
      const getPeriodBoundaries = (isMonthly: boolean, isYearly: boolean) => {
        const start = new Date(now)
        const end = new Date(now)
        
        if (isMonthly) {
          start.setDate(1)
          start.setHours(0, 0, 0, 0)
          end.setMonth(end.getMonth() + 1, 0)
          end.setHours(23, 59, 59, 999)
        } else if (isYearly) {
          start.setMonth(0, 1)
          start.setHours(0, 0, 0, 0)
          end.setMonth(11, 31)
          end.setHours(23, 59, 59, 999)
        }
        
        return { start, end }
      }
      
      // Helper: Sort payments by deadline
      const sortByDeadline = (payments: TenantPaymentLog[]) => 
        payments.sort((a, b) => {
          const dateA = a.payment_deadline ? new Date(a.payment_deadline).getTime() : 0
          const dateB = b.payment_deadline ? new Date(b.payment_deadline).getTime() : 0
          return dateB - dateA
        })

      // Fetch all payments in parallel
      const paymentPromises = tenants.map((tenant: Tenant) => 
        tenantsApi.getTenantPaymentLogs(tenant.id, { limit: 10 })
          .then(response => ({ tenant, response }))
          .catch(error => {
            console.error(`Error loading payment for tenant ${tenant.id}:`, error)
            return { tenant, response: null }
          })
      )

      const allPaymentData = await Promise.all(paymentPromises)
      
      const overdueList: TenantWithPaymentStatus[] = []
      const expiringList: TenantWithPaymentStatus[] = []

      // Process each tenant
      for (const { tenant, response } of allPaymentData) {
        let paymentStatus: 'paid' | 'scheduled' | 'reminder_needed' | 'overdue' = 'scheduled'
        let lastPayment: TenantPaymentLog | null = null

        if (response?.success && response.data) {
          const paymentsData = response.data as any
          const payments = Array.isArray(paymentsData.data) 
            ? paymentsData.data 
            : (Array.isArray(paymentsData) ? paymentsData : [])
          
          if (payments.length > 0) {
            const { isMonthly, isYearly } = getRentType(tenant.rent_duration_unit)
            const { start: periodStart, end: periodEnd } = getPeriodBoundaries(isMonthly, isYearly)
            
            // Find payment in current period
            lastPayment = payments.find((p: TenantPaymentLog) => {
              if (!p.payment_deadline) return false
              const deadline = new Date(p.payment_deadline)
              return deadline >= periodStart && deadline <= periodEnd
            })

            // Fallback to unpaid or most recent payment
            if (!lastPayment) {
              const unpaidPayments = payments.filter((p: TenantPaymentLog) => p.status === 0 || p.status === 2)
              lastPayment = sortByDeadline(unpaidPayments.length > 0 ? unpaidPayments : payments)[0]
            }

            // Determine status
            if (lastPayment?.payment_deadline) {
              const deadline = new Date(lastPayment.payment_deadline)
              deadline.setHours(0, 0, 0, 0)
              
              const nowDateOnly = new Date(now)
              nowDateOnly.setHours(0, 0, 0, 0)
              
              const diffDays = Math.ceil((deadline.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24))
              const diffMonths = diffDays / 30

              // Check if paid and in current period
              if (lastPayment.status === 1) {
                const deadlineMonth = deadline.getMonth()
                const deadlineYear = deadline.getFullYear()
                
                if ((isMonthly && deadlineMonth === currentMonth && deadlineYear === currentYear) ||
                    (isYearly && deadlineYear === currentYear)) {
                  paymentStatus = 'paid'
                }
              }
              
              // Check overdue or reminder for unpaid
              if (paymentStatus !== 'paid') {
                if (diffDays < 0) {
                  paymentStatus = 'overdue'
                } else if ((isYearly && diffMonths <= 3) || (isMonthly && diffDays <= 7)) {
                  paymentStatus = 'reminder_needed'
                }
              }
            }
          }
        }

        // Fallback to contract end date
        if (!lastPayment && tenant.contract_end_at) {
          const contractEnd = new Date(tenant.contract_end_at)
          contractEnd.setHours(0, 0, 0, 0)
          
          const nowDateOnly = new Date(now)
          nowDateOnly.setHours(0, 0, 0, 0)
          
          const diffDays = Math.ceil((contractEnd.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24))
          const { isMonthly, isYearly } = getRentType(tenant.rent_duration_unit)

          if (diffDays < 0) {
            paymentStatus = 'overdue'
          } else if ((isYearly && diffDays <= 90) || (isMonthly && diffDays <= 7)) {
            paymentStatus = 'reminder_needed'
          }
        }

        // Add to appropriate list based on status
        if (paymentStatus === 'overdue') {
          const deadline = lastPayment?.payment_deadline || tenant.contract_end_at
          if (deadline) {
            const deadlineDate = new Date(deadline)
            deadlineDate.setHours(0, 0, 0, 0)
            const nowDateOnly = new Date(now)
            nowDateOnly.setHours(0, 0, 0, 0)
            const diffDays = Math.ceil((deadlineDate.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24))
            
            overdueList.push({
              ...tenant,
              paymentStatus: 'overdue',
              daysOverdue: Math.abs(diffDays),
              lastPayment
            })
          }
        } else if (paymentStatus === 'reminder_needed') {
          const deadline = lastPayment?.payment_deadline || tenant.contract_end_at
          if (deadline) {
            const deadlineDate = new Date(deadline)
            deadlineDate.setHours(0, 0, 0, 0)
            const nowDateOnly = new Date(now)
            nowDateOnly.setHours(0, 0, 0, 0)
            const diffDays = Math.ceil((deadlineDate.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24))
            
            expiringList.push({
              ...tenant,
              paymentStatus: 'expiring',
              daysRemaining: diffDays,
              lastPayment
            })
          }
        }
      }

      // Sort overdue by days overdue (most overdue first)
      overdueList.sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0))
      
      // Sort expiring by days remaining (soonest first)
      expiringList.sort((a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0))

      setOverdueTenants(overdueList.slice(0, 5)) // Limit to 5
      setExpiringTenants(expiringList.slice(0, 5)) // Limit to 5
    } catch (err) {
      console.error('Error loading tenant payment data:', err)
      setOverdueTenants([])
      setExpiringTenants([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Tenant Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <LoadingSkeleton height="h-64" text="Memuat data..." />
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="p-6 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Tenant Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-y-auto">
        {/* Overdue Tenants Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-semibold text-gray-700">
              Jatuh Tempo (Belum Bayar)
            </h3>
          </div>
          {overdueTenants.length > 0 ? (
            <div className="space-y-3">
              {overdueTenants.map((tenant) => (
                <div key={tenant.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Jatuh tempo: {tenant.lastPayment?.payment_deadline ? formatDate(tenant.lastPayment.payment_deadline) : (tenant.contract_end_at ? formatDate(tenant.contract_end_at) : '-')}
                      </p>
                      {tenant.daysOverdue !== undefined && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          Terlambat {tenant.daysOverdue} hari
                        </p>
                      )}
                      {tenant.lastPayment && tenant.lastPayment.amount && (
                        <p className="text-xs text-gray-600 mt-1">
                          Tagihan: {formatCurrency(tenant.lastPayment.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Tidak ada tenant yang jatuh tempo
            </p>
          )}
        </div>

        {/* Expiring Tenants Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-semibold text-gray-700">
              Akan Jatuh Tempo
            </h3>
          </div>
          {expiringTenants.length > 0 ? (
            <div className="space-y-3">
              {expiringTenants.map((tenant) => (
                <div key={tenant.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Jatuh tempo: {tenant.lastPayment?.payment_deadline ? formatDate(tenant.lastPayment.payment_deadline) : (tenant.contract_end_at ? formatDate(tenant.contract_end_at) : '-')}
                      </p>
                      {tenant.daysRemaining !== undefined && (
                        <p className="text-xs text-yellow-600 mt-1 font-medium">
                          {tenant.daysRemaining === 0 ? 'Hari ini' : `${tenant.daysRemaining} hari lagi`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Tidak ada tenant yang akan jatuh tempo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

