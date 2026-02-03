'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Sprout, BookOpen, ArrowRight, Check } from 'lucide-react'
import { useMission, MissionType } from '@/context/MissionContext'

export default function MissionSelector() {
    const { setMission } = useMission()
    const router = useRouter()
    const [selected, setSelected] = React.useState<MissionType>(null)

    const handleSelect = (mission: MissionType) => {
        setSelected(mission)
    }

    const handleConfirm = () => {
        if (selected) {
            setMission(selected)
            router.push('/dashboard')
        }
    }

    const missions = [
        {
            id: 'healer',
            icon: Stethoscope,
            title: 'The Healer',
            subtitle: 'Rescue & Treat',
            desc: 'My plant is sick. I need an immediate diagnosis and treatment plan.',
            color: 'bg-red-50 text-red-600',
            border: 'border-red-200',
            hover: 'group-hover:border-red-400',
            ring: 'focus:ring-red-400'
        },
        {
            id: 'grower',
            icon: Sprout,
            title: 'The Grower',
            subtitle: 'Track & Optimise',
            desc: 'I want to monitor growth, track watering, and maximize my harvest.',
            color: 'bg-green-50 text-green-600',
            border: 'border-green-200',
            hover: 'group-hover:border-green-400',
            ring: 'focus:ring-green-400'
        },
        {
            id: 'explorer',
            icon: BookOpen,
            title: 'The Explorer',
            subtitle: 'Learn & Discover',
            desc: 'I’m looking for plant varieties, botany tips, and expert knowledge.',
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-200',
            hover: 'group-hover:border-blue-400',
            ring: 'focus:ring-blue-400'
        }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto p-6 animate-scale-in">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-apeel-black mb-3">
                    What brings you to <span className="text-apeel-green">LeafScan?</span>
                </h1>
                <p className="text-gray-500 text-lg">
                    Select your primary goal to personalize your dashboard.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {missions.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => handleSelect(m.id as MissionType)}
                        className={`
              relative group p-6 rounded-3xl border-2 text-left transition-all duration-300 ease-out
              ${selected === m.id
                                ? `${m.border} bg-white shadow-xl scale-105 ring-2 ${m.ring}`
                                : 'border-transparent bg-white shadow-md hover:shadow-lg hover:scale-[1.02]'}
            `}
                    >
                        {selected === m.id && (
                            <div className="absolute top-4 right-4 bg-apeel-black text-white p-1 rounded-full shadow-lg scale-in-center">
                                <Check className="w-4 h-4" />
                            </div>
                        )}

                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${m.color} transition-colors`}>
                            <m.icon className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">{m.title}</h3>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">{m.subtitle}</p>
                        <p className="text-gray-500 leading-relaxed text-sm">{m.desc}</p>
                    </button>
                ))}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleConfirm}
                    disabled={!selected}
                    className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all
            ${selected
                            ? 'bg-apeel-black text-white hover:scale-105 hover:bg-gray-900 cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
                >
                    Enter Dashboard
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
