'use client'

import { useState } from 'react'
import { GrowthStage, GrowthEntry } from '@/types'
import { Sprout, Leaf, Flower, Apple, Snowflake, Sun, CheckCircle2, Clock, Camera, Eye, X } from 'lucide-react'

interface GrowthTimelineProps {
  currentStage: GrowthStage
  startDate: string
  growthHistory: GrowthEntry[]
  cropType: string
  variety: string
  onStageClick?: (stage: GrowthStage) => void
}

const STAGE_CONFIG: Record<GrowthStage, {
  icon: any
  color: string
  bgColor: string
  borderColor: string
  description: string
  avgDays: number
  tips: string[]
}> = {
  'Seeding': {
    icon: Sprout,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Initial planting and germination phase',
    avgDays: 7,
    tips: ['Keep soil moist', 'Protect from direct sun', 'Monitor temperature 20-25°C']
  },
  'Early Vigor': {
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Seedling development with first true leaves',
    avgDays: 21,
    tips: ['Monitor height 10-15cm', 'Watch for aphids', 'Ensure good drainage']
  },
  'Vegetative': {
    icon: Leaf,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Rapid growth and leaf development',
    avgDays: 30,
    tips: ['Prune lower leaves', 'Fertilize weekly', 'Support stems if needed']
  },
  'Flowering': {
    icon: Flower,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Flower formation and pollination',
    avgDays: 14,
    tips: ['Ensure pollinators present', 'Reduce nitrogen', 'Monitor humidity 60-70%']
  },
  'Fruiting': {
    icon: Apple,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Fruit development and ripening',
    avgDays: 30,
    tips: ['Increase watering', 'Support heavy branches', 'Watch for pests on fruit']
  },
  'Pre-Winter': {
    icon: Snowflake,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Preparing for dormancy (Nov-Dec)',
    avgDays: 30,
    tips: ['Reduce watering', 'Protect from frost', 'Mulch around base']
  },
  'Post-Winter': {
    icon: Sun,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Recovery and vigor restoration (Feb-Mar)',
    avgDays: 21,
    tips: ['Check for winter damage', 'Fertilize lightly', 'Prune dead branches']
  },
  'Harvest': {
    icon: CheckCircle2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Fruit collection and season completion',
    avgDays: 14,
    tips: ['Harvest when ripe', 'Store properly', 'Plan next season']
  }
}

const STAGE_ORDER: GrowthStage[] = ['Seeding', 'Early Vigor', 'Vegetative', 'Flowering', 'Fruiting', 'Pre-Winter', 'Post-Winter', 'Harvest']

export default function GrowthTimeline({ currentStage, startDate, growthHistory, cropType, variety, onStageClick }: GrowthTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<GrowthStage | null>(null)
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string, date: string, stage: GrowthStage } | null>(null)

  // Calculate days since start
  const daysSinceStart = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

  // Calculate progress for current stage
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage)
  const currentStageConfig = STAGE_CONFIG[currentStage]
  const stageProgress = Math.min(100, (daysSinceStart / currentStageConfig.avgDays) * 100)

  // Get photos for each stage
  const photosByStage: Record<GrowthStage, GrowthEntry[]> = {} as any
  const safeHistory = growthHistory || []
  STAGE_ORDER.forEach(stage => {
    photosByStage[stage] = safeHistory.filter(entry => entry.stage === stage && entry.photoUrl)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold text-apeel-green">Growth Journey</h3>
          <p className="text-sm text-gray-500">
            {cropType} ({variety}) • Day {daysSinceStart} • {currentStage}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-apeel-green">{Math.round(stageProgress)}%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Stage Progress</div>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          {STAGE_ORDER.map((stage, index) => {
            const config = STAGE_CONFIG[stage]
            const Icon = config.icon
            const isComplete = index < currentStageIndex
            const isCurrent = stage === currentStage
            const photoCount = photosByStage[stage]?.length || 0

            return (
              <div key={stage} className="flex-1 relative group">
                {/* Connector Line */}
                {index < STAGE_ORDER.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-1 ${isComplete ? 'bg-apeel-green' : 'bg-gray-200'} transition-colors`} />
                )}

                {/* Stage Node */}
                <button
                  onClick={() => {
                    setSelectedStage(stage)
                    onStageClick?.(stage)
                  }}
                  className={`relative z-10 w-full flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${isCurrent
                    ? `${config.bgColor} ${config.borderColor} shadow-lg scale-110`
                    : isComplete
                      ? 'bg-white border-apeel-green/30 hover:shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${isCurrent ? config.bgColor : isComplete ? 'bg-apeel-green/10' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${isCurrent ? config.color : isComplete ? 'text-apeel-green' : 'text-gray-400'}`} />
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div className={`text-xs font-bold ${isCurrent ? config.color : isComplete ? 'text-apeel-green' : 'text-gray-500'}`}>
                      {stage}
                    </div>
                    {photoCount > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Camera className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500">{photoCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  {isComplete && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-apeel-green rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage Details Modal */}
      {/* Stage Details Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-apeel-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up border border-white/10">
            <button
              onClick={() => setSelectedStage(null)}
              className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-all z-10 shadow-sm backdrop-blur"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {(() => {
              const config = STAGE_CONFIG[selectedStage]
              const Icon = config.icon
              const photos = photosByStage[selectedStage] || []

              return (
                <div>
                  {/* Hero Header */}
                  <div className={`p-8 ${config.bgColor} relative overflow-hidden`}>
                    {/* Background decorative blob */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${config.color} opacity-10 blur-3xl`} />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-white shadow-sm ring-1 ring-black/5`}>
                          <Icon className={`w-8 h-8 ${config.color}`} />
                        </div>
                        <div>
                          <h3 className={`text-3xl font-serif font-bold text-gray-900 mb-1`}>{selectedStage}</h3>
                          <p className="text-gray-600 font-medium">{config.description}</p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className={`text-3xl font-bold ${config.color}`}>{config.avgDays} days</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Duration</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Tips Section */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-apeel-green" /> Expert Care Tips
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {config.tips.map((tip, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-apeel-green/30 transition-colors group">
                            <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photo Gallery */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Progress Photos ({photos.length})
                        </h4>
                        {photos.length > 0 && (
                          <span className="text-xs font-bold text-apeel-green bg-apeel-green/10 px-2 py-1 rounded-md">
                            Click to expand
                          </span>
                        )}
                      </div>

                      {photos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {photos.map((entry, i) => (
                            <button
                              key={i}
                              onClick={() => setViewingPhoto({ url: entry.photoUrl!, date: entry.date, stage: selectedStage })}
                              className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-apeel-green shadow-sm transition-all"
                            >
                              <img
                                src={entry.photoUrl}
                                alt={`${selectedStage} - ${new Date(entry.date).toLocaleDateString()}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <div className="text-white text-xs font-bold">
                                  {new Date(entry.date).toLocaleDateString()}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Camera className="w-6 h-6 text-gray-300" />
                          </div>
                          <p className="text-gray-900 font-bold mb-1">No photos captured yet</p>
                          <p className="text-sm text-gray-500">Document your {selectedStage} stage progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <button
            onClick={() => setViewingPhoto(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-5xl w-full">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={viewingPhoto.url}
                alt={`${viewingPhoto.stage} - ${new Date(viewingPhoto.date).toLocaleDateString()}`}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-serif font-bold text-apeel-green">{viewingPhoto.stage}</h4>
                    <p className="text-sm text-gray-500">{new Date(viewingPhoto.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <button
                    onClick={() => setViewingPhoto(null)}
                    className="px-6 py-3 bg-apeel-green text-white rounded-full font-bold hover:bg-apeel-dark transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Growth History (Filmstrip) */}
      {growthHistory && growthHistory.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Visual Progress
          </h4>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
            {growthHistory.map((entry, i) => (
              <button
                key={i}
                onClick={() => setViewingPhoto({ url: entry.photoUrl!, date: entry.date, stage: entry.stage })}
                className="flex-shrink-0 w-32 group cursor-pointer hover:scale-105 transition-transform text-left"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative mb-2">
                  {entry.photoUrl ? (
                    <img src={entry.photoUrl} alt="Growth Scan" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Sprout className="w-8 h-8" />
                    </div>
                  )}
                  <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase
                                ${entry.diagnosis?.severity === 'high' ? 'bg-rose-500' : 'bg-emerald-500'}
                                `}>
                    {entry.healthMetrics?.vigor || 90}% Vigor
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                  {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs font-bold text-gray-800 truncate">{entry.stage}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
