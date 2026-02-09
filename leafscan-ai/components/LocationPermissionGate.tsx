'use client'

import { motion } from 'framer-motion'
import { MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useLocationContext } from '@/context/LocationContext'

export default function LocationPermissionGate({ children }: { children: React.ReactNode }) {
    const { location, isLoading, error, hasPermission, requestLocation } = useLocationContext()

    // Show loading state while checking permission
    if (isLoading && !location) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-apeel-green via-emerald-600 to-teal-700">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 p-8"
                >
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <MapPin className="w-10 h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Getting Your Location</h2>
                        <p className="text-white/80 text-sm">Please allow location access when prompted</p>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Show permission request modal if no permission
    if (!hasPermission || error) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-apeel-green via-emerald-600 to-teal-700 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                >
                    <div className="flex flex-col items-center text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-apeel-green/10 rounded-full flex items-center justify-center mb-6">
                            {error ? (
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            ) : (
                                <MapPin className="w-10 h-10 text-apeel-green animate-pulse" />
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">
                            {error ? 'Location Access Required' : 'Enable Location Services'}
                        </h2>

                        {/* Description */}
                        <p className="text-stone-600 dark:text-stone-300 mb-2 leading-relaxed">
                            LeafScan AI requires your location to provide accurate:
                        </p>

                        {/* Feature List */}
                        <ul className="text-left text-sm text-stone-600 dark:text-stone-300 mb-6 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-apeel-green mt-0.5">✓</span>
                                <span>Local crop disease alerts and threats</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-apeel-green mt-0.5">✓</span>
                                <span>Nearby agricultural suppliers and resources</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-apeel-green mt-0.5">✓</span>
                                <span>Weather-based recommendations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-apeel-green mt-0.5">✓</span>
                                <span>Region-specific plant care advice</span>
                            </li>
                        </ul>

                        {/* Error Message */}
                        {error && (
                            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Error:</strong> {error}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    Please check your browser settings and enable location access for this site.
                                </p>
                            </div>
                        )}

                        {/* Privacy Note */}
                        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-3 mb-6">
                            <p className="text-xs text-stone-600 dark:text-stone-400">
                                🔒 Your location data is only used within the app and never shared with third parties. You can revoke access anytime in your browser settings.
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={requestLocation}
                            disabled={isLoading}
                            className="w-full bg-apeel-green hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Requesting Access...</span>
                                </>
                            ) : error ? (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Try Again</span>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    <span>Enable Location Access</span>
                                </>
                            )}
                        </button>

                        {/* Help Text */}
                        <p className="text-xs text-stone-500 dark:text-stone-500 mt-4">
                            Click the button above and select "Allow" when your browser asks for permission
                        </p>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Permission granted and location available - render app
    return <>{children}</>
}
