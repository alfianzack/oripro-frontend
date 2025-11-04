'use client'

import React, { useState, useEffect } from 'react'
import { ScanInfo, scanInfoApi } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScanInfosTableProps {
  scanInfos: ScanInfo[]
  onEdit: (scanInfo: ScanInfo) => void
  onView: (scanInfo: ScanInfo) => void
  onGenerateQRCode: (scanInfo: ScanInfo) => void
  onRefresh: () => void
  loading?: boolean
}

export default function ScanInfosTable({ 
  scanInfos, 
  onEdit, 
  onView,
  onGenerateQRCode,
  onRefresh, 
  loading = false 
}: ScanInfosTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scanInfoToDelete, setScanInfoToDelete] = useState<ScanInfo | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteClick = (scanInfo: ScanInfo) => {
    setScanInfoToDelete(scanInfo)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!scanInfoToDelete) return

    setDeleting(true)
    try {
      const response = await scanInfoApi.deleteScanInfo(scanInfoToDelete.id)
      
      if (response.success) {
        toast.success('Scan info deleted successfully')
        onRefresh()
      } else {
        toast.error(response.error || 'Failed to delete scan info')
      }
    } catch (error) {
      console.error('Delete scan info error:', error)
      toast.error('An error occurred while deleting scan info')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setScanInfoToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!mounted) return 'Loading...'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(scanInfos) || scanInfos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No scan infos found
                </TableCell>
              </TableRow>
            ) : (
              scanInfos.map((scanInfo, index) => {
                const isLast = index === scanInfos.length - 1;
                return (
                <TableRow key={scanInfo.id}>
                  <TableCell className="font-medium">{String(index + 1)}</TableCell>
                  <TableCell className="font-medium">
                    {scanInfo.scan_code || '-'}
                  </TableCell>
                  <TableCell>
                    {scanInfo.latitude !== undefined ? scanInfo.latitude.toFixed(6) : '-'}
                  </TableCell>
                  <TableCell>
                    {scanInfo.longitude !== undefined ? scanInfo.longitude.toFixed(6) : '-'}
                  </TableCell>
                  <TableCell>
                    {scanInfo.asset?.name || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {scanInfo.created_at ? formatDate(scanInfo.created_at) : '-'}
                  </TableCell>
                  <TableCell
                      className={`py-4 px-4 border-b text-center first:border-s last:border-e border-neutral-200 dark:border-slate-600 ${isLast ? "rounded-bl-lg" : ""
                          }`}
                  >
                      <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onView(scanInfo)} className="rounded-[50%] text-blue-500 bg-blue-500/10">
                              <Eye className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onGenerateQRCode(scanInfo)} className="rounded-[50%] text-purple-500 bg-purple-500/10">
                              <QrCode className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(scanInfo)} className="rounded-[50%] text-green-600 bg-green-600/10">
                              <Edit className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(scanInfo)} className="rounded-[50%] text-red-500 bg-red-500/10">
                              <Trash2 className="w-5 h-5" />
                          </Button>
                      </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete scan info <strong>{scanInfoToDelete?.scan_code}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

