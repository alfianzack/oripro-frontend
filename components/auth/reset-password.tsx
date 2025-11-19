'use client'

import React, { useRef, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
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
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { resetPasswordSchema } from '@/lib/zod'
import { useLoading } from '@/contexts/LoadingContext'
import { handleResetPasswordAction } from './actions/reset-password'

interface ResetPasswordComponentProps {
  token: string
  uid: string
}

const ResetPasswordComponent = ({ token, uid }: ResetPasswordComponentProps) => {
  const router = useRouter()
  const { loading, setLoading } = useLoading()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    setLoading(true)

    startTransition(async () => {
      try {
        if (!formRef.current) return

        const formData = new FormData(formRef.current)
        formData.append('token', token)
        formData.append('uid', uid)

        const result = await handleResetPasswordAction(formData)

        if (result?.success) {
          toast.success('Password berhasil direset')
          router.push('/auth/login')
        } else {
          const errorMessage = typeof result?.error === 'string' 
            ? result.error 
            : 'Gagal mereset password. Silakan coba lagi.'
          toast.error(errorMessage)
        }
      } catch (error) {
        console.error('Reset password error:', error)
        toast.error('Terjadi kesalahan. Silakan coba lagi.')
      } finally {
        setTimeout(() => setLoading(false), 1000)
      }
    })
  }

  return (
    <>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
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
                      placeholder="Password Baru"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Konfirmasi Password Baru"
                      name="confirmPassword"
                      className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-600 focus-visible:border-blue-600 !shadow-none !ring-0"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                    >
                      {showConfirmPassword ? (
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

          <Button
            type="submit"
            className="w-full rounded-lg h-[52px] text-sm mt-2"
            disabled={loading || isPending}
          >
            {loading || isPending ? (
              <>
                <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />
                Memproses...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center text-sm">
        <p>
          Ingat password Anda?{' '}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </>
  )
}

export default ResetPasswordComponent

