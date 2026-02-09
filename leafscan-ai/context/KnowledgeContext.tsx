'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface AIGuide {
    id: string
    title: string
    category: string
    description: string // Short summary
    fullContent: string // Markdown or plain text
    readTime: string
    tags: string[]
    createdAt: string
    iconType?: 'sparkles' | 'bug' | 'sun' | 'droplets' | 'leaf'
    image?: string
    // Extended fields for rich content
    images?: { url: string; title: string }[]
    keyTakeaways?: string[]
    sources?: { title: string; url: string; source: string; snippet?: string }[]
    recommendations?: string[]
}

interface KnowledgeContextType {
    savedGuides: AIGuide[]
    saveGuide: (guide: AIGuide) => void
    deleteGuide: (id: string) => void
    isGuideSaved: (id: string) => boolean
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined)

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
    const [savedGuides, setSavedGuides] = useState<AIGuide[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('leafscan_kb_guides')
        if (stored) {
            setSavedGuides(JSON.parse(stored))
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('leafscan_kb_guides', JSON.stringify(savedGuides))
        }
    }, [savedGuides, isLoaded])

    const saveGuide = (guide: AIGuide) => {
        if (savedGuides.some(g => g.id === guide.id)) return
        setSavedGuides(prev => [guide, ...prev])
    }

    const deleteGuide = (id: string) => {
        setSavedGuides(prev => prev.filter(g => g.id !== id))
    }

    const isGuideSaved = (id: string) => savedGuides.some(g => g.id === id)

    return (
        <KnowledgeContext.Provider value={{ savedGuides, saveGuide, deleteGuide, isGuideSaved }}>
            {children}
        </KnowledgeContext.Provider>
    )
}

export function useKnowledge() {
    const context = useContext(KnowledgeContext)
    if (context === undefined) {
        throw new Error('useKnowledge must be used within a KnowledgeProvider')
    }
    return context
}
