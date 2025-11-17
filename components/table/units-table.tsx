'use client'

import React, { useState, useEffect } from 'react'
import { Unit, unitsApi } from '@/lib/api'
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

interface UnitsTableProps {
  units: Unit[]
  onEdit: (unit: Unit) => void
  onView: (unit: Unit) => void
  onRefresh: () => void
  loading?: boolean
}

export default function UnitsTable({ 
  units, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false 
}: UnitsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return

    setDeleting(true)
    try {
      const response = await unitsApi.deleteUnit(unitToDelete.id)
      
      if (response.success) {
        toast.success('Unit berhasil dihapus')
        onRefresh()
      } else {
        toast.error(response.error || 'Gagal menghapus unit')
      }
    } catch (error) {
      console.error('Delete unit error:', error)
      toast.error('Terjadi kesalahan saat menghapus unit')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setUnitToDelete(null)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status?: string) => {
    if (status === undefined || status === null) {
      return {
        label: 'Unknown',
        className: 'bg-gray-600/15 text-gray-600 dark:text-white border-gray-400'
      }
    }
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          className: 'bg-green-600/15 text-green-600 border-green-600'
        }
      case 'occupied':
        return {
          label: 'Occupied',
          className: 'bg-blue-600/15 text-blue-600 border-blue-600'
        }
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-600/15 text-gray-600 dark:text-white border-gray-400'
        }
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
              <TableHead>Nama Unit</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Ukuran (m²)</TableHead>
              <TableHead>Daya Listrik</TableHead>
              <TableHead>Toilet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Tidak ada data unit
                </TableCell>
              </TableRow>
            ) : (
              units.map((unit, index) => {
                const isLast = index === units.length - 1;
                return (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{String(index + 1)}</TableCell>
                  <TableCell className="font-medium">
                    {unit.name || '-'}
                  </TableCell>
                  <TableCell>
                    {unit.asset?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {unit.size ? `${unit.size} m²` : '-'}
                  </TableCell>
                  <TableCell>
                    {unit.electrical_power ? `${unit.electrical_power} ${unit.electrical_unit || 'Watt'}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={unit.is_toilet_exist ? 'default' : 'secondary'}>
                      {unit.is_toilet_exist ? 'Ada' : 'Tidak Ada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const statusInfo = getStatusBadge(unit.status)
                      return (
                        <span
                          className={`px-3 py-1.5 rounded text-sm font-medium border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(unit.created_at)}
                  </TableCell>
                  <TableCell
                      className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${isLast ? "rounded-bl-lg" : ""
                          }`}
                  >
                      <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onView(unit)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                              <Eye className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(unit)} className="rounded-[50%] text-green-600 bg-green-600/10">
                              <Edit className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(unit)} className="rounded-[50%] text-red-500 bg-red-500/10">
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
              Apakah Anda yakin ingin menghapus unit <strong>{unitToDelete?.name}</strong>?
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