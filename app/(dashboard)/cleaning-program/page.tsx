'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CleaningProgramPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/work?taskGroup=cleaning-program')
  }, [router])

  return null
}

