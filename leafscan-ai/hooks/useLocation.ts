import { useState, useEffect, useRef } from 'react'

interface Location {
    latitude: number
    longitude: number
    accuracy?: number
    source: 'gps' | 'ip'
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
            setError('Geolocation is not supported by your browser')
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
                console.warn("GPS failed:", err)
                if (!location) {
                    setError('Unable to access your location. Please enable GPS and try again.')
                    setLoading(false)
                }
            },
            options
        )
    }

    // Don't auto-load any default - location must be explicitly requested
    useEffect(() => {
        // Location will be requested by user interaction
        setLoading(false)
    }, [])

    return { location, error, loading, requestLocation }
}
