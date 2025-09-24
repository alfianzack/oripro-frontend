'use client'

import React, { useState, useEffect } from 'react'
import { Menu, CreateRoleMenuPermissionData } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Eye, Plus, Edit, Trash2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuAccessSelectorProps {
  menus: Menu[]
  selectedPermissions: CreateRoleMenuPermissionData[]
  onPermissionsChange: (permissions: CreateRoleMenuPermissionData[]) => void
  loading?: boolean
}

interface MenuWithPermissions extends Menu {
  permissions: {
    can_view: boolean
    can_create: boolean
    can_update: boolean
    can_delete: boolean
    can_confirm: boolean
  }
  children?: MenuWithPermissions[]
}

export default function MenuAccessSelector({
  menus,
  selectedPermissions,
  onPermissionsChange,
  loading = false
}: MenuAccessSelectorProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [menusWithPermissions, setMenusWithPermissions] = useState<MenuWithPermissions[]>([])

  // Initialize menus with permissions
  useEffect(() => {
    const initializeMenus = (menuList: Menu[]): MenuWithPermissions[] => {
      // Ensure menuList is an array
      if (!Array.isArray(menuList)) {
        console.warn('MenuAccessSelector: menus prop is not an array', menuList)
        return []
      }
      
      return menuList.map(menu => {
        const existingPermission = selectedPermissions.find(p => p.menu_id === menu.id)
        const permissions = existingPermission || {
          menu_id: menu.id,
          can_view: false,
          can_create: false,
          can_update: false,
          can_delete: false,
          can_confirm: false
        }

        return {
          ...menu,
          permissions: {
            can_view: permissions.can_view,
            can_create: permissions.can_create,
            can_update: permissions.can_update,
            can_delete: permissions.can_delete,
            can_confirm: permissions.can_confirm
          },
          children: menu.children ? initializeMenus(menu.children) : undefined
        }
      })
    }

    setMenusWithPermissions(initializeMenus(menus))
  }, [menus, selectedPermissions])

  const updateMenuPermission = (menuId: string, permission: keyof MenuWithPermissions['permissions'], value: boolean) => {
    const updateMenu = (menuList: MenuWithPermissions[]): MenuWithPermissions[] => {
      if (!Array.isArray(menuList)) {
        console.warn('updateMenuPermission: menuList is not an array', menuList)
        return []
      }
      
      return menuList.map(menu => {
        if (menu.id === menuId) {
          const updatedMenu = {
            ...menu,
            permissions: {
              ...menu.permissions,
              [permission]: value
            }
          }
          return updatedMenu
        }
        if (menu.children) {
          return {
            ...menu,
            children: updateMenu(menu.children)
          }
        }
        return menu
      })
    }

    const updatedMenus = updateMenu(menusWithPermissions)
    setMenusWithPermissions(updatedMenus)

    // Update parent component
    const allPermissions: CreateRoleMenuPermissionData[] = []
    const collectPermissions = (menuList: MenuWithPermissions[]) => {
      menuList.forEach(menu => {
        allPermissions.push({
          menu_id: menu.id,
          can_view: menu.permissions.can_view,
          can_create: menu.permissions.can_create,
          can_update: menu.permissions.can_update,
          can_delete: menu.permissions.can_delete,
          can_confirm: menu.permissions.can_confirm
        })
        if (menu.children) {
          collectPermissions(menu.children)
        }
      })
    }
    collectPermissions(updatedMenus)
    onPermissionsChange(allPermissions)
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

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'can_view': return <Eye className="h-4 w-4" />
      case 'can_create': return <Plus className="h-4 w-4" />
      case 'can_update': return <Edit className="h-4 w-4" />
      case 'can_delete': return <Trash2 className="h-4 w-4" />
      case 'can_confirm': return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'can_view': return 'Lihat'
      case 'can_create': return 'Buat'
      case 'can_update': return 'Edit'
      case 'can_delete': return 'Hapus'
      case 'can_confirm': return 'Konfirmasi'
      default: return permission
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'can_view': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'can_create': return 'bg-green-100 text-green-800 border-green-200'
      case 'can_update': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'can_delete': return 'bg-red-100 text-red-800 border-red-200'
      case 'can_confirm': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderMenu = (menu: MenuWithPermissions, level: number = 0) => {
    const isExpanded = expandedMenus.has(menu.id)
    const hasChildren = menu.children && menu.children.length > 0
    const hasAnyPermission = Object.values(menu.permissions).some(Boolean)

    return (
      <div key={menu.id} className="space-y-2">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          level > 0 && "ml-6 bg-gray-50",
          hasAnyPermission && "bg-blue-50 border-blue-200"
        )}>
          {/* Expand/Collapse Button */}
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

          {/* Menu Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{menu.title}</h4>
              {menu.icon && (
                <Badge variant="outline" className="text-xs">
                  {menu.icon}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{menu.url}</p>
          </div>

          {/* Permission Checkboxes */}
          <div className="flex items-center gap-2">
            {Object.entries(menu.permissions).map(([permission, value]) => (
              <div key={permission} className="flex items-center gap-1">
                <Checkbox
                  id={`${menu.id}-${permission}`}
                  checked={value}
                  onCheckedChange={(checked) => 
                    updateMenuPermission(menu.id, permission as keyof MenuWithPermissions['permissions'], !!checked)
                  }
                  disabled={loading}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`${menu.id}-${permission}`}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors",
                    value ? getPermissionColor(permission) : "bg-gray-100 text-gray-600 border border-gray-200"
                  )}
                >
                  {getPermissionIcon(permission)}
                  <span className="hidden sm:inline">{getPermissionLabel(permission)}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {menu.children!.map(child => renderMenu(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Akses Menu</span>
          <Badge variant="outline" className="text-xs">
            {selectedPermissions.filter(p => Object.values(p).some(Boolean)).length} menu dipilih
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Pilih menu dan permission yang dapat diakses oleh role ini. Permission yang tersedia:
        </div>
        
        {/* Permission Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-muted rounded-lg">
          {['can_view', 'can_create', 'can_update', 'can_delete', 'can_confirm'].map(permission => (
            <div key={permission} className="flex items-center gap-2 text-xs">
              {getPermissionIcon(permission)}
              <span className={cn("px-2 py-1 rounded", getPermissionColor(permission))}>
                {getPermissionLabel(permission)}
              </span>
            </div>
          ))}
        </div>

        {/* Menu List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Array.isArray(menusWithPermissions) && menusWithPermissions.length > 0 ? (
            menusWithPermissions.map(menu => renderMenu(menu))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? 'Memuat menu...' : 'Tidak ada menu yang tersedia'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
