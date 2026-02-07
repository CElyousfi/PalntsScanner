'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Leaf, Apple } from 'lucide-react'

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

    // Animation variants
    const seedVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
        growing: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 2 } }
    }

    const sproutVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }
    }

    const leafVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { delay: 1, duration: 0.8, type: "spring" } }
    }

    const flowerVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.8, type: "spring" } }
    }

    const fruitVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { delay: 1.2, duration: 0.8, type: "spring" } }
    }

    return (
        <div className={`w-full max-w-lg mx-auto ${className}`}>
            <div className="card backdrop-blur-xl bg-white/30 border-none p-10 flex flex-col items-center shadow-2xl rounded-[2rem]">

                {/* Animation Container */}
                <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-apeel-green/5 blur-3xl rounded-full animate-pulse" />

                    <svg width="200" height="200" viewBox="0 0 200 200" className="relative z-10 overflow-visible">
                        {mode === 'leaf' ? (
                            // Seed -> Sprout -> Leaf Animation
                            <g transform="translate(100, 160)">
                                {/* Seed */}
                                {progress < 20 && (
                                    <motion.circle
                                        cx="0" cy="0" r="8"
                                        fill="#5D4037"
                                        variants={seedVariants}
                                        initial="hidden"
                                        animate={progress > 5 ? "visible" : "hidden"}
                                    />
                                )}

                                {/* Sprout Stem */}
                                <motion.path
                                    d="M0,0 C0,-20 -5,-40 -10,-60 C-15,-80 5,-90 10,-110"
                                    fill="none"
                                    stroke="#4ADE80"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    variants={sproutVariants}
                                    initial="hidden"
                                    animate={progress > 15 ? "visible" : "hidden"}
                                />

                                {/* Leaves */}
                                <motion.g variants={leafVariants} initial="hidden" animate={progress > 40 ? "visible" : "hidden"}>
                                    {/* Left Leaf */}
                                    <path d="M-10,-60 C-30,-70 -40,-50 -50,-60 C-40,-40 -20,-50 -10,-60" fill="#22C55E" />
                                    {/* Right Leaf (Main) */}
                                    <path d="M10,-110 C30,-130 50,-100 60,-120 C50,-90 20,-100 10,-110" fill="#15803D" />
                                </motion.g>

                                {/* Scanning Effect */}
                                <motion.line
                                    x1="-60" y1="-140"
                                    x2="60" y2="-140"
                                    stroke="#4ADE80"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    initial={{ y: -140, opacity: 0 }}
                                    animate={{
                                        y: [-140, 20, -140],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "linear"
                                    }}
                                />
                            </g>
                        ) : (
                            // Leaf -> Flower -> Fruit Animation
                            <g transform="translate(100, 150)">
                                {/* Existing Branch */}
                                <path
                                    d="M0,40 C0,20 -5,0 -10,-20 C-15,-40 5,-50 10,-70"
                                    fill="none"
                                    stroke="#5D4037"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                                {/* Leaves */}
                                <g>
                                    <path d="M-10,-20 C-30,-30 -40,-10 -50,-20 C-40,0 -20,-10 -10,-20" fill="#15803D" transform="scale(0.8)" />
                                    <path d="M5,-50 C25,-60 30,-40 40,-50 C30,-30 15,-40 5,-50" fill="#22C55E" transform="scale(0.8)" />
                                </g>

                                {/* Flower Stage */}
                                {progress < 60 && (
                                    <motion.g
                                        transform="translate(10,-70)"
                                        variants={flowerVariants}
                                        initial="hidden"
                                        animate={progress > 10 ? "visible" : "hidden"}
                                    >
                                        <circle cx="0" cy="0" r="10" fill="#FEF08A" />
                                        {[0, 72, 144, 216, 288].map((angle, i) => (
                                            <ellipse
                                                key={i}
                                                cx="0" cy="-15"
                                                rx="6" ry="12"
                                                fill="#FFFFFF"
                                                transform={`rotate(${angle})`}
                                            />
                                        ))}
                                    </motion.g>
                                )}

                                {/* Fruit Stage */}
                                <motion.g
                                    transform="translate(10,-60)"
                                    variants={fruitVariants}
                                    initial="hidden"
                                    animate={progress >= 60 ? "visible" : "hidden"}
                                >
                                    {/* Apple Body */}
                                    <path d="M-15,0 C-15,-15 -5,-20 0,-18 C5,-20 15,-15 15,0 C15,20 5,25 0,25 C-5,25 -15,20 -15,0" fill="#EF4444" transform="scale(1.5)" />
                                    {/* Shine */}
                                    <path d="M5,-5 Q10,-5 8,5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                                </motion.g>
                            </g>
                        )}
                    </svg>

                    {/* Center Percentage */}
                    <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
                        {/* Optional floating particles */}
                        <Sparkles className="absolute top-10 right-10 text-yellow-400 w-6 h-6 animate-pulse" />
                    </div>
                </div>

                {/* Text Status */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-apeel-green font-mono mb-2">
                        {Math.round(progress)}%
                    </h2>
                    <p className="text-gray-600 font-medium animate-pulse">
                        {stage === 'visual' ? 'Scanning Morphology...' :
                            stage === 'context' ? 'Checking Biological Context...' :
                                'Finalizing Report...'}
                    </p>
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
                <div className="bg-apeel-green/5 rounded-xl p-4 w-full border border-apeel-green/10">
                    <div className="flex items-center justify-center gap-2 text-apeel-green/60 text-xs font-bold uppercase mb-2">
                        <Sparkles className="w-3 h-3" />
                        Did you know?
                    </div>
                    <p className="text-center text-sm text-gray-700 font-medium min-h-[40px] flex items-center justify-center">
                        {facts[currentFact]}
                    </p>
                </div>

            </div>
        </div>
    )
}
