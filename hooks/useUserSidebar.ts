'use client'

import { useState, useEffect } from 'react'
import { authApi, usersApi } from '@/lib/api'
import { LucideIcon } from 'lucide-react'
import {
  House,
  Mail,
  ShieldCheck,
  Component,
  ChartPie,
  Boxes,
  Server,
  UsersRound,
  StickyNote,
  Settings,
  Building2,
} from "lucide-react"

// Icon mapping untuk konversi dari string ke komponen Lucide
const iconMap: Record<string, LucideIcon> = {
  'House': House,
  'Mail': Mail,
  'ShieldCheck': ShieldCheck,
  'Component': Component,
  'ChartPie': ChartPie,
  'Boxes': Boxes,
  'Server': Server,
  'UsersRound': UsersRound,
  'StickyNote': StickyNote,
  'Settings': Settings,
  'Building2': Building2,
}

interface SidebarItem {
  title?: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  items?: Array<{
    title: string
    url: string
    circleColor: string
  }>
  label?: string
}

interface UserSidebar {
  navMain: SidebarItem[]
  loading: boolean
  error: string | null
}

export function useUserSidebar(): UserSidebar {
  const [navMain, setNavMain] = useState<SidebarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserSidebar = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = await authApi.getCurrentUser()
        if (!user || !user.role_id) {
          setNavMain([])
          return
        }

        // Fetch user sidebar from API using usersApi
        const response = await usersApi.getUserSidebar()
        
        if (response.success && response.data) {
          // Konversi string icon ke komponen Lucide
          const processedNavMain = (response.data.navMain || []).map(item => ({
            ...item,
            icon: item.icon && typeof item.icon === 'string' ? iconMap[item.icon] || House : item.icon
          }))
          setNavMain(processedNavMain)
        } else {
          throw new Error(response.error || 'Failed to fetch user sidebar')
        }
      } catch (err) {
        console.error('Error fetching user sidebar:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setNavMain([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserSidebar()
  }, [])

  return { navMain, loading, error }
}
