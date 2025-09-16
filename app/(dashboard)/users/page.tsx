'use client'

import React, { useState, useEffect } from 'react'
import { User, usersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import SearchBox from "@/components/shared/search-box"
import CustomSelect from "@/components/shared/custom-select"
import UsersTable from '@/components/table/users-table'
import UserDetailDialog from '@/components/dialogs/user-detail-dialog'
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Load users
  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await usersApi.getUsers()
      
      if (response.success && response.data) {
        setUsers(response.data)
      } else {
        toast.error(response.error || 'Gagal memuat data users')
        setUsers([])
      }
    } catch (error) {
      console.error('Load users error:', error)
      toast.error('Terjadi kesalahan saat memuat data users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Handle view user detail
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setDetailDialogOpen(true)
  }

  return (
    <>
      <DashboardBreadcrumb title="Users Management" text="Users Management" />

      <Card className="card h-full !p-0 !block border-0 overflow-hidden mb-6">
        <CardHeader className="border-b border-neutral-200 dark:border-slate-600 !py-4 px-6 flex items-center flex-wrap gap-3 justify-between">
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-base font-medium text-secondary-light mb-0">Show</span>
            <CustomSelect
              placeholder="10"
              options={["5", "10", "25", "50", "100"]}
            />
            <SearchBox />
            <CustomSelect
              placeholder="Role"
              options={["All Roles", "Super Admin", "Admin", "User"]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className={cn(`w-auto h-11`)} asChild>
              <Link href="/users/create">
                <Plus className="w-5 h-5" />
                Add New User
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="card-body p-6">
          <UsersTable
            users={users}
            onEdit={(user) => {
              // Redirect to edit page
              window.location.href = `/users/edit/${user.id}`
            }}
            onView={handleViewUser}
            onRefresh={loadUsers}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        user={selectedUser}
      />
    </>
  )
}
