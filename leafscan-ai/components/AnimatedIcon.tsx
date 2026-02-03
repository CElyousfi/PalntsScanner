'use client'

import { useEffect, useRef, useState } from 'react'
import { LucideIcon } from 'lucide-react'

interface AnimatedIconProps {
    icon: LucideIcon
    className?: string
    isActive?: boolean
}

/**
 * AnimatedIcon - Wrapper for Lucide icons with hover animations
 * Inspired by itshover.com animated icons
 */
export default function AnimatedIcon({ icon: Icon, className = '', isActive = false }: AnimatedIconProps) {
    const [isHovered, setIsHovered] = useState(false)
    const iconRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!iconRef.current) return

        const element = iconRef.current
        const svg = element.querySelector('svg')
        if (!svg) return

        // Add animation classes based on state
        if (isHovered || isActive) {
            svg.style.transform = 'scale(1.1) rotate(5deg)'
            svg.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        } else {
            svg.style.transform = 'scale(1) rotate(0deg)'
            svg.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    }, [isHovered, isActive])

    return (
        <div
            ref={iconRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-flex items-center justify-center"
        >
            <Icon className={className} />
        </div>
    )
}
