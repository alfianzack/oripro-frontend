'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { userTasksApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface GenerateTaskButtonProps {
  onGenerateSuccess: () => void
}

export function GenerateTaskButton({ onGenerateSuccess }: GenerateTaskButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      const response = await userTasksApi.generateUpcomingUserTasks()
      
      if (response.success) {
        toast.success('User tasks berhasil di-generate')
        // Wait a bit for backend to process
        await new Promise(resolve => setTimeout(resolve, 1000))
        onGenerateSuccess()
      } else {
        toast.error(response.error || 'Gagal generate user tasks')
      }
    } catch (error: any) {
      console.error('Error generating tasks:', error)
      if (error.message?.includes('already been generated') || error.message?.includes('409')) {
        toast.error('User tasks sudah pernah di-generate untuk periode ini')
        onGenerateSuccess()
      } else {
        toast.error('Terjadi kesalahan saat generate user tasks')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate User Tasks'
      )}
    </Button>
  )
}

