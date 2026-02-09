'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Star, Navigation as NavigationIcon, ExternalLink, Clock, X } from 'lucide-react'

interface ResultsPanelProps {
  results: any[]
  onSelectResult: (result: any) => void
  selectedResult: any
  onClose: () => void
}

export default function ResultsPanel({ results, onSelectResult, selectedResult, onClose }: ResultsPanelProps) {
  if (results.length === 0) return null

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-green-500 text-white',
    low: 'bg-blue-500 text-white'
  }

  const priorityBorders: Record<string, string> = {
    critical: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-green-200 bg-green-50',
    low: 'border-blue-200 bg-blue-50'
  }

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      className="absolute left-4 top-32 bottom-24 w-80 z-10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Results ({results.length})</h3>
            <p className="text-white/80 text-xs mt-0.5">Sorted by priority & distance</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {results.map((result, index) => {
          const isSelected = selectedResult?.id === result.id

          return (
            <motion.button
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectResult(result)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-lg group ${isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : `${priorityBorders[result.priority] || 'border-gray-200 bg-white'} hover:border-emerald-300`
                }`}
            >
              {/* Number Badge & Priority */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${priorityColors[result.priority] || 'bg-gray-500 text-white'}`}>
                    {index + 1}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${priorityColors[result.priority] || 'bg-gray-500 text-white'}`}>
                    {result.priority}
                  </span>
                </div>
                {result.openNow !== undefined && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${result.openNow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.openNow ? 'OPEN' : 'CLOSED'}
                  </span>
                )}
              </div>

              {/* Name */}
              <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                {result.name}
              </h4>

              {/* Category */}
              <p className="text-xs text-emerald-600 font-semibold mb-2">{result.category}</p>

              {/* Description */}
              {result.description && (
                <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                  {result.description}
                </p>
              )}

              {/* Distance & Rating */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {result.distance && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="font-medium">{result.distance.toFixed(1)}km</span>
                    </div>
                  )}
                  {result.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{result.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {result.amenities && result.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.amenities.slice(0, 2).map((amenity: string, idx: number) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Footer with Actions */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/80">
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5">
            <NavigationIcon className="w-3.5 h-3.5" />
            Route All
          </button>
          <button className="flex-1 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>
    </motion.div>
  )
}
