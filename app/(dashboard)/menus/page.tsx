'use client'

import React, { useState, useEffect } from 'react'
import { Menu, CreateMenuData, UpdateMenuData, menusApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronRight,
  ChevronDown,
  Menu as MenuIcon
} from 'lucide-react'
import MenuForm from '@/components/forms/menu-form'
import MenuDetailDialog from '@/components/dialogs/menu-detail-dialog'
import { toast } from 'sonner'

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)

  // Load menus
  useEffect(() => {
    loadMenus()
  }, [])

  // Filter menus based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMenus(menus)
    } else {
      const filtered = menus.filter(menu => 
        menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMenus(filtered)
    }
  }, [menus, searchTerm])

  const loadMenus = async () => {
    setLoading(true)
    try {
      const response = await menusApi.getMenus()
      if (response.success && response.data) {
        const menuData = Array.isArray(response.data) ? response.data : []
        setMenus(menuData)
      } else {
        // Use mock data if API fails
        const mockMenus = [
          {
            id: '1',
            title: 'Dashboard',
            url: '/',
            icon: 'House',
            parent_id: null,
            order: 1,
            is_active: true,
            can_view: true,
            can_create: false,
            can_update: false,
            can_delete: false,
            can_confirm: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Users',
            url: '/users',
            icon: 'UsersRound',
            parent_id: null,
            order: 2,
            is_active: true,
            can_view: true,
            can_create: true,
            can_update: true,
            can_delete: true,
            can_confirm: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            children: [
              {
                id: '3',
                title: 'Manage Users',
                url: '/users/manage',
                icon: 'UserCog',
                parent_id: '2',
                order: 1,
                is_active: true,
                can_view: true,
                can_create: true,
                can_update: true,
                can_delete: true,
                can_confirm: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: '4',
                title: 'Manage Roles',
                url: '/roles',
                icon: 'Shield',
                parent_id: '2',
                order: 2,
                is_active: true,
                can_view: true,
                can_create: true,
                can_update: true,
                can_delete: true,
                can_confirm: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]
          }
        ]
        setMenus(mockMenus)
      }
    } catch (error) {
      console.error('Failed to load menus:', error)
      toast.error('Gagal memuat data menu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMenu = async (data: CreateMenuData) => {
    try {
      const response = await menusApi.createMenu(data)
      if (response.success) {
        toast.success('Menu berhasil dibuat')
        loadMenus()
        setIsFormOpen(false)
      } else {
        toast.error(response.error || 'Gagal membuat menu')
      }
    } catch (error) {
      console.error('Failed to create menu:', error)
      toast.error('Gagal membuat menu')
    }
  }

  const handleUpdateMenu = async (id: string, data: UpdateMenuData) => {
    try {
      const response = await menusApi.updateMenu(id, data)
      if (response.success) {
        toast.success('Menu berhasil diperbarui')
        loadMenus()
        setIsFormOpen(false)
        setEditingMenu(null)
      } else {
        toast.error(response.error || 'Gagal memperbarui menu')
      }
    } catch (error) {
      console.error('Failed to update menu:', error)
      toast.error('Gagal memperbarui menu')
    }
  }

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      return
    }

    try {
      const response = await menusApi.deleteMenu(id)
      if (response.success) {
        toast.success('Menu berhasil dihapus')
        loadMenus()
      } else {
        toast.error(response.error || 'Gagal menghapus menu')
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
      toast.error('Gagal menghapus menu')
    }
  }

  const toggleMenuExpansion = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const getPermissionBadges = (menu: Menu) => {
    const permissions = []
    if (menu.can_view) permissions.push({ label: 'View', color: 'bg-blue-100 text-blue-800' })
    if (menu.can_create) permissions.push({ label: 'Create', color: 'bg-green-100 text-green-800' })
    if (menu.can_update) permissions.push({ label: 'Update', color: 'bg-yellow-100 text-yellow-800' })
    if (menu.can_delete) permissions.push({ label: 'Delete', color: 'bg-red-100 text-red-800' })
    if (menu.can_confirm) permissions.push({ label: 'Confirm', color: 'bg-purple-100 text-purple-800' })
    return permissions
  }

  const renderMenuRow = (menu: Menu, level: number = 0) => {
    const isExpanded = expandedMenus.has(menu.id)
    const hasChildren = menu.children && menu.children.length > 0
    const permissions = getPermissionBadges(menu)

    return (
      <React.Fragment key={menu.id}>
        <TableRow className={level > 0 ? 'bg-gray-50' : ''}>
          <TableCell className="font-medium">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMenuExpansion(menu.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              <MenuIcon className="h-4 w-4 text-muted-foreground" />
              <span>{menu.title}</span>
            </div>
          </TableCell>
          <TableCell>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{menu.url}</code>
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {permissions.map((perm, index) => (
                <Badge key={index} variant="secondary" className={`text-xs ${perm.color}`}>
                  {perm.label}
                </Badge>
              ))}
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={menu.is_active ? "default" : "secondary"}>
              {menu.is_active ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </TableCell>
          <TableCell>{menu.order}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedMenu(menu)
                  setIsDetailOpen(true)
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setEditingMenu(menu)
                  setIsFormOpen(true)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && menu.children?.map(child => renderMenuRow(child, level + 1))}
      </React.Fragment>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">
            Kelola menu dan permission sistem
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMenu(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
              </DialogTitle>
            </DialogHeader>
            <MenuForm
              menu={editingMenu}
              onSubmit={editingMenu ? 
                (data) => handleUpdateMenu(editingMenu.id, data) : 
                handleCreateMenu
              }
              onCancel={() => {
                setIsFormOpen(false)
                setEditingMenu(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Menu Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Menu</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-[70px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredMenus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada menu yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMenus.map(menu => renderMenuRow(menu))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Menu Detail Dialog */}
      <MenuDetailDialog
        menu={selectedMenu}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}