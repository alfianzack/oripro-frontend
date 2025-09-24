import { useState, useEffect } from 'react'
import { Menu, menusApi } from '@/lib/api'
import toast from 'react-hot-toast'

export const useMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMenus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await menusApi.getMenus()
      
      if (response.success && response.data) {
        setMenus(response.data)
      } else {
        setError(response.error || 'Gagal memuat data menu')
        toast.error(response.error || 'Gagal memuat data menu')
      }
    } catch (error) {
      const errorMessage = 'Terjadi kesalahan saat memuat data menu'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Load menus error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  const createMenu = async (menuData: any) => {
    try {
      const response = await menusApi.createMenu(menuData)
      
      if (response.success) {
        toast.success('Menu berhasil dibuat')
        await loadMenus() // Reload menus
        return response.data
      } else {
        toast.error(response.error || 'Gagal membuat menu')
        return null
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat membuat menu')
      console.error('Create menu error:', error)
      return null
    }
  }

  const updateMenu = async (id: string, menuData: any) => {
    try {
      const response = await menusApi.updateMenu(id, menuData)
      
      if (response.success) {
        toast.success('Menu berhasil diperbarui')
        await loadMenus() // Reload menus
        return response.data
      } else {
        toast.error(response.error || 'Gagal memperbarui menu')
        return null
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui menu')
      console.error('Update menu error:', error)
      return null
    }
  }

  const deleteMenu = async (id: string) => {
    try {
      const response = await menusApi.deleteMenu(id)
      
      if (response.success) {
        toast.success('Menu berhasil dihapus')
        await loadMenus() // Reload menus
        return true
      } else {
        toast.error(response.error || 'Gagal menghapus menu')
        return false
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus menu')
      console.error('Delete menu error:', error)
      return false
    }
  }

  const updateMenuOrder = async (menuOrders: { id: string; order: number }[]) => {
    try {
      const response = await menusApi.updateMenuOrder(menuOrders)
      
      if (response.success) {
        toast.success('Urutan menu berhasil diperbarui')
        await loadMenus() // Reload menus
        return true
      } else {
        toast.error(response.error || 'Gagal memperbarui urutan menu')
        return false
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui urutan menu')
      console.error('Update menu order error:', error)
      return false
    }
  }

  return {
    menus,
    loading,
    error,
    loadMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    updateMenuOrder,
  }
}
