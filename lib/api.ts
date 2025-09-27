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
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
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
  id: string
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
  role_id?: string
  status?: string
  role?: {
    id: string
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
  roleId?: string
  status?: string
}

export interface UpdateUserData {
  email?: string
  password?: string
  name?: string
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
  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/api/users')
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
}

// Asset API interface
export interface Asset {
  id: string
  name: string
  code: string
  description?: string
  asset_type: number
  status: number
  address: string
  area: number
  longitude: number
  latitude: number
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface CreateAssetData {
  name: string
  code: string
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
  async getAssets(): Promise<ApiResponse<Asset[]>> {
    return apiClient.get<Asset[]>('/api/assets')
  },

  async getAsset(id: string): Promise<ApiResponse<Asset>> {
    return apiClient.get<Asset>(`/api/assets/${id}`)
  },

  async createAsset(data: CreateAssetData): Promise<ApiResponse<Asset>> {
    return apiClient.post<Asset>('/api/assets', data)
  },

  async updateAsset(id: string, data: UpdateAssetData): Promise<ApiResponse<Asset>> {
    return apiClient.put<Asset>(`/api/assets/${id}`, data)
  },

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/assets/${id}`)
  },
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
  async getUnits(): Promise<ApiResponse<Unit[]>> {
    return apiClient.get<Unit[]>('/api/units')
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
  categories?: number[]
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
  async getTenants(): Promise<ApiResponse<Tenant[]>> {
    return apiClient.get<Tenant[]>('/api/tenants')
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
}

// Menus-specific API functions
export const menusApi = {
  async getMenus(): Promise<ApiResponse<Menu[]>> {
    return apiClient.get<Menu[]>('/api/menus')
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
  id: string
  title: string
  url?: string
  icon?: string
  parent_id?: string
  order: number
  is_active: boolean
  can_view: boolean
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
  can_confirm: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  children?: Menu[]
}

export interface CreateMenuData {
  title: string
  url?: string
  icon?: string
  parent_id?: string
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
  parent_id?: string
  order?: number
  is_active?: boolean
  can_view?: boolean
  can_add?: boolean
  can_edit?: boolean
  can_delete?: boolean
  can_confirm?: boolean
}

export interface CreateRoleMenuPermissionData {
  menu_id: string
  can_view: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
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