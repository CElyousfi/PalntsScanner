import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Mock Stream Generator for Demo Mode
function makeMockStream(text: string) {
  const encoder = new TextEncoder()
  const chunks = text.split(/(?=[ \n])/) // Split by words/newlines

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise(r => setTimeout(r, 20)) // Simulate typing speed
      }

      // Send Suggestions
      const jsonPayload = JSON.stringify({ suggestedQuestions: ["How to treat this?", "Prevent recurrence?"] })
      controller.enqueue(encoder.encode(`\n__JSON_END__\n${jsonPayload}`))
      controller.close()
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { diagnosis, monitoringPlan, messages, userPreferences, language = 'en', actionResult } = await request.json()
    const userQuestion = messages[messages.length - 1].content

    // 1. CHECK API KEY
    if (!process.env.GEMINI_API_KEY) {
      // ... (mock response) ...
      console.warn("No GEMINI_API_KEY. Using Mock Chat.")
      return new NextResponse(makeMockStream(
        `[DEMO MODE] I see you're asking about "${userQuestion}". \n\nSince no API key is configured, I can tell you that for **${diagnosis?.cropType || 'this plant'}**, checking soil moisture and ensuring proper drainage is usually the first step.\n\n(To enable real AI, set GEMINI_API_KEY in .env)`
      ), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    // 2. REAL AI - Using Gemini 3 Pro (Project Standard)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview', // Project Standard
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096, // Max for Gemini 3 Pro
      }
    })

    const context = `You are a helpful agricultural AI assistant.
    User language: ${language}.
    Diagnosing: ${diagnosis?.cropType || 'General Plant'}.
    Condition: ${diagnosis?.diseases?.[0]?.name || 'Unknown'}.
    
    IMPORTANT: Keep your response CONCISE and SUMMARIZED. 
    - Use bullet points.
    - Get straight to the point.
    
    Answer the user's question.`

    // 3. TRY REAL AI WITH FALLBACK
    try {
      const result = await model.generateContentStream({
        contents: [
          { role: 'user', parts: [{ text: context }, { text: userQuestion }] }
        ]
      })

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of result.stream) {
              try {
                const text = chunk.text()
                if (text) {
                  // console.log('[Chat API] Chunk received:', text.length)
                  controller.enqueue(encoder.encode(text))
                }
              } catch (chunkError) {
                console.warn('[Chat API] Skipped bad chunk:', chunkError)
                // Continue stream even if one chunk fails
              }
            }
            // Suggestions
            const jsonPayload = JSON.stringify({ suggestedQuestions: ["Tell me more", "Treatment details"] })
            controller.enqueue(encoder.encode(`\n__JSON_END__\n${jsonPayload}`))
            controller.close()
          } catch (e) {
            console.error('[Chat API] Stream Fatal Error:', e)
            controller.error(e)
          }
        }
      })

      return new NextResponse(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

    } catch (apiError) {
      console.error("Gemini API Call Failed (Using Fallback):", apiError)
      return new NextResponse(makeMockStream(
        `[FALLBACK MODE] I encountered a connection issue with the AI service (${(apiError as Error).message}).\n\nHowever, for **${diagnosis?.cropType || 'this plant'}**, I recommend checking soil moisture and ensuring proper drainage as a first step.\n\n(Please check your API key configuration)`
      ), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { response: `Error: ${error instanceof Error ? error.message : String(error)}`, suggestedQuestions: [] },
      { status: 500 }
    )
  }
}

// Generate contextual suggested questions
// Generate contextual suggested questions
function generateSuggestedQuestions(lastQuestion: string, diagnosis: any, monitoringPlan?: any, language: string = 'en'): string[] {
  const suggestions: string[] = []
  const isAr = language === 'ar'
  const isFr = language === 'fr'

  // Helper for translations
  const t = (en: string, fr: string, ar: string) => {
    return isAr ? ar : isFr ? fr : en
  }

  // Weather-related
  if (lastQuestion.toLowerCase().match(/rain|weather|pluie|météo|مطر|طقس/)) {
    suggestions.push(t('What if there\'s a drought?', 'Et en cas de sécheresse ?', 'ماذا لو حدث جفاف؟'))
  }

  // Budget-related
  if (lastQuestion.toLowerCase().match(/cost|budget|cheap|prix|coût|سعر|تكلفة/)) {
    suggestions.push(t('Are there home remedies?', 'Des remèdes maison ?', 'هل هناك علاجات منزلية؟'))
  }

  // Severity-specific
  if (diagnosis.severity === 'high') {
    suggestions.push(t('Is this contagious?', 'Est-ce contagieux ?', 'هل هذا معدي؟'))
    suggestions.push(t('Should I remove the plant?', 'Dois-je retirer la plante ?', 'هل يجب إزالة النبات؟'))
  } else {
    suggestions.push(t('How to prevent this?', 'Comment prévenir cela ?', 'كيف يمكن الوقاية؟'))
  }

  // Organic-specific
  if (diagnosis.sustainabilityScore && diagnosis.sustainabilityScore < 70) {
    suggestions.push(t('Any organic options?', 'Options biologiques ?', 'هل توجد خيارات عضوية؟'))
  }

  return suggestions.slice(0, 3)
}
