'use client'

import { useState, useEffect } from 'react'
import { authApi, usersApi } from '@/lib/api'

interface UserMenu {
  id: string
  title: string
  url?: string
  icon?: string
  parent_id?: string
  order: number
  is_active: boolean
  can_view: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  can_confirm: boolean
  children?: UserMenu[]
}

interface UserMenuPermissions {
  menus: UserMenu[]
  loading: boolean
  error: string | null
}

export function useUserMenuPermissions(): UserMenuPermissions {
  const [menus, setMenus] = useState<UserMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserMenus = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = await authApi.getCurrentUser()
        if (!user || !user.role_id) {
          setMenus([])
          return
        }

        // Fetch user menus from API using usersApi
        const response = await usersApi.getUserMenus()
        
        if (response.success && response.data) {
          setMenus(response.data.menus || [])
        } else {
          throw new Error(response.error || 'Failed to fetch user menus')
        }
      } catch (err) {
        console.error('Error fetching user menus:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setMenus([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserMenus()
  }, [])

  return { menus, loading, error }
}
