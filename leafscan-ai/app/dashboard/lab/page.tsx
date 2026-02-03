'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Beaker, Sun, Droplets, Leaf, RefreshCcw, Info, CheckCircle2, Award, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAutonomy } from '@/hooks/useAutonomy'
import PageShell from '@/components/dashboard/PageShell'

// Simulation States
type PlantState = 'healthy' | 'nitrogen' | 'phosphorus' | 'wilted' | 'sunburned'

const PLANT_IMAGES: Record<PlantState, string> = {
    healthy: '/images/lab/healthy.png',
    nitrogen: '/images/lab/nitrogen.png',
    phosphorus: '/images/lab/phosphorus.png',
    wilted: '/images/lab/wilted.png',
    sunburned: '/images/lab/sunburned.png'
}

const FEEDBACK: Record<PlantState, { title: string; desc: string; color: string }> = {
    healthy: {
        title: 'Thriving',
        desc: 'Perfect balance! The plant is metabolizing nutrients efficiently.',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    nitrogen: {
        title: 'Nitrogen Deficiency',
        desc: 'Lower leaves are turning yellow (chlorosis) while veins remain green. Stunted growth.',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-100'
    },
    phosphorus: {
        title: 'Phosphorus Deficiency',
        desc: 'Leaves showing purple/reddish tints. Root development is severely impacted.',
        color: 'text-purple-600 bg-purple-50 border-purple-100'
    },
    wilted: {
        title: 'Severe Dehydration',
        desc: 'Leaves are drooping and curling due to lack of turgor pressure.',
        color: 'text-orange-600 bg-orange-50 border-orange-100'
    },
    sunburned: {
        title: 'Sunscald / Heat Stress',
        desc: 'White bleached patches on leaves. The plant is unable to transpiro-cool.',
        color: 'text-red-600 bg-red-50 border-red-100'
    }
}

export default function GrowLabPage() {
    const router = useRouter()
    const { activeProfile } = useAutonomy()

    // Sliders (0-100)
    const [nitrogen, setNitrogen] = useState(50)
    const [phosphorus, setPhosphorus] = useState(50)
    const [water, setWater] = useState(50)
    const [sun, setSun] = useState(50)

    const [currentState, setCurrentState] = useState<PlantState>('healthy')
    const [notification, setNotification] = useState<string | null>(null)
    const [showCertificate, setShowCertificate] = useState(false)

    // Simulation Logic
    useEffect(() => {
        let newState: PlantState = 'healthy'

        // Priority Logic: Water > Sun > Nutrients
        if (water < 30) {
            newState = 'wilted'
        } else if (sun > 80) {
            newState = 'sunburned'
        } else if (nitrogen < 30) {
            newState = 'nitrogen'
        } else if (phosphorus < 30) {
            newState = 'phosphorus'
        }

        setCurrentState(newState)

        // Check for "Perfect" state to unlock certificate (Must be balanced for 2s - simulated by instant check here for UX)
        if (newState === 'healthy' && nitrogen > 45 && nitrogen < 65 && phosphorus > 45 && phosphorus < 65 && water > 45 && water < 65 && sun > 45 && sun < 65) {
            // We can trigger this after a short delay or user action.
            // For now, let's just create a button "Verify Experiment" to make it explicit agency
        }

    }, [nitrogen, phosphorus, water, sun])

    const handleReset = () => {
        setNitrogen(50)
        setPhosphorus(50)
        setWater(50)
        setSun(50)
        setNotification('Lab reset to baseline.')
        setShowCertificate(false)
        setTimeout(() => setNotification(null), 2000)
    }

    const handleCompleteSimulation = () => {
        if (currentState === 'healthy') {
            setShowCertificate(true)
            setNotification('Analysis complete: Optimal growth achieved!')
            // In a real app, save this achievement to user profile
        } else {
            setNotification('Cannot complete: Plant is not healthy.')
            setTimeout(() => setNotification(null), 2000)
        }
    }

    return (
        <PageShell
            title="The Grow Lab"
            badge={
                <div className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-md font-sans uppercase tracking-wider font-bold inline-flex items-center gap-1 shadow-sm border border-indigo-200">
                    <Beaker className="w-3 h-3" />
                    Beta Simulator
                </div>
            }
            action={
                <button
                    onClick={handleReset}
                    className="w-12 h-12 rounded-full border border-[#EAE8D9] bg-[#Fdfbf7] flex items-center justify-center hover:scale-105 transition-transform text-stone-700 shadow-md group"
                    title="Reset Lab"
                >
                    <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            }
        >
            <div className="animate-fade-in pb-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Visualizer (Left/Top) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden relative aspect-square lg:aspect-[4/3] group">
                            {/* Simulation Viewport */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50" />

                            {/* The Plant */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={PLANT_IMAGES[currentState]}
                                alt={currentState}
                                className="absolute inset-0 w-full h-full object-contain p-8 transition-opacity duration-500 ease-in-out"
                            />

                            {/* Status Overlay */}
                            <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-2xl border backdrop-blur-md transition-colors duration-500 ${FEEDBACK[currentState].color}`}>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white/50 rounded-full">
                                        <ActivityIcon state={currentState} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{FEEDBACK[currentState].title}</h3>
                                        <p className="text-sm opacity-90 leading-relaxed">{FEEDBACK[currentState].desc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Toast */}
                            {notification && (
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-fade-in-up z-20">
                                    {notification}
                                </div>
                            )}

                            {/* Completion Button */}
                            {currentState === 'healthy' && !showCertificate && (
                                <div className="absolute top-6 right-6 z-10">
                                    <button
                                        onClick={handleCompleteSimulation}
                                        className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform animate-pulse"
                                    >
                                        Verify Result
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls (Right/Bottom) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-indigo-600" /> Control Variables
                            </h2>

                            <p className="text-sm text-gray-500 mb-6">
                                Adjust the environmental parameters to find the optimal growth conditions for <strong>{activeProfile?.cropType || 'this crop'}</strong>.
                            </p>

                            <div className="space-y-8">
                                <ControlSlider
                                    label="Nitrogen (N)"
                                    value={nitrogen}
                                    onChange={setNitrogen}
                                    icon={<Leaf className="w-4 h-4 text-emerald-500" />}
                                    color="emerald"
                                />
                                <ControlSlider
                                    label="Phosphorus (P)"
                                    value={phosphorus}
                                    onChange={setPhosphorus}
                                    icon={<Leaf className="w-4 h-4 text-purple-500" />} // Using Leaf as generic nutrient icon
                                    color="purple"
                                />
                                <ControlSlider
                                    label="Water Saturation"
                                    value={water}
                                    onChange={setWater}
                                    icon={<Droplets className="w-4 h-4 text-blue-500" />}
                                    color="blue"
                                />
                                <ControlSlider
                                    label="Light Intensity"
                                    value={sun}
                                    onChange={setSun}
                                    icon={<Sun className="w-4 h-4 text-orange-500" />}
                                    color="orange"
                                />
                            </div>
                        </div>

                        <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Did you know?</h3>
                                <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                                    Balancing Nitrogen is the hardest task for new hydroponic growers. Too little stunts growth, but too much can burn the roots (&quot;Nutrient Burn&quot;).
                                </p>
                            </div>
                            <Beaker className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-800 opacity-50 rotate-12" />
                        </div>
                    </div>
                </div>

                {/* Certificate Modal */}
                {showCertificate && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-[2rem] p-10 max-w-lg w-full text-center relative shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 animate-bounce-slow">
                                <Award className="w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Simulation Passed!</h2>
                            <p className="text-gray-500 mb-8">
                                You have successfully identified the optimal parameters. A digital certificate has been added to your profile.
                            </p>

                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100 text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Awarded To</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Date</span>
                                </div>
                                <div className="flex justify-between items-center font-serif text-lg text-gray-900 font-bold">
                                    <span>Future Agronomist</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCertificate(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                                <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageShell>
    )
}

function ControlSlider({ label, value, onChange, icon, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                <span className="flex items-center gap-2">{icon} {label}</span>
                <span className={`bg-${color}-50 text-${color}-600 px-2 py-1 rounded-md min-w-[3rem] text-center`}>{value}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-${color}-500 hover:accent-${color}-600 transition-all`}
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                <span>Deficient</span>
                <span>Optimal</span>
                <span>Excess</span>
            </div>
        </div>
    )
}

function ActivityIcon({ state }: { state: PlantState }) {
    switch (state) {
        case 'healthy': return <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        case 'wilted': return <Droplets className="w-6 h-6 text-orange-600" />
        case 'sunburned': return <Sun className="w-6 h-6 text-red-600" />
        default: return <Info className="w-6 h-6 text-gray-600" />
    }
}
