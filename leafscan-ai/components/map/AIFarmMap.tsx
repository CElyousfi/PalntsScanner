'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  MessageSquare, Send, Mic, Download, Layers, 
  MapPin, Maximize2, Minimize2, Loader2, AlertCircle,
  TrendingUp, Leaf, Cloud, Droplets
} from 'lucide-react'

// Mapbox token - should be in env
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  geojson?: any
}

interface FarmData {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Polygon' | 'Point'
      coordinates: any
    }
    properties: {
      name?: string
      area?: number
      cropType?: string
      yield?: number
      health?: string
      [key: string]: any
    }
  }>
}

export default function AIFarmMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI farm mapping assistant. I can help you analyze farms, estimate yields, detect crops, and provide insights. Try asking me to "Analyze farms in view" or "Estimate yields for this area".',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(true)
  const [currentBounds, setCurrentBounds] = useState<any>(null)
  const [farmLayers, setFarmLayers] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-7.5898, 33.5731], // Casablanca, Morocco
      zoom: 12,
      pitch: 0,
      bearing: 0
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      
      // Add navigation controls
      map.current?.addControl(new mapboxgl.NavigationControl(), 'top-left')
      
      // Add scale
      map.current?.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
      
      // Track bounds changes
      map.current?.on('moveend', () => {
        if (map.current) {
          const bounds = map.current.getBounds()
          setCurrentBounds(bounds.toArray())
        }
      })
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Send query to AI
  const sendQuery = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Get current map bounds and center
      const bounds = map.current?.getBounds().toArray()
      const center = map.current?.getCenter()
      const zoom = map.current?.getZoom()

      // Call AI backend
      const response = await fetch('/api/map/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          bounds,
          center: center ? [center.lng, center.lat] : null,
          zoom
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.insights || 'Analysis complete. Check the map for results.',
        timestamp: new Date(),
        geojson: data.geojson
      }

      setMessages(prev => [...prev, assistantMessage])

      // Add overlays if GeoJSON provided
      if (data.geojson) {
        addFarmOverlays(data.geojson)
      }

      // Fly to area if coordinates provided
      if (data.flyTo) {
        map.current?.flyTo({
          center: data.flyTo.center,
          zoom: data.flyTo.zoom,
          duration: 2000
        })
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error analyzing the map. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Map analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add farm overlays to map
  const addFarmOverlays = (geojson: FarmData) => {
    if (!map.current || !mapLoaded) return

    const sourceId = `farms-${Date.now()}`
    const layerId = `farms-layer-${Date.now()}`

    // Remove old layers if too many
    if (farmLayers.length > 5) {
      const oldLayer = farmLayers[0]
      if (map.current.getLayer(oldLayer)) {
        map.current.removeLayer(oldLayer)
      }
      if (map.current.getSource(oldLayer.replace('-layer', ''))) {
        map.current.removeSource(oldLayer.replace('-layer', ''))
      }
      setFarmLayers(prev => prev.slice(1))
    }

    // Add source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    })

    // Add fill layer
    map.current.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': [
          'match',
          ['get', 'health'],
          'excellent', '#10b981',
          'good', '#84cc16',
          'fair', '#eab308',
          'poor', '#ef4444',
          '#6366f1' // default
        ],
        'fill-opacity': 0.6
      }
    })

    // Add outline
    map.current.addLayer({
      id: `${layerId}-outline`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#ffffff',
        'line-width': 2
      }
    })

    // Add popups on click
    map.current.on('click', layerId, (e) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const props = feature.properties || {}

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-2">${props.name || 'Farm Plot'}</h3>
          ${props.area ? `<p class="text-xs">Area: ${props.area.toFixed(2)} ha</p>` : ''}
          ${props.cropType ? `<p class="text-xs">Crop: ${props.cropType}</p>` : ''}
          ${props.yield ? `<p class="text-xs">Est. Yield: ${props.yield} t/ha</p>` : ''}
          ${props.health ? `<p class="text-xs">Health: ${props.health}</p>` : ''}
        </div>
      `

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map.current!)
    })

    // Change cursor on hover
    map.current.on('mouseenter', layerId, () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', layerId, () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    setFarmLayers(prev => [...prev, layerId])
  }

  // Voice input
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue(transcript)
    }

    recognition.start()
  }

  // Quick actions
  const quickActions = [
    { label: 'Analyze Farms', query: 'Delineate and analyze all farms in the current view' },
    { label: 'Estimate Yields', query: 'Estimate crop yields for farms in this area' },
    { label: 'Detect Crops', query: 'Identify crop types in the visible area' },
    { label: 'Health Assessment', query: 'Assess plant health and identify issues' }
  ]

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* AI Assistant Chat Panel */}
      <div 
        className={`absolute top-4 right-4 bg-white rounded-lg shadow-2xl transition-all duration-300 ${
          isChatExpanded ? 'w-96 h-[600px]' : 'w-96 h-16'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-apeel-green rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Farm Assistant</h3>
              <p className="text-xs text-gray-500">Powered by Gemini 3</p>
            </div>
          </div>
          <button
            onClick={() => setIsChatExpanded(!isChatExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isChatExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {isChatExpanded && (
          <>
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-apeel-green text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader2 className="w-5 h-5 animate-spin text-apeel-green" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(action.query)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendQuery(inputValue)}
                  placeholder="Ask about farms, yields, crops..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apeel-green text-sm disabled:opacity-50"
                />
                <button
                  onClick={startVoiceInput}
                  disabled={isLoading || isListening}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Voice input"
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => sendQuery(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 bg-apeel-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Map Info Panel */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-apeel-green" />
          Current View
        </h4>
        {currentBounds && (
          <div className="text-xs text-gray-600 space-y-1">
            <p>Zoom: {map.current?.getZoom().toFixed(2)}</p>
            <p>Center: {map.current?.getCenter().lat.toFixed(4)}, {map.current?.getCenter().lng.toFixed(4)}</p>
            <p className="text-xs text-gray-500 mt-2">
              Pan and zoom to explore. Ask AI for analysis of any area.
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      {farmLayers.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-apeel-green" />
            Farm Health Legend
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs">Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-lime-500 rounded"></div>
              <span className="text-xs">Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs">Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs">Poor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
