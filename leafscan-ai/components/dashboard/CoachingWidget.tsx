'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function CoachingWidget() {
    const { system } = useAutonomy()
    const { user } = useAuth()

    const expertMode = system?.preferences?.expertMode ?? false

    // Logic: In real app, call Gemini API with 'system.logs' history
    // Here we simulate the output based on recent events
    const recentLog = system?.logs?.[0]
    const hasRain = recentLog?.event?.includes('Rain') ?? false

    if (!system || !user) {
        return (
            <div className="bg-gradient-to-br from-apeel-green to-[#2E5C3D] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    <p className="text-white/80 text-sm mt-4">Loading AI coach...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                    <Sparkles className="w-3 h-3" />
                    AI Coach
                </div>
                <button className="text-emerald-200 hover:text-white text-xs">
                    Guidance
                </button>
            </div>

            <div className="space-y-3">
                <h3 className="text-xl font-bold leading-tight">
                    {hasRain
                        ? (user?.region
                            ? `Rain detected in ${user.region.split(',')[0]}, Demo.`
                            : "Rain detected in Casablanca, Demo.")
                        : `Great progress, Demo!`}
                </h3>

                <p className="text-emerald-100 text-sm leading-relaxed">
                    {hasRain
                        ? "Your vitals are up 3% this week. Keep maintaining the current organic treatment cycle."
                        : "Your vitals are up 3% this week. Keep maintaining the current organic treatment cycle."
                    }
                </p>

                <button className="flex items-center gap-2 mt-3 text-sm font-bold text-emerald-200 hover:text-white transition-colors">
                    <span>View Full Report</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
