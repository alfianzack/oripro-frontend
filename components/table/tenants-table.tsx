'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, tenantsApi, DURATION_UNIT_LABELS, DURATION_UNITS } from '@/lib/api'
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
import { MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaginationInfo {
  total: number
  limit: number
  offset: number
}

interface TenantsTableProps {
  tenants: Tenant[]
  onEdit: (tenant: Tenant) => void
  onView: (tenant: Tenant) => void
  onRefresh: () => void
  loading?: boolean
  pagination?: PaginationInfo
  onPageChange?: (offset: number) => void
}

export default function TenantsTable({ 
  tenants, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false,
  pagination,
  onPageChange
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

  const getTenantStatus = (status: string) => {
    switch (status) {
      case 'inactive':
        return { label: 'Tidak Aktif', variant: 'secondary' as const }
      case 'active':
        return { label: 'Aktif', variant: 'default' as const }
      case 'pending':
        return { label: 'Pending', variant: 'outline' as const }
      case 'expired':
        return { label: 'Expired', variant: 'destructive' as const }
      case 'terminated':
        return { label: 'Terminated', variant: 'destructive' as const }
      case 'blacklisted':
        return { label: 'Blacklisted', variant: 'destructive' as const }
      default:
        return { label: 'Unknown', variant: 'secondary' as const }
    }
  }

  const handlePageChange = (newOffset: number) => {
    if (onPageChange && pagination) {
      onPageChange(newOffset)
    }
  }

  const getCurrentPage = () => {
    if (!pagination) return 1
    return Math.floor(pagination.offset / pagination.limit) + 1
  }

  const getTotalPages = () => {
    if (!pagination) return 1
    return Math.ceil(pagination.total / pagination.limit)
  }

  const getPageStart = () => {
    if (!pagination) return 0
    return pagination.offset + 1
  }

  const getPageEnd = () => {
    if (!pagination) return tenants.length
    return Math.min(pagination.offset + pagination.limit, pagination.total)
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
              <TableHead>Nama Tenant</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status Tenant</TableHead>
              <TableHead>Mulai Kontrak</TableHead>
              <TableHead>Berakhir Kontrak</TableHead>
              <TableHead>Durasi Sewa</TableHead>
              <TableHead>Status Kontrak</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(tenants) || tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Tidak ada data tenant
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant, index) => {
                const isLast = index === tenants.length - 1;
                const contractStatus = getContractStatus(tenant.contract_end_at);
                // Use contract status as tenant status since Tenant interface doesn't have status field
                const tenantStatus = contractStatus.status === 'expired' ? 'expired' : 
                                   contractStatus.status === 'expiring' ? 'pending' : 'active';
                
                // Debug: Log tenant data to identify the problematic field
                console.log('Tenant data:', tenant);
                
                return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{String(index + 1)}</TableCell>
                  <TableCell className="font-medium">
                    {tenant.name}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        if (tenant.user && typeof tenant.user === 'object') {
                          return tenant.user.name || tenant.user.email || '-';
                        }
                        return tenant.user || '-';
                      } catch (error) {
                        console.error('Error rendering user field:', error, tenant.user);
                        return '-';
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTenantStatus(tenantStatus).variant}>
                      {getTenantStatus(tenantStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tenant.contract_begin_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tenant.contract_end_at)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        const duration = tenant.rent_duration || 0;
                        let unit = '';
                        if (tenant.rent_duration_unit !== undefined && tenant.rent_duration_unit !== null) {
                          // Handle numeric format: 0 = month, 1 = year
                          const unitValue = Number(tenant.rent_duration_unit);
                          if (unitValue === 1) {
                            unit = 'tahun';
                          } else if (unitValue === 0) {
                            unit = 'bulan';
                          } else {
                            // Fallback: handle string format
                            const unitString = String(tenant.rent_duration_unit).toLowerCase();
                            if (unitString === 'year' || unitString === DURATION_UNITS.YEAR) {
                              unit = 'tahun';
                            } else if (unitString === 'month' || unitString === DURATION_UNITS.MONTH) {
                              unit = 'bulan';
                            } else {
                              unit = tenant.rent_duration_unit;
                            }
                          }
                        }
                        return duration > 0 && unit ? `${duration} ${unit}` : '-';
                      } catch (error) {
                        console.error('Error rendering duration field:', error, tenant.rent_duration, tenant.rent_duration_unit);
                        return '-';
                      }
                    })()}
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

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {getPageStart()} - {getPageEnd()} dari {pagination.total} tenant
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(0)}
              disabled={pagination.offset === 0 || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0 || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = getTotalPages()
                const currentPage = getCurrentPage()
                const pageNumbers: number[] = []
                
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i)
                  }
                } else if (currentPage <= 3) {
                  for (let i = 1; i <= 5; i++) {
                    pageNumbers.push(i)
                  }
                } else if (currentPage >= totalPages - 2) {
                  for (let i = totalPages - 4; i <= totalPages; i++) {
                    pageNumbers.push(i)
                  }
                } else {
                  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pageNumbers.push(i)
                  }
                }
                
                return pageNumbers.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                    disabled={loading}
                    className="h-9 w-9 p-0"
                  >
                    {pageNum}
                  </Button>
                ))
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(
                (getTotalPages() - 1) * pagination.limit,
                pagination.offset + pagination.limit
              ))}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((getTotalPages() - 1) * pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
              className="h-9 w-9 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
