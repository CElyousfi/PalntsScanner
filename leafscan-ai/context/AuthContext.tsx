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
                    role: currentUser.user_metadata?.role || 'farmer'
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
                console.log('[AuthContext] ❌ No user found')
            }
            setIsLoading(false)
        }).catch(error => {
            console.error('[AuthContext] Error getting current user:', error)
            setIsLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((authUser) => {
            console.log('[AuthContext] Auth state changed:', authUser ? authUser.email : 'logged out')
            if (authUser) {
                const profile: UserProfile = {
                    ...authUser,
                    region: 'Casablanca', // Default region
                    role: 'farmer'
                }
                setUser(profile)
                initializeSystem(profile.id)
            } else {
                setUser(null)
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
                role: authUser.user_metadata?.role || 'farmer'
            }
            setUser(profile)
            initializeSystem(profile.id)
            router.push('/dashboard')
        }
    }

    const signup = async (name: string, email: string, password: string, region: string = 'Casablanca') => {
        const { user: authUser } = await supabaseSignUp(email, password, name)
        if (authUser) {
            // Update user metadata with region
            const profile: UserProfile = {
                ...toAuthUser(authUser),
                region,
                role: 'farmer'
            }
            setUser(profile)
            initializeSystem(profile.id)
            router.push('/dashboard')
        }
    }

    const logout = async () => {
        await supabaseSignOut()
        setUser(null)
        localStorage.removeItem('leafscan_v2_system')
        router.push('/auth/login')
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
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
