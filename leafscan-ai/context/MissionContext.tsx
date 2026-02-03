'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type MissionType = 'healer' | 'grower' | 'explorer' | null

interface MissionContextType {
    mission: MissionType
    setMission: (mission: MissionType) => void
    isLoading: boolean
}

const MissionContext = createContext<MissionContextType | undefined>(undefined)

export function MissionProvider({ children }: { children: React.ReactNode }) {
    const [mission, setMissionState] = useState<MissionType>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Load from local storage or set default to 'grower'
        const saved = localStorage.getItem('leafscan_mission') as MissionType
        if (saved) {
            setMissionState(saved)
        } else {
            // Default to grower mode - all features accessible
            setMissionState('grower')
            localStorage.setItem('leafscan_mission', 'grower')
        }
        setIsLoading(false)
    }, [])

    const setMission = (newMission: MissionType) => {
        setMissionState(newMission)
        if (newMission) {
            localStorage.setItem('leafscan_mission', newMission)
        } else {
            localStorage.removeItem('leafscan_mission')
        }
    }

    return (
        <MissionContext.Provider value={{ mission, setMission, isLoading }}>
            {children}
        </MissionContext.Provider>
    )
}

export function useMission() {
    const context = useContext(MissionContext)
    if (context === undefined) {
        throw new Error('useMission must be used within a MissionProvider')
    }
    return context
}
