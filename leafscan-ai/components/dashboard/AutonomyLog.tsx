'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Clock, Zap, CloudRain, AlertTriangle } from 'lucide-react'

export default function AutonomyLog() {
    const { system, triggerEvent } = useAutonomy()

    if (!system) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-apeel-green rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm mt-4">Loading logs...</p>
                </div>
            </div>
        )
    }

    // Helper to get icon
    const getIcon = (event: string) => {
        if (event.includes('Rain')) return <CloudRain className="w-4 h-4 text-blue-500" />
        if (event.includes('Alert')) return <AlertTriangle className="w-4 h-4 text-orange-500" />
        return <Zap className="w-4 h-4 text-apeel-green" />
    }

    return (
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <span className="font-bold text-stone-600 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Autonomy Log
                </span>
                <button
                    onClick={() => triggerEvent('Weather Alert: Sudden Rain', 'Delayed irrigation by 24h to prevent runoff.')}
                    className="text-xs bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded text-stone-700 font-bold transition-colors"
                >
                    + Event
                </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto hide-scrollbar">
                {system?.logs.length === 0 && (
                    <p className="text-stone-400 text-xs text-center py-4">No events yet</p>
                )}

                {system?.logs.map((log, i) => (
                    <div key={i} className="flex gap-2 p-3 hover:bg-stone-50 rounded-lg transition-colors border border-transparent hover:border-stone-200">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                            {getIcon(log.event)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-stone-900 text-xs truncate">{log.event}</span>
                                <span className="text-xs text-stone-400 shrink-0">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-stone-600">{log.action}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
