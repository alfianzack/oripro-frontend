'use client'

import React, { useState, useEffect } from 'react'
import { Menu, CreateMenuData, UpdateMenuData, menusApi } from '@/lib/api'
import { useMenus } from '@/hooks/useMenus'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MenuFormProps {
  menu?: Menu | null
  onSubmit: (data: CreateMenuData | UpdateMenuData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function MenuForm({ menu, onSubmit, onCancel, loading = false }: MenuFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: '',
    parent_id: undefined as number | undefined,
    order: 0,
    is_active: true,
    circle_color: '',
    can_view: false,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_confirm: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [parentMenus, setParentMenus] = useState<Menu[]>([])
  
  // Use the useMenus hook to get all menus
  const { menus: allMenus, loading: menusLoading } = useMenus()

  // Filter parent menus from all menus (menus without parent_id)
  useEffect(() => {
    if (allMenus && allMenus.length > 0) {
      console.log('All menus loaded:', allMenus)
      // Filter menus that don't have a parent (parent_id is null or undefined)
      const parentMenusList = allMenus.filter(menu => 
        !menu.parent_id && menu.is_active
      )
      console.log('Parent menus filtered:', parentMenusList)
      setParentMenus(parentMenusList)
    } else {
      console.log('No menus loaded yet or empty array')
    }
  }, [allMenus])

  // Initialize form data when menu prop changes
  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title || '',
        url: menu.url || '',
        icon: menu.icon || '',
        parent_id: menu.parent_id || undefined,
        order: menu.order || 0,
        is_active: menu.is_active ?? true,
        circle_color: menu.circle_color || '',
        can_view: menu.can_view ?? false,
        can_create: menu.can_create ?? false,
        can_update: menu.can_update ?? false,
        can_delete: menu.can_delete ?? false,
        can_confirm: menu.can_confirm ?? false,
      })
    }
  }, [menu])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Nama menu harus diisi'
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Nama menu minimal 2 karakter'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL menu harus diisi'
    } else if (!formData.url.startsWith('/') && formData.url !== '#') {
      newErrors.url = 'URL harus dimulai dengan "/" atau "#"'
    }

    if (formData.order < 0) {
      newErrors.order = 'Order harus berupa angka positif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData = {
      title: formData.title.trim(),
      url: formData.url.trim(),
      icon: formData.icon.trim() || undefined,
      parent_id: formData.parent_id,
      order: formData.order,
      is_active: formData.is_active,
      circle_color: formData.circle_color.trim() || undefined,
      can_view: formData.can_view,
      can_create: formData.can_create,
      can_update: formData.can_update,
      can_delete: formData.can_delete,
      can_confirm: formData.can_confirm,
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Terjadi kesalahan saat menyimpan menu')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Nama Menu *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Masukkan nama menu"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="Masukkan URL (contoh: /users, #)"
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="Nama icon (contoh: House, Users)"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parent_id">Menu Parent</Label>
              <Select
                value={formData.parent_id || undefined}
                onValueChange={(value) => handleInputChange('parent_id', value === 'none' ? undefined : parseInt(value))}
                disabled={menusLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    menusLoading 
                      ? "Memuat menu..." 
                      : "Pilih menu parent (opsional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada parent</SelectItem>
                  {parentMenus.length > 0 ? (
                    parentMenus.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {menusLoading ? "Memuat..." : "Tidak ada menu parent tersedia"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {menusLoading && (
                <p className="text-sm text-muted-foreground">Memuat daftar menu...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                className={errors.order ? 'border-red-500' : ''}
              />
              {errors.order && (
                <p className="text-sm text-red-500">{errors.order}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="circle_color">Warna Circle</Label>
              <Input
                id="circle_color"
                value={formData.circle_color}
                onChange={(e) => handleInputChange('circle_color', e.target.value)}
                placeholder="Contoh: bg-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Menu Aktif</Label>
          </div>
        </CardContent>
      </Card>

      {/* Permission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="can_view"
                checked={formData.can_view}
                onCheckedChange={(checked) => handleInputChange('can_view', checked)}
              />
              <Label htmlFor="can_view">Can View</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="can_create"
                checked={formData.can_create}
                onCheckedChange={(checked) => handleInputChange('can_create', checked)}
              />
              <Label htmlFor="can_create">Can Create</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="can_update"
                checked={formData.can_update}
                onCheckedChange={(checked) => handleInputChange('can_update', checked)}
              />
              <Label htmlFor="can_update">Can Update</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="can_delete"
                checked={formData.can_delete}
                onCheckedChange={(checked) => handleInputChange('can_delete', checked)}
              />
              <Label htmlFor="can_delete">Can Delete</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="can_confirm"
                checked={formData.can_confirm}
                onCheckedChange={(checked) => handleInputChange('can_confirm', checked)}
              />
              <Label htmlFor="can_confirm">Can Confirm</Label>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Pilih permission yang dapat diakses oleh role untuk menu ini. Permission yang tidak dipilih akan disembunyikan dari user dengan role tersebut.
          </div>
        </CardContent>
      </Card>


      <Separator />

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {menu ? 'Perbarui Menu' : 'Buat Menu'}
        </Button>
      </div>
    </form>
  )
}
