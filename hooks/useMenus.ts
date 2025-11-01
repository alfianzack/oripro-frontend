import { useState, useEffect } from 'react'
import { Menu, menusApi } from '@/lib/api'

/**
 * Custom hook to fetch and manage menus
 */
export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true)
        const response = await menusApi.getMenus()
        if (response.success && response.data) {
          setMenus(response.data)
        }
      } catch (error) {
        console.error('Error fetching menus:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  return { menus, loading }
}

