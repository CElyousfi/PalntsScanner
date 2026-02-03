import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { diagnosis, targetLanguage } = await request.json()

    if (!diagnosis || !targetLanguage) {
      return NextResponse.json({ error: 'Missing diagnosis or target language' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      generationConfig: {
        temperature: 0.3, // Low for accurate translation
        maxOutputTokens: 2048,
      }
    })

    const languageNames: { [key: string]: string } = {
      'ar': 'Arabic (العربية)',
      'fr': 'French (Français)',
      'es': 'Spanish (Español)',
      'pt': 'Portuguese (Português)',
      'hi': 'Hindi (हिन्दी)',
      'sw': 'Swahili (Kiswahili)',
      'am': 'Amharic (አማርኛ)'
    }

    const prompt = `You are a professional agricultural translator. Translate this plant disease diagnosis report to ${languageNames[targetLanguage] || targetLanguage}.

**CRITICAL INSTRUCTIONS**:
1. Maintain all technical accuracy (disease names, chemical names, percentages)
2. Use culturally appropriate agricultural terminology
3. Keep JSON structure EXACTLY the same
4. Translate ONLY the string values, not the keys
5. For disease names: provide both scientific name (in original language) and local translation
6. Respond with ONLY the translated JSON object

**ORIGINAL DIAGNOSIS**:
${JSON.stringify(diagnosis, null, 2)}

**RESPOND WITH TRANSLATED JSON NOW**:`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })

    const response = await result.response
    const text = response.text()

    let translatedDiagnosis
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      translatedDiagnosis = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Translation parsing failed:', text)
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    }

    return NextResponse.json(translatedDiagnosis)
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate diagnosis' },
      { status: 500 }
    )
  }
}
