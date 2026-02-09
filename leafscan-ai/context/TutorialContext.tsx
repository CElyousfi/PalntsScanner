'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthContext'

interface TutorialContextType {
    activeTutorial: string | null
    startTutorial: (pageId: string) => void
    completeTutorial: (pageId: string) => void
    dismissTutorial: () => void
    resetTutorials: () => void
    isTutorialActive: boolean
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const [activeTutorial, setActiveTutorial] = useState<string | null>(null)
    const [completedTutorials, setCompletedTutorials] = useState<string[]>([])
    const { user, isLoading } = useAuth()
    const pathname = usePathname()

    // Load completed tutorials from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('leafscan_completed_tutorials')
        if (saved) {
            setCompletedTutorials(JSON.parse(saved))
        }
    }, [])

    // Automatically trigger tutorial for new/guest users on specific pages
    useEffect(() => {
        if (isLoading || !user) return

        // Map routes to tutorial IDs
        const routeMap: Record<string, string> = {
            '/dashboard': 'dashboard',
            '/dashboard/scan': 'scan',
            '/dashboard/history': 'history',
            '/dashboard/threat-map': 'map',
            '/dashboard/explore': 'explore',
            '/dashboard/notes': 'notes'
        }

        const currentTutorialId = routeMap[pathname]

        // If we have a tutorial for this page, and it's not completed, and no other tutorial is active
        if (currentTutorialId &&
            !completedTutorials.includes(currentTutorialId) &&
            !activeTutorial) {

            // For guests or new users (we can assume new if they haven't completed dashboard tutorial)
            // Or simply if they haven't completed THIS tutorial yet.
            // Let's be aggressive for now as requested: "every fresh user... navigate through all functionalities"

            // Small delay to allow page UI to settle
            const timer = setTimeout(() => {
                setActiveTutorial(currentTutorialId)
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [pathname, user, isLoading, completedTutorials, activeTutorial])

    const startTutorial = (pageId: string) => {
        setActiveTutorial(pageId)
    }

    const completeTutorial = (pageId: string) => {
        const newCompleted = [...completedTutorials, pageId]
        setCompletedTutorials(newCompleted)
        localStorage.setItem('leafscan_completed_tutorials', JSON.stringify(newCompleted))
        setActiveTutorial(null)
    }

    const dismissTutorial = () => {
        setActiveTutorial(null)
    }

    const resetTutorials = () => {
        setCompletedTutorials([])
        localStorage.removeItem('leafscan_completed_tutorials')
        window.location.reload()
    }

    return (
        <TutorialContext.Provider value={{
            activeTutorial,
            startTutorial,
            completeTutorial,
            dismissTutorial,
            resetTutorials,
            isTutorialActive: !!activeTutorial
        }}>
            {children}
        </TutorialContext.Provider>
    )
}

export function useTutorial() {
    const context = useContext(TutorialContext)
    if (context === undefined) {
        throw new Error('useTutorial must be used within a TutorialProvider')
    }
    return context
}
