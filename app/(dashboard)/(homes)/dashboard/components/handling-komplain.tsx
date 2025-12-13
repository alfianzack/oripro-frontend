'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { DashboardComplaint } from "@/lib/api"

interface HandlingKomplainProps {
  complaints: DashboardComplaint[]
}

export default function HandlingKomplain({ complaints }: HandlingKomplainProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Butuh Ditangani</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Sedang Ditangani</Badge>
      case 'resolved':
      case 'closed':
        return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  return (
    <Card className="p-6 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <AlertCircle className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold text-gray-700">
            Handling Komplain
          </CardTitle>
        </div>
        <Link href="/complaint-reports">
          <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700">
            Lihat Semua
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Unit</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Reporter</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Tanggal</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                    Tidak ada komplain
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm text-gray-900">{complaint.unit}</td>
                    <td className="py-3 px-2 text-sm text-gray-700">{complaint.reporter}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{formatDate(complaint.date)}</td>
                    <td className="py-3 px-2">
                      {getStatusBadge(complaint.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

