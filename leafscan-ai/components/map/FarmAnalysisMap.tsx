'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  MessageSquare, Send, Mic, X, Layers, MapPin, Calendar,
  TrendingUp, Droplets, Leaf, Sun, Cloud, ArrowLeft, Info
} from 'lucide-react'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

interface FarmCapability {
  currentCrop: string
  fieldSize: number
  lastSowing: string
  lastHarvest: string
  waterDistance: number
  roadDistance: number
  practices: Array<{
    year: number
    months: Array<{
      month: string
      crop: string
      color: string
    }>
  }>
}

export default function FarmAnalysisMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedFarm, setSelectedFarm] = useState<FarmCapability | null>(null)
  const [showLegend, setShowLegend] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'satellite'>('satellite')

  // Sample farm data
  const sampleFarmData: FarmCapability = {
    currentCrop: 'Rice',
    fieldSize: 1.35,
    lastSowing: '03/04/2022',
    lastHarvest: '25/09/2022',
    waterDistance: 0.38,
    roadDistance: 0.01,
    practices: [
      {
        year: 2020,
        months: [
          { month: 'Jan', crop: 'Crop', color: '#8B4513' },
          { month: 'Feb', crop: 'Crop', color: '#8B4513' },
          { month: 'Mar', crop: 'Tillage', color: '#D2691E' },
          { month: 'Apr', crop: 'Sowing', color: '#F4A460' },
          { month: 'May', crop: 'Crop', color: '#228B22' },
          { month: 'Jun', crop: 'Crop', color: '#228B22' },
          { month: 'Jul', crop: 'Crop', color: '#228B22' },
          { month: 'Aug', crop: 'Harvest', color: '#FFD700' },
          { month: 'Sept', crop: 'Crop', color: '#8B4513' },
          { month: 'Oct', crop: 'Crop', color: '#8B4513' },
          { month: 'Nov', crop: 'Crop', color: '#8B4513' },
          { month: 'Dec', crop: 'Crop', color: '#8B4513' }
        ]
      },
      {
        year: 2021,
        months: [
          { month: 'Jan', crop: 'Crop', color: '#8B4513' },
          { month: 'Feb', crop: 'Tillage', color: '#D2691E' },
          { month: 'Mar', crop: 'Sowing', color: '#F4A460' },
          { month: 'Apr', crop: 'Crop', color: '#228B22' },
          { month: 'May', crop: 'Crop', color: '#228B22' },
          { month: 'Jun', crop: 'Crop', color: '#228B22' },
          { month: 'Jul', crop: 'Crop', color: '#228B22' },
          { month: 'Aug', crop: 'Harvest', color: '#FFD700' },
          { month: 'Sept', crop: 'Flooding', color: '#4169E1' },
          { month: 'Oct', crop: 'Crop', color: '#8B4513' },
          { month: 'Nov', crop: 'Crop', color: '#8B4513' },
          { month: 'Dec', crop: 'Crop', color: '#8B4513' }
        ]
      },
      {
        year: 2022,
        months: [
          { month: 'Jan', crop: 'Crop', color: '#8B4513' },
          { month: 'Feb', crop: 'Crop', color: '#8B4513' },
          { month: 'Mar', crop: 'Tillage', color: '#D2691E' },
          { month: 'Apr', crop: 'Sowing', color: '#F4A460' },
          { month: 'May', crop: 'Crop', color: '#228B22' },
          { month: 'Jun', crop: 'Crop', color: '#228B22' },
          { month: 'Jul', crop: 'Crop', color: '#228B22' },
          { month: 'Aug', crop: 'Harvest', color: '#FFD700' },
          { month: 'Sept', crop: 'Crop', color: '#8B4513' },
          { month: 'Oct', crop: 'Crop', color: '#8B4513' },
          { month: 'Nov', crop: 'Crop', color: '#8B4513' },
          { month: 'Dec', crop: 'Crop', color: '#8B4513' }
        ]
      }
    ]
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('Initializing map with token:', MAPBOX_TOKEN ? 'Token present' : 'No token')
    
    // Check if container has dimensions
    const rect = mapContainer.current.getBoundingClientRect()
    console.log('Map container dimensions:', rect.width, 'x', rect.height)
    
    if (rect.width === 0 || rect.height === 0) {
      console.error('Map container has no dimensions!')
      setMapError('Map container has no size. Please refresh the page.')
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-7.5898, 33.5731],
        zoom: 14,
        pitch: 0
      })

      // Set timeout for loading
      const loadTimeout = setTimeout(() => {
        if (!mapLoaded) {
          console.error('Map load timeout')
          setMapError('Map took too long to load. Please check your internet connection.')
        }
      }, 15000) // 15 second timeout

      map.current.on('load', () => {
        clearTimeout(loadTimeout)
        console.log('Map loaded successfully')
        setMapLoaded(true)
        
        // Add navigation controls
        map.current?.addControl(new mapboxgl.NavigationControl(), 'top-left')
      })

      map.current.on('error', (e) => {
        clearTimeout(loadTimeout)
        console.error('Map error:', e)
        setMapError(`Failed to load map: ${e.error?.message || 'Unknown error'}. Check your Mapbox token.`)
      })

      return () => {
        clearTimeout(loadTimeout)
        map.current?.remove()
      }
    } catch (error: any) {
      console.error('Map initialization error:', error)
      setMapError(`Failed to initialize map: ${error.message}`)
    }
  }, [])

  // Add sample farm when map loads
  useEffect(() => {
    if (mapLoaded && map.current) {
      addSampleFarm()
    }
  }, [mapLoaded])

  // Add sample farm
  const addSampleFarm = () => {
    if (!map.current) return
    
    console.log('Adding sample farm')

    const center = map.current.getCenter()
    const offset = 0.002

    const farmPolygon = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [center.lng - offset, center.lat - offset],
            [center.lng + offset, center.lat - offset],
            [center.lng + offset, center.lat + offset],
            [center.lng - offset, center.lat + offset],
            [center.lng - offset, center.lat - offset]
          ]]
        },
        properties: {
          name: 'Sample Farm',
          crop: 'Rice'
        }
      }]
    }

    if (map.current.getSource('farm')) {
      (map.current.getSource('farm') as mapboxgl.GeoJSONSource).setData(farmPolygon)
    } else {
      map.current.addSource('farm', {
        type: 'geojson',
        data: farmPolygon
      })

      map.current.addLayer({
        id: 'farm-fill',
        type: 'fill',
        source: 'farm',
        paint: {
          'fill-color': '#228B22',
          'fill-opacity': 0.4
        }
      })

      map.current.addLayer({
        id: 'farm-outline',
        type: 'line',
        source: 'farm',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3
        }
      })

      // Add click handler
      map.current.on('click', 'farm-fill', () => {
        setSelectedFarm(sampleFarmData)
      })

      // Change cursor on hover
      map.current.on('mouseenter', 'farm-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })

      map.current.on('mouseleave', 'farm-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })

      // Add marker
      const marker = document.createElement('div')
      marker.className = 'farm-marker'
      marker.style.width = '30px'
      marker.style.height = '30px'
      marker.style.borderRadius = '50%'
      marker.style.backgroundColor = '#ff5555'
      marker.style.border = '3px solid white'
      marker.style.cursor = 'pointer'

      new mapboxgl.Marker(marker)
        .setLngLat([center.lng, center.lat])
        .addTo(map.current)
        .getElement()
        .addEventListener('click', () => {
          setSelectedFarm(sampleFarmData)
        })
    }
  }

  // Toggle map style
  const toggleMapStyle = () => {
    if (!map.current) return
    
    const newMode = viewMode === 'satellite' ? 'map' : 'satellite'
    setViewMode(newMode)
    
    map.current.setStyle(
      newMode === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/streets-v12'
    )

    map.current.once('styledata', () => {
      addSampleFarm()
    })
  }

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Map Container */}
      <div className="absolute inset-0">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
            <p className="text-xs text-gray-500 mt-2">Initializing Mapbox</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
          <div className="text-center max-w-md p-6">
            <div className="text-red-500 mb-4">
              <X className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
            <p className="text-gray-600 mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Map/Satellite Toggle */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg overflow-hidden z-10">
        <div className="flex">
          <button
            onClick={toggleMapStyle}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-white text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Map
          </button>
          <button
            onClick={toggleMapStyle}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'satellite'
                ? 'bg-white text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Legend</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Field</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-600 rounded"></div>
              <span>Orchard/Tree Crop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 rounded"></div>
              <span>Tree(s)/Woodland</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Dug Well</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span>Farm Pond</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span>Other Water</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            * This data is based on AEML capability. Actual data may differ vary.
          </p>
        </div>
      )}

      {/* Farm Details Panel */}
      {selectedFarm && (
        <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl overflow-y-auto z-20">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedFarm(null)}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Go back to full map view</span>
            </button>
          </div>

          {/* Current Capabilities */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold mb-4">Current Capabilities</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">
                      {selectedFarm.currentCrop}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Current crop type</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">
                      {selectedFarm.fieldSize} ac
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Field Size</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium">Field ID: 263-366</span>
                </div>
                <p className="text-xs text-gray-500">Most grown crop: Rice</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium">Last Sowing: {selectedFarm.lastSowing}</span>
                </div>
                <p className="text-xs text-gray-500">Last harvest: {selectedFarm.lastHarvest}</p>
              </div>
            </div>
          </div>

          {/* Future Capabilities */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold mb-4">Future Capabilities</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">Distance to water: {selectedFarm.waterDistance} km</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium">Distance to road: {selectedFarm.roadDistance} km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Practices */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Agriculture practices</h2>
              <select className="text-xs border border-gray-300 rounded px-2 py-1">
                <option>Last 3 years</option>
                <option>Last 5 years</option>
                <option>Last 10 years</option>
              </select>
            </div>

            {selectedFarm.practices.map((yearData) => (
              <div key={yearData.year} className="mb-4">
                <div className="text-sm font-medium mb-2">{yearData.year}</div>
                <div className="flex gap-1">
                  {yearData.months.map((month, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: month.color }}
                      title={`${month.month}: ${month.crop}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sept</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            ))}

            {/* Practice Legend */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#8B4513]"></div>
                <span>Crop</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#D2691E]"></div>
                <span>Tillage</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#F4A460]"></div>
                <span>Sowing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#FFD700]"></div>
                <span>Harvest</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#4169E1]"></div>
                <span>Flooding</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 italic">
              This data contains illustrations data and the actual prediction with more may be different.
            </p>
          </div>
        </div>
      )}

      {/* Info Button */}
      {!selectedFarm && (
        <button
          onClick={() => {
            // Simulate clicking the farm
            setSelectedFarm(sampleFarmData)
          }}
          className="absolute bottom-4 right-4 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-colors z-10"
          title="View sample farm details"
        >
          <Info className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
