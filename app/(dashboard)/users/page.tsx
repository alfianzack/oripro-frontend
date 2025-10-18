'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, usersApi, Role, rolesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, UsersRound, Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
import UsersTable from '@/components/table/users-table'
import UserViewDialog from '@/components/dialogs/user-view-dialog'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Filter dan sorting states
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<string>('asc')
  const [roles, setRoles] = useState<Role[]>([])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Prepare filter parameters
      const filterParams: any = {}
      if (searchTerm.trim()) {
        filterParams.name = searchTerm.trim()
      }
      if (roleFilter !== 'all') {
        filterParams.role_id = roleFilter
      }
      if (statusFilter !== 'all') {
        filterParams.status = statusFilter
      }
      if (sortBy && sortOrder) {
        filterParams.order = `${sortBy}_${sortOrder}`
      }
      
      const response = await usersApi.getUsers(filterParams)
      
      if (response.success && response.data) {
        // Ensure data is an array
        const responseData = response.data as any
        const usersData = Array.isArray(responseData.data) ? responseData.data : []
        setUsers(usersData)
        setFilteredUsers(usersData)
      } else {
        toast.error(response.error || 'Gagal memuat data users')
        // Set empty arrays on error
        setUsers([])
        setFilteredUsers([])
      }
    } catch (error) {
      console.error('Load users error:', error)
      toast.error('Terjadi kesalahan saat memuat data users')
      // Set empty arrays on error
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await rolesApi.getRoles()
      if (response.success && response.data) {
        setRoles(response.data)
      }
    } catch (error) {
      console.error('Load roles error:', error)
    }
  }

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    loadUsers()
  }, [searchTerm, roleFilter, statusFilter, sortBy, sortOrder])

  // Remove the old client-side filtering since we're using server-side filtering
  // useEffect(() => {
  //   if (searchTerm.trim()) {
  //     const filtered = users.filter(user =>
  //       user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //     setFilteredUsers(filtered)
  //   } else {
  //     setFilteredUsers(users)
  //   }
  // }, [searchTerm, users])

  const handleEdit = (user: User) => {
    router.push(`/users/edit/${user.id}`)
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleRefresh = () => {
    loadUsers()
  }

  const getStats = () => {
    // Ensure users is an array before using filter
    const usersArray = Array.isArray(users) ? users : []
    
    const total = usersArray.length
    const superAdmin = usersArray.filter(user => (user.role?.level ?? 0) >= 100).length
    const admin = usersArray.filter(user => (user.role?.level ?? 0) >= 50 && (user.role?.level ?? 0) < 100).length
    const manager = usersArray.filter(user => (user.role?.level ?? 0) >= 20 && (user.role?.level ?? 0) < 50).length
    const staff = usersArray.filter(user => (user.role?.level ?? 0) >= 10 && (user.role?.level ?? 0) < 20).length
    const user = usersArray.filter(user => (user.role?.level ?? 0) < 10).length

    return { total, superAdmin, admin, manager, staff, user }
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
              <UsersRound className="h-4 w-4" />
              Users
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Kelola pengguna dan akses sistem
          </p>
        </div>
        <Button onClick={() => router.push('/users/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua pengguna terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.superAdmin}</div>
            <p className="text-xs text-muted-foreground">
              Level 100+
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admin}</div>
            <p className="text-xs text-muted-foreground">
              Level 50-99
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manager</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.manager}</div>
            <p className="text-xs text-muted-foreground">
              Level 20-49
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staff}</div>
            <p className="text-xs text-muted-foreground">
              Level 10-19
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.user}</div>
            <p className="text-xs text-muted-foreground">
              Level 0-9
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Users</CardTitle>
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
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role_id">Role</SelectItem>
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
                setRoleFilter('all')
                setStatusFilter('all')
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
                <span>Memuat data users...</span>
              </div>
            </div>
          ) : (
            <UsersTable
              users={filteredUsers}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* User View Dialog */}
      <UserViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        user={selectedUser}
      />
    </div>
  )
}
