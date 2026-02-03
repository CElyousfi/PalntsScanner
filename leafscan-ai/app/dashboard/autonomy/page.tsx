'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Activity, Calendar, Clock, CloudRain, Cpu, Database, History, RefreshCw, Settings, Shield, Target, TrendingUp, Zap, Radio, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AutonomyPage() {
    const { system, notifications, refresh, triggerEvent, setChatContext, toggleChat } = useAutonomy()

    // Set Dashboard Chat Context on Mount
    useEffect(() => {
        setChatContext({
            type: 'dashboard',
            contextDescription: 'User is viewing the Autonomy System Brain. Discuss system logic, horizons, and decision logs.'
        })
    }, [setChatContext])

    if (!system) return (
        <div className="flex h-[70vh] items-center justify-center flex-col gap-4 text-apeel-green/50 animate-pulse">
            <Cpu className="w-16 h-16" />
            <span className="font-serif text-xl tracking-widest uppercase">Initializing Brain...</span>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-apeel-green/10 rounded-2xl">
                            <Cpu className="w-8 h-8 text-apeel-green" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-apeel-black tracking-tight">
                                Autonomy Center
                            </h1>
                            <p className="text-gray-500 font-medium text-sm mt-1">
                                Active Intelligence System • v3.0 (Gemini Powered)
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => triggerEvent('Manual Override', 'User triggered manual system diagnostics.')}
                        className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Diagnostics
                    </button>
                    <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                        System Online
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Horizon Visualization */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Horizon Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Short Horizon */}
                        <div className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 border-b border-gray-50 relative">
                                <div className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-xs font-bold uppercase text-emerald-600 mb-1 tracking-widest">Short (24h)</h3>
                                <div className="text-4xl font-serif font-bold text-gray-900">Day {system.horizons.short.currentDay}</div>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-wider">Tactical Execution</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </div>
                                        <span>Irrigation Check</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </div>
                                        <span>Pest Scan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medium Horizon */}
                        <div className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="bg-gradient-to-br from-blue-50 to-white p-6 border-b border-gray-50 relative">
                                <div className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-xs font-bold uppercase text-blue-600 mb-1 tracking-widest">Medium (7d)</h3>
                                <div className="text-4xl font-serif font-bold text-gray-900">{system.horizons.medium.insight}</div>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-wider">Trend Analysis</p>
                                <div className="w-full h-12 flex items-end gap-1.5">
                                    {system.horizons.medium.weeklyTrends.map((val, i) => (
                                        <div key={i} style={{ height: `${val}%` }} className="flex-1 bg-blue-100 rounded-md hover:bg-blue-500 transition-colors cursor-pointer" title={`Health: ${val}%`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Long Horizon */}
                        <div className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="bg-gradient-to-br from-purple-50 to-white p-6 border-b border-gray-50 relative">
                                <div className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm">
                                    <Target className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-xs font-bold uppercase text-purple-600 mb-1 tracking-widest">Season Goal</h3>
                                <div className="text-4xl font-serif font-bold text-gray-900 capitalize">{system.horizons.long.seasonPhase}</div>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-wider">Yield Projection</p>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-2xl font-bold text-gray-700">{system.horizons.long.seasonGoals.targetYield}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase mb-1">kg / Hectare</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full w-[65%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Feed (Redesigned) */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Activity className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Neural Event Stream</h3>
                                    <p className="text-xs text-gray-500">Real-time decision logs</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Feed
                            </span>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
                            {system.logs.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>System initializing... Awaiting events.</p>
                                </div>
                            )}
                            {system.logs.map((log, i) => (
                                <div key={i} className="flex gap-4 group p-3 hover:bg-gray-50 rounded-xl transition-colors border-l-2 border-transparent hover:border-apeel-green">
                                    <div className="w-16 text-right pt-0.5">
                                        <div className="text-xs font-mono font-bold text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-apeel-green/50" />
                                            <span className="font-bold text-gray-800 text-sm">{log.event}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium pl-4 border-l border-gray-200">
                                            {log.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Config & Global Controls */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Configuration Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg shadow-gray-200/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">System Config</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Toggle Item */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Database className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">Expert Mode</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Raw Sensor Data</div>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${system.preferences.expertMode ? 'bg-apeel-green' : 'bg-gray-200'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${system.preferences.expertMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Bell className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">Auto-Alerts</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Mobile Push</div>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${system.preferences.notificationsEnabled ? 'bg-apeel-green' : 'bg-gray-200'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${system.preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Agent Status (Premium) */}
                    <div className="bg-gradient-to-br from-apeel-green to-[#1a3c2e] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-emerald-400/30 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur border border-white/10">
                                <Zap className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-2">Gemini Agent</h3>
                            <p className="text-white/60 text-sm mb-8 leading-relaxed">
                                Neural engine active. Monitoring {system.horizons.short.dailyActions.length} data points across your farm ecosystem.
                            </p>

                            <button
                                onClick={() => {
                                    setChatContext({ type: 'general', contextDescription: 'User wants to re-calibrate the agent.' })
                                    toggleChat(true)
                                }}
                                className="w-full py-4 bg-white text-apeel-green font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Open Neural Console
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
