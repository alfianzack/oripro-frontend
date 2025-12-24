'use client'

import React, { useState, useEffect } from 'react'
import { settingsApi, Setting } from '@/lib/api'
import DashboardBreadcrumb from '@/components/layout/dashboard-breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Edit, RefreshCw, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingOptionsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsApi.getSettings()
      
      if (response.success && response.data) {
        // Pastikan response.data adalah array
        let settingsData: Setting[] = []
        if (Array.isArray(response.data)) {
          settingsData = response.data
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          const nestedData = (response.data as any).data
          settingsData = Array.isArray(nestedData) ? nestedData : []
        } else {
          settingsData = []
        }
        setSettings(settingsData)
      } else {
        setSettings([]) // Set ke array kosong jika error
        toast.error(response.error || 'Gagal memuat settings')
      }
    } catch (error: any) {
      console.error('Error loading settings:', error)
      setSettings([]) // Set ke array kosong jika error
      toast.error('Gagal memuat settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting)
    setEditValue(setting.value)
    setEditDescription(setting.description || '')
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingSetting) return

    try {
      setSaving(true)
      const response = await settingsApi.updateSettingByKey(editingSetting.key, {
        value: editValue,
        description: editDescription,
      })
      console.log(response)
      if (response.success) {
        toast.success('Setting berhasil diperbarui')
        setEditDialogOpen(false)
        setEditingSetting(null)
        loadSettings()
      } else {
        throw new Error(response.error || 'Gagal memperbarui setting')
      }
    } catch (error: any) {
      console.error('Error updating setting:', error)
      toast.error(error.message || 'Gagal memperbarui setting')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditDialogOpen(false)
    setEditingSetting(null)
    setEditValue('')
    setEditDescription('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <DashboardBreadcrumb title="Setting Options" text="Setting Options" />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pengaturan Sistem</CardTitle>
            <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Memuat settings...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Tidak ada settings
                      </TableCell>
                    </TableRow>
                  ) : (
                    settings.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-medium">{setting.key}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{setting.value}</span>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <span className="text-sm text-muted-foreground">
                            {setting.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(setting.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(setting)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Edit value dan description untuk setting: <strong>{editingSetting?.key}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Masukkan value"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Masukkan description (opsional)"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving || !editValue}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
