'use client'

import { useEffect } from 'react'

export default function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Store original console methods
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    // List of error patterns to suppress
    const suppressPatterns = [
      /MetaMask/i,
      /Failed to connect to MetaMask/i,
      /MetaMask extension not found/i,
      /chrome-extension:\/\//i,
      /Download the React DevTools/i,
      /Failed to load resource/i,
      /__nextjs_original-stack-frame/i,
    ]

    // Helper to check if message should be suppressed
    const shouldSuppress = (args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'string') return arg
        if (arg instanceof Error) return arg.message
        return String(arg)
      }).join(' ')
      
      return suppressPatterns.some(pattern => pattern.test(message))
    }

    // Override console.error
    console.error = (...args: any[]) => {
      if (!shouldSuppress(args)) {
        originalError.apply(console, args)
      }
    }

    // Override console.warn
    console.warn = (...args: any[]) => {
      if (!shouldSuppress(args)) {
        originalWarn.apply(console, args)
      }
    }

    // Override console.log to catch some errors logged as info
    console.log = (...args: any[]) => {
      if (!shouldSuppress(args)) {
        originalLog.apply(console, args)
      }
    }

    // Suppress unhandled promise rejections from extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason?.message || String(reason)
      
      if (suppressPatterns.some(pattern => pattern.test(message))) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
