'use client'

import React from 'react'
import { Menu } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar,
  User,
  Hash,
  Link,
  Palette,
  Menu as MenuIcon,
  ChevronRight
} from 'lucide-react'

interface MenuDetailDialogProps {
  menu: Menu | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MenuDetailDialog({ menu, open, onOpenChange }: MenuDetailDialogProps) {
  if (!menu) return null


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MenuIcon className="h-5 w-5" />
            Detail Menu: {menu.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MenuIcon className="h-4 w-4" />
                    Nama Menu
                  </div>
                  <p className="text-lg font-semibold">{menu.title}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Link className="h-4 w-4" />
                    URL
                  </div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block w-fit">
                    {menu.url}
                  </code>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    Order
                  </div>
                  <p className="text-lg font-semibold">{menu.order}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    Status
                  </div>
                  <Badge variant={menu.is_active ? "default" : "secondary"}>
                    {menu.is_active ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>

              {menu.icon && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MenuIcon className="h-4 w-4" />
                    Icon
                  </div>
                  <p className="text-lg font-semibold">{menu.icon}</p>
                </div>
              )}

              {menu.circle_color && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    Warna Circle
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-6 h-6 rounded-full ${menu.circle_color}`}
                      style={{ backgroundColor: menu.circle_color.includes('bg-') ? undefined : menu.circle_color }}
                    />
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {menu.circle_color}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Children Menus */}
          {menu.children && menu.children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sub Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {menu.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{child.title}</p>
                          <code className="text-xs text-muted-foreground">{child.url}</code>
                        </div>
                      </div>
                      <Badge variant={child.is_active ? "default" : "secondary"} className="text-xs">
                        {child.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Dibuat
                  </div>
                  <p className="text-xs">{formatDate(menu.created_at)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Diperbarui
                  </div>
                  <p className="text-xs">{formatDate(menu.updated_at)}</p>
                </div>

                {menu.created_by && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <User className="h-3 w-3" />
                      Dibuat Oleh
                    </div>
                    <p className="text-xs">{menu.created_by}</p>
                  </div>
                )}

                {menu.updated_by && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <User className="h-3 w-3" />
                      Diperbarui Oleh
                    </div>
                    <p className="text-xs">{menu.updated_by}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
