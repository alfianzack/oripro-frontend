'use client'

import React, { useState, useEffect } from 'react'
import { Tenant, CreateTenantData, UpdateTenantData, usersApi, unitsApi, tenantsApi, rolesApi, User, Unit, DURATION_UNITS, DURATION_UNIT_LABELS } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Loader2, Plus, X, File, Search, UserPlus, Users } from 'lucide-react'
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

// Status options
const STATUS_OPTIONS = [
  { value: 'inactive', label: 'Tidak Aktif' },
  { value: 'active', label: 'Aktif' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'blacklisted', label: 'Blacklisted' },
]

export default function TenantForm({ tenant, onSubmit, loading = false }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    contract_begin_at: '',
    contract_end_at: '',
    rent_duration: '',
    rent_duration_unit: DURATION_UNITS.MONTH,
    unit_id: '',
    category: 0,
    rent_price: 0,
    down_payment: 0,
    deposit: 0,
    deposit_reason: '',
    payment_term: '',
    status: 'pending',
  })
  const [userSelectionType, setUserSelectionType] = useState<'existing' | 'new'>('existing')
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    role_id: ''
  })
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [identificationFiles, setIdentificationFiles] = useState<File[]>([])
  const [contractFiles, setContractFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [existingIdentificationUrls, setExistingIdentificationUrls] = useState<string[]>([])
  const [existingContractUrls, setExistingContractUrls] = useState<string[]>([])
  const [originalDeposit, setOriginalDeposit] = useState<number>(0)

  // Load users, units, and roles
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, unitsResponse, rolesResponse] = await Promise.all([
          usersApi.getUsers(),
          // When editing, load all units to show selected ones; when creating, only load available units
          tenant ? unitsApi.getUnits() : unitsApi.getUnits({ status: 0 }),
          rolesApi.getRoles()
        ])
        
        if (usersResponse.success && usersResponse.data) {
          const usersResponseData = usersResponse.data as any
          const usersData = Array.isArray(usersResponseData.data) ? usersResponseData.data : []
          setUsers(usersData)
        } else {
          toast.error('Gagal memuat data users')
          setUsers([])
        }
        
        if (unitsResponse.success && unitsResponse.data) {
          const unitsResponseData = unitsResponse.data as any
          const unitsData = Array.isArray(unitsResponseData.data) ? unitsResponseData.data : []
          setUnits(unitsData)
        } else {
          toast.error('Gagal memuat data units')
          setUnits([])
        }
        
        if (rolesResponse.success && rolesResponse.data) {
          const rolesData = Array.isArray(rolesResponse.data) ? rolesResponse.data : []
          setRoles(rolesData)
        } else {
          toast.error('Gagal memuat data roles')
          setRoles([])
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat memuat data')
        setUsers([])
        setUnits([])
        setRoles([])
      } finally {
        setUsersLoading(false)
        setUnitsLoading(false)
        setRolesLoading(false)
      }
    }

    loadData()
  }, [])

  // Initialize form data when tenant prop changes
  useEffect(() => {
    if (tenant) {
      // Extract unit ID from units array if it exists, otherwise use unit_ids (take first one if array)
      let unitId = ''
      if (tenant.units && Array.isArray(tenant.units) && tenant.units.length > 0) {
        const firstUnit = tenant.units.find(unit => unit != null)
        unitId = firstUnit?.id || ''
      } else if (tenant.unit_ids) {
        // If unit_ids is array, take first one; if string, use directly
        unitId = Array.isArray(tenant.unit_ids) ? (tenant.unit_ids[0] || '') : tenant.unit_ids
      }
      
      // Extract category value from tenant.category object
      let categoryValue: number = 0
      if (tenant.category) {
        if (typeof tenant.category === 'object' && tenant.category.id !== undefined) {
          categoryValue = typeof tenant.category.id === 'number' ? tenant.category.id : parseInt(String(tenant.category.id), 10)
        } else if (typeof tenant.category === 'number') {
          categoryValue = tenant.category
        } else {
          categoryValue = parseInt(String(tenant.category), 10)
        }
        // Ensure it's a valid number
        if (isNaN(categoryValue) || categoryValue <= 0) {
          categoryValue = 0
        }
      }
      
      // Also check tenant.categories for backward compatibility
      if (categoryValue === 0 && tenant.categories) {
        if (Array.isArray(tenant.categories) && tenant.categories.length > 0) {
          const firstCategory = tenant.categories[0]
          if (typeof firstCategory === 'object' && firstCategory.id !== undefined) {
            categoryValue = typeof firstCategory.id === 'number' ? firstCategory.id : parseInt(String(firstCategory.id), 10)
          } else {
            categoryValue = typeof firstCategory === 'number' ? firstCategory : parseInt(String(firstCategory), 10)
          }
          if (isNaN(categoryValue) || categoryValue <= 0) {
            categoryValue = 0
          }
        } else if (!Array.isArray(tenant.categories)) {
          categoryValue = typeof tenant.categories === 'number' ? tenant.categories : parseInt(String(tenant.categories), 10)
          if (isNaN(categoryValue) || categoryValue <= 0) {
            categoryValue = 0
          }
        }
      }
      
      setFormData({
        name: tenant.name || '',
        user_id: tenant.user_id || '',
        contract_begin_at: tenant.contract_begin_at ? new Date(tenant.contract_begin_at).toISOString().split('T')[0] : '',
        contract_end_at: tenant.contract_end_at ? new Date(tenant.contract_end_at).toISOString().split('T')[0] : '',
        rent_duration: tenant.rent_duration ? tenant.rent_duration.toString() : '',
        rent_duration_unit: (() => {
          // Convert rent_duration_unit from number (1 for month, 0 for year) to string ('month' or 'year')
          if (tenant.rent_duration_unit !== undefined && tenant.rent_duration_unit !== null) {
            if (typeof tenant.rent_duration_unit === 'number') {
              return tenant.rent_duration_unit === 1 ? DURATION_UNITS.MONTH : DURATION_UNITS.YEAR
            } else if (typeof tenant.rent_duration_unit === 'string') {
              return tenant.rent_duration_unit === DURATION_UNITS.YEAR || String(tenant.rent_duration_unit).toLowerCase() === 'year' ? DURATION_UNITS.YEAR : DURATION_UNITS.MONTH
            }
          }
          return DURATION_UNITS.MONTH
        })(),
        unit_id: unitId,
        category: categoryValue,
        rent_price: tenant.rent_price || 0,
        down_payment: tenant.down_payment || 0,
        deposit: tenant.deposit || 0,
        deposit_reason: '',
        payment_term: (() => {
          // Convert payment_term from number (0 or 1) to string ('year' or 'month')
          if (tenant.payment_term !== undefined && tenant.payment_term !== null) {
            if (typeof tenant.payment_term === 'number') {
              return tenant.payment_term === 0 ? DURATION_UNITS.YEAR : DURATION_UNITS.MONTH
            } else if (typeof tenant.payment_term === 'string') {
              return tenant.payment_term
            }
          }
          // Default based on rent_duration_unit
          return tenant.rent_duration_unit === DURATION_UNITS.MONTH ? DURATION_UNITS.MONTH : (tenant.rent_duration_unit === DURATION_UNITS.YEAR ? DURATION_UNITS.MONTH : DURATION_UNITS.MONTH)
        })(),
        status: (tenant as any).status || 'pending',
      })
      
      // Store original deposit value to detect changes
      setOriginalDeposit(tenant.deposit || 0)
      
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

    if (userSelectionType === 'existing') {
      if (!formData.user_id) {
        newErrors.user_id = 'User harus dipilih'
      }
    } else {
      // Validasi field user baru
      if (!newUserData.name.trim()) newErrors.user_id = 'Nama user baru harus diisi'
      else if (!newUserData.email.trim()) newErrors.user_id = 'Email user baru harus diisi'
      else if (!newUserData.password.trim()) newErrors.user_id = 'Password user baru harus diisi'
      else if (!newUserData.phone.trim()) newErrors.user_id = 'No. telepon user baru harus diisi'
      else if (!newUserData.gender) newErrors.user_id = 'Jenis kelamin user baru harus dipilih'
      else if (!newUserData.role_id) newErrors.user_id = 'Role user baru harus dipilih'
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

    if (!formData.unit_id || formData.unit_id.trim() === '') {
      newErrors.unit_id = 'Unit harus dipilih'
    }

    if (!formData.category || formData.category === 0) {
      newErrors.category = 'Kategori harus dipilih'
    }

    if (!formData.rent_price || formData.rent_price <= 0) {
      newErrors.rent_price = 'Harga sewa harus diisi dan lebih dari 0'
    }

    // Validate payment_term (only when creating and rent_duration_unit is year)
    if (!tenant && formData.rent_duration_unit === DURATION_UNITS.YEAR && !formData.payment_term) {
      newErrors.payment_term = 'Periode pembayaran harus dipilih'
    }

    // Validate deposit reason when updating deposit (only when editing)
    if (tenant && formData.deposit !== originalDeposit) {
      if (!formData.deposit_reason || !formData.deposit_reason.trim()) {
        newErrors.deposit_reason = 'Alasan perubahan deposit harus diisi'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFiles = async (files: File[], type: 'identification' | 'contract') => {
    const uploadPromises = files.map(async (file) => {
      try {
        const response = await tenantsApi.uploadTenantFile(file, type)
        
        if (response.success && response.data) {
          // Handle both array and string response formats
          const url = Array.isArray(response.data.url) ? response.data.url[0] : response.data.url
          return url || ''
        } else {
          throw new Error(response.error || 'Upload failed')
        }
      } catch (error) {
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
      let createdUserId: string | null = null
      // Jika mode user baru, buat user terlebih dahulu
      if (userSelectionType === 'new' && !formData.user_id) {
        const createUserResponse = await usersApi.createUser({
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password,
          phone: newUserData.phone,
          gender: newUserData.gender,
          roleId: newUserData.role_id ? String(parseInt(newUserData.role_id as any, 10)) : undefined,
          status: 'active'
        })

        if (!createUserResponse.success || !createUserResponse.data) {
          throw new Error(createUserResponse.error || 'Gagal membuat user baru')
        }
        
        // Handle response structure - backend returns { data: userObject, message, status }
        // API client might wrap it differently
        let userId: string | undefined
        
        if (createUserResponse.data) {
          // Check if data is nested (data.data) - handle case where API client wraps response
          const responseData = createUserResponse.data as any
          if (responseData.data && responseData.data.id) {
            userId = responseData.data.id
          } 
          // Check if data is the user object directly
          else if (responseData.id) {
            userId = responseData.id
          }
        }
        
        if (!userId) {
          throw new Error('Gagal mendapatkan ID user yang baru dibuat')
        }
        
        createdUserId = userId
        setFormData(prev => ({ ...prev, user_id: createdUserId! }))
      }

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

      const effectiveUserId = userSelectionType === 'new' ? (createdUserId || formData.user_id) : formData.user_id

      // Validasi user_id sebelum submit
      if (!effectiveUserId || effectiveUserId === '') {
        throw new Error('User ID tidak tersedia. Pastikan user sudah dipilih atau dibuat.')
      }
      
      // Convert payment_term from string to number: 0 for year, 1 for month
      let paymentTermValue: number | undefined = undefined
      if (formData.payment_term && !tenant) {
        if (formData.payment_term === DURATION_UNITS.YEAR) {
          paymentTermValue = 0
        } else if (formData.payment_term === DURATION_UNITS.MONTH) {
          paymentTermValue = 1
        }
      }

      // Convert rent_duration_unit from string to number: 1 for month, 0 for year
      let rentDurationUnitValue: number
      if (formData.rent_duration_unit === DURATION_UNITS.MONTH) {
        rentDurationUnitValue = 1
      } else if (formData.rent_duration_unit === DURATION_UNITS.YEAR) {
        rentDurationUnitValue = 0
      } else {
        rentDurationUnitValue = 1 // default to month
      }

      const submitData = {
        name: formData.name.trim(),
        user_id: effectiveUserId,
        contract_begin_at: formData.contract_begin_at,
        contract_end_at: formData.contract_end_at,
        rent_duration: parseInt(formData.rent_duration) || 0,
        rent_duration_unit: rentDurationUnitValue,
        unit_ids: [formData.unit_id], // Backend expects array, so wrap single unit_id in array
        category_id: formData.category,
        rent_price: formData.rent_price,
        ...(formData.down_payment > 0 ? { down_payment: formData.down_payment } : {}),
        // When updating, always include deposit (even if 0) to allow emptying the value
        // When creating, only include if > 0
        ...(tenant 
          ? { deposit: formData.deposit } 
          : (formData.deposit > 0 ? { deposit: formData.deposit } : {})
        ),
        ...(paymentTermValue !== undefined ? { payment_term: paymentTermValue } : {}),
        ...(tenant && formData.deposit !== originalDeposit && formData.deposit_reason ? { deposit_reason: formData.deposit_reason.trim() } : {}),
        ...(formData.status ? { status: formData.status } : {}),
        tenant_identifications: identificationUrls,
        contract_documents: contractUrls,
      }

      // Validate that URLs are arrays of strings
      if (!Array.isArray(identificationUrls)) {
        throw new Error('Identification URLs must be an array')
      }
      if (!Array.isArray(contractUrls)) {
        throw new Error('Contract URLs must be an array')
      }
      
      // Validate that all URLs are strings
      const invalidIdentificationUrls = identificationUrls.filter(url => typeof url !== 'string')
      const invalidContractUrls = contractUrls.filter(url => typeof url !== 'string')
      
      if (invalidIdentificationUrls.length > 0) {
        throw new Error('All identification URLs must be strings')
      }
      if (invalidContractUrls.length > 0) {
        throw new Error('All contract URLs must be strings')
      }

      await onSubmit(submitData)
    } catch (error) {
      toast.error('Gagal membuat tenant. ' + error)
    } finally {
      setUploading(false)
    }
  }

  // Format price with thousand separators (Indonesian format: 1.000.000)
  const formatPrice = (value: number | string): string => {
    if (value === null || value === undefined || value === '') return ''
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value
    if (isNaN(numValue)) return ''
    // Allow 0 to be displayed (needed for deposit field when updating)
    if (numValue === 0) return '0'
    // Convert to integer string and add thousand separators
    const integerPart = Math.floor(numValue).toString()
    return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Parse price input: remove separators and leading zeros
  const parsePrice = (value: string): number => {
    if (!value || value.trim() === '') return 0
    // Remove thousand separators (dots) and any non-digit characters except decimal point
    const cleaned = value.replace(/\./g, '').replace(/[^\d]/g, '')
    if (!cleaned || cleaned === '') return 0
    // Remove leading zeros but keep at least one digit if all zeros
    const parsed = cleaned.replace(/^0+(?=\d)/, '') || '0'
    return parseFloat(parsed) || 0
  }

  const handleInputChange = (field: string, value: string | string[] | number[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle price input change with formatting
  const handlePriceChange = (field: 'rent_price' | 'down_payment' | 'deposit', value: string) => {
    const parsedValue = parsePrice(value)
    handleInputChange(field, parsedValue)
  }

  const handleFileChange = (file: File | null, type: 'identification' | 'contract') => {
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Hanya file JPG, JPEG, PNG, PDF, DOC, dan DOCX yang diperbolehkan')
        return
      }

      // Validasi ukuran file (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error('Ukuran file maksimal 10MB')
        return
      }

      if (type === 'identification') {
        setIdentificationFiles(prev => [...prev, file])
        if (errors.identificationFiles) {
          setErrors(prev => ({ ...prev, identificationFiles: '' }))
        }
      } else {
        setContractFiles(prev => [...prev, file])
        if (errors.contractFiles) {
          setErrors(prev => ({ ...prev, contractFiles: '' }))
        }
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

  const getFileIcon = (file: File | string) => {
    const fileName = typeof file === 'string' ? file : file.name
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image'
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf'
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'word'
    } else {
      return 'file'
    }
  }

  const getFilePreview = (file: File | string, index: number) => {
    const fileName = typeof file === 'string' ? file.split('/').pop() || 'Unknown' : file.name
    const fileType = getFileIcon(file)
    const isImage = fileType === 'image'
    
    if (typeof file === 'string') {
      // Existing file
      return (
        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          {isImage ? (
            <img 
              src={file} 
              alt={fileName}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center p-2">
              <File className="h-8 w-8 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600 truncate">{fileName}</p>
            </div>
          )}
        </div>
      )
    } else {
      // New file
      return (
        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          {isImage ? (
            <img 
              src={URL.createObjectURL(file)} 
              alt={fileName}
              className="w-full h-full object-cover rounded-lg"
              onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
            />
          ) : (
            <div className="text-center p-2">
              <File className="h-8 w-8 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600 truncate">{fileName}</p>
            </div>
          )}
        </div>
      )
    }
  }


  const selectUnit = (unitId: string) => {
    // Single selection: if clicking the same unit, deselect it; otherwise select the new one
    const newUnitId = formData.unit_id === unitId ? '' : unitId
    handleInputChange('unit_id', newUnitId)
  }

  const selectCategory = (categoryId: number) => {
    handleInputChange('category', categoryId)
  }


  // Calculate contract end date based on start date and duration
  useEffect(() => {
    if (formData.contract_begin_at && formData.rent_duration && formData.rent_duration_unit) {
      const startDate = new Date(formData.contract_begin_at)
      const duration = parseInt(formData.rent_duration)
      const unit = formData.rent_duration_unit
      
      let endDate = new Date(startDate)
      
      if (unit === DURATION_UNITS.YEAR) {
        endDate.setFullYear(endDate.getFullYear() + duration)
      } else {
        endDate.setMonth(endDate.getMonth() + duration)
      }
      
      // Subtract one day to get the actual end date
      endDate.setDate(endDate.getDate() - 1)
      
      setFormData(prev => ({ 
        ...prev, 
        contract_end_at: endDate.toISOString().split('T')[0] 
      }))
    }
  }, [formData.contract_begin_at, formData.rent_duration, formData.rent_duration_unit])

  // Auto-set payment_term to "month" when rent_duration_unit is "month"
  useEffect(() => {
    if (!tenant && formData.rent_duration_unit === DURATION_UNITS.MONTH) {
      setFormData(prev => ({ ...prev, payment_term: DURATION_UNITS.MONTH }))
    }
  }, [formData.rent_duration_unit, tenant])

  const createNewUser = async () => {
    try {
      const response = await usersApi.createUser({
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        phone: newUserData.phone,
        gender: newUserData.gender,
        roleId: newUserData.role_id,
        status: 'active'
      })
      
      if (response.success && response.data) {
        toast.success('User berhasil dibuat')
        setFormData(prev => ({ ...prev, user_id: response.data!.id }))
        setUserSelectionType('existing')
        setNewUserData({ name: '', email: '', password: '', phone: '', gender: '', role_id: '' })
        // Reload users list
        const usersResponse = await usersApi.getUsers()
        if (usersResponse.success && usersResponse.data) {
          const usersResponseData = usersResponse.data as any
          const usersData = Array.isArray(usersResponseData.data) ? usersResponseData.data : []
          setUsers(usersData)
        }
      } else {
        toast.error(response.error || 'Gagal membuat user')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat membuat user')
    }
  }

  const handleNewUserInputChange = (field: string, value: string) => {
    setNewUserData(prev => ({ ...prev, [field]: value }))
  }

  const filteredUsers = Array.isArray(users) ? users
    // filter hanya role tenant
    .filter(user => user.role?.name?.toLowerCase() === 'tenant')
    // filter pencarian
    .filter(user => {
      if (!userSearchTerm.trim()) return true
      const searchTerm = userSearchTerm.toLowerCase()
      return (
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      )
    }) : []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layout Single Column */}
          <div className="space-y-6">
            {/* Nama Tenant */}
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

            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user_selection">User *</Label>
              
              {tenant ? (
                /* Read-only display when editing */
                <div className="p-3 bg-muted/50 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {tenant.user?.name || users.find(u => u.id === formData.user_id)?.name || 'User tidak ditemukan'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.user?.email || users.find(u => u.id === formData.user_id)?.email || ''}
                      </p>
                    </div>
                    <Badge variant="secondary">Tidak dapat diubah</Badge>
                  </div>
                </div>
              ) : (
                <>
                  {/* User Selection Type Toggle */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={userSelectionType === 'existing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserSelectionType('existing')}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      User yang Ada
                    </Button>
                    <Button
                      type="button"
                      variant={userSelectionType === 'new' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserSelectionType('new')}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      User Baru
                    </Button>
                  </div>

                  {/* Existing User Selection */}
                  {userSelectionType === 'existing' && (
                    <div className="space-y-3">
                      {/* Selected User Display */}
                      {formData.user_id && (
                        <div className="p-3 bg-primary/10 border border-primary rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-primary">
                                {users.find(u => u.id === formData.user_id)?.name || 'User tidak ditemukan'}
                              </p>
                              <p className="text-sm text-primary/70">
                                {users.find(u => u.id === formData.user_id)?.email || ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-primary text-primary-foreground">
                                Dipilih
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleInputChange('user_id', '')}
                                className="text-xs"
                              >
                                Ubah
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari user..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      
                      {/* User List */}
                      <div className="max-h-40 overflow-y-auto border rounded-md">
                        {usersLoading ? (
                          <div className="p-4 text-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                            Memuat users...
                          </div>
                        ) : users.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Tidak ada user tersedia
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            {userSearchTerm ? `Tidak ada user yang cocok dengan "${userSearchTerm}"` : 'Tidak ada user tersedia'}
                          </div>
                        ) : (
                          filteredUsers.map((user) => {
                            const isSelected = formData.user_id === user.id
                            
                            return (
                              <div
                                key={user.id}
                                className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                                  isSelected ? 'bg-primary/10 border-primary' : ''
                                }`}
                                onClick={() => {
                                  handleInputChange('user_id', user.id)
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{user.name || 'Nama tidak tersedia'}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                  {isSelected && (
                                    <Badge variant="default">Dipilih</Badge>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* New User Form */}
                  {userSelectionType === 'new' && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_user_name">Nama User *</Label>
                      <Input
                        id="new_user_name"
                        value={newUserData.name}
                        onChange={(e) => handleNewUserInputChange('name', e.target.value)}
                        placeholder="Masukkan nama user"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_user_email">Email *</Label>
                      <Input
                        id="new_user_email"
                        type="email"
                        value={newUserData.email}
                        onChange={(e) => handleNewUserInputChange('email', e.target.value)}
                        placeholder="Masukkan email user"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_user_password">Password *</Label>
                      <Input
                        id="new_user_password"
                        type="password"
                        value={newUserData.password}
                        onChange={(e) => handleNewUserInputChange('password', e.target.value)}
                        placeholder="Masukkan password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_user_phone">No. Telepon *</Label>
                      <Input
                        id="new_user_phone"
                        type="tel"
                        value={newUserData.phone}
                        onChange={(e) => handleNewUserInputChange('phone', e.target.value)}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_user_gender">Jenis Kelamin *</Label>
                      <Select
                        value={newUserData.gender}
                        onValueChange={(value) => handleNewUserInputChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Laki-laki</SelectItem>
                          <SelectItem value="female">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_user_role">Role *</Label>
              <Select
                        value={newUserData.role_id}
                        onValueChange={(value) => handleNewUserInputChange('role_id', value)}
                        disabled={rolesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={rolesLoading ? "Memuat roles..." : "Pilih role"} />
                </SelectTrigger>
                <SelectContent>
                          {Array.isArray(roles) && roles.map((role) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                              {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                    </div>
                  </div>
                  
                </div>
                  )}
                </>
              )}

            {errors.user_id && (
              <p className="text-sm text-red-500">{errors.user_id}</p>
            )}
            </div>
          </div>

          {/* Unit Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Unit *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.unit_id && (
                <p className="text-sm text-red-500">{errors.unit_id}</p>
              )}
              {tenant ? (
                /* Read-only display when editing */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(() => {
                    // Use tenant.units if available, otherwise filter from loaded units using formData.unit_id
                    let displayUnit: any = null
                    if (tenant.units && Array.isArray(tenant.units) && tenant.units.length > 0) {
                      displayUnit = tenant.units.find((unit: any) => unit != null)
                    } else if (formData.unit_id) {
                      displayUnit = units.find(unit => unit.id === formData.unit_id)
                    }
                    
                    return displayUnit ? (
                      <div
                        key={displayUnit.id}
                        className="p-3 border rounded bg-muted/50 border-primary"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{displayUnit.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {displayUnit.asset?.name && (
                                <span className="text-blue-600 font-medium">Asset: {displayUnit.asset.name}</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {displayUnit.size} m² - {displayUnit.rent_price ? new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(displayUnit.rent_price) : 'Harga tidak tersedia'}
                            </p>
                          </div>
                          <Badge variant="secondary">Tidak dapat diubah</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground col-span-2">
                        Tidak ada unit yang dipilih
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Array.isArray(units) && units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        formData.unit_id === unit.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => selectUnit(unit.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{unit.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {unit.asset?.name && (
                              <span className="text-blue-600 font-medium">Asset: {unit.asset.name}</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {unit.size} m² - {unit.rent_price ? new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(unit.rent_price) : 'Harga tidak tersedia'}
                          </p>
                        </div>
                        {formData.unit_id === unit.id && (
                          <Badge variant="default">Dipilih</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Separator */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Informasi Kontrak
              </span>
            </div>
          </div>

          {/* Informasi Kontrak */}
          <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract_begin_at">Tanggal Mulai Kontrak *</Label>
                <Input
                  id="contract_begin_at"
                  type="date"
                  value={formData.contract_begin_at}
                  onChange={(e) => handleInputChange('contract_begin_at', e.target.value)}
                  disabled={!!tenant}
                  className={errors.contract_begin_at ? 'border-red-500' : tenant ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
                {tenant && (
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah saat edit</p>
                )}
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
                    disabled={!!tenant}
                    className={errors.rent_duration ? 'border-red-500' : tenant ? 'bg-gray-50 cursor-not-allowed' : ''}
                  />
                  <Select
                    value={formData.rent_duration_unit}
                    onValueChange={(value) => handleInputChange('rent_duration_unit', value)}
                    disabled={!!tenant}
                  >
                    <SelectTrigger className={`w-32 ${tenant ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
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
                {tenant && (
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah saat edit</p>
                )}
                {errors.rent_duration && (
                  <p className="text-sm text-red-500">{errors.rent_duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_end_at">Tanggal Berakhir Kontrak</Label>
                <Input
                  id="contract_end_at"
                  type="date"
                  value={formData.contract_end_at}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Tanggal berakhir kontrak dihitung otomatis berdasarkan tanggal mulai dan durasi sewa
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent_price">
                  Harga Sewa (Rent Price) <span className="text-red-500">*</span>
                  {tenant && <span className="text-muted-foreground text-sm ml-2">(tidak dapat diubah saat edit)</span>}
                </Label>
                <Input
                  id="rent_price"
                  type="text"
                  value={formatPrice(formData.rent_price)}
                  onChange={(e) => handlePriceChange('rent_price', e.target.value)}
                  placeholder="Masukkan harga sewa"
                  disabled={!!tenant}
                  className={errors.rent_price ? 'border-red-500' : tenant ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
                {errors.rent_price && (
                  <p className="text-sm text-red-500">{errors.rent_price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="down_payment">
                  Uang Muka (Down Payment)
                  {tenant && <span className="text-muted-foreground text-sm ml-2">(tidak dapat diubah saat edit)</span>}
                </Label>
                <Input
                  id="down_payment"
                  type="text"
                  value={formatPrice(formData.down_payment)}
                  onChange={(e) => handlePriceChange('down_payment', e.target.value)}
                  placeholder="Masukkan uang muka"
                  disabled={!!tenant}
                  className={tenant ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Deposit</Label>
                <Input
                  id="deposit"
                  type="text"
                  value={formatPrice(formData.deposit)}
                  onChange={(e) => handlePriceChange('deposit', e.target.value)}
                  placeholder="Masukkan deposit"
                />
              </div>

              {/* Payment Term - Only show when creating and rent_duration_unit is year */}
              {!tenant && formData.rent_duration_unit === DURATION_UNITS.YEAR && (
                <div className="space-y-2">
                  <Label htmlFor="payment_term">Periode Pembayaran (Payment Term) <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.payment_term}
                    onValueChange={(value) => handleInputChange('payment_term', value)}
                  >
                    <SelectTrigger className={errors.payment_term ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih periode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DURATION_UNITS.MONTH}>
                        Monthly
                      </SelectItem>
                      <SelectItem value={DURATION_UNITS.YEAR}>
                        Annual
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_term && (
                    <p className="text-sm text-red-500">{errors.payment_term}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Pilih apakah pembayaran dilakukan per bulan atau per tahun
                  </p>
                </div>
              )}

              {/* Price Per Term Display - Show when creating or editing, when all required fields are filled */}
              {formData.rent_price > 0 && formData.rent_duration && formData.payment_term && String(formData.payment_term).trim() !== '' && (
                <div className="space-y-2">
                  <Label>
                    Harga Dibayar per {formData.payment_term === DURATION_UNITS.YEAR ? 'Tahun' : 'Bulan'}
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-lg font-semibold text-gray-900">
                      {(() => {
                        const rentPrice = formData.rent_price || 0
                        const downPayment = formData.down_payment || 0
                        const duration = parseInt(formData.rent_duration) || 0
                        const durationUnit = formData.rent_duration_unit
                        const paymentTerm = formData.payment_term
                        
                        if (duration > 0 && paymentTerm) {
                          // Convert duration to months
                          let durationInMonths = duration
                          if (durationUnit === DURATION_UNITS.YEAR) {
                            durationInMonths = duration * 12
                          }
                          
                          // Calculate number of payments based on payment_term
                          let numberOfPayments = durationInMonths
                          if (paymentTerm === DURATION_UNITS.YEAR) {
                            numberOfPayments = durationInMonths / 12
                          }
                          
                          // Formula: (rent_price - down_payment) / numberOfPayments
                          const pricePerTerm = numberOfPayments > 0 ? (rentPrice - downPayment) / numberOfPayments : 0
                          
                          if (numberOfPayments > 0 && pricePerTerm > 0) {
                            return new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(pricePerTerm)
                          }
                        }
                        return '-'
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit Reason - Only show when editing and deposit is being updated */}
              {tenant && formData.deposit !== originalDeposit && (
                <div className="space-y-2">
                  <Label htmlFor="deposit_reason">
                    Alasan Perubahan Deposit <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deposit_reason"
                    type="text"
                    value={formData.deposit_reason}
                    onChange={(e) => handleInputChange('deposit_reason', e.target.value)}
                    placeholder="Masukkan alasan perubahan deposit"
                    className={errors.deposit_reason ? 'border-red-500' : ''}
                  />
                  {errors.deposit_reason && (
                    <p className="text-sm text-red-500">{errors.deposit_reason}</p>
                  )}
                </div>
              )}
          </div>

          {/* Separator */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Kategori dan Status
              </span>
            </div>
          </div>

          {/* Kategori dan Status */}
          <div className="space-y-4">
            {/* Kategori */}
            <div className='space-y-2'>
              <Label htmlFor="categories">Kategori *</Label>
              <Select
                value={formData.category > 0 ? String(formData.category) : ''}
                onValueChange={(value) => selectCategory(parseInt(value))}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Status Tenant */}
            <div className="space-y-2">
              <Label htmlFor="status">Status Tenant *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih status tenant" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status}</p>
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
          {errors.identificationFiles && (
            <p className="text-sm text-red-500">{errors.identificationFiles}</p>
          )}
          
          {/* File Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Existing files */}
            {existingIdentificationUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                {getFilePreview(url, index)}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">Existing</Badge>
                </div>
              </div>
            ))}
            
            {/* New files */}
            {identificationFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative group">
                {getFilePreview(file, index)}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index, 'identification')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Add more files button */}
            <div className="relative">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  handleFileChange(file, 'identification')
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="identification-upload"
              />
              <label 
                htmlFor="identification-upload"
                className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Tambah File</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dokumen Kontrak */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen Kontrak *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.contractFiles && (
            <p className="text-sm text-red-500">{errors.contractFiles}</p>
          )}
          
          {/* File Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Existing files */}
            {existingContractUrls.map((url, index) => (
              <div key={`existing-contract-${index}`} className="relative group">
                {getFilePreview(url, index)}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">Existing</Badge>
                </div>
              </div>
            ))}
            
            {/* New files */}
            {contractFiles.map((file, index) => (
              <div key={`new-contract-${index}`} className="relative group">
                {getFilePreview(file, index)}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index, 'contract')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Add more files button */}
            <div className="relative">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  handleFileChange(file, 'contract')
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="contract-upload"
              />
              <label 
                htmlFor="contract-upload"
                className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Tambah File</p>
                </div>
              </label>
            </div>
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
