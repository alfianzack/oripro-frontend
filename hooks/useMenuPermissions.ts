'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useUserSidebar } from './useUserSidebar'

interface MenuPermissions {
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
}

/**
 * Hook untuk mendapatkan permission menu berdasarkan URL saat ini
 */
export function useMenuPermissions(): MenuPermissions {
  const pathname = usePathname()
  const { navMain } = useUserSidebar()

  const permissions = useMemo(() => {
    // Default permissions (semua false)
    const defaultPermissions: MenuPermissions = {
      can_add: false,
      can_edit: false,
      can_delete: false,
    }

    // Cari menu yang match dengan pathname
    const findMenuByUrl = (items: any[], url: string): any => {
      for (const item of items) {
        // Check exact match
        if (item.url === url) {
          return item
        }
        
        // Check children first (more specific)
        if (item.items && item.items.length > 0) {
          const childMatch = findMenuByUrl(item.items, url)
          if (childMatch) return childMatch
        }
        
        // Check if url starts with item.url (for parent routes)
        // Example: /users/edit/123 should match /users
        if (item.url && item.url !== '#' && url.startsWith(item.url)) {
          return item
        }
      }
      return null
    }

    const matchedMenu = findMenuByUrl(navMain, pathname)

    if (matchedMenu) {
      return {
        can_add: matchedMenu.can_add || false,
        can_edit: matchedMenu.can_edit || false,
        can_delete: matchedMenu.can_delete || false,
      }
    }

    return defaultPermissions
  }, [navMain, pathname])

  return permissions
}

