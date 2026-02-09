'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface UserLocation {
    lat: number
    lng: number
    accuracy?: number
    source: 'gps' | 'ip'
    timestamp: number
    city?: string
    country?: string
}

interface LocationContextType {
    location: UserLocation | null
    isLoading: boolean
    error: string | null
    hasPermission: boolean
    requestLocation: () => Promise<void>
    updateLocation: (loc: UserLocation) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<UserLocation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasPermission, setHasPermission] = useState(false)
    const [watchId, setWatchId] = useState<number | null>(null)

    // Clean up watch on unmount
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [watchId])

    // Request location from user
    const requestLocation = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            setIsLoading(false)
            return
        }

        try {
            // Request permission and get position
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                )
            })

            const userLocation: UserLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                source: 'gps',
                timestamp: Date.now()
            }

            // Try to get city/country from reverse geocoding (optional)
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&format=json`
                )
                const data = await response.json()
                userLocation.city = data.address?.city || data.address?.town || data.address?.village
                userLocation.country = data.address?.country
            } catch (geocodeError) {
                console.log('[LocationContext] Reverse geocoding failed:', geocodeError)
            }

            setLocation(userLocation)
            setHasPermission(true)
            setIsLoading(false)
            
            // Save to localStorage
            localStorage.setItem('leafscan_location_permission', 'granted')
            localStorage.setItem('leafscan_user_location', JSON.stringify(userLocation))

            console.log('[LocationContext] ✅ Location acquired:', userLocation)

            // Start watching for location changes
            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    const updatedLocation: UserLocation = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        source: 'gps',
                        timestamp: Date.now(),
                        city: userLocation.city,
                        country: userLocation.country
                    }
                    setLocation(updatedLocation)
                    localStorage.setItem('leafscan_user_location', JSON.stringify(updatedLocation))
                    console.log('[LocationContext] 📍 Location updated:', updatedLocation)
                },
                (err) => {
                    console.warn('[LocationContext] Watch position error:', err)
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 10000
                }
            )
            setWatchId(id)

        } catch (err: any) {
            console.error('[LocationContext] ❌ Location error:', err)
            setError(err.message || 'Unable to get your location')
            setIsLoading(false)
            setHasPermission(false)
            localStorage.setItem('leafscan_location_permission', 'denied')
        }
    }, [])

    // Check for saved location on mount
    useEffect(() => {
        const savedPermission = localStorage.getItem('leafscan_location_permission')
        const savedLocation = localStorage.getItem('leafscan_user_location')

        if (savedPermission === 'granted' && savedLocation) {
            try {
                const parsedLocation = JSON.parse(savedLocation)
                // Check if location is not too old (less than 1 hour)
                if (Date.now() - parsedLocation.timestamp < 3600000) {
                    setLocation(parsedLocation)
                    setHasPermission(true)
                    setIsLoading(false)
                    console.log('[LocationContext] 📦 Loaded cached location')
                    
                    // Refresh location in background
                    requestLocation()
                    return
                }
            } catch (e) {
                console.error('[LocationContext] Failed to parse saved location')
            }
        }

        // No saved location or permission not granted - request it
        if (savedPermission !== 'denied') {
            // Auto-request on first load
            requestLocation()
        } else {
            setIsLoading(false)
        }
    }, [requestLocation])

    const updateLocation = useCallback((loc: UserLocation) => {
        setLocation(loc)
        localStorage.setItem('leafscan_user_location', JSON.stringify(loc))
    }, [])

    const contextValue: LocationContextType = {
        location,
        isLoading,
        error,
        hasPermission,
        requestLocation,
        updateLocation
    }

    return (
        <LocationContext.Provider value={contextValue}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocationContext() {
    const context = useContext(LocationContext)
    if (!context) {
        throw new Error('useLocationContext must be used within a LocationProvider')
    }
    return context
}
