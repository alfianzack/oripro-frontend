'use server'

import { z } from 'zod'
import { forgotPasswordSchema } from '@/lib/zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function handleForgotPasswordAction(formData: FormData) {
  const email = formData.get('email')
  const parsed = forgotPasswordSchema.safeParse({ email })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: parsed.data.email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Gagal mengirim email reset password',
      }
    }

    return {
      success: true,
      message: data.message || 'Email reset password telah dikirim',
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    }
  }
}
