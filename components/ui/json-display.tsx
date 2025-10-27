import React from 'react'

interface JsonDisplayProps {
  data: any
  className?: string
}

export default function JsonDisplay({
  data,
  className = ""
}: JsonDisplayProps) {
  const formatValue = (value: any, key: string): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    
    if (Array.isArray(value)) {
      return value.map((item, index) => `[${index}] ${String(item)}`).join('\n')
    }
    
    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([objKey, objValue]) => `${objKey}: ${String(objValue)}`)
        .join('\n')
    }
    
    if (typeof value === 'string') {
      // Check if it's a date string
      if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        const date = new Date(value)
        return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')}`
      }
      
      return value
    }
    
    return String(value)
  }

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      id: "ID",
      name: "Nama",
      email: "Email",
      phone: "Telepon",
      gender: "Jenis Kelamin",
      status: "Status",
      role_id: "Role ID",
      created_at: "Tanggal Dibuat",
      updated_at: "Tanggal Diperbarui",
      assetIds: "Asset IDs",
      old_data: "Data Lama",
      new_data: "Data Baru",
      action: "Aksi",
      created_by: "Dibuat Oleh"
    }
    return labels[key] || key
  }

  const formatData = (): string => {
    return Object.entries(data)
      .map(([key, value]) => {
        const label = getFieldLabel(key)
        const formattedValue = formatValue(value, key)
        return `${label}: ${formattedValue}`
      })
      .join('\n')
  }

  return (
    <div className={`text-xs text-muted-foreground break-words overflow-hidden ${className}`}>
      <div className="max-h-20 overflow-y-auto whitespace-pre-line">
        {formatData()}
      </div>
    </div>
  )
}
