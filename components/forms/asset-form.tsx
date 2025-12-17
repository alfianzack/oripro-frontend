'use client'

import React, { useState, useEffect } from 'react'
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
import { Loader2, Upload, Image, FileText, X, MapPin, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import LeafletMapComponent from './leaflet-map-component'

const assetSchema = z.object({
  name: z.string().min(1, 'Nama asset harus diisi'),
  description: z.string().optional(),
  asset_type: z.number().min(1, 'Tipe asset harus dipilih'),
  address: z.string().min(1, 'Alamat harus diisi'),
  area: z.string().min(1, 'Luas area harus dipilih'),
  longitude: z.number().min(-180).max(180, 'Longitude harus antara -180 dan 180'),
  latitude: z.number().min(-90).max(90, 'Latitude harus antara -90 dan 90'),
  status: z.number().default(1),
  photo: z.any().optional(),
  sketch: z.any().optional(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormProps {
  asset?: Asset | null
  onSubmit: (data: CreateAssetData | UpdateAssetData | FormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function AssetForm({ asset, onSubmit, onCancel, loading = false }: AssetFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [sketchPreview, setSketchPreview] = useState<string | null>(null)
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null)
  const [existingSketch, setExistingSketch] = useState<string | null>(null)
  
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      asset_type: 1,
      address: '',
      area: '',
      longitude: 0,
      latitude: 0,
      status: 1,
      photo: null,
      sketch: null,
    },
  })

  // Update form values when asset changes (for edit mode)
  useEffect(() => {
    if (asset) {
      // Convert string values to integers for form
      const assetTypeMap: { [key: string]: number } = {
        'ESTATE': 1,
        'OFFICE': 2,
        'WAREHOUSE': 3,
        'SPORT': 4,
        'ENTERTAINMENTRESTAURANT': 5,
        'RESIDENCE': 6,
        'MALL': 7,
        'SUPPORTFACILITYMOSQUEITAL': 8,
        'PARKINGLOT': 9,
      }
      
      const statusMap: { [key: string]: number } = {
        'active': 1,
        'inactive': 0,
      }
      
      const convertedAssetType = typeof asset.asset_type === 'string' ? assetTypeMap[asset.asset_type] || 1 : asset.asset_type || 1
      const convertedStatus = typeof asset.status === 'string' ? statusMap[asset.status] || 1 : asset.status || 1
      
      form.reset({
        name: asset.name || '',
        description: asset.description || '',
        asset_type: convertedAssetType,
        address: asset.address || '',
        area: asset.area ? getAreaCategory(asset.area) : '',
        longitude: asset.longitude || 0,
        latitude: asset.latitude || 0,
        status: convertedStatus,
        photo: null,
        sketch: null,
      })
    }
  }, [asset, form])

  // Re-set form values after a short delay to ensure proper initialization
  useEffect(() => {
    if (asset) {
      const timer = setTimeout(() => {
        const assetTypeMap: { [key: string]: number } = {
          'ESTATE': 1,
          'OFFICE': 2,
          'WAREHOUSE': 3,
          'SPORT': 4,
          'ENTERTAINMENTRESTAURANT': 5,
          'RESIDENCE': 6,
          'MALL': 7,
          'SUPPORTFACILITYMOSQUEITAL': 8,
          'PARKINGLOT': 9,
        }
        
        const statusMap: { [key: string]: number } = {
          'active': 1,
          'inactive': 0,
        }
        
        const convertedAssetType = typeof asset.asset_type === 'string' ? assetTypeMap[asset.asset_type] || 1 : asset.asset_type || 1
        const convertedStatus = typeof asset.status === 'string' ? statusMap[asset.status] || 1 : asset.status || 1
        
        form.setValue('area', asset.area ? getAreaCategory(asset.area) : '')
        form.setValue('asset_type', convertedAssetType)
        form.setValue('status', convertedStatus)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [asset, form])

  // Set existing images when editing
  useEffect(() => {
    if (asset) {
      if (asset.photos && asset.photos.length > 0) {
        setExistingPhoto(asset.photos[0])
      }
      if (asset.sketch) {
        setExistingSketch(asset.sketch)
      }
    }
  }, [asset])

  const handleFileChange = (file: File | null, type: 'photo' | 'sketch') => {
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file JPG, JPEG, dan PNG yang diperbolehkan')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (type === 'photo') {
          setPhotoPreview(result)
          setExistingPhoto(null) // Clear existing photo when new one is selected
        } else {
          setSketchPreview(result)
          setExistingSketch(null) // Clear existing sketch when new one is selected
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (data: AssetFormData) => {
    try {
      // Prepare FormData for file upload
      const formData = new FormData()
      
      // Add basic asset data - ensure all values are properly formatted
      formData.append('name', data.name.trim())
      formData.append('description', data.description?.trim() || '')
      formData.append('asset_type', data.asset_type.toString())
      formData.append('address', data.address.trim())
      // Convert area category to number (use middle value of range)
      let areaValue = 0
      if (data.area) {
        if (data.area.includes('-')) {
          const [min, max] = data.area.split('-').map(v => parseInt(v))
          areaValue = max ? Math.floor((min + max) / 2) : min
        } else if (data.area.includes('+')) {
          areaValue = parseInt(data.area.replace('+', '')) || 5001
        } else {
          areaValue = parseFloat(data.area) || 0
        }
      }
      formData.append('area', areaValue.toString())
      formData.append('longitude', data.longitude.toString())
      formData.append('latitude', data.latitude.toString())
      formData.append('status', data.status.toString())
      
      // Handle photo upload - backend expects 'photos' field
      if (data.photo) {
        formData.append('photos', data.photo)
      }
      if (data.sketch) {
        formData.append('sketch', data.sketch)
      }
      
      // For edit mode, if no new files are selected but existing images are removed,
      // we need to handle that case
      if (asset && !data.photo && !existingPhoto) {
        // Photo was removed
        formData.append('remove_photo', 'true')
      }
      if (asset && !data.sketch && !existingSketch) {
        // Sketch was removed
        formData.append('remove_sketch', 'true')
      }
      
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Area categories for dropdown
  const AREA_CATEGORIES = [
    { value: '0-50', label: '0 - 50 m²' },
    { value: '51-100', label: '51 - 100 m²' },
    { value: '101-200', label: '101 - 200 m²' },
    { value: '201-500', label: '201 - 500 m²' },
    { value: '501-1000', label: '501 - 1000 m²' },
    { value: '1001-5000', label: '1001 - 5000 m²' },
    { value: '5001+', label: '5001+ m²' },
  ]

  // Convert number area to category string
  const getAreaCategory = (area: number | string): string => {
    const areaNum = typeof area === 'string' ? parseFloat(area) : area
    if (areaNum <= 50) return '0-50'
    if (areaNum <= 100) return '51-100'
    if (areaNum <= 200) return '101-200'
    if (areaNum <= 500) return '201-500'
    if (areaNum <= 1000) return '501-1000'
    if (areaNum <= 5000) return '1001-5000'
    return '5001+'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informasi Asset */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Informasi Asset</h3>
          
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
              name="asset_type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tipe Asset <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="w-full">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Luas Area (m²) <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AREA_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
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
                <FormItem className="w-full">
                  <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || '1'}>
                    <FormControl>
                      <SelectTrigger className="w-full">
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Asset (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Masukkan spesifikasi detail dari asset ini"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Lokasi Asset */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lokasi Asset
          </h3>

          <LeafletMapComponent
            latitude={form.watch('latitude') || 0}
            longitude={form.watch('longitude') || 0}
            onLocationChange={(lat, lng) => {
              form.setValue('latitude', lat)
              form.setValue('longitude', lng)
            }}
            height="400px"
            className="border rounded-lg p-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001"
                      placeholder="0"
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
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Alamat bisa terisi otomatis setelah dipilih dari peta"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dokumen */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Dokumen</h3>
          
          {/* Foto Asset */}
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Foto Asset
                  <span className="text-xs text-gray-500">(JPG, PNG, JPEG)</span>
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <Input 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          field.onChange(file)
                          handleFileChange(file, 'photo')
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <p className="text-sm text-gray-600">Upload File</p>
                    </div>
                    {(photoPreview || existingPhoto) && (
                      <div className="relative">
                        <img 
                          src={photoPreview || existingPhoto || ''} 
                          alt="Photo preview" 
                          className="w-full h-68 object-cover rounded-lg border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPhotoPreview(null)
                            setExistingPhoto(null)
                            field.onChange(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sketsa Denah */}
          <FormField
            control={form.control}
            name="sketch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sketsa Denah
                  <span className="text-xs text-gray-500">(JPG, PNG, JPEG)</span>
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <Input 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          field.onChange(file)
                          handleFileChange(file, 'sketch')
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <p className="text-sm text-gray-600">Upload File</p>
                    </div>
                    {(sketchPreview || existingSketch) && (
                      <div className="relative">
                        <img 
                          src={sketchPreview || existingSketch || ''} 
                          alt="Sketch preview" 
                          className="w-full h-68 object-cover rounded-lg border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSketchPreview(null)
                            setExistingSketch(null)
                            field.onChange(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
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
