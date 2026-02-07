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
    
    const { query, location, language = 'en' } = body

    if (!query) {
      console.log('❌ No query provided')
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    console.log('🔍 Processing Map Query:', query)
    console.log('📍 User Location:', location)
    console.log('🌐 Language:', language)

    // Step 1: Interpret Query with AI
    console.log('🤖 Step 1: Interpreting query with AI...')
    const interpretation = await interpretQuery(query, location, language)
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
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `You are an agricultural logistics AI assistant processing a farmer's map query globally.

Query: "${query}"
Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}
Language: ${language}

Analyze this query and extract:
1. **Intent**: What is the farmer trying to find or do?
   - "equipment" (tractors, repairs, parts)
   - "inputs" (seeds, fertilizers, pesticides)
   - "livestock" (veterinary, feed, animal health)
   - "market" (sell produce, wholesalers, markets)
   - "services" (irrigation, transport, storage)
   - "emergency" (urgent repairs, disaster relief)
   - "route" (plan multi-stop journey)

2. **Search Terms**: Specific keywords for Google Places search
3. **Radius**: Appropriate search radius in km (10-200 based on urgency and location type)
4. **Priority**: How urgent is this? (critical/high/medium/low)
5. **Needs Route**: Does user want directions/route planning? (true/false)
6. **Multilingual**: Detect if query is in another language and provide English equivalent

Examples:
- "Where can I buy fungicide?" → Intent: inputs, Terms: "agricultural supply store fungicide", Radius: 30km
- "Nearest tractor repair within 50km" → Intent: equipment, Terms: "tractor repair workshop", Radius: 50km
- "Route to grain silo then fuel station" → Intent: route, NeedsRoute: true
- "Emergency vet for cattle" → Intent: emergency, Priority: critical, Radius: 100km

Output JSON only:
{
  "intent": "string",
  "searchTerms": ["string", "string"],
  "radiusKm": number,
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
 * Execute Google Places search with fallback strategies
 */
async function executeSearch(interpretation: any, userLocation: any): Promise<MapQueryResult> {
  const places: PlaceResult[] = []
  
  console.log(`📋 Search terms: ${interpretation.searchTerms.join(', ')}`)
  
  // Search each term
  for (const term of interpretation.searchTerms) {
    console.log(`🔎 Searching for: "${term}"`)
    const foundPlaces = await searchGooglePlaces(term, userLocation, interpretation.radiusKm)
    console.log(`  → Found ${foundPlaces.length} places for "${term}"`)
    places.push(...foundPlaces)
  }

  console.log(`📊 Total places before deduplication: ${places.length}`)

  // Deduplicate by ID
  const uniquePlaces = Array.from(
    new Map(places.map(p => [p.id, p])).values()
  )
  
  console.log(`📊 Unique places: ${uniquePlaces.length}`)

  // Enrich with AI analysis
  const enriched = await enrichPlacesWithAI(uniquePlaces, interpretation, userLocation)

  return {
    type: interpretation.needsRoute ? 'route' : 'search',
    category: interpretation.intent,
    places: enriched.places,
    aiInsight: enriched.insight,
    suggestions: enriched.suggestions
  }
}

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
    const requestBody = {
      textQuery: query,
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: radiusKm * 1000
        }
      },
      maxResultCount: 15
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

  const prompt = `Agricultural Logistics Expert: Analyze these places for a farmer's query.

Query Intent: ${interpretation.intent}
Original Query: ${interpretation.reasoning}

Places Found:
${JSON.stringify(places.map((p, i) => ({ index: i, name: p.name, address: p.address, types: p.subCategory, distance: p.distance })), null, 2)}

Tasks:
1. **Categorize** each place: "Equipment Dealer", "Supply Store", "Veterinary Clinic", "Market", "Service Provider", etc.
2. **Priority**: Rate urgency - critical (immediate need), high (within 24h), medium (within week), low (general)
3. **Description**: 1-sentence why this place matches the farmer's need
4. **Amenities**: List relevant features (e.g., "24/7 Service", "Organic Certified", "Delivery Available")
5. **Insight**: Brief summary of availability and recommendations
6. **Suggestions**: 2-3 actionable next steps

Output JSON:
{
  "enriched": [
    {
      "index": number,
      "category": "string",
      "priority": "critical"|"high"|"medium"|"low",
      "description": "string",
      "amenities": ["string"]
    }
  ],
  "insight": "string",
  "suggestions": ["string"]
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
  const analysis = JSON.parse(text)

  const enrichedPlaces = analysis.enriched.map((e: any) => {
    const place = places[e.index]
    return {
      ...place,
      category: e.category,
      priority: e.priority,
      description: e.description,
      amenities: e.amenities
    }
  })

  // Sort by priority and distance
  enrichedPlaces.sort((a: PlaceResult, b: PlaceResult) => {
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return (a.distance || 999) - (b.distance || 999)
  })

  return {
    places: enrichedPlaces,
    insight: analysis.insight,
    suggestions: analysis.suggestions
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
