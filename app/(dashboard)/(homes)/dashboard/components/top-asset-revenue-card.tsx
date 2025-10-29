'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"

export default function TopAssetRevenueCard() {
  const topAssets = [
    {
      name: "Palatehan",
      revenue: "Rp350.000.000",
      icon: Home,
    },
    {
      name: "Blok M",
      revenue: "Rp300.000.000",
      icon: Home,
    },
    {
      name: "Gadog",
      revenue: "Rp250.000.000",
      icon: Home,
    },
    {
      name: "Lebak Bulus",
      revenue: "Rp200.000.000",
      icon: Home,
    },
    {
      name: "Kala",
      revenue: "Rp100.000.000",
      icon: Home,
    },
  ]

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Top Asset Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topAssets.map((asset, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <asset.icon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {asset.name}
                </p>
              </div>
              <div className="flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">
                  {asset.revenue}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Lihat lainnya
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
