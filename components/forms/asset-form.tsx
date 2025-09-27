'use client'

import React from 'react'
import { Asset, CreateAssetData, UpdateAssetData, ASSET_TYPES, ASSET_TYPE_LABELS } from '@/lib/api'
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
import { Textarea } from '@/components/ui/textarea'
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
import * as z from 'zod'

const assetSchema = z.object({
  name: z.string().min(1, 'Nama asset harus diisi'),
  code: z.string().min(1, 'Kode asset harus diisi'),
  description: z.string().optional(),
  asset_type: z.number().min(1, 'Tipe asset harus dipilih'),
  address: z.string().min(1, 'Alamat harus diisi'),
  area: z.number().min(0.01, 'Luas area harus lebih dari 0'),
  longitude: z.number().min(-180).max(180, 'Longitude harus antara -180 dan 180').default(0),
  latitude: z.number().min(-90).max(90, 'Latitude harus antara -90 dan 90'),
  status: z.number().optional().default(1),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormProps {
  asset?: Asset | null
  onSubmit: (data: CreateAssetData | UpdateAssetData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function AssetForm({ asset, onSubmit, onCancel, loading = false }: AssetFormProps) {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      code: asset?.code || '',
      description: asset?.description || '',
      asset_type: asset?.asset_type || 1,
      address: asset?.address || '',
      area: asset?.area || 0,
      longitude: asset?.longitude || 0,
      latitude: asset?.latitude || 0,
      status: asset?.status || 1,
    },
  })

  const handleSubmit = async (data: AssetFormData) => {
    try {
      await onSubmit(data)
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
                <FormLabel>Nama Asset <span className="text-red-500">*</span></FormLabel>
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
                <FormLabel>Kode Asset <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan kode asset" {...field} />
                </FormControl>
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

        {/* Tipe dan Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="asset_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Asset <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe asset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
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
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Aktif</SelectItem>
                    <SelectItem value="0">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Alamat */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Masukkan alamat lengkap asset"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Luas Area */}
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Luas Area (m²) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Masukkan luas area dalam meter persegi"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Koordinat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001"
                    placeholder="Masukkan longitude"
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
                <FormLabel>Latitude </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001"
                    placeholder="Masukkan latitude"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
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
            {asset ? 'Perbarui Asset' : 'Buat Asset'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
