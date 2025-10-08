'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tenant, tenantsApi, User, usersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, Users, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import TenantsTable from '@/components/table/tenants-table'
import TenantDetailDialog from '@/components/dialogs/tenant-detail-dialog'
import toast from 'react-hot-toast'

export default function TenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  
  // Filter dan sorting states
  const [userFilter, setUserFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<string>('asc')
  const [users, setUsers] = useState<User[]>([])

  const loadTenants = async () => {
    setLoading(true)
    try {
      // Prepare filter parameters
      const filterParams: any = {}
      if (searchTerm.trim()) {
        filterParams.name = searchTerm.trim()
      }
      if (userFilter !== 'all') {
        filterParams.user_id = userFilter
      }
      if (sortBy && sortOrder) {
        filterParams.order = `${sortBy}_${sortOrder}`
      }
      
      const response = await tenantsApi.getTenants(filterParams)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const tenantsData = Array.isArray(responseData.data) ? responseData.data : []
        setTenants(tenantsData)
        setFilteredTenants(tenantsData)
      } else {
        toast.error(response.error || 'Gagal memuat data tenants')
        setTenants([])
        setFilteredTenants([])
      }
    } catch (error) {
      console.error('Load tenants error:', error)
      toast.error('Terjadi kesalahan saat memuat data tenants')
      setTenants([])
      setFilteredTenants([])
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await usersApi.getUsers()
      if (response.success && response.data) {
        const usersData = Array.isArray(response.data) ? response.data : []
        setUsers(usersData)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Load users error:', error)
      setUsers([])
    }
  }

  useEffect(() => {
    loadTenants()
    loadUsers()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    loadTenants()
  }, [searchTerm, userFilter, sortBy, sortOrder])

  // Remove the old client-side filtering since we're using server-side filtering
  // useEffect(() => {
  //   if (searchTerm.trim()) {
  //     const filtered = tenants.filter(tenant =>
  //       tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       tenant.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (tenant.user?.name && tenant.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (tenant.user?.email && tenant.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  //     )
  //     setFilteredTenants(filtered)
  //   } else {
  //     setFilteredTenants(tenants)
  //   }
  // }, [searchTerm, tenants])

  const handleEdit = (tenant: Tenant) => {
    router.push(`/tenants/edit/${tenant.id}`)
  }

  const handleView = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadTenants()
  }

  const getStats = () => {
    if (!Array.isArray(tenants)) {
      return { total: 0, active: 0, expiring: 0, expired: 0 }
    }
    
    const total = tenants.length
    const active = tenants.filter(tenant => {
      const endDate = new Date(tenant.contract_end_at)
      const now = new Date()
      return endDate > now
    }).length
    const expiring = tenants.filter(tenant => {
      const endDate = new Date(tenant.contract_end_at)
      const now = new Date()
      const diffTime = endDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }).length
    const expired = tenants.filter(tenant => {
      const endDate = new Date(tenant.contract_end_at)
      const now = new Date()
      return endDate <= now
    }).length

    return { total, active, expiring, expired }
  }

  const stats = getStats()

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
            <BreadcrumbPage className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tenants
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Kelola data tenant dan kontrak sewa
          </p>
        </div>
        <Button onClick={() => router.push('/tenants/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua tenant terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontrak Aktif</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Kontrak masih berlaku
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akan Kadaluarsa</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground">
              Kadaluarsa dalam 30 hari
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kadaluarsa</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Kontrak sudah berakhir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Tenants</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filter Bar - Horizontal Layout */}
          <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua User</SelectItem>
                {Array.isArray(users) && users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama Tenant</SelectItem>
                <SelectItem value="code">Kode</SelectItem>
                <SelectItem value="contract_begin_at">Tanggal Mulai Kontrak</SelectItem>
                <SelectItem value="contract_end_at">Tanggal Berakhir Kontrak</SelectItem>
                <SelectItem value="created_at">Tanggal Dibuat</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A - Z</SelectItem>
                <SelectItem value="desc">Z - A</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setUserFilter('all')
                setSortBy('name')
                setSortOrder('asc')
              }}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Memuat data tenants...</span>
              </div>
            </div>
          ) : (
            <TenantsTable
              tenants={filteredTenants}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <TenantDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        tenant={selectedTenant}
      />
    </div>
  )
}
