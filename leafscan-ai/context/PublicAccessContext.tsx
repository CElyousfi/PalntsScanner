'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PublicAccessContextType {
    isPublicMode: boolean
    togglePublicMode: () => void
}

const PublicAccessContext = createContext<PublicAccessContextType | undefined>(undefined)

export function PublicAccessProvider({ children }: { children: React.ReactNode }) {
    const [isPublicMode, setIsPublicMode] = useState(false)

    useEffect(() => {
        // Persist preference
        const stored = localStorage.getItem('publicAccessMode')
        if (stored === 'true') setIsPublicMode(true)
    }, [])

    const togglePublicMode = () => {
        setIsPublicMode(prev => {
            const newValue = !prev
            localStorage.setItem('publicAccessMode', String(newValue))
            // Apply class to body for global styling overrides
            if (newValue) {
                document.body.classList.add('public-access-mode')
            } else {
                document.body.classList.remove('public-access-mode')
            }
            return newValue
        })
    }

    return (
        <PublicAccessContext.Provider value={{ isPublicMode, togglePublicMode }}>
            {children}
        </PublicAccessContext.Provider>
    )
}

export function usePublicAccess() {
    const context = useContext(PublicAccessContext)
    if (context === undefined) {
        throw new Error('usePublicAccess must be used within a PublicAccessProvider')
    }
    return context
}
