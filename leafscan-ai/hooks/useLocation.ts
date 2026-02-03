import { useState, useEffect, useRef } from 'react'

interface Location {
    latitude: number
    longitude: number
    accuracy?: number
    source: 'gps' | 'ip' | 'default'
}

// Default location: Casablanca, Morocco
const DEFAULT_LOCATION: Location = {
    latitude: 33.5731,
    longitude: -7.5898,
    source: 'default'
}

export function useLocation() {
    const [location, setLocation] = useState<Location | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const watchId = useRef<number | null>(null)

    // Clean up watch on unmount
    useEffect(() => {
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current)
            }
        }
    }, [])

    const requestLocation = () => {
        setLoading(true)
        if (!navigator.geolocation) {
            setError('Geolocation not supported')
            setLocation(DEFAULT_LOCATION)
            setLoading(false)
            return
        }

        // Clear existing watch if any
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current)
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    source: 'gps'
                })
                setLoading(false)
                setError(null)
            },
            (err) => {
                console.warn("GPS failed, using default/IP fallback", err)
                // Only set error if we haven't got a location yet? 
                // Or maybe just let it fail silently if it's an update failure?
                if (!location) {
                    setError('GPS Access Denied')
                    setLocation(DEFAULT_LOCATION)
                    setLoading(false)
                }
            },
            options
        )
    }

    // Auto-load IP location or default on mount
    useEffect(() => {
        // Mocking an IP location fetch for now
        setLocation(DEFAULT_LOCATION)
        setLoading(false)
    }, [])

    return { location, error, loading, requestLocation }
}
