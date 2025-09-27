import { useCallback } from 'react'
import { ApiResponse } from '@/lib/api'
import { handleUnauthorized } from '@/lib/auth-utils'
import toast from 'react-hot-toast'

/**
 * Custom hook for handling API errors consistently
 */
export function useApiError() {
  const handleApiError = useCallback((response: ApiResponse<any>, customMessage?: string) => {
    if (!response.success) {
      // Check if it's an unauthorized error
      if (response.error?.includes('Unauthorized') || response.error?.includes('401')) {
        // Don't show toast for unauthorized as user will be redirected
        return
      }
      
      // Show error message
      const errorMessage = customMessage || response.error || 'Terjadi kesalahan'
      toast.error(errorMessage)
    }
  }, [])

  const handleApiSuccess = useCallback((message: string) => {
    toast.success(message)
  }, [])

  const handleApiLoading = useCallback((loading: boolean, setLoading: (loading: boolean) => void) => {
    setLoading(loading)
  }, [])

  return {
    handleApiError,
    handleApiSuccess,
    handleApiLoading,
  }
}

/**
 * Enhanced API error handler that includes unauthorized redirect
 */
export function useEnhancedApiError() {
  const handleApiError = useCallback((response: ApiResponse<any>, customMessage?: string) => {
    if (!response.success) {
      // Check if it's an unauthorized error
      if (response.error?.includes('Unauthorized') || response.error?.includes('401')) {
        // Handle unauthorized - this will redirect to login
        handleUnauthorized()
        return
      }
      
      // Show error message for other errors
      const errorMessage = customMessage || response.error || 'Terjadi kesalahan'
      toast.error(errorMessage)
    }
  }, [])

  const handleApiSuccess = useCallback((message: string) => {
    toast.success(message)
  }, [])

  return {
    handleApiError,
    handleApiSuccess,
  }
}
