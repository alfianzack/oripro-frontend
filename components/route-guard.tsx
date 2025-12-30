'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usersApi } from '@/lib/api'
import { showToast } from '@/lib/toast'

// Routes yang tidak perlu di-check (public routes atau routes khusus)
const EXCLUDED_ROUTES = [
  '/auth',
  '/welcome',
  '/view-profile',
  '/menus',
]

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false) // Start with false, will be set to true if access is granted or route is excluded

  useEffect(() => {
    const checkAccess = async () => {
      // Skip check untuk excluded routes (exact match atau starts with untuk nested routes)
      // Pastikan route utama seperti /users tidak di-exclude
      const isExcluded = EXCLUDED_ROUTES.some(route => {
        // Exact match
        if (pathname === route) return true
        // Nested routes (misalnya /auth/login, /welcome/something)
        if (pathname.startsWith(route + '/')) return true
        return false
      })
      
      if (isExcluded) {
        console.log('[RouteGuard] Route excluded from check:', pathname)
        setIsChecking(false)
        setHasAccess(true)
        return
      }

      // Check semua route lainnya
      try {
        setIsChecking(true)
        console.log('[RouteGuard] Checking access for:', pathname)
        const response = await usersApi.checkMenuAccess(pathname)
        console.log('[RouteGuard] Access check response:', response)

        if (response.success ) {
          const responseData = response.data as any;
          console.log('[RouteGuard] Response data:', responseData)
          if (responseData?.data?.hasAccess) {
            console.log('[RouteGuard] Access granted')
            setHasAccess(true)
          } else {
            console.log('[RouteGuard] Access denied')
            setHasAccess(false)
            showToast.error('Anda tidak memiliki akses ke halaman ini')
          }
        } else {
          console.log('[RouteGuard] Access denied')
          setHasAccess(false)
          showToast.error('Anda tidak memiliki akses ke halaman ini')
        }
      } catch (error) {
        console.error('[RouteGuard] Error checking menu access:', error)
        // Jika error, tetap izinkan akses (fail open untuk UX)
        // Tapi log error untuk debugging
        setHasAccess(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [pathname])

  // Tampilkan loading jika sedang check
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Jika tidak ada akses, tampilkan pesan error dan jangan tampilkan konten
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-[#1e2734]">
        <div className="text-center p-8">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Anda tidak memiliki akses ke halaman ini.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Silakan hubungi administrator jika Anda memerlukan akses.
          </p>
        </div>
      </div>
    )
  }

  // Jika ada akses, tampilkan konten
  return <>{children}</>
}

