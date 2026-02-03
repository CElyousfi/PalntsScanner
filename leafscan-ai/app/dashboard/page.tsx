'use client'

import { useEffect, memo } from 'react'
import VitalsWidget from '@/components/dashboard/VitalsWidget'
import CoachingWidget from '@/components/dashboard/CoachingWidget'
import AutonomyLog from '@/components/dashboard/AutonomyLog'
import ThreatGrid from '@/components/dashboard/ThreatGrid'
import GrowthProgressWidget from '@/components/dashboard/GrowthProgressWidget'
import IncidentWidget from '@/components/dashboard/IncidentWidget'
import PlantSwitcher from '@/components/dashboard/PlantSwitcher'
import { useRouter } from 'next/navigation'
import { useMission } from '@/context/MissionContext'
import { Search, Zap, MoreHorizontal, FileText } from 'lucide-react'

const DashboardPage = memo(function DashboardPage() {
    const { mission, isLoading } = useMission()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !mission) {
            router.push('/onboarding')
        }
    }, [isLoading, mission, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-apeel-green border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!mission) {
        return null
    }

    return (
        <div className="flex flex-col h-full p-8">
            {/* Header */}
            <div className="mb-8 animate-fade-in-down">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="badge badge-info mb-4">
                            <FileText className="w-4 h-4" />
                            Dashboard Overview
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-apeel-black">
                            Crop Command Center
                        </h1>
                        <p className="text-gray-600 mt-2">Monitor and manage your crop health in real-time</p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <PlantSwitcher />
                        <button className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-all text-gray-700 shadow-sm">
                            <MoreHorizontal className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Main Content */}
                        <div className="lg:col-span-7 space-y-6">
                            <IncidentWidget />
                            
                            <div className="card">
                                <h3 className="text-lg font-bold mb-4 text-apeel-black flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-apeel-green" />
                                    AI Intelligence
                                </h3>
                                <CoachingWidget />
                            </div>
                        </div>

                        {/* Right Column: Widgets */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Vitals Card */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-apeel-black">Live Vitals</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-gray-500">Active</span>
                                    </div>
                                </div>
                                <VitalsWidget />
                            </div>

                            {/* Growth Journey */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-apeel-black">Growth Journey</h3>
                                    <span className="badge badge-success text-xs">Stage 8</span>
                                </div>
                                <GrowthProgressWidget />
                            </div>

                            {/* Threat Grid */}
                            <div className="card cursor-pointer hover-lift" onClick={() => router.push('/dashboard/threat-map')}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-apeel-black">Threat Grid</h3>
                                    <span className="text-xs text-gray-500">24 Sensors</span>
                                </div>
                                <ThreatGrid />
                            </div>

                            <AutonomyLog />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => router.push('/dashboard/scan')}
                className="fixed bottom-8 right-8 w-16 h-16 bg-apeel-green text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-30"
            >
                <Search className="w-6 h-6" />
            </button>
        </div>
    )
})

export default DashboardPage
