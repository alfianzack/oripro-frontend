'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assetsApi, CreateAssetData, ASSET_TYPES, ASSET_TYPE_LABELS } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb"
import Link from "next/link"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const assetSchema = z.object({
  name: z.string().min(1, 'Nama asset harus diisi'),
  code: z.string().min(1, 'Kode asset harus diisi'),
  description: z.string().optional(),
  asset_type: z.number().min(1, 'Tipe asset harus dipilih'),
  address: z.string().min(1, 'Alamat harus diisi'),
  area: z.number().min(0.01, 'Luas area harus lebih dari 0'),
  longitude: z.number().min(-180).max(180, 'Longitude harus antara -180 dan 180'),
  latitude: z.number().min(-90).max(90, 'Latitude harus antara -90 dan 90'),
  status: z.number().optional().default(1),
})

type AssetFormData = z.infer<typeof assetSchema>

export default function CreateAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      asset_type: 1,
      address: '',
      area: 0,
      longitude: 0,
      latitude: 0,
      status: 1,
    },
  })

  const onSubmit = async (data: AssetFormData) => {
    setLoading(true)
    try {
      const response = await assetsApi.createAsset(data)
      
      if (response.success) {
        toast.success('Asset berhasil dibuat')
        router.push('/asset')
      } else {
        toast.error(response.error || 'Gagal membuat asset')
      }
    } catch (error) {
      console.error('Create asset error:', error)
      toast.error('Terjadi kesalahan saat membuat asset')
    } finally {
      setLoading(false)
    }
  }

  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label: label
  }))

  return (
    <>
      <DashboardBreadcrumb title="Create Asset" text="Create Asset" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/asset">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>Buat Asset Baru</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Asset *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama asset" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Asset *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kode asset" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="asset_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe Asset *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe asset" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assetTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
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
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan deskripsi asset (opsional)" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Lokasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Alamat *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan alamat lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.000001"
                            placeholder="0.000000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.000001"
                            placeholder="0.000000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Luas Area (m²) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" asChild>
                  <Link href="/asset">Batal</Link>
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
