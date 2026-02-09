import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint for Docker
 * Returns 200 OK if the application is healthy
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'LeafScan AI',
      version: '1.0.0'
    },
    { status: 200 }
  )
}
