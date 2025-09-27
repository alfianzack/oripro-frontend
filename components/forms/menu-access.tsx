'use client'

import React, { useState, useEffect } from 'react'
import { MenuAccess, MENU_STRUCTURE } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  House, 
  UsersRound, 
  Boxes, 
  Building2, 
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface MenuAccessProps {
  menuAccess: MenuAccess[]
  onChange: (menuAccess: MenuAccess[]) => void
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  House,
  UsersRound,
  Boxes,
  Building2,
  Settings,
}

export default function MenuAccessComponent({ menuAccess, onChange }: MenuAccessProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [localMenuAccess, setLocalMenuAccess] = useState<MenuAccess[]>(menuAccess)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    setLocalMenuAccess(menuAccess)
  }, [menuAccess])

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const updateMenuAccess = (menuId: string, hasAccess: boolean) => {
    const updateMenu = (menus: MenuAccess[]): MenuAccess[] => {
      return menus.map(menu => {
        if (menu.id === menuId) {
          const updatedMenu = { ...menu, hasAccess }
          // If parent menu is disabled, disable all children
          if (!hasAccess && menu.children) {
            updatedMenu.children = updateMenu(menu.children)
          }
          return updatedMenu
        }
        if (menu.children) {
          return { ...menu, children: updateMenu(menu.children) }
        }
        return menu
      })
    }

    const updatedMenus = updateMenu(localMenuAccess)
    setLocalMenuAccess(updatedMenus)
    onChange(updatedMenus)
  }

  const updateChildMenuAccess = (parentId: string, childId: string, hasAccess: boolean) => {
    const updateMenu = (menus: MenuAccess[]): MenuAccess[] => {
      return menus.map(menu => {
        if (menu.id === parentId && menu.children) {
          const updatedChildren = menu.children.map(child => 
            child.id === childId ? { ...child, hasAccess } : child
          )
          // If all children are enabled, enable parent
          const allChildrenEnabled = updatedChildren.every(child => child.hasAccess)
          return { 
            ...menu, 
            children: updatedChildren,
            hasAccess: allChildrenEnabled || menu.hasAccess
          }
        }
        if (menu.children) {
          return { ...menu, children: updateMenu(menu.children) }
        }
        return menu
      })
    }

    const updatedMenus = updateMenu(localMenuAccess)
    setLocalMenuAccess(updatedMenus)
    onChange(updatedMenus)
  }

  const selectAll = () => {
    const updateAll = (menus: MenuAccess[]): MenuAccess[] => {
      return menus.map(menu => ({
        ...menu,
        hasAccess: true,
        children: menu.children ? updateAll(menu.children) : undefined
      }))
    }

    const updatedMenus = updateAll(localMenuAccess)
    setLocalMenuAccess(updatedMenus)
    onChange(updatedMenus)
  }

  const deselectAll = () => {
    const updateAll = (menus: MenuAccess[]): MenuAccess[] => {
      return menus.map(menu => ({
        ...menu,
        hasAccess: false,
        children: menu.children ? updateAll(menu.children) : undefined
      }))
    }

    const updatedMenus = updateAll(localMenuAccess)
    setLocalMenuAccess(updatedMenus)
    onChange(updatedMenus)
  }

  const getAccessCount = () => {
    const countAccess = (menus: MenuAccess[]): number => {
      return menus.reduce((count, menu) => {
        let menuCount = menu.hasAccess ? 1 : 0
        if (menu.children) {
          menuCount += countAccess(menu.children)
        }
        return count + menuCount
      }, 0)
    }
    return countAccess(localMenuAccess)
  }

  const getTotalCount = () => {
    const countTotal = (menus: MenuAccess[]): number => {
      return menus.reduce((count, menu) => {
        let menuCount = 1
        if (menu.children) {
          menuCount += countTotal(menu.children)
        }
        return count + menuCount
      }, 0)
    }
    return countTotal(localMenuAccess)
  }

  const renderMenu = (menu: MenuAccess, level: number = 0, index: number = 0) => {
    const IconComponent = menu.icon ? iconMap[menu.icon] : null
    const hasChildren = menu.children && menu.children.length > 0
    const isExpanded = expandedMenus.has(menu.id)

    return (
      <div key={`menu-${menu.id}-${index}`} className="space-y-2">
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            menu.hasAccess 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMenu(menu.id)}
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
          
          {IconComponent && (
            <IconComponent className="h-5 w-5 text-muted-foreground" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor={menu.id} className="font-medium cursor-pointer">
                {menu.name}
              </Label>
              {menu.hasAccess ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{menu.path}</p>
          </div>
          
          <Switch
            id={menu.id}
            checked={menu.hasAccess}
            onCheckedChange={(checked) => updateMenuAccess(menu.id, checked)}
          />
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {menu.children!.map((child, index) => renderChildMenu(child, menu.id, level + 1, index))}
          </div>
        )}
      </div>
    )
  }

  const renderChildMenu = (child: MenuAccess, parentId: string, level: number, index: number) => {
    return (
      <div 
        key={`${parentId}-${child.id}-${index}`}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
          child.hasAccess 
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
            : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
        }`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="w-6" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Label htmlFor={child.id} className="font-medium cursor-pointer">
              {child.name}
            </Label>
            {child.hasAccess ? (
              <CheckCircle className="h-4 w-4 text-blue-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{child.path}</p>
        </div>
        
        <Switch
          id={child.id}
          checked={child.hasAccess}
          onCheckedChange={(checked) => updateChildMenuAccess(parentId, child.id, checked)}
        />
      </div>
    )
  }

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Menu Access Control</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Loading...
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Pilih menu yang dapat diakses oleh role ini. Menu yang tidak dipilih akan disembunyikan dari user dengan role ini.
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Menu Access Control</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {getAccessCount()} / {getTotalCount()} Menu
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Pilih menu yang dapat diakses oleh role ini. Menu yang tidak dipilih akan disembunyikan dari user dengan role ini.
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          {localMenuAccess.map((menu, index) => renderMenu(menu, 0, index))}
        </div>
      </CardContent>
    </Card>
  )
}
