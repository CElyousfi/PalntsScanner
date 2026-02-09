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
        // Guest mode enabled - no redirect needed
        // Users can access the full app without authentication
        console.log('[AuthGuard] Guest mode active:', user?.isGuest ? 'Guest User' : user?.email || 'Loading')
    }, [isLoading, isAuthenticated, router, pathname, user])

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

    // Allow all users (including guests) to access the app
    return <>{children}</>
}
