'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { getSystemState, saveSystemState, initializeSystem, FarmSystemState } from '@/lib/store'
import { getSystemStateFromDatabase, migrateFromLocalStorage } from '@/lib/database'
import { useAuth } from '@/context/AuthContext'
import { DiagnosisResult, ActionRescueResult } from '@/types'

// Global Chat Context Interface
export interface ChatContextType {
    type: 'dashboard' | 'diagnosis' | 'history' | 'general'
    diagnosis?: DiagnosisResult
    actionResult?: ActionRescueResult
    monitoringPlan?: any
    initialQuestion?: string
    contextDescription?: string
}

interface AutonomyContextProps {
    system: FarmSystemState | null // Persistent State
    notifications: string[]

    // Global Chat State
    isChatOpen: boolean
    chatContext: ChatContextType | null
    toggleChat: (isOpen: boolean) => void
    setChatContext: (ctx: ChatContextType) => void

    // Actions
    triggerEvent: (name: string, details: string) => void
    refresh: () => void

    // Multi-Plant
    activeProfile?: import('@/types').FarmProfile
    switchProfile: (id: string) => void
    addProfile: (name: string, cropType: string) => void

    // Env
    envData: {
        location: { lat: number; lng: number; source: 'gps' | 'default' } | null
        weather: { temp: number; humidity: number; wind: number; condition: string } | null
    }
}
const AutonomyContext = createContext<AutonomyContextProps | null>(null)

export function AutonomyProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [system, setSystem] = useState<FarmSystemState | null>(null)
    const [notifications, setNotifications] = useState<string[]>([])

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatContext, setChatCtx] = useState<ChatContextType | null>(null)

    // Load System (now async to support Supabase)
    const loadSystem = useCallback(async () => {
        if (!user) {
            console.log('[AutonomyContext] No user, skipping load')
            return
        }
        
        console.log('[AutonomyContext] 🔄 Loading system state...')
        
        try {
            // Step 1: Try to load from Supabase first
            console.log('[AutonomyContext] Checking Supabase database...')
            let state = await getSystemStateFromDatabase(user.id)
            
            if (!state) {
                // Step 2: No Supabase data, try localStorage
                console.log('[AutonomyContext] No Supabase data, checking localStorage...')
                state = getSystemState()
                
                if (state && state.userId === user.id) {
                    // Step 3: Migrate from localStorage to Supabase
                    console.log('[AutonomyContext] 📦 Found localStorage data, migrating to Supabase...')
                    try {
                        await migrateFromLocalStorage(user.id)
                        console.log('[AutonomyContext] ✅ Migration successful!')
                    } catch (migrationError) {
                        console.error('[AutonomyContext] ⚠️ Migration failed, continuing with localStorage:', migrationError)
                    }
                }
            }

            if (state && state.userId === user.id) {
                console.log('[AutonomyContext] ✅ Found existing state. History count:', state.history?.length || 0)
                
                // --- MIGRATION CHECK ---
                let migrated = false
                const workingState = { ...state }

                // Migration 1: Single Profile -> Multi Profile
                if (workingState.profile && (!workingState.profiles || workingState.profiles.length === 0)) {
                    console.log("Migrating Single Profile to Multi Profile (Context Load)...")
                    const legacyProfile = workingState.profile
                    // Add ID if missing
                    if (!legacyProfile.id) legacyProfile.id = crypto.randomUUID()
                    if (!legacyProfile.name) legacyProfile.name = `${legacyProfile.cropType} 1`

                    workingState.profiles = [legacyProfile]
                    workingState.activeProfileId = legacyProfile.id
                    delete workingState.profile // Cleanup legacy
                    migrated = true
                }

                // Migration 2: Ensure history exists
                if (!workingState.history) {
                    workingState.history = []
                    migrated = true
                }

                if (migrated) {
                    saveSystemState(workingState)
                }

                // CRITICAL: Create deep copy to force React re-render
                const freshState = {
                    ...workingState,
                    history: [...(workingState.history || [])],
                    profiles: [...(workingState.profiles || [])],
                    logs: [...(workingState.logs || [])]
                }

                console.log('[AutonomyContext] Setting system state. History count:', freshState.history.length)
                setSystem(freshState)
            } else {
                // Initialize Default State if missing
                console.log('[AutonomyContext] No existing state, initializing new')
                const newState = initializeSystem(user.id)
                setSystem(newState)
            }
        } catch (error) {
            console.error('[AutonomyContext] ❌ Error loading system state:', error)
            // Fallback to localStorage
            console.log('[AutonomyContext] Falling back to localStorage...')
            const localState = getSystemState()
            if (localState && localState.userId === user.id) {
                setSystem(localState)
            } else {
                const newState = initializeSystem(user.id)
                setSystem(newState)
            }
        }
    }, [user])

    useEffect(() => {
        loadSystem()
    }, [loadSystem])

    // Living Loop (Simulation) - DISABLED for performance
    // useEffect(() => {
    //     if (!system) return
    //     const interval = setInterval(() => {
    //         const random = Math.random()
    //         if (random < 0.05) {
    //             triggerEvent('Weather Alert: Sudden Rain', 'Delayed irrigation by 24h to prevent runoff.')
    //         }
    //     }, 30000)
    //     return () => clearInterval(interval)
    // }, [system])

    const triggerEvent = (eventName: string, actionDetails: string) => {
        if (!system) return
        const newLog = {
            timestamp: Date.now(),
            event: eventName,
            action: actionDetails
        }
        const updatedState = {
            ...system,
            logs: [newLog, ...system.logs].slice(0, 50)
        }
        setSystem(updatedState)
        saveSystemState(updatedState)
        setNotifications(prev => [eventName, ...prev])
    }

    // Helper to update chat context
    const setChatContext = useCallback((ctx: ChatContextType) => {
        setChatCtx(prev => {
            // Simple depth-1 comparison or just set it
            if (JSON.stringify(prev) === JSON.stringify(ctx)) return prev
            return ctx
        })
    }, [])

    const toggleChat = useCallback((isOpen: boolean) => setIsChatOpen(isOpen), [])

    // Helper to switch active profile
    const switchProfile = (profileId: string) => {
        if (!system || !system.profiles.find(p => p.id === profileId)) return
        const updated = { ...system, activeProfileId: profileId }
        setSystem(updated)
        saveSystemState(updated)
    }

    // Helper to add new profile
    const addProfile = (name: string, cropType: string) => {
        if (!system) return
        const newProfile = {
            ...system.profiles[0], // Clone defaults from first profile for now
            id: crypto.randomUUID(),
            name,
            cropType,
            growthHistory: [],
            startDate: new Date().toISOString()
        }
        const updated = {
            ...system,
            profiles: [...system.profiles, newProfile],
            activeProfileId: newProfile.id
        }
        setSystem(updated)
        saveSystemState(updated)
    }

    // Derived active profile
    const activeProfile = system?.profiles?.find(p => p.id === system.activeProfileId) || system?.profiles?.[0]

    // Environment State
    const [envData, setEnvData] = useState<{
        location: { lat: number; lng: number; source: 'gps' | 'default' } | null
        weather: { temp: number; humidity: number; wind: number; condition: string } | null
    }>({ location: null, weather: null })

    // Initialize Location & Weather Simulation (Global)
    useEffect(() => {
        // 1. Get Location (Simple Global Check)
        const cachedPermission = localStorage.getItem('leafscan_location_permission')
        if (cachedPermission === 'granted' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps' as const }
                    updateEnvironment(loc)
                },
                () => {
                    // Fallback to Casablanca
                    updateEnvironment({ lat: 33.5731, lng: -7.5898, source: 'default' })
                },
                { enableHighAccuracy: true }
            )
        } else {
            updateEnvironment({ lat: 33.5731, lng: -7.5898, source: 'default' })
        }
    }, [])

    const updateEnvironment = (loc: { lat: number; lng: number; source: 'gps' | 'default' }) => {
        // Simulate Weather based on Loc
        const time = Date.now()
        const temp = Math.round(24 + Math.sin(time / 10000) * 2 - (loc.lat - 33))
        const humidity = Math.round(60 + Math.cos(time / 15000) * 10)
        const wind = Math.round(15 + Math.sin(time / 8000) * 5)

        setEnvData({
            location: loc,
            weather: {
                temp,
                humidity,
                wind,
                condition: Math.random() > 0.8 ? 'Rain' : 'Clear'
            }
        })
    }

    const contextValue = useMemo(() => ({
        system,
        notifications,
        isChatOpen,
        chatContext,
        envData,
        toggleChat,
        setChatContext,
        triggerEvent,
        refresh: loadSystem,
        activeProfile,
        switchProfile,
        addProfile
    }), [system, notifications, isChatOpen, chatContext, envData, toggleChat, setChatContext, triggerEvent, loadSystem, activeProfile, switchProfile, addProfile])

    return (
        <AutonomyContext.Provider value={contextValue}>
            {children}
        </AutonomyContext.Provider>
    )
}

export function useAutonomy() {
    const context = useContext(AutonomyContext)
    if (!context) {
        throw new Error('useAutonomy must be used within an AutonomyProvider')
    }
    return context
}
