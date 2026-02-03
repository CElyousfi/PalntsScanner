/**
 * SPA Cache Manager
 * Provides Facebook-like instant updates without page refreshes
 */

type CacheEntry = {
  data: any
  timestamp: number
  ttl: number
}

class SPACache {
  private cache: Map<string, CacheEntry> = new Map()
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()

  /**
   * Get data from cache
   */
  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set data in cache and notify subscribers
   */
  set(key: string, data: any, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    // Notify all subscribers
    this.notify(key, data)
  }

  /**
   * Subscribe to cache updates
   */
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }

    this.subscribers.get(key)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  /**
   * Notify all subscribers of a key
   */
  private notify(key: string, data: any): void {
    const subs = this.subscribers.get(key)
    if (subs) {
      subs.forEach(callback => callback(data))
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    this.notify(key, null)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.subscribers.clear()
  }

  /**
   * Prefetch data
   */
  async prefetch(key: string, fetcher: () => Promise<any>, ttl: number = 60000): Promise<void> {
    if (this.get(key)) return // Already cached

    try {
      const data = await fetcher()
      this.set(key, data, ttl)
    } catch (error) {
      console.error(`[SPACache] Prefetch failed for ${key}:`, error)
    }
  }
}

// Global singleton instance
export const spaCache = new SPACache()

/**
 * React hook for using SPA cache
 */
export function useSPACache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 60000) {
  const [data, setData] = React.useState<T | null>(() => spaCache.get(key))
  const [loading, setLoading] = React.useState(!data)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    // Subscribe to cache updates
    const unsubscribe = spaCache.subscribe(key, (newData) => {
      setData(newData)
      setLoading(false)
    })

    // Fetch if not in cache
    if (!data) {
      setLoading(true)
      fetcher()
        .then((result) => {
          spaCache.set(key, result, ttl)
          setData(result)
          setError(null)
        })
        .catch((err) => {
          setError(err)
        })
        .finally(() => {
          setLoading(false)
        })
    }

    return unsubscribe
  }, [key])

  const refetch = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetcher()
      spaCache.set(key, result, ttl)
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  return { data, loading, error, refetch }
}

// Import React for the hook
import React from 'react'
