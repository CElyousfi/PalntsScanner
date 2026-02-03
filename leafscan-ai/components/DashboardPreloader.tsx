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

    // Prefetch all routes immediately
    console.log('[Preloader] 🚀 Preloading all dashboard pages...')
    
    routes.forEach((route) => {
      router.prefetch(route)
    })

    console.log('[Preloader] ✅ All pages preloaded and ready!')
  }, [router])

  return null // This component doesn't render anything
}
