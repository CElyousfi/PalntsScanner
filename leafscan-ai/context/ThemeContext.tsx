'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMission } from './MissionContext'

type ThemeColors = {
    name: 'healer' | 'grower' | 'explorer'
    primary: string
    secondary: string
    accent: string
    background: string // For fallback
    text: string
    textLight: string
    border: string
    glass: string
    glassBorder: string
    gradient: string
}

const THEMES: Record<string, ThemeColors> = {
    healer: {
        name: 'healer',
        primary: 'text-red-600',
        secondary: 'text-red-500',
        accent: 'bg-red-600',
        background: 'bg-red-50',
        text: 'text-gray-900',
        textLight: 'text-red-200',
        border: 'border-red-200',
        glass: 'bg-red-950/30', // Darker glass for contrast against bright GIFs? Or light? let's go light for now.
        glassBorder: 'border-red-200/50',
        gradient: 'from-red-500 to-orange-500'
    },
    grower: {
        name: 'grower',
        primary: 'text-apeel-green', // Using existing custom color or Emerald
        secondary: 'text-emerald-500',
        accent: 'bg-apeel-green',
        background: 'bg-emerald-50',
        text: 'text-gray-900',
        textLight: 'text-emerald-200',
        border: 'border-emerald-200',
        glass: 'bg-white/40',
        glassBorder: 'border-white/50',
        gradient: 'from-apeel-green to-emerald-600'
    },
    explorer: {
        name: 'explorer',
        primary: 'text-indigo-600',
        secondary: 'text-violet-500',
        accent: 'bg-indigo-600',
        background: 'bg-indigo-50',
        text: 'text-gray-900',
        textLight: 'text-indigo-200',
        border: 'border-indigo-200',
        glass: 'bg-white/30',
        glassBorder: 'border-white/40',
        gradient: 'from-indigo-500 to-purple-600'
    }
}

interface ThemeContextType {
    theme: ThemeColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { mission } = useMission()
    const [theme, setTheme] = useState<ThemeColors>(THEMES.grower)

    useEffect(() => {
        if (mission === 'healer') {
            setTheme(THEMES.healer)
        } else if (mission === 'explorer') {
            setTheme(THEMES.explorer)
        } else {
            setTheme(THEMES.grower)
        }
    }, [mission])

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
