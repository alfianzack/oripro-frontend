'use client'

import React, { useState, useEffect } from 'react'
import { ComplaintReport, complaintReportsApi, UpdateComplaintReportData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ComplaintReportEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  complaintReport: ComplaintReport | null
  onSuccess?: () => void
}

export default function ComplaintReportEditDialog({
  open,
  onOpenChange,
  complaintReport,
  onSuccess
}: ComplaintReportEditDialogProps) {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && complaintReport) {
      // Convert status to string for the select
      let statusValue: string
      if (typeof complaintReport.status === 'string') {
        statusValue = complaintReport.status
      } else {
        // Map number to string
        const statusMap: Record<number, string> = {
          0: 'pending',
          1: 'in_progress',
          2: 'resolved',
          3: 'closed'
        }
        statusValue = statusMap[complaintReport.status] || String(complaintReport.status)
      }
      setStatus(statusValue)
    }
  }, [open, complaintReport])

  const handleSubmit = async () => {
    if (!complaintReport) return

    setLoading(true)
    try {
      // Convert status string to number or keep as string based on backend expectation
      // Map string status to number
      const statusMap: Record<string, number> = {
        'pending': 0,
        'in_progress': 1,
        'resolved': 2,
        'closed': 3
      }

      // If status is already a number string, use it directly, otherwise map from string
      let statusValue: number | string
      if (['0', '1', '2', '3'].includes(status)) {
        statusValue = parseInt(status, 10)
      } else if (statusMap[status] !== undefined) {
        statusValue = statusMap[status]
      } else {
        // Fallback: try to parse as number, or keep as string
        statusValue = isNaN(parseInt(status, 10)) ? status : parseInt(status, 10)
      }

      const updateData: UpdateComplaintReportData = {
        status: statusValue
      }

      const response = await complaintReportsApi.updateComplaintReport(complaintReport.id, updateData)

      if (response.success) {
        toast.success('Complaint report status updated successfully')
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(response.error || 'Failed to update complaint report status')
      }
    } catch (error) {
      console.error('Update complaint report error:', error)
      toast.error('An error occurred while updating complaint report status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusValue = (status: string | number): string => {
    if (typeof status === 'string') {
      return status
    }
    // Map number to string
    const statusMap: Record<number, string> = {
      0: 'pending',
      1: 'in_progress',
      2: 'resolved',
      3: 'closed'
    }
    return statusMap[status] || String(status)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Update Status
          </DialogTitle>
          <DialogDescription>
            Update the status of complaint report: {complaintReport?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !status}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

