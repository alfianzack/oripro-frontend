'use client'

import React, { useState, useEffect } from 'react'
import { User, CreateUserData, UpdateUserData, Role, rolesApi, usersApi } from '@/lib/api'
import AssetSelector from '@/components/ui/asset-selector'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userFormSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih'),
  roleId: z.string().optional(),
  status: z.string().optional(),
  assetIds: z.array(z.string()).optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: User | null
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function UserForm({ user, onSubmit, onCancel, loading = false }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      name: user?.name || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      roleId: user?.role_id ? user.role_id.toString() : '',
      status: user?.status || 'active',
      assetIds: [],
    },
  })

  // Load roles
  useEffect(() => {
    const loadRoles = async () => {
      setRolesLoading(true)
      try {
        const response = await rolesApi.getRoles()
        if (response.success && response.data) {
          setRoles(response.data)
        } else {
        // Fallback to mock data
        setRoles([
          { id: 1, name: 'Admin', level: 100 },
          { id: 2, name: 'Manager', level: 50 },
          { id: 3, name: 'Staff', level: 10 },
        ])
        }
      } catch (error) {
        console.error('Failed to load roles:', error)
        // Fallback to mock data
        setRoles([
          { id: 1, name: 'Admin', level: 100 },
          { id: 2, name: 'Manager', level: 50 },
          { id: 3, name: 'Staff', level: 10 },
        ])
      } finally {
        setRolesLoading(false)
      }
    }

    loadRoles()
  }, [])


  // Load user assets when editing
  useEffect(() => {
    if (user?.id) {
      const loadUserAssets = async () => {
        try {
          // For now, we'll initialize with empty array
          // TODO: Add getUserAssets method to usersApi
          const response = await usersApi.getUserAssets(user?.id)
          if (response.success && response.data) {
            const responseData = response.data as any
            console.log("responseData")
            console.log(responseData)
            const assetIds = responseData.data.map((ua: any) => ua.asset_id)
            setSelectedAssets(assetIds)
            form.setValue('assetIds', assetIds)
          }
        } catch (error) {
          console.error('Failed to load user assets:', error)
        }
      }

      loadUserAssets()
    }
  }, [user?.id, form])

  // Sync selectedAssets with form
  useEffect(() => {
    form.setValue('assetIds', selectedAssets)
  }, [selectedAssets, form])

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Keep gender as string for backend validation
      const formData = {
        ...data,
        gender: data.gender, // Keep as string "male" or "female"
        roleId: data.roleId || undefined,
        // Filter out null/undefined asset IDs
        assetIds: data.assetIds ? data.assetIds.filter(id => id && id !== null && id !== undefined) : [],
      }
      
      // Remove empty password for update
      if (user && !data.password) {
        const { password, ...updateData } = formData
        await onSubmit(updateData)
      } else {
        await onSubmit(formData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Masukkan email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="Masukkan nomor telepon" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={(value) => field.onChange(value)} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password {user ? '(kosongkan jika tidak ingin mengubah)' : '*'}
              </FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role dan Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        rolesLoading ? "Memuat roles..." : "Pilih role (opsional)"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Asset Selection */}
        <AssetSelector
          selectedAssets={selectedAssets}
          onAssetChange={setSelectedAssets}
          className="w-full"
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
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
            {user ? 'Perbarui User' : 'Buat User'}
          </Button>
        </div>
      </form>
    </Form>
  )
}