import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { action, cropType } = await request.json()

    console.log(`[API] Fetching tutorial for: ${action} (${cropType})`)

    // Using Gemini 3 Flash Preview (fast & efficient)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `
      Create a very short, rich tutorial for: "${action}" on a "${cropType}" plant.
      
      Output JSON format ONLY:
      {
        "searchQuery": "string (Start with action name. OMIT the crop name if it's not a common garden plant. Append 'tutorial'. Max 3 words. E.g. 'apply neem oil' instead of 'apply neem oil to sugar beet')",
        "steps": [], 
        "tips": []
      }
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('[API] Visual Guide Response:', text.substring(0, 100) + '...')

    // Robust JSON Parsing
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let tutorial
    try {
      tutorial = JSON.parse(jsonStr)
    } catch (e) {
      console.error('[API] JSON Parse Error:', e)
      console.error('[API] Raw Text:', text)
      throw new Error('Failed to parse AI response')
    }

    return NextResponse.json({ success: true, tutorial })
  } catch (error) {
    console.error('[API] Tutorial Route Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tutorial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
