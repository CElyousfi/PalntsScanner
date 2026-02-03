import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * SURGICAL PRECISION LEAF ANALYSIS - Complete Rewrite
 * 
 * Two-Stage Pipeline:
 * 1. Plant Identification (NO assumptions)
 * 2. Precise Lesion Detection (pixel-level)
 */

export async function POST(request: NextRequest) {
  try {
    const { image, location } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    console.log('🔬 SURGICAL PRECISION ANALYSIS STARTED')
    console.log('📍 Location:', location || 'Unknown')
    
    const startTime = Date.now()

    // Initialize Gemini 3 Pro for vision analysis
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      generationConfig: {
        temperature: 0.1, // Low temperature for precision
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    // SURGICAL PRECISION PROMPT - Complete Rewrite
    const surgicalPrompt = `You are an EXPERT PLANT PATHOLOGIST with SURGICAL PRECISION capabilities.

🎯 **CRITICAL MISSION**: Identify the plant FIRST, then diagnose with pixel-level precision.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **STAGE 1: PLANT IDENTIFICATION (MANDATORY - NO ASSUMPTIONS)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **NEVER ASSUME THE PLANT TYPE** - Analyze visual characteristics FIRST!

**Step 1: Examine Leaf Morphology**
Look at the image and answer these questions:

1. **Leaf Structure:**
   - Is it a SIMPLE leaf (one blade) or COMPOUND leaf (multiple leaflets)?
   - If compound, how many leaflets? (e.g., 3, 5, 7, 9+)

2. **Leaf Shape:**
   - Oval, lanceolate, heart-shaped, lobed, palmate?
   - Length-to-width ratio?

3. **Leaf Margin:**
   - Smooth (entire)?
   - Serrated (toothed)?
   - Lobed?
   - Wavy?

4. **Leaf Texture:**
   - Glossy/shiny?
   - Matte?
   - Waxy coating?
   - Hairy/fuzzy?
   - Leathery?

5. **Vein Pattern:**
   - Pinnate (feather-like, central midrib)?
   - Palmate (radiating from base)?
   - Parallel?

6. **Leaf Color:**
   - Dark green?
   - Light green?
   - Yellow-green?
   - Blue-green?
   - Silvery?

7. **Special Features:**
   - Petiole (leaf stem) characteristics?
   - Stipules present?
   - Aromatic when crushed?

**Step 2: Match to Plant Database**

Based on morphology, identify from these common plants:

**CITRUS (Orange, Lemon, Lime):**
- Simple, oval leaves
- Glossy, leathery texture
- Winged petiole (distinctive!)
- Aromatic when crushed
- Dark green color

**OLIVE:**
- Simple, narrow, lanceolate leaves
- Silvery-green color (distinctive!)
- Leathery texture
- Smooth margins

**TOMATO:**
- Compound leaves (5-9 leaflets)
- Serrated margins
- Strong characteristic odor
- Hairy stems and leaves
- Matte texture

**POTATO:**
- Compound leaves (similar to tomato)
- 7-9 leaflets
- Less hairy than tomato

**PEPPER (Bell/Chili):**
- Simple, oval leaves
- Smooth margins
- Glossy texture
- No strong odor

**GRAPE:**
- Simple, lobed leaves (3-5 lobes)
- Palmate venation
- Serrated margins
- Heart-shaped base

**APPLE/PEAR:**
- Simple, oval leaves
- Serrated margins
- Smooth texture

**BEAN/PEA:**
- Compound leaves (3 leaflets typical)
- Smooth margins

**Step 3: Confidence Assessment**
- If morphology clearly matches a plant: Confidence >85%
- If matches plant family but not specific: Confidence 70-85%
- If uncertain: Confidence <70%, use "Unknown Plant"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **STAGE 2: SURGICAL LESION DETECTION**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ONLY proceed if plant is identified (confidence >70%)**

**Step 1: Scan for Lesions**
Examine the image pixel-by-pixel for:
- Spots, lesions, discoloration
- Necrotic tissue (dead/brown areas)
- Chlorosis (yellowing)
- Physical damage (holes, tears)
- Unusual patterns

**Step 2: Filter Out False Positives**
DO NOT mark as lesions:
❌ Shadows or lighting variations
❌ Natural leaf veins
❌ Dirt or water droplets
❌ Background objects
❌ Camera artifacts
❌ Natural color variations in healthy tissue
❌ Leaf edges or natural aging

**Step 3: Measure Precise Coordinates**
For EACH real lesion found:
1. Identify the EXACT center point of the lesion
2. Measure the radius (how far it extends from center)
3. Calculate as fraction of image dimensions:
   - center_x = (pixel_x / image_width) → value 0.0 to 1.0
   - center_y = (pixel_y / image_height) → value 0.0 to 1.0
   - radius = (lesion_radius / min(image_width, image_height)) → value 0.01 to 0.08

**Step 4: Match Disease to Plant**
Based on identified plant, match appropriate diseases:

**For CITRUS:**
- Citrus Canker (raised lesions with yellow halos)
- Greasy Spot (dark spots, greasy appearance)
- Melanose (brown spots, rough texture)
- Citrus Scab (raised, warty lesions)

**For OLIVE:**
- Peacock Spot (circular spots with yellow halos)
- Anthracnose (dark sunken lesions)

**For TOMATO:**
- Early Blight (concentric rings, target-like)
- Late Blight (water-soaked lesions)
- Septoria Leaf Spot (small circular spots)
- Bacterial Spot (dark spots with yellow halos)

**For UNKNOWN plants:**
- Use generic descriptions: "Fungal Leaf Spot", "Bacterial Infection", "Nutrient Deficiency"

**Step 5: Confidence & Severity**
- Confidence: >90% for clear lesions, 85-90% for uncertain
- Severity:
  * mild: <5% of leaf area affected, early stage
  * moderate: 5-20% of leaf area, spreading
  * severe: >20% of leaf area, extensive damage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 **REQUIRED JSON OUTPUT**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "plantIdentification": {
    "species": "string (e.g., 'Citrus (Orange/Lemon)', 'Olive Tree', 'Tomato', 'Unknown Plant')",
    "confidence": number (0-100),
    "morphologyNotes": "string (brief description of key features observed)",
    "leafType": "simple" | "compound",
    "distinctiveFeatures": ["string array of key identifying features"]
  },
  "cropType": "string (same as plantIdentification.species)",
  "diseases": [
    {
      "name": "string (disease name appropriate for identified plant)",
      "confidence": number (85-100),
      "description": "string (detailed pathology)",
      "evidenceFromCV": "string (what visual evidence supports this diagnosis)"
    }
  ],
  "highlightedAreas": [
    {
      "id": number,
      "label": "string (e.g., 'Lesion #1 - Upper Left')",
      "center_x": number (0.0-1.0, precise center X coordinate),
      "center_y": number (0.0-1.0, precise center Y coordinate),
      "radius": number (0.01-0.08, size of affected area),
      "severity": "mild" | "moderate" | "severe",
      "visualCues": ["string array (e.g., 'Dark brown necrosis', 'Yellow halo', 'Concentric rings')"],
      "confidence": number (85-100)
    }
  ],
  "symptoms": ["string array"],
  "causes": ["string array"],
  "organicTreatments": ["string array"],
  "chemicalTreatments": ["string array"],
  "preventionTips": ["string array"],
  "severity": "low" | "medium" | "high",
  "sustainabilityScore": number (0-100),
  "agenticReasoning": "string (brief explanation of identification and diagnosis process)"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ **CRITICAL RULES**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **NEVER assume tomato** - Identify plant from visual features
2. **Only mark REAL lesions** - High threshold (>90% confidence)
3. **Precise coordinates** - Measure exact center and radius
4. **Match diseases to plant** - Don't diagnose tomato diseases for citrus!
5. **Small precise dots** - radius 0.01-0.08, not large boxes
6. **Quality over quantity** - Better 2-3 precise lesions than 10 uncertain ones
7. **Maximum 6 lesions** - Focus on most significant

Analyze now with SURGICAL PRECISION! 🔬`

    const imageParts = [{
      inlineData: {
        data: image.split(',')[1] || image,
        mimeType: 'image/jpeg'
      }
    }]

    console.log('⏱️  Stage 1: Plant identification...')
    const result = await model.generateContent([surgicalPrompt, ...imageParts])
    
    console.log('⏱️  Stage 2: Lesion detection...')
    const response = await result.response
    const text = response.text()
    const analysisTime = Date.now() - startTime
    console.log(`✅ Analysis complete (${analysisTime}ms)`)

    // Parse JSON response
    let diagnosisData
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      diagnosisData = JSON.parse(jsonString)

      // Normalize highlighted areas
      if (diagnosisData.highlightedAreas && Array.isArray(diagnosisData.highlightedAreas)) {
        diagnosisData.highlightedAreas = diagnosisData.highlightedAreas.map((area: any) => {
          // Ensure we have center and radius
          if (typeof area.center_x === 'number' && typeof area.center_y === 'number') {
            area.center = { x: area.center_x, y: area.center_y }
            area.radius = area.radius || 0.03 // Default 3% if not specified
          }
          return area
        })
      }

      // Add plant identity for UI display
      if (diagnosisData.plantIdentification) {
        diagnosisData.plantIdentity = {
          name: diagnosisData.plantIdentification.species,
          confidence: diagnosisData.plantIdentification.confidence,
          morphologyNotes: diagnosisData.plantIdentification.morphologyNotes
        }
      }

      console.log('🔬 Plant identified:', diagnosisData.plantIdentification?.species)
      console.log('🎯 Lesions detected:', diagnosisData.highlightedAreas?.length || 0)

    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.log('Raw response:', text)
      
      // Fallback response
      diagnosisData = {
        plantIdentification: {
          species: 'Unknown Plant',
          confidence: 0,
          morphologyNotes: 'Unable to analyze image',
          leafType: 'unknown',
          distinctiveFeatures: []
        },
        cropType: 'Unknown Plant',
        diseases: [],
        highlightedAreas: [],
        symptoms: ['Analysis failed'],
        causes: ['Unable to process image'],
        organicTreatments: [],
        chemicalTreatments: [],
        preventionTips: [],
        severity: 'low',
        sustainabilityScore: 0,
        agenticReasoning: 'Failed to parse AI response',
        plantIdentity: { name: 'Unknown Plant', confidence: 0 }
      }
    }

    return NextResponse.json({
      success: true,
      diagnosis: diagnosisData,
      processingTime: Date.now() - startTime,
      model: 'gemini-3-pro-preview',
      surgicalPrecision: true
    })

  } catch (error: any) {
    console.error('Surgical analysis error:', error)
    
    // Return demo mode if API fails
    return NextResponse.json({
      success: true,
      diagnosis: {
        plantIdentification: {
          species: 'Demo Mode - API Unavailable',
          confidence: 0,
          morphologyNotes: 'API rate limited or unavailable',
          leafType: 'unknown',
          distinctiveFeatures: []
        },
        cropType: 'Demo Mode',
        diseases: [{
          name: 'Sample Disease',
          confidence: 85,
          description: 'Demo mode active - get new API key for real analysis',
          evidenceFromCV: 'API unavailable'
        }],
        highlightedAreas: [],
        symptoms: ['API unavailable'],
        causes: ['Rate limit or quota exceeded'],
        organicTreatments: ['Get new API key from https://makersuite.google.com/app/apikey'],
        chemicalTreatments: [],
        preventionTips: [],
        severity: 'low',
        sustainabilityScore: 0,
        agenticReasoning: 'Demo mode - API unavailable',
        plantIdentity: { name: 'Demo Mode', confidence: 0 },
        demoMode: true
      }
    })
  }
}
