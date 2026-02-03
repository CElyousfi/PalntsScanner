'use client'

import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { LocationData } from '@/types'
import { useLanguage } from '@/context/LanguageContext'

interface LocationInputProps {
  onLocationSelect: (location: LocationData | null) => void
  currentLocation?: LocationData | null
}

export default function LocationInput({ onLocationSelect, currentLocation }: LocationInputProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchLocation = () => {
    setIsLoading(true)
    setError(null)

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Use reverse geocoding API (OpenStreetMap Nominatim - free)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&format=json&lon=${longitude}`
            )
            const data = await response.json()

            const locationData: LocationData = {
              latitude,
              longitude,
              name: data.address?.city || data.address?.town || data.address?.village || 'Unknown Location',
              country: data.address?.country || 'Unknown Country',
              climate: getClimateType(latitude)
            }

            onLocationSelect(locationData)
          } catch (error) {
            console.error('Geocoding error:', error)
            // Fallback to coordinates only
            onLocationSelect({
              latitude,
              longitude,
              name: 'Detected Location',
              country: 'Unknown',
              climate: getClimateType(latitude)
            })
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setIsLoading(false)
          setError(t('components.location.error_geo'))
        }
      )
    } else {
      setIsLoading(false)
      setError(t('components.location.error_geo'))
    }
  }

  const getClimateType = (lat: number): string => {
    const absLat = Math.abs(lat)
    if (absLat < 23.5) return 'tropical'
    if (absLat < 35) return 'subtropical'
    if (absLat < 50) return 'temperate'
    return 'cold'
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Use geocoding API (OpenStreetMap Nominatim - free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualInput)}&format=json&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const parts = display_name.split(', ')
        const city = parts[0]
        const country = parts[parts.length - 1]

        const manualLocation: LocationData = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          name: city,
          country: country,
          climate: getClimateType(parseFloat(lat))
        }
        onLocationSelect(manualLocation)
        setManualInput('')
      } else {
        setError(t('components.location.error_manual'))
      }
    } catch (err) {
      console.error('Manual geocoding error:', err)
      setError(t('components.location.error_manual'))
    } finally {
      setIsLoading(false)
    }
  }

  const location = currentLocation

  return (
    <div className="bg-white/40 backdrop-blur-sm border border-apeel-green/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-apeel-green" />
        <h3 className="font-bold text-apeel-green uppercase tracking-wider text-sm">{t('components.location.context')}</h3>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
          <span className="font-bold">!</span> {error}
        </div>
      )}

      {location ? (
        <div>
          <div className="bg-apeel-green/10 border border-apeel-green/20 rounded-lg p-4 mb-3 flex justify-between items-center group">
            <div>
              <p className="text-apeel-green font-bold leading-none">
                {location.name}
              </p>
              <p className="text-xs text-apeel-green/60 mt-1">
                {location.country} • {location.climate}
              </p>
            </div>
            <button
              onClick={() => { onLocationSelect(null); }}
              className="text-xs font-bold text-apeel-green/40 hover:text-red-500 uppercase tracking-wider transition-colors"
            >
              [ {t('components.location.clear')} ]
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={fetchLocation}
            disabled={isLoading}
            className="w-full btn-primary bg-apeel-green text-white hover:bg-apeel-green/90 py-3 text-sm flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {t('components.location.auto_detect')}
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 border-t border-apeel-green/10"></div>
            <span className="bg-white/50 px-2 text-apeel-green/40 text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t('components.location.manual_entry')}</span>
            <div className="flex-1 border-t border-apeel-green/10"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={t('components.location.placeholder')}
              className="input-field flex-1 text-sm py-2"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || isLoading}
              className="bg-white border border-apeel-green/20 text-apeel-green px-4 rounded-xl font-bold hover:bg-apeel-green hover:text-white transition-colors disabled:opacity-50"
            >
              {t('components.location.set')}
            </button>
          </form>
          <button
            onClick={() => {
              const defaultLocation: LocationData = {
                name: 'Casablanca',
                country: 'Maroc',
                climate: 'subtropical',
                latitude: 33.5731,
                longitude: -7.5898
              };
              onLocationSelect(defaultLocation);
            }}
            className="w-full text-xs font-bold uppercase tracking-widest text-apeel-green/60 hover:text-apeel-green py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-center"
          >
            [ {t('components.location.default')}: Casablanca ]
          </button>
        </div>
      )}
    </div>
  )
}
