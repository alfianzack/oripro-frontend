'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"
import { DashboardExpiringTenant } from "@/lib/api"

interface TenantKontrakProps {
  tenants: DashboardExpiringTenant[]
}

export default function TenantKontrak({ tenants }: TenantKontrakProps) {
  const formatRemainingTime = (months: number, days: number) => {
    if (months > 0) {
      return `${months} Bulan${months > 1 ? '' : ''}`
    }
    return `${days} Hari`
  }

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Tenant Kontrak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tenants.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Tidak ada kontrak yang akan berakhir
            </div>
          ) : (
            tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {tenant.unit}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Tenant: {tenant.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <FileText className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatRemainingTime(tenant.monthsRemaining, tenant.daysRemaining)}
                    </div>
                    <div className="text-xs text-gray-500">lagi</div>
                  </div>
                </div>
              </div>
            ))
          )}
          {tenants.length > 0 && (
            <Link href="/tenants">
              <Button variant="ghost" size="sm" className="w-full mt-2 text-sm text-blue-600 hover:text-blue-700">
                Lihat lainnya
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

