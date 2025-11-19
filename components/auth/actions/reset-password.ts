'use server'

import { z } from 'zod'
import { resetPasswordSchema } from '@/lib/zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function handleResetPasswordAction(formData: FormData) {
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  const token = formData.get('token')
  const uid = formData.get('uid')

  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    }
  }

  if (!token || !uid) {
    return {
      success: false,
      error: 'Token atau UID tidak valid',
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: uid.toString(),
        token: token.toString(),
        newPassword: parsed.data.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Gagal mereset password',
      }
    }

    return {
      success: true,
      message: data.message || 'Password berhasil direset',
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    }
  }
}

