'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Building2, Home, Users } from "lucide-react"
import { dashboardApi, DashboardStats } from "@/lib/api"
import LoadingSkeleton from "@/components/loading-skeleton"

export default function DashboardStatCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getDashboardStats()
      console.log('Dashboard Stats API Response:', response)
      if (response.data) {
        setStats(response.data)
      } else {
        console.warn('Dashboard stats response has no data:', response)
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} height="h-32" text="Loading..." />
        ))}
      </>
    )
  }

  if (!stats) {
    return null
  }

  // Safe defaults untuk menghindari undefined errors
  const safeStats = {
    totalRevenue: stats.totalRevenue || {
      value: 0,
      formatted: 'Rp 0',
      change: '+0% vs last year',
      changeType: 'positive' as const,
    },
    totalAssets: stats.totalAssets || {
      value: 0,
      formatted: '0',
      change: '+0% vs last year',
      changeType: 'positive' as const,
    },
    totalUnits: stats.totalUnits || {
      value: 0,
      formatted: '0',
      change: '+0% vs last year',
      changeType: 'positive' as const,
    },
    totalTenants: stats.totalTenants || {
      value: 0,
      formatted: '0',
      change: '+0% vs last year',
      changeType: 'positive' as const,
    },
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: safeStats.totalRevenue.formatted,
      change: safeStats.totalRevenue.change,
      changeType: safeStats.totalRevenue.changeType as "positive" | "negative",
      icon: DollarSign,
    },
    {
      title: "Total Asset",
      value: safeStats.totalAssets.formatted,
      change: safeStats.totalAssets.change,
      changeType: safeStats.totalAssets.changeType as "positive" | "negative",
      icon: Building2,
    },
    {
      title: "Total Units",
      value: safeStats.totalUnits.formatted,
      change: safeStats.totalUnits.change,
      changeType: safeStats.totalUnits.changeType as "positive" | "negative",
      icon: Home,
    },
    {
      title: "Total Tenant",
      value: safeStats.totalTenants.formatted,
      change: safeStats.totalTenants.change,
      changeType: safeStats.totalTenants.changeType as "positive" | "negative",
      icon: Users,
    }
  ]

  return (
    <>
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                {stat.change}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
