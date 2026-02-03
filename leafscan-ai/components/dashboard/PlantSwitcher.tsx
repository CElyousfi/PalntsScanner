'use client'

import { useState } from 'react'
import { useAutonomy } from '@/hooks/useAutonomy'
import { useTheme } from '@/context/ThemeContext'
import { ChevronDown, Plus, Sprout, Check } from 'lucide-react'

export default function PlantSwitcher() {
    const { activeProfile, system, switchProfile, addProfile } = useAutonomy()
    const { theme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    if (!activeProfile || !system) return null

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur-sm border border-stone-300 text-stone-800 transition-all shadow-sm hover:shadow-md hover:bg-white"
            >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-700">
                    <Sprout className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Active Crop</p>
                    <p className="text-sm font-bold leading-none text-stone-900">
                        {activeProfile.name}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl overflow-hidden z-50 bg-white border border-stone-200">
                        <div className="p-2 space-y-1">
                            {system.profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => {
                                        switchProfile(profile.id)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeProfile.id === profile.id
                                        ? 'bg-emerald-50 text-emerald-900'
                                        : 'hover:bg-stone-50 text-stone-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${activeProfile.id === profile.id ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">{profile.name}</p>
                                            <p className="text-xs text-stone-500">{profile.cropType}</p>
                                        </div>
                                    </div>
                                    {activeProfile.id === profile.id && <Check className="w-4 h-4 text-emerald-600" />}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-stone-100 p-2">
                            <button
                                onClick={() => {
                                    const name = prompt("Enter plant name (e.g., 'Backyard Basil'):")
                                    if (name) {
                                        const type = prompt("Enter crop type (e.g., 'Basil'):") || "Unknown"
                                        addProfile(name, type)
                                        setIsOpen(false)
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-stone-300 hover:bg-stone-50 text-sm font-bold text-stone-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Plant
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
