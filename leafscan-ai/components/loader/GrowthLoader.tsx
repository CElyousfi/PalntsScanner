'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import ScanAnimation from './ScanAnimation'

export type LoaderMode = 'leaf' | 'crop'
export type LoaderStage = 'visual' | 'context' | 'final' | 'idle'

interface GrowthLoaderProps {
    mode: LoaderMode
    progress?: number // 0-100
    stage?: LoaderStage
    className?: string
}

const facts = [
    "Early detection can save up to 40% of crops from disease damage",
    "Plant diseases cause over $300B in global crop losses annually",
    "Organic treatments are safer for the environment and human health",
    "AI can identify plant diseases with 95%+ accuracy",
    "Regular monitoring helps prevent disease outbreaks",
    "Crop rotation reduces disease risk by up to 60%",
    "Healthy soil is the first defense against plant diseases"
]

export default function GrowthLoader({ mode, progress: externalProgress, stage: externalStage, className = "" }: GrowthLoaderProps) {
    // Internal simulation state if no external progress provided
    const [internalProgress, setInternalProgress] = useState(0)
    const [currentFact, setCurrentFact] = useState(0)

    const progress = externalProgress ?? internalProgress

    // Derive stage from progress if not explicitly provided
    const stage = externalStage ?? (
        progress < 45 ? 'visual' :
            progress < 80 ? 'context' : 'final'
    )

    // Simulation logic
    useEffect(() => {
        if (externalProgress !== undefined) return

        const timer = setInterval(() => {
            setInternalProgress(prev => {
                if (prev >= 90) return prev
                // Fast at start, slow at end
                const increment = prev < 50 ? 2 : prev < 75 ? 0.5 : 0.1
                return Math.min(prev + increment, 90)
            })
        }, 100)

        return () => clearInterval(timer)
    }, [externalProgress])

    // Fact rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % facts.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className={`w-full max-w-lg mx-auto ${className}`}>
            <div className="card backdrop-blur-xl bg-white/30 border-none p-10 flex flex-col items-center shadow-2xl rounded-[2rem]">

                {/* Animation Container */}
                <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-apeel-green/10 blur-3xl rounded-full animate-pulse" />

                    {/* Custom SVG Animation */}
                    <div className="relative z-10">
                        <ScanAnimation mode={mode} size={200} />
                    </div>

                    {/* Center Percentage - Optional overlay, but maybe better below. 
                        Let's keep it clean and just have the animation here. 
                    */}
                </div>

                {/* Text Status */}
                <div className="text-center mb-10 relative z-20">
                    <h2 className="text-5xl font-bold text-apeel-green font-mono mb-2 tracking-tighter drop-shadow-sm">
                        {Math.round(progress)}%
                    </h2>
                    <div className="h-6 overflow-hidden relative">
                        <p key={stage} className="text-gray-600 font-medium animate-fade-in-up">
                            {stage === 'visual' ? 'Scanning Morphology...' :
                                stage === 'context' ? 'Analyzing Biological Context...' :
                                    'Finalizing Diagnostic Report...'}
                        </p>
                    </div>
                </div>

                {/* Stage Indicators */}
                <div className="flex items-center justify-center gap-2 mb-8 w-full">
                    {['visual', 'context', 'final'].map((s, i) => {
                        const isActive = (s === 'visual' && stage !== 'idle') ||
                            (s === 'context' && (stage === 'context' || stage === 'final')) ||
                            (s === 'final' && stage === 'final')

                        return (
                            <div key={s} className="flex flex-col items-center gap-1 flex-1">
                                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${isActive ? 'bg-apeel-green' : 'bg-gray-200'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-apeel-green' : 'text-gray-300'}`}>
                                    {s}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Dynamic Fact */}
                <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 w-full border border-apeel-green/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-apeel-green/0 via-apeel-green/5 to-apeel-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    <div className="flex items-center justify-center gap-2 text-apeel-green text-xs font-bold uppercase mb-2 tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Did you know?
                    </div>
                    <p key={currentFact} className="text-center text-sm text-gray-700 font-medium min-h-[40px] flex items-center justify-center animate-fade-in">
                        {facts[currentFact]}
                    </p>
                </div>

            </div>
        </div>
    )
}
