'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Building2, Home, Users } from "lucide-react"

export default function DashboardStatCards() {
  const stats = [
    {
      title: "Total Revenue",
      value: "Rp 2.000.000.000",
      change: "+2% vs last year",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Total Asset",
      value: "8",
      change: "+2% vs last year",
      changeType: "positive" as const,
      icon: Building2,
    },
    {
      title: "Total Units",
      value: "38",
      change: "+2% vs last year",
      changeType: "positive" as const,
      icon: Home,
    },
    {
      title: "Total Tenant",
      value: "30",
      change: "-2% vs last year",
      changeType: "negative" as const,
      icon: Users,
    }
  ]

  return (
    <>
      {stats.map((stat, index) => (
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
