'use client'

import React, { useState, useEffect } from 'react'
import { User, CreateUserData, UpdateUserData, usersApi } from '@/lib/api'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const userFormSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  name: z.string().min(1, 'Nama wajib diisi'),
  roleId: z.string().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

// Mock roles data - dalam implementasi nyata, ini harus diambil dari API
const mockRoles = [
  { id: '1', name: 'super_admin', level: 0 },
  { id: '2', name: 'admin', level: 1 },
  { id: '3', name: 'user', level: 2 },
]

export default function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      roleId: '',
    },
  })

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        password: '', // Don't pre-fill password for edit
        name: user.name || '',
        roleId: user.role_id || '',
      })
    } else {
      form.reset({
        email: '',
        password: '',
        name: '',
        roleId: '',
      })
    }
  }, [user, form])

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      let response

      if (isEdit && user) {
        // Update user
        const updateData: UpdateUserData = {
          email: data.email,
          name: data.name,
          roleId: data.roleId,
        }
        response = await usersApi.updateUser(user.id, updateData)
      } else {
        // Create user
        if (!data.password) {
          toast.error('Password wajib diisi untuk user baru')
          return
        }
        const createData: CreateUserData = {
          email: data.email,
          password: data.password,
          name: data.name,
          roleId: data.roleId,
        }
        response = await usersApi.createUser(createData)
      }

      if (response.success) {
        toast.success(isEdit ? 'User berhasil diperbarui' : 'User berhasil dibuat')
        onSuccess()
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(response.error || `Gagal ${isEdit ? 'memperbarui' : 'membuat'} user`)
      }
    } catch (error) {
      console.error('User form error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit User' : 'Tambah User Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Perbarui informasi user di bawah ini.' 
              : 'Isi informasi user baru di bawah ini.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama" {...field} />
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
                  <FormLabel>Email</FormLabel>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password {isEdit && <span className="text-muted-foreground">(kosongkan jika tidak ingin mengubah)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isEdit ? "Password baru (opsional)" : "Masukkan password"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} (Level {role.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Perbarui' : 'Buat User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
