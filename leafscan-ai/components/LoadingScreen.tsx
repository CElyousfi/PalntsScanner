'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

const facts = [
  "Early detection can save up to 40% of crops from disease damage",
  "Plant diseases cause over $300B in global crop losses annually",
  "Organic treatments are safer for the environment and human health",
  "AI can identify plant diseases with 95%+ accuracy",
  "Regular monitoring helps prevent disease outbreaks",
  "Crop rotation reduces disease risk by up to 60%",
  "Healthy soil is the first defense against plant diseases"
]

interface LoadingScreenProps {
  step?: 'idle' | 'uploading' | 'processing' | 'scanning' | 'tools' | 'finalizing' | 'complete'
}

export default function LoadingScreen({ step = 'processing' }: LoadingScreenProps) {
  const [currentFact, setCurrentFact] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    { id: 'scanning', label: 'Visual Scan', icon: '🍃' },
    { id: 'tools', label: 'Contextual Tools', icon: '🔧' },
    { id: 'finalizing', label: 'Finalizing', icon: '📝' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === (step === 'uploading' || step === 'processing' ? 'scanning' : step))

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="card backdrop-blur-xl bg-white/30 border-none p-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="w-20 h-20 text-apeel-green animate-spin" />
            <Sparkles className="w-8 h-8 text-apeel-accent absolute top-0 right-0 animate-pulse" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-apeel-green mb-2">
          {step === 'uploading' ? 'Uploading...' :
            step === 'scanning' ? 'Scanning Morphology...' :
              step === 'tools' ? 'Checking External Databases...' :
                step === 'finalizing' ? 'Generating Report...' : 'Analyzing Sample'}
        </h2>

        {/* Dynamic Progress Steps */}
        <div className="flex justify-center gap-4 my-6">
          {steps.map((s, idx) => {
            const isActive = idx <= (currentStepIndex === -1 ? 0 : currentStepIndex)
            return (
              <div key={s.id} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${isActive ? 'bg-apeel-green text-white opacity-100' : 'bg-white/20 text-apeel-green/40'}`}>
                <span>{s.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
              </div>
            )
          })}
        </div>

        <div className="bg-apeel-green/10 rounded-lg p-6 border-l-4 border-apeel-green mt-8">
          <p className="text-sm text-apeel-green/60 mb-2 flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>While we work:</span>
          </p>
          <p className="text-apeel-green font-medium animate-fade-in key={currentFact}">
            {facts[currentFact]}
          </p>
        </div>
      </div>
    </div>
  )
}
