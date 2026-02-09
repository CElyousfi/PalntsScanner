'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                We encountered an error loading the dashboard. This might be due to a temporary connectivity issue or a bug.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-apeel-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                >
                    Try again
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    Reload Page
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 text-left w-full max-w-2xl overflow-auto">
                    <p className="font-mono text-xs text-red-600 whitespace-pre-wrap">{error.message}</p>
                    {error.stack && <p className="font-mono text-[10px] text-red-400 mt-2 whitespace-pre-wrap">{error.stack}</p>}
                </div>
            )}
        </div>
    )
}
