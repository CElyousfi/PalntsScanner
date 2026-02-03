/** @type {import('next').NextConfig} */
// Force rebuild timestamp: 2024-05-23
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Suppress browser extension errors and warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore browser extension errors
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency/,
      ]
    }
    return config
  },
  // Suppress dev overlay for extension errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
