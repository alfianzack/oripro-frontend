'use client'

import React, { useState, useEffect } from 'react'
import { Role } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface RoleDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
}

export default function RoleDetailDialog({
  open,
  onOpenChange,
  role
}: RoleDetailDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getLevelBadge = (level: number) => {
    if (level >= 100) {
      return { label: 'Super Admin', variant: 'destructive' as const, description: 'Akses penuh ke semua fitur sistem' }
    } else if (level >= 50) {
      return { label: 'Admin', variant: 'default' as const, description: 'Akses admin dengan beberapa pembatasan' }
    } else if (level >= 20) {
      return { label: 'Manager', variant: 'secondary' as const, description: 'Akses manajerial untuk tim' }
    } else if (level >= 10) {
      return { label: 'Staff', variant: 'outline' as const, description: 'Akses staff untuk operasional' }
    } else {
      return { label: 'User', variant: 'outline' as const, description: 'Akses terbatas untuk pengguna biasa' }
    }
  }

  if (!role) return null

  const levelBadge = getLevelBadge(role.level)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detail Role: {role.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nama Role
                  </label>
                  <p className="text-sm font-medium">{role.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Level
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {role.level}
                    </span>
                    <Badge variant={levelBadge.variant}>
                      {levelBadge.label}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Deskripsi Level
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {levelBadge.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">Level Numerik</p>
                    <p className="text-sm text-muted-foreground">
                      Nilai level untuk hierarki akses
                    </p>
                  </div>
                  <span className="text-2xl font-bold font-mono">
                    {role.level}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium">Super Admin</p>
                    <p className="text-xs text-muted-foreground">Level 100+</p>
                    <div className="mt-2">
                      <Badge variant={role.level >= 100 ? "destructive" : "outline"} className="text-xs">
                        {role.level >= 100 ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-xs text-muted-foreground">Level 50-99</p>
                    <div className="mt-2">
                      <Badge variant={role.level >= 50 && role.level < 100 ? "default" : "outline"} className="text-xs">
                        {role.level >= 50 && role.level < 100 ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium">Manager</p>
                    <p className="text-xs text-muted-foreground">Level 20-49</p>
                    <div className="mt-2">
                      <Badge variant={role.level >= 20 && role.level < 50 ? "secondary" : "outline"} className="text-xs">
                        {role.level >= 20 && role.level < 50 ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium">Staff</p>
                    <p className="text-xs text-muted-foreground">Level 10-19</p>
                    <div className="mt-2">
                      <Badge variant={role.level >= 10 && role.level < 20 ? "outline" : "outline"} className="text-xs">
                        {role.level >= 10 && role.level < 20 ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Sistem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID Role
                  </label>
                  <p className="text-sm font-mono text-xs bg-muted p-2 rounded mt-1">
                    {role.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant="default">
                      Aktif
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
