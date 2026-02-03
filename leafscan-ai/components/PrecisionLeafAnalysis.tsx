'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertCircle, Info, Zap } from 'lucide-react'

interface ClickableRegion {
  id: number
  coords: [number, number][] // Polygon points
  bbox: { x: number; y: number; width: number; height: number }
  centroid: [number, number]
  class: string
  confidence: number
  severity: 'low' | 'medium' | 'high'
  description: string
  treatment: string
  color: string
}

interface PrecisionAnalysisProps {
  originalImage: string
  highlightedImage: string
  regions: ClickableRegion[]
  onRegionClick?: (region: ClickableRegion) => void
}

export default function PrecisionLeafAnalysis({
  originalImage,
  highlightedImage,
  regions,
  onRegionClick
}: PrecisionAnalysisProps) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Load and draw image with regions
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)

      // Draw region boundaries (optional, for better visibility)
      regions.forEach(region => {
        ctx.strokeStyle = region.color
        ctx.lineWidth = 3
        ctx.beginPath()
        region.coords.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point[0], point[1])
          else ctx.lineTo(point[0], point[1])
        })
        ctx.closePath()
        ctx.stroke()
      })
    }
  }, [highlightedImage, regions])

  // Handle click on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Find clicked region using point-in-polygon
    const clicked = regions.find(region => 
      isPointInPolygon([x, y], region.coords)
    )

    if (clicked) {
      setSelectedRegion(clicked.id)
      onRegionClick?.(clicked)
    } else {
      setSelectedRegion(null)
    }
  }

  // Point-in-polygon algorithm (ray casting)
  const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    const [x, y] = point
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]
      const [xj, yj] = polygon[j]

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi)

      if (intersect) inside = !inside
    }

    return inside
  }

  const selectedRegionData = regions.find(r => r.id === selectedRegion)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="w-4 h-4" />
      case 'medium': return <Info className="w-4 h-4" />
      case 'low': return <Zap className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            {showOriginal ? 'Show Highlights' : 'Show Original'}
          </button>
          <span className="text-sm text-gray-600">
            {regions.length} region{regions.length !== 1 ? 's' : ''} detected
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Click on highlighted areas for details
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
        <img
          ref={imageRef}
          src={showOriginal ? originalImage : highlightedImage}
          alt="Leaf analysis"
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-crosshair"
          style={{ maxHeight: '600px', objectFit: 'contain' }}
        />

        {/* Region Popup */}
        {selectedRegionData && (
          <div
            className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-10"
            style={{
              left: `${(selectedRegionData.centroid[0] / canvasRef.current!.width) * 100}%`,
              top: `${(selectedRegionData.centroid[1] / canvasRef.current!.height) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedRegion(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {/* Region details */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className={`p-2 rounded-lg ${getSeverityColor(selectedRegionData.severity)}`}>
                  {getSeverityIcon(selectedRegionData.severity)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {selectedRegionData.class}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {Math.round(selectedRegionData.confidence * 100)}% confidence
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Description</p>
                  <p className="text-sm text-gray-700">{selectedRegionData.description}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Severity</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedRegionData.severity)}`}>
                    {selectedRegionData.severity.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Suggested Action</p>
                  <p className="text-sm text-gray-700">{selectedRegionData.treatment}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Detected Issues</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {regions.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                selectedRegion === region.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: region.color }}
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{region.class}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(region.confidence * 100)}% • {region.severity}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Surgical Precision Analysis</p>
            <p className="text-blue-700">
              Only areas with high confidence (&gt;75%) are highlighted. Click on any colored region to see detailed information about that specific issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
