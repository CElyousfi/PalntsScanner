'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAutonomy } from '@/hooks/useAutonomy'
import { useAuth } from '@/context/AuthContext'
import { useNotes } from '@/context/NotesContext'
import { History, Calendar, AlertTriangle, CheckCircle2, Map, ArrowRight, Clock, Filter, TrendingUp, Leaf, Bug, Droplet, FileText, Save, Apple } from 'lucide-react'
import PageShell from '@/components/dashboard/PageShell'
import Image from 'next/image'
import { updateAnalysisNotes } from '@/lib/store'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
    const { system, activeProfile, refresh } = useAutonomy()
    const { user } = useAuth()
    const { createNote, updateNote } = useNotes()
    const router = useRouter()
    const [filterSeverity, setFilterSeverity] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest')
    const [editingNotes, setEditingNotes] = useState<string | null>(null)
    const [notesText, setNotesText] = useState<Record<string, string>>({})

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
            hideControls={true}
        >
            {/* Statistics Cards - Interactive Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 pt-2">
                {/* Total Scans - Reset Filter */}
                <button
                    onClick={() => setFilterSeverity('all')}
                    className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${filterSeverity === 'all'
                            ? 'border-apeel-green ring-2 ring-apeel-green/20 shadow-md'
                            : 'border-stone-100 hover:border-apeel-green/50 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <History className={`w-8 h-8 ${filterSeverity === 'all' ? 'text-apeel-green' : 'text-stone-400 group-hover:text-apeel-green transition-colors'}`} />
                        <span className="text-3xl font-bold text-stone-800">{stats.total}</span>
                    </div>
                    <p className={`text-sm font-medium ${filterSeverity === 'all' ? 'text-apeel-green' : 'text-stone-500'}`}>Total Scans</p>
                </button>

                {/* High Risk Filter */}
                <button
                    onClick={() => setFilterSeverity('high')}
                    className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${filterSeverity === 'high'
                            ? 'border-red-500 ring-2 ring-red-500/20 shadow-md'
                            : 'border-red-100 hover:border-red-300 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className={`w-8 h-8 ${filterSeverity === 'high' ? 'text-red-600' : 'text-red-400 group-hover:text-red-600 transition-colors'}`} />
                        <span className="text-3xl font-bold text-red-600">{stats.high}</span>
                    </div>
                    <p className={`text-sm font-medium ${filterSeverity === 'high' ? 'text-red-700' : 'text-stone-500'}`}>High Risk</p>
                </button>

                {/* Medium Risk Filter */}
                <button
                    onClick={() => setFilterSeverity('medium')}
                    className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${filterSeverity === 'medium'
                            ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                            : 'border-amber-100 hover:border-amber-300 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className={`w-8 h-8 ${filterSeverity === 'medium' ? 'text-amber-600' : 'text-amber-400 group-hover:text-amber-600 transition-colors'}`} />
                        <span className="text-3xl font-bold text-amber-600">{stats.medium}</span>
                    </div>
                    <p className={`text-sm font-medium ${filterSeverity === 'medium' ? 'text-amber-700' : 'text-stone-500'}`}>Medium Risk</p>
                </button>

                {/* Low Risk Filter */}
                <button
                    onClick={() => setFilterSeverity('low')}
                    className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${filterSeverity === 'low'
                            ? 'border-green-500 ring-2 ring-green-500/20 shadow-md'
                            : 'border-green-100 hover:border-green-300 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className={`w-8 h-8 ${filterSeverity === 'low' ? 'text-green-600' : 'text-green-400 group-hover:text-green-600 transition-colors'}`} />
                        <span className="text-3xl font-bold text-green-600">{stats.low}</span>
                    </div>
                    <p className={`text-sm font-medium ${filterSeverity === 'low' ? 'text-green-700' : 'text-stone-500'}`}>Low Risk</p>
                </button>
            </div>

            {/* Filters and Sort */}
            {allHistory.length > 0 && (
                <div className="flex justify-end mb-6">
                    <div className="bg-white rounded-xl p-2 shadow-sm border border-stone-100 flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2">
                            <TrendingUp className="w-4 h-4 text-stone-400" />
                            <span className="text-sm font-medium text-stone-600">Sort by:</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent text-sm font-bold text-stone-800 focus:outline-none cursor-pointer pr-2"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="severity">Highest Severity</option>
                        </select>
                        <div className="w-px h-6 bg-stone-100 mx-1"></div>
                        <div className="text-xs font-medium text-stone-400 px-2">
                            Showing {history.length} results
                        </div>
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
                                {record.scanType !== 'crop' && (
                                    <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10 ${record.diagnosis?.severity === 'high' ? 'bg-rose-500 text-white' :
                                        record.diagnosis?.severity === 'medium' ? 'bg-amber-500 text-white' :
                                            'bg-emerald-500 text-white'
                                        }`}>
                                        {record.diagnosis?.severity || 'Low'} Risk
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold text-stone-800 group-hover:text-emerald-800 transition-colors">
                                                {record.scanType === 'crop' 
                                                    ? `${record.produceResults?.variety?.name || 'Produce'} Quality Assessment`
                                                    : (record.diagnosis?.diseases?.[0]?.name || 'Unknown Issue')
                                                }
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

                                    <p className="text-stone-600 leading-relaxed line-clamp-2 mb-4 font-serif text-lg">
                                        {record.scanType === 'crop'
                                            ? `Grade: ${record.produceResults?.grading?.grade || 'N/A'} • Quality Score: ${record.produceResults?.overall_quality_score || 'N/A'}/100`
                                            : (record.diagnosis?.diseases?.[0]?.description || 'No description available for this record.')
                                        }
                                    </p>

                                    {/* Scan Type Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        {record.scanType === 'crop' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-100 bg-purple-50 text-purple-700 text-xs font-bold shadow-sm">
                                                <Apple className="w-3 h-3" />
                                                Crop Scan
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-100 bg-green-50 text-green-700 text-xs font-bold shadow-sm">
                                                <Leaf className="w-3 h-3" />
                                                Leaf Scan
                                            </span>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    <div className="mb-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-amber-900">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-sm font-bold">Notes</span>
                                            </div>
                                            {editingNotes === record.id ? (
                                                <button
                                                    onClick={async () => {
                                                        const notes = notesText[record.id] || record.notes || ''
                                                        if (!notes.trim()) {
                                                            alert('Please add some notes before saving')
                                                            return
                                                        }
                                                        
                                                        // Create a note in the notes system
                                                        const newNote = createNote('reports', record.id)
                                                        
                                                        // Create notebook structure with observations
                                                        const scanType = record.scanType === 'crop' ? 'Crop Scan' : 'Leaf Scan'
                                                        const scanDate = new Date(record.timestamp).toLocaleDateString()
                                                        
                                                        const notebook = {
                                                            id: newNote.id,
                                                            title: newNote.title,
                                                            cells: [
                                                                {
                                                                    id: `cell_${Date.now()}_0`,
                                                                    type: 'markdown',
                                                                    content: `# ${scanType} Analysis\n\n**Date:** ${scanDate}  \n**Scan ID:** ${record.id}`,
                                                                    metadata: {}
                                                                },
                                                                {
                                                                    id: `cell_${Date.now()}_1`,
                                                                    type: 'markdown',
                                                                    content: `## My Observations\n\n${notes}`,
                                                                    metadata: {}
                                                                },
                                                                {
                                                                    id: `cell_${Date.now()}_2`,
                                                                    type: 'markdown',
                                                                    content: `## Scan Results\n\n${record.scanType === 'crop' 
                                                                        ? `**Produce:** ${record.produceResults?.produceType || 'Unknown'}  \n**Quality Score:** ${record.produceResults?.overall_quality_score || 0}/100  \n**Grade:** ${record.produceResults?.grade || 'N/A'}  \n**Status:** ${record.produceResults?.consumability_status || 'Unknown'}  \n**Defects:** ${record.produceResults?.areas?.length || 0}`
                                                                        : `**Crop:** ${record.diagnosis?.cropType || 'Unknown'}  \n**Severity:** ${record.diagnosis?.severity || 'N/A'}  \n**Diseases:** ${record.diagnosis?.diseases?.join(', ') || 'None detected'}`
                                                                    }`,
                                                                    metadata: {}
                                                                }
                                                            ],
                                                            metadata: {
                                                                created: new Date(),
                                                                modified: new Date(),
                                                                tags: ['scan-linked'],
                                                                version: '1.0'
                                                            }
                                                        }
                                                        
                                                        // Update the note with notebook content
                                                        updateNote(newNote.id, {
                                                            content: JSON.stringify(notebook, null, 2)
                                                        })
                                                        
                                                        // Save to localStorage as well for backwards compatibility
                                                        await updateAnalysisNotes(user?.id || '', record.id, notes)
                                                        setEditingNotes(null)
                                                        refresh()
                                                        
                                                        // Redirect to notes page
                                                        router.push('/dashboard/notes')
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-1 bg-apeel-green text-white rounded-lg text-xs font-bold hover:bg-apeel-dark transition-colors"
                                                >
                                                    <Save className="w-3 h-3" />
                                                    Save to Notes
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingNotes(record.id)
                                                        setNotesText(prev => ({
                                                            ...prev,
                                                            [record.id]: record.notes || ''
                                                        }))
                                                    }}
                                                    className="text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                                                >
                                                    {record.notes ? 'Edit' : 'Add Note'}
                                                </button>
                                            )}
                                        </div>
                                        {editingNotes === record.id ? (
                                            <textarea
                                                value={notesText[record.id] || ''}
                                                onChange={(e) => setNotesText(prev => ({
                                                    ...prev,
                                                    [record.id]: e.target.value
                                                }))}
                                                placeholder="Add your observations, treatment notes, or any relevant information..."
                                                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="text-sm text-stone-600 italic">
                                                {record.notes || 'No notes yet. Click "Add Note" to document your observations.'}
                                            </p>
                                        )}
                                    </div>

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
