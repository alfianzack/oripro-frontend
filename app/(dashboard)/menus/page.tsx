'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, menusApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Home, Menu as MenuIcon, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import MenusTable from '@/components/table/menus-table'
import MenuDetailDialog from '@/components/dialogs/menu-detail-dialog'
import MenuFormDialog from '@/components/dialogs/menu-form-dialog'
import { showToast } from '@/lib/toast'

export default function MenusPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)

  const loadMenus = async () => {
    setLoading(true)
    try {
      const response = await menusApi.getMenus()
      
      if (response.success && response.data) {
        setMenus(response.data)
        setFilteredMenus(response.data)
      } else {
        showToast.error(response.error || 'Gagal memuat data menus')
      }
    } catch (error) {
      console.error('Load menus error:', error)
      showToast.error('Terjadi kesalahan saat memuat data menus')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = menus.filter(menu =>
        menu.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.icon?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMenus(filtered)
    } else {
      setFilteredMenus(menus)
    }
  }, [searchTerm, menus])

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    setFormDialogOpen(true)
  }

  const handleView = (menu: Menu) => {
    setSelectedMenu(menu)
    setDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadMenus()
  }

  const handleAddNew = () => {
    setEditingMenu(null)
    setFormDialogOpen(true)
  }

  const handleFormSuccess = () => {
    loadMenus()
  }

  // Calculate stats
  const totalMenus = menus.length
  const activeMenus = menus.filter(menu => menu.is_active).length
  const inactiveMenus = menus.filter(menu => !menu.is_active).length
  const parentMenus = menus.filter(menu => !menu.parent_id).length
  const childMenus = menus.filter(menu => menu.parent_id).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Menu Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">
            Kelola menu dan navigasi sistem
          </p>
        </div>
        <Button onClick={handleAddNew} className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Add New Menu
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menus</CardTitle>
            <MenuIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMenus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Menus</CardTitle>
            <MenuIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMenus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Menus</CardTitle>
            <MenuIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveMenus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Menus</CardTitle>
            <MenuIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{parentMenus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Child Menus</CardTitle>
            <MenuIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{childMenus}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <MenusTable
        menus={filteredMenus}
        onEdit={handleEdit}
        onView={handleView}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Detail Dialog */}
      {selectedMenu && (
        <MenuDetailDialog
          menu={selectedMenu}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

      {/* Form Dialog */}
      <MenuFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        menu={editingMenu}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
