'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SecurityGuardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/work?taskGroup=security-guard')
  }, [router])

  return null
}

