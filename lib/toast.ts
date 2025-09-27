import toast from 'react-hot-toast'

// Utility functions for toast notifications with single toast limit
export const showToast = {
  success: (message: string) => {
    // Dismiss all existing toasts first
    toast.dismiss()
    // Show new success toast
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    })
  },

  error: (message: string) => {
    // Dismiss all existing toasts first
    toast.dismiss()
    // Show new error toast
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    })
  },

  loading: (message: string) => {
    // Dismiss all existing toasts first
    toast.dismiss()
    // Show loading toast
    return toast.loading(message, {
      duration: Infinity,
      position: 'top-right',
    })
  },

  dismiss: () => {
    toast.dismiss()
  }
}

export default showToast
