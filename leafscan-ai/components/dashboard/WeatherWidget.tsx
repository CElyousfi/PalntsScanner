'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

export default function WeatherWidget() {
    const { user } = useAuth()

    // In a real app, we would fetch this from a weather API based on user.region or coordinates
    // For now, we'll simulate it to match the "Apeel" aesthetic and local context

    const [weather, setWeather] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setWeather({
                temp: 24,
                condition: 'Partly Cloudy',
                humidity: 65,
                wind: 12, // km/h
                forecast: [
                    { day: 'Tue', icon: <Sun className="w-4 h-4 text-orange-500" />, temp: 25 },
                    { day: 'Wed', icon: <CloudRain className="w-4 h-4 text-blue-400" />, temp: 22 },
                    { day: 'Thu', icon: <Cloud className="w-4 h-4 text-gray-400" />, temp: 23 },
                ]
            })
            setLoading(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-sm h-full flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                    <Cloud className="w-8 h-8 text-gray-300 animate-pulse" />
                    <p className="text-sm text-gray-400 font-medium">Loading forecast...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden h-full flex flex-col justify-between min-h-[200px]">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-1">
                        <MapPinIcon className="w-3 h-3" />
                        {user?.region ? user.region.split(',')[0] : 'Casablanca'}
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-4xl font-bold">{weather.temp}°</h3>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{weather.condition}</span>
                            <span className="text-xs text-blue-200">H:26° L:18°</span>
                        </div>
                    </div>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
                    <Sun className="w-8 h-8 text-yellow-300" />
                </div>
            </div>

            {/* Details Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Droplets className="w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                        <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Humidity</div>
                        <div className="text-sm font-bold">{weather.humidity}%</div>
                    </div>
                </div>
                <div className="bg-black/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Wind className="w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                        <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Wind</div>
                        <div className="text-sm font-bold">{weather.wind} km/h</div>
                    </div>
                </div>
            </div>

            {/* Forecast Mini-Row */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex justify-between">
                {weather.forecast.map((day: any, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-blue-100 font-medium">{day.day}</span>
                        <div className="my-1">{day.icon}</div>
                        <span className="text-sm font-bold">{day.temp}°</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MapPinIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}
