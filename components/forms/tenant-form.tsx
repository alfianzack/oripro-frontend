'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, CreateTenantData, UpdateTenantData, usersApi, unitsApi, tenantsApi, User, Unit, DURATION_UNITS, DURATION_UNIT_LABELS } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, X, Upload, File } from 'lucide-react'
import toast from 'react-hot-toast'

interface TenantFormProps {
  tenant?: Tenant
  onSubmit: (data: CreateTenantData | UpdateTenantData) => Promise<void>
  loading?: boolean
}

// Kategori options
const CATEGORY_OPTIONS = [
  { value: 1, label: 'Restoran/Cafe' },
  { value: 2, label: 'Sport Club' },
  { value: 3, label: 'Kantor' },
  { value: 4, label: 'Tempat Hiburan' },
  { value: 5, label: 'Retail/Toko' },
  { value: 6, label: 'Klinik/Kesehatan' },
  { value: 7, label: 'Pendidikan' },
  { value: 8, label: 'Jasa Keuangan' },
  { value: 9, label: 'Other' },
]

export default function TenantForm({ tenant, onSubmit, loading = false }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    contract_begin_at: '',
    rent_duration: '',
    rent_duration_unit: DURATION_UNITS.MONTH,
    unit_ids: [] as string[],
    categories: [] as number[],
  })
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [identificationFiles, setIdentificationFiles] = useState<File[]>([])
  const [contractFiles, setContractFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [existingIdentificationUrls, setExistingIdentificationUrls] = useState<string[]>([])
  const [existingContractUrls, setExistingContractUrls] = useState<string[]>([])

  // Load users and units
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, unitsResponse] = await Promise.all([
          usersApi.getUsers(),
          unitsApi.getUnits()
        ])
        
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data)
        } else {
          toast.error('Gagal memuat data users')
        }
        
        if (unitsResponse.success && unitsResponse.data) {
          setUnits(unitsResponse.data)
        } else {
          toast.error('Gagal memuat data units')
        }
      } catch (error) {
        console.error('Load data error:', error)
        toast.error('Terjadi kesalahan saat memuat data')
      } finally {
        setUsersLoading(false)
        setUnitsLoading(false)
      }
    }

    loadData()
  }, [])

  // Initialize form data when tenant prop changes
  useEffect(() => {
    if (tenant) {
      console.log('Tenant data:', tenant)
      console.log('Tenant categories:', tenant.categories)
      console.log('Tenant units:', tenant.units)
      
      // Check for null values in arrays
      if (tenant.units && Array.isArray(tenant.units)) {
        console.log('Units with null check:', tenant.units.map(unit => unit == null ? 'NULL' : unit.id))
      }
      if (tenant.categories && Array.isArray(tenant.categories)) {
        console.log('Categories with null check:', tenant.categories.map(category => category == null ? 'NULL' : (category.id || category)))
      }
      
      // Extract unit IDs from units array if it exists, otherwise use unit_ids
      const unitIds = tenant.units && Array.isArray(tenant.units) ? tenant.units.filter(unit => unit != null).map((unit: any) => unit.id) : (tenant.unit_ids || [])
      
      // Extract category IDs from categories array if it exists, otherwise use categories as is
      const categoryIds = tenant.categories && Array.isArray(tenant.categories) ? tenant.categories.filter(category => category != null).map((category: any) => category.id || category) : []
      
      console.log('Extracted unitIds:', unitIds)
      console.log('Extracted categoryIds:', categoryIds)
      
      setFormData({
        name: tenant.name || '',
        user_id: tenant.user_id || '',
        contract_begin_at: tenant.contract_begin_at ? new Date(tenant.contract_begin_at).toISOString().split('T')[0] : '',
        rent_duration: tenant.rent_duration ? tenant.rent_duration.toString() : '',
        rent_duration_unit: tenant.rent_duration_unit || DURATION_UNITS.MONTH,
        unit_ids: unitIds,
        categories: categoryIds,
      })
      
      // Set existing file URLs for preview
      setExistingIdentificationUrls(tenant.tenant_identifications || [])
      setExistingContractUrls(tenant.contract_documents || [])
    }
  }, [tenant])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama tenant harus diisi'
    }

    if (!formData.user_id) {
      newErrors.user_id = 'User harus dipilih'
    }

    if (!formData.contract_begin_at) {
      newErrors.contract_begin_at = 'Tanggal mulai kontrak harus diisi'
    }

    if (!formData.rent_duration || isNaN(parseInt(formData.rent_duration)) || parseInt(formData.rent_duration) <= 0) {
      newErrors.rent_duration = 'Durasi sewa harus diisi dan lebih dari 0'
    }

    if (identificationFiles.length === 0 && existingIdentificationUrls.length === 0) {
      newErrors.identificationFiles = 'Minimal satu dokumen identitas harus diupload'
    }

    if (contractFiles.length === 0 && existingContractUrls.length === 0) {
      newErrors.contractFiles = 'Minimal satu dokumen kontrak harus diupload'
    }

    if (!formData.unit_ids || formData.unit_ids.length === 0) {
      newErrors.unit_ids = 'Minimal satu unit harus dipilih'
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'Kategori harus dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFiles = async (files: File[], type: 'identification' | 'contract') => {
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await tenantsApi.uploadTenantFile(file, type)
        
        if (!result.success) {
          throw new Error(result.error || 'Upload failed')
        }
        
        return result.data?.url || ''
      } catch (error) {
        console.error('Upload error:', error)
        throw error
      }
    })
    
    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setUploading(true)
    try {
      let identificationUrls = existingIdentificationUrls
      let contractUrls = existingContractUrls

      // Upload new files if any
      if (identificationFiles.length > 0) {
        const newIdentificationUrls = await uploadFiles(identificationFiles, 'identification')
        identificationUrls = [...existingIdentificationUrls, ...newIdentificationUrls]
      }

      if (contractFiles.length > 0) {
        const newContractUrls = await uploadFiles(contractFiles, 'contract')
        contractUrls = [...existingContractUrls, ...newContractUrls]
      }

      const submitData = {
        name: formData.name.trim(),
        user_id: formData.user_id,
        contract_begin_at: formData.contract_begin_at,
        rent_duration: parseInt(formData.rent_duration) || 0,
        rent_duration_unit: formData.rent_duration_unit,
        unit_ids: formData.unit_ids,
        categories: formData.categories,
        tenant_identifications: identificationUrls,
        contract_documents: contractUrls,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Gagal mengupload file. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (field: string, value: string | string[] | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileUpload = (files: FileList | null, type: 'identification' | 'contract') => {
    if (!files) return

    const fileArray = Array.from(files)
    if (type === 'identification') {
      setIdentificationFiles(prev => [...prev, ...fileArray])
      if (errors.identificationFiles) {
        setErrors(prev => ({ ...prev, identificationFiles: '' }))
      }
    } else {
      setContractFiles(prev => [...prev, ...fileArray])
      if (errors.contractFiles) {
        setErrors(prev => ({ ...prev, contractFiles: '' }))
      }
    }
  }

  const removeFile = (index: number, type: 'identification' | 'contract') => {
    if (type === 'identification') {
      setIdentificationFiles(prev => prev.filter((_, i) => i !== index))
    } else {
      setContractFiles(prev => prev.filter((_, i) => i !== index))
    }
  }


  const toggleUnit = (unitId: string) => {
    const currentUnitIds = formData.unit_ids || []
    const newList = currentUnitIds.includes(unitId)
      ? currentUnitIds.filter(id => id !== unitId)
      : [...currentUnitIds, unitId]
    handleInputChange('unit_ids', newList)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tenant *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama tenant"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_id">User *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => handleInputChange('user_id', value)}
                disabled={usersLoading}
              >
                <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={usersLoading ? "Memuat users..." : "Pilih user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.user_id && (
                <p className="text-sm text-red-500">{errors.user_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_begin_at">Tanggal Mulai Kontrak *</Label>
              <Input
                id="contract_begin_at"
                type="date"
                value={formData.contract_begin_at}
                onChange={(e) => handleInputChange('contract_begin_at', e.target.value)}
                className={errors.contract_begin_at ? 'border-red-500' : ''}
              />
              {errors.contract_begin_at && (
                <p className="text-sm text-red-500">{errors.contract_begin_at}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent_duration">Durasi Sewa *</Label>
              <div className="flex gap-2">
                <Input
                  id="rent_duration"
                  type="number"
                  min="1"
                  value={formData.rent_duration}
                  onChange={(e) => handleInputChange('rent_duration', e.target.value)}
                  placeholder="Masukkan durasi"
                  className={errors.rent_duration ? 'border-red-500' : ''}
                />
                <Select
                  value={formData.rent_duration_unit}
                  onValueChange={(value) => handleInputChange('rent_duration_unit', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DURATION_UNIT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.rent_duration && (
                <p className="text-sm text-red-500">{errors.rent_duration}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor="categories">Kategori *</Label>
                <Select
                  value={formData.categories && formData.categories.length > 0 ? formData.categories[0].toString() : ''}
                  onValueChange={(value) => handleInputChange('categories', [parseInt(value)])}
              >
                <SelectTrigger className={errors.categories ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih kategori tenant" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categories && (
                <p className="text-sm text-red-500">{errors.categories}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dokumen Identitas */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen Identitas *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files, 'identification')}
              className="flex-1"
            />
            <Button type="button" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </label>
            </Button>
          </div>
          {errors.identificationFiles && (
            <p className="text-sm text-red-500">{errors.identificationFiles}</p>
          )}
          <div className="space-y-2">
            {/* Existing files preview */}
            {existingIdentificationUrls.map((url, index) => (
              <div key={`existing-${index}`} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                <File className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-blue-800">Existing Document {index + 1}</span>
                  <div className="text-xs text-blue-600">
                    {url.split('/').pop()}
                  </div>
                  {/* Preview untuk gambar existing */}
                  {url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                    <div className="mt-2">
                      <img
                        src={url}
                        alt={`Existing document ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">Existing</Badge>
              </div>
            ))}
            
            {/* New files preview */}
            {identificationFiles.map((file, index) => (
              <div key={`new-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                <File className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{file.name}</span>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  {/* Preview untuk gambar */}
                  {file.type.startsWith('image/') && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded border"
                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index, 'identification')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dokumen Kontrak */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen Kontrak *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files, 'contract')}
              className="flex-1"
            />
            <Button type="button" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </label>
            </Button>
          </div>
          {errors.contractFiles && (
            <p className="text-sm text-red-500">{errors.contractFiles}</p>
          )}
          <div className="space-y-2">
            {/* Existing contract files preview */}
            {existingContractUrls.map((url, index) => (
              <div key={`existing-contract-${index}`} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                <File className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-800">Existing Contract {index + 1}</span>
                  <div className="text-xs text-green-600">
                    {url.split('/').pop()}
                  </div>
                  {/* Preview untuk gambar existing */}
                  {url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                    <div className="mt-2">
                      <img
                        src={url}
                        alt={`Existing contract ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">Existing</Badge>
              </div>
            ))}
            
            {/* New contract files preview */}
            {contractFiles.map((file, index) => (
              <div key={`new-contract-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                <File className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{file.name}</span>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  {/* Preview untuk gambar */}
                  {file.type.startsWith('image/') && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded border"
                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index, 'contract')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unit Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Unit *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.unit_ids && (
            <p className="text-sm text-red-500">{errors.unit_ids}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {units.map((unit) => (
              <div
                key={unit.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  (formData.unit_ids || []).includes(unit.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleUnit(unit.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {unit.size} m² - {unit.rent_price ? new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(unit.rent_price) : 'Harga tidak tersedia'}
                    </p>
                  </div>
                  {(formData.unit_ids || []).includes(unit.id) && (
                    <Badge variant="default">Dipilih</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading || uploading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {(loading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {uploading ? 'Mengupload file...' : tenant ? 'Perbarui Tenant' : 'Buat Tenant'}
        </Button>
      </div>
    </form>
  )
}
