'use client'

import { useState } from 'react'
import { BatchItem } from '@/types'
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Target,
  Sparkles,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface IndividualItemCardProps {
  item: BatchItem
  index: number
  onHighlight?: () => void
}

export default function IndividualItemCard({ item, index, onHighlight }: IndividualItemCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  // Determine severity color based on grade/severity text
  const getSeverityColor = (grade: string) => {
    const gradeLower = grade.toLowerCase()
    
    // High severity / Poor quality
    if (gradeLower.includes('severe') || 
        gradeLower.includes('poor') || 
        gradeLower.includes('reject') ||
        gradeLower.includes('class ii')) {
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700 border-red-200',
        dot: 'bg-red-500'
      }
    }
    
    // Medium severity / Fair quality
    if (gradeLower.includes('moderate') || 
        gradeLower.includes('fair') ||
        gradeLower.includes('class i')) {
      return {
        border: 'border-orange-300',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700 border-orange-200',
        dot: 'bg-orange-500'
      }
    }
    
    // Good quality / Low severity
    return {
      border: 'border-green-300',
      bg: 'bg-green-50',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700 border-green-200',
      dot: 'bg-green-500'
    }
  }
  
  const colors = getSeverityColor(item.grade_or_severity)
  
  // Extract number from label (#1, #2, etc.)
  const itemNumber = item.label.replace('#', '').replace(/[^0-9]/g, '') || (index + 1).toString()
  
  return (
    <div 
      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] ${colors.border} ${colors.bg} group relative overflow-hidden`}
      onClick={onHighlight}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Numbered Badge */}
          <div className="w-10 h-10 rounded-full bg-white border-2 border-apeel-green flex items-center justify-center font-bold text-apeel-green shadow-sm group-hover:scale-110 transition-transform">
            {itemNumber}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.label}</h4>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Item Analysis</p>
          </div>
        </div>
        
        {/* Expand Button */}
        <button 
          onClick={(e) => { 
            e.stopPropagation()
            setExpanded(!expanded) 
          }}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Grade Badge */}
      <div className="mb-3 relative z-10">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 inline-flex items-center gap-1.5 ${colors.badge}`}>
          {item.grade_or_severity.toLowerCase().includes('severe') || 
           item.grade_or_severity.toLowerCase().includes('poor') ? (
            <XCircle className="w-3.5 h-3.5" />
          ) : item.grade_or_severity.toLowerCase().includes('good') || 
                item.grade_or_severity.toLowerCase().includes('fancy') ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          {item.grade_or_severity}
        </span>
      </div>

      {/* Description */}
      <p className={`text-sm text-gray-700 leading-relaxed font-medium mb-2 relative z-10 ${expanded ? '' : 'line-clamp-2'}`}>
        {item.description}
      </p>

      {/* Defect Count Summary (collapsed state) */}
      {!expanded && item.defects && item.defects.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 relative z-10">
          <Target className="w-3.5 h-3.5" />
          <span className="font-semibold">{item.defects.length} defect{item.defects.length !== 1 ? 's' : ''} detected</span>
        </div>
      )}

      {/* Expandable Defects List */}
      {expanded && item.defects && item.defects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300/50 relative z-10 animate-fade-in">
          <h5 className="text-xs font-bold uppercase text-gray-600 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Detected Defects ({item.defects.length})
          </h5>
          <ul className="space-y-2">
            {item.defects.map((defect, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 bg-white/60 p-2.5 rounded-lg border border-gray-200/50">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                <span className="leading-relaxed">{defect}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Position Metadata (if available) */}
      {expanded && (item.bbox || item.center_point) && (
        <div className="mt-3 pt-3 border-t border-gray-300/50 relative z-10">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
            <Target className="w-3 h-3" />
            {item.center_point && (
              <span>Center: ({(item.center_point.x * 100).toFixed(1)}%, {(item.center_point.y * 100).toFixed(1)}%)</span>
            )}
            {item.radius && (
              <span className="ml-2">Radius: {(item.radius * 100).toFixed(1)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
