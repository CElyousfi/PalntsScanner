import React from 'react'
import {
    Sprout, Droplets, Tractor, Calendar, ArrowRight, Layers,
    Ruler, Map as MapIcon, ChevronRight, Wind, CloudRain,
    Thermometer, AlertTriangle, Activity, Zap, MousePointerClick
} from 'lucide-react'

// Mock Weather Data (In a real app, this would come from an API)
const WEATHER_CURRENT = {
    temp: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    wind: 12,
    precip: 0
}

interface MapSidebarProps {
    data?: {
        cropType: string
        confidence: string
        size: string
        sownDate: string
        harvestDate: string
    } | null
}

export default function MapSidebar({ data }: MapSidebarProps) {
    if (!data) return (
        <div className="w-80 h-full bg-white/90 backdrop-blur-md border-l border-white/20 flex flex-col items-center justify-center text-gray-400 p-8 text-center shadow-2xl">
            <div className="p-4 bg-gray-50 rounded-full mb-4 animate-pulse">
                <MapIcon className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">Select a field to view details</p>
        </div>
    )

    return (
        <div className="w-96 h-full bg-white/90 backdrop-blur-xl border-l border-white/20 flex flex-col overflow-y-auto shadow-2xl font-sans">
            {/* Header */}
            <div className="p-6 border-b border-gray-100/50 bg-gradient-to-b from-white/50 to-transparent">
                <button className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 hover:text-emerald-700 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    Back to Map
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Douar Laottam</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Field ID: 243-546 • Active</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold border border-green-200 shadow-sm animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        LIVE
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* 1. Live Conditions */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-gray-400" />
                        Current Conditions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                <Thermometer className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Temp</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{WEATHER_CURRENT.temp}°C</span>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-gray-500">
                                <Wind className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Wind</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{WEATHER_CURRENT.wind} <span className="text-xs font-normal text-gray-500">km/h</span></span>
                        </div>
                    </div>
                </section>

                {/* 2. Field Analysis */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        Field Analysis
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <Sprout className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">{data.cropType}</span>
                                    <span className="text-xs text-gray-400">{data.confidence} Confidence</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-bold text-gray-900">{data.size}</span>
                                <span className="text-xs text-gray-400">Acres</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-50" />

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-gray-400 block mb-1">Growth Stage</span>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[70%]" />
                                </div>
                                <span className="text-emerald-600 font-bold mt-1 block">Vegetative</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-1">Soil Moisture</span>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[45%]" />
                                </div>
                                <span className="text-blue-600 font-bold mt-1 block">Good (45%)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Active Alerts */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                        Active Risks
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Moderate Fungal Risk</h4>
                                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                                    High humidity levels detected. preventive fungicide recommended within 48h.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Quick Actions */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center gap-2 text-center">
                            <MousePointerClick className="w-5 h-5" />
                            Log Scout
                        </button>
                        <button className="p-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all hover:shadow-md flex flex-col items-center gap-2 text-center">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Schedule
                        </button>
                    </div>
                </section>

                {/* Footer Meta */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between text-[10px] text-gray-400 uppercase font-medium tracking-wider">
                    <span>Last Synced: Just now</span>
                    <span>Source: Sentinel-2</span>
                </div>
            </div>
        </div>
    )
}
