'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from 'next/dynamic'
import { ApexOptions } from "apexcharts"
import { DashboardComplaintStats } from "@/lib/api"

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface GrafikKomplainProps {
  stats: DashboardComplaintStats
}

export default function GrafikKomplain({ stats }: GrafikKomplainProps) {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    labels: ['Belum Ditangani', 'Sedang Ditangani', 'Selesai'],
    colors: ['#EF4444', '#F59E0B', '#10B981'],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      markers: {
        size: 6,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#374151',
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              formatter: function (val) {
                return val.toString()
              }
            },
            total: {
              show: true,
              label: 'Total Tiket',
              fontSize: '14px',
              fontWeight: 600,
              color: '#6B7280',
              formatter: function () {
                return stats.total.toString()
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toString() + ' tiket'
        }
      }
    },
  }

  const chartSeries = [stats.pending, stats.in_progress, stats.resolved + stats.closed]

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Grafik Komplain
        </CardTitle>
        <Select defaultValue="minggu-2">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minggu-1">Minggu-1, Oktober 2025</SelectItem>
            <SelectItem value="minggu-2">Minggu-2, Oktober 2025</SelectItem>
            <SelectItem value="minggu-3">Minggu-3, Oktober 2025</SelectItem>
            <SelectItem value="minggu-4">Minggu-4, Oktober 2025</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="donut"
          height={300}
        />
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Belum Ditangani: {stats.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Sedang Ditangani: {stats.in_progress}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Selesai: {stats.resolved + stats.closed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

