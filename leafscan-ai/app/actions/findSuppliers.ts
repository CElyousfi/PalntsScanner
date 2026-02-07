'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '')

export interface SupplierResult {
    id: string
    name: string
    lat: number
    lng: number
    address: string
    type: string
    stock: 'High' | 'Medium' | 'Low' | 'Unknown'
    phone?: string
    rating?: number
    user_ratings_total?: number
    website?: string
    description: string
    open_now?: boolean
}

interface PlacesResponse {
    places: Array<{
        id: string
        displayName: { text: string }
        location: { latitude: number; longitude: number }
        formattedAddress: string
        nationalPhoneNumber?: string
        rating?: number
        userRatingCount?: number
        websiteUri?: string
        regularOpeningHours?: { openNow: boolean }
        types?: string[]
    }>
}

async function searchGooglePlaces(query: string, center: { lat: number; lng: number }): Promise<PlacesResponse['places']> {
    if (!GOOGLE_MAPS_KEY) return []

    const placesEndpoint = 'https://places.googleapis.com/v1/places:searchText'

    try {
        const response = await fetch(placesEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.regularOpeningHours,places.types'
            },
            body: JSON.stringify({
                textQuery: query,
                // STRICT LOCATION FILTERING
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: center.lat,
                            longitude: center.lng
                        },
                        radius: 25000 // 25km radius (Strict)
                    }
                },
                maxResultCount: 10
            })
        })

        if (!response.ok) {
            console.error('Google Places API Error:', await response.text())
            // Return empty array on error to allow fallback flow to continue/handle it gracefully
            return []
        }

        const data: PlacesResponse = await response.json()
        return data.places || []

    } catch (error) {
        console.error('Fetch Error:', error)
        return []
    }
}

// Helper: Calculate Haversine Distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export async function findSuppliers(
    query: string,
    center: { lat: number; lng: number }
): Promise<{ suppliers: SupplierResult[]; aiInsight: string }> {
    if (!GOOGLE_MAPS_KEY || !GEMINI_API_KEY) {
        console.error('Missing API Keys')
        return { suppliers: [], aiInsight: 'API Configuration Error' }
    }

    try {
        // 1. PRIMARY SEARCH: Specific Product
        let places = await searchGooglePlaces(`${query} store`, center) // Removed "near me"
        let isFallback = false

        // Filter by Distance (Double Check) - Max 50km
        places = places.filter(p => {
            const dist = getDistanceFromLatLonInKm(center.lat, center.lng, p.location.latitude, p.location.longitude)
            // console.log(`Distance to ${p.displayName.text}: ${dist}km`)
            return dist <= 50
        })

        // 2. FALLBACK SEARCH: Generic Categories
        // If we found fewer than 2 results, assume specific search failed
        if (places.length < 2) {
            console.log(`Primary search for "${query}" yielded low results. Attempting fallback...`)
            isFallback = true

            // Search for broad agricultural suppliers
            const fallbackPlaces = await searchGooglePlaces("Agricultural Supply Store Farm Equipment", center)

            const seenIds = new Set(places.map(p => p.id))
            fallbackPlaces.forEach(p => {
                const dist = getDistanceFromLatLonInKm(center.lat, center.lng, p.location.latitude, p.location.longitude)
                // Deduplicate AND Filter Distance
                if (!seenIds.has(p.id) && dist <= 50) {
                    places.push(p)
                    seenIds.add(p.id)
                }
            })
        }

        if (places.length === 0) {
            return { suppliers: [], aiInsight: `No agricultural suppliers found within 50km for "${query}".` }
        }

        // 3. USE GEMINI TO ANALYZE AND RANK
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        const placesContext = places.map((p, index) => ({
            index,
            name: p.displayName.text,
            types: p.types,
            address: p.formattedAddress
        }))

        const prompt = `
    Role: Agricultural Logistics Expert AI.
    User Objective: Find "${query}" for immediate farm use.
    ${isFallback ? `NOTE: Direct search yielded few results. These are GENERAL agricultural stores. You must ESTIMATE which is most likely to stock the item.` : ''}

    Context:
    The user is a farmer looking for supplies.
    Analyze the following Google Maps Places results to identify the best sources.

    Data:
    ${JSON.stringify(placesContext, null, 2)}

    Instructions:
    1. **Filter**: Strictly exclude businesses that are irrelevant (restaurants, hotels, residential) unless they are agro-stores.
    2. **Stock Estimation**: Estimate probability ("High", "Medium", "Low") that the store stocks "${query}". 
        - If the store is a general "Agricultural Supply" or "Fertilizer Dealer", assume "Medium" or "High" for common chemicals like fungicides.
        - DO NOT filter out good candidates just because they don't have the product name in their title.
    3. **Categorize**: "Agro-Vet", "Hardware Store", "Machinery Dealer", "Nursery", "General Store".
    4. **Description**: Concise reason why this store is a good match.
    5. **Insight**: Brief summary of availability.

    Output Schema (Strict JSON):
    {
      "matches": [
        {
            "index": 0,
            "type": "string",
            "stock": "High" | "Medium" | "Low",
            "description": "string"
        }
      ],
      "aiInsight": "string"
    }
    `

        const result = await model.generateContent(prompt)
        const geminiResponse = result.response.text()
        const cleanedJson = geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim()
        const aiAnalysis = JSON.parse(cleanedJson)

        // 4. MERGE DATA
        const enrichedResults: SupplierResult[] = aiAnalysis.matches.map((match: any) => {
            const place = places[match.index]
            if (!place) return null

            return {
                id: place.id,
                name: place.displayName.text,
                lat: place.location.latitude,
                lng: place.location.longitude,
                address: place.formattedAddress,
                phone: place.nationalPhoneNumber,
                rating: place.rating,
                user_ratings_total: place.userRatingCount,
                website: place.websiteUri,
                open_now: place.regularOpeningHours?.openNow,
                type: match.type,
                stock: match.stock,
                description: match.description
            }
        }).filter(Boolean)

        // Filter out "Low" stock results if we have enough "High" or "Medium" ones, to keep map clean
        // But if everything is Low, show them (better than nothing)
        const betterResults = enrichedResults.filter(r => r.stock !== 'Low')
        const finalResults = betterResults.length > 0 ? betterResults : enrichedResults

        return {
            suppliers: finalResults,
            aiInsight: aiAnalysis.aiInsight
        }

    } catch (error) {
        console.error('Find Suppliers Error:', error)
        return { suppliers: [], aiInsight: 'System offline. Unable to reach supplier network.' }
    }
}
