'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateRoleData, rolesApi, MenuAccess, MENU_STRUCTURE } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, ShieldCheck, Plus, User, Settings } from 'lucide-react'
import RoleForm from '@/components/forms/role-form'
import MenuAccessComponent from '@/components/forms/menu-access'
import toast from 'react-hot-toast'

export default function CreateRolePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('role-form')
  const [roleData, setRoleData] = useState<CreateRoleData | null>(null)
  const [menuAccess, setMenuAccess] = useState<MenuAccess[]>(MENU_STRUCTURE)

  const handleRoleSubmit = async (data: CreateRoleData) => {
    setRoleData(data)
    setActiveTab('menu-access')
    toast.success('Informasi role berhasil disimpan, lanjutkan ke pengaturan akses menu')
  }

  const handleMenuAccessChange = (newMenuAccess: MenuAccess[]) => {
    setMenuAccess(newMenuAccess)
  }

  const handleFinalSubmit = async () => {
    if (!roleData) {
      toast.error('Data role belum lengkap')
      setActiveTab('role-form')
      return
    }

    setLoading(true)
    try {
      const response = await rolesApi.createRole(roleData)
      
      if (response.success && response.data) {
        toast.success('Role berhasil dibuat')
        router.push('/roles')
      } else {
        toast.error(response.error || 'Gagal membuat role')
      }
    } catch (error) {
      console.error('Create role error:', error)
      toast.error('Terjadi kesalahan saat membuat role')
    } finally {
      setLoading(false)
    }
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
    return countAccess(menuAccess)
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
    return countTotal(menuAccess)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/roles" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Roles
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Role Baru
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Role Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan role baru ke sistem dengan informasi lengkap dan pengaturan akses menu
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="role-form" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Form Role
          </TabsTrigger>
          <TabsTrigger value="menu-access" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Access Menu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Role</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleForm onSubmit={handleRoleSubmit} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu-access" className="space-y-6">
          <div className="space-y-4">
            {roleData && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Role yang Akan Dibuat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nama Role
                      </label>
                      <p className="text-sm font-medium">{roleData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Level
                      </label>
                      <p className="text-sm font-medium">{roleData.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <MenuAccessComponent
              menuAccess={menuAccess}
              onChange={handleMenuAccessChange}
            />

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Akses Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{getAccessCount()}</p>
                    <p className="text-sm text-muted-foreground">Menu Aktif</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-muted-foreground">{getTotalCount() - getAccessCount()}</p>
                    <p className="text-sm text-muted-foreground">Menu Non-Aktif</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{getTotalCount()}</p>
                    <p className="text-sm text-muted-foreground">Total Menu</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveTab('role-form')}
                disabled={loading}
              >
                Kembali ke Form Role
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={loading || !roleData}
              >
                {loading ? 'Membuat Role...' : 'Buat Role'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
