'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

export default function VitalsWidget() {
    const { system } = useAutonomy()

    // Calculate simulated score with safe fallbacks
    const healthScore = system?.horizons?.long?.seasonGoals?.currentHealthAvg ?? 92
    const trend = system?.horizons?.medium?.insight || 'Recovering'

    // Simulating a trend line for visual (SVG) showing recovery (dip then rise)
    const trendData = [80, 75, 72, 78, 85, 88, 92]
    const points = trendData.map((val, i) => `${i * (300 / 6)},${100 - val}`).join(' ')

    if (!system) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-apeel-green rounded-full animate-spin" />
                <p className="text-gray-400 text-sm mt-4">Loading vitals...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Simple Green Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle
                        cx="64" cy="64" r="56"
                        stroke="#10B981"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={352}
                        strokeDashoffset={352 - (352 * healthScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute text-center">
                    <span className="text-4xl font-bold text-emerald-600">{healthScore}%</span>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">Health Score</p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                <span className="text-xs text-emerald-700">✓ Stable trend this week</span>
            </div>
        </div>
    )
}
