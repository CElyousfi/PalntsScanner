'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { useNotes } from '@/context/NotesContext'
import DiagnosisReport from '@/components/DiagnosisReport'
import ProduceReport from '@/components/ProduceReport'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HistoricalAnalysis, updateHistoryEntry } from '@/lib/store'

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { system, setChatContext, toggleChat } = useAutonomy()
    const { createNote } = useNotes()
    const [record, setRecord] = useState<HistoricalAnalysis | null>(null)
    const [loading, setLoading] = useState(true)

    const handleCreateNote = (scanId: string) => {
        createNote('reports', scanId)
        router.push('/dashboard/notes')
    }

    useEffect(() => {
        if (system && params.id) {
            const found = system.history?.find(h => h.id === params.id)
            setRecord(found || null)
            setLoading(false)
        } else if (system) {
            // System loaded but no record found
            setLoading(false)
        }
    }, [system, params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apeel-green"></div>
            </div>
        )
    }

    if (!record) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Not Found</h2>
                <button
                    onClick={() => router.push('/dashboard/history')}
                    className="text-apeel-green font-bold hover:underline flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to History
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/history')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Historical Analysis</h1>
                    <p className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleDateString(undefined, {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>

            {/* Reused Report Component - Conditionally render based on scan type */}
            {record.scanType === 'crop' && record.produceResults ? (
                <ProduceReport
                    image={record.image}
                    results={record.produceResults}
                    onClose={() => router.push('/dashboard/history')}
                    scanId={record.id}
                    onCreateNote={handleCreateNote}
                />
            ) : (
                <DiagnosisReport
                    result={record.diagnosis}
                    actionResult={record.actionResult || undefined}
                    image={record.image}
                    scanId={record.id}
                    onCreateNote={handleCreateNote}
                    onSymptomClick={(symptom, area) => {
                        setChatContext({
                            type: 'diagnosis',
                            diagnosis: record.diagnosis,
                            actionResult: record.actionResult || undefined,
                            initialQuestion: `I am looking at the historical analysis from ${new Date(record.timestamp).toLocaleDateString()}. Can you explain the symptom "${symptom}" located at ${area}?`
                        })
                        toggleChat(true)
                    }}
                    onReset={() => router.push('/dashboard/scan')}
                    onStartMonitoring={() => router.push('/dashboard')}
                    onOpenTreatmentPlanner={() => {
                        // For history, we might just open chat for now or enable planner if read-only
                        setChatContext({
                            type: 'diagnosis',
                            diagnosis: record.diagnosis,
                            initialQuestion: "Can you generate a treatment plan for this past diagnosis?"
                        })
                        toggleChat(true)
                    }}
                    onOpenChat={() => {
                        setChatContext({
                            type: 'diagnosis',
                            diagnosis: record.diagnosis,
                            actionResult: record.actionResult || undefined,
                            contextDescription: `Reviewing historical scan from ${new Date(record.timestamp).toLocaleDateString()}`
                        })
                        toggleChat(true)
                    }}
                    onVisualGenerated={(prompt, imageUrl) => {
                        if (record) {
                            updateHistoryEntry(record.id, (entry) => ({
                                ...entry,
                                diagnosis: {
                                    ...entry.diagnosis,
                                    visualGuides: {
                                        ...(entry.diagnosis.visualGuides || {}),
                                        [prompt]: imageUrl
                                    }
                                }
                            }))
                            console.log('[History Page] Cached visual guide.')
                        }
                    }}
                    onExploreAction={(actionContext) => {
                        setChatContext({
                            type: 'diagnosis',
                            diagnosis: record.diagnosis,
                            actionResult: record.actionResult || undefined,
                            initialQuestion: `Reviewing past action: "${actionContext}". Was this the right choice?`
                        })
                        toggleChat(true)
                    }}
                />
            )}
        </div>
    )
}
