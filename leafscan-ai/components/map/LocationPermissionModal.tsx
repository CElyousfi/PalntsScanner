'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Shield, Check, X } from 'lucide-react'

interface LocationPermissionModalProps {
    isOpen: boolean
    onEnable: () => void
    onDefault: () => void
}

export default function LocationPermissionModal({ isOpen, onEnable, onDefault }: LocationPermissionModalProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-apeel-green to-emerald-600" />

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-apeel-green/10 rounded-full flex items-center justify-center mb-2">
                            <MapPin className="w-8 h-8 text-apeel-green" />
                        </div>

                        <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                            Enable Location Services?
                        </h3>

                        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                            LeafScan uses your location to identify nearby crop threats and connect you with local agricultural suppliers.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-lg">
                            <Shield className="w-3 h-3" />
                            <span>Your location data is never stored remotely.</span>
                        </div>

                        <div className="flex flex-col w-full gap-3 pt-2">
                            <button
                                onClick={onEnable}
                                className="w-full bg-apeel-green hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Check className="w-4 h-4" />
                                Enable Location
                            </button>

                            <button
                                onClick={onDefault}
                                className="w-full bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium py-3 rounded-xl transition-colors text-sm"
                            >
                                Use Default Location (Casablanca)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
