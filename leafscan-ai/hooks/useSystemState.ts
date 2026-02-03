/**
 * React hooks for accessing system state with automatic updates
 * No page refresh needed - components update instantly!
 */

import { useReactive } from '@/lib/reactive-store'
import { FarmSystemState, HistoricalAnalysis, getSystemState } from '@/lib/store'
import { FarmProfile } from '@/types'

/**
 * Get entire system state with automatic updates
 */
export function useSystemState() {
  const [state] = useReactive<FarmSystemState>('system-state', getSystemState() || undefined)
  return state
}

/**
 * Get history with automatic updates
 */
export function useHistory() {
  const [history] = useReactive<HistoricalAnalysis[]>('history', [])
  return history || []
}

/**
 * Get profiles with automatic updates
 */
export function useProfiles() {
  const [profiles] = useReactive<FarmProfile[]>('profiles', [])
  return profiles || []
}

/**
 * Get active profile with automatic updates
 */
export function useActiveProfile() {
  const [profile] = useReactive<FarmProfile | undefined>('active-profile')
  return profile
}

/**
 * Get specific analysis by ID with automatic updates
 */
export function useAnalysis(id: string) {
  const history = useHistory()
  return history.find(a => a.id === id)
}

/**
 * Get latest analysis with automatic updates
 */
export function useLatestAnalysis() {
  const history = useHistory()
  return history[0]
}

/**
 * Get analyses count with automatic updates
 */
export function useAnalysesCount() {
  const history = useHistory()
  return history.length
}

/**
 * Get profiles count with automatic updates
 */
export function useProfilesCount() {
  const profiles = useProfiles()
  return profiles.length
}
