'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from 'next/dynamic'
import { ApexOptions } from "apexcharts"
import { DashboardDailyTaskCompletion } from "@/lib/api"

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface DailyTaskCompletionProps {
  data: DashboardDailyTaskCompletion[]
}

export default function DailyTaskCompletion({ data }: DailyTaskCompletionProps) {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: data.map(d => d.day),
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        formatter: function (val) {
          return val + '%'
        },
        style: {
          fontSize: '12px',
          colors: '#6B7280'
        }
      }
    },
    fill: {
      opacity: 1,
      colors: ['#3B82F6', '#F59E0B']
    },
    colors: ['#3B82F6', '#F59E0B'],
    grid: {
      show: true,
      borderColor: '#E5E7EB',
      strokeDashArray: 3,
    },
    legend: {
      show: true,
      position: 'bottom',
      markers: {
        size: 6
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + '%'
        }
      }
    },
    annotations: {
      yaxis: [{
        y: 90,
        borderColor: '#EF4444',
        borderWidth: 2,
        strokeDashArray: 5,
        label: {
          text: 'Target',
          style: {
            color: '#EF4444',
            fontSize: '12px',
            fontWeight: 600
          },
          position: 'right'
        }
      }]
    }
  }

  // Group data by role if available, otherwise use single series
  // For now, we'll create two series (Cleaning and Security) with same data
  // In production, this should come from backend grouped by role
  const chartSeries = [
    {
      name: 'Cleaning',
      data: data.map(d => d.completion)
    },
    {
      name: 'Security',
      data: data.map(d => Math.max(0, d.completion - 5)) // Slight variation for demo
    }
  ]

  return (
    <Card className="p-6 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Daily task completion
        </CardTitle>
        <Select defaultValue="mingguan">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Pilih Tampilan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mingguan">Tampilan Mingguan</SelectItem>
            <SelectItem value="bulanan">Tampilan Bulanan</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={300}
        />
      </CardContent>
    </Card>
  )
}

