'use client'

import { useEffect } from 'react'
import { reactiveStore } from '@/lib/reactive-store'
import { getSystemState } from '@/lib/store'

/**
 * Global State Synchronizer
 * Automatically updates ALL components when data changes
 * NO REFRESH NEEDED - Just like Facebook!
 */
export default function GlobalStateSync() {
  useEffect(() => {
    console.log('[GlobalStateSync] 🚀 Initializing reactive system...')

    // Load initial state into reactive store
    const initialState = getSystemState()
    if (initialState) {
      reactiveStore.set('system-state', initialState)
      reactiveStore.set('history', initialState.history || [])
      reactiveStore.set('profiles', initialState.profiles || [])
      reactiveStore.set('active-profile', initialState.profiles?.find(p => p.id === initialState.activeProfileId))
      console.log('[GlobalStateSync] ✅ Initial state loaded')
    }

    // Listen for localStorage changes (from other tabs or components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'leafscan_v2_system' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue)
          reactiveStore.set('system-state', newState)
          reactiveStore.set('history', newState.history || [])
          reactiveStore.set('profiles', newState.profiles || [])
          reactiveStore.set('active-profile', newState.profiles?.find((p: any) => p.id === newState.activeProfileId))
          console.log('[GlobalStateSync] ⚡ State updated from storage change!')
        } catch (error) {
          console.error('[GlobalStateSync] Failed to parse storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Poll for changes every 100ms (ultra-fast updates)
    let lastState = JSON.stringify(initialState)
    const pollInterval = setInterval(() => {
      const currentState = getSystemState()
      const currentStateStr = JSON.stringify(currentState)
      
      if (currentStateStr !== lastState && currentState) {
        lastState = currentStateStr
        reactiveStore.set('system-state', currentState)
        reactiveStore.set('history', currentState.history || [])
        reactiveStore.set('profiles', currentState.profiles || [])
        reactiveStore.set('active-profile', currentState.profiles?.find(p => p.id === currentState.activeProfileId))
        console.log('[GlobalStateSync] ⚡ State updated from poll!')
        
        // Force re-render of all components by dispatching custom event
        window.dispatchEvent(new CustomEvent('leafscan-state-update', { detail: currentState }))
      }
    }, 100) // Check every 100ms

    console.log('[GlobalStateSync] ✅ Reactive system active!')

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
      console.log('[GlobalStateSync] 🛑 Reactive system stopped')
    }
  }, [])

  return null // This component doesn't render anything
}
