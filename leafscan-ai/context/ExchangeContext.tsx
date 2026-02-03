'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Listing {
    id: string
    type: 'donation' | 'request' | 'for_sale'
    item: string
    qty: string
    dist: string
    user: string
    time: string
    status: 'available' | 'claimed' | 'completed'
    description?: string
}

interface ExchangeContextType {
    listings: Listing[]
    myClaims: Listing[]
    addListing: (listing: Omit<Listing, 'id' | 'status' | 'time' | 'user' | 'dist'>) => void
    claimListing: (id: string, claimerName: string) => void
    isLoading: boolean
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined)

const INITIAL_MOCK_LISTINGS: Listing[] = [
    { id: '1', type: 'donation', item: 'Organic Zucchini', qty: '5kg', dist: '0.8km', user: 'Sarah M.', time: '2h ago', status: 'available', description: 'Fresh from my backyard!' },
    { id: '2', type: 'donation', item: 'Heirloom Tomatoes', qty: '2kg', dist: '1.2km', user: 'EcoFarm Co.', time: '4h ago', status: 'available', description: 'Surplus from market day.' },
    { id: '3', type: 'donation', item: 'Fresh Basil', qty: '10 bunches', dist: '2.5km', user: 'Community Garden', time: '5h ago', status: 'available', description: 'Smells amazing, chemical free.' },
    { id: '4', type: 'request', item: 'Compost Soil', qty: '2 bags', dist: '0.5km', user: 'Newbie Grower', time: '1d ago', status: 'available', description: 'Need starter soil for balcony.' }
]

export function ExchangeProvider({ children }: { children: React.ReactNode }) {
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from LocalStorage
    useEffect(() => {
        const stored = localStorage.getItem('leafscan_market_listings')
        if (stored) {
            setListings(JSON.parse(stored))
        } else {
            setListings(INITIAL_MOCK_LISTINGS)
        }
        setIsLoading(false)
    }, [])

    // Persist to LocalStorage
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('leafscan_market_listings', JSON.stringify(listings))
        }
    }, [listings, isLoading])

    const addListing = (data: Omit<Listing, 'id' | 'status' | 'time' | 'user' | 'dist'>) => {
        const newListing: Listing = {
            id: Date.now().toString(),
            ...data,
            user: 'You', // Simulate logged in user
            dist: '0.1km', // Assume close prox
            time: 'Just now',
            status: 'available'
        }
        setListings(prev => [newListing, ...prev])
    }

    const claimListing = (id: string, claimerName: string) => {
        setListings(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'claimed' } : item
        ))
        // In a real app we would create a transaction record here
        // For simulation, changing status is enough
    }

    const myClaims = listings.filter(l => l.status === 'claimed') // Simplified logic: simulation assumes user sees all claimed items for demo

    return (
        <ExchangeContext.Provider value={{ listings, myClaims, addListing, claimListing, isLoading }}>
            {children}
        </ExchangeContext.Provider>
    )
}

export function useExchange() {
    const context = useContext(ExchangeContext)
    if (context === undefined) {
        throw new Error('useExchange must be used within an ExchangeProvider')
    }
    return context
}
