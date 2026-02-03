'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import MonitoringDashboard from '@/components/MonitoringDashboard'
import { ArrowRight, Leaf, Loader2 } from 'lucide-react'
import { FarmSession, FarmHistoryEntry } from '@/lib/farm-session'
import { useAutonomy } from '@/hooks/useAutonomy'
import { saveGrowthEntry } from '@/lib/store'
import { GrowthEntry } from '@/types'

export default function TrackerPage() {
    const router = useRouter()
    const { activeProfile, system } = useAutonomy()
    const [isUploading, setIsUploading] = useState(false)

    // Map existing activeProfile to legacy FarmSession for compatibility with MonitoringDashboard
    const session = useMemo<FarmSession | null>(() => {
        if (!activeProfile) return null;

        // Map History
        const mappedHistory: FarmHistoryEntry[] = (activeProfile.growthHistory || []).map(entry => ({
            date: entry.date,
            disease: entry.diagnosis?.diseases?.[0] || 'Healthy',
            infectionRate: 100 - (entry.healthMetrics?.vigor || 100),
            sustainability: 50 + (entry.healthMetrics?.waterSavedLiters || 0) * 0.1,
            savedKg: entry.healthMetrics?.yieldEstimateKg || 0,
            savedMoney: (entry.healthMetrics?.yieldEstimateKg || 0) * 1.5,
            actionTaken: entry.userNotes || 'Routine Check'
        }));

        // Ensure at least one entry exists if history is empty
        if (mappedHistory.length === 0) {
            mappedHistory.push({
                date: activeProfile.startDate,
                disease: 'Initial',
                infectionRate: 0,
                sustainability: 50,
                savedKg: 0,
                savedMoney: 0,
                actionTaken: 'Planting'
            })
        }

        return {
            id: activeProfile.id,
            crop: activeProfile.cropType,
            startDate: activeProfile.startDate,
            lastUpdate: mappedHistory.length > 0
                ? mappedHistory[mappedHistory.length - 1].date
                : activeProfile.startDate,
            location: activeProfile.location.city,
            history: mappedHistory,
            // Mock plan for visual compatibility
            plan: {
                cropType: activeProfile.cropType,
                initialDiagnosis: { diseases: [] },
                visualGuides: system?.visualCache || {}
            },
            status: 'active'
        }
    }, [activeProfile, system?.visualCache]);

    const handleFollowUp = async (day: number, file: File) => {
        if (!activeProfile) return

        setIsUploading(true)
        try {
            // 1. Simulate Upload (In real app, upload to blob/S3)
            // For now, create a local URL for immediate display
            const photoUrl = URL.createObjectURL(file)

            // 2. Create new GrowthEntry
            const newEntry: GrowthEntry = {
                date: new Date().toISOString(),
                stage: activeProfile.currentStage,
                photoUrl: photoUrl,
                healthMetrics: {
                    vigor: 95, // Mock improvement for demo
                    humidityOptimum: '60-80%',
                    currentHumidity: 65,
                    waterSavedLiters: 5,
                    yieldEstimateKg: 10
                },
                userNotes: 'Routine Check-in',
                diagnosis: {
                    diseases: [],
                    pests: [],
                    severity: 'low'
                }
            }

            // 3. Save to Store
            saveGrowthEntry(newEntry, activeProfile.id)

            // Note: Store update triggers re-render via useAutonomy
        } finally {
            setIsUploading(false)
        }
    }

    const handleReset = () => {
        if (confirm('Are you sure you want to start a new crop cycle? This will clear your current history.')) {
            // For now, maybe just redirect to scan
            router.push('/dashboard/scan')
        }
    }

    if (!system) {
        return (
            <div className="min-h-screen bg-apeel-cream flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-apeel-green" />
                    <p className="text-apeel-green font-bold">Syncing farm data...</p>
                </div>
            </div>
        )
    }

    if (!activeProfile) {
        return (
            <div className="min-h-screen bg-apeel-cream flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-xl border border-apeel-green/10">
                    <div className="w-20 h-20 bg-apeel-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-apeel-green">
                        <Leaf className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-apeel-green mb-4">No Active Crop</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Start a new diagnosis to create a monitoring plan and track your farm&apos;s health.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/scan')}
                        className="w-full btn-primary bg-apeel-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                        Start Diagnosis <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full mt-4 text-gray-500 font-bold text-sm hover:text-apeel-green"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Guard against loading race condition
    if (!session) return <Loader2 className="animate-spin text-apeel-green mx-auto my-20" />

    return (
        <MonitoringDashboard
            session={session}
            plan={session.plan}
            onFollowUp={handleFollowUp}
            onVisualGenerated={(prompt, imageUrl) => {
                // Visual generation is handled via context/global cache mostly
                console.log('Visual generated:', prompt)
            }}
            onReset={handleReset}
            onClose={() => router.push('/dashboard')}
        />
    )
}
