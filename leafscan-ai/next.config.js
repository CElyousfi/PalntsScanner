/** @type {import('next').NextConfig} */
// Force rebuild timestamp: 2024-05-23
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double renders
  images: {
    domains: ['localhost'],
    unoptimized: true, // Faster image loading in dev
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Performance optimizations
  compiler: {
    removeConsole: false, // Keep console logs for debugging
  },
  // Suppress browser extension errors and warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore browser extension errors
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency/,
      ]
      // Enable aggressive caching for SPA-like experience
      config.cache = {
        type: 'memory',
        maxGenerations: 5,
      }
    }
    return config
  },
  // Optimize on-demand entries for SPA behavior - ULTRA AGGRESSIVE
  onDemandEntries: {
    maxInactiveAge: 300 * 1000, // Keep pages in memory for 5 minutes
    pagesBufferLength: 20, // Keep 20 pages in buffer
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS loading
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'framer-motion'], // Optimize imports
    // Enable aggressive prefetching
    scrollRestoration: true,
  },
  // Disable static optimization for dashboard routes (force dynamic)
  // This prevents full page reloads
  output: 'standalone',
}

module.exports = nextConfig
