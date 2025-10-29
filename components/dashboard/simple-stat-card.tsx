'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, DollarSign } from "lucide-react"

export default function SimpleStatCard() {
  const stats = [
    {
      title: "Total Users",
      value: "20,000",
      change: "+4000",
      changeType: "positive" as const,
      icon: Users,
      description: "Last 30 days users"
    },
    {
      title: "Total Subscription", 
      value: "15,000",
      change: "-800",
      changeType: "negative" as const,
      icon: TrendingUp,
      description: "Last 30 days subscription"
    },
    {
      title: "Total Income",
      value: "$42,000", 
      change: "+$20,000",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Last 30 days income"
    }
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                {stat.change}
              </span>{" "}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
