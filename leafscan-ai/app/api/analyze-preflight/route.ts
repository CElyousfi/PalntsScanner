import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '')

export async function POST(req: NextRequest) {
    try {
        const { image, mode } = await req.json()

        if (!image) {
            return NextResponse.json({ ok: false, reason: 'No image provided' }, { status: 400 })
        }

        // Check if API key is available
        if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
            console.log('ℹ️ No API Key - Skipping preflight check in demo mode')
            return NextResponse.json({ ok: true, reason: 'Demo mode', confidence: 100 })
        }

        const expectedSubject = mode === 'leaf' ? 'A CLOSE-UP PLANT LEAF' : 'FRUIT, VEGETABLES, OR CROPS'
        const prompt = `
      You are a strict image content validator for an agricultural AI.
      
      EXPECTED SUBJECT: ${expectedSubject}
      
      TASK: Verify if the uploaded image contains the expected subject clearly.
      
      RULES:
      1. If the image contains ${expectedSubject}, return "ok": true.
      2. If the image is a person, selfie, document, screenshot, meme, blurry, or random object, return "ok": false.
      3. If the image is the wrong part of plant (e.g. a forest landscape instead of a leaf close-up), return "ok": false.
      
      RESPONSE JSON FORMAT ONLY:
      {
        "ok": boolean,
        "reason": "Short explanation for the user",
        "confidence": number (0-100)
      }
    `

        // Use Gemini 1.5 Flash for speed and low cost
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Convert base64 to proper format
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg'
                }
            }
        ])

        const response = await result.response
        const text = response.text()

        // Clean and parse
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        try {
            const validation = JSON.parse(jsonText)
            return NextResponse.json(validation)
        } catch (e) {
            // If JSON parsing fails, fail open to avoid blocking legitimate users on formatting errors
            console.error('Preflight parse error:', e)
            return NextResponse.json({ ok: true, reason: 'Parser error - allowing', confidence: 50 })
        }

    } catch (error) {
        console.error('Preflight error:', error)
        // Fail open if service error
        return NextResponse.json({ ok: true, reason: 'Service error - allowing', confidence: 0 })
    }
}
