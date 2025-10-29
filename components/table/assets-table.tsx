'use client'

import React, { useState, useEffect } from 'react'
import { Asset, assetsApi, ASSET_TYPE_LABELS } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, Eye, History } from 'lucide-react'
import toast from 'react-hot-toast'

interface AssetsTableProps {
  assets: Asset[]
  onEdit: (asset: Asset) => void
  onView: (asset: Asset) => void
  onRefresh: () => void
  loading?: boolean
}

export default function AssetsTable({ 
  assets, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false 
}: AssetsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return

    setDeleting(true)
    try {
      const response = await assetsApi.deleteAsset(assetToDelete.id)
      
      if (response.success) {
        toast.success('Asset berhasil dihapus')
        onRefresh()
      } else {
        toast.error(response.error || 'Gagal menghapus asset')
      }
    } catch (error) {
      console.error('Delete asset error:', error)
      toast.error('Terjadi kesalahan saat menghapus asset')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setAssetToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAssetTypeLabel = (assetType: number | string) => {
    // Handle both integer and string asset types from backend
    if (typeof assetType === 'string') {
      // Map string values to labels directly
      const stringToLabel: { [key: string]: string } = {
        'ESTATE': 'Estate',
        'OFFICE': 'Office', 
        'WAREHOUSE': 'Warehouse',
        'SPORT': 'Sport',
        'ENTERTAINMENTRESTAURANT': 'Entertainment/Restaurant',
        'RESIDENCE': 'Residence',
        'MALL': 'Mall',
        'SUPPORTFACILITYMOSQUEITAL': 'Support Facility/Mosque',
        'PARKINGLOT': 'Parking Lot',
      }
      return stringToLabel[assetType] || 'Unknown'
    }
    return ASSET_TYPE_LABELS[assetType] || 'Unknown'
  }

  const getStatusBadgeVariant = (status: number | string) => {
    // Handle both integer and string status from backend
    if (typeof status === 'string') {
      switch (status) {
        case 'active':
          return 'default'
        case 'inactive':
          return 'secondary'
        default:
          return 'outline'
      }
    }
    switch (status) {
      case 1:
        return 'default'
      case 0:
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: number | string) => {
    // Handle both integer and string status from backend
    if (typeof status === 'string') {
      switch (status) {
        case 'active':
          return 'Aktif'
        case 'inactive':
          return 'Tidak Aktif'
        default:
          return 'Tidak Diketahui'
      }
    }
    switch (status) {
      case 1:
        return 'Aktif'
      case 0:
        return 'Tidak Aktif'
      default:
        return 'Tidak Diketahui'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tipe Asset</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Luas (m²)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Tidak ada data asset
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset, index) => {
                const isLast = index === assets.length - 1;
                return (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{String(index + 1)}</TableCell>
                  <TableCell className="font-medium">
                    {asset.name || '-'}
                  </TableCell>
                  <TableCell>{asset.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getAssetTypeLabel(asset.asset_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {asset.address || '-'}
                  </TableCell>
                  <TableCell>{asset.area ? `${asset.area} m²` : '-'}</TableCell>
                  <TableCell>
                      <span
                          className={`px-3 py-1.5 rounded text-sm font-medium border ${(asset.status === 1 || asset.status === 'active')
                              ? "bg-green-600/15 text-green-600 border-green-600"
                              : "bg-gray-600/15 text-gray-600 dark:text-white border-gray-400"
                              }`}
                      >
                          {getStatusLabel(asset.status)}
                      </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(asset.created_at)}
                  </TableCell>
                  <TableCell
                      className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${isLast ? "rounded-bl-lg" : ""
                          }`}
                  >
                      <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onView(asset)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                              <Eye className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(asset)} className="rounded-[50%] text-green-600 bg-green-600/10">
                              <Edit className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(asset)} className="rounded-[50%] text-red-500 bg-red-500/10">
                              <Trash2 className="w-5 h-5" />
                          </Button>
                      </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus asset <strong>{assetToDelete?.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
