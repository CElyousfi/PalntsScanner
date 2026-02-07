'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api'
import {
    CloudRain, Wind, Thermometer, Droplets, Map as MapIcon,
    Satellite, Brain, Search, MapPin, Layers, AlertCircle, Phone, Globe, ShoppingBag,
    Star, Clock, ExternalLink, Check, Mic, MicOff, Navigation, Route, Zap, Tractor,
    Sprout, Heart, Store, Wrench, TrendingUp, Package2, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from '@/hooks/useLocation'
import { useAutonomy } from '@/hooks/useAutonomy'
import MapSidebar from '@/components/map/MapSidebar'
import LocationPermissionModal from '@/components/map/LocationPermissionModal'
import ResultsPanel from '@/components/map/ResultsPanel'
import { useSearchParams } from 'next/navigation'
import { findSuppliers } from '@/app/actions/findSuppliers'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
const LIBRARIES: ("places")[] = ['places']

// ----- TYPES & CONFIG -----
type ViewMode = 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
type WeatherLayerType = 'radar' | 'wind' | 'temp' | 'humidity' | 'none'

interface WeatherMetric {
    id: WeatherLayerType
    label: string
    icon: any
    color: string
    unit: string
}

const WEATHER_LAYERS: WeatherMetric[] = [
    { id: 'radar', label: 'Radar', icon: CloudRain, color: 'text-blue-400', unit: 'mm/h' },
    { id: 'wind', label: 'Wind', icon: Wind, color: 'text-gray-300', unit: 'km/h' },
    { id: 'temp', label: 'Temp', icon: Thermometer, color: 'text-orange-400', unit: '°C' },
    { id: 'humidity', label: 'Humidity', icon: Droplets, color: 'text-teal-400', unit: '%' },
]

interface QuickCategory {
    id: string
    label: string
    icon: any
    query: string
    color: string
}

const QUICK_CATEGORIES: QuickCategory[] = [
    { id: 'equipment', label: 'Equipment', icon: Tractor, query: 'tractor repair parts dealers', color: 'bg-orange-500' },
    { id: 'inputs', label: 'Inputs', icon: Sprout, query: 'agricultural supply fertilizer seeds', color: 'bg-green-500' },
    { id: 'livestock', label: 'Livestock', icon: Heart, query: 'veterinary clinic animal feed', color: 'bg-red-500' },
    { id: 'market', label: 'Markets', icon: Store, query: 'farmers market wholesale buyers', color: 'bg-blue-500' },
    { id: 'services', label: 'Services', icon: Wrench, query: 'irrigation equipment storage silos', color: 'bg-purple-500' },
    { id: 'emergency', label: 'Emergency', icon: Zap, query: 'emergency repair 24/7 service', color: 'bg-red-600' },
]

export default function SmartMap() {
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('search')
    const mode = searchParams.get('mode')
    const isSupplierMode = mode === 'supplier'
    const [viewMode, setViewMode] = useState<ViewMode>('satellite')
    const [activeLayer, setActiveLayer] = useState<WeatherLayerType>('none')
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [aiInsight, setAiInsight] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState(initialSearch || '')
    const [isSearching, setIsSearching] = useState(false)
    const [foundSuppliers, setFoundSuppliers] = useState<any[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
    const [reservationStatus, setReservationStatus] = useState<'idle' | 'loading' | 'success'>('idle')
    const [isListening, setIsListening] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [routePath, setRoutePath] = useState<any>(null)
    const [showRoutePanel, setShowRoutePanel] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])

    // Smart Map Features
    const { envData } = useAutonomy()
    const { requestLocation } = useLocation()
    const [showPermissionModal, setShowPermissionModal] = useState(false)

    // Google Maps Loader
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    })

    // robust fallback location (Casablanca)
    const center = useMemo(() => {
        if (envData?.location) {
            return {
                lat: envData.location.lat,
                lng: envData.location.lng,
            }
        }
        return {
            lat: 33.5731,
            lng: -7.5898,
        }
    }, [envData?.location])

    // Effect: Handle Initial Search
    useEffect(() => {
        if (initialSearch && isLoaded && mapInstance) {
            console.log('🎬 Initial search triggered:', initialSearch)
            handleSearch(initialSearch)
        }
    }, [initialSearch, isLoaded, mapInstance])

    // Check Persistence on Mount
    useEffect(() => {
        const permission = localStorage.getItem('leafscan_location_permission')
        if (permission === 'granted') {
            requestLocation()
        } else if (!permission) {
            setShowPermissionModal(true)
        }
    }, [])

    const handleSearch = async (query: string) => {
        if (!query) return
        
        console.log('🔍 Search initiated:', query)
        console.log('📍 Center location:', center)
        
        setIsSearching(true)
        setAiInsight("🧠 AI analyzing your request globally...")
        setSearchTerm(query)
        setSelectedSupplier(null)
        setRoutePath(null)

        try {
            console.log('📡 Calling /api/map-query...')
            
            // Use new advanced AI map query API
            const response = await fetch('/api/map-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, location: center, language: 'en' })
            })

            console.log('📥 Response status:', response.status)
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            console.log('📊 API Response:', data)

            setFoundSuppliers(data.places || [])
            setAiInsight(data.aiInsight || 'Search completed')
            setSuggestions(data.suggestions || [])
            setShowResults(data.places && data.places.length > 0)
            setIsSearching(false)

            console.log(`✅ Found ${data.places?.length || 0} results`)

            // Handle route visualization
            if (data.route) {
                setRoutePath(data.route)
                setShowRoutePanel(true)
            }

            // Fit bounds
            if (mapInstance && data.places && data.places.length > 0) {
                const bounds = new google.maps.LatLngBounds()
                data.places.forEach((m: any) => bounds.extend({ lat: m.lat, lng: m.lng }))
                bounds.extend(center)
                mapInstance.fitBounds(bounds)
            }
        } catch (error) {
            console.error('❌ Search error:', error)
            setAiInsight("Failed to process query. Please check console for details.")
            setIsSearching(false)
        }
    }

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input not supported in this browser')
            return
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => {
            setIsListening(true)
            setAiInsight('🎤 Listening...')
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setSearchTerm(transcript)
            setIsListening(false)
            handleSearch(transcript)
        }

        recognition.onerror = () => {
            setIsListening(false)
            setAiInsight('Voice input failed. Please try typing.')
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    const handleCategoryClick = (category: QuickCategory) => {
        setActiveCategory(category.id)
        handleSearch(category.query)
    }

    const handleReserve = () => {
        setReservationStatus('loading')
        setTimeout(() => {
            setReservationStatus('success')
            setTimeout(() => {
                setReservationStatus('idle')
                setSelectedSupplier(null)
            }, 2000)
        }, 1500)
    }

    const onLoad = useCallback((map: google.maps.Map) => {
        setMapInstance(map)
    }, [])

    const onUnmount = useCallback(() => {
        setMapInstance(null)
    }, [])

    const [sidebarData, setSidebarData] = useState<any>(null)

    if (loadError) {
        return (
            <div className="w-full h-[85vh] bg-stone-100 flex items-center justify-center rounded-[2rem] border border-stone-200 p-8 text-center">
                <div className="max-w-md">
                    <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-stone-700 mb-2">Google Maps Failed to Load</h3>
                    <p className="text-sm text-stone-500">Please check your API key configuration. For development, ensure <code className="bg-stone-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> is set.</p>
                </div>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[85vh] bg-stone-100 flex items-center justify-center rounded-[2rem] border border-stone-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Initializing Satellite Link...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[85vh] bg-stone-100 overflow-hidden flex font-sans rounded-[2rem] shadow-xl border border-stone-200 group/map-container">

            <LocationPermissionModal
                isOpen={showPermissionModal}
                onEnable={() => {
                    localStorage.setItem('leafscan_location_permission', 'granted')
                    requestLocation()
                    setShowPermissionModal(false)
                }}
                onDefault={() => {
                    localStorage.setItem('leafscan_location_permission', 'denied')
                    setShowPermissionModal(false)
                }}
            />

            {/* --- MAP AREA --- */}
            <div className={`relative h-full transition-all duration-500 ease-in-out ${isSupplierMode ? 'w-full' : 'flex-1'}`}>

                {/* 1. View Controls (Conditional) */}
                {!isSupplierMode && (
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                        {/* View Mode */}
                        <div className="flex bg-white/90 backdrop-blur shadow-sm rounded-lg p-1 border border-gray-200 pointer-events-auto self-start">
                            <button
                                onClick={() => setViewMode('roadmap')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'roadmap' ? 'bg-gray-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
                            >
                                Map
                            </button>
                            <button
                                onClick={() => setViewMode('satellite')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'satellite' ? 'bg-gray-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
                            >
                                Satellite
                            </button>
                        </div>
                    </div>
                )}

                {/* Back Button for Supplier Mode */}
                {isSupplierMode && (
                    <div className="absolute top-4 left-4 z-10">
                        <a href="/dashboard/scan" className="bg-white/90 backdrop-blur hover:bg-white text-stone-700 px-4 py-2 rounded-xl shadow-lg border border-stone-200 font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform">
                            <MapIcon className="w-4 h-4" />
                            Back to Report
                        </a>
                    </div>
                )}

                {/* AI Insight Pill */}
                {aiInsight && (
                    <div className={`absolute z-10 pointer-events-none flex justify-center w-full ${isSupplierMode ? 'top-20' : 'top-16 left-4 w-auto justify-start'}`}>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-stone-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 shadow-lg flex items-center gap-2 max-w-sm pointer-events-auto"
                        >
                            <Brain className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium">{aiInsight}</span>
                        </motion.div>
                    </div>
                )}

                {/* 2. Search / Agent Bar with Voice */}
                <div className={`absolute z-10 transition-all duration-500 ${isSupplierMode ? 'top-6 left-1/2 -translate-x-1/2 w-[500px] max-w-[90%]' : 'top-4 left-1/2 -translate-x-1/2 w-96 max-w-[90%]'}`}>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={isSearching ? "🧠 AI analyzing globally..." : (isSupplierMode ? "Search for product or supplier..." : "Ask: 'Find nearest tractor repair' or 'Route to fuel station'")}
                            className={`w-full bg-white/90 backdrop-blur border border-stone-200 rounded-xl pl-11 pr-16 text-sm text-stone-900 placeholder:text-stone-500 shadow-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium ${isSupplierMode ? 'py-4 text-base' : 'py-3'}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(e.currentTarget.value)
                            }}
                        />
                        <div className={`absolute left-3.5 z-20 text-stone-400 ${isSupplierMode ? 'top-4' : 'top-3'}`}>
                            {isSearching ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Search className="w-5 h-5 text-emerald-600" />}
                        </div>
                        {/* Voice Button */}
                        <button
                            onClick={handleVoiceInput}
                            disabled={isListening}
                            className={`absolute right-3 ${isSupplierMode ? 'top-3.5' : 'top-2.5'} p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            title="Voice Search"
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* 3. Quick Category Filters - Only in Full Mode */}
                {!isSupplierMode && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-auto max-w-[95%] overflow-x-auto pb-2 scrollbar-hide">
                        {QUICK_CATEGORIES.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-md ${
                                        activeCategory === cat.id
                                            ? `${cat.color} text-white scale-105`
                                            : 'bg-white/90 text-stone-700 hover:bg-white hover:scale-105'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* 3. Google Map */}
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={13}
                    options={{
                        mapTypeId: viewMode,
                        zoomControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        styles: viewMode === 'roadmap' ? [
                            {
                                featureType: 'poi',
                                elementType: 'labels.icon',
                                stylers: [{ visibility: 'off' }]
                            }
                        ] : []
                    }}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    {/* User Marker */}
                    <Marker
                        position={center}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#3B82F6",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        }}
                        title="Your Farm"
                    />

                    {/* Supplier Markers with Priority Colors */}
                    {foundSuppliers.map((supplier) => {
                        const priorityColors: Record<string, string> = {
                            critical: '#dc2626',  // Red
                            high: '#ea580c',      // Orange
                            medium: '#16a34a',    // Green
                            low: '#3b82f6'        // Blue
                        }
                        const color = priorityColors[supplier.priority] || '#16a34a'
                        
                        return (
                            <Marker
                                key={supplier.id}
                                position={{ lat: supplier.lat, lng: supplier.lng }}
                                onClick={() => setSelectedSupplier(supplier)}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 12,
                                    fillColor: color,
                                    fillOpacity: 1,
                                    strokeColor: '#ffffff',
                                    strokeWeight: 3,
                                }}
                                label={{
                                    text: String(foundSuppliers.indexOf(supplier) + 1),
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                animation={supplier.priority === 'critical' ? google.maps.Animation.BOUNCE : undefined}
                            />
                        )
                    })}

                    {/* Route Polyline */}
                    {routePath && routePath.waypoints && routePath.waypoints.length > 1 && (
                        <Polyline
                            path={routePath.waypoints.map((w: any) => ({ lat: w.lat, lng: w.lng }))}
                            options={{
                                strokeColor: '#16a34a',
                                strokeOpacity: 0.8,
                                strokeWeight: 4,
                                geodesic: true,
                                icons: [{
                                    icon: {
                                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                        scale: 3,
                                        fillColor: '#16a34a',
                                        fillOpacity: 1,
                                        strokeWeight: 1,
                                        strokeColor: '#ffffff'
                                    },
                                    offset: '100%',
                                    repeat: '100px'
                                }]
                            }}
                        />
                    )}

                    {/* Info Window */}
                    {selectedSupplier && (
                        <InfoWindow
                            position={{ lat: selectedSupplier.lat, lng: selectedSupplier.lng }}
                            onCloseClick={() => {
                                setSelectedSupplier(null)
                                setReservationStatus('idle')
                            }}
                        >
                            <div className="p-3 min-w-[260px] max-w-[300px] font-sans">
                                {/* Header: Name & Open Status */}
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-base leading-tight">{selectedSupplier.name}</h3>
                                    {selectedSupplier.open_now !== undefined && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${selectedSupplier.open_now ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {selectedSupplier.open_now ? 'OPEN' : 'CLOSED'}
                                        </span>
                                    )}
                                </div>

                                {/* Address */}
                                <p className="text-[11px] text-stone-500 mb-3 leading-snug">{selectedSupplier.address}</p>

                                {/* Tags & Rating */}
                                <div className="flex items-center flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded shadow-sm border border-emerald-200">{selectedSupplier.type}</span>

                                    {selectedSupplier.rating && (
                                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs font-bold text-stone-700">{selectedSupplier.rating}</span>
                                            <span className="text-[10px] text-stone-400">({selectedSupplier.user_ratings_total || 0})</span>
                                        </div>
                                    )}
                                </div>

                                {/* AI Description */}
                                <p className="text-xs text-stone-600 mb-4 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100 italic relative">
                                    <Brain className="w-3 h-3 text-emerald-400 absolute top-2 right-2 opacity-50" />
                                    "{selectedSupplier.description}"
                                </p>

                                {/* details list */}
                                <div className="space-y-2 text-xs text-stone-600 mb-4">
                                    {selectedSupplier.phone && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                                <Phone className="w-3 h-3" />
                                            </div>
                                            <span className="font-medium select-all">{selectedSupplier.phone}</span>
                                        </div>
                                    )}

                                    {selectedSupplier.website && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center text-stone-500 shrink-0">
                                                <Globe className="w-3 h-3" />
                                            </div>
                                            <a
                                                href={selectedSupplier.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline decoration-stone-300 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                            >
                                                Visit Website <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                            <ShoppingBag className="w-3 h-3" />
                                        </div>
                                        <span>Stock Level: <span className={`font-bold ${selectedSupplier.stock === 'High' ? 'text-green-600' :
                                            selectedSupplier.stock === 'Medium' ? 'text-yellow-600' :
                                                selectedSupplier.stock === 'Low' ? 'text-red-500' : 'text-stone-500'
                                            }`}>{selectedSupplier.stock}</span></span>
                                    </div>
                                </div>

                                {/* Reserve Button */}
                                <button
                                    onClick={handleReserve}
                                    disabled={reservationStatus !== 'idle'}
                                    className={`w-full text-sm font-bold py-2.5 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group ${reservationStatus === 'success'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                                        }`}
                                >
                                    {reservationStatus === 'idle' && (
                                        <>
                                            <span>Reserve Item</span>
                                            <MapPin className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                                        </>
                                    )}
                                    {reservationStatus === 'loading' && (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Contacting Supplier...</span>
                                        </>
                                    )}
                                    {reservationStatus === 'success' && (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Reservation Sent!</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>

                {/* Results Panel */}
                <AnimatePresence>
                    {showResults && !isSupplierMode && foundSuppliers.length > 0 && (
                        <ResultsPanel
                            results={foundSuppliers}
                            onSelectResult={(result) => {
                                setSelectedSupplier(result)
                                if (mapInstance) {
                                    mapInstance.panTo({ lat: result.lat, lng: result.lng })
                                    mapInstance.setZoom(15)
                                }
                            }}
                            selectedResult={selectedSupplier}
                            onClose={() => setShowResults(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Suggestions Bar */}
                {suggestions.length > 0 && !isSupplierMode && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-6 right-4 z-10 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200 p-4 max-w-md"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                                <Brain className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">AI Suggestions</h4>
                                <ul className="space-y-1.5">
                                    {suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">→</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Legend (Bottom Left) - Conditional */}
                {!isSupplierMode && !showResults && (
                    <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur p-2 rounded-xl border border-gray-200 shadow-sm w-48">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Layers className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] font-bold uppercase text-gray-500">Overlays</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {WEATHER_LAYERS.map(layer => (
                                    <button
                                        key={layer.id}
                                        onClick={() => setActiveLayer(activeLayer === layer.id ? 'none' : layer.id)}
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${activeLayer === layer.id ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <layer.icon className={`w-3 h-3 ${layer.color.replace('text-', 'text-opacity-80 text-')}`} />
                                        {layer.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* --- SIDEBAR (Hidden in Supplier Mode) --- */}
            <AnimatePresence>
                {!isSupplierMode && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full border-l border-stone-200 bg-white shadow-xl z-20"
                    >
                        <MapSidebar data={foundSuppliers.length > 0 ? foundSuppliers[0] : sidebarData} />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
