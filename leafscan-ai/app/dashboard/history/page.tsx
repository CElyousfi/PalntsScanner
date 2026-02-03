'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAutonomy } from '@/hooks/useAutonomy'
import { History, Calendar, AlertTriangle, CheckCircle2, Map, ArrowRight, Clock, Filter, TrendingUp, Leaf, Bug, Droplet } from 'lucide-react'
import PageShell from '@/components/dashboard/PageShell'
import Image from 'next/image'

export default function HistoryPage() {
    const { system, activeProfile, refresh } = useAutonomy()
    const [filterSeverity, setFilterSeverity] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest')

    // Force refresh on mount to ensure latest data from localStorage
    useEffect(() => {
        console.log('[History Page] Refreshing data from localStorage...')
        if (refresh) {
            refresh()
        }
    }, [refresh])

    // Ensure history exists
    const allHistory = system?.history || []

    // Listen for history updates from other components
    useEffect(() => {
        const handleHistoryUpdate = (event: CustomEvent) => {
            console.log('[History Page] History updated event received! Count:', event.detail?.count)
            if (refresh) {
                refresh()
            }
        }

        window.addEventListener('historyUpdated', handleHistoryUpdate as EventListener)
        
        return () => {
            window.removeEventListener('historyUpdated', handleHistoryUpdate as EventListener)
        }
    }, [refresh])

    // Polling mechanism - check for new scans every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('leafscan_v2_system')
            if (stored) {
                const data = JSON.parse(stored)
                const storedCount = data.history?.length || 0
                const currentCount = allHistory.length
                
                if (storedCount !== currentCount) {
                    console.log('[History Page] Detected history change! Stored:', storedCount, 'Current:', currentCount)
                    if (refresh) {
                        refresh()
                    }
                }
            }
        }, 2000) // Check every 2 seconds

        return () => clearInterval(interval)
    }, [allHistory.length, refresh])
    
    // Debug log
    useEffect(() => {
        console.log('[History Page] Current history count:', allHistory.length)
        console.log('[History Page] History data:', allHistory)
    }, [allHistory])

    // Filter and sort history
    const history = useMemo(() => {
        let filtered = [...allHistory]

        // Filter by severity
        if (filterSeverity !== 'all') {
            filtered = filtered.filter(record => record.diagnosis?.severity === filterSeverity)
        }

        // Sort
        if (sortBy === 'newest') {
            filtered.sort((a, b) => b.timestamp - a.timestamp)
        } else if (sortBy === 'oldest') {
            filtered.sort((a, b) => a.timestamp - b.timestamp)
        } else if (sortBy === 'severity') {
            const severityOrder = { high: 3, medium: 2, low: 1 }
            filtered.sort((a, b) => {
                const aSev = severityOrder[a.diagnosis?.severity as keyof typeof severityOrder] || 0
                const bSev = severityOrder[b.diagnosis?.severity as keyof typeof severityOrder] || 0
                return bSev - aSev
            })
        }

        return filtered
    }, [allHistory, filterSeverity, sortBy])

    // Statistics
    const stats = useMemo(() => {
        const total = allHistory.length
        const high = allHistory.filter(r => r.diagnosis?.severity === 'high').length
        const medium = allHistory.filter(r => r.diagnosis?.severity === 'medium').length
        const low = allHistory.filter(r => r.diagnosis?.severity === 'low').length
        
        return { total, high, medium, low }
    }, [allHistory])

    return (
        <PageShell
            title="History Log"
            badge={
                <div className="bg-[#EAE8D9] text-stone-800 text-xs px-3 py-1 rounded-full font-sans uppercase tracking-wider font-bold inline-flex items-center gap-1 shadow-sm border border-stone-300/50">
                    <Clock className="w-3 h-3" />
                    Intervention Records
                </div>
            }
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                        <History className="w-8 h-8 text-apeel-green" />
                        <span className="text-3xl font-bold text-stone-800">{stats.total}</span>
                    </div>
                    <p className="text-sm text-stone-500 font-medium">Total Scans</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <span className="text-3xl font-bold text-red-600">{stats.high}</span>
                    </div>
                    <p className="text-sm text-stone-500 font-medium">High Risk</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        <span className="text-3xl font-bold text-amber-600">{stats.medium}</span>
                    </div>
                    <p className="text-sm text-stone-500 font-medium">Medium Risk</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <span className="text-3xl font-bold text-green-600">{stats.low}</span>
                    </div>
                    <p className="text-sm text-stone-500 font-medium">Low Risk</p>
                </div>
            </div>

            {/* Filters and Sort */}
            {allHistory.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">Filter:</span>
                        <select
                            value={filterSeverity}
                            onChange={(e) => setFilterSeverity(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-apeel-green"
                        >
                            <option value="all">All Severity</option>
                            <option value="high">High Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="low">Low Risk</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-apeel-green"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="severity">By Severity</option>
                        </select>
                    </div>
                    <div className="ml-auto text-sm text-stone-500">
                        Showing {history.length} of {allHistory.length} scans
                    </div>
                </div>
            )}

            {history.length === 0 && allHistory.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm text-center py-32 animate-fade-in">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('/noise.png')] mix-blend-multiply" />
                    <div className="w-24 h-24 bg-[#EAE8D9] rounded-full flex items-center justify-center mx-auto mb-8 text-stone-400">
                        <History className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-800 mb-4">No History Yet</h3>
                    <p className="text-stone-500 max-w-md mx-auto font-serif text-lg leading-relaxed">
                        Once you start tracking your crops and performing rescue actions, your intervention log will appear here.
                    </p>
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm text-center py-16 animate-fade-in">
                    <Filter className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">No Results</h3>
                    <p className="text-stone-500">No scans match your current filters. Try adjusting your selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 animate-slide-up">
                    {history.map((record) => (
                        <div key={record.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.png')] mix-blend-multiply" />

                            {/* Image Thumbnail */}
                            <div className="w-full md:w-56 h-56 flex-shrink-0 relative rounded-2xl overflow-hidden bg-stone-100 shadow-inner">
                                <img
                                    src={record.image}
                                    alt="Analysis"
                                    className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10 ${record.diagnosis?.severity === 'high' ? 'bg-rose-500 text-white' :
                                    record.diagnosis?.severity === 'medium' ? 'bg-amber-500 text-white' :
                                        'bg-emerald-500 text-white'
                                    }`}>
                                    {record.diagnosis?.severity || 'Low'} Risk
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold text-stone-800 group-hover:text-emerald-800 transition-colors">
                                                {record.diagnosis?.diseases?.[0]?.name || 'Unknown Issue'}
                                            </h3>
                                            <p className="text-sm text-stone-400 flex items-center gap-2 mt-2 font-medium">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(record.timestamp).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-stone-600 leading-relaxed line-clamp-2 mb-6 font-serif text-lg">
                                        {record.diagnosis?.diseases?.[0]?.description || 'No description available for this record.'}
                                    </p>

                                    {/* Action Results Summary */}
                                    {record.actionResult && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-700 text-xs font-bold shadow-sm">
                                                <Map className="w-3 h-3" />
                                                {record.actionResult.suppliers?.length || 0} Suppliers Found
                                            </span>
                                            {record.actionResult.suppliers?.[0] && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-100 bg-green-50 text-green-700 text-xs font-bold shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Nearest: {record.actionResult.suppliers[0].distance_km}km
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end pt-4 border-t border-stone-100">
                                    {/* Link to a detailed detail view */}
                                    <button
                                        onClick={() => window.location.href = `/dashboard/history/${record.id}`}
                                        className="text-sm font-bold text-stone-500 flex items-center gap-2 hover:text-emerald-700 hover:gap-3 transition-all"
                                    >
                                        View Full Report <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Diagnostic Footer */}
            <div className="mt-12 pt-8 border-t border-stone-200 text-center">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 inline-block">
                    <div className="flex items-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-stone-600 font-medium">Storage: Active</span>
                        </div>
                        <div className="text-stone-400">|</div>
                        <div className="text-stone-600 font-mono">
                            Total Records: <span className="font-bold text-apeel-green">{allHistory.length}</span>
                        </div>
                        <div className="text-stone-400">|</div>
                        <div className="text-stone-600 font-mono text-xs">
                            Profile: {activeProfile?.name || 'Default'}
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                console.log('[History Page] Manual refresh triggered')
                                if (refresh) {
                                    refresh()
                                }
                                // Force re-render
                                setFilterSeverity('all')
                                setSortBy('newest')
                            }}
                            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors text-sm font-medium"
                        >
                            Refresh Data
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard/scan'}
                            className="px-4 py-2 bg-apeel-green hover:bg-apeel-dark text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            New Scan
                        </button>
                    </div>
                </div>
                <p className="mt-6 text-xs text-stone-400">
                    All scans are stored locally and persist across sessions
                </p>
            </div>
        </PageShell>
    )
}
