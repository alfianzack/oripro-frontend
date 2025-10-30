'use client'

import React, { useState, useEffect } from 'react'
import { Menu, menusApi, CreateMenuData, UpdateMenuData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Save } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface MenuFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu | null
  onSuccess: () => void
}

export default function MenuFormDialog({ 
  open, 
  onOpenChange, 
  menu, 
  onSuccess 
}: MenuFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [parentMenus, setParentMenus] = useState<Menu[]>([])
  const [formData, setFormData] = useState<CreateMenuData | UpdateMenuData>({
    title: '',
    url: '',
    icon: '',
    parent_id: undefined,
    order: 0,
    is_active: true,
    can_view: true,
    can_add: false,
    can_edit: false,
    can_delete: false,
    can_confirm: false
  })

  const isEdit = !!menu

  const loadParentMenus = async () => {
    try {
      const response = await menusApi.getMenus()
      if (response.success && response.data) {
        // Filter hanya parent menus (yang tidak memiliki parent_id) dan bukan menu yang sedang diedit
        const parents = response.data.filter(parentMenu => 
          !parentMenu.parent_id && parentMenu.id !== menu?.id
        )
        setParentMenus(parents)
      }
    } catch (error) {
      console.error('Load parent menus error:', error)
    }
  }

  useEffect(() => {
    if (open) {
      loadParentMenus()
      
      if (isEdit && menu) {
        // Pre-populate form for edit
        setFormData({
          title: menu.title,
          url: menu.url || '',
          icon: menu.icon || '',
          parent_id: menu.parent_id ? parseInt(menu.parent_id.toString()) : undefined,
          order: menu.order,
          is_active: menu.is_active,
          can_view: menu.can_view,
          can_add: menu.can_add,
          can_edit: menu.can_edit,
          can_delete: menu.can_delete,
          can_confirm: menu.can_confirm
        })
      } else {
        // Reset form for create
        setFormData({
          title: '',
          url: '',
          icon: '',
          parent_id: undefined,
          order: 0,
          is_active: true,
          can_view: true,
          can_add: false,
          can_edit: false,
          can_delete: false,
          can_confirm: false
        })
      }
    }
  }, [open, menu, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title?.trim()) {
      showToast.error('Title menu harus diisi')
      return
    }

    setLoading(true)
    try {
      let response
      
      // Debug: Log data yang akan dikirim
      console.log('Form data to send:', formData)
      console.log('Parent ID type:', typeof formData.parent_id, formData.parent_id)
      
      // Sanitize data: remove undefined parent_id or ensure it's a number
      const sanitizedData = {
        ...formData,
        parent_id: formData.parent_id && !isNaN(Number(formData.parent_id)) ? Number(formData.parent_id) : undefined
      }
      
      // Remove undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key as keyof typeof sanitizedData] === undefined) {
          delete sanitizedData[key as keyof typeof sanitizedData]
        }
      })
      
      console.log('Sanitized data to send:', sanitizedData)
      
      if (isEdit && menu) {
        response = await menusApi.updateMenu(menu.id, sanitizedData as UpdateMenuData)
      } else {
        response = await menusApi.createMenu(sanitizedData as CreateMenuData)
      }
      
      if (response.success) {
        showToast.success(`Menu berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`)
        onSuccess()
        onOpenChange(false)
      } else {
        showToast.error(response.error || `Gagal ${isEdit ? 'memperbarui' : 'membuat'} menu`)
      }
    } catch (error) {
      console.error(`${isEdit ? 'Update' : 'Create'} menu error:`, error)
      showToast.error(`Terjadi kesalahan saat ${isEdit ? 'memperbarui' : 'membuat'} menu`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof (CreateMenuData | UpdateMenuData), value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Menu' : 'Add New Menu'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Masukkan title menu"
                required
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="Masukkan URL menu"
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon || ''}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="Masukkan icon menu"
              />
            </div>

            {/* Parent Menu */}
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Menu</Label>
              <Select
                value={formData.parent_id ? formData.parent_id.toString() : 'none'}
                onValueChange={(value) => handleInputChange('parent_id', value === 'none' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent menu (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada parent (Menu Utama)</SelectItem>
                  {parentMenus.map((parentMenu) => (
                    <SelectItem key={parentMenu.id} value={parentMenu.id.toString()}>
                      {parentMenu.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order || 0}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                placeholder="Urutan menu"
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">
                  {formData.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Label>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Permissions</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Can View */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can_view"
                      checked={formData.can_view || false}
                      onCheckedChange={(checked) => handleInputChange('can_view', checked)}
                    />
                    <Label htmlFor="can_view">Can View</Label>
                  </div>
                </div>

                {/* Can Add */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can_add"
                      checked={formData.can_add || false}
                      onCheckedChange={(checked) => handleInputChange('can_add', checked)}
                    />
                    <Label htmlFor="can_add">Can Add</Label>
                  </div>
                </div>

                {/* Can Edit */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can_edit"
                      checked={formData.can_edit || false}
                      onCheckedChange={(checked) => handleInputChange('can_edit', checked)}
                    />
                    <Label htmlFor="can_edit">Can Edit</Label>
                  </div>
                </div>

                {/* Can Delete */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can_delete"
                      checked={formData.can_delete || false}
                      onCheckedChange={(checked) => handleInputChange('can_delete', checked)}
                    />
                    <Label htmlFor="can_delete">Can Delete</Label>
                  </div>
                </div>

                {/* Can Confirm */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can_confirm"
                      checked={formData.can_confirm || false}
                      onCheckedChange={(checked) => handleInputChange('can_confirm', checked)}
                    />
                    <Label htmlFor="can_confirm">Can Confirm</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? 'Update Menu' : 'Create Menu'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
