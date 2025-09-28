'use client'

import React, { useState, useEffect } from 'react'
import { Role, CreateRoleData, UpdateRoleData, CreateRoleMenuPermissionData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Info } from 'lucide-react'
import MenuAccessSelector from './menu-access-selector'

interface RoleFormProps {
  role?: Role
  onSubmit: (data: CreateRoleData | UpdateRoleData) => Promise<void>
  loading?: boolean
}

export default function RoleForm({ role, onSubmit, loading = false }: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    level: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [menuPermissions, setMenuPermissions] = useState<CreateRoleMenuPermissionData[]>([])

  // Initialize form data when role prop changes
  useEffect(() => {
    const loadMenus = async () => {
      setMenusLoading(true)
      try {
        const response = await menusApi.getMenus()
        console.log('Menu API Response:', response)
        if (response.success && response.data) {
          // Backend now returns array directly in response.data
          const menuData = Array.isArray(response.data) ? response.data : []
          console.log('Processed menu data:', menuData)
          setMenus(menuData)
        } else {
          console.warn('Menu API response failed or no data:', response)
          // Use mock data for testing
          const mockMenus = [
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
          console.log('Using mock menu data:', mockMenus)
          setMenus(mockMenus)
        }
      } catch (error) {
        console.error('Failed to load menus:', error)
        setMenus([]) // Set empty array as fallback
      } finally {
        setMenusLoading(false)
      }
    }

    loadMenus()
  }, [])

  // Initialize form data when role prop changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        level: role.level?.toString() || '',
      })
      
      // Initialize menu permissions if role has them
      if (role.menuPermissions) {
        const permissions = role.menuPermissions.map(perm => ({
          menu_id: perm.menu_id,
          can_view: perm.can_view,
          can_create: perm.can_create,
          can_update: perm.can_update,
          can_delete: perm.can_delete,
          can_confirm: perm.can_confirm
        }))
        setMenuPermissions(permissions)
      }
    }
  }, [role])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama role harus diisi'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama role minimal 2 karakter'
    }

    if (!formData.level.trim()) {
      newErrors.level = 'Level role harus diisi'
    } else {
      const level = parseInt(formData.level)
      if (isNaN(level) || level < 0) {
        newErrors.level = 'Level harus berupa angka positif'
      } else if (level > 999) {
        newErrors.level = 'Level maksimal 999'
      }
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
      name: formData.name.trim(),
      level: parseInt(formData.level),
      menuPermissions: menuPermissions.filter(perm => 
        Object.values(perm).some(value => value === true)
      )
    }

    await onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getLevelBadge = (level: number) => {
    if (level >= 100) {
      return { label: 'Super Admin', variant: 'destructive' as const, description: 'Akses penuh ke semua fitur sistem' }
    } else if (level >= 50) {
      return { label: 'Admin', variant: 'default' as const, description: 'Akses admin dengan beberapa pembatasan' }
    } else if (level >= 20) {
      return { label: 'Manager', variant: 'secondary' as const, description: 'Akses manajerial untuk tim' }
    } else if (level >= 10) {
      return { label: 'Staff', variant: 'outline' as const, description: 'Akses staff untuk operasional' }
    } else {
      return { label: 'User', variant: 'outline' as const, description: 'Akses terbatas untuk pengguna biasa' }
    }
  }

  const currentLevel = parseInt(formData.level) || 0
  const levelBadge = getLevelBadge(currentLevel)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Role *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama role"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level Role *</Label>
              <Input
                id="level"
                type="number"
                min="0"
                max="999"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                placeholder="Masukkan level (0-999)"
                className={errors.level ? 'border-red-500' : ''}
              />
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Access Selection */}
      <MenuAccessSelector
        selectedPermissions={menuPermissions}
        onPermissionsChange={setMenuPermissions}
        loading={loading}
      />

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {role ? 'Perbarui Role' : 'Buat Role'}
        </Button>
      </div>
    </form>
  )
}
