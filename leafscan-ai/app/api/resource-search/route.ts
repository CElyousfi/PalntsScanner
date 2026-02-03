import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import mocks from '@/lib/supplier-mocks.json'
import * as turf from '@turf/turf'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
    try {
        const { prompt, location } = await req.json()
        const userLocation = location || { lat: 33.5731, lng: -7.5898 } // Default Casablanca

        // 1. Use Gemini 3 Flash Preview to understand intent and filter criteria
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        const systemPrompt = `
        You are a search agent for an agricultural map.
        The user asks: "${prompt}"
        
        Available categories: "Seeds & Fertilizers", "Irrigation", "Tools & Machinery", "Pesticides & Bio-Control", "Animal Feed & Nutrition", "Consulting".
        
        Return a JSON object:
        {
            "intent": "search",
            "category": "string (closest match or null)",
            "keywords": ["string"],
            "maxDistanceKm": number (default 50)
        }
        Only return valid JSON.
        `

        const result = await model.generateContent(systemPrompt)
        const response = await result.response
        const text = response.text()

        // Clean JSON (sometimes Gemini wraps in ```json ... ```)
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const criteria = JSON.parse(cleanJson)

        // 2. Filter Mocks (Simulating a Database Search)
        const filtered = mocks.filter(supplier => {
            // Category Match
            if (criteria.category && !supplier.category.toLowerCase().includes(criteria.category.toLowerCase()) && !criteria.category.toLowerCase().includes(supplier.category.toLowerCase())) {
                return false
            }

            // Keyword Match (Simple inclusion)
            if (criteria.keywords && criteria.keywords.length > 0) {
                const suppliedString = (supplier.name + ' ' + supplier.description).toLowerCase()
                const hasKeyword = criteria.keywords.some((k: string) => suppliedString.includes(k.toLowerCase()))
                // If category matched, keywords are optional refineers, but let's require at least one if present? 
                // Actually, let's keep it loose for this demo.
            }

            // Distance Check
            const from = turf.point([userLocation.lng, userLocation.lat]);
            const to = turf.point([supplier.coordinates.lng, supplier.coordinates.lat]);

            // @ts-ignore
            const distance = turf.distance(from, to, { units: 'kilometers' });

            supplier.distance = parseFloat(distance.toFixed(1)) // Update distance dynamic

            return distance <= (criteria.maxDistanceKm || 50)
        })

        // Sort by distance
        filtered.sort((a, b) => a.distance - b.distance)

        return NextResponse.json({
            criteria,
            results: filtered.slice(0, 5) // Limit to top 5
        })

    } catch (error) {
        console.error("Resource Search Error:", error)
        return NextResponse.json({ error: 'Failed to process search' }, { status: 500 })
    }
}
