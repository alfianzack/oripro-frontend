'use client'

import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'

interface UserPermission {
  menu_id: string
  can_view: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  can_confirm: boolean
}

interface UserPermissions {
  permissions: UserPermission[]
  loading: boolean
  error: string | null
}

export function useUserPermissions(): UserPermissions {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = await authApi.getCurrentUser()
        if (!user || !user.role_id) {
          setPermissions([])
          return
        }

        // Fetch user permissions from API
        const response = await fetch('/api/users/permissions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user permissions')
        }

        const data = await response.json()
        setPermissions(data.permissions || [])
      } catch (err) {
        console.error('Error fetching user permissions:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [])

  return { permissions, loading, error }
}

