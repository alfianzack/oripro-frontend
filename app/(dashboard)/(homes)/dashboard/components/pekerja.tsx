'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"
import Link from "next/link"
import { DashboardWorker } from "@/lib/api"

interface PekerjaProps {
  workers: DashboardWorker[]
}

export default function Pekerja({ workers }: PekerjaProps) {
  const getRoleBadge = (role: string) => {
    const roleLower = role.toLowerCase()
    if (roleLower === 'cleaning') {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Cleaning</Badge>
    } else if (roleLower === 'security') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Security</Badge>
    }
    return <Badge>{role}</Badge>
  }

  return (
    <Card className="p-6 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Pekerja
        </CardTitle>
        <Link href="/users">
          <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700">
            Lihat Semua
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {workers.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Tidak ada data pekerja
            </div>
          ) : (
            workers.map((worker) => (
              <div
                key={worker.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {worker.name}
                      </div>
                      <div className="mt-1">
                        {getRoleBadge(worker.role)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Attendance</span>
                      <span>{worker.attendance}%</span>
                    </div>
                    <Progress value={worker.attendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Task Completion</span>
                      <span>{worker.taskCompletion}%</span>
                    </div>
                    <Progress value={worker.taskCompletion} className="h-2" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

