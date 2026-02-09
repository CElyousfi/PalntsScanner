'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles, Check } from 'lucide-react'
import { useTutorial } from '@/context/TutorialContext'
import { TUTORIALS } from '@/data/tutorials'

export default function TutorialOverlay() {
    const { activeTutorial, completeTutorial, dismissTutorial, isTutorialActive } = useTutorial()
    const [step, setStep] = useState(0)

    // Reset step when a new tutorial starts
    useEffect(() => {
        if (activeTutorial) {
            setStep(0)
        }
    }, [activeTutorial])

    if (!isTutorialActive || !activeTutorial) return null

    const steps = TUTORIALS[activeTutorial]
    if (!steps || steps.length === 0) return null

    // Safety check: if step is out of bounds (e.g. from previous tutorial), wait for effect to reset
    if (step >= steps.length) return null

    const currentStep = steps[step]
    if (!currentStep) return null

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            completeTutorial(activeTutorial)
        }
    }

    const handleSkip = () => {
        completeTutorial(activeTutorial)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-apeel-green/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Header */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-apeel-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-apeel-green uppercase tracking-wider">Guide</span>
                            <div className="text-xs text-gray-400 font-medium">Step {step + 1} of {steps.length}</div>
                        </div>
                    </div>
                    <button
                        onClick={dismissTutorial}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8 relative z-10 min-h-[100px]">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight">{currentStep.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{currentStep.description}</p>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center justify-between relative z-10 pt-4 border-t border-gray-100">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-apeel-green' : 'w-1.5 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {step < steps.length - 1 ? (
                            <>
                                <button
                                    onClick={handleSkip}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-5 py-2 text-sm font-bold bg-apeel-green text-white rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-500/20 flex items-center gap-2 group"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 text-sm font-bold bg-apeel-green text-white rounded-xl hover:bg-green-600 transition-colors shadow-md shadow-green-500/20 flex items-center gap-2"
                            >
                                Get Started
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
