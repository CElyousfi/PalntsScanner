import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { monitoringPlanId } = await request.json()

    // In production, retrieve from database
    // For hackathon, we'll return structure for client-side storage
    
    return NextResponse.json({ 
      success: true,
      message: 'Retrieve monitoring plan from localStorage or session storage',
      instructions: {
        storage: 'localStorage',
        key: `monitoring_plan_${monitoringPlanId}`,
        method: 'JSON.parse(localStorage.getItem(key))'
      }
    })

  } catch (error) {
    console.error('Status retrieval error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve monitoring status'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // List all active monitoring plans (for dashboard)
  try {
    return NextResponse.json({ 
      success: true,
      message: 'List all monitoring plans from storage',
      instructions: {
        storage: 'localStorage',
        pattern: 'monitoring_plan_*',
        method: 'Iterate through localStorage keys matching pattern'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to list monitoring plans' },
      { status: 500 }
    )
  }
}
