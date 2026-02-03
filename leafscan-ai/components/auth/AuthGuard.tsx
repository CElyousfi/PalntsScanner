'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const hasRedirected = useRef(false)

    useEffect(() => {
        // Only redirect once and if not already on auth page
        if (!isLoading && !isAuthenticated && !hasRedirected.current && !pathname.startsWith('/auth')) {
            console.log('[AuthGuard] User not authenticated, redirecting to login')
            hasRedirected.current = true
            router.push('/auth/login')
        }
        
        // Reset redirect flag when user becomes authenticated
        if (isAuthenticated) {
            hasRedirected.current = false
        }
    }, [isLoading, isAuthenticated, router, pathname])

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-apeel-green to-[#1e3a29]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white font-bold text-lg">Loading LeafScan AI...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, show nothing (will redirect)
    if (!isAuthenticated) {
        return null
    }

    // User is authenticated, show protected content
    return <>{children}</>
}
