import React from 'react'
import { Sprout, Droplets, Tractor, Calendar, ArrowRight, Layers, Ruler, Map as MapIcon, ChevronRight } from 'lucide-react'

interface MapSidebarProps {
    data?: {
        cropType: string
        confidence: string
        size: string
        sownDate: string
        harvestDate: string
    } | null
}

export default function MapSidebar({ data }: MapSidebarProps) {
    if (!data) return (
        <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <MapIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Select an area or ask the AI to analyze field boundaries.</p>
        </div>
    )

    return (
        <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
            {/* Header / Back Link */}
            <div className="p-4 border-b border-gray-100">
                <button className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Go back to full map view
                </button>
            </div>

            <div className="p-6 space-y-8">
                {/* Section 1: Current Capabilities */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Current Capabilities</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Crop Card */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Sprout className="w-5 h-5 text-emerald-600" />
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{data.confidence} Confidence</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{data.cropType}</span>
                                <span className="text-xs text-gray-400">Current crop type</span>
                            </div>

                            {/* Field Size Card */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
                                <MapIcon className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-2xl font-bold text-gray-900">{data.size}</span>
                                <span className="text-xs text-gray-400">Field Size</span>
                            </div>
                        </div>

                        {/* Field Meta */}
                        <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <Layers className="w-3 h-3 text-gray-400" />
                                <span>Field ID: 243-546</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>Sown: {data.sownDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sprout className="w-3 h-3 text-gray-400" />
                                <span>Most grown: {data.cropType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tractor className="w-3 h-3 text-gray-400" />
                                <span>Harvest: {data.harvestDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Future Capabilities */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Future Capabilities</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 flex items-center gap-1">
                                <Droplets className="w-3 h-3" /> Dist. to water
                            </span>
                            <span className="font-bold text-gray-900">0.38 km</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 flex items-center gap-1">
                                <Ruler className="w-3 h-3" /> Dist. to road
                            </span>
                            <span className="font-bold text-gray-900">0.01 km</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Agriculture Practices Timeline */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Agriculture practices</h3>
                        <button className="text-xs border border-gray-200 rounded-md px-2 py-1 flex items-center gap-1 hover:bg-gray-50">
                            Last 3 years <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-6 relative ml-2">
                        {/* Timeline Labels */}
                        <div className="flex text-[10px] text-gray-400 justify-between items-center pl-10 pr-2 mb-2">
                            <span>Jan</span><span>Apr</span><span>Aug</span><span>Dec</span>
                        </div>

                        {/* Year Rows */}
                        {[2023, 2024, 2025].map((year, i) => (
                            <div key={year} className="flex items-center gap-4 relative">
                                <span className="text-xs font-bold text-gray-500 w-8">{year}</span>
                                <div className="flex-1 h-3 bg-red-50/50 rounded-full relative overflow-hidden">
                                    {/* Mock Timeline Events */}
                                    <div className={`absolute top-0 bottom-0 left-[10%] right-[20%] bg-red-900/10 rounded-full`} />

                                    {/* Icons Overlay */}
                                    {year === 2024 && (
                                        <>
                                            <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] z-10 border border-white">
                                                <Droplets className="w-2 h-2" />
                                            </div>
                                            <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-4 h-4 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[8px] z-10 border border-white">
                                                <Sprout className="w-2 h-2" />
                                            </div>
                                            <div className="absolute top-1/2 -translate-y-1/2 left-[80%] w-4 h-4 rounded-full bg-red-700 text-white flex items-center justify-center text-[8px] z-10 border border-white">
                                                <Tractor className="w-2 h-2" />
                                            </div>
                                        </>
                                    )}
                                    {year === 2023 && (
                                        <div className="absolute top-1/2 -translate-y-1/2 left-[60%] w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center text-[8px] z-10 border border-white">
                                            <Tractor className="w-2 h-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-gray-500">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-800" /> Crop</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-700" /> Tillage</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Sowing</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-900" /> Harvest</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Flooding</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
