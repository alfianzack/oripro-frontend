'use client'

import React, { useState, useEffect } from 'react'
import { Menu, CreateMenuData, UpdateMenuData, menusApi } from '@/lib/api'
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
    parent_id: '',
    order: 0,
    is_active: true,
    circle_color: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [parentMenus, setParentMenus] = useState<Menu[]>([])
  const [loadingParents, setLoadingParents] = useState(false)

  // Load parent menus
  useEffect(() => {
    const loadParentMenus = async () => {
      setLoadingParents(true)
      try {
        const response = await menusApi.getParentMenus()
        if (response.success && response.data) {
          const menuData = Array.isArray(response.data) ? response.data : []
          setParentMenus(menuData)
        } else {
          // Use mock data for testing
          const mockParentMenus = [
            {
              id: '1',
              title: 'Dashboard',
              url: '/',
              icon: 'House',
              parent_id: undefined,
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
              parent_id: undefined,
              order: 2,
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
              id: '5',
              title: 'Assets',
              url: '/assets',
              icon: 'Boxes',
              parent_id: undefined,
              order: 3,
              is_active: true,
              can_view: true,
              can_create: true,
              can_update: true,
              can_delete: false,
              can_confirm: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
          setParentMenus(mockParentMenus)
        }
      } catch (error) {
        console.error('Failed to load parent menus:', error)
        // Use mock data as fallback
        const mockParentMenus = [
          {
            id: '1',
            title: 'Dashboard',
            url: '/',
            icon: 'House',
            parent_id: undefined,
            order: 1,
            is_active: true,
            can_view: true,
            can_create: false,
            can_update: false,
            can_delete: false,
            can_confirm: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setParentMenus(mockParentMenus)
      } finally {
        setLoadingParents(false)
      }
    }

    loadParentMenus()
  }, [])

  // Initialize form data when menu prop changes
  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title || '',
        url: menu.url || '',
        icon: menu.icon || '',
        parent_id: menu.parent_id || '',
        order: menu.order || 0,
        is_active: menu.is_active ?? true,
        circle_color: menu.circle_color || '',
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
      parent_id: formData.parent_id || undefined,
      order: formData.order,
      is_active: formData.is_active,
      circle_color: formData.circle_color.trim() || undefined,
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
                onValueChange={(value) => handleInputChange('parent_id', value === 'none' ? '' : value)}
                disabled={loadingParents}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih menu parent (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada parent</SelectItem>
                  {parentMenus.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
