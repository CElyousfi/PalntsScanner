'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializeSystem } from '@/lib/store'
import { getCurrentUser, onAuthStateChange, toAuthUser, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

// Define the User Profile structure (extended from AuthUser)
export interface UserProfile extends AuthUser {
    region?: string // Important for crop autonomy (weather)
    role?: 'expert' | 'farmer'
    isGuest?: boolean // Flag to indicate guest mode
}

interface AuthContextType {
    user: UserProfile | null
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string, region?: string) => Promise<void>
    logout: () => Promise<void>
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Helper to create or get guest user
    const createOrGetGuestUser = (): UserProfile => {
        // Check if guest ID exists in localStorage
        let guestId = localStorage.getItem('leafscan_guest_id')
        
        if (!guestId) {
            // Generate new guest ID
            guestId = `guest_${crypto.randomUUID()}`
            localStorage.setItem('leafscan_guest_id', guestId)
            console.log('[AuthContext] 🎭 Created new guest user:', guestId)
        } else {
            console.log('[AuthContext] 🎭 Using existing guest user:', guestId)
        }

        const guestProfile: UserProfile = {
            id: guestId,
            email: 'guest@leafscan.local',
            name: 'Guest User',
            region: 'Casablanca',
            role: 'farmer',
            isGuest: true
        }

        return guestProfile
    }

    useEffect(() => {
        console.log('[AuthContext] Initializing auth check...')
        
        // Check active Supabase session
        getCurrentUser().then((currentUser) => {
            if (currentUser) {
                console.log('[AuthContext] ✅ User found:', currentUser.email)
                const authUser = toAuthUser(currentUser)
                const profile: UserProfile = {
                    ...authUser,
                    region: currentUser.user_metadata?.region || 'Casablanca',
                    role: currentUser.user_metadata?.role || 'farmer',
                    isGuest: false
                }
                setUser(profile)
                console.log('[AuthContext] User profile set:', profile.email)
                
                // Initialize system for this user
                try {
                    initializeSystem(profile.id)
                } catch (e) {
                    console.error("System Initialization Failed", e)
                    localStorage.removeItem('leafscan_v2_system')
                    initializeSystem(profile.id)
                }
            } else {
                console.log('[AuthContext] ❌ No authenticated user, creating guest user')
                // Create guest user for full app access
                const guestProfile = createOrGetGuestUser()
                setUser(guestProfile)
                
                // Initialize system for guest user
                try {
                    initializeSystem(guestProfile.id)
                } catch (e) {
                    console.error("Guest System Initialization Failed", e)
                    localStorage.removeItem('leafscan_v2_system')
                    initializeSystem(guestProfile.id)
                }
            }
            setIsLoading(false)
        }).catch(error => {
            console.error('[AuthContext] Error getting current user:', error)
            // Fallback to guest mode on error
            const guestProfile = createOrGetGuestUser()
            setUser(guestProfile)
            initializeSystem(guestProfile.id)
            setIsLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((authUser) => {
            console.log('[AuthContext] Auth state changed:', authUser ? authUser.email : 'logged out')
            if (authUser) {
                const profile: UserProfile = {
                    ...authUser,
                    region: 'Casablanca', // Default region
                    role: 'farmer',
                    isGuest: false
                }
                setUser(profile)
                initializeSystem(profile.id)
            } else {
                // User logged out, switch to guest mode
                const guestProfile = createOrGetGuestUser()
                setUser(guestProfile)
                initializeSystem(guestProfile.id)
            }
            setIsLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const login = async (email: string, password: string) => {
        const { user: authUser } = await supabaseSignIn(email, password)
        if (authUser) {
            const profile: UserProfile = {
                ...toAuthUser(authUser),
                region: authUser.user_metadata?.region || 'Casablanca',
                role: authUser.user_metadata?.role || 'farmer',
                isGuest: false
            }
            setUser(profile)
            initializeSystem(profile.id)
            // Don't redirect here - let the calling page handle it
        }
    }

    const signup = async (name: string, email: string, password: string, region: string = 'Casablanca') => {
        const { user: authUser } = await supabaseSignUp(email, password, name)
        if (authUser) {
            // Update user metadata with region
            const profile: UserProfile = {
                ...toAuthUser(authUser),
                region,
                role: 'farmer',
                isGuest: false
            }
            setUser(profile)
            initializeSystem(profile.id)
            // Don't redirect here - let the calling page handle it
        }
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' })
        } catch (error) {
            console.error('[AuthContext] Logout error:', error)
        }
        
        // Switch to guest mode instead of redirecting to login
        localStorage.removeItem('leafscan_v2_system')
        const guestProfile = createOrGetGuestUser()
        setUser(guestProfile)
        initializeSystem(guestProfile.id)
        
        // Stay on dashboard as guest
        router.push('/dashboard')
    }

    const contextValue = React.useMemo(() => ({
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading
    }), [user, login, signup, logout, isLoading])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
