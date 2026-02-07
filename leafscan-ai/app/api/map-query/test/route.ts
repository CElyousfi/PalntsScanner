import { NextResponse } from 'next/server'

/**
 * Simple test endpoint to verify API configuration
 */
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeys: {
      gemini: process.env.GEMINI_API_KEY ? `✅ Set (${process.env.GEMINI_API_KEY.substring(0, 20)}...)` : '❌ Missing',
      googleMaps: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? `✅ Set (${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY.substring(0, 20)}...)` : '❌ Missing',
    },
    envVars: {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      NEXT_PUBLIC_GOOGLE_MAPS_KEY: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    }
  }

  console.log('🔍 API Diagnostics:', diagnostics)

  return NextResponse.json(diagnostics)
}
