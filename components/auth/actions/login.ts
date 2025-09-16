'use server'

import { authApi } from '@/lib/api'

export const handleLoginAction = async (formData: FormData) => {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  // Validate email format
  if (!email.includes('@')) {
    return { error: 'Invalid email format.' }
  }

  try {
    // Call oripro-backend login API using authApi utility
    const result = await authApi.login(email, password)

    if (!result.success) {
      return { error: result.error || 'Login failed' }
    }

    // Return success with token and user data
    return { 
      success: true, 
      token: result.data?.token, 
      user: result.data?.user 
    }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Network error. Please try again.' }
  }
}
