'use client'

import React from 'react'
import PlantSwitcher from './PlantSwitcher'
import { MoreHorizontal } from 'lucide-react'

interface PageShellProps {
    title: React.ReactNode
    badge?: React.ReactNode
    children: React.ReactNode
    action?: React.ReactNode
    hideControls?: boolean
}

export default function PageShell({ title, badge, children, action, hideControls }: PageShellProps) {
    return (
        <div className="flex flex-col h-full p-8">
            {/* Header */}
            <div className="mb-8 animate-fade-in-down">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        {/* Optional Badge */}
                        {badge && (
                            <div className="mb-4">
                                {badge}
                            </div>
                        )}

                        {/* Title */}
                        {typeof title === 'string' ? (
                            <h1 className="text-5xl md:text-6xl font-bold text-apeel-black">
                                {title}
                            </h1>
                        ) : (
                            title
                        )}
                    </div>

                    {!hideControls && (
                        <div className="flex gap-3 items-center">
                            {action}
                            <PlantSwitcher />
                            <button className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-all text-gray-700 shadow-sm">
                                <MoreHorizontal className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="max-w-7xl mx-auto animate-fade-in-up">
                    {children}
                </div>
            </div>
        </div>
    )
}
