import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { produceType, topic } = await request.json()

    console.log(`[API] Fetching produce tutorial for: ${topic} (${produceType})`)

    // Using Gemini 3 Flash Preview (fast & efficient like leaf tutorials)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `
      Create a comprehensive, practical tutorial about: "${topic}" for "${produceType}".
      
      Focus on BEST PRACTICES that most people don't know, such as:
      - Proper storage temperatures and humidity
      - Which fruits/vegetables to keep separate (e.g., don't mix apples and bananas - ethylene gas!)
      - Refrigeration vs counter storage
      - Shelf life extension techniques
      - Common storage mistakes to avoid
      - Casablanca climate considerations (humid/warm)
      
      Output JSON format ONLY:
      {
        "title": "string (clear, actionable title)",
        "searchQuery": "string (3-4 words for YouTube search, e.g., 'store apples properly')",
        "overview": "string (2-3 sentences explaining why this matters)",
        "steps": [
          "string (detailed step with specific temps, times, or techniques)"
        ],
        "tips": [
          "string (expert tips most people don't know)"
        ],
        "warnings": [
          "string (common mistakes to avoid)"
        ],
        "climate_notes": "string (specific advice for Casablanca's humid/warm climate)"
      }
      
      Make it practical, specific, and educational. Include actual temperatures, timeframes, and scientific reasons when relevant.
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('[API] Produce Tutorial Response:', text.substring(0, 100) + '...')

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
    console.error('[API] Produce Tutorial Route Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch produce tutorial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
