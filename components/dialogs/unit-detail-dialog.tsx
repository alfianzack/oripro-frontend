'use client'

import React, { useState, useEffect } from 'react'
import { Unit } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface UnitDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: Unit | null
}

export default function UnitDetailDialog({
  open,
  onOpenChange,
  unit
}: UnitDetailDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!unit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detail Unit: {unit.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nama Unit
                  </label>
                  <p className="text-sm font-medium">{unit.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset
                  </label>
                  <p className="text-sm font-medium">{unit.asset?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ukuran
                  </label>
                  <p className="text-sm font-medium">
                    {unit.size ? `${unit.size} m²` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Harga Sewa
                  </label>
                  <p className="text-sm font-medium">
                    {unit.rent_price ? formatCurrency(unit.rent_price) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={unit.is_deleted ? 'destructive' : 'default'}>
                      {unit.is_deleted ? 'Dihapus' : 'Aktif'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {unit.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Deskripsi
                  </label>
                  <p className="text-sm mt-1">{unit.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fasilitas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fasilitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Jumlah Lampu
                  </label>
                  <p className="text-sm font-medium">{unit.lamp || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Jumlah Stop Kontak
                  </label>
                  <p className="text-sm font-medium">{unit.electric_socket || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Daya Listrik
                  </label>
                  <p className="text-sm font-medium">
                    {unit.electrical_power ? `${unit.electrical_power} ${unit.electrical_unit || 'Watt'}` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Toilet
                  </label>
                  <div className="mt-1">
                    <Badge variant={unit.is_toilet_exist ? 'default' : 'secondary'}>
                      {unit.is_toilet_exist ? 'Ada' : 'Tidak Ada'}
                    </Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dibuat Pada
                  </label>
                  <p className="text-sm font-medium">{formatDate(unit.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Diperbarui Pada
                  </label>
                  <p className="text-sm font-medium">{formatDate(unit.updated_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID Unit
                  </label>
                  <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                    {unit.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID Asset
                  </label>
                  <p className="text-sm font-mono text-xs bg-muted p-2 rounded">
                    {unit.asset_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}