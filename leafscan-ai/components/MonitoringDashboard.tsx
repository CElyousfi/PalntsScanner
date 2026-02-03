'use client'

import { useState, useMemo } from 'react'
import { Calendar, CheckCircle2, Loader2, X, TrendingUp, AlertTriangle, Activity, Camera, History, Image as ImageIcon, Eye, Sparkles, Info, RefreshCw, Sprout, Map, GraduationCap, Globe } from 'lucide-react'
import { FarmSession, calculateDaysPassed, calculateEconomicImpact } from '@/lib/farm-session'
import GrowthTimeline from './GrowthTimeline'
import PlantSwitcher from './dashboard/PlantSwitcher'
import InteractiveDiagnosis from './InteractiveDiagnosis'
import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
})

interface MonitoringDashboardProps {
    session: FarmSession | null // Now driven by session
    plan: any // Fallback/Legacy support or derived from session
    onFollowUp: (day: number, file: File) => void
    onClose: () => void
    onReset?: () => void
    onVisualGenerated?: (prompt: string, imageUrl: string) => void
}

import { useAutonomy } from '@/hooks/useAutonomy'
import { saveVisualToCache } from '@/lib/store'

import { useEffect } from 'react'

export default function MonitoringDashboard({ session, plan, onFollowUp, onClose, onReset, onVisualGenerated }: MonitoringDashboardProps) {
    const { system, setChatContext } = useAutonomy() // Access Global Cache & Context
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'checkin' | 'vitals' | 'growth' | 'training' | 'map'>('overview')

    const [showCheckIn, setShowCheckIn] = useState(false)

    // Set Chat Context to Dashboard Mode
    useEffect(() => {
        setChatContext({
            type: 'dashboard',
            monitoringPlan: plan,
            contextDescription: `Dashboard for ${session?.crop}. Streak: ${session?.history.length} days.`
        })
    }, [setChatContext, plan, session])

    const [activeVisual, setActiveVisual] = useState<{ image: string, prompt: string, error?: string } | null>(null)
    const [isLoadingVisual, setIsLoadingVisual] = useState(false)

    // Derived State from Session
    const currentDay = session ? calculateDaysPassed(session.startDate) : 1
    const impacts = session ? calculateEconomicImpact(session.history) : { savedKg: 0, savedMoney: 0 }
    const latestEntry = session?.history[session.history.length - 1]
    const initialEntry = session?.history[0]

    // Community Shield Calculation
    const streak = session?.history.length || 0
    const communityProtected = Math.min(Math.floor(streak * 1.5), 50)

    // Graph Data Points
    const graphData = useMemo(() => {
        if (!session) return []
        return session.history.map((entry, i) => {
            const health = 100 - entry.infectionRate
            return {
                day: i + 1,
                health: health,
                label: `D${calculateDaysPassed(session.startDate) - (session.history.length - 1 - i)}`
            }
        })
    }, [session])

    const openVisualGuide = async (action: string) => {
        setActiveVisual(null)
        setIsLoadingVisual(true)
        setActiveVisual({ image: '', prompt: action })

        // 1. Check Global Cache (System-wide)
        if (system?.visualCache?.[action]) {
            console.log('[Dashboard] Cache Hit (Global):', action)
            setActiveVisual({ image: system.visualCache[action], prompt: action })
            setIsLoadingVisual(false)
            return
        }

        // 2. Check Plan local cache (Fallback)
        if (plan.visualGuides?.[action]) {
            setActiveVisual({ image: plan.visualGuides[action], prompt: action })
            setIsLoadingVisual(false)
            return
        }

        try {
            const res = await fetch('/api/visualize-treatment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: action,
                    type: 'guide',
                    diagnosis: plan.initialDiagnosis.diseases?.[0]?.name || plan.cropType,
                    context: 'monitoring'
                })
            })
            const data = await res.json()
            if (data.success) {
                setActiveVisual({ image: data.data, prompt: action })

                // Save to Global Cache
                saveVisualToCache(action, data.data)

                if (onVisualGenerated) {
                    onVisualGenerated(action, data.data)
                }
            } else {
                setActiveVisual({ image: '', prompt: action, error: data.error })
            }
        } catch (e) {
            console.error(e)
            setActiveVisual({ image: '', prompt: action, error: 'Network error' })
        } finally {
            setIsLoadingVisual(false)
        }
    }

    // Interactive Graph Path Generator
    const getGraphPath = (width: number, height: number) => {
        if (graphData.length < 2) {
            // Default flat line if no history
            return `M0,${height / 2} L${width},${height / 2}`
        }

        // Normalize points
        const points = graphData.map((d, i) => {
            const x = (i / (graphData.length - 1 || 1)) * width
            // health 0-100 -> y height-0
            const y = height - ((d.health / 100) * height)
            return [x, y]
        })

        // Simple straight lines for now, or curves
        return `M${points.map(p => `${p[0]},${p[1]}`).join(' L')}`
    }

    return (
        <div className="bg-apeel-cream min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-apeel-cream/95 backdrop-blur border-b border-apeel-green/10 p-4 lg:p-6 flex items-center justify-between z-20 overflow-x-auto">
                <div className="flex items-center gap-3 min-w-max">
                    <div className="w-10 h-10 bg-apeel-green rounded-xl flex items-center justify-center text-white">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif font-bold text-apeel-green">Recovery Tracker</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2 text-xs text-apeel-green/60 font-bold uppercase tracking-wider">
                                <span>Day {currentDay} of 14</span>
                                <span className="w-1 h-1 rounded-full bg-apeel-green/30" />
                            </div>
                            <div className="scale-75 origin-left -ml-2">
                                <PlantSwitcher />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`py-2 px-4 text-sm flex items-center gap-2 rounded-full transition-all font-bold ${activeTab === 'map' ? 'bg-apeel-green text-white shadow-lg' : 'bg-white text-apeel-green hover:bg-apeel-green/5'}`}
                    >
                        <Map className="w-4 h-4" /> Map
                    </button>
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`py-2 px-4 text-sm flex items-center gap-2 rounded-full transition-all font-bold ${activeTab === 'training' ? 'bg-apeel-green text-white shadow-lg' : 'bg-white text-apeel-green hover:bg-apeel-green/5'}`}
                    >
                        <GraduationCap className="w-4 h-4" /> Training
                    </button>
                    <button
                        onClick={() => setActiveTab('growth')}
                        className={`py-2 px-4 text-sm flex items-center gap-2 rounded-full transition-all font-bold ${activeTab === 'growth' ? 'bg-apeel-green text-white shadow-lg' : 'bg-white text-apeel-green hover:bg-apeel-green/5'}`}
                    >
                        <Sprout className="w-4 h-4" /> Growth
                    </button>
                    <button
                        onClick={() => setActiveTab('vitals')}
                        className={`py-2 px-4 text-sm flex items-center gap-2 rounded-full transition-all font-bold ${activeTab === 'vitals' ? 'bg-apeel-green text-white shadow-lg' : 'bg-white text-apeel-green hover:bg-apeel-green/5'}`}
                    >
                        <Activity className="w-4 h-4" /> Vitals
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-4 text-sm flex items-center gap-2 rounded-full transition-all font-bold ${activeTab === 'overview' ? 'bg-apeel-green text-white shadow-lg' : 'bg-white text-apeel-green hover:bg-apeel-green/5'}`}
                    >
                        <Calendar className="w-4 h-4" /> Plan
                    </button>
                    <button onClick={() => setShowCheckIn(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 bg-apeel-green text-white rounded-full hover:bg-emerald-600 shadow-lg shadow-apeel-green/20 transition-all">
                        <Camera className="w-4 h-4" /> Check In
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-apeel-black" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-8">

                {/* OVERVIEW & TIMELINE CONTENT */}
                {(activeTab === 'overview' || activeTab === 'timeline') && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: Stats & Health Curve */}
                        <div className="lg:col-span-8 space-y-8 animate-fade-in">
                            {/* Dynamic Greeting */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-apeel-green/5 relative overflow-hidden">
                                <h3 className="text-2xl font-serif font-bold text-apeel-green mb-2">
                                    Day {currentDay}: Action Required
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-xl">
                                    You are on track. To maintain your <strong>{streak}-day streak</strong>, complete today&apos;s inspection. Consistent monitoring is the #1 way to save yield.
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowCheckIn(true)} className="btn-primary bg-apeel-green text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-apeel-green/20">
                                        Check In Now
                                    </button>
                                    <button onClick={() => openVisualGuide('Show me a motivational summary of my farm progress')} className="px-6 py-3 rounded-xl font-bold text-apeel-green bg-apeel-green/5 hover:bg-apeel-green/10 transition-colors">
                                        View Insights
                                    </button>
                                </div>
                            </div>

                            {/* Disease Trend (Existing Logic) */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-apeel-green/5 relative overflow-hidden">
                                <h3 className="text-xl font-serif font-bold text-apeel-green flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5" /> Disease Trend (Recovery)
                                </h3>
                                <div className="h-48 relative w-full">
                                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 200" preserveAspectRatio="none">
                                        <path d={getGraphPath(400, 200)} fill="none" stroke="#10B981" strokeWidth="3" className="transition-all duration-1000 ease-out" />
                                        <path d={`${getGraphPath(400, 200)} V200 H0 Z`} fill="rgba(16, 185, 129, 0.1)" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Action Plan */}
                        <div className="lg:col-span-4 space-y-6 animate-fade-in-delayed">
                            <div className="bg-apeel-green text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                                    <Calendar className="w-5 h-5" /> Today&apos;s Protocol
                                </h3>
                                <p className="opacity-80 text-sm mb-4">Focus on consistent watering and pest inspection.</p>
                                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                    <span className="font-bold text-sm">Verify leaf integrity</span>
                                </div>
                            </div>

                            {/* ROI Card */}
                            <div className="bg-gradient-to-br from-apeel-green to-[#1a3c2e] text-white rounded-[2rem] p-8 relative overflow-hidden shadow-xl">
                                <h3 className="text-lg font-bold text-white/90 mb-1">Economic Impact</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-serif font-bold text-white">${impacts.savedMoney}</span>
                                    <span className="text-sm font-bold text-white/60">Saved</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TRAINING TAB (NEW) */}
                {activeTab === 'training' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-serif font-bold text-apeel-green">Active Learning Simulations</h2>
                            <p className="text-gray-500">Sharpen your diagnosis skills with Gemini-powered scenarios.</p>
                        </div>
                        <InteractiveDiagnosis />
                    </div>
                )}

                {/* MAP TAB (NEW) */}
                {activeTab === 'map' && (
                    <div className="animate-fade-in h-[600px] bg-white rounded-[2rem] overflow-hidden border border-apeel-green/10 shadow-lg relative">
                        <InteractiveMap
                            height="100%"
                            suppliers={[
                                // MOCK DATA FOR DASHBOARD MAP
                                { name: "Bio-Agri Maroc", type: "Organic", distance_km: 4.2, address: "Casablanca", location: { lat: 33.5531, lng: -7.6198 }, description: "Premium organic feeds and tools", price_range: "$$$", rating: 4.8 },
                                { name: "GreenLeaf Supplies", type: "General", distance_km: 1.8, address: "Casablanca", location: { lat: 33.5831, lng: -7.6398 }, description: "General farming equipment", price_range: "$", rating: 4.2 }
                            ]}
                            userLocation={{ lat: 33.5731, lng: -7.5898 }}
                        />
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-md pointer-events-none">
                            <h3 className="font-bold text-apeel-green">Resource Map</h3>
                            <p className="text-xs text-gray-500">Suppliers & Hotspots</p>
                        </div>
                        <div className="absolute bottom-4 right-4 z-10">
                            <button
                                onClick={() => window.location.href = '/dashboard/threat-map'}
                                className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Globe className="w-4 h-4" /> Open Global Threat Map
                            </button>
                        </div>
                    </div>
                )}

                {/* VITALS CONTENT */}
                {activeTab === 'vitals' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
                            <Info className="w-5 h-5 shrink-0" />
                            <p><strong>Manual Logging Mode:</strong> No sensors detected. Please manually enter your field observations to update the AI model.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                                <h3 className="font-bold text-lg mb-2 text-gray-600">Soil Moisture (Touch Estimate)</h3>
                                <div className="flex items-end gap-2">
                                    <input
                                        type="number"
                                        defaultValue={62}
                                        className="text-4xl font-serif text-blue-600 w-24 border-b-2 border-blue-100 focus:border-blue-600 outline-none bg-transparent transition-colors"
                                    />
                                    <span className="text-xl text-gray-400 mb-1">%</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Log manually</p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                                <h3 className="font-bold text-lg mb-2 text-gray-600">Nitrogen / Leaf Color</h3>
                                <select className="text-2xl font-serif text-green-600 w-full border-b-2 border-green-100 focus:border-green-600 outline-none bg-transparent py-2">
                                    <option>Optimal (Deep Green)</option>
                                    <option>Low (Yellowing)</option>
                                    <option>High (Burned Tips)</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-2">Visual observation</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button className="bg-apeel-green text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                                Save Observations
                            </button>
                        </div>
                    </div>
                )}

                {/* GROWTH LIFECYCLE TAB */}
                {activeTab === 'growth' && system?.profile && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-apeel-green/10 animate-fade-in">
                        <GrowthTimeline
                            currentStage={system.profile.currentStage}
                            startDate={system.profile.startDate}
                            growthHistory={system.profile.growthHistory || []}
                            cropType={system.profile.cropType}
                            variety={system.profile.variety}
                            onStageClick={(stage) => console.log('Stage:', stage)}
                        />
                    </div>
                )}
            </div>

            {/* CHECK-IN MODAL */}
            {showCheckIn && (
                <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 relative animate-slide-up">
                        <button onClick={() => setShowCheckIn(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-2xl font-serif font-bold text-apeel-green mb-4 text-center">Daily Check-in</h3>
                        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer mb-6 relative">
                            <Camera className="w-12 h-12 text-apeel-green mx-auto mb-2" />
                            <p className="font-bold">Upload Photo</p>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                                if (e.target.files?.[0]) { onFollowUp(currentDay, e.target.files[0]); setShowCheckIn(false); }
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Guide Modal */}
            {activeVisual && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-2xl w-full relative">
                        <button onClick={() => setActiveVisual(null)} className="absolute top-4 right-4"><X /></button>
                        <div dangerouslySetInnerHTML={{ __html: activeVisual.image }} />
                    </div>
                </div>
            )}
        </div>
    )
}
