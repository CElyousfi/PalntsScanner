'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles } from 'lucide-react'

export default function OnboardingTour() {
  const [showTour, setShowTour] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('notes_tour_completed')
    if (!hasSeenTour) {
      setShowTour(true)
    }
  }, [])

  const completeTour = () => {
    localStorage.setItem('notes_tour_completed', 'true')
    setShowTour(false)
  }

  if (!showTour) return null

  const steps = [
    {
      title: 'Welcome to Farm Notes! 📝',
      description: 'Create detailed farm reports with AI assistance, charts, and images. Let me show you around!',
      position: 'center'
    },
    {
      title: 'Create & Organize Notes',
      description: 'Click the + button to create new notes. Organize them in folders and search anytime.',
      position: 'left'
    },
    {
      title: 'Rich Markdown Editor',
      description: 'Use the toolbar for formatting or type markdown directly. Drag & drop images right into your notes!',
      position: 'center'
    },
    {
      title: 'AI Assistant',
      description: 'Ask AI to generate summaries, charts, or insights. It knows your farm data and can help write reports!',
      position: 'right'
    },
    {
      title: 'You\'re All Set! 🎉',
      description: 'Explore the sample notes to see what\'s possible. Start creating your own farm reports now!',
      position: 'center'
    }
  ]

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-apeel-green rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{currentStep.title}</h3>
              <p className="text-xs text-gray-500">Step {step + 1} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={completeTour}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{currentStep.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-apeel-green' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <>
                <button
                  onClick={completeTour}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 text-sm bg-apeel-green text-white rounded-lg hover:bg-apeel-green/90 transition-colors flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={completeTour}
                className="px-6 py-2 text-sm bg-apeel-green text-white rounded-lg hover:bg-apeel-green/90 transition-colors"
              >
                Get Started!
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
