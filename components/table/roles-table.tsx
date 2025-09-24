'use client'

import React, { useState, useEffect } from 'react'
import { Role, rolesApi } from '@/lib/api'
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

interface RolesTableProps {
  roles: Role[]
  onEdit: (role: Role) => void
  onView: (role: Role) => void
  onRefresh: () => void
  loading?: boolean
}

export default function RolesTable({ 
  roles, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false 
}: RolesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return

    setDeleting(true)
    try {
      const response = await rolesApi.deleteRole(roleToDelete.id)
      
      if (response.success) {
        toast.success('Role berhasil dihapus')
        onRefresh()
      } else {
        toast.error(response.error || 'Gagal menghapus role')
      }
    } catch (error) {
      console.error('Delete role error:', error)
      toast.error('Terjadi kesalahan saat menghapus role')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  const getLevelBadge = (level: number) => {
    if (level >= 100) {
      return { label: 'Super Admin', variant: 'destructive' as const }
    } else if (level >= 50) {
      return { label: 'Admin', variant: 'default' as const }
    } else if (level >= 20) {
      return { label: 'Manager', variant: 'secondary' as const }
    } else if (level >= 10) {
      return { label: 'Staff', variant: 'outline' as const }
    } else {
      return { label: 'User', variant: 'outline' as const }
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
              <TableHead>Nama Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Tidak ada data role
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role, index) => {
                const isLast = index === roles.length - 1;
                const levelBadge = getLevelBadge(role.level);
                return (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    {role.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{role.level}</span>
                      <Badge variant={levelBadge.variant}>
                        {levelBadge.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      Aktif
                    </Badge>
                  </TableCell>
                  <TableCell
                      className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${isLast ? "rounded-bl-lg" : ""
                          }`}
                  >
                      <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onView(role)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                              <Eye className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(role)} className="rounded-[50%] text-green-600 bg-green-600/10">
                              <Edit className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(role)} className="rounded-[50%] text-red-500 bg-red-500/10">
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
              Apakah Anda yakin ingin menghapus role <strong>{roleToDelete?.name}</strong>?
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
