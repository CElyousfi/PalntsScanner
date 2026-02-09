'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { useNotes } from '@/context/NotesContext'
import DiagnosisReport from '@/components/DiagnosisReport'
import ProduceReport from '@/components/ProduceReport'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HistoricalAnalysis, updateHistoryEntry } from '@/lib/store'
import { saveNote } from '@/lib/notesStore'
import { FarmNote } from '@/types/notes'
import { useAuth } from '@/context/AuthContext'

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { system, setChatContext, toggleChat } = useAutonomy()
    const { setActiveNote } = useNotes()
    const { user } = useAuth()
    const [record, setRecord] = useState<HistoricalAnalysis | null>(null)
    const [loading, setLoading] = useState(true)

    const handleCreateNote = async (scanId: string) => {
        // Build comprehensive note content from the historical record
        const scanDate = new Date(record!.timestamp).toLocaleDateString()
        const scanType = record!.scanType === 'leaf' ? 'Leaf Scan' : 'Crop Scan'
        
        // Generate descriptive title
        let noteTitle = `${scanType} Analysis - ${scanDate}`
        if (record!.scanType === 'crop' && record!.produceResults) {
            const varietyName = record!.produceResults.variety?.name || 'Produce'
            const qualityScore = record!.produceResults.overall_quality_score
            noteTitle = `${varietyName} - Quality ${qualityScore}/100 - ${scanDate}`
        } else if (record!.scanType === 'leaf' && record!.diagnosis) {
            const cropType = record!.diagnosis.cropType || 'Plant'
            const severity = record!.diagnosis.diseases?.[0]?.name || 'Health Check'
            noteTitle = `${cropType} - ${severity} - ${scanDate}`
        }
        
        // Build cells based on scan type
        const cells = [
            {
                id: `cell_${Date.now()}_0`,
                type: 'image',
                content: `${record!.image}|||${scanType} Analysis - ${scanDate}`,
                metadata: {}
            }
        ]

        if (record!.scanType === 'leaf' && record!.diagnosis) {
            // LEAF SCAN CELLS
            const diagnosis = record!.diagnosis
            cells.push({
                id: `cell_${Date.now()}_1`,
                type: 'markdown',
                content: `# ${diagnosis.cropType || 'Plant'} Diagnosis\n\n**Scan ID:** ${scanId}  \n**Date:** ${scanDate}  \n**Severity:** ${diagnosis.severity?.toUpperCase() || 'N/A'}\n\n## Detected Issues\n\n${diagnosis.diseases && diagnosis.diseases.length > 0 ? diagnosis.diseases.map((d: any) => `- **${d.name || d}** ${d.confidence ? `(${Math.round(d.confidence * 100)}% confidence)` : ''}\n  ${d.description ? `  _${d.description}_` : ''}`).join('\n') : '✅ No diseases detected'}\n\n## Symptoms Observed\n\n${diagnosis.symptoms && diagnosis.symptoms.length > 0 ? diagnosis.symptoms.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') : 'No specific symptoms listed'}\n\n## Likely Causes\n\n${diagnosis.causes && diagnosis.causes.length > 0 ? diagnosis.causes.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') : 'Causes not identified'}`,
                metadata: {}
            })

            cells.push({
                id: `cell_${Date.now()}_2`,
                type: 'markdown',
                content: `## Recommended Treatments\n\n### Immediate Actions\n${diagnosis.interventionPlan?.immediate?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') || 'None specified'}\n\n### Short-term Actions\n${diagnosis.interventionPlan?.shortTerm?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') || 'None specified'}\n\n### Long-term Prevention\n${diagnosis.interventionPlan?.longTerm?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') || 'None specified'}`,
                metadata: {}
            })
        } else if (record!.scanType === 'crop' && record!.produceResults) {
            // PRODUCE SCAN CELLS
            const produce = record!.produceResults
            cells.push({
                id: `cell_${Date.now()}_1`,
                type: 'markdown',
                content: `# ${produce.variety?.name || 'Produce'} Analysis\n\n**Scan ID:** ${scanId}  \n**Date:** ${scanDate}  \n**Quality Score:** ${produce.overall_quality_score}/100  \n**Confidence:** ${produce.grading?.grading_confidence}%\n\n## Physical Measurements\n- **Weight:** ${produce.estimates?.weight_g || produce.grading?.estimated_weight_g || 'N/A'}g\n- **Diameter:** ${produce.estimates?.diameter_mm || produce.grading?.estimated_diameter_mm || 'N/A'}mm\n- **Size Class:** ${produce.estimates?.size_class || 'N/A'}\n- **Shelf Life:** ${produce.shelf_life || produce.estimates?.shelf_life_days || produce.shelf_life_estimate || 'N/A'} days\n\n## Grading\n- **EU Grade:** ${produce.grading?.grade_eu || 'N/A'}\n- **USDA Grade:** ${produce.grading?.grade_usda || 'N/A'}\n- **Color Maturity:** ${produce.grading?.color_maturity_score || 'N/A'}/100\n- **Firmness:** ${produce.grading?.firmness_assessment || 'N/A'}`,
                metadata: {}
            })

            if (produce.areas && produce.areas.length > 0) {
                cells.push({
                    id: `cell_${Date.now()}_2`,
                    type: 'markdown',
                    content: `## Detected Defects (${produce.areas.length})\n\n${produce.areas.map((area: any, i: number) => `### Defect #${i + 1}: ${area.description}\n- **Severity:** ${area.severity}\n- **Type:** ${area.defect_type}\n- **Confidence:** ${area.confidence}%\n- **Size:** ${area.size_percent}% of surface\n- **Cause:** ${area.inferred_cause || 'Unknown'}\n- **Depth:** ${area.depth_inference || 'Not assessed'}\n- **Impact on shelf life:** ${area.impact_on_shelf_life || 'Not assessed'}\n`).join('\n')}`,
                    metadata: {}
                })
            }
        }

        // Add analysis notes cell
        cells.push({
            id: `cell_${Date.now()}_notes`,
            type: 'markdown',
            content: `## My Analysis Notes\n\nAdd your observations and notes here...\n\n`,
            metadata: {}
        })

        // Generate unique note ID
        const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const notebook = {
            id: noteId,
            title: noteTitle,
            cells: cells,
            metadata: {
                created: new Date(),
                modified: new Date(),
                tags: ['scan-linked', record!.scanType],
                version: '1.0',
                scanId: scanId,
                scanType: record!.scanType,
                image: record!.image,
                scanData: record!.scanType === 'leaf' ? record!.diagnosis : record!.produceResults
            }
        }
        
        // Create the complete note directly with all content
        const newNote: FarmNote = {
            id: noteId,
            title: notebook.title,
            content: JSON.stringify(notebook, null, 2),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: ['scan-linked', record!.scanType],
            folder: 'reports',
            isPinned: false,
            scanId: scanId,
            metadata: {
                wordCount: JSON.stringify(notebook).length,
                lastEditedBy: user?.id || 'guest'
            }
        }
        
        // Save the note with full content to localStorage
        saveNote(newNote)
        // Set as active note
        setActiveNote(newNote)
        
        // Navigate to notes page (it will reload notes from localStorage)
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
