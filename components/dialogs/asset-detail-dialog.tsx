'use client'

import React from 'react'
import { Asset, ASSET_TYPE_LABELS } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface AssetDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
}

export default function AssetDetailDialog({
  open,
  onOpenChange,
  asset,
}: AssetDetailDialogProps) {
  if (!asset) return null

  const getAssetTypeLabel = (assetType: number) => {
    return ASSET_TYPE_LABELS[assetType] || 'Unknown'
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Active'
      case 0:
        return 'Inactive'
      default:
        return 'Unknown'
    }
  }

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case 1:
        return 'default'
      case 0:
        return 'secondary'
      default:
        return 'outline'
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detail Asset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nama Asset
                </label>
                <p className="text-sm font-medium">{asset.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kode Asset
                </label>
                <p className="text-sm font-medium">{asset.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tipe Asset
                </label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {getAssetTypeLabel(asset.asset_type)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(asset.status)}>
                    {getStatusLabel(asset.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Lokasi</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Alamat
                </label>
                <p className="text-sm">{asset.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Luas Area
                  </label>
                  <p className="text-sm font-medium">
                    {asset.area ? `${asset.area} m²` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Longitude
                  </label>
                  <p className="text-sm font-medium">{asset.longitude}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Latitude
                  </label>
                  <p className="text-sm font-medium">{asset.latitude}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {asset.description && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Deskripsi</h3>
                <p className="text-sm text-muted-foreground">
                  {asset.description}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Dibuat Pada
                </label>
                <p className="text-sm">{formatDate(asset.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Diperbarui Pada
                </label>
                <p className="text-sm">{formatDate(asset.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
