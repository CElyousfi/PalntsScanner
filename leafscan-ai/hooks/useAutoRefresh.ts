'use client'

import { useEffect, useState } from 'react'
import { getSystemState } from '@/lib/store'

/**
 * Hook that automatically refreshes component when data changes
 * NO MANUAL REFRESH NEEDED - Just like Facebook!
 */
export function useAutoRefresh() {
  const [, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const handleUpdate = () => {
      // Force re-render
      setUpdateTrigger(prev => prev + 1)
    }

    // Listen for state updates
    window.addEventListener('leafscan-state-update', handleUpdate)

    return () => {
      window.removeEventListener('leafscan-state-update', handleUpdate)
    }
  }, [])

  return getSystemState()
}

/**
 * Hook for history that auto-refreshes
 */
export function useAutoHistory() {
  const state = useAutoRefresh()
  return state?.history || []
}

/**
 * Hook for profiles that auto-refreshes
 */
export function useAutoProfiles() {
  const state = useAutoRefresh()
  return state?.profiles || []
}

/**
 * Hook for active profile that auto-refreshes
 */
export function useAutoActiveProfile() {
  const state = useAutoRefresh()
  return state?.profiles?.find(p => p.id === state.activeProfileId)
}

/**
 * Hook for latest analysis that auto-refreshes
 */
export function useAutoLatestAnalysis() {
  const history = useAutoHistory()
  return history[0]
}

/**
 * Hook for analysis count that auto-refreshes
 */
export function useAutoAnalysesCount() {
  const history = useAutoHistory()
  return history.length
}
