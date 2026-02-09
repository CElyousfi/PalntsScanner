'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'
import DiagnosisReport from '@/components/DiagnosisReport'
import GrowthLoader from '@/components/loader/GrowthLoader'
import TreatmentPlanner from '@/components/TreatmentPlanner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useAutonomy } from '@/hooks/useAutonomy'
import { DiagnosisResult, ActionRescueResult } from '@/types'
import { saveSystemState, saveAnalysisToHistory, saveAnalysisToHistoryAsync, updateHistoryEntry, saveGrowthEntry } from '@/lib/store'
import PageShell from '@/components/dashboard/PageShell'
import { Leaf, Apple, Sparkles, AlertTriangle } from 'lucide-react'

// Lazy load ProduceReport for better performance
const ProduceReport = dynamic(() => import('@/components/ProduceReport'), {
    loading: () => <GrowthLoader mode="crop" stage="visual" />
})

type ScanMode = 'leaf' | 'crop'

export default function UnifiedScanPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const { system, refresh, toggleChat, setChatContext } = useAutonomy()

    // Mode state - check URL param first
    const [mode, setMode] = useState<ScanMode>('leaf')

    // Scan State (shared between modes)
    const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload')
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [validationError, setValidationError] = useState<{ title: string, message: string } | null>(null)

    // Leaf scan state
    const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
    const [actionResult, setActionResult] = useState<ActionRescueResult | null>(null)
    const [currentScanId, setCurrentScanId] = useState<string | null>(null)
    const [showGrowthSaved, setShowGrowthSaved] = useState(false)

    // Crop scan state
    const [produceResults, setProduceResults] = useState<any>(null)

    // UI state
    const [isPlannerOpen, setIsPlannerOpen] = useState(false)
    const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined)

    const resultsRef = useRef<HTMLDivElement>(null)

    // Check URL params on mount
    useEffect(() => {
        const urlMode = searchParams?.get('mode')
        if (urlMode === 'crop') {
            setMode('crop')
        }
    }, [searchParams])

    // Auto-scroll to results
    useEffect(() => {
        if (step === 'result') {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }, [step])

    const handleUpload = async (file: File) => {
        setValidationError(null)

        // 1. Client-side Fast Checks
        if (file.size > 10 * 1024 * 1024) { // 10MB
            setValidationError({
                title: "File too large",
                message: "Please upload an image smaller than 10MB."
            })
            return
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setValidationError({
                title: "Invalid file type",
                message: "Please upload a JPG, PNG, or WebP image."
            })
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            setUploadedImage(base64)
            setStep('analyzing')

            // 2. AI Preflight Check
            try {
                const preflightRes = await fetch('/api/analyze-preflight', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64, mode })
                })
                const preflight = await preflightRes.json()

                if (!preflight.ok) {
                    setStep('upload')
                    setValidationError({
                        title: "We couldn't verify this image",
                        message: preflight.reason || `This doesn't look like a ${mode === 'leaf' ? 'plant leaf' : 'produce item'}. Please ensure the subject is centered and clearly visible.`
                    })
                    return
                }

                // 3. Proceed to Full Analysis
                if (mode === 'leaf') {
                    await analyzeLeaf(base64)
                } else {
                    await analyzeCrop(base64)
                }

            } catch (err) {
                console.error("Preflight failed, failing open:", err)
                // If preflight fails technically, we allow it to proceed (fail open)
                if (mode === 'leaf') {
                    await analyzeLeaf(base64)
                } else {
                    await analyzeCrop(base64)
                }
            }
        }
        reader.readAsDataURL(file)
    }

    const analyzeLeaf = async (base64: string) => {
        try {
            // Use surgical precision endpoint for leaf diagnosis
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
                            actionResult: null,
                            scanType: 'leaf',
                            notes: ''
                        }).catch(err => {
                            console.error('[Scan] Error saving to database:', err)
                            // Fallback to localStorage only
                            saveAnalysisToHistory({
                                id: scanId,
                                plantId: targetPlantId,
                                timestamp: Date.now(),
                                image: compressedImage,
                                diagnosis: diagnosisWithId,
                                actionResult: null,
                                scanType: 'leaf',
                                notes: ''
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

    const analyzeCrop = async (base64: string) => {
        try {
            const res = await fetch('/api/analyze-produce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 })
            })
            
            const data = await res.json()
            
            if (data.success) {
                setProduceResults(data.results)
                setStep('result')

                if (data.demoMode) {
                    console.log('ℹ️ Using demo data (API unavailable)')
                } else {
                    console.log('✅ Real AI analysis completed successfully')
                }

                // Save crop scan to history
                if (system) {
                    compressImage(base64).then((compressedImage) => {
                        const scanId = crypto.randomUUID()
                        setCurrentScanId(scanId)

                        const targetPlantId = system.activeProfileId || system.profiles?.[0]?.id || 'unknown'

                        // Create a minimal diagnosis for crop scans
                        const cropDiagnosis: DiagnosisResult = {
                            id: scanId,
                            cropType: data.results?.produceType || 'Produce',
                            diseases: [],
                            symptoms: [],
                            causes: [],
                            organicTreatments: [],
                            chemicalTreatments: [],
                            preventionTips: [],
                            additionalInfo: `Quality Grade: ${data.results?.grade || 'N/A'}`,
                            severity: 'low'
                        }

                        // Save to both localStorage AND Supabase
                        saveAnalysisToHistoryAsync(user?.id || '', {
                            id: scanId,
                            plantId: targetPlantId,
                            timestamp: Date.now(),
                            image: compressedImage,
                            diagnosis: cropDiagnosis,
                            actionResult: null,
                            scanType: 'crop',
                            notes: '',
                            produceResults: data.results
                        }).catch(err => {
                            console.error('[Crop Scan] Error saving to database:', err)
                            // Fallback to localStorage only
                            saveAnalysisToHistory({
                                id: scanId,
                                plantId: targetPlantId,
                                timestamp: Date.now(),
                                image: compressedImage,
                                diagnosis: cropDiagnosis,
                                actionResult: null,
                                scanType: 'crop',
                                notes: '',
                                produceResults: data.results
                            })
                        })

                        console.log('[Crop Scan] ✅ Saved to history with ID:', scanId)
                        refresh() // Refresh context to show in history
                    })
                }
            } else {
                console.error('[Crop Scan] Analysis failed:', data.error)
                alert('Crop analysis failed. Please try again.')
                setStep('upload')
            }
        } catch (error) {
            console.error('[Crop Scan] Analysis error:', error)
            alert('Network error. Please check your connection and try again.')
            setStep('upload')
        }
    }

    const handleReset = () => {
        setStep('upload')
        setUploadedImage(null)
        setDiagnosis(null)
        setActionResult(null)
        setProduceResults(null)
        setChatInitialQuery(undefined)
        setValidationError(null)
    }

    const handleModeSwitch = (newMode: ScanMode) => {
        setMode(newMode)
        handleReset()
    }

    return (
        <PageShell
            title={
                <div className="flex items-center gap-3">
                    {mode === 'leaf' ? <Leaf className="w-8 h-8 text-apeel-green" /> : <Apple className="w-8 h-8 text-apeel-green" />}
                    <div>
                        <h1 className="text-2xl font-serif font-bold">
                            {mode === 'leaf' ? 'Leaf Diagnosis' : 'Produce Grader'}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {mode === 'leaf' ? 'AI-Powered Plant Health Analysis' : 'Surgical-Level Quality Assessment'}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => handleModeSwitch('leaf')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === 'leaf'
                                    ? 'bg-apeel-green text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4" />
                                Leaf Scan
                            </div>
                        </button>
                        <button
                            onClick={() => handleModeSwitch('crop')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === 'crop'
                                    ? 'bg-apeel-green text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Apple className="w-4 h-4" />
                                Crop Scan
                            </div>
                        </button>
                    </div>

                    {mode === 'leaf' && system && (
                        <p className="text-sm text-gray-600">
                            Target: <span className="text-apeel-green font-bold">{system.profiles.find(p => p.id === system.activeProfileId)?.name || 'Loading...'}</span>
                        </p>
                    )}
                </div>
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

                {/* Main Content Card */}
                <div className="card min-h-[500px] flex items-center justify-center relative overflow-hidden">
                    {step === 'upload' && (
                        <div className="w-full max-w-xl z-10 flex flex-col gap-6">
                            {validationError && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-fade-in text-left">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-red-900">{validationError.title}</h3>
                                            <p className="text-red-700 text-sm">{validationError.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <ImageUpload onImageUpload={handleUpload} />

                            {/* Mode-specific info */}
                            {mode === 'crop' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        What We Detect
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800">
                                        <div>• Russeting</div>
                                        <div>• Stem cracks</div>
                                        <div>• Punctures</div>
                                        <div>• Bruises</div>
                                        <div>• Rot & decay</div>
                                        <div>• Scald</div>
                                        <div>• Bitter pit</div>
                                        <div>• Scab</div>
                                        <div>• Lenticel breakdown</div>
                                        <div>• Color defects</div>
                                        <div>• Shape abnormalities</div>
                                        <div>• And more...</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <GrowthLoader mode={mode} />
                    )}

                    {/* Leaf Scan Results */}
                    {step === 'result' && mode === 'leaf' && diagnosis && (
                        <div className="w-full z-10" id="results" ref={resultsRef}>
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
                                onReset={handleReset}
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
                                        }
                                    })
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

                    {/* Crop Scan Results */}
                    {step === 'result' && mode === 'crop' && uploadedImage && produceResults && (
                        <div className="w-full z-10" id="results" ref={resultsRef}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-900">Analysis Complete</h2>
                                    <p className="text-gray-600">Surgical-level precision grading</p>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-apeel-green text-white rounded-2xl hover:bg-apeel-green/90 transition-all font-bold shadow-lg"
                                >
                                    Scan Another
                                </button>
                            </div>

                            <ProduceReport
                                image={uploadedImage}
                                results={produceResults}
                                onClose={handleReset}
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
