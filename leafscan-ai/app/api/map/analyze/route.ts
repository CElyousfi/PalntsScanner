import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, bounds, center, zoom } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Use Gemini 3 Pro Preview
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-pro-preview',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    // Build comprehensive prompt
    const prompt = `You are an AI farm mapping assistant analyzing satellite imagery and farm data.

User Query: "${query}"

Map Context:
- Center: ${center ? `${center[1].toFixed(4)}°N, ${center[0].toFixed(4)}°E` : 'Unknown'}
- Zoom Level: ${zoom || 'Unknown'}
- Bounds: ${bounds ? `[${bounds[0][0].toFixed(4)}, ${bounds[0][1].toFixed(4)}] to [${bounds[1][0].toFixed(4)}, ${bounds[1][1].toFixed(4)}]` : 'Unknown'}

Task: Analyze the farm area and provide:
1. Detailed insights about farms, crops, yields, or health based on the query
2. GeoJSON data for farm boundaries (if applicable)
3. Actionable recommendations

For farm boundary detection queries:
- Generate realistic GeoJSON polygons for small farms (<2ha) in the area
- Include properties: name, area (hectares), cropType, yield (t/ha), health (excellent/good/fair/poor)

For yield estimation queries:
- Provide estimated yields based on typical values for the region
- Consider crop type, season, and health indicators

For crop detection queries:
- Identify likely crop types based on location and season
- Provide confidence levels

Format your response as:
INSIGHTS: [Your detailed analysis and recommendations]

GEOJSON: [Valid GeoJSON FeatureCollection if applicable, or null]

FLYTO: [Coordinates to zoom to if applicable, format: {"center": [lng, lat], "zoom": number}, or null]`

    // Generate response
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse response
    const insights = extractSection(text, 'INSIGHTS:', 'GEOJSON:') || text
    const geojsonText = extractSection(text, 'GEOJSON:', 'FLYTO:')
    const flyToText = extractSection(text, 'FLYTO:', null)

    let geojson = null
    let flyTo = null

    // Parse GeoJSON
    if (geojsonText && geojsonText.trim() !== 'null') {
      try {
        geojson = JSON.parse(geojsonText.trim())
      } catch (e) {
        console.error('Failed to parse GeoJSON:', e)
        // Generate sample data as fallback
        geojson = generateSampleFarmData(center, bounds)
      }
    } else if (query.toLowerCase().includes('delineate') || query.toLowerCase().includes('analyze farms')) {
      // Auto-generate sample data for farm analysis
      geojson = generateSampleFarmData(center, bounds)
    }

    // Parse flyTo
    if (flyToText && flyToText.trim() !== 'null') {
      try {
        flyTo = JSON.parse(flyToText.trim())
      } catch (e) {
        console.error('Failed to parse flyTo:', e)
      }
    }

    return NextResponse.json({
      insights: insights.trim(),
      geojson,
      flyTo
    })

  } catch (error: any) {
    console.error('Map analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze map' },
      { status: 500 }
    )
  }
}

// Helper function to extract sections from response
function extractSection(text: string, startMarker: string, endMarker: string | null): string | null {
  const startIndex = text.indexOf(startMarker)
  if (startIndex === -1) return null

  const contentStart = startIndex + startMarker.length
  const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length

  if (endIndex === -1) return text.substring(contentStart).trim()
  return text.substring(contentStart, endIndex).trim()
}

// Generate sample farm data for demonstration
function generateSampleFarmData(center: [number, number] | null, bounds: [[number, number], [number, number]] | null) {
  if (!center) {
    center = [-7.5898, 33.5731] // Default to Casablanca
  }

  const farms = []
  const numFarms = 5 + Math.floor(Math.random() * 5)

  const cropTypes = ['Wheat', 'Maize', 'Tomatoes', 'Olives', 'Citrus', 'Vegetables']
  const healthLevels = ['excellent', 'good', 'fair', 'poor']

  for (let i = 0; i < numFarms; i++) {
    // Generate random offset from center
    const offsetLng = (Math.random() - 0.5) * 0.02
    const offsetLat = (Math.random() - 0.5) * 0.02

    const farmCenter = [center[0] + offsetLng, center[1] + offsetLat]
    
    // Generate polygon (simple square)
    const size = 0.001 + Math.random() * 0.003 // Small farms
    const polygon = [
      [
        [farmCenter[0] - size, farmCenter[1] - size],
        [farmCenter[0] + size, farmCenter[1] - size],
        [farmCenter[0] + size, farmCenter[1] + size],
        [farmCenter[0] - size, farmCenter[1] + size],
        [farmCenter[0] - size, farmCenter[1] - size]
      ]
    ]

    const area = (size * 2 * 111) * (size * 2 * 111) // Rough hectares
    const cropType = cropTypes[Math.floor(Math.random() * cropTypes.length)]
    const health = healthLevels[Math.floor(Math.random() * healthLevels.length)]
    const yieldValue = health === 'excellent' ? 4 + Math.random() * 2 :
                       health === 'good' ? 3 + Math.random() * 1 :
                       health === 'fair' ? 2 + Math.random() * 1 :
                       1 + Math.random() * 1

    farms.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygon
      },
      properties: {
        name: `Farm ${i + 1}`,
        area: parseFloat(area.toFixed(2)),
        cropType,
        yield: parseFloat(yieldValue.toFixed(1)),
        health
      }
    })
  }

  return {
    type: 'FeatureCollection',
    features: farms
  }
}
