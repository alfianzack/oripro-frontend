'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, tenantsApi, DURATION_UNIT_LABELS } from '@/lib/api'
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
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface TenantsTableProps {
  tenants: Tenant[]
  onEdit: (tenant: Tenant) => void
  onView: (tenant: Tenant) => void
  onRefresh: () => void
  loading?: boolean
}

export default function TenantsTable({ 
  tenants, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false 
}: TenantsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return

    setDeleting(true)
    try {
      const response = await tenantsApi.deleteTenant(tenantToDelete.id)
      
      if (response.success) {
        toast.success('Tenant berhasil dihapus')
        onRefresh()
      } else {
        toast.error(response.error || 'Gagal menghapus tenant')
      }
    } catch (error) {
      console.error('Delete tenant error:', error)
      toast.error('Terjadi kesalahan saat menghapus tenant')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setTenantToDelete(null)
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

  const getContractStatus = (contractEndAt: string) => {
    const endDate = new Date(contractEndAt)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'expired', label: 'Kadaluarsa', variant: 'destructive' as const }
    } else if (diffDays <= 30) {
      return { status: 'expiring', label: 'Akan Kadaluarsa', variant: 'warning' as const }
    } else {
      return { status: 'active', label: 'Aktif', variant: 'default' as const }
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama Tenant</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Mulai Kontrak</TableHead>
              <TableHead>Berakhir Kontrak</TableHead>
              <TableHead>Durasi Sewa</TableHead>
              <TableHead>Status Kontrak</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Tidak ada data tenant
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant, index) => {
                const isLast = index === tenants.length - 1;
                const contractStatus = getContractStatus(tenant.contract_end_at);
                return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-mono text-sm">
                    {tenant.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {tenant.name}
                  </TableCell>
                  <TableCell>
                    {tenant.user?.name || tenant.user?.email || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tenant.contract_begin_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tenant.contract_end_at)}
                  </TableCell>
                  <TableCell>
                    {tenant.rent_duration} {DURATION_UNIT_LABELS[tenant.rent_duration_unit] || tenant.rent_duration_unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={contractStatus.variant}>
                      {contractStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tenant.created_at)}
                  </TableCell>
                  <TableCell
                      className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${isLast ? "rounded-bl-lg" : ""
                          }`}
                  >
                      <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onView(tenant)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                              <Eye className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(tenant)} className="rounded-[50%] text-green-600 bg-green-600/10">
                              <Edit className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(tenant)} className="rounded-[50%] text-red-500 bg-red-500/10">
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
              Apakah Anda yakin ingin menghapus tenant <strong>{tenantToDelete?.name}</strong>?
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
