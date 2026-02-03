'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Layers, Info, X } from 'lucide-react'

// Use a fresh Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'

export default function SimpleMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('🗺️ Starting map initialization...')
    console.log('📍 Token available:', !!MAPBOX_TOKEN)
    
    const rect = mapContainer.current.getBoundingClientRect()
    console.log('📏 Container size:', rect.width, 'x', rect.height)

    if (rect.width === 0 || rect.height === 0) {
      setMapError('Container has no dimensions')
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-7.5898, 33.5731], // Casablanca
        zoom: 13,
        attributionControl: true
      })

      const timeout = setTimeout(() => {
        if (!mapLoaded) {
          console.error('⏱️ Map load timeout')
          setMapError('Map loading timed out. The Mapbox token may be invalid.')
        }
      }, 10000)

      map.current.on('load', () => {
        clearTimeout(timeout)
        console.log('✅ Map loaded successfully!')
        setMapLoaded(true)
        
        // Add controls
        map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right')
        map.current?.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
        
        // Add a sample marker
        new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat([-7.5898, 33.5731])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Sample Farm Location</h3><p>Casablanca, Morocco</p>'))
          .addTo(map.current!)
      })

      map.current.on('error', (e) => {
        clearTimeout(timeout)
        console.error('❌ Map error:', e)
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`)
      })

      return () => {
        clearTimeout(timeout)
        map.current?.remove()
      }
    } catch (error: any) {
      console.error('💥 Initialization error:', error)
      setMapError(`Initialization failed: ${error.message}`)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Map</h3>
            <p className="text-sm text-gray-600">Initializing Mapbox...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center max-w-lg p-8">
            <div className="text-red-500 mb-4">
              <X className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-3">Map Loading Failed</h3>
            <p className="text-gray-700 mb-4">{mapError}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-sm mb-2">🔧 How to fix:</h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Get a free Mapbox token from <a href="https://account.mapbox.com/" target="_blank" className="text-blue-600 underline">mapbox.com</a></li>
                <li>Add it to <code className="bg-gray-200 px-1 rounded">.env.local</code></li>
                <li>Restart the dev server</li>
              </ol>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => window.open('https://account.mapbox.com/access-tokens/', '_blank')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {mapLoaded && (
        <>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors z-10"
            title="Map Information"
          >
            <Info className="w-5 h-5 text-gray-700" />
          </button>

          {showInfo && (
            <div className="absolute top-16 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Map Information
                </h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Location:</strong> Casablanca, Morocco</p>
                <p><strong>Coordinates:</strong> 33.5731°N, 7.5898°W</p>
                <p><strong>Zoom:</strong> {map.current?.getZoom().toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                  Click and drag to pan. Scroll to zoom. Click the marker for more info.
                </p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-16 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-green-600" />
              Map Legend
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Sample Farm Location</span>
              </div>
              <p className="text-gray-500 italic mt-2">
                This is a demonstration map. Click the marker to see farm details.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
