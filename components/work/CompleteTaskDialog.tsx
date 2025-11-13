'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Camera } from 'lucide-react'
import { UserTask, userTasksApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface CompleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userTask: UserTask | null
  onComplete: () => void
}

export function CompleteTaskDialog({
  open,
  onOpenChange,
  userTask,
  onComplete
}: CompleteTaskDialogProps) {
  const [formData, setFormData] = useState({
    remark: '',
    fileBefore: null as File | null,
    fileAfter: null as File | null,
    fileScan: null as File | null,
    scanCode: ''
  })
  const [filePreview, setFilePreview] = useState<{
    before?: string
    after?: string
    scan?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrLocation, setQrLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLocationValid, setIsLocationValid] = useState<boolean | null>(null)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)

  const task = userTask?.task

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  // Check if user is near the QR code location
  const checkLocation = async (qrLat: number, qrLon: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser'))
        return
      }

      setIsCheckingLocation(true)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLon = position.coords.longitude
          
          console.log('[LOCATION] User location:', { latitude: userLat, longitude: userLon })
          console.log('[LOCATION] QR location:', { latitude: qrLat, longitude: qrLon })
          
          const distance = calculateDistance(userLat, userLon, qrLat, qrLon)
          console.log('[LOCATION] Distance:', distance, 'meters')
          
          // Allow if within 50 meters (adjust as needed)
          const maxDistance = 20000 // meters
          const isValid = distance <= maxDistance
          
          setIsLocationValid(isValid)
          setIsCheckingLocation(false)
          
          if (isValid) {
            console.log('[LOCATION] ✅ User is within range')
            toast.success(`Lokasi valid! Jarak: ${Math.round(distance)}m`)
          } else {
            console.log('[LOCATION] ❌ User is too far away')
            toast.error(`Anda terlalu jauh dari lokasi QR code. Jarak: ${Math.round(distance)}m (maks: ${maxDistance}m)`)
          }
          
          resolve(isValid)
        },
        (error) => {
          setIsCheckingLocation(false)
          console.error('[LOCATION] Error getting location:', error)
          
          let errorMsg = 'Gagal mendapatkan lokasi'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Izin lokasi ditolak. Silakan berikan izin lokasi di pengaturan browser.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Informasi lokasi tidak tersedia.'
              break
            case error.TIMEOUT:
              errorMsg = 'Request lokasi timeout.'
              break
          }
          
          toast.error(errorMsg)
          reject(new Error(errorMsg))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const handleFileChange = (field: 'fileBefore' | 'fileAfter' | 'fileScan', file: File | null) => {
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewKey = field === 'fileBefore' ? 'before' : field === 'fileAfter' ? 'after' : 'scan'
        setFilePreview(prev => ({ ...prev, [previewKey]: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => {
        const newData = { ...prev }
        newData[field] = null
        return newData
      })
      setFilePreview(prev => {
        const newPreview = { ...prev }
        const previewKey = field === 'fileBefore' ? 'before' : field === 'fileAfter' ? 'after' : 'scan'
        delete newPreview[previewKey as keyof typeof newPreview]
        return newPreview
      })
    }
  }

  const captureFromCamera = async (field: 'fileBefore' | 'fileAfter' | 'fileScan') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
        modal.innerHTML = `
          <div class="bg-white p-4 rounded-lg max-w-md w-full">
            <video id="camera-preview" autoplay class="w-full mb-4"></video>
            <div class="flex gap-2">
              <button id="capture-btn" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded">Ambil Foto</button>
              <button id="cancel-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded">Batal</button>
            </div>
          </div>
        `
        document.body.appendChild(modal)

        const previewVideo = modal.querySelector('#camera-preview') as HTMLVideoElement
        previewVideo.srcObject = stream

        const captureBtn = modal.querySelector('#capture-btn') as HTMLButtonElement
        const cancelBtn = modal.querySelector('#cancel-btn') as HTMLButtonElement

        captureBtn.onclick = () => {
          context?.drawImage(previewVideo, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
              handleFileChange(field, file)
            }
            stream.getTracks().forEach(track => track.stop())
            document.body.removeChild(modal)
          }, 'image/jpeg', 0.9)
        }

        cancelBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop())
          document.body.removeChild(modal)
        }
      })
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Gagal mengakses kamera')
    }
  }

  const handleScanBarcode = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Browser tidak mendukung akses kamera')
        return
      }

      // Dynamic import html5-qrcode first
      let Html5Qrcode
      try {
        const html5QrcodeModule = await import('html5-qrcode')
        Html5Qrcode = html5QrcodeModule.Html5Qrcode || html5QrcodeModule.default?.Html5Qrcode || html5QrcodeModule.default
        if (!Html5Qrcode) {
          throw new Error('Html5Qrcode tidak ditemukan dalam modul html5-qrcode')
        }
      } catch (importError: any) {
        console.error('[SCAN] Error importing html5-qrcode:', importError)
        toast.error('Gagal memuat library scanner. Silakan refresh halaman.')
        return
      }

      // Create modal first
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-white p-4 rounded-lg max-w-md w-full">
          <div id="qr-reader" class="w-full mb-4 rounded"></div>
          <p id="scan-status" class="text-sm text-center text-gray-600 mb-4">Meminta izin kamera...</p>
          <div class="flex gap-2">
            <button id="cancel-scan-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded">Batal</button>
          </div>
        </div>
      `
      document.body.appendChild(modal)

      const qrReaderElement = modal.querySelector('#qr-reader') as HTMLDivElement
      const scanStatus = modal.querySelector('#scan-status') as HTMLParagraphElement
      const cancelBtn = modal.querySelector('#cancel-scan-btn') as HTMLButtonElement

      if (!qrReaderElement || !scanStatus) {
        toast.error('Gagal membuat elemen scanner')
        if (document.body.contains(modal)) {
          document.body.removeChild(modal)
        }
        return
      }

      // Request camera permission
      let permissionGranted = false
      let tempStream: MediaStream | null = null
      
      try {
        // Request permission by accessing camera
        scanStatus.textContent = 'Meminta izin kamera...'
        tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
        permissionGranted = true
        // Stop the temporary stream immediately
        tempStream.getTracks().forEach(track => track.stop())
        tempStream = null
      } catch (permissionError: any) {
        const errorName = permissionError?.name || 'UnknownError'
        if (document.body.contains(modal)) {
          document.body.removeChild(modal)
        }
        
        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
          toast.error('Izin kamera diperlukan untuk scan barcode. Silakan berikan izin kamera di pengaturan browser.')
        } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
          toast.error('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.')
        } else {
          toast.error('Gagal mengakses kamera: ' + (permissionError?.message || 'Unknown error'))
        }
        return
      }

      // Create Html5Qrcode instance
      const html5QrCode = new Html5Qrcode(qrReaderElement.id)
      
      let isScanning = true
      let isStopped = false

      // Helper function to safely stop scanner
      const safeStopScanner = async () => {
        if (isStopped) {
          return
        }
        isStopped = true
        isScanning = false
        try {
          await html5QrCode.stop()
        } catch (err: any) {
          // Ignore error if scanner is already stopped
          if (err?.message && err.message.includes('not running')) {
          } else {
          }
        }
      }

      // Get camera configuration after permission is granted
      let cameraConfig: string | { facingMode: string } | null = null
      
      try {
        scanStatus.textContent = 'Mencari kamera...'
        // Now enumerate devices (permission already granted)
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput' && device.deviceId)
        
        if (videoDevices.length === 0) {
          throw new Error('Tidak ada kamera yang tersedia')
        }
        
        // Try to find back camera
        const backCamera = videoDevices.find(device => {
          const label = device.label.toLowerCase()
          return label.includes('back') || label.includes('rear') || label.includes('environment')
        })
        
        if (backCamera && backCamera.deviceId) {
          cameraConfig = backCamera.deviceId
          console.log('[SCAN] Using back camera:', backCamera.label)
        } else if (videoDevices[0]?.deviceId) {
          // Use first available camera
          cameraConfig = videoDevices[0].deviceId
          console.log('[SCAN] Using first available camera:', videoDevices[0].label)
        } else {
          throw new Error('Tidak ada kamera yang valid')
        }
      } catch (err: any) {
        console.error('[SCAN] Error enumerating devices:', err)
        // Fallback to facingMode if device enumeration fails
        cameraConfig = { facingMode: 'environment' }
        console.log('[SCAN] Falling back to facingMode: environment')
      }

      // Ensure cameraConfig is not null
      if (!cameraConfig) {
        cameraConfig = { facingMode: 'environment' }
      }
      
      const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (isScanning) {
          isScanning = false
          
          // Parse QR code data
          let qrData: { code?: string; latitude?: number; longitude?: number } = {}
          try {
            qrData = JSON.parse(decodedText)
            console.log('[SCAN] Parsed QR data:', qrData)
          } catch (e) {
            console.error('[SCAN] Failed to parse QR code as JSON:', e)
            // If not JSON, just use the text as scan code
            qrData = { code: decodedText }
          }

          // Check location if latitude and longitude are present
          if (qrData.latitude !== undefined && qrData.longitude !== undefined) {
            scanStatus.textContent = 'Memvalidasi lokasi...'
            scanStatus.className = 'text-sm text-center text-blue-600 mb-4 font-medium'
            
            try {
              const isValid = await checkLocation(qrData.latitude, qrData.longitude)
              setQrLocation({ latitude: qrData.latitude, longitude: qrData.longitude })
              
              if (isValid) {
                scanStatus.textContent = 'QR Code dan lokasi valid!'
                scanStatus.className = 'text-sm text-center text-green-600 mb-4 font-medium'
              } else {
                scanStatus.textContent = 'Lokasi tidak sesuai!'
                scanStatus.className = 'text-sm text-center text-red-600 mb-4 font-medium'
              }
            } catch (error: any) {
              console.error('[SCAN] Location check failed:', error)
              scanStatus.textContent = 'Gagal memvalidasi lokasi'
              scanStatus.className = 'text-sm text-center text-yellow-600 mb-4 font-medium'
              // Still allow scan code to be set, but location validation failed
            }
          } else {
            scanStatus.textContent = 'QR Code berhasil di-scan!'
            scanStatus.className = 'text-sm text-center text-green-600 mb-4 font-medium'
            setIsLocationValid(true) // No location check needed
          }
          
          // Set scan code first
          setFormData(prev => ({ ...prev, scanCode: decodedText }))

          // Capture screenshot for evidence and close modal
          setTimeout(() => {
            const videoElement = qrReaderElement.querySelector('video') as HTMLVideoElement
            if (videoElement && videoElement.videoWidth && videoElement.videoHeight) {
              const canvas = document.createElement('canvas')
              const context = canvas.getContext('2d')
              if (context) {
                canvas.width = videoElement.videoWidth
                canvas.height = videoElement.videoHeight
                context.drawImage(videoElement, 0, 0)
                
                canvas.toBlob((blob) => {
                  if (blob) {
                    console.log('[SCAN] Image captured:', {
                      size: blob.size,
                      type: blob.type
                    })
                    const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
                    setFormData(prev => ({ ...prev, fileScan: file, scanCode: decodedText }))
                    handleFileChange('fileScan', file)
                  }
                  // Stop scanner and close modal after screenshot is captured
                  safeStopScanner().then(() => {
                    if (document.body.contains(modal)) {
                      document.body.removeChild(modal)
                    }
                    toast.success('QR Code berhasil di-scan!')
                  })
                }, 'image/jpeg', 0.9)
              } else {
                // If canvas context is not available, stop scanner and close modal immediately
                safeStopScanner().then(() => {
                  if (document.body.contains(modal)) {
                    document.body.removeChild(modal)
                  }
                  toast.success('QR Code berhasil di-scan!')
                })
              }
            } else {
              // If video element is not available, stop scanner and close modal immediately
              safeStopScanner().then(() => {
                if (document.body.contains(modal)) {
                  document.body.removeChild(modal)
                }
                toast.success('QR Code berhasil di-scan!')
              })
            }
          }, 100)
        }
      }

      const onScanError = (errorMessage: string) => {
        // Ignore scan errors, just keep scanning
        // Only log occasionally to avoid spam
        if (Math.random() < 0.02) {
          console.log('[SCAN] Scanning...', errorMessage)
        }
      }

      // Start scanning with the configured camera
      scanStatus.textContent = 'Memulai scanner...'
      
      try {
        if (!cameraConfig) {
          throw new Error('Konfigurasi kamera tidak tersedia')
        }
        
        await html5QrCode.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          onScanSuccess,
          onScanError
        )
        
        scanStatus.textContent = 'Arahkan kamera ke QR code'
        scanStatus.className = 'text-sm text-center text-gray-600 mb-4'
        
      } catch (err: any) {
        console.error('[SCAN] Error starting scanner:', err)
        const errorMessage = err?.message || err?.toString() || 'Unknown error'
        const errorName = err?.name || 'UnknownError'
        
        // Try fallback cameras
        const fallbackConfigs = [
          { facingMode: 'user' },
          { facingMode: 'environment' }
        ]
        
        let started = false
        
        for (const fallbackConfig of fallbackConfigs) {
          // Skip if already tried
          if (typeof cameraConfig === 'object' && 
              cameraConfig.facingMode === fallbackConfig.facingMode) {
            continue
          }
          
          try {
            console.log(`[SCAN] Trying fallback camera: ${fallbackConfig.facingMode}`)
            scanStatus.textContent = `Mencoba kamera alternatif...`
            
            await html5QrCode.start(
              fallbackConfig,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false,
              },
              onScanSuccess,
              onScanError
            )
            
            scanStatus.textContent = 'Arahkan kamera ke QR code'
            scanStatus.className = 'text-sm text-center text-gray-600 mb-4'
            started = true
            break
          } catch (fallbackErr: any) {
            console.error(`[SCAN] Fallback camera ${fallbackConfig.facingMode} failed:`, fallbackErr)
            continue
          }
        }
        
        if (!started) {
          let errorMsg = 'Gagal memulai scanner'
          if (errorMessage.includes('cameraIdOrConfig is required')) {
            errorMsg = 'Konfigurasi kamera tidak valid. Silakan coba lagi atau refresh halaman.'
          } else if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
            errorMsg = 'Izin kamera ditolak. Silakan berikan izin kamera di pengaturan browser.'
          } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
            errorMsg = 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.'
          } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
            errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.'
          } else if (errorMessage && errorMessage !== 'Unknown error') {
            errorMsg = `Gagal memulai scanner: ${errorMessage}`
          }
          
          toast.error(errorMsg)
          if (document.body.contains(modal)) {
            document.body.removeChild(modal)
          }
          return
        }
      }

      // Update status periodically
      let statusUpdateInterval = setInterval(() => {
        if (isScanning) {
          const elapsed = Math.floor(Date.now() / 1000) % 60
          scanStatus.textContent = `Mencari QR code... (${elapsed}s)`
        }
      }, 1000)

      cancelBtn.onclick = async () => {
        isScanning = false
        clearInterval(statusUpdateInterval)
        
        await safeStopScanner()
        
        if (document.body.contains(modal)) {
          document.body.removeChild(modal)
        }
      }
    } catch (error: any) {
      console.error('[SCAN] Unexpected error in handleScanBarcode:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      const errorName = error?.name || 'UnknownError'
      
      let errorMsg = 'Gagal mengakses kamera untuk scan barcode'
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        errorMsg = 'Izin kamera ditolak. Silakan berikan izin kamera di pengaturan browser.'
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        errorMsg = 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.'
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.'
      } else if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
        errorMsg = 'Kamera tidak mendukung resolusi yang diminta.'
      } else if (errorMessage && errorMessage !== 'Unknown error') {
        errorMsg = errorMessage
      }
      
      toast.error(errorMsg)
    }
  }

  const handleSubmit = async () => {
    if (!userTask) return

    // Check location validation if QR code has location data
    if (formData.scanCode && qrLocation) {
      if (isLocationValid === false) {
        toast.error('Anda tidak berada di lokasi yang benar. Silakan scan ulang QR code di lokasi yang tepat.')
        return
      }
      
      if (isLocationValid === null || isCheckingLocation) {
        toast.error('Sedang memvalidasi lokasi. Silakan tunggu sebentar.')
        return
      }

      // Re-check location before submit to ensure user is still at the location
      try {
        const isValid = await checkLocation(qrLocation.latitude, qrLocation.longitude)
        if (!isValid) {
          toast.error('Anda tidak berada di lokasi yang benar. Silakan scan ulang QR code di lokasi yang tepat.')
          return
        }
      } catch (error: any) {
        toast.error('Gagal memvalidasi lokasi: ' + error.message)
        return
      }
    }

    try {
      setIsSubmitting(true)

      const userTaskId = userTask.user_task_id || userTask.id
      if (!userTaskId) {
        toast.error('User task ID tidak ditemukan')
        return
      }

      // Check if we need to upload files
      const hasFiles = formData.fileBefore || formData.fileAfter || formData.fileScan

      if (hasFiles) {
        const formDataToSend = new FormData()
        if (formData.remark) {
          formDataToSend.append('notes', formData.remark)
        }
        if (formData.fileBefore) {
          formDataToSend.append('file_before', formData.fileBefore)
        }
        if (formData.fileAfter) {
          formDataToSend.append('file_after', formData.fileAfter)
        }
        if (formData.fileScan) {
          formDataToSend.append('file_scan', formData.fileScan)
        }
        if (formData.scanCode) {
          formDataToSend.append('scan_code', formData.scanCode)
        }

        const response = await userTasksApi.completeUserTaskWithFiles(Number(userTaskId), formDataToSend)

        if (response.success) {
          toast.success('Task berhasil diselesaikan')
          onOpenChange(false)
          resetForm()
          onComplete()
        } else {
          throw new Error(response.error || 'Gagal menyelesaikan task')
        }
      } else {
        const response = await userTasksApi.completeUserTask(
          Number(userTaskId),
          formData.remark ? { notes: formData.remark } : undefined
        )

        if (response.success) {
          toast.success('Task berhasil diselesaikan')
          onOpenChange(false)
          resetForm()
          onComplete()
        } else {
          throw new Error(response.error || 'Gagal menyelesaikan task')
        }
      }
    } catch (error: any) {
      console.error('Error completing task:', error)
      toast.error(error.message || 'Terjadi kesalahan saat menyelesaikan task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      remark: '',
      fileBefore: null,
      fileAfter: null,
      fileScan: null,
      scanCode: ''
    })
    setFilePreview({})
    setQrLocation(null)
    setIsLocationValid(null)
    setIsCheckingLocation(false)
  }

  if (!userTask || !task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Task: {task.name}</DialogTitle>
          <DialogDescription>
            Lengkapi form untuk menyelesaikan task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Form (if is_need_validation) */}
          {task.is_need_validation && (
            <div className="space-y-4">
              <div>
                <Label>Foto Before</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => captureFromCamera('fileBefore')}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Ambil Foto
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange('fileBefore', file)
                    }}
                    className="hidden"
                    id="file-before-input"
                  />
                  <label htmlFor="file-before-input">
                    <Button type="button" variant="outline" asChild>
                      <span>Pilih File</span>
                    </Button>
                  </label>
                </div>
                {filePreview.before && (
                  <img
                    src={filePreview.before}
                    alt="Before"
                    className="mt-2 w-full max-w-xs h-32 object-cover rounded"
                  />
                )}
              </div>

              <div>
                <Label>Foto After</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => captureFromCamera('fileAfter')}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Ambil Foto
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange('fileAfter', file)
                    }}
                    className="hidden"
                    id="file-after-input"
                  />
                  <label htmlFor="file-after-input">
                    <Button type="button" variant="outline" asChild>
                      <span>Pilih File</span>
                    </Button>
                  </label>
                </div>
                {filePreview.after && (
                  <img
                    src={filePreview.after}
                    alt="After"
                    className="mt-2 w-full max-w-xs h-32 object-cover rounded"
                  />
                )}
              </div>
            </div>
          )}

          {/* Scan Form (if is_scan) */}
          {task.is_scan && (
            <div>
              <Label>Scan Barcode</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleScanBarcode}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Scan Barcode
                </Button>
              </div>
              {filePreview.scan && (
                <img
                  src={filePreview.scan}
                  alt="Scan"
                  className="mt-2 w-full max-w-xs h-32 object-cover rounded"
                />
              )}
              {formData.scanCode && (
                <div className="mt-2 space-y-2">
                  <div className="p-2 bg-gray-100 rounded text-sm">
                    Kode: {formData.scanCode}
                  </div>
                  {qrLocation && (
                    <div className="space-y-1">
                      {isCheckingLocation && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memvalidasi lokasi...
                        </div>
                      )}
                      {!isCheckingLocation && isLocationValid === true && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <span>✓</span>
                          Lokasi valid - Anda berada di lokasi yang benar
                        </div>
                      )}
                      {!isCheckingLocation && isLocationValid === false && (
                        <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                          <span>✗</span>
                          Lokasi tidak valid - Anda terlalu jauh dari lokasi QR code
                        </div>
                      )}
                      {!isCheckingLocation && isLocationValid === null && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                          <span>⚠</span>
                          Gagal memvalidasi lokasi
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Remark */}
          <div>
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              value={formData.remark}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              placeholder="Masukkan catatan..."
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                isCheckingLocation || 
                (qrLocation !== null && isLocationValid === false)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

