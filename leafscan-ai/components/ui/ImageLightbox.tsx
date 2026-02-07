'use client'

import React, { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, Check, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageLightboxProps {
    isOpen: boolean
    onClose: () => void
    imageSrc: string
    altText?: string
    children?: React.ReactNode
}

export default function ImageLightbox({ isOpen, onClose, imageSrc, altText = "Image preview", children }: ImageLightboxProps) {
    const [scale, setScale] = useState(1)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setScale(1)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4))
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1))
    const handleReset = () => setScale(1)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-md"
                    onClick={onClose}
                >
                    {/* Controls Overlay */}
                    <div className="absolute top-4 right-4 z-[110] flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => window.open(imageSrc, '_blank')}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                            title="Open original"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                            title="Close (Esc)"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={handleZoomOut}
                            className="text-white hover:text-apeel-green transition-colors disabled:opacity-30 p-2"
                            disabled={scale <= 1}
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-white font-mono text-sm w-12 text-center select-none">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={handleZoomIn}
                            className="text-white hover:text-apeel-green transition-colors disabled:opacity-30 p-2"
                            disabled={scale >= 4}
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-white/20 mx-2" />
                        <button
                            onClick={handleReset}
                            className="text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider px-2"
                        >
                            Fit
                        </button>
                    </div>

                    {/* Image Container with Overlays */}
                    <motion.div
                        className="relative flex items-center justify-center p-8 cursor-grab active:cursor-grabbing"
                        onClick={e => e.stopPropagation()}
                        drag
                        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: scale, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="relative inline-block">
                            <img
                                src={imageSrc}
                                alt={altText}
                                draggable={false}
                                className="max-w-[90vw] max-h-[85vh] object-contain pointer-events-none select-none shadow-2xl rounded-sm"
                            />
                            {children && (
                                <div className="absolute inset-0 z-10 w-full h-full">
                                    {children}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
