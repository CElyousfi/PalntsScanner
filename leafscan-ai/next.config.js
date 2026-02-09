/** @type {import('next').NextConfig} */
// Force rebuild timestamp: 2024-05-23
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double renders
  images: {
    domains: ['localhost'],
    unoptimized: true, // Faster image loading in dev
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Performance optimizations
  compiler: {
    removeConsole: false, // Keep console logs for debugging
  },
  // Suppress browser extension errors and warnings
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Ignore browser extension errors
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency/,
      ]
      // Enable aggressive caching for SPA-like experience
      config.cache = {
        type: 'memory',
        maxGenerations: 10, // Increased for more pages
      }

      // In development, build everything immediately
      if (dev) {
        config.optimization = {
          ...config.optimization,
          moduleIds: 'named',
          chunkIds: 'named',
        }
      }
    }
    return config
  },
  // ULTRA AGGRESSIVE - Keep ALL pages in memory forever
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // Keep pages for 1 hour
    pagesBufferLength: 50, // Keep 50 pages in buffer
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS loading
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'framer-motion'], // Optimize imports
    scrollRestoration: true,
    // Force all pages to compile on startup
    workerThreads: true,
    cpus: 4, // Use multiple cores for faster compilation
  },
  // Disable static optimization for dashboard routes (force dynamic)
  output: 'standalone',

  // Redirects for deprecated routes (UI consolidation)
  async redirects() {
    return [
      {
        source: '/dashboard/autonomy',
        destination: '/dashboard/scan',
        permanent: false,
      },
      {
        source: '/dashboard/lab',
        destination: '/dashboard/scan',
        permanent: false,
      },
      {
        source: '/dashboard/notes-notebook',
        destination: '/dashboard/notes',
        permanent: false,
      },
      {
        source: '/dashboard/vitals',
        destination: '/dashboard/scan?mode=crop',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
