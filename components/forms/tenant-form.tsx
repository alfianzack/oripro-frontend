'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, CreateTenantData, UpdateTenantData, usersApi, unitsApi, User, Unit, DURATION_UNITS, DURATION_UNIT_LABELS } from '@/lib/api'
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
import { Loader2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface TenantFormProps {
  tenant?: Tenant
  onSubmit: (data: CreateTenantData | UpdateTenantData) => Promise<void>
  loading?: boolean
}

export default function TenantForm({ tenant, onSubmit, loading = false }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    contract_begin_at: '',
    rent_duration: '',
    rent_duration_unit: DURATION_UNITS.MONTH,
    tenant_identifications: [] as string[],
    contract_documents: [] as string[],
    unit_ids: [] as string[],
    categories: [] as number[],
  })
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newIdentification, setNewIdentification] = useState('')
  const [newContractDoc, setNewContractDoc] = useState('')
  const [newCategory, setNewCategory] = useState('')

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
      setFormData({
        name: tenant.name || '',
        user_id: tenant.user_id || '',
        contract_begin_at: tenant.contract_begin_at ? new Date(tenant.contract_begin_at).toISOString().split('T')[0] : '',
        rent_duration: tenant.rent_duration?.toString() || '',
        rent_duration_unit: tenant.rent_duration_unit || DURATION_UNITS.MONTH,
        tenant_identifications: tenant.tenant_identifications || [],
        contract_documents: tenant.contract_documents || [],
        unit_ids: tenant.unit_ids || [],
        categories: tenant.categories || [],
      })
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

    if (!formData.rent_duration || parseInt(formData.rent_duration) <= 0) {
      newErrors.rent_duration = 'Durasi sewa harus diisi dan lebih dari 0'
    }

    if (formData.tenant_identifications.length === 0) {
      newErrors.tenant_identifications = 'Minimal satu dokumen identitas harus diisi'
    }

    if (formData.contract_documents.length === 0) {
      newErrors.contract_documents = 'Minimal satu dokumen kontrak harus diisi'
    }

    if (formData.unit_ids.length === 0) {
      newErrors.unit_ids = 'Minimal satu unit harus dipilih'
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'Minimal satu kategori harus dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData = {
      name: formData.name.trim(),
      user_id: formData.user_id,
      contract_begin_at: formData.contract_begin_at,
      rent_duration: parseInt(formData.rent_duration),
      rent_duration_unit: formData.rent_duration_unit,
      tenant_identifications: formData.tenant_identifications,
      contract_documents: formData.contract_documents,
      unit_ids: formData.unit_ids,
      categories: formData.categories,
    }

    await onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string | string[] | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addIdentification = () => {
    if (newIdentification.trim()) {
      handleInputChange('tenant_identifications', [...formData.tenant_identifications, newIdentification.trim()])
      setNewIdentification('')
    }
  }

  const removeIdentification = (index: number) => {
    const newList = formData.tenant_identifications.filter((_, i) => i !== index)
    handleInputChange('tenant_identifications', newList)
  }

  const addContractDoc = () => {
    if (newContractDoc.trim()) {
      handleInputChange('contract_documents', [...formData.contract_documents, newContractDoc.trim()])
      setNewContractDoc('')
    }
  }

  const removeContractDoc = (index: number) => {
    const newList = formData.contract_documents.filter((_, i) => i !== index)
    handleInputChange('contract_documents', newList)
  }

  const addCategory = () => {
    const categoryNum = parseInt(newCategory)
    if (!isNaN(categoryNum) && !formData.categories.includes(categoryNum)) {
      handleInputChange('categories', [...formData.categories, categoryNum])
      setNewCategory('')
    }
  }

  const removeCategory = (category: number) => {
    const newList = formData.categories.filter(c => c !== category)
    handleInputChange('categories', newList)
  }

  const toggleUnit = (unitId: string) => {
    const newList = formData.unit_ids.includes(unitId)
      ? formData.unit_ids.filter(id => id !== unitId)
      : [...formData.unit_ids, unitId]
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
              value={newIdentification}
              onChange={(e) => setNewIdentification(e.target.value)}
              placeholder="Masukkan URL dokumen identitas"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIdentification())}
            />
            <Button type="button" onClick={addIdentification} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.tenant_identifications && (
            <p className="text-sm text-red-500">{errors.tenant_identifications}</p>
          )}
          <div className="space-y-2">
            {formData.tenant_identifications.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="flex-1 text-sm">{doc}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIdentification(index)}
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
              value={newContractDoc}
              onChange={(e) => setNewContractDoc(e.target.value)}
              placeholder="Masukkan URL dokumen kontrak"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContractDoc())}
            />
            <Button type="button" onClick={addContractDoc} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.contract_documents && (
            <p className="text-sm text-red-500">{errors.contract_documents}</p>
          )}
          <div className="space-y-2">
            {formData.contract_documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="flex-1 text-sm">{doc}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContractDoc(index)}
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
                  formData.unit_ids.includes(unit.id)
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
                  {formData.unit_ids.includes(unit.id) && (
                    <Badge variant="default">Dipilih</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kategori */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Masukkan ID kategori"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            />
            <Button type="button" onClick={addCategory} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.categories && (
            <p className="text-sm text-red-500">{errors.categories}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.categories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                Kategori {category}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeCategory(category)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
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
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tenant ? 'Perbarui Tenant' : 'Buat Tenant'}
        </Button>
      </div>
    </form>
  )
}
