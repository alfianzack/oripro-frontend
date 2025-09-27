'use client'

import React, { useState, useEffect } from 'react'
import { Menu } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, X, Calendar, User, Menu as MenuIcon } from 'lucide-react'

interface MenuDetailDialogProps {
  menu: Menu
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MenuDetailDialog({ menu, open, onOpenChange }: MenuDetailDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary'
  }

  const getStatusDisplayText = (isActive: boolean) => {
    return isActive ? 'Aktif' : 'Tidak Aktif'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MenuIcon className="h-5 w-5" />
            Detail Menu
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang menu "{menu.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm font-semibold">{menu.title || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">URL</label>
                  <p className="text-sm font-semibold">{menu.url || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Icon</label>
                  <p className="text-sm font-semibold">{menu.icon || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(menu.is_active)}>
                      {getStatusDisplayText(menu.is_active)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent ID</label>
                  <p className="text-sm font-semibold">{menu.parent_id || 'Parent Menu'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Order</label>
                  <p className="text-sm font-semibold">{menu.order || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Waktu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dibuat</label>
                    <p className="text-sm font-semibold">{formatDate(menu.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Diperbarui</label>
                    <p className="text-sm font-semibold">{formatDate(menu.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="mr-2 h-4 w-4" />
              Tutup
            </Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Menu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}