'use client'

import React from 'react'
import { User } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface UserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export default function UserDetailDialog({ open, onOpenChange, user }: UserDetailDialogProps) {
  if (!user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeVariant = (roleName?: string) => {
    switch (roleName?.toLowerCase()) {
      case 'super_admin':
        return 'destructive'
      case 'admin':
        return 'default'
      case 'user':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detail User</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang user ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="text-sm font-mono">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nama</label>
                <p className="text-sm">{user.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role?.name)}>
                    {user.role?.name || 'No Role'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Information */}
          {user.role && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Role</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role ID</label>
                  <p className="text-sm font-mono">{user.role.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level</label>
                  <p className="text-sm">{user.role.level}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Waktu</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dibuat</label>
                <p className="text-sm">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Diperbarui</label>
                <p className="text-sm">{formatDate(user.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(user.created_by || user.updated_by) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Tambahan</h3>
                <div className="grid grid-cols-2 gap-4">
                  {user.created_by && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dibuat Oleh</label>
                      <p className="text-sm font-mono">{user.created_by}</p>
                    </div>
                  )}
                  {user.updated_by && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Diperbarui Oleh</label>
                      <p className="text-sm font-mono">{user.updated_by}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
