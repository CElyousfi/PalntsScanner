'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isLoading && !isAuthenticated) {
            console.log('[AuthGuard] User not authenticated, redirecting to login')
            router.push('/auth/login')
        }
    }, [isLoading, isAuthenticated, router])

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
