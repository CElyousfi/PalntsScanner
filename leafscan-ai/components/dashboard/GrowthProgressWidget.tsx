'use client'

import { useAutonomy } from '@/hooks/useAutonomy'
import { Sprout, ArrowRight, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GrowthProgressWidget() {
    const { activeProfile } = useAutonomy()
    const router = useRouter()

    if (!activeProfile) return null

    const { currentStage, startDate, growthHistory, cropType, variety } = activeProfile

    // Calculate days since start
    const daysSinceStart = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

    // Get latest photo
    const latestPhoto = growthHistory && growthHistory.length > 0 ? growthHistory[growthHistory.length - 1] : null
    const photoCount = growthHistory ? growthHistory.length : 0

    // Stage colors
    const stageColors: Record<string, { bg: string, text: string, border: string }> = {
        'Seeding': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        'Early Vigor': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        'Vegetative': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
        'Flowering': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
        'Fruiting': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        'Pre-Winter': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        'Post-Winter': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
        'Harvest': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    }

    const colors = stageColors[currentStage] || stageColors['Early Vigor']

    return (
        <div className={`${colors.bg} rounded-3xl p-6 border ${colors.border} shadow-sm relative overflow-hidden h-full flex flex-col`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/30 rounded-full blur-3xl" />

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold text-lg ${colors.text} flex items-center gap-2`}>
                        <Sprout className="w-5 h-5" /> Growth Journey
                    </h3>
                    <span className={`${colors.bg} ${colors.text} text-xs font-bold px-3 py-1 rounded-full border ${colors.border}`}>
                        Day {daysSinceStart}
                    </span>
                </div>

                <div className="flex-1 space-y-4">
                    {/* Current Stage */}
                    <div className="bg-white/60 backdrop-blur p-4 rounded-2xl border border-white/40">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Current Stage</div>
                                <div className={`text-2xl font-serif font-bold ${colors.text}`}>{currentStage}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Crop</div>
                                <div className="text-sm font-bold text-gray-700">{cropType}</div>
                                <div className="text-xs text-gray-500">{variety}</div>
                            </div>
                        </div>
                    </div>

                    {/* Photo Count */}
                    <div className="bg-white/60 backdrop-blur p-4 rounded-2xl border border-white/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${colors.bg} rounded-full ${colors.text}`}>
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Progress Photos</div>
                                    <div className="text-xl font-bold text-gray-800">{photoCount} uploaded</div>
                                </div>
                            </div>
                            {latestPhoto && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                    <img
                                        src={latestPhoto.photoUrl}
                                        alt="Latest progress"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => router.push('/tracker')}
                        className={`w-full ${colors.bg} ${colors.text} border ${colors.border} py-3 px-4 rounded-xl font-bold text-sm hover:bg-white/80 transition-all flex items-center justify-center gap-2 group`}
                    >
                        View Full Timeline
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    )
}
