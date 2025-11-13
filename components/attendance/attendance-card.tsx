'use client'

import { assetsApi, attendanceApi } from "@/lib/api";
import React, { useEffect, useState } from "react";

interface TodayAttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  status: string;
  attendance: any;
}

export default function AttendanceCard() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [assets, setAssets] = useState<{id: string, name: string, lat: number, lng: number}[]>([]);
  const [isNearAsset, setIsNearAsset] = useState(false);
  const [nearestAsset, setNearestAsset] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<null | "success" | "error">(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAttendance, setLastAttendance] = useState<string | null>(null);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState<TodayAttendanceStatus | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAttendance = localStorage.getItem('lastAttendance');
    if (savedAttendance) {
      setLastAttendance(savedAttendance);
    }
  }, []);

  // Check today's attendance status
  const checkTodayStatus = async (assetId: string | number) => {
    // Validate assetId before proceeding - can be UUID (string) or number
    if (!assetId || assetId === null || assetId === undefined) {
      console.error('Invalid asset ID:', assetId);
      const defaultStatus: TodayAttendanceStatus = {
        hasCheckedIn: false,
        hasCheckedOut: false,
        status: 'not_checked_in',
        attendance: null
      };
      setTodayAttendanceStatus(defaultStatus);
      return;
    }

    console.log('Checking today status for asset ID:', assetId);
    try {
      const response = await attendanceApi.getTodayStatus(assetId);
      console.log('Today status response:', response);
      
      if (response.success) {
        if (response.data) {
          const statusData = response.data;
          
          // Handle backend response structure - backend returns hasCheckedIn/hasCheckedOut
          if (statusData.hasCheckedIn !== undefined || statusData.hasCheckedOut !== undefined) {
            // Backend returns wrapped structure
            const statusDataMapped: TodayAttendanceStatus = {
              hasCheckedIn: statusData.hasCheckedIn || false,
              hasCheckedOut: statusData.hasCheckedOut || false,
              status: statusData.status || 'not_checked_in',
              attendance: statusData.attendance || null
            };
            setTodayAttendanceStatus(statusDataMapped);
            console.log('Today attendance status set:', statusDataMapped);
          } else if (statusData.check_in_time || statusData.check_out_time) {
            // Direct attendance object structure (fallback)
            const statusDataMapped: TodayAttendanceStatus = {
              hasCheckedIn: !!statusData.check_in_time,
              hasCheckedOut: !!statusData.check_out_time,
              status: statusData.status || (statusData.check_out_time ? 'checked_out' : 'checked_in'),
              attendance: statusData
            };
            setTodayAttendanceStatus(statusDataMapped);
            console.log('Today attendance status set (direct):', statusDataMapped);
          } else {
            // No attendance data
            console.log('No attendance data for today, setting default status');
            const defaultStatus: TodayAttendanceStatus = {
              hasCheckedIn: false,
              hasCheckedOut: false,
              status: 'not_checked_in',
              attendance: null
            };
            setTodayAttendanceStatus(defaultStatus);
          }
        } else {
          // No data in response
          console.log('No attendance data for today, setting default status');
          const defaultStatus: TodayAttendanceStatus = {
            hasCheckedIn: false,
            hasCheckedOut: false,
            status: 'not_checked_in',
            attendance: null
          };
          setTodayAttendanceStatus(defaultStatus);
        }
      } else {
        console.log('API returned unsuccessful response:', response.error || response.message);
        // Set default status if API call failed
        const defaultStatus: TodayAttendanceStatus = {
          hasCheckedIn: false,
          hasCheckedOut: false,
          status: 'not_checked_in',
          attendance: null
        };
        setTodayAttendanceStatus(defaultStatus);
      }
    } catch (error) {
      console.error('Error checking today status:', error);
      // Set default status on error
      const defaultStatus: TodayAttendanceStatus = {
        hasCheckedIn: false,
        hasCheckedOut: false,
        status: 'not_checked_in',
        attendance: null
      };
      setTodayAttendanceStatus(defaultStatus);
    }
  };

  // Helper: Format date with day
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper: Format date short
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper: Format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper: hitung jarak dua titik latlong (meter)
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  useEffect(() => {
    // 1. Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('User location detected:', { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.log('Geolocation not supported');
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    // 2. Fetch asset latlongs (dummy API, replace with real endpoint)
    async function fetchAssets() {
      // Example: fetch("/api/assets") or hardcode for demo
      // For demo, hardcode 2 assets with more realistic coordinates
      // Using Jakarta coordinates as example
      const response = await assetsApi.getAssets();
      
      if (response.success && response.data) {
        const responseData = response.data as any
        const assetsData = Array.isArray(responseData.data) ? responseData.data : []
        console.log('Assets data:', assetsData);
        setAssets(assetsData)
      } else {
        console.error('Gagal memuat data assets')
      }
      
    }
    fetchAssets();
  }, [refreshKey]);

  useEffect(() => {
    // 3. Cek apakah user dekat dengan salah satu asset (misal < 100 meter)
    if (location && assets.length > 0) {
      console.log('Checking distance for location:', location);
      console.log('Available assets:', assets);
      
      let found = false;
      let nearest = null;
      let minDistance = 20000;
      
      for (const asset of assets) {
        
        // Check different possible field names for coordinates
        const assetLat = asset.lat || (asset as any).latitude || (asset as any).latitude_coordinate;
        const assetLng = asset.lng || (asset as any).longitude || (asset as any).longitude_coordinate;
        
        if (!assetLat || !assetLng) {
          console.log('Asset missing coordinates:', asset);
          continue;
        }
        
        const dist = getDistanceFromLatLonInMeters(location.lat, location.lng, assetLat, assetLng);
        console.log('Distance:', dist);
        if (dist < minDistance) { // 1000 meter threshold for easier testing
          found = true;
          nearest = asset;
          minDistance = dist;
          break;
        }
      }
      
      setIsNearAsset(found);
      
      // Ensure nearest asset has valid ID before setting - can be UUID (string) or number
      if (nearest && nearest.id) {
        const assetId = nearest.id; // Keep as-is (UUID string or number)
        
        // Basic validation - just check it's not empty/null/undefined
        if (assetId !== null && assetId !== undefined && assetId !== '') {
          setNearestAsset({id: String(assetId), name: nearest.name});
          // Check today's attendance status if near asset
          console.log('Checking today status for asset ID:', assetId);
          console.log('Found:', found);
          if (found) {
            checkTodayStatus(assetId);
          }
        } else {
          console.error('Invalid asset ID:', nearest.id);
          setNearestAsset(null);
        }
      } else {
        setNearestAsset(null);
      }
    }
    setLoading(false);
  }, [location, assets]);

  const handleAbsensi = async () => {
    if (!nearestAsset || !location) return;
    
    // Validate assetId before proceeding - can be UUID (string) or number
    const assetId = nearestAsset.id; // Keep as-is (UUID string or number)
    
    if (!assetId || assetId === null || assetId === undefined || assetId === '') {
      setAttendanceStatus("error");
      return;
    }
    
    setAttendanceStatus(null);
    
    try {
      // Check if already checked in today
      if (todayAttendanceStatus?.hasCheckedIn && !todayAttendanceStatus?.hasCheckedOut) {
        // Check out
        const response = await attendanceApi.checkOut(
          assetId,
          location.lat,
          location.lng
        );
        
        if (response.success) {
          setAttendanceStatus("success");
          console.log('Check-out successful:', response.data);
        } else {
          setAttendanceStatus("error");
          const errorMsg = response.error || response.message || 'Check-out gagal';
          console.error('Check-out failed:', errorMsg);
        }
      } else {
        // Check in
        const response = await attendanceApi.checkIn(
          assetId,
          location.lat,
          location.lng
        );
        
        if (response.success) {
          setAttendanceStatus("success");
          console.log('Check-in successful:', response.data);
        } else {
          setAttendanceStatus("error");
          const errorMsg = response.error || response.message || 'Check-in gagal';
          console.error('Check-in failed:', errorMsg);
        }
      }
      
      // Save to localStorage
      const attendanceData = {
        timestamp: new Date().toISOString(),
        assetId: String(assetId),
        assetName: nearestAsset.name,
        location: location
      };
      localStorage.setItem('lastAttendance', JSON.stringify(attendanceData));
      setLastAttendance(JSON.stringify(attendanceData));
      
      // Refresh today status after a short delay to ensure database is updated
      setTimeout(async () => {
        await checkTodayStatus(assetId);
      }, 500);
      
      // Auto reset after 3 seconds
      setTimeout(() => {
        setAttendanceStatus(null);
        setRefreshKey(prev => prev + 1);
      }, 3000);
    } catch (error) {
      console.error('Attendance error:', error);
      setAttendanceStatus("error");
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing attendance card...');
    setLoading(true);
    setAttendanceStatus(null);
    setIsNearAsset(false);
    setNearestAsset(null);
    setLocation(null);
    setRefreshKey(prev => prev + 1);
    
    // Reload location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('User location refreshed:', { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (error) => {
          console.error('Geolocation error on refresh:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow flex items-center justify-center min-h-[120px]">
        <span className="text-muted-foreground">Mendeteksi lokasi...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Absensi Lokasi</h2>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      {  nearestAsset ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">
              Anda berada di sekitar: <span className="font-bold">{nearestAsset.name}</span>
            </span>
          </div>
          
          {/* Attendance Status Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {/* Display current date */}
            <div className="text-xs text-blue-600 mb-2 font-medium">
              {formatDateWithDay(new Date().toISOString())}
            </div>
            
            {todayAttendanceStatus ? (
              <>
                {todayAttendanceStatus.hasCheckedIn && !todayAttendanceStatus.hasCheckedOut && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="text-lg">✅</span>
                      <span>Sudah check-in hari ini. Silakan check-out saat pulang.</span>
                    </div>
                    {todayAttendanceStatus.attendance?.check_in_time && (
                      <div className="text-sm text-blue-700 ml-7">
                        Check-in: {formatTime(todayAttendanceStatus.attendance.check_in_time)}
                      </div>
                    )}
                  </div>
                )}
                {todayAttendanceStatus.hasCheckedIn && todayAttendanceStatus.hasCheckedOut && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="text-lg">✅</span>
                      <span>Sudah check-in dan check-out hari ini.</span>
                    </div>
                    {todayAttendanceStatus.attendance?.check_in_time && (
                      <div className="text-sm text-blue-700 ml-7">
                        Check-in: {formatTime(todayAttendanceStatus.attendance.check_in_time)}
                      </div>
                    )}
                    {todayAttendanceStatus.attendance?.check_out_time && (
                      <div className="text-sm text-blue-700 ml-7">
                        Check-out: {formatTime(todayAttendanceStatus.attendance.check_out_time)}
                      </div>
                    )}
                  </div>
                )}
                {!todayAttendanceStatus.hasCheckedIn && (
                  <div className="flex items-center gap-2 text-blue-800">
                    <span className="text-lg">❌</span>
                    <span>Belum check-in hari ini.</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-lg">⏳</span>
                <span>Memuat status absensi...</span>
              </div>
            )}
          </div>
          
          {/* Dynamic Button - Always show if near asset */}
          <button
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              todayAttendanceStatus?.hasCheckedIn && !todayAttendanceStatus?.hasCheckedOut
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            } ${attendanceStatus === "success" ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAbsensi}
            disabled={attendanceStatus === "success"}
          >
            {todayAttendanceStatus ? (
              todayAttendanceStatus.hasCheckedIn && !todayAttendanceStatus.hasCheckedOut
                ? 'Check Out'
                : 'Check In'
            ) : (
              'Check In'
            )}
          </button>
          
          {attendanceStatus === "success" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-lg">✅</span>
              <span className="text-green-800 font-medium">
                {todayAttendanceStatus?.hasCheckedIn && !todayAttendanceStatus?.hasCheckedOut
                  ? 'Check-out berhasil!'
                  : 'Check-in berhasil!'
                }
              </span>
            </div>
          )}
          {attendanceStatus === "error" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-lg">❌</span>
              <span className="text-red-800 font-medium">Gagal absen. Coba lagi.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-lg">❌</span>
          <span className="text-red-800">
            Anda tidak berada di sekitar asset yang terdaftar. Silakan pindah ke lokasi asset untuk melakukan absensi.
          </span>
        </div>
      )}
      
      {/* Last Attendance Info */}
      {lastAttendance && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
          <div className="font-medium">Absensi Terakhir:</div>
          {(() => {
            try {
              const data = JSON.parse(lastAttendance);
              const date = new Date(data.timestamp);
              return (
                <div>
                  <div>Asset: {data.assetName}</div>
                  <div>Hari: {date.toLocaleDateString('id-ID', { weekday: 'long' })}</div>
                  <div>Tanggal: {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div>Waktu: {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              );
            } catch {
              return <div>Data absensi tidak valid</div>;
            }
          })()}
        </div>
      )}
    </div>
  );
}
