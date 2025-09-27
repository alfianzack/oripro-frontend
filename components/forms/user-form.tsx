'use client'

import React, { useState, useEffect } from 'react'
import { User, CreateUserData, UpdateUserData, Role, rolesApi } from '@/lib/api'
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
  roleId: z.string().optional(),
  status: z.string().optional(),
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

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      name: user?.name || '',
      roleId: user?.role_id || '',
      status: user?.status || 'active',
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
            { id: '1', name: 'Admin', level: 100 },
            { id: '2', name: 'Manager', level: 50 },
            { id: '3', name: 'Staff', level: 10 },
          ])
        }
      } catch (error) {
        console.error('Failed to load roles:', error)
        // Fallback to mock data
        setRoles([
          { id: '1', name: 'Admin', level: 100 },
          { id: '2', name: 'Manager', level: 50 },
          { id: '3', name: 'Staff', level: 10 },
        ])
      } finally {
        setRolesLoading(false)
      }
    }

    loadRoles()
  }, [])

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Remove empty password for update
      if (user && !data.password) {
        const { password, ...updateData } = data
        await onSubmit(updateData)
      } else {
        await onSubmit(data)
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
                      <SelectItem key={role.id} value={role.id}>
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