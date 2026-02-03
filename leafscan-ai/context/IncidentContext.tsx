'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type IncidentStatus = 'open' | 'in_progress' | 'verification' | 'resolved'

export interface WorkflowStep {
    id: string
    label: string
    isCompleted: boolean
    actionUrl?: string // e.g., Link to Amazon search for Neem Oil
}

export interface Incident {
    id: string
    title: string
    type: 'disease' | 'pest' | 'environment'
    severity: 'low' | 'medium' | 'high'
    status: IncidentStatus
    steps: WorkflowStep[]
    dateDetected: number
    logs: string[] // Audit trail (Glass Box)
}

interface IncidentContextProps {
    incidents: Incident[]
    createIncident: (title: string, type: Incident['type'], severity: Incident['severity'], steps: string[]) => void
    advanceStep: (incidentId: string) => void
    resolveIncident: (incidentId: string) => void
    getReasoning: (incidentId: string) => string[]
}

const IncidentContext = createContext<IncidentContextProps | null>(null)

export function IncidentProvider({ children }: { children: ReactNode }) {
    const [incidents, setIncidents] = useState<Incident[]>([
        // Mock Active Incident (Lorikeet Style)
        {
            id: 'inc-001',
            title: 'Early Blight Detected',
            type: 'disease',
            severity: 'high',
            status: 'in_progress',
            dateDetected: Date.now() - 86400000,
            steps: [
                { id: 's1', label: 'Quarantine Plant (Stop Spores)', isCompleted: true },
                { id: 's2', label: 'Apply Copper Fungicide', isCompleted: false, actionUrl: '/dashboard/supplies?q=copper+fungicide' },
                { id: 's3', label: 'Prune Infected Leaves', isCompleted: false },
                { id: 's4', label: 'Verify: No New Spots (48h)', isCompleted: false }
            ],
            logs: [
                'System: Image Scan #402 detected concentric rings (98% confidence).',
                'Guardrail: "Organic Mode" active. Excluded synthetic antifungal options.',
                'Decision: Priority set to HIGH due to humidity trend forecasts.'
            ]
        }
    ])

    const createIncident = (title: string, type: Incident['type'], severity: Incident['severity'], stepLabels: string[]) => {
        const newIncident: Incident = {
            id: crypto.randomUUID(),
            title,
            type,
            severity,
            status: 'open',
            dateDetected: Date.now(),
            steps: stepLabels.map(label => ({ id: crypto.randomUUID(), label, isCompleted: false })),
            logs: ['System: Incident created manually or via scan.']
        }
        setIncidents(prev => [newIncident, ...prev])
    }

    const advanceStep = (incidentId: string) => {
        setIncidents(prev => prev.map(inc => {
            if (inc.id !== incidentId) return inc

            const nextStepIndex = inc.steps.findIndex(s => !s.isCompleted)
            if (nextStepIndex === -1) return inc // All done

            const updatedSteps = [...inc.steps]
            updatedSteps[nextStepIndex].isCompleted = true

            // Auto-update status
            let newStatus = inc.status
            if (newStatus === 'open') newStatus = 'in_progress'
            if (updatedSteps.every(s => s.isCompleted)) newStatus = 'verification'

            return { ...inc, steps: updatedSteps, status: newStatus }
        }))
    }

    const resolveIncident = (incidentId: string) => {
        setIncidents(prev => prev.map(inc =>
            inc.id === incidentId ? { ...inc, status: 'resolved' } : inc
        ))
    }

    const getReasoning = (incidentId: string) => {
        return incidents.find(i => i.id === incidentId)?.logs || []
    }

    return (
        <IncidentContext.Provider value={{ incidents, createIncident, advanceStep, resolveIncident, getReasoning }}>
            {children}
        </IncidentContext.Provider>
    )
}

export function useIncidents() {
    const context = useContext(IncidentContext)
    if (!context) throw new Error("useIncidents must be used within IncidentProvider")
    return context
}
