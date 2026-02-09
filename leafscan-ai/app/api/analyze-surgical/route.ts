import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { VISION_SYSTEM_PROMPT } from '@/lib/vision-prompt'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { image, images, location } = await request.json()

    if (!image && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found')
      throw new Error('API key not configured')
    }

    console.log('🔬 NEW BATCH-AWARE SURGICAL ANALYSIS STARTED')
    const startTime = Date.now()

    // Initialize Gemini 3 Pro Preview for advanced vision analysis
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      },
      systemInstruction: VISION_SYSTEM_PROMPT
    })

    const imageParts = (images && images.length > 0 ? images : [image]).map((img: string) => ({
      inlineData: {
        data: img.includes('base64') ? img.split(',')[1] : img,
        mimeType: 'image/jpeg'
      }
    }))

    const result = await model.generateContent([
      `Analyze this leaf/plant image (Leaf Scan Mode). Location: ${location?.city || 'Unknown'}. Return JSON values.`,
      ...imageParts
    ])

    const response = await result.response
    const text = response.text()
    console.log(`✅ Analysis complete (${Date.now() - startTime}ms)`)

    // Parse JSON with robust error handling
    let rawData
    try {
      rawData = JSON.parse(text)
    } catch (e) {
      console.warn('Initial JSON parse failed, trying fallback...', e)
      // Fallback: Extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/)
      if (jsonMatch) {
        try {
          rawData = JSON.parse(jsonMatch[1])
        } catch (e2) {
          console.error('Fallback parse failed:', e2)
        }
      }
      
      // Final fallback: Try to extract first JSON object
      if (!rawData) {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) {
          try {
            rawData = JSON.parse(match[0])
          } catch (e3) {
            console.error('Final fallback parse failed:', e3)
          }
        }
      }
    }

    if (!rawData) {
      console.error('Raw AI response:', text.substring(0, 500))
      throw new Error("Failed to parse AI response as JSON")
    }

    // Map to DiagnosisResult (Backward Compatibility + New Fields)
    const diagnosis: any = {
      // New Fields
      overall_scene: rawData.overall_scene,
      batch_summary: rawData.batch_summary,
      batch_statistics: rawData.batch_statistics,
      individual_items: rawData.individual_items,

      // Mapped Fields for UI - CRITICAL: highlightedAreas for image overlays
      highlightedAreas: rawData.individual_items?.map((item: any) => {
        const gradeLower = (item.grade_or_severity || '').toLowerCase()
        let severity: 'mild' | 'moderate' | 'severe' = 'moderate'
        if (gradeLower.includes('severe') || gradeLower.includes('high') || gradeLower.includes('critical')) {
          severity = 'severe'
        } else if (gradeLower.includes('low') || gradeLower.includes('minor') || gradeLower.includes('good')) {
          severity = 'mild'
        }
        
        return {
          label: item.label,
          description: item.description,
          severity,
          bbox: item.bbox,
          center: item.center_point || (item.bbox ? {
            x: (item.bbox.xmin + item.bbox.xmax) / 2,
            y: (item.bbox.ymin + item.bbox.ymax) / 2
          } : undefined),
          radius: item.radius || 0.04, // Small radius for individual disease spots, not whole leaf
          visualCues: item.defects || []
        }
      }) || [],

      // Extract primary disease from batch analysis
      diseases: (rawData.batch_statistics?.predominant_issues || rawData.individual_items?.flatMap((i: any) => 
        i.defects?.map((d: string) => d.split(':')[0]?.trim() || d.split('-')[0]?.trim() || 'Unknown Issue')
      ).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).slice(0, 3) || ['General Plant Health Issue']).map((issue: string) => ({
        name: issue,
        confidence: rawData.confidence?.overall === 'High' ? 92 : 85,
        description: rawData.batch_summary || rawData.conclusions_and_recommendations || 'Detailed analysis completed.',
        evidenceFromCV: `Detected in ${rawData.batch_statistics?.total_items || 'multiple'} specimens with visible symptoms`
      })),

      // Symptoms from all defects
      symptoms: rawData.individual_items?.flatMap((i: any) => i.defects || []) || [],
      
      // Determine overall severity
      severity: (() => {
        const conf = rawData.confidence?.overall
        const issues = rawData.batch_statistics?.predominant_issues?.length || 0
        if (conf === 'Low' || issues === 0) return 'low'
        if (issues >= 3) return 'high'
        return 'medium'
      })(),

      cropType: rawData.batch_summary?.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/)?.[0] || 'Plant Batch',
      additionalInfo: rawData.conclusions_and_recommendations || '',
      
      // Extract treatments from recommendations
      organicTreatments: extractTreatments(rawData.conclusions_and_recommendations, 'organic'),
      chemicalTreatments: extractTreatments(rawData.conclusions_and_recommendations, 'chemical'),
      preventionTips: extractPreventionTips(rawData.conclusions_and_recommendations),
      causes: rawData.batch_statistics?.predominant_issues || [],
      
      // Intervention plan from recommendations
      interventionPlan: parseInterventionPlan(rawData.conclusions_and_recommendations),
      
      batch_grade_or_health_score: rawData.batch_grade_or_health_score,
      confidence: rawData.confidence,
      agenticReasoning: rawData.confidence?.reasons || 'Analysis based on visible evidence and established pathology patterns.',
      sustainabilityScore: 75 // Default
    }

    // Helper functions for parsing
    function extractTreatments(text: string = '', type: 'organic' | 'chemical'): string[] {
      if (!text) return []
      const lines = text.split('\n').filter(l => l.trim())
      const keywords = type === 'organic' ? 
        ['organic', 'neem', 'compost', 'natural', 'biological', 'prune', 'remove', 'copper fungicide'] :
        ['fungicide', 'pesticide', 'chemical', 'spray']
      
      return lines
        .filter(l => keywords.some(k => l.toLowerCase().includes(k)))
        .slice(0, 3)
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(l => l.length > 10)
    }

    function extractPreventionTips(text: string = ''): string[] {
      if (!text) return []
      const lines = text.split('\n').filter(l => l.trim())
      const keywords = ['prevent', 'avoid', 'maintain', 'monitor', 'ensure', 'improve', 'reduce']
      
      return lines
        .filter(l => keywords.some(k => l.toLowerCase().includes(k)))
        .slice(0, 3)
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(l => l.length > 10)
    }

    function parseInterventionPlan(text: string = '') {
      if (!text) return undefined
      
      const lines = text.split('\n').filter(l => l.trim())
      
      return {
        immediate: lines.filter(l => 
          l.toLowerCase().includes('immediate') || 
          l.toLowerCase().includes('now') ||
          l.toLowerCase().includes('remove') ||
          l.toLowerCase().includes('isolate')
        ).slice(0, 2).map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(l => l.length > 10),
        
        shortTerm: lines.filter(l => 
          l.toLowerCase().includes('apply') ||
          l.toLowerCase().includes('spray') ||
          l.toLowerCase().includes('treat') ||
          l.toLowerCase().includes('week')
        ).slice(0, 2).map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(l => l.length > 10),
        
        longTerm: lines.filter(l => 
          l.toLowerCase().includes('prevent') ||
          l.toLowerCase().includes('maintain') ||
          l.toLowerCase().includes('monitor') ||
          l.toLowerCase().includes('future')
        ).slice(0, 2).map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(l => l.length > 10),
        
        weatherOptimized: 'Apply treatments during cool, dry conditions for best efficacy'
      }
    }

    return NextResponse.json({
      success: true,
      diagnosis,
      processingTime: Date.now() - startTime
    })

  } catch (error: any) {
    console.error('❌ Analysis error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
