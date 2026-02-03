'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import DiagnosisReport from '@/components/DiagnosisReport'
import LoadingScreen from '@/components/LoadingScreen'
import AIChat from '@/components/AIChat'
import TreatmentPlanner from '@/components/TreatmentPlanner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useAutonomy } from '@/hooks/useAutonomy'
import { DiagnosisResult, ActionRescueResult } from '@/types'
import { saveSystemState, saveAnalysisToHistory, saveAnalysisToHistoryAsync, updateHistoryEntry, saveGrowthEntry } from '@/lib/store'
import PageShell from '@/components/dashboard/PageShell'
import { Leaf } from 'lucide-react'

export default function ScanPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { system, refresh, toggleChat, setChatContext } = useAutonomy()

    // Scan State
    const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload')
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
    const [actionResult, setActionResult] = useState<ActionRescueResult | null>(null)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isPlannerOpen, setIsPlannerOpen] = useState(false)
    const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined)
    const [currentScanId, setCurrentScanId] = useState<string | null>(null)
    const [showGrowthSaved, setShowGrowthSaved] = useState(false)

    const handleUpload = async (file: File) => {
        setStep('analyzing')

        // Convert to Base64
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            setUploadedImage(base64)
            await analyze(base64)
        }
        reader.readAsDataURL(file)
    }

    const analyze = async (base64: string) => {
        try {
            // Use new surgical precision endpoint
            const res = await fetch('/api/analyze-surgical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    location: { city: user?.region || 'Casablanca' }
                })
            })
            const data = await res.json()
            if (data.success) {
                setDiagnosis(data.diagnosis)
                setStep('result') // Show result immediately

                // Log analysis completion (no alerts)
                if (data.diagnosis?.demoMode) {
                    console.log('ℹ️ Using demo data (API unavailable)')
                } else {
                    console.log('✅ Real AI analysis completed successfully')
                }

                // 1. Unified Save Pipeline (Ensures Context Refresh happens AFTER all storage writes)
                if (system) {
                    compressImage(base64).then((compressedImage) => {
                        // A. Save to Historical Analysis
                        const scanId = crypto.randomUUID()
                        setCurrentScanId(scanId)

                        // INJECT ID INTO DIAGNOSIS for Chat Session Isolation
                        const diagnosisWithId = { ...data.diagnosis, id: scanId }
                        setDiagnosis(diagnosisWithId) // Update UI with ID-linked diagnosis

                        // Robust Plant ID Linkage (Fallback to first profile if active is unset)
                        const targetPlantId = system.activeProfileId || system.profiles?.[0]?.id || 'unknown';

                        // Save to both localStorage AND Supabase
                        saveAnalysisToHistoryAsync(user?.id || '', {
                            id: scanId,
                            plantId: targetPlantId,
                            timestamp: Date.now(),
                            image: compressedImage,
                            diagnosis: diagnosisWithId, // Save with ID
                            actionResult: null
                        }).catch(err => {
                            console.error('[Scan] Error saving to database:', err)
                            // Fallback to localStorage only
                            saveAnalysisToHistory({
                                id: scanId,
                                plantId: targetPlantId,
                                timestamp: Date.now(),
                                image: compressedImage,
                                diagnosis: diagnosisWithId,
                                actionResult: null
                            })
                        })

                        // B. Save to Autonomy Logic (Brain)
                        const severity = data.diagnosis?.severity || 'medium'
                        const healthImpact = severity === 'high' ? -15 : severity === 'medium' ? -5 : 5
                        const newState = {
                            ...system,
                            horizons: {
                                ...system.horizons,
                                short: system.horizons.short,
                                medium: {
                                    ...system.horizons.medium,
                                    weeklyTrends: [...system.horizons.medium.weeklyTrends, system.horizons.long.seasonGoals.currentHealthAvg + healthImpact].slice(-7), // Safe update
                                    insight: healthImpact < 0 ? 'Declining' : 'Improving'
                                },
                                long: {
                                    ...system.horizons.long,
                                    seasonGoals: {
                                        ...system.horizons.long.seasonGoals,
                                        currentHealthAvg: Math.max(0, Math.min(100, system.horizons.long.seasonGoals.currentHealthAvg + healthImpact))
                                    }
                                }
                            },
                            logs: [
                                { timestamp: Date.now(), event: `Diagnosis: ${data.diagnosis.diseases[0]?.name}`, action: 'Analysis Recorded' },
                                ...system.logs
                            ].slice(0, 50)
                        }
                        saveSystemState(newState)

                        // C. Save to Growth Profile (Timeline) with Deduplication
                        // Check if we already have an entry for this exact diagnosis today to prevent spam
                        const today = new Date().toDateString()
                        const duplicate = system.profile?.growthHistory?.find(e =>
                            new Date(e.date).toDateString() === today &&
                            e.diagnosis?.diseases[0] === data.diagnosis.diseases[0]?.name
                        )

                        if (!duplicate) {
                            saveGrowthEntry({
                                date: new Date().toISOString(),
                                stage: system.profile?.currentStage || 'Early Vigor',
                                healthMetrics: {
                                    vigor: data.diagnosis.severity === 'low' ? 90 : data.diagnosis.severity === 'medium' ? 60 : 40,
                                    humidityOptimum: '60-70%',
                                    currentHumidity: data.diagnosis.waterMetrics?.currentHumidity || 65,
                                    waterSavedLiters: data.diagnosis.waterMetrics?.savedLiters || 0,
                                    yieldEstimateKg: 1000
                                },
                                diagnosis: {
                                    diseases: data.diagnosis.diseases.map((d: any) => d.name),
                                    pests: data.diagnosis.pests?.map((p: any) => p.name) || [],
                                    severity: data.diagnosis.severity
                                },
                                photoUrl: compressedImage
                            }, system.activeProfileId) // Target the currently active plant
                            console.log('[Scan Page] Growth Entry Saved to Plant:', system.activeProfileId)
                            setShowGrowthSaved(true)
                            setTimeout(() => setShowGrowthSaved(false), 4000)
                        } else {
                            console.log('[Scan Page] Duplicate entry detected, skipping timeline add.')
                        }

                        // D. FINALLY Refresh Context (Recovers all changes)
                        refresh()
                        console.log('[Scan Page] System Context Refreshed.')
                    })
                }

                // 2. AUTO-TRIGGER RESCUE ACTIONS (Parallel)
                fetch('/api/action-rescue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        diagnosis: data.diagnosis,
                        location: user?.region || 'Casablanca',
                        userCoordinates: { lat: 33.5731, lng: -7.5898 }
                    })
                })
                    .then(res => res.json())
                    .then(rescueData => {
                        if (rescueData.success) {
                            setActionResult(rescueData)
                        }
                    })
                    .catch(err => console.error('[Scan Page] Rescue action failed:', err))


            } else {
                console.error('[Scan Page] Analysis failed - no success flag')
                
                // Check if it's a rate limit error
                if (data.error === 'RATE_LIMIT_EXCEEDED') {
                    alert(`⚠️ Gemini API Rate Limit Exceeded\n\n${data.message}\n\nSuggestion: ${data.details?.suggestion || 'Wait a few minutes and try again'}`)
                } else {
                    alert('Analysis failed. Please try again.')
                }
                setStep('upload')
            }
        } catch (e) {
            console.error('[Scan Page] Analysis error:', e)
            alert('Network error. Please check your connection and try again.')
            setStep('upload')
        }

    }

    return (
        <PageShell
            title="New Diagnosis"
            badge={
                <div className="badge badge-success">
                    <Leaf className="w-4 h-4" />
                    Crop Rescue
                </div>
            }
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Growth Entry Saved Notification */}
                {showGrowthSaved && (
                    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-sm">Growth Entry Saved!</div>
                            <div className="text-xs text-white/90">Photo added to your lifecycle timeline</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                        Target Profile: <span className="text-apeel-green font-bold text-lg ml-2">{system?.activeProfileId ? system.profiles.find(p => p.id === system.activeProfileId)?.name : 'Loading...'}</span>
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-700 font-medium text-sm transition-colors">
                        Cancel
                    </button>
                </div>

                <div className="card min-h-[500px] flex items-center justify-center relative overflow-hidden">

                    {step === 'upload' && (
                        <div className="w-full max-w-xl z-10">
                            <ImageUpload onImageUpload={handleUpload} />
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <LoadingScreen step="processing" />
                    )}

                    {step === 'result' && diagnosis && (
                        <div className="w-full z-10">
                            <DiagnosisReport
                                result={diagnosis}
                                actionResult={actionResult}
                                image={uploadedImage || ''}
                                onSymptomClick={(symptom, area) => {
                                    console.log('[Scan Page] Symptom clicked:', symptom)
                                    setChatContext({
                                        type: 'diagnosis',
                                        diagnosis: diagnosis,
                                        actionResult: actionResult || undefined,
                                        initialQuestion: `I am looking at the area centered at ${area} marked as "${symptom || 'an anomaly'}". Can you analyze this specific spot in detail and explain the pathology?`
                                    })
                                    toggleChat(true)
                                }}
                                onReset={() => {
                                    setStep('upload')
                                    setDiagnosis(null)
                                    setActionResult(null)
                                    setChatInitialQuery(undefined)
                                }}
                                // IMPORTANT: We hijack "Start Monitoring" to mean "Return to Dashboard"
                                onStartMonitoring={() => router.push('/dashboard')}
                                onOpenTreatmentPlanner={() => setIsPlannerOpen(true)}
                                onOpenChat={() => {
                                    setChatContext({
                                        type: 'diagnosis',
                                        diagnosis: diagnosis,
                                        actionResult: actionResult || undefined
                                    })
                                    toggleChat(true)
                                }}
                                onVisualGenerated={(prompt, imageUrl) => {
                                    console.log('[Scan Page] Caching visual guide:', prompt.substring(0, 20) + '...')
                                    setDiagnosis(prev => {
                                        if (!prev) return null
                                        return {
                                            ...prev,
                                            visualGuides: {
                                                ...prev.visualGuides,
                                                [prompt]: imageUrl
                                            }
                                        }
                                    })

                                    // PERSIST TO STORAGE
                                    if (currentScanId) {
                                        updateHistoryEntry(currentScanId, (entry) => ({
                                            ...entry,
                                            diagnosis: {
                                                ...entry.diagnosis,
                                                visualGuides: {
                                                    ...(entry.diagnosis.visualGuides || {}),
                                                    [prompt]: imageUrl
                                                }
                                            }
                                        }))
                                    }
                                }}
                                onExploreAction={(actionContext) => {
                                    setChatContext({
                                        type: 'diagnosis',
                                        diagnosis: diagnosis,
                                        actionResult: actionResult || undefined,
                                        initialQuestion: `I want to execute the action: "${actionContext}". What are the specific steps and what supplier should I choose?`
                                    })
                                    toggleChat(true)
                                }}
                            />
                        </div>
                    )}
                </div>

                {isPlannerOpen && diagnosis && (
                    <TreatmentPlanner
                        diagnosis={diagnosis}
                        onClose={() => setIsPlannerOpen(false)}
                        onExecuteAction={(action) => {
                            setIsPlannerOpen(false)
                            setChatContext({
                                type: 'diagnosis',
                                diagnosis: diagnosis,
                                actionResult: actionResult || undefined,
                                initialQuestion: `How do I execute the treatment step: "${action}"?`
                            })
                            toggleChat(true)
                        }}
                    />
                )}
            </div>
        </PageShell>
    )
}

// Helper to compress image for storage efficiency
const compressImage = (base64: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image()
        img.src = base64
        img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = () => resolve(base64) // Fallback
    })
}
