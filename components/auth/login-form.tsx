'use client'

import React, { useState, useTransition, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'
import Link from 'next/link'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import SocialLogin from './social-login'
import { loginSchema } from '@/lib/zod'
import { useLoading } from '@/contexts/LoadingContext'
import { handleLoginAction } from './actions/login'
import { usersApi, apiClient } from '@/lib/api'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { loading, setLoading } = useLoading()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setLoading(true)
    setIsSubmitting(true)

    startTransition(async () => {
      try {
        if (!formRef.current) return

        const formData = new FormData(formRef.current)
        const res = await handleLoginAction(formData)

        if (res?.error) {
          showToast.error(res.error)
        } else if (res?.success && res?.token) {
          // Store token in localStorage for future API calls
          localStorage.setItem('auth_token', res.token)
          localStorage.setItem('user_data', JSON.stringify(res.user))
          
          // Update apiClient token immediately so it can be used in the next request
          apiClient.setToken(res.token)
          
          // Decode JWT token to get roleName (JWT payload is base64 encoded, not encrypted)
          let roleName = ''
          try {
            const tokenParts = res.token.split('.')
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]))
              roleName = (payload.roleName || '').toLowerCase()
            }
          } catch (e) {
            console.error('Error decoding token:', e)
          }
          
          // Fallback: try to get role from user object
          if (!roleName) {
            const userRole = res.user?.role?.name || res.user?.roleName || ''
            roleName = userRole.toLowerCase()
          }
          
          // Debug logging
          console.log('User role from token:', roleName)
          console.log('User object:', res.user)
          
          // Use NextAuth signIn with custom credentials
          await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
            token: res.token,
            user: res.user,
          })
          
          showToast.success('Login berhasil!')
          
          // Redirect based on user role
          if (roleName === 'admin' || roleName === 'super_admin') {
            // Admin dan super_admin -> dashboard admin
            router.push('/dashboard')
          } else if (roleName === 'tenant') {
            // Tenant -> dashboard tenant
            router.push('/dashboard-tenant')
          } else if (roleName === 'worker' || roleName === 'user') {
            // Worker atau user -> dashboard worker
            router.push('/dashboard-worker')
          } else {
            // Fallback untuk role lain atau jika role tidak ditemukan
            console.warn('Role tidak dikenali:', roleName, '- redirecting to welcome')
            router.push('/welcome')
          }
        } else {
          showToast.error('Login gagal. Silakan coba lagi.')
        }
      } catch (error) {
        console.error('Login error:', error)
        showToast.error('Terjadi kesalahan. Silakan coba lagi.')
      } finally {
        setLoading(false)
        setIsSubmitting(false)
      }
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email"
                      name="email"
                      className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-600 focus-visible:border-blue-600 !shadow-none !ring-0"
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      name="password"
                      className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-600 focus-visible:border-blue-600 !shadow-none !ring-0"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me & Forgot Password */}
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-primary font-medium hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full rounded-lg h-[52px] text-sm mt-2"
            disabled={loading || isPending}
          >
            {isSubmitting || isPending ? (
              <>
                <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      {/* <div className="mt-8 relative text-center before:absolute before:w-full before:h-px before:bg-neutral-300 dark:before:bg-slate-600 before:top-1/2 before:left-0">
        <span className="relative z-10 px-4 bg-white dark:bg-slate-900 text-base">
          Or sign in with
        </span>
      </div> */}

      {/* Social Login */}
      {/* <SocialLogin /> */}

      {/* Signup Prompt */}
      {/* <div className="mt-8 text-center text-sm">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="text-primary font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div> */}
    </>
  )
}

export default LoginForm
