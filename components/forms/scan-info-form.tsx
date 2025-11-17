'use client'

import React, { useState, useEffect } from 'react'
import { ScanInfo, CreateScanInfoData, UpdateScanInfoData, assetsApi, Asset } from '@/lib/api'
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
import { Loader2, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import LeafletMapComponent from './leaflet-map-component'

const scanInfoSchema = z.object({
  scan_code: z.string().min(1, 'Code is required').trim(),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  asset_id: z.string().min(1, 'Asset is required').uuid('Asset ID must be a valid UUID'),
})

type ScanInfoFormData = z.infer<typeof scanInfoSchema>

interface ScanInfoFormProps {
  scanInfo?: ScanInfo | null
  onSubmit: (data: CreateScanInfoData | UpdateScanInfoData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ScanInfoForm({ scanInfo, onSubmit, onCancel, loading = false }: ScanInfoFormProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [showMapPicker, setShowMapPicker] = useState(true)

  const form = useForm<ScanInfoFormData>({
    resolver: zodResolver(scanInfoSchema),
    defaultValues: {
      scan_code: '',
      latitude: 0,
      longitude: 0,
      asset_id: '',
    },
  })

  // Load assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await assetsApi.getAssets()
        if (response.success && response.data) {
          const responseData = response.data as any
          const assetsData = Array.isArray(responseData.data) ? responseData.data : []
          setAssets(assetsData)
        }
      } catch (error) {
        console.error('Load assets error:', error)
      } finally {
        setAssetsLoading(false)
      }
    }
    loadAssets()
  }, [])

  // Update form values when scanInfo changes (for edit mode)
  useEffect(() => {
    if (scanInfo) {
      form.reset({
        scan_code: scanInfo.scan_code || '',
        latitude: scanInfo.latitude || 0,
        longitude: scanInfo.longitude || 0,
        asset_id: scanInfo.asset_id || '',
      })
    }
  }, [scanInfo, form])

  const handleSubmit = async (data: ScanInfoFormData) => {
    try {
      const submitData: CreateScanInfoData | UpdateScanInfoData = {
        scan_code: data.scan_code.trim(), 
        latitude: data.latitude,
        longitude: data.longitude,
        asset_id: data.asset_id,
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Code */}
        <FormField
          control={form.control}
          name="scan_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter scan code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location with Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasi Scan Info
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
              onLocationChange={(lat, lng) => {
                form.setValue('latitude', lat)
                form.setValue('longitude', lng)
              }}
              height="400px"
              className="border rounded-lg p-4"
            />
          )}

          {/* Manual coordinate inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="any"
                      placeholder="Enter latitude (-90 to 90)" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value}
                    />
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
                  <FormLabel>Longitude <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="any"
                      placeholder="Enter longitude (-180 to 180)" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Asset */}
        <FormField
          control={form.control}
          name="asset_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset <span className="text-red-500">*</span></FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={assetsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scanInfo ? 'Update Scan Info' : 'Create Scan Info'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
