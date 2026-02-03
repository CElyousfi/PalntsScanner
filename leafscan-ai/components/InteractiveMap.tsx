'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Navigation, ShoppingBag } from 'lucide-react'

// Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhcmFmeXNmIiwiYSI6ImNta3o4MWo5eDBidmIzZnM4eGtzbWZ2YjAifQ.FSxH6cWa1lqTfAgizzDzFA'

import { Supplier } from '@/types'

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
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [lng, setLng] = useState(userLocation?.lng || -7.5898)
    const [lat, setLat] = useState(userLocation?.lat || 33.5731) // Casablanca default
    const [zoom, setZoom] = useState(11)

    useEffect(() => {
        if (map.current || !mapContainer.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite for agriculture context
            center: [lng, lat],
            zoom: zoom,
            pitch: 45, // 3D effect
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

        // Add geolocation control
        map.current.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        }))

        // Clean up on unmount
        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Update markers when suppliers or location change
    useEffect(() => {
        if (!map.current) return

        // User Location Marker
        if (userLocation) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
            el.style.width = '32px';
            el.style.height = '32px';
            el.style.backgroundSize = '100%';

            // Create a custom DOM element for the user marker
            const userMarkerEl = document.createElement('div');
            userMarkerEl.innerHTML = `<div class="bg-blue-600 w-6 h-6 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`;

            new mapboxgl.Marker(userMarkerEl)
                .setLngLat([userLocation.lng, userLocation.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Your Farm</h3><p>Casablanca Region</p>'))
                .addTo(map.current)

            // Fly to user location on first load if available
            map.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 13,
                essential: true
            })
        }

        // Supplier Markers
        suppliers.forEach((supplier, index) => {
            if (!supplier.location) return

            // Create marker element
            const el = document.createElement('div')
            el.className = 'supplier-marker cursor-pointer hover:scale-110 transition-transform'
            el.innerHTML = `<div class="bg-white p-1 rounded-full shadow-md border-2 border-green-600 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>`

            // Create popup DOM
            const popupNode = document.createElement('div')
            popupNode.className = 'p-2 font-sans min-w-[200px]'
            popupNode.innerHTML = `
                <h3 class="font-bold text-gray-900">${supplier.name}</h3>
                <p class="text-sm text-gray-600 mb-1">${supplier.type}</p>
                <div class="flex items-center text-xs text-blue-600 font-bold mb-2">
                    <span>${supplier.distance_km} km away</span>
                </div>
                <button id="reserve-btn-${index}" class="w-full bg-green-600 text-white text-xs py-1.5 px-3 rounded hover:bg-green-700 transition flex items-center justify-center gap-1">
                    Reserve Treatment
                </button>
            `

            // Add event listener to button after popup opens
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setDOMContent(popupNode)

            popup.on('open', () => {
                document.getElementById(`reserve-btn-${index}`)?.addEventListener('click', () => {
                    if (onSupplierClick) onSupplierClick(supplier)
                })
            })

            new mapboxgl.Marker(el)
                .setLngLat([supplier.location.lng, supplier.location.lat])
                .setPopup(popup)
                .addTo(map.current!)
        })

    }, [suppliers, userLocation])

    return (
        <div style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden', position: 'relative' }}>
            <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />

            {/* Overlay Legend */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-10 text-xs">
                <h4 className="font-bold mb-2 text-gray-800">Map Legend</h4>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow"></div>
                    <span className="text-gray-600">Your Farm</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-green-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-600">Verified Suppliers</span>
                </div>
            </div>
        </div>
    )
}
