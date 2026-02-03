'use client'

import React, { useState } from 'react'
import { useIncidents, Incident } from '@/context/IncidentContext'
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, ShieldCheck, Bug, Eye } from 'lucide-react'

export default function IncidentWidget() {
    const { incidents, advanceStep, resolveIncident } = useIncidents()
    const activeIncidents = incidents.filter(i => i.status !== 'resolved')

    if (activeIncidents.length === 0) return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center py-12">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">System Secure</h3>
            <p className="text-gray-500 max-w-xs">Zero active threats detected. &quot;Lorikeet&quot; Guardrails are monitoring 24/7.</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {activeIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} onAdvance={() => advanceStep(incident.id)} onResolve={() => resolveIncident(incident.id)} />
            ))}
        </div>
    )
}

function IncidentCard({ incident, onAdvance, onResolve }: { incident: Incident, onAdvance: () => void, onResolve: () => void }) {
    const [showLogic, setShowLogic] = useState(false)
    const currentStep = incident.steps.find(s => !s.isCompleted) || incident.steps[incident.steps.length - 1]
    const isVerification = incident.status === 'verification'

    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-6 flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <Bug className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                                {incident.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-stone-400">TZ: {incident.id.split('-')[1]}</span>
                        </div>
                        <h3 className="font-bold text-stone-900 text-lg">{incident.title}</h3>
                        <p className="text-stone-600 text-sm mt-1">
                            {currentStep && !isVerification ? `Current Task: ${currentStep.label}` : "Pending Verification"}
                        </p>
                    </div>
                </div>

                {/* Why Button */}
                <button
                    onClick={() => setShowLogic(!showLogic)}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                >
                    <Eye className="w-3 h-3 inline mr-1" />
                    {showLogic ? 'Hide' : 'Why?'}
                </button>
            </div>

            {/* Glass Box Logic View */}
            {showLogic && (
                <div className="bg-gray-900 text-gray-300 p-6 text-sm font-mono space-y-2 border-b border-gray-800 animate-slide-down">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs">
                        <ShieldCheck className="w-4 h-4" /> Lorikeet Logic Trace
                    </div>
                    {incident.logs.map((log, i) => (
                        <p key={i} className="border-l-2 border-gray-700 pl-3 py-0.5 hover:border-indigo-500 transition-colors cursor-default">
                            {log}
                        </p>
                    ))}
                </div>
            )}

            {/* Workflow Steps */}
            <div className="p-6 border-t border-stone-100">
                <div className="space-y-3 mb-6">
                    {incident.steps.map((step, idx) => (
                        <div key={step.id} className={`flex items-center gap-3 ${step.isCompleted ? 'opacity-40' : 'opacity-100'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.isCompleted ? 'bg-emerald-500 text-white' : 'border-2 border-stone-300 text-stone-300'
                                }`}>
                                {step.isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm ${step.isCompleted ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="text-xs text-stone-400">
                        Resolution Engine v2.0
                    </div>

                    {isVerification ? (
                        <button
                            onClick={onResolve}
                            className="bg-stone-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-stone-800 transition-colors"
                        >
                            Confirm Plant Healthy
                        </button>
                    ) : (
                        <button
                            onClick={onAdvance}
                            className="bg-stone-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-colors"
                        >
                            Complete Step <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
