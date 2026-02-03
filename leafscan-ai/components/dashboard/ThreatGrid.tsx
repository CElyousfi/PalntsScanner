'use client'

import React from 'react'
import { AlertCircle, MapPin, Shield, Users, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ThreatGrid() {
    const router = useRouter()
    const threats = [
        { id: 1, type: 'Early Blight', crop: 'Tomato', distance: '1.2km', risk: 'High', reporters: 12, trend: 'rising' },
        { id: 2, type: 'Aphid Swarm', crop: 'Lettuce', distance: '3.5km', risk: 'Medium', reporters: 8, trend: 'stable' },
        { id: 3, type: 'Powdery Mildew', crop: 'Squash', distance: '5.0km', risk: 'Low', reporters: 3, trend: 'falling' },
    ]

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Community Threat Grid
                </h3>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                    <Users className="w-3 h-3" />
                    24 Active Sensors
                </span>
            </div>

            <div className="space-y-3 relative z-10">
                {threats.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => router.push(`/dashboard/explore?search=${encodeURIComponent(t.type)}`)}
                        className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors group/item cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.risk === 'High' ? 'bg-red-50 text-red-500' :
                                t.risk === 'Medium' ? 'bg-orange-50 text-orange-500' :
                                    'bg-yellow-50 text-yellow-500'
                                }`}>
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{t.type}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <span>{t.crop}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3" /> {t.distance}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.risk === 'High' ? 'bg-red-100 text-red-700' :
                                t.risk === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {t.risk} Risk
                            </span>
                            <div className="text-[10px] text-gray-400 mt-1 font-medium group-hover/item:text-apeel-green cursor-pointer flex items-center justify-end gap-0.5" >
                                Prevent <ArrowUpRight className="w-2.5 h-2.5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center relative z-10">
                <p className="text-xs text-gray-400">
                    Data aggregated from <strong className="text-gray-600">LeafScan Community</strong> sensors.
                </p>
                <button className="text-xs font-bold text-apeel-green hover:underline">View Global Map</button>
            </div>
        </div>
    )
}
