'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Map, { Source, Layer, NavigationControl, ScaleControl, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
    CloudRain, Wind, Thermometer, Droplets, Map as MapIcon,
    Satellite, Eye, Brain, Activity, Layers, Navigation
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hhcmFmeXNmIiwiYSI6ImNta3o4MWo5eDBidmIzZnM4eGtzbWZ2YjAifQ.FSxH6cWa1lqTfAgizzDzFA'

// ----- TYPES & CONFIG -----
type WeatherLayerType = 'satellite' | 'radar' | 'wind' | 'temp' | 'humidity'

interface WeatherMetric {
    id: WeatherLayerType
    label: string
    icon: any
    color: string
    unit: string
}

const WEATHER_LAYERS: WeatherMetric[] = [
    { id: 'satellite', label: 'Satellite', icon: Satellite, color: 'text-white', unit: '' },
    { id: 'radar', label: 'Radar / Precip', icon: CloudRain, color: 'text-blue-400', unit: 'mm/h' },
    { id: 'wind', label: 'Wind Speed', icon: Wind, color: 'text-gray-300', unit: 'km/h' },
    { id: 'temp', label: 'Temperature', icon: Thermometer, color: 'text-orange-400', unit: '°C' },
    { id: 'humidity', label: 'Humidity', icon: Droplets, color: 'text-teal-400', unit: '%' },
]

// Mock Data Generation for Layers (Dense Grid of Points)
const generateGridData = (type: WeatherLayerType) => {
    const features = []
    // Generate a denser grid over Morocco/North Africa for better heatmap resolution
    for (let lng = -13; lng <= -1; lng += 0.2) {
        for (let lat = 28; lat <= 37; lat += 0.2) {
            let value = 0
            // More realistic distributions (Perlin-noise-ish simulation using sin/cos)
            const noise = Math.sin(lng * 0.5) * Math.cos(lat * 0.5) + Math.random() * 0.2

            if (type === 'radar') {
                // Rain clusters
                value = Math.max(0, noise > 0.5 ? (noise - 0.5) * 100 : 0) * (Math.random() > 0.3 ? 1 : 0)
            }
            if (type === 'temp') {
                // Gradient North to South
                value = 20 + (37 - lat) * 2 + Math.random() * 2
            }
            if (type === 'humidity') {
                // Coastal (West) higher humidity
                const distToCoast = Math.abs(lng - (-10)) // rough approx
                value = Math.max(30, 90 - distToCoast * 5 - Math.random() * 10)
            }
            if (type === 'wind') {
                value = Math.abs(noise * 60) + 10
            }

            if (value > 0) {
                features.push({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [lng, lat] },
                    properties: { value, type }
                })
            }
        }
    }
    return { type: "FeatureCollection", features }
}

export default function CropThreatMap() {
    const mapRef = useRef<MapRef>(null)
    const [activeLayer, setActiveLayer] = useState<WeatherLayerType>('radar')
    const [weatherData, setWeatherData] = useState<any>(null)
    const [aiInsight, setAiInsight] = useState<string>('')
    const [isSimulating, setIsSimulating] = useState(false)

    // Data Refresh Simulation (Radar Sweep)
    useEffect(() => {
        const loadData = () => {
            const data = generateGridData(activeLayer)
            setWeatherData(data)
            updateAIInsight(activeLayer)
        }

        loadData()
        const interval = setInterval(loadData, 5000) // Live feel
        return () => clearInterval(interval)
    }, [activeLayer])

    const updateAIInsight = (layer: WeatherLayerType) => {
        const insights = {
            satellite: "Visual spectrum analysis confirms healthy vegetation density in Sector 4. No anomalies detected in canopy cover.",
            radar: "Localized heavy precipitation detected near Gharb region. Flood risk elevated for low-lying tomato crops. Drainage check recommended.",
            wind: "Strong northeasterly gusts (45km/h) detected. High risk of fungal spore dispersion from coastal regions. Recommend postponement of aerial treatments.",
            temp: "Heat stress indicators flashing for inland citrus groves (34°C). Evapotranspiration rates critical. Irrigate immediately.",
            humidity: "90% relative humidity creates ideal conditions for Late Blight. Preventive fungicide application strictly advised for potato crops."
        }
        setAiInsight(insights[layer] || "System Standby")
    }

    // Layer Styling Logic
    const getLayerStyle = useMemo(() => {
        if (activeLayer === 'satellite') return null

        // Color Scales
        const colorScale: any = {
            radar: [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(0, 0, 255, 0.1)',
                0.4, 'rgba(0, 100, 255, 0.5)',
                0.6, 'rgba(50, 200, 255, 0.8)',
                1, 'rgba(255, 255, 255, 0.9)'
            ],
            temp: [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(255, 255, 0, 0.4)',
                0.5, 'rgba(255, 100, 0, 0.7)',
                1, 'rgba(255, 0, 0, 0.9)'
            ],
            humidity: [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(200, 255, 255, 0.3)',
                0.5, 'rgba(0, 200, 255, 0.6)',
                1, 'rgba(0, 0, 255, 0.8)'
            ],
            wind: [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(200, 200, 200, 0.3)',
                0.5, 'rgba(255, 255, 255, 0.6)',
                1, 'rgba(255, 255, 255, 0.9)'
            ]
        }

        return {
            id: 'weather-layer',
            type: 'heatmap',
            paint: {
                // INCREASE WEIGHT: Map the 'value' property to weight (0 to 1)
                'heatmap-weight': [
                    'interpolate', ['linear'], ['get', 'value'],
                    0, 0,
                    100, 1
                ],
                // INCREASE INTENSITY: Make it visible at all zoom levels
                'heatmap-intensity': [
                    'interpolate', ['linear'], ['zoom'],
                    0, 1,
                    9, 3
                ],
                // RADIUS: Adjust for coverage
                'heatmap-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    0, 10,
                    9, 40
                ],
                'heatmap-opacity': 0.75,
                'heatmap-color': colorScale[activeLayer]
            }
        }
    }, [activeLayer])

    return (
        <div className="relative w-full h-[700px] bg-gray-950 overflow-hidden flex font-sans rounded-[2.5rem] shadow-2xl border border-stone-200">

            {/* --- LEFT SIDEBAR (Weather Command) --- */}
            <div className="absolute left-6 top-6 bottom-6 w-64 z-20 flex flex-col gap-4 pointer-events-none">

                {/* 1. Menu Card */}
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl pointer-events-auto">
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                        <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                            <Layers className="w-4 h-4 text-apeel-green" /> WEATHER LAYERS
                        </h2>
                    </div>

                    <div className="flex flex-col gap-1">
                        {WEATHER_LAYERS.map((layer) => (
                            <button
                                key={layer.id}
                                onClick={() => setActiveLayer(activeLayer === layer.id ? 'satellite' : layer.id)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all ${activeLayer === layer.id
                                    ? 'bg-apeel-green text-black font-bold shadow-lg scale-[1.02]'
                                    : 'hover:bg-white/10 text-gray-400'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <layer.icon className={`w-5 h-5 ${activeLayer === layer.id ? 'text-black' : layer.color}`} />
                                    <span className="text-sm">{layer.label}</span>
                                </div>
                                {activeLayer === layer.id && (
                                    <motion.div layoutId="active-dot" className="w-2 h-2 bg-black rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. AI Weather Analyst Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl pointer-events-auto flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-4 text-apeel-green">
                        <Brain className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-bold tracking-widest">SATELLITE INTELLIGENCE</span>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-gray-200 leading-relaxed font-light">
                            {aiInsight}
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>CONFIDENCE</span>
                            <span className="text-white font-bold">98.4%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-apeel-green w-[98%]" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- RIGHT SIDEBAR (Region Info / Legend) --- */}
            <div className="absolute right-6 top-6 z-20 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 text-white border border-white/10 flex items-center gap-4 text-xs font-mono pointer-events-auto">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        LIVE
                    </span>
                    <span className="text-white/50">|</span>
                    <span>CASABLANCA, MA</span>
                    <span className="text-white/50">|</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* --- MAP --- */}
            <div className="flex-1 relative">
                <Map
                    ref={mapRef}
                    initialViewState={{ longitude: -7.6, latitude: 33.6, zoom: 6 }}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                >
                    {/* 3D Terrain Source */}
                    <Source
                        id="mapbox-dem"
                        type="raster-dem"
                        url="mapbox://mapbox.mapbox-terrain-dem-v1"
                        tileSize={512}
                        maxzoom={14}
                    />

                    {/* Layer Visualization */}
                    {activeLayer !== 'satellite' && weatherData && (
                        <Source type="geojson" data={weatherData}>
                            <Layer {...getLayerStyle as any} />
                        </Source>
                    )}

                    <NavigationControl position="bottom-right" />
                    <ScaleControl />
                </Map>
            </div>

        </div>
    )
}
