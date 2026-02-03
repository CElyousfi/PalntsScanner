/** @type {import('next').NextConfig} */
// Force rebuild timestamp: 2024-05-23
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double renders
  images: {
    domains: ['localhost'],
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
      // Enable caching for faster rebuilds
      config.cache = true
    }
    return config
  },
  // Optimize on-demand entries for better performance
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Keep pages in memory longer
    pagesBufferLength: 5, // Keep more pages in buffer
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS loading
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'], // Optimize imports
  },
}

module.exports = nextConfig
