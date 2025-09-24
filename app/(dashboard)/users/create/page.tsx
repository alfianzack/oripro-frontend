'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateUserData, usersApi, Role, rolesApi } from '@/lib/api'
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
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(1, 'Nama wajib diisi'),
  roleId: z.string().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

// Roles data akan diambil dari API

export default function CreateUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      const createData: CreateUserData = {
        email: data.email,
        password: data.password,
        name: data.name,
        roleId: data.roleId,
      }
      
      const response = await usersApi.createUser(createData)

      if (response.success) {
        toast.success('User berhasil dibuat')
        router.push('/users')
      } else {
        toast.error(response.error || 'Gagal membuat user')
      }
    } catch (error) {
      console.error('Create user error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/users')
  }

  return (
    <>
      <DashboardBreadcrumb title="Create User" text="Create User" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div>
              <CardDescription>
                Tambahkan user baru ke dalam sistem
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Masukkan password" 
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
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
    </>
  )
}
