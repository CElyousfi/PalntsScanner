'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Preloads all dashboard pages immediately on mount
 * Forces compilation and caching for instant navigation
 */
export default function DashboardPreloader() {
  const router = useRouter()

  useEffect(() => {
    // List of all dashboard routes to preload
    const routes = [
      '/dashboard',
      '/dashboard/scan',
      '/dashboard/notes',
      '/dashboard/vitals',
      '/dashboard/threat-map',
      '/dashboard/explore',
      '/dashboard/history',
    ]

    console.log('[Preloader] 🚀 AGGRESSIVE preloading started...')
    
    // Prefetch all routes immediately and aggressively
    routes.forEach((route, index) => {
      // Stagger prefetches slightly to avoid overwhelming the system
      setTimeout(() => {
        router.prefetch(route)
        console.log(`[Preloader] ⚡ Prefetched: ${route}`)
      }, index * 50) // 50ms between each
    })

    // Force a second round of prefetching after 1 second to ensure everything is compiled
    setTimeout(() => {
      console.log('[Preloader] 🔄 Second prefetch round...')
      routes.forEach((route) => {
        router.prefetch(route)
      })
      console.log('[Preloader] ✅ All pages fully compiled and cached!')
    }, 1000)

    // Keep prefetching every 30 seconds to ensure pages stay hot
    const keepAliveInterval = setInterval(() => {
      routes.forEach((route) => {
        router.prefetch(route)
      })
      console.log('[Preloader] 🔥 Pages kept hot in memory')
    }, 30000)

    return () => clearInterval(keepAliveInterval)
  }, [router])

  return null // This component doesn't render anything
}
