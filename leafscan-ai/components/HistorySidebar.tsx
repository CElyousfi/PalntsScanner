'use client'

import { Session } from '@/types'
import { X, Clock, Sprout, ChevronRight, History, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface HistorySidebarProps {
    sessions: Session[]
    currentSessionId?: string
    isOpen?: boolean
    onClose?: () => void
    onSelectSession?: (session: Session, mode: 'analysis' | 'monitoring') => void
    onDeleteSession?: (sessionId: string) => void
    onNewAnalysis?: () => void
    onRestore?: (session: Session, mode?: 'analysis' | 'monitoring') => void
    onDelete?: (sessionId: string) => Promise<void>
}

export default function HistorySidebar({
    sessions,
    currentSessionId,
    isOpen = true,
    onClose,
    onSelectSession,
    onDeleteSession,
    onNewAnalysis,
    onRestore,
    onDelete
}: HistorySidebarProps) {

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className="fixed inset-y-0 left-0 w-80 bg-apeel-cream/95 backdrop-blur-xl border-r border-apeel-green/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out font-urbanist animate-slide-in-left">

                {/* Header */}
                <div className="p-6 border-b border-apeel-green/10 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-2 text-apeel-green">
                        <History className="w-5 h-5" />
                        <h2 className="text-xl font-bold tracking-tight">History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-apeel-green/10 rounded-full text-apeel-green/60 hover:text-apeel-green transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* New Analysis Button */}
                <div className="p-4">
                    <button
                        onClick={() => {
                            onNewAnalysis?.()
                            onClose?.()
                        }}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Sprout className="w-4 h-4" />
                        New Analysis
                    </button>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                    {sessions.length === 0 ? (
                        <div className="text-center py-12 text-apeel-green/40">
                            <p className="text-sm">No analysis history yet.</p>
                        </div>
                    ) : (
                        sessions.sort((a, b) => b.timestamp - a.timestamp).map((session) => (
                            <div
                                key={session.id}
                                className={`group relative p-4 rounded-xl border transition-all ${currentSessionId === session.id
                                    ? 'bg-white border-apeel-green shadow-md ring-1 ring-apeel-green'
                                    : 'bg-white/50 border-apeel-green/5 hover:border-apeel-green/30 hover:bg-white hover:shadow-sm'
                                    }`}
                            >
                                {/* Main Click Area (Analysis) */}
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (!session.monitoringPlan) {
                                            onSelectSession?.(session, 'analysis')
                                            onClose?.()
                                        }
                                    }}
                                >
                                    <div className="flex gap-3 pr-8">
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg bg-apeel-light overflow-hidden flex-shrink-0 border border-apeel-green/10">
                                            <img
                                                src={session.image}
                                                alt="Leaf"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-apeel-green truncate">
                                                {session.cropType || session.diagnosis.cropType || 'Unknown Crop'}
                                            </h4>
                                            <p className="text-xs text-apeel-green/60 mb-1 truncate">
                                                {session.diagnosis.diseases[0]?.name || 'Healthy'}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-apeel-green/40 font-mono uppercase tracking-wider">
                                                <Clock className="w-3 h-3" />
                                                {new Date(session.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dual Mode Selection if Marathon Active */}
                                {session.monitoringPlan && (
                                    <div className="mt-4 pt-3 border-t border-apeel-green/10 flex gap-2 animate-reveal">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSelectSession?.(session, 'analysis')
                                                onClose?.()
                                            }}
                                            className="flex-1 py-2 px-3 rounded-lg bg-white border border-apeel-green/20 hover:bg-apeel-green/5 text-xs font-bold text-apeel-green uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5"
                                        >
                                            <History className="w-3 h-3" /> Report
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSelectSession?.(session, 'monitoring')
                                                onClose?.()
                                            }}
                                            className="flex-1 py-2 px-3 rounded-lg bg-apeel-green text-white hover:bg-apeel-green/90 text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                                        >
                                            <Sprout className="w-3 h-3" /> Marathon
                                        </button>
                                    </div>
                                )}

                                {/* Delete Button (Absolute Right) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Are you sure you want to delete this session?')) {
                                            onDeleteSession?.(session.id)
                                        }
                                    }}
                                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                    title="Delete Session"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-apeel-green/10 bg-white/50 text-center">
                    <p className="text-xs text-apeel-green/40">Saved locally on your device</p>
                </div>

            </div>
        </>
    )
}
