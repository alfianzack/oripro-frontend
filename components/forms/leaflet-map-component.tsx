'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, X, Navigation, ExternalLink } from 'lucide-react'

// Type declaration for Leaflet
declare global {
  interface Window {
    L: any
  }
}

interface LeafletMapComponentProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number, address?: string) => void
  onAddressChange?: (address: string) => void
  height?: string
  className?: string
}

export default function LeafletMapComponent({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  height = '400px',
  className = ''
}: LeafletMapComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentAddress, setCurrentAddress] = useState('')
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap()
        return
      }

      // Load Leaflet CSS
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      cssLink.crossOrigin = ''
      document.head.appendChild(cssLink)

      // Load Leaflet JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = initializeMap
      script.onerror = () => {
        console.error('Failed to load Leaflet')
        setIsMapLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadLeaflet()
  }, [])

  // Update marker position when coordinates change from outside
  useEffect(() => {
    if (mapInstance && marker && latitude && longitude) {
      // Check if coordinates are different from current marker position
      const currentPos = marker.getLatLng()
      const newLat = parseFloat(latitude.toString())
      const newLng = parseFloat(longitude.toString())
      
      // Only update if coordinates are actually different
      if (Math.abs(currentPos.lat - newLat) > 0.0001 || Math.abs(currentPos.lng - newLng) > 0.0001) {
        marker.setLatLng([newLat, newLng])
        mapInstance.setView([newLat, newLng], mapInstance.getZoom())
        reverseGeocode(newLat, newLng)
      }
    }
  }, [latitude, longitude, mapInstance, marker])

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return

    try {
      // Use provided coordinates or default to Jakarta
      const initialLat = latitude && latitude !== 0 ? latitude : -6.2088
      const initialLng = longitude && longitude !== 0 ? longitude : 106.8456
      
      // Initialize map
      const map = window.L.map(mapRef.current).setView([initialLat, initialLng], 15)

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // Create marker
      const markerInstance = window.L.marker([initialLat, initialLng], {
        draggable: true
      }).addTo(map)

      // Add marker drag listener
      markerInstance.on('dragend', (e: any) => {
        const position = e.target.getLatLng()
        onLocationChange(position.lat, position.lng)
        reverseGeocode(position.lat, position.lng)
      })

      // Add map click listener
      map.on('click', (e: any) => {
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        
        // Update marker position
        markerInstance.setLatLng([lat, lng])
        
        // Update form
        onLocationChange(lat, lng)
        reverseGeocode(lat, lng)
      })

      // Set state
      setMapInstance(map)
      setMarker(markerInstance)
      setIsMapLoaded(true)

      // If we have initial coordinates, get the address
      if (initialLat && initialLng && initialLat !== -6.2088 && initialLng !== 106.8456) {
        reverseGeocode(initialLat, initialLng)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setIsMapLoaded(false)
    }
  }

  const reverseGeocode = (lat: number, lng: number) => {
    const reverseGeocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    
    fetch(reverseGeocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          const address = data.display_name
          setCurrentAddress(address)
          if (onAddressChange) {
            onAddressChange(address)
          }
        }
      })
      .catch(error => {
        console.error('Error getting address:', error)
      })
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // Use free geocoding service (Nominatim from OpenStreetMap)
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=id`
    
    fetch(geocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0]
          const lat = parseFloat(result.lat)
          const lng = parseFloat(result.lon)
          const address = result.display_name
          
          // Update map and marker
          if (mapInstance && marker) {
            mapInstance.setView([lat, lng], 15)
            marker.setLatLng([lat, lng])
          }
          
          // Update form
          onLocationChange(lat, lng, address)
          if (onAddressChange) {
            onAddressChange(address)
          }
          
          setCurrentAddress(address)
        } else {
          alert('Alamat tidak ditemukan')
        }
      })
      .catch(error => {
        console.error('Error searching address:', error)
        alert('Error saat mencari alamat')
      })
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCurrentAddress('')
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          // Update map and marker
          if (mapInstance && marker) {
            mapInstance.setView([lat, lng], 15)
            marker.setLatLng([lat, lng])
          }
          
          // Update form
          onLocationChange(lat, lng)
          reverseGeocode(lat, lng)
        },
        (error) => {
          console.error('Error getting current location:', error)
          alert('Tidak dapat mengakses lokasi saat ini. Pastikan izin lokasi diaktifkan.')
        }
      )
    } else {
      alert('Browser tidak mendukung geolocation')
    }
  }

  const openInOpenStreetMap = () => {
    const lat = latitude || -6.2088
    const lng = longitude || 106.8456
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
    window.open(osmUrl, '_blank')
  }

  const openInGoogleMaps = () => {
    const lat = latitude || -6.2088
    const lng = longitude || 106.8456
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Cari alamat atau tempat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Search className="h-4 w-4 mr-2" />
            Cari
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            title="Gunakan lokasi saat ini"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        
        {currentAddress && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Alamat terpilih:</strong> {currentAddress}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{ height }} 
        className="w-full border rounded-lg overflow-hidden"
      >
        {!isMapLoaded && (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Memuat peta...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Klik pada peta untuk memindahkan marker</p>
        <p>• Drag marker untuk mengubah posisi</p>
        <p>• Gunakan pencarian untuk menemukan alamat</p>
        <p>• Klik tombol navigasi untuk menggunakan GPS</p>
        <p>• <strong>React Leaflet</strong> - Peta interaktif modern</p>
      </div>
    </div>
  )
}
