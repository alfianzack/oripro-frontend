// Utility functions for API calls to oripro-backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle 204 No Content response (for DELETE operations)
      if (response.status === 204) {
        return {
          success: true,
          data: undefined,
        }
      }

      // Try to parse JSON for other responses
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        // If JSON parsing fails, use response text or status
        data = { message: `HTTP ${response.status}` }
      }

      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          // Clear token and redirect to login
          this.clearToken()
          if (typeof window !== 'undefined') {
            // Add a small delay to ensure token is cleared
            setTimeout(() => {
              window.location.href = '/auth/login'
            }, 100)
          }
          return {
            success: false,
            error: 'Unauthorized. Redirecting to login...',
          }
        }
        
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      // Handle backend response format
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        // Backend returns { data: actualData, success: true, message: "..." }
        return {
          success: data.success,
          data: data.data,
          message: data.message,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: 'Network error. Please try again.',
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create a default instance
export const apiClient = new ApiClient()

// Export api for backward compatibility
export const api = apiClient

// Auth-specific API functions
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Login failed',
      }
    }

    return {
      success: true,
      data,
    }
  },

  async logout(): Promise<void> {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  },

  async getCurrentUser(): Promise<any> {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    }
    return null
  },
}

// Role API interface
export interface Role {
  id: number
  name: string
  level: number
}

export interface CreateRoleData {
  name: string
  level: number
}

export interface UpdateRoleData {
  name?: string
  level?: number
}

// Users API interface
export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  gender?: number
  role_id?: number
  status?: string
  role?: {
    id: number
    name: string
    level: number
  }
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CreateUserData {
  email: string
  password: string
  name?: string
  phone?: string
  gender?: string
  roleId?: string
  status?: string
}

export interface UpdateUserData {
  email?: string
  password?: string
  name?: string
  phone?: string
  gender?: string
  roleId?: string
  status?: string
}

// Roles-specific API functions
export const rolesApi = {
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return apiClient.get<Role[]>('/api/roles')
  },

  async getRole(id: string): Promise<ApiResponse<Role>> {
    return apiClient.get<Role>(`/api/roles/${id}`)
  },

  async createRole(data: CreateRoleData): Promise<ApiResponse<Role>> {
    return apiClient.post<Role>('/api/roles', data)
  },

  async updateRole(id: string, data: UpdateRoleData): Promise<ApiResponse<Role>> {
    return apiClient.put<Role>(`/api/roles/${id}`, data)
  },

  async deleteRole(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/roles/${id}`)
  },
}

// Users-specific API functions
export const usersApi = {
  async getUsers(params?: {
    name?: string
    email?: string
    role_id?: string
    status?: string
    order?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.email) queryParams.append('email', params.email)
    if (params?.role_id) queryParams.append('role_id', params.role_id)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<User[]>(endpoint)
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/api/users/${id}`)
  },

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/users', data)
  },

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/api/users/${id}`, data)
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/users/${id}`)
  },

  async getUserPermissions(): Promise<ApiResponse<{ permissions: any[] }>> {
    return apiClient.get<{ permissions: any[] }>('/api/users/permissions')
  },

  async getUserMenus(): Promise<ApiResponse<{ menus: any[] }>> {
    return apiClient.get<{ menus: any[] }>('/api/users/menus')
  },

  async getUserSidebar(): Promise<ApiResponse<{ navMain: any[] }>> {
    return apiClient.get<{ navMain: any[] }>('/api/users/sidebar')
  },
}

// Asset API interface
export interface Asset {
  id: string
  name: string
  code: string
  description?: string
  asset_type: number | string
  status: number | string
  address: string
  area: number
  longitude: number
  latitude: number
  photos?: string[]
  sketch?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface CreateAssetData {
  name: string
  description?: string
  asset_type: number
  address: string
  area: number
  longitude: number
  latitude: number
  status?: number
}

export interface UpdateAssetData {
  name?: string
  code?: string
  description?: string
  asset_type?: number
  address?: string
  area?: number
  longitude?: number
  latitude?: number
  status?: number
}

// Asset type constants
export const ASSET_TYPES = {
  ESTATE: 1,
  OFFICE: 2,
  WAREHOUSE: 3,
  SPORT: 4,
  ENTERTAINMENTRESTAURANT: 5,
  RESIDENCE: 6,
  MALL: 7,
  SUPPORTFACILITYMOSQUEITAL: 8,
  PARKINGLOT: 9,
}

export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.ESTATE]: 'Estate',
  [ASSET_TYPES.OFFICE]: 'Office',
  [ASSET_TYPES.WAREHOUSE]: 'Warehouse',
  [ASSET_TYPES.SPORT]: 'Sport',
  [ASSET_TYPES.ENTERTAINMENTRESTAURANT]: 'Entertainment/Restaurant',
  [ASSET_TYPES.RESIDENCE]: 'Residence',
  [ASSET_TYPES.MALL]: 'Mall',
  [ASSET_TYPES.SUPPORTFACILITYMOSQUEITAL]: 'Support Facility/Mosque',
  [ASSET_TYPES.PARKINGLOT]: 'Parking Lot',
}

// Assets-specific API functions
export const assetsApi = {
  async getAssets(params?: {
    name?: string
    asset_type?: number
    order?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Asset[]>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.asset_type) queryParams.append('asset_type', params.asset_type.toString())
    if (params?.order) queryParams.append('order', params.order)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const endpoint = `/api/assets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<Asset[]>(endpoint)
  },

  async getAsset(id: string): Promise<ApiResponse<Asset>> {
    return apiClient.get<Asset>(`/api/assets/${id}`)
  },

  async createAsset(data: CreateAssetData | FormData): Promise<ApiResponse<Asset>> {
    // If data is FormData, use direct fetch to avoid JSON serialization
    if (data instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    }
    
    return apiClient.post<Asset>('/api/assets', data)
  },

  async updateAsset(id: string, data: UpdateAssetData | FormData): Promise<ApiResponse<Asset>> {
    // If data is FormData, use direct fetch to avoid JSON serialization
    if (data instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    }
    
    return apiClient.put<Asset>(`/api/assets/${id}`, data)
  },

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/assets/${id}`)
  },
}

// Attendance API interfaces
export interface Attendance {
  id: number
  user_id: string
  asset_id: number
  check_in_time: string
  check_out_time?: string
  check_in_latitude: number
  check_in_longitude: number
  check_out_latitude?: number
  check_out_longitude?: number
  status: 'checked_in' | 'checked_out'
  notes?: string
  created_at: string
  updated_at: string
  asset: {
    id: number
    name: string
    code: string
    address: string
  }
}

export interface AttendanceStatus {
  id: number
  check_in_time: string
  check_out_time?: string
  status: 'checked_in' | 'checked_out'
  asset: {
    id: number
    name: string
    code: string
    address: string
  }
}

export interface CheckRadiusResponse {
  isInRadius: boolean
  distance: number
}

// Attendance API functions
export const attendanceApi = {
  async checkRadius(latitude: number, longitude: number, assetId: number): Promise<ApiResponse<CheckRadiusResponse>> {
    return apiClient.post<CheckRadiusResponse>('/api/attendance/check-radius', {
      latitude,
      longitude,
      asset_id: assetId
    })
  },

  async checkIn(assetId: number, latitude: number, longitude: number, notes?: string): Promise<ApiResponse<Attendance>> {
    return apiClient.post<Attendance>('/api/attendance/check-in', {
      asset_id: assetId,
      latitude,
      longitude,
      notes
    })
  },

  async checkOut(assetId: number, latitude: number, longitude: number, notes?: string): Promise<ApiResponse<Attendance>> {
    return apiClient.post<Attendance>('/api/attendance/check-out', {
      asset_id: assetId,
      latitude,
      longitude,
      notes
    })
  },

  async getTodayStatus(assetId: number): Promise<ApiResponse<AttendanceStatus>> {
    return apiClient.get<AttendanceStatus>(`/api/attendance/today-status/${assetId}`)
  },

  async getWeeklyHistory(assetId: number): Promise<ApiResponse<Attendance[]>> {
    return apiClient.get<Attendance[]>(`/api/attendance/weekly-history?asset_id=${assetId}`)
  }
}

// Unit API interface
export interface Unit {
  id: string
  asset_id: string
  name: string
  size: number
  rent_price: number
  lamp: number
  electric_socket: number
  electrical_power: number
  electrical_unit: string
  is_toilet_exist: boolean
  description?: string
  is_deleted: boolean
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
  asset?: Asset
}

export interface CreateUnitData {
  name: string
  asset_id: string
  size: number
  rent_price: number
  lamp?: number
  electrical_socket?: number
  electrical_power: number
  electrical_unit?: string
  is_toilet_exist: boolean
  description?: string
}

export interface UpdateUnitData {
  name?: string
  size?: number
  rent_price?: number
  lamp?: number
  electrical_socket?: number
  electrical_power?: number
  electrical_unit?: string
  is_toilet_exist?: boolean
  description?: string
}

// Units-specific API functions
export const unitsApi = {
  async getUnits(params?: {
    name?: string
    asset_id?: string
    is_deleted?: boolean
    size_min?: number
    size_max?: number
    order?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Unit[]>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.asset_id) queryParams.append('asset_id', params.asset_id)
    if (params?.is_deleted !== undefined) queryParams.append('is_deleted', params.is_deleted.toString())
    if (params?.size_min) queryParams.append('size_min', params.size_min.toString())
    if (params?.size_max) queryParams.append('size_max', params.size_max.toString())
    if (params?.order) queryParams.append('order', params.order)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const endpoint = `/api/units${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<Unit[]>(endpoint)
  },

  async getUnit(id: string): Promise<ApiResponse<Unit>> {
    return apiClient.get<Unit>(`/api/units/${id}`)
  },

  async createUnit(data: CreateUnitData): Promise<ApiResponse<Unit>> {
    return apiClient.post<Unit>('/api/units', data)
  },

  async updateUnit(id: string, data: UpdateUnitData): Promise<ApiResponse<Unit>> {
    return apiClient.put<Unit>(`/api/units/${id}`, data)
  },

  async deleteUnit(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/units/${id}`)
  },
}

// Tenant API interface
export interface Tenant {
  id: string
  name: string
  user_id: string
  contract_begin_at: string
  contract_end_at: string
  rent_duration: number
  rent_duration_unit: string
  code: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
  user?: User
  tenant_identifications?: string[]
  contract_documents?: string[]
  unit_ids?: string[]
  units?: Unit[]
  categories?: number[] | any[]
}

export interface CreateTenantData {
  name: string
  user_id: string
  contract_begin_at: string
  rent_duration: number
  rent_duration_unit: string
  tenant_identifications: string[]
  contract_documents: string[]
  unit_ids: string[]
  categories: number[]
}

export interface UpdateTenantData {
  name?: string
  user_id?: string
  contract_begin_at?: string
  rent_duration?: number
  rent_duration_unit?: string
  tenant_identifications?: string[]
  contract_documents?: string[]
  unit_ids?: string[]
  categories?: number[]
}

// Duration unit constants
export const DURATION_UNITS = {
  YEAR: 'year',
  MONTH: 'month'
}

export const DURATION_UNIT_LABELS = {
  [DURATION_UNITS.YEAR]: 'Tahun',
  [DURATION_UNITS.MONTH]: 'Bulan'
}

// Tenants-specific API functions
export const tenantsApi = {
  async getTenants(params?: {
    name?: string
    user_id?: string
    order?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Tenant[]>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.user_id) queryParams.append('user_id', params.user_id)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const endpoint = `/api/tenants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<Tenant[]>(endpoint)
  },

  async getTenant(id: string): Promise<ApiResponse<Tenant>> {
    return apiClient.get<Tenant>(`/api/tenants/${id}`)
  },

  async createTenant(data: CreateTenantData): Promise<ApiResponse<Tenant>> {
    return apiClient.post<Tenant>('/api/tenants', data)
  },

  async updateTenant(id: string, data: UpdateTenantData): Promise<ApiResponse<Tenant>> {
    return apiClient.put<Tenant>(`/api/tenants/${id}`, data)
  },

  async deleteTenant(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/tenants/${id}`)
  },

  async uploadTenantFile(file: File, type: 'identification' | 'contract'): Promise<ApiResponse<{url: string, filename: string, type: string}>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type === 'identification' ? '1' : '2')
    
    // Use direct fetch with FormData to avoid JSON serialization
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found. Please login again.',
      };
    }
    
    console.log('Uploading file with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${API_BASE_URL}/api/tenant-uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data: result,
    };
  },

  async saveTenantAttachment(tenantId: string, url: string, attachmentType: number): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/tenants/${tenantId}/attachments`, {
      tenant_id: tenantId,
      url,
      attachment_type: attachmentType
    })
  },
}

// Menus-specific API functions
export const menusApi = {
  async getMenus(params?: {
    title?: string
    is_active?: boolean
    parent_id?: number | null
    has_parent?: boolean
    order?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Menu[]>> {
    const queryParams = new URLSearchParams()
    if (params?.title) queryParams.append('title', params.title)
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
    if (params?.parent_id !== undefined) queryParams.append('parent_id', params.parent_id?.toString() || 'null')
    if (params?.has_parent !== undefined) queryParams.append('has_parent', params.has_parent.toString())
    if (params?.order) queryParams.append('order', params.order)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const endpoint = `/api/menus${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<Menu[]>(endpoint)
  },

  async getMenu(id: string): Promise<ApiResponse<Menu>> {
    return apiClient.get<Menu>(`/api/menus/${id}`)
  },

  async createMenu(data: CreateMenuData): Promise<ApiResponse<Menu>> {
    return apiClient.post<Menu>('/api/menus', data)
  },

  async updateMenu(id: string, data: UpdateMenuData): Promise<ApiResponse<Menu>> {
    return apiClient.put<Menu>(`/api/menus/${id}`, data)
  },

  async deleteMenu(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/menus/${id}`)
  },
}

// Menu API interface
export interface Menu {
  id: number
  title: string
  url?: string
  icon?: string
  parent_id?: number
  order: number
  is_active: boolean
  can_view: boolean
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
  can_confirm: boolean
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  children?: Menu[]
}

export interface CreateMenuData {
  title: string
  url?: string
  icon?: string
  parent_id?: number
  order?: number
  is_active?: boolean
  can_view?: boolean
  can_add?: boolean
  can_edit?: boolean
  can_delete?: boolean
  can_confirm?: boolean
}

export interface UpdateMenuData {
  title?: string
  url?: string
  icon?: string
  parent_id?: number
  order?: number
  is_active?: boolean
  can_view?: boolean
  can_add?: boolean
  can_edit?: boolean
  can_delete?: boolean
  can_confirm?: boolean
}

export interface CreateRoleMenuPermissionData {
  menu_id: number
  can_view: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  can_confirm: boolean
}

// Menu Access interface
export interface MenuAccess {
  id: string
  name: string
  path: string
  icon?: string
  children?: MenuAccess[]
  hasAccess: boolean
}

// Predefined menu structure for access control
export const MENU_STRUCTURE: MenuAccess[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/',
    icon: 'House',
    hasAccess: false
  },
  {
    id: 'users',
    name: 'Users',
    path: '/users',
    icon: 'UsersRound',
    hasAccess: false,
    children: [
      {
        id: 'users-manage',
        name: 'Manage Users',
        path: '/users',
        hasAccess: false
      },
      {
        id: 'users-role',
        name: 'Manage Role',
        path: '/role',
        hasAccess: false
      }
    ]
  },
  {
    id: 'asset',
    name: 'Asset',
    path: '/asset',
    icon: 'Boxes',
    hasAccess: false
  },
  {
    id: 'unit',
    name: 'Unit',
    path: '/unit',
    icon: 'Building2',
    hasAccess: false
  },
  {
    id: 'worker',
    name: 'Worker',
    path: '/worker',
    icon: 'UsersRound',
    hasAccess: false
  },
  {
    id: 'tenants',
    name: 'Tenants',
    path: '/tenants',
    icon: 'Building2',
    hasAccess: false
  },
  {
    id: 'setting',
    name: 'Setting',
    path: '#',
    icon: 'Settings',
    hasAccess: false,
    children: [
      {
        id: 'setting-company',
        name: 'Company',
        path: '/company',
        hasAccess: false
      },
      {
        id: 'setting-payment',
        name: 'Payment Method',
        path: '/payment-method',
        hasAccess: false
      },
      {
        id: 'setting-notification',
        name: 'Notification',
        path: '/settings-notification',
        hasAccess: false
      },
      {
        id: 'setting-alert',
        name: 'Notification Alert',
        path: '/notification-alert',
        hasAccess: false
      }
    ]
  }
]