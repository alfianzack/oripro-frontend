'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, UpdateUserData, usersApi, Role, rolesApi } from '@/lib/api'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"

const userFormSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  name: z.string().min(1, 'Nama wajib diisi'),
  roleId: z.string().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

// Roles data akan diambil dari API

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      roleId: '',
    },
  })

  // Load roles from API
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await rolesApi.getRoles()
        if (response.success && response.data) {
          setRoles(response.data)
        }
      } catch (error) {
        console.error('Error loading roles:', error)
      } finally {
        setRolesLoading(false)
      }
    }

    loadRoles()
  }, [])

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return
      
      setLoadingUser(true)
      try {
        const response = await usersApi.getUser(userId)
        
        if (response.success && response.data) {
          setUser(response.data)
          form.reset({
            email: response.data.email,
            password: '', // Don't pre-fill password
            name: response.data.name || '',
            roleId: response.data.role_id || '',
          })
        } else {
          toast.error('User tidak ditemukan')
          router.push('/users')
        }
      } catch (error) {
        console.error('Load user error:', error)
        toast.error('Gagal memuat data user')
        router.push('/users')
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [userId, form, router])

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      const updateData: UpdateUserData = {
        email: data.email,
        name: data.name,
        roleId: data.roleId,
      }
      
      // Only include password if provided and not empty
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password
      }
      
      const response = await usersApi.updateUser(userId, updateData)

      if (response.success) {
        toast.success('User berhasil diperbarui')
        router.push('/users')
      } else {
        toast.error(response.error || 'Gagal memperbarui user')
      }
    } catch (error) {
      console.error('Update user error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/users')
  }

  if (loadingUser) {
    return (
      <>
        <DashboardBreadcrumb title="Edit User" text="Edit User" />
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading user data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardBreadcrumb title="Edit User" text="Edit User" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div>
              <CardDescription>
                Perbarui informasi user: {user?.name || user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      Password <span className="text-muted-foreground">(kosongkan jika tidak ingin mengubah)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Password baru (opsional)" 
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
                        {rolesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading roles...
                          </SelectItem>
                        ) : (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name} (Level {role.level})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" asChild>
                  <Link href="/users">Batal</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Menyimpan...' : 'Ubah'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
    </>
  )
}
