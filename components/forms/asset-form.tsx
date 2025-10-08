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
import { Loader2, Upload, Image, FileText, X, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import LeafletMapComponent from './leaflet-map-component'

const assetSchema = z.object({
  name: z.string().min(1, 'Nama asset harus diisi'),
  description: z.string().optional(),
  asset_type: z.number().min(1, 'Tipe asset harus dipilih'),
  address: z.string().min(1, 'Alamat harus diisi'),
  area: z.number().min(0.01, 'Luas area harus lebih dari 0'),
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
  const [showMapPicker, setShowMapPicker] = useState(true)
  
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      asset_type: 1,
      address: '',
      area: 0,
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
        area: asset.area || 0,
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
        
        form.setValue('area', parseFloat(asset.area as unknown as string) || 0)
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
      formData.append('area', data.area.toString())
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

         {/* File Upload Section */}
         <div className="space-y-6">
           <h3 className="text-lg font-semibold flex items-center gap-2">
             <Upload className="h-5 w-5" />
             Upload File
           </h3>
           
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
                     <Input 
                       type="file" 
                       accept="image/jpeg,image/jpg,image/png"
                       onChange={(e) => {
                         const file = e.target.files?.[0] || null
                         field.onChange(file)
                         handleFileChange(file, 'photo')
                       }}
                       className="cursor-pointer"
                     />
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

           {/* Sketsa Asset */}
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
                   <div className="space-y-6">
                     <Input 
                       type="file" 
                       accept="image/jpeg,image/jpg,image/png"
                       onChange={(e) => {
                         const file = e.target.files?.[0] || null
                         field.onChange(file)
                         handleFileChange(file, 'sketch')
                       }}
                       className="cursor-pointer"
                     />
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
                  step="0"
                  placeholder="Masukkan luas area dalam meter persegi"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Koordinat dengan Google Maps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasi Asset
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMapPicker(!showMapPicker)}
            >
              {showMapPicker ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
            </Button>
          </div>

          {showMapPicker && (
            <LeafletMapComponent
              latitude={form.watch('latitude') || 0}
              longitude={form.watch('longitude') || 0}
              onLocationChange={(lat, lng, address) => {
                form.setValue('latitude', lat)
                form.setValue('longitude', lng)
                if (address) {
                  form.setValue('address', address)
                }
              }}
              onAddressChange={(address) => {
                form.setValue('address', address)
              }}
              height="400px"
              className="border rounded-lg p-4"
            />
          )}

          {/* Manual coordinate inputs (hidden by default, can be shown if needed) */}
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
                  <FormLabel>Latitude</FormLabel>
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
