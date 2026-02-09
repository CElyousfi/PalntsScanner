import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

// Log API key status on module load
console.log('🔑 API Keys Status:')
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing')
console.log('  - GOOGLE_MAPS_KEY:', GOOGLE_MAPS_KEY ? `✅ Set (${GOOGLE_MAPS_KEY.substring(0, 20)}...)` : '❌ Missing')

export interface MapQueryResult {
  type: 'search' | 'route' | 'analysis' | 'emergency'
  category: string
  places: PlaceResult[]
  route?: RouteData
  aiInsight: string
  suggestions: string[]
}

export interface PlaceResult {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  category: string
  subCategory: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  phone?: string
  rating?: number
  userRatingsTotal?: number
  website?: string
  openNow?: boolean
  description: string
  distance?: number
  amenities?: string[]
}

export interface RouteData {
  waypoints: { lat: number; lng: number; name: string }[]
  totalDistance: number
  totalDuration: number
  warnings?: string[]
}

/**
 * NATURAL LANGUAGE MAP QUERY PROCESSOR
 * Handles global agricultural queries with AI interpretation
 */
export async function POST(request: NextRequest) {
  console.log('============================================')
  console.log('🗺️ MAP QUERY API CALLED')
  console.log('============================================')
  
  try {
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    const { query, location, language = 'en', userRadius } = body

    if (!query) {
      console.log('❌ No query provided')
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    console.log('🔍 Processing Map Query:', query)
    console.log('📍 User Location:', location)
    console.log('📏 User-Selected Radius:', userRadius, 'km')
    console.log('🌐 Language:', language)

    // Step 1: Interpret Query with AI
    console.log('🤖 Step 1: Interpreting query with AI...')
    const interpretation = await interpretQuery(query, location, language)
    
    // Override AI radius with user's selection if provided
    if (userRadius) {
      interpretation.radiusKm = Math.min(userRadius, 50) // Cap at 50km
      console.log(`✅ Using user-selected radius: ${interpretation.radiusKm}km`)
    }
    
    console.log('✅ Interpretation complete:', interpretation)
    
    // Step 2: Execute Search Based on Intent
    console.log('🔎 Step 2: Executing search...')
    const results = await executeSearch(interpretation, location)
    console.log(`✅ Search complete: Found ${results.places.length} places`)
    
    // Step 3: Build Route if needed
    if (interpretation.needsRoute && results.places.length > 0) {
      console.log('🛣️ Step 3: Building route...')
      results.route = await buildOptimalRoute(location, results.places)
    }

    console.log('✅ Returning results to client')
    return NextResponse.json(results)

  } catch (error: any) {
    console.error('❌ Map Query Error:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({
      type: 'analysis',
      category: 'error',
      places: [],
      aiInsight: `Error: ${error.message || 'Unable to process query'}`,
      suggestions: ['Try a more specific query', 'Check your API keys', 'Check console for details']
    }, { status: 200 })
  }
}

/**
 * AI-powered query interpretation
 */
async function interpretQuery(query: string, location: any, language: string) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3-flash-preview'
    // Note: Google Search grounding would require additional setup
  })

  const prompt = `You are an agricultural logistics AI assistant helping farmers find suppliers.

Query: "${query}"
Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}
Language: ${language}

⚠️ IMPORTANT: Keep search radius SMALL (10-30km) to show only truly nearby results.

Analyze this query and extract:
1. **Intent**: What is the farmer trying to find?
   - "inputs" (seeds, fertilizers, pesticides)
   - "equipment" (tractors, repairs, parts)
   - "livestock" (veterinary, feed, animal health)
   - "market" (sell produce, wholesalers)
   - "services" (irrigation, transport, storage)
   - "emergency" (urgent help)

2. **Search Terms**: 1-3 specific keywords for Google Places (keep simple)
3. **Radius**: Search radius in km (DEFAULT: 20km, MAX: 50km for emergencies)
4. **Priority**: Urgency level (critical/high/medium/low)
5. **Needs Route**: Does user want directions? (true/false)

⚠️ RADIUS GUIDELINES:
- Normal search: 15-25km
- Specific item: 20-30km
- Emergency: 30-50km (max)
- NEVER exceed 50km

Examples:
- "Where can I buy fungicide?" → Radius: 20km, Terms: ["agricultural supply", "farm store"]
- "Nearest tractor repair" → Radius: 25km, Terms: ["tractor repair", "farm equipment"]
- "Emergency vet" → Radius: 40km, Terms: ["veterinary clinic", "animal hospital"]

Output JSON only:
{
  "intent": "string",
  "searchTerms": ["string", "string"],
  "radiusKm": number (10-50 only),
  "priority": "critical" | "high" | "medium" | "low",
  "needsRoute": boolean,
  "detectedLanguage": "string",
  "englishQuery": "string (if not English)",
  "reasoning": "brief explanation"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(text)
}

/**
 * Execute Google Places search with better fallback strategies
 */
async function executeSearch(interpretation: any, userLocation: any): Promise<MapQueryResult> {
  let places: PlaceResult[] = []
  const maxRadius = 50
  let radiusKm = Math.min(interpretation.radiusKm, maxRadius)
  
  console.log(`📋 Search terms: ${interpretation.searchTerms.join(', ')}`)
  console.log(`📏 Radius: ${radiusKm}km`)
  
  // Strategy 1: Try original search terms
  for (const term of interpretation.searchTerms) {
    console.log(`🔎 Strategy 1 - Searching: "${term}"`)
    const foundPlaces = await searchGooglePlaces(term, userLocation, radiusKm)
    console.log(`  → Found ${foundPlaces.length} places`)
    places.push(...foundPlaces)
  }

  // Strategy 2: If few results, try broader terms
  if (places.length < 5) {
    console.log(`⚠️ Only ${places.length} results. Trying broader terms...`)
    const broaderTerms = generateBroaderTerms(interpretation.intent)
    
    for (const term of broaderTerms) {
      console.log(`🔎 Strategy 2 - Broader search: "${term}"`)
      const foundPlaces = await searchGooglePlaces(term, userLocation, radiusKm)
      console.log(`  → Found ${foundPlaces.length} places`)
      places.push(...foundPlaces)
      if (places.length >= 15) break // Stop when we have enough
    }
  }

  console.log(`📊 Total places found: ${places.length}`)

  // Deduplicate by ID
  const uniquePlaces = Array.from(
    new Map(places.map(p => [p.id, p])).values()
  )
  
  console.log(`📊 Unique places: ${uniquePlaces.length}`)

  // If no results, return helpful message
  if (uniquePlaces.length === 0) {
    return {
      type: 'search',
      category: interpretation.intent,
      places: [],
      aiInsight: `No suppliers found within ${radiusKm}km. Try adjusting the search radius slider above or use more general terms.`,
      suggestions: [
        `Increase search radius to 30-50km using the slider`,
        'Try broader terms: "store" or "shop"',
        'Search for general stores if specific suppliers are limited',
        'Check if location services are enabled'
      ]
    }
  }

  // Sort by distance
  uniquePlaces.sort((a, b) => (a.distance || 999) - (b.distance || 999))
  
  // Take top 15 results (increased from 10)
  const topResults = uniquePlaces.slice(0, 15)

  // Enrich with AI analysis (with error handling)
  try {
    const enriched = await enrichPlacesWithAI(topResults, interpretation, userLocation)
    return {
      type: interpretation.needsRoute ? 'route' : 'search',
      category: interpretation.intent,
      places: enriched.places,
      aiInsight: enriched.insight,
      suggestions: enriched.suggestions
    }
  } catch (error) {
    // Return raw results if AI enrichment fails
    console.error('AI enrichment failed, returning raw results:', error)
    return {
      type: 'search',
      category: interpretation.intent,
      places: topResults,
      aiInsight: `Found ${topResults.length} suppliers within ${radiusKm}km.`,
      suggestions: ['Contact suppliers for details', 'Compare prices', 'Check opening hours']
    }
  }
}

/**
 * Generate broader search terms based on intent
 */
function generateBroaderTerms(intent: string): string[] {
  const broadTerms: Record<string, string[]> = {
    'inputs': [
      'agricultural supply store',
      'farm supply',
      'garden center',
      'fertilizer store',
      'seed store',
      'agro shop'
    ],
    'equipment': [
      'tractor dealer',
      'farm equipment',
      'agricultural machinery',
      'farm tools',
      'irrigation equipment'
    ],
    'livestock': [
      'veterinary clinic',
      'animal feed store',
      'livestock supply',
      'farm animal care'
    ],
    'market': [
      'farmers market',
      'agricultural market',
      'produce market',
      'wholesale market'
    ],
    'services': [
      'agricultural services',
      'farm services',
      'crop consultant',
      'soil testing'
    ],
    'emergency': [
      'emergency service',
      '24 hour service',
      'urgent repair',
      'emergency vet'
    ]
  }
  
  return broadTerms[intent] || ['agricultural store', 'farm supply', 'garden center']
}

// Removed distant city search functions - we only show nearby results now

/**
 * Search Google Places API
 */
async function searchGooglePlaces(
  query: string,
  center: { lat: number; lng: number },
  radiusKm: number
): Promise<PlaceResult[]> {
  console.log(`🔍 Searching Google Places for: "${query}"`)
  console.log(`📍 Center: ${center.lat}, ${center.lng}`)
  console.log(`📏 Radius: ${radiusKm}km`)
  
  if (!GOOGLE_MAPS_KEY) {
    console.error('❌ GOOGLE_MAPS_KEY is not set!')
    return []
  }

  console.log('✅ API Key present:', GOOGLE_MAPS_KEY.substring(0, 20) + '...')

  try {
    const requestBody: any = {
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: radiusKm * 1000
        }
      },
      maxResultCount: 20, // Increased for better results
      languageCode: 'en',
      rankPreference: 'DISTANCE'
    }
    
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.regularOpeningHours,places.types,places.businessStatus'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Places API Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Places API Error:', errorText)
      return []
    }

    const data: any = await response.json()
    console.log(`✅ Places API returned ${data.places?.length || 0} results`)
    
    if (data.places && data.places.length > 0) {
      console.log('📍 First result:', data.places[0].displayName?.text)
    }
    
    return (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.displayName?.text || 'Unknown',
      lat: p.location?.latitude || 0,
      lng: p.location?.longitude || 0,
      address: p.formattedAddress || '',
      category: 'general',
      subCategory: p.types?.[0] || 'store',
      priority: 'medium' as const,
      phone: p.nationalPhoneNumber,
      rating: p.rating,
      userRatingsTotal: p.userRatingCount,
      website: p.websiteUri,
      openNow: p.regularOpeningHours?.openNow,
      description: '',
      distance: calculateDistance(center, { lat: p.location?.latitude, lng: p.location?.longitude })
    }))
  } catch (error) {
    console.error('Places API Error:', error)
    return []
  }
}

/**
 * Enrich places with AI categorization and insights
 */
async function enrichPlacesWithAI(
  places: PlaceResult[],
  interpretation: any,
  userLocation: any
) {
  if (places.length === 0) {
    return {
      places: [],
      insight: `No ${interpretation.intent} suppliers found within ${interpretation.radiusKm}km. Try expanding your search radius.`,
      suggestions: ['Increase search radius', 'Try alternative search terms', 'Check nearby towns']
    }
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `You are analyzing nearby agricultural suppliers. BE SELECTIVE - only return truly relevant places.

Query Intent: ${interpretation.intent}
Farmer's Need: ${interpretation.reasoning}

Nearby Places (sorted by distance):
${JSON.stringify(places.map((p, i) => ({ 
  index: i, 
  name: p.name, 
  address: p.address, 
  distance: `${p.distance?.toFixed(1)}km`,
  rating: p.rating,
  types: p.subCategory 
})), null, 2)}

CRITICAL INSTRUCTIONS:
1. **FILTER OUT** irrelevant places (e.g., general stores when looking for farm equipment)
2. **PRIORITIZE** by relevance AND distance (closer + more relevant = better)
3. Only include places that ACTUALLY match the farmer's needs
4. Maximum 8 results - quality over quantity

For each RELEVANT place, provide:
- **Category**: Specific type ("Agricultural Supply Store", "Tractor Dealer", etc.)
- **Priority**: How well it matches (high/medium/low)
- **Description**: ONE sentence explaining relevance
- **Amenities**: 2-3 key features (e.g., "Expert Advice", "Delivery", "24/7")

Output JSON (ONLY include relevant places):
{
  "enriched": [
    {
      "index": number,
      "category": "string",
      "priority": "high"|"medium"|"low",
      "description": "string",
      "amenities": ["string", "string"]
    }
  ],
  "insight": "Found X nearby suppliers within Ykm. [Brief helpful note]",
  "suggestions": ["Action 1", "Action 2"]
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    const analysis = JSON.parse(text)

    const enrichedPlaces = analysis.enriched.map((e: any) => {
      const place = places[e.index]
      if (!place) return null
      return {
        ...place,
        category: e.category || place.category,
        priority: e.priority || place.priority,
        description: e.description || place.description,
        amenities: e.amenities || []
      }
    }).filter(Boolean)

    // Sort by priority and distance
    enrichedPlaces.sort((a: PlaceResult, b: PlaceResult) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return (a.distance || 999) - (b.distance || 999)
    })

    return {
      places: enrichedPlaces,
      insight: analysis.insight || `Found ${enrichedPlaces.length} suppliers nearby.`,
      suggestions: analysis.suggestions || ['Contact suppliers directly', 'Compare prices', 'Check opening hours']
    }
  } catch (enrichError) {
    console.error('AI enrichment failed, returning basic results:', enrichError)
    
    // Return places without AI enrichment
    places.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    
    return {
      places,
      insight: `Found ${places.length} suppliers within ${interpretation.radiusKm}km. Contact them for availability.`,
      suggestions: ['Call ahead to confirm availability', 'Ask about delivery options', 'Compare prices between suppliers']
    }
  }
}

/**
 * Build optimal route through multiple waypoints
 */
async function buildOptimalRoute(
  origin: { lat: number; lng: number },
  places: PlaceResult[]
): Promise<RouteData> {
  // For now, return a simple route structure
  // In production, integrate with Google Directions API
  const top5 = places.slice(0, 5)
  
  return {
    waypoints: [
      { lat: origin.lat, lng: origin.lng, name: 'Your Location' },
      ...top5.map(p => ({ lat: p.lat, lng: p.lng, name: p.name }))
    ],
    totalDistance: top5.reduce((sum, p) => sum + (p.distance || 0), 0),
    totalDuration: top5.length * 15, // Estimate 15 min per stop
    warnings: []
  }
}

/**
 * Calculate distance between two points (Haversine)
 */
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat)
  const dLon = toRad(point2.lng - point1.lng)
  const lat1 = toRad(point1.lat)
  const lat2 = toRad(point2.lat)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
