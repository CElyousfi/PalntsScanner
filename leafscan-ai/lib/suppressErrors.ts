// Suppress known harmless console errors
export function suppressKnownErrors() {
  if (typeof window === 'undefined') return

  // Store original console methods
  const originalError = console.error
  const originalWarn = console.warn

  // List of error patterns to suppress
  const suppressPatterns = [
    /MetaMask/i,
    /Failed to connect to MetaMask/i,
    /MetaMask extension not found/i,
    /chrome-extension:\/\//i,
  ]

  // Override console.error
  console.error = (...args: any[]) => {
    const message = args.join(' ')
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message))
    
    if (!shouldSuppress) {
      originalError.apply(console, args)
    }
  }

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message))
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args)
    }
  }
}
