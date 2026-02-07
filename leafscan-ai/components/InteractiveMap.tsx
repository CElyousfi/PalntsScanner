'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Navigation, ShoppingBag, Phone, Globe } from 'lucide-react'
import { Supplier } from '@/types'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''

interface InteractiveMapProps {
    suppliers: Supplier[]
    userLocation?: { lat: number, lng: number }
    height?: string
    onSupplierClick?: (supplier: Supplier) => void
}

export default function InteractiveMap({
    suppliers,
    userLocation,
    height = '400px',
    onSupplierClick
}: InteractiveMapProps) {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script-interactive', // Unique ID to avoid conflicts if multiple maps load? (Actually shared ID is better usually if same key/libs)
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    })

    const center = useMemo(() => {
        if (userLocation) {
            return { lat: userLocation.lat, lng: userLocation.lng }
        }
        return { lat: 33.5731, lng: -7.5898 }
    }, [userLocation])

    const onLoad = useCallback((map: google.maps.Map) => {
        setMapInstance(map)
    }, [])

    const onUnmount = useCallback(() => {
        setMapInstance(null)
    }, [])

    if (loadError) {
        return (
            <div className="w-full bg-stone-100 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 text-sm" style={{ height }}>
                Map failed to load. Check API Key.
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="w-full bg-stone-100 flex items-center justify-center rounded-xl border border-stone-200" style={{ height }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden', position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={center}
                zoom={13}
                options={{
                    mapTypeId: 'satellite',
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {/* User Location */}
                {userLocation && (
                    <Marker
                        position={center}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#3B82F6",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        }}
                        title="Your Farm"
                    />
                )}

                {/* Suppliers */}
                {suppliers.map((supplier, index) => (
                    supplier.location && (
                        <Marker
                            key={index}
                            position={{ lat: supplier.location.lat, lng: supplier.location.lng }}
                            onClick={() => setSelectedSupplier(supplier)}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                            }}
                        />
                    )
                ))}

                {/* Info Window */}
                {selectedSupplier && selectedSupplier.location && (
                    <InfoWindow
                        position={{ lat: selectedSupplier.location.lat, lng: selectedSupplier.location.lng }}
                        onCloseClick={() => setSelectedSupplier(null)}
                    >
                        <div className="p-2 min-w-[200px] font-sans">
                            <h3 className="font-bold text-gray-900 text-sm mb-1">{selectedSupplier.name}</h3>
                            <p className="text-xs text-gray-600 mb-1">{selectedSupplier.type}</p>
                            <div className="flex items-center text-xs text-blue-600 font-bold mb-2">
                                <span>{selectedSupplier.distance_km} km away</span>
                            </div>
                            <button
                                onClick={() => onSupplierClick?.(selectedSupplier)}
                                className="w-full bg-green-600 text-white text-xs py-1.5 px-3 rounded hover:bg-green-700 transition flex items-center justify-center gap-1"
                            >
                                Reserve Treatment
                            </button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Overlay Legend */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-10 text-xs text-black">
                <h4 className="font-bold mb-2 text-gray-800">Map Legend</h4>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow"></div>
                    <span className="text-gray-600">Your Farm</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600 border border-white shadow"></div>
                    <span className="text-gray-600">Verified Suppliers</span>
                </div>
            </div>
        </div>
    )
}
