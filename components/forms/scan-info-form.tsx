'use client'

import React, { useState, useEffect } from 'react'
import { ScanInfo, CreateScanInfoData, UpdateScanInfoData, assetsApi, scanInfoApi, Asset } from '@/lib/api'
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

const createScanInfoSchema = (existingScanInfoId?: number) => z.object({
  scan_code: z.string().min(1, 'Code is required').trim().refine(
    async (value) => {
      // Check if scan_code already exists
      try {
        const response = await scanInfoApi.getScanInfos({ scan_code: value, limit: 1 })
        if (response.success && response.data) {
          const responseData = response.data as any
          let scanInfosData: ScanInfo[] = []
          
          // Handle different response structures
          if (responseData && typeof responseData === 'object') {
            if (responseData.data && Array.isArray(responseData.data.scanInfos)) {
              scanInfosData = responseData.data.scanInfos
            } else if (Array.isArray(responseData.scanInfos)) {
              scanInfosData = responseData.scanInfos
            } else if (Array.isArray(responseData.data)) {
              scanInfosData = responseData.data
            } else if (Array.isArray(responseData)) {
              scanInfosData = responseData
            }
          }
          
          // If editing, exclude current scan info from check
          if (existingScanInfoId) {
            const existingScanInfo = scanInfosData.find(si => si.id === existingScanInfoId)
            if (existingScanInfo && existingScanInfo.scan_code === value) {
              return true // Same scan info with same code is allowed
            }
            return scanInfosData.filter(si => si.id !== existingScanInfoId).length === 0
          }
          
          return scanInfosData.length === 0
        }
        return true
      } catch (error) {
        console.error('Error checking scan_code uniqueness:', error)
        return true // Allow on error to avoid blocking user
      }
    },
    {
      message: 'Scan code already exists',
    }
  ),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  asset_id: z.string().min(1, 'Asset is required').uuid('Asset ID must be a valid UUID'),
})

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
  
  // Create schema with existing scan info ID for edit mode
  const scanInfoSchema = createScanInfoSchema(scanInfo?.id)
  type ScanInfoFormData = z.infer<typeof scanInfoSchema>

  const form = useForm<ScanInfoFormData>({
    resolver: zodResolver(scanInfoSchema),
    mode: 'onBlur', // Validate on blur for better UX
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
    if (scanInfo && !assetsLoading && assets.length > 0) {
      form.reset({
        scan_code: scanInfo.scan_code || '',
        latitude: scanInfo.latitude || 0,
        longitude: scanInfo.longitude || 0,
        asset_id: String(scanInfo.asset_id || ''),
      })
    } else if (!scanInfo) {
      // Reset to default values when creating new scan info
      form.reset({
        scan_code: '',
        latitude: 0,
        longitude: 0,
        asset_id: '',
      })
    }
  }, [scanInfo, form, assetsLoading, assets])

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
                <Input 
                  placeholder="Enter scan code" 
                  {...field}
                  onBlur={() => {
                    field.onBlur()
                    // Trigger validation on blur
                    form.trigger('scan_code')
                  }}
                />
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
                value={field.value || ''}
                disabled={assetsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={assetsLoading ? "Loading assets..." : "Select asset"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={String(asset.id)}>
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
