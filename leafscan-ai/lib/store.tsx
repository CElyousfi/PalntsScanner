import { FarmSession } from './farm-session'
import { DiagnosisResult, ActionRescueResult, FarmProfile, GrowthEntry } from '@/types'
import { saveSystemStateToDatabase, getSystemStateFromDatabase } from './database'
import { reactiveStore } from './reactive-store'

// --- V2 Data Models ---

export interface HistoricalAnalysis {
    id: string
    plantId?: string // Link to specific plant profile
    timestamp: number
    image: string // base64
    diagnosis: DiagnosisResult
    actionResult?: ActionRescueResult | null
}

export interface Action {
    id: string
    title: string
    type: 'check-in' | 'treatment' | 'scout'
    completed: boolean
    dueDate: string // ISO
}

export interface HorizonState {
    short: {
        currentDay: number // 1-14
        dailyActions: Action[]
    }
    medium: {
        weekNumber: number
        weeklyTrends: number[] // Health scores for last 7 checks
        insight: string // "Improving" | "Declining" | "Stable"
    }
    long: {
        seasonGoals: {
            targetYield: number // kg
            currentHealthAvg: number // 0-100
        }
        seasonPhase: 'planting' | 'vegetative' | 'flowering' | 'harvest'
    }
}

export interface UserPreferences {
    expertMode: boolean
    notificationsEnabled: boolean
}

export interface FarmSystemState {
    userId: string
    // We link the existing session model here
    activeSessionId?: string
    sessions: Record<string, FarmSession> // All past/current sessions

    // Full Analysis History
    history: HistoricalAnalysis[]

    // The "Brain" State
    horizons: HorizonState
    preferences: UserPreferences

    // Autonomy Logs
    logs: {
        timestamp: number
        event: string // e.g., "Rain Pattern Detected"
        action: string // e.g., "Adjusted schedule +2 days"
    }[]

    // Global Visual Cache (Deduplication)
    visualCache: Record<string, string>

    // --- Lifecycle Profile (Multi-Plant) ---
    profiles: FarmProfile[]
    activeProfileId?: string

    // Deprecated but kept for migration safety checking if needed, 
    // though we will migrate immediately in initializeSystem
    profile?: FarmProfile
}

// --- Storage Keys ---
export const STORE_KEY = 'leafscan_v2_system'

// --- Helper Functions ---
export function getSystemState(): FarmSystemState | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
}

export function saveSystemState(state: FarmSystemState) {
    if (typeof window === 'undefined') return
    
    console.log('[saveSystemState] Attempting to save. History count:', state.history?.length || 0)
    
    try {
        const jsonString = JSON.stringify(state)
        console.log('[saveSystemState] JSON serialization successful. Size:', (jsonString.length / 1024).toFixed(2), 'KB')
        
        localStorage.setItem(STORE_KEY, jsonString)
        console.log('[saveSystemState] ✅ localStorage.setItem completed')
        
        // Trigger reactive updates - ALL components will update automatically!
        reactiveStore.set('system-state', state)
        reactiveStore.set('history', state.history)
        reactiveStore.set('profiles', state.profiles)
        reactiveStore.set('active-profile', state.profiles.find(p => p.id === state.activeProfileId))
        console.log('[saveSystemState] ⚡ Reactive updates triggered!')
        
        // Immediate verification
        const readBack = localStorage.getItem(STORE_KEY)
        if (readBack) {
            const parsed = JSON.parse(readBack)
            console.log('[saveSystemState] ✅ Verification: Data persisted. History count:', parsed.history?.length || 0)
        } else {
            console.error('[saveSystemState] ❌ CRITICAL: localStorage.getItem returned null immediately after setItem!')
        }
    } catch (e: any) {
        console.error('[saveSystemState] ❌ Error during save:', e.name, e.message)
        
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('Storage quota exceeded. Attempting emergency cleanup...')

            // Strategy 1: Clear Visual Cache (Disposable)
            if (Object.keys(state.visualCache || {}).length > 0) {
                console.log(' - Clearing Visual Cache')
                state.visualCache = {}
                try {
                    localStorage.setItem(STORE_KEY, JSON.stringify(state))
                    return
                } catch (retryE) { /* Continue to strategy 2 */ }
            }

            // Strategy 2: Aggressive History Pruning (Keep last 10)
            if (state.history.length > 10) {
                console.log(' - Pruning History to last 10 items')
                state.history = state.history.slice(0, 10)
                try {
                    localStorage.setItem(STORE_KEY, JSON.stringify(state))
                    return
                } catch (retryE) { /* Continue to strategy 3 */ }
            }

            // Strategy 3: Extreme History Pruning (Keep last 2)
            if (state.history.length > 2) {
                console.log(' - Pruning History to last 2 items')
                state.history = state.history.slice(0, 2)
                try {
                    localStorage.setItem(STORE_KEY, JSON.stringify(state))
                    return
                } catch (retryE) { /* Continue to strategy 4 */ }
            }

            console.error('CRITICAL: Storage still full after all cleanup strategies.')
        }
    }
}

// NEW: Async version that saves to Supabase
export async function saveAnalysisToHistoryAsync(userId: string, analysis: HistoricalAnalysis): Promise<void> {
    console.log('[Store] 🚀 saveAnalysisToHistoryAsync called with:', analysis.id)
    const state = getSystemState()
    if (!state) {
        console.error('[Store] No system state found! Cannot save analysis.')
        return
    }

    console.log('[Store] Current history length:', state.history?.length || 0)

    // Prepend to history (newest first)
    const newHistory = [analysis, ...(state.history || [])]
    console.log('[Store] New history length:', newHistory.length)

    // Soft limit
    if (newHistory.length > 100) {
        newHistory.splice(100) // Keep only first 100
    }

    const updatedState = {
        ...state,
        history: newHistory
    }

    try {
        // Save to localStorage first (fast, synchronous backup)
        saveSystemState(updatedState)
        console.log('[Store] ✅ Saved to localStorage')

        // Save to Supabase (persistent, cloud backup)
        await saveSystemStateToDatabase(userId, updatedState)
        console.log('[Store] ✅ Saved to Supabase database')

        // Dispatch custom event to notify components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { count: newHistory.length } }))
        }

        console.log('[Store] 🎉 Analysis saved successfully to both localStorage and Supabase!')
    } catch (error) {
        console.error('[Store] ❌ Error saving to Supabase:', error)
        // localStorage save already succeeded, so data is not lost
        console.log('[Store] ℹ️ Data is safe in localStorage even though Supabase save failed')
    }
}

// LEGACY: Synchronous version (kept for backward compatibility)
export function saveAnalysisToHistory(analysis: HistoricalAnalysis) {
    console.log('[Store] saveAnalysisToHistory called with:', analysis.id)
    const state = getSystemState()
    if (!state) {
        console.error('[Store] No system state found! Cannot save analysis.')
        return
    }

    console.log('[Store] Current history length:', state.history?.length || 0)

    // Prepend to history (newest first)
    const newHistory = [analysis, ...(state.history || [])]

    console.log('[Store] New history length:', newHistory.length)

    // Initial soft limit
    if (newHistory.length > 50) newHistory.pop()

    // Try saving with progressive pruning behavior
    const trySave = (history: HistoricalAnalysis[]) => {
        try {
            saveSystemState({
                ...state,
                history: history
            })
            console.log('[Store] ✅ Analysis saved successfully! Total history:', history.length)
            
            // Verify it was actually saved
            const verification = getSystemState()
            console.log('[Store] Verification read from localStorage. History count:', verification?.history?.length || 0)
            
            if (verification?.history?.length !== history.length) {
                console.error('[Store] ⚠️ WARNING: Save verification failed! Expected:', history.length, 'Got:', verification?.history?.length)
            }
            
            // Dispatch custom event to notify components
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { count: history.length } }))
            }
        } catch (e: any) {
            // Check for QuotaExceededError
            if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                if (history.length > 1) {
                    console.warn('Storage quota exceeded. Pruning history to make space...')
                    // Remove last 2 items to clear space faster
                    history.splice(-2)
                    trySave(history)
                } else {
                    console.error('Cannot save analysis: Storage full even with single item.')
                }
            } else {
                console.error('Failed to save history:', e)
            }
        }
    }

    trySave(newHistory)
}

export function saveGrowthEntry(entry: GrowthEntry, plantId?: string) {
    const state = getSystemState()
    if (!state || !state.profiles) return

    // Default to active profile if no ID provided
    const targetId = plantId || state.activeProfileId
    const profileIndex = state.profiles.findIndex(p => p.id === targetId)

    if (profileIndex === -1) {
        console.error("Target plant profile not found:", targetId)
        return
    }

    const targetProfile = state.profiles[profileIndex]
    const newGrowthHistory = [...(targetProfile.growthHistory || []), entry]

    // Soft limit
    if (newGrowthHistory.length > 50) newGrowthHistory.shift()

    // Create new profiles array safely
    const newProfiles = [...state.profiles]
    newProfiles[profileIndex] = {
        ...targetProfile,
        growthHistory: newGrowthHistory
    }

    saveSystemState({
        ...state,
        profiles: newProfiles
    })
}

export function initializeSystem(userId: string): FarmSystemState {
    const existing = getSystemState()

    if (existing && existing.userId === userId) {
        // --- MIGRATIONS ---

        let needsSave = false

        // Migration 1: Single Profile -> Multi Profile
        if (existing.profile && (!existing.profiles || existing.profiles.length === 0)) {
            console.log("Migrating Single Profile to Multi Profile...")
            const legacyProfile = existing.profile
            // Add ID if missing
            if (!legacyProfile.id) legacyProfile.id = crypto.randomUUID()
            // Safe Name Fallback
            if (!legacyProfile.name) legacyProfile.name = `${legacyProfile.cropType || 'Crop'} 1`

            existing.profiles = [legacyProfile]
            existing.activeProfileId = legacyProfile.id
            delete existing.profile // Cleanup legacy
            needsSave = true
        }

        // Migration 2: Ensure history exists
        if (!existing.history) {
            existing.history = []
            needsSave = true
        }

        if (needsSave) {
            saveSystemState(existing)
        }

        return existing
    }

    // New State Initialization
    const defaultId = crypto.randomUUID()
    const initialState: FarmSystemState = {
        userId,
        sessions: {},
        history: [],
        preferences: { expertMode: false, notificationsEnabled: true },
        horizons: {
            short: { currentDay: 1, dailyActions: [] },
            medium: { weekNumber: 1, weeklyTrends: [], insight: 'Stable' },
            long: { seasonGoals: { targetYield: 1000, currentHealthAvg: 100 }, seasonPhase: 'vegetative' }
        },
        logs: [],
        visualCache: {},
        profiles: [{
            id: defaultId,
            name: "Tomato 1",
            userId,
            location: {
                city: 'Casablanca',
                region: 'Casablanca-Settat',
                country: 'MA',
                lat: 33.57,
                lon: -7.59
            },
            cropType: 'Tomato',
            variety: 'Cherry (humid-adapted)',
            varietySpecs: {
                humidityMin: 60,
                humidityMax: 70,
                yieldPerHectare: 80000,
                pestResistance: ['Aphids']
            },
            startDate: new Date().toISOString(),
            currentStage: 'Early Vigor',
            growthHistory: [],
            preferences: {
                organicOnly: true,
                language: 'en',
                waterSavingFocus: true
            },
            seasonalAlerts: {
                preWinter: "Frost risk Nov-Dec – cover plants",
                postWinter: "Vigor check Feb-Mar – fertilize"
            }
        }],
        activeProfileId: defaultId
    }
    saveSystemState(initialState)
    return initialState
}

export function updateHistoryEntry(id: string, updater: (entry: HistoricalAnalysis) => HistoricalAnalysis) {
    const state = getSystemState()
    if (!state || !state.history) return

    const index = state.history.findIndex(h => h.id === id)
    if (index === -1) return

    // Apply update safely
    const updatedEntry = updater(state.history[index])
    const newHistory = [...state.history]
    newHistory[index] = updatedEntry

    saveSystemState({
        ...state,
        history: newHistory
    })
}

export function saveVisualToCache(prompt: string, image: string) {
    const state = getSystemState()
    if (!state) return

    // Check if already cached (redundancy check)
    if (state.visualCache && state.visualCache[prompt]) return

    try {
        saveSystemState({
            ...state,
            visualCache: {
                ...(state.visualCache || {}),
                [prompt]: image
            }
        })
    } catch (e: any) {
        // Quota Exceeded: Clear cache and try saving ONLY the new item
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('Handling Quota Exceeded: Clearing Visual Cache')
            saveSystemState({
                ...state,
                visualCache: {
                    [prompt]: image
                }
            })
        }
    }
}
