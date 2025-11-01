'use client'

import React, { useState } from 'react'
import { Menu, menusApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Edit, Trash2, Loader2, ChevronDown, ChevronRight, MenuIcon } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface MenusTableProps {
  menus: Menu[]
  onEdit: (menu: Menu) => void
  onView: (menu: Menu) => void
  onRefresh: () => void
  loading?: boolean
}

export default function MenusTable({ 
  menus, 
  onEdit, 
  onView, 
  onRefresh, 
  loading = false 
}: MenusTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
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

  const handleDeleteClick = (menu: Menu) => {
    setMenuToDelete(menu)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!menuToDelete) return

    setDeleting(true)
    try {
      const response = await menusApi.deleteMenu(menuToDelete.id.toString())
      
      if (response.success) {
        showToast.success(`Menu "${menuToDelete.title}" berhasil dihapus`)
        onRefresh()
      } else {
        showToast.error(response.error || 'Gagal menghapus menu')
      }
    } catch (error) {
      console.error('Delete menu error:', error)
      showToast.error('Gagal menghapus menu')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setMenuToDelete(null)
    }
  }

  const toggleExpanded = (menuId: number) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  // Helper function to get all parent menus (menus without parent_id)
  const getParentMenus = (menus: Menu[]) => {
    return menus.filter(menu => !menu.parent_id)
  }

  // Helper function to get child menus for a specific parent
  const getChildMenus = (menus: Menu[], parentId: number) => {
    return menus.filter(menu => menu.parent_id === parentId)
  }

  const renderMenuRow = (menu: Menu, index: number, isChild: boolean = false) => {
    const isExpanded = expandedMenus.has(menu.id)
    const childMenus = getChildMenus(menus, menu.id)
    const hasChild = childMenus.length > 0
    
    return (
      <React.Fragment key={menu.id}>
        <TableRow className={isChild ? 'bg-gray-50 dark:bg-gray-800' : ''}>
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              {hasChild && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(menu.id)}
                  className="h-6 w-6 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </Button>
              )}
              {!hasChild && <span className="w-6" />}
              <div className={`flex items-center gap-2 ${isChild ? 'pl-6' : ''}`}>
                {isChild ? (
                  <MenuIcon className="h-4 w-4 text-muted-foreground mr-2" />
                ) : (
                  <MenuIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`font-medium ${isChild ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {menu.title || '-'}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell>{menu.url || '-'}</TableCell>
          <TableCell>{menu.icon || '-'}</TableCell>
          <TableCell>
            {menu.parent_id ? 'Child Menu' : 'Parent Menu'}
          </TableCell>
          <TableCell>{menu.order || 0}</TableCell>
          <TableCell>
            <span
                className={`px-3 py-1.5 rounded text-sm font-medium border ${menu.is_active
                    ? "bg-green-600/15 text-green-600 border-green-600"
                    : "bg-gray-600/15 text-gray-600 dark:text-white border-gray-400"
                    }`}
            >
                {getStatusDisplayText(menu.is_active)}
            </span>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {formatDate(menu.created_at)}
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {formatDate(menu.updated_at)}
          </TableCell>
          <TableCell className="py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600">
            <div className="flex justify-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => onView(menu)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                <Eye className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onEdit(menu)} className="rounded-[50%] text-green-600 bg-green-600/10">
                <Edit className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(menu)} className="rounded-[50%] text-red-500 bg-red-500/10">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        
        {/* Render child menus if expanded */}
        {hasChild && isExpanded && (
          <>
            {childMenus.map((childMenu, childIndex) => 
              renderMenuRow(childMenu, childIndex, true)
            )}
          </>
        )}
      </React.Fragment>
    )
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
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead>Diperbarui</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Tidak ada data menu
                </TableCell>
              </TableRow>
            ) : (
              getParentMenus(menus).map((menu, index) => renderMenuRow(menu, index))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && menuToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus menu "{menuToDelete.title}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setMenuToDelete(null)
                }}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
