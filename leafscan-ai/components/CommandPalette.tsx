'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Zap,
    LogOut,
    Leaf,
    Activity,
    LayoutDashboard,
    Stethoscope,
    Sprout,
    BookOpen,
    Command
} from 'lucide-react'
import { useMission } from '@/context/MissionContext'
import { useAuth } from '@/context/AuthContext'

interface CommandItem {
    id: string
    icon: React.ElementType
    label: string
    shortcut?: string
    action: () => void
    category: 'Navigation' | 'Actions' | 'Missions' | 'System'
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const router = useRouter()
    const { setMission } = useMission()
    const { logout } = useAuth()

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const commands: CommandItem[] = [
        // Actions
        {
            id: 'scan',
            icon: Zap,
            label: 'New Leaf Scan',
            shortcut: 'S',
            category: 'Actions',
            action: () => router.push('/dashboard/scan')
        },
        {
            id: 'ask',
            icon: Search,
            label: 'Ask Gemini Assistant',
            category: 'Actions',
            action: () => {
                // Trigger chat open (todo: context integration)
                const chatBtn = document.querySelector('button[aria-label="Toggle Chat"]') as HTMLButtonElement
                if (chatBtn) chatBtn.click()
            }
        },

        // Missions
        {
            id: 'mission-healer',
            icon: Stethoscope,
            label: 'Switch to Healer Mode',
            category: 'Missions',
            action: () => setMission('healer')
        },
        {
            id: 'mission-grower',
            icon: Sprout,
            label: 'Switch to Grower Mode',
            category: 'Missions',
            action: () => setMission('grower')
        },
        {
            id: 'mission-explorer',
            icon: BookOpen,
            label: 'Switch to Explorer Mode',
            category: 'Missions',
            action: () => setMission('explorer')
        },

        // Navigation
        { id: 'nav-dash', icon: LayoutDashboard, label: 'Go to Dashboard', category: 'Navigation', action: () => router.push('/dashboard') },
        { id: 'nav-vitals', icon: Activity, label: 'Go to Vitals', category: 'Navigation', action: () => router.push('/dashboard/vitals') },

        // System
        { id: 'sys-logout', icon: LogOut, label: 'Log Out', category: 'System', action: () => logout() }
    ]

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-fade-in" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100">
                    <Command className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-lg text-gray-800 placeholder:text-gray-400 font-medium"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No commands found.</div>
                    ) : (
                        <>
                            {['Actions', 'Missions', 'Navigation', 'System'].map(category => {
                                const categoryCommands = filteredCommands.filter(c => c.category === category)
                                if (categoryCommands.length === 0) return null

                                return (
                                    <div key={category} className="mb-2">
                                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{category}</div>
                                        {categoryCommands.map(cmd => (
                                            <button
                                                key={cmd.id}
                                                onClick={() => {
                                                    cmd.action()
                                                    setIsOpen(false)
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-apeel-green hover:text-white transition-colors group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <cmd.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                                    <span className="font-medium text-gray-700 group-hover:text-white transition-colors">{cmd.label}</span>
                                                </div>
                                                {cmd.shortcut && (
                                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white/20 group-hover:text-white">
                                                        {cmd.shortcut}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-100 flex justify-between">
                    <span>Agri-Command v1.0</span>
                    <span className="flex items-center gap-1">
                        Use <kbd className="font-sans font-bold">↑</kbd> <kbd className="font-sans font-bold">↓</kbd> to navigate
                    </span>
                </div>
            </div>
        </div>
    )
}
