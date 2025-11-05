'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ScanInfo, scanInfoApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, QrCode, Loader2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScanInfoDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scanInfo: ScanInfo | null
  autoGenerateQR?: boolean
}

export default function ScanInfoDetailDialog({
  open,
  onOpenChange,
  scanInfo,
  autoGenerateQR = false
}: ScanInfoDetailDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGenerateQRCode = useCallback(async () => {
    if (!scanInfo) return
    
    setGeneratingQR(true)
    try {
      const response = await scanInfoApi.generateQRCode(scanInfo.id)
      if (response.success && response.data) {
        const qrData = response.data as any
        // Handle different response formats from backend
        let base64Data: string | null = null
        
        // Check for the new response structure: { data: 'data:image/png;base64,...', message: 'success', status: 200 }
        if (qrData.data && typeof qrData.data === 'string') {
          base64Data = qrData.data
        } else if (typeof qrData === 'string') {
          // Direct base64 string
          base64Data = qrData
        } else if (qrData.qr_code_base64) {
          base64Data = qrData.qr_code_base64
        } else if (qrData.qr_code_data) {
          base64Data = qrData.qr_code_data
        } else if (qrData.data?.qr_code_base64) {
          base64Data = qrData.data.qr_code_base64
        } else if (qrData.data?.qr_code_data) {
          base64Data = qrData.data.qr_code_data
        }
        
        if (base64Data) {
          setQrCodeBase64(base64Data)
          toast.success('QR code generated successfully')
        } else {
          console.error('Unexpected QR code response format:', qrData)
          toast.error('Failed to parse QR code data')
        }
      } else {
        toast.error(response.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('Generate QR code error:', error)
      toast.error('An error occurred while generating QR code')
    } finally {
      setGeneratingQR(false)
    }
  }, [scanInfo])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setQrCodeBase64(null) // Reset QR code when dialog opens
      
      // Auto-generate QR code if requested
      if (autoGenerateQR && scanInfo) {
        setTimeout(() => {
          handleGenerateQRCode()
        }, 300) // Small delay to ensure dialog is fully rendered
      }
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open, autoGenerateQR, scanInfo, handleGenerateQRCode])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleDownloadQRCode = () => {
    if (!qrCodeBase64) return
    
    try {
      // Convert base64 to blob
      const base64Data = qrCodeBase64.startsWith('data:image') 
        ? qrCodeBase64.split(',')[1] 
        : qrCodeBase64
      
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qrcode-${scanInfo?.scan_code || 'scan'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download QR code error:', error)
      toast.error('Failed to download QR code')
    }
  }

  // Convert base64 to data URL for display
  const getQRCodeDataUrl = () => {
    if (!qrCodeBase64) return null
    
    // If already a data URL, return as is
    if (qrCodeBase64.startsWith('data:image')) {
      return qrCodeBase64
    }
    
    // Otherwise, prepend data URL prefix
    return `data:image/png;base64,${qrCodeBase64}`
  }

  if (!scanInfo || !open) return null

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan Info: {scanInfo.scan_code}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Scan information details
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Generate QR Code Button */}
            <div className="flex items-center justify-end">
              <Button
                onClick={handleGenerateQRCode}
                disabled={generatingQR}
                variant="outline"
              >
                {generatingQR ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Code
                    </label>
                    <p className="text-sm font-medium">{scanInfo.scan_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Latitude
                    </label>
                    <p className="text-sm font-medium">
                      {scanInfo.latitude !== undefined ? scanInfo.latitude.toFixed(6) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Longitude
                    </label>
                    <p className="text-sm font-medium">
                      {scanInfo.longitude !== undefined ? scanInfo.longitude.toFixed(6) : '-'}
                    </p>
                  </div>
                  {scanInfo.asset && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Asset
                      </label>
                      <p className="text-sm font-medium">{scanInfo.asset.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            {qrCodeBase64 && getQRCodeDataUrl() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <img 
                        src={getQRCodeDataUrl() || ''} 
                        alt="QR Code" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    <Button onClick={handleDownloadQRCode} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created
                    </label>
                    <p className="text-sm font-medium">{scanInfo.created_at ? formatDate(scanInfo.created_at) : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Updated
                    </label>
                    <p className="text-sm font-medium">{scanInfo.updated_at ? formatDate(scanInfo.updated_at) : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

