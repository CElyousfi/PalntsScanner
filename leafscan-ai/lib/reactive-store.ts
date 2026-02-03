/**
 * Reactive Store - Facebook-like real-time updates
 * All components automatically update when data changes
 * No page refresh needed!
 */

import { useEffect, useState, useCallback } from 'react'

type Listener<T> = (data: T) => void
type Unsubscribe = () => void

class ReactiveStore<T = any> {
  private data: Map<string, T> = new Map()
  private listeners: Map<string, Set<Listener<T>>> = new Map()

  /**
   * Get data from store
   */
  get(key: string): T | undefined {
    return this.data.get(key)
  }

  /**
   * Set data and notify all subscribers
   */
  set(key: string, value: T): void {
    this.data.set(key, value)
    this.notify(key, value)
  }

  /**
   * Update data with a function
   */
  update(key: string, updater: (current: T | undefined) => T): void {
    const current = this.data.get(key)
    const updated = updater(current)
    this.set(key, updated)
  }

  /**
   * Subscribe to changes
   */
  subscribe(key: string, listener: Listener<T>): Unsubscribe {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    this.listeners.get(key)!.add(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        listeners.delete(listener)
        if (listeners.size === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  /**
   * Notify all subscribers
   */
  private notify(key: string, value: T): void {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(listener => listener(value))
    }
  }

  /**
   * Delete data
   */
  delete(key: string): void {
    this.data.delete(key)
    this.notify(key, undefined as any)
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear()
    this.listeners.clear()
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.data.keys())
  }
}

// Global store instance
export const reactiveStore = new ReactiveStore()

/**
 * React hook for reactive data
 * Automatically updates component when data changes
 */
export function useReactive<T>(key: string, initialValue?: T): [T | undefined, (value: T) => void, (updater: (current: T | undefined) => T) => void] {
  const [data, setData] = useState<T | undefined>(() => {
    const stored = reactiveStore.get(key)
    return stored !== undefined ? stored : initialValue
  })

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = reactiveStore.subscribe(key, (newData) => {
      setData(newData)
    })

    // Get current value
    const current = reactiveStore.get(key)
    if (current !== undefined) {
      setData(current)
    }

    return unsubscribe
  }, [key])

  const setValue = useCallback((value: T) => {
    reactiveStore.set(key, value)
  }, [key])

  const updateValue = useCallback((updater: (current: T | undefined) => T) => {
    reactiveStore.update(key, updater)
  }, [key])

  return [data, setValue, updateValue]
}

/**
 * Hook to subscribe to multiple keys
 */
export function useReactiveMultiple<T>(keys: string[]): Map<string, T | undefined> {
  const [data, setData] = useState<Map<string, T | undefined>>(() => {
    const map = new Map<string, T | undefined>()
    keys.forEach(key => {
      map.set(key, reactiveStore.get(key))
    })
    return map
  })

  useEffect(() => {
    const unsubscribes: Unsubscribe[] = []

    keys.forEach(key => {
      const unsubscribe = reactiveStore.subscribe(key, (newData) => {
        setData(prev => {
          const next = new Map(prev)
          next.set(key, newData)
          return next
        })
      })
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [keys.join(',')])

  return data
}

/**
 * Sync reactive store with localStorage
 */
export function syncWithLocalStorage(key: string, storageKey?: string): void {
  const actualStorageKey = storageKey || key

  // Load from localStorage on init
  const stored = localStorage.getItem(actualStorageKey)
  if (stored) {
    try {
      reactiveStore.set(key, JSON.parse(stored))
    } catch (e) {
      console.error(`Failed to parse localStorage for ${actualStorageKey}`)
    }
  }

  // Subscribe to changes and save to localStorage
  reactiveStore.subscribe(key, (data) => {
    if (data !== undefined) {
      localStorage.setItem(actualStorageKey, JSON.stringify(data))
    } else {
      localStorage.removeItem(actualStorageKey)
    }
  })
}

/**
 * Sync reactive store with Supabase
 */
export async function syncWithSupabase(
  key: string,
  fetcher: () => Promise<any>,
  interval: number = 30000 // 30 seconds
): Promise<() => void> {
  // Initial fetch
  try {
    const data = await fetcher()
    reactiveStore.set(key, data)
  } catch (error) {
    console.error(`Failed to fetch ${key} from Supabase:`, error)
  }

  // Poll for updates
  const intervalId = setInterval(async () => {
    try {
      const data = await fetcher()
      reactiveStore.set(key, data)
    } catch (error) {
      console.error(`Failed to fetch ${key} from Supabase:`, error)
    }
  }, interval)

  // Return cleanup function
  return () => clearInterval(intervalId)
}
