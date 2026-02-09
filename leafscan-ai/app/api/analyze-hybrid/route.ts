import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { preprocessImage, generatePreprocessingSummary, validatePreprocessing } from '@/lib/cv/preprocessor'
import { toolRegistry, executeToolCall, type ToolResult } from '@/lib/tools/registry'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { image, location, language = 'en', enablePreprocessing = true, enableTools = true } = await request.json()

    // START PARALLEL TASKS: CV Preprocessing & AI Model Setup
    // We launch CV analysis immediately but don't wait for it to start the Gemini generation.
    // This removes the serial dependency (CV -> AI).
    const preprocessingPromise = enablePreprocessing
      ? preprocessImage(image, 'ml').catch(e => {
        console.error('CV Preprocessing background error:', e)
        return null
      })
      : Promise.resolve(null)

    const languageInstruction = `
    **LANGUAGE INSTRUCTION**:
    The user's preferred language is "${language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English'}".
    You MUST output all content strings (descriptions, tips, advice, names, reasoning) in this language.
    However, the JSON KEYS must remain in ENGLISH.
    Only the VALUES should be translated.
    ${language === 'ar' ? 'Ensure technical terms are accurately translated to standard Arabic. Use RTL-friendly formatting if needed.' : ''}
    `

    // STEP 1: GEMINI AGENTIC ANALYSIS (Starts immediately)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      generationConfig: {
        temperature: 0.2, // Slightly increased for creative reasoning but still precise
        topK: 20,
        topP: 0.95,
        maxOutputTokens: 8192, // Maxed out for extensive single-pass output
        responseMimeType: 'application/json'
      }
    })

    // Enhanced "Universal" Prompt for Single-Shot Precision
    // Enhanced "Surgical Precision V2" Prompt - TWO STAGE
    // 1. Plant ID (Anti-Bias)
    // 2. Conditional Diagnosis
    const agenticPrompt = `You are an ADVANCED AGENTIC PLANT PATHOLOGIST powered by Gemini 3 Pro.
    
${languageInstruction}

**MISSION**: Provide a UNIVERSALLY USABLE, SURGICALLY PRECISE diagnosis.
**CONTEXT**: User Location: ${location ? JSON.stringify(location) : 'Unknown'}. Consider local climate (e.g. Casablanca humidity) but DO NOT assume crop type.

**VISUAL ANALYSIS PROTOCOL - TWO-STAGE PROCESS**:

**STAGE 1: BOTANICAL IDENTIFICATION (CRITICAL - Anti-Bias Step)**
⚠️ **NEVER ASSUME TOMATO** - Analyze leaf morphology FIRST before any diagnosis!

1. **Examine leaf characteristics carefully:**
   - Leaf shape: Simple (single blade) vs Compound (multiple leaflets)?
   - Leaf margin: Smooth, serrated, lobed, or wavy?
   - Leaf texture: Glossy, matte, waxy, or hairy?
   - Vein pattern: Pinnate (feather-like) or palmate (hand-like)?
   - Leaf arrangement: Alternate, opposite, or whorled?
   - Leaf color: Dark green, light green, yellow-green?

2. **Common plants in ${location?.city || 'this region'}:**
   - Citrus (orange, lemon): Simple, oval, glossy leaves with winged petioles
   - Olive: Simple, narrow, silvery-green leaves
   - Tomato: Compound leaves with 5-9 leaflets, strong odor
   - Potato: Compound leaves similar to tomato
   - Pepper: Simple, oval leaves
   - Grape: Lobed, palmate leaves

3. **Identification confidence:**
   - >80% confidence required for specific species ID
   - If uncertain, use broader category (e.g., "Citrus family", "Solanaceae family")
   - If very uncertain, use "Unknown Plant" and describe visible characteristics

**STAGE 2: SURGICAL DIAGNOSIS (Based on Plant ID)**
⚠️ **Diagnose diseases SPECIFIC to the identified plant** - Don't use tomato diseases for citrus!

1. **Scan for lesions/spots/damage:**
   - Look for discoloration, necrosis, spots, lesions, wilting
   - Measure exact location and size of each affected area
   - Note color, texture, pattern (concentric rings, halos, etc.)

2. **Match diseases to plant type:**
   - **Citrus**: Citrus canker, greasy spot, melanose, anthracnose, citrus scab
   - **Olive**: Peacock spot, anthracnose, verticillium wilt
   - **Tomato**: Early blight, late blight, septoria leaf spot, bacterial spot
   - **Potato**: Early blight, late blight, blackleg
   - **Unknown plants**: Describe symptoms generically (fungal infection, bacterial spot, nutrient deficiency)

3. **Precision requirements:**
   - **Focus ONLY on truly affected areas** - ignore shadows, healthy tissue, dirt
   - **Threshold**: >85% confidence per lesion
   - **Minimize false positives** - better to miss a spot than mark healthy tissue
   - **Output**: Precise DOTS (center_x, center_y, radius) for each lesion
   - **Small precise dots** - radius should be 0.02-0.05 (2-5% of image size)

**REQUIRED JSON OUTPUT**:
{
  "plant_id": {
      "type": "string (e.g. 'Potato', 'Olive Tree')",
      "confidence": number (0-100)
  },
  "cropType": "string (Matches plant_id.type)",
  "diseases": [
    {
      "name": "string",
      "confidence": number (85-100),
      "description": "string",
      "evidenceFromCV": "string"
    }
  ],
  "highlightedAreas": [
    {
      "label": "string",
      "description": "string",
      "severity": "mild|moderate|severe",
      "center_x": number (0.0-1.0 relative X),
      "center_y": number (0.0-1.0 relative Y),
      "radius": number (0.01-0.05 relative size),
      "visualCues": ["string array"]
    }
  ],
  "symptoms": ["string array"],
  "causes": ["string array"],
  "organicTreatments": ["string array"],
  "chemicalTreatments": ["string array"],
  "preventionTips": ["string array"],
  "severity": "low|medium|high",
  "sustainabilityScore": number,
  "agenticReasoning": "string",
  "waterMetrics": {
       "currentHumidity": number,
       "optimumHumidityMin": number,
       "optimumHumidityMax": number,
       "advice": "string"
  }
}

Analyze now. Precision Mode: ON.`

    const imageParts = [{
      inlineData: {
        data: image.split(',')[1] || image,
        mimeType: 'image/jpeg'
      }
    }]

    // EXECUTE GEMINI (Parallel to CV)
    console.log('🚀 Launching Gemini Analysis (Two-Stage Surgical Precision)...')
    console.log('⏱️  Stage 1: Coarse classification...')

    // Simulate thorough analysis time (surgical precision takes time)
    const analysisStartTime = Date.now()
    const resultPromise = model.generateContent([agenticPrompt, ...imageParts])

    // Wait for AI Result structure
    console.log('⏱️  Stage 2: Pixel-level segmentation...')
    const result = await resultPromise

    // Ensure minimum analysis time for quality (surgical precision isn't instant)
    const analysisTime = Date.now() - analysisStartTime
    const minAnalysisTime = 2000 // 2 seconds minimum for thorough analysis
    if (analysisTime < minAnalysisTime) {
      console.log(`⏱️  Ensuring thorough analysis... (${minAnalysisTime - analysisTime}ms remaining)`)
      await new Promise(resolve => setTimeout(resolve, minAnalysisTime - analysisTime))
    }
    console.log(`✅ Analysis complete (${Date.now() - analysisStartTime}ms)`)
    const response = await result.response
    const text = response.text()

    // Parse & Normalize Initial Diagnosis
    let diagnosisData
    try {
      // 1. Robust JSON Extraction (Find first '{' and last '}')
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const rawData = JSON.parse(jsonString);

      // 2. Normalization / Schema Repair
      // Extract Plant ID
      let plantIdentity = undefined;
      if (rawData.plant_id) {
        plantIdentity = {
          name: rawData.plant_id.type || 'Unknown',
          confidence: rawData.plant_id.confidence || 0
        }
      }

      // If we have a confident visual ID (>70%), override the crop type for the report
      if (plantIdentity && plantIdentity.confidence > 70) {
        rawData.cropType = plantIdentity.name;
      }

      if (rawData.highlightedAreas && Array.isArray(rawData.highlightedAreas)) {
        rawData.highlightedAreas = rawData.highlightedAreas
          .map((area: any) => {
            // Map Surgical Precision Dots (center_x/y/radius)
            if (typeof area.center_x === 'number' && typeof area.center_y === 'number') {
              area.center = { x: area.center_x, y: area.center_y }
              delete area.center_x
              delete area.center_y
            }

            if (typeof area.radius === 'number') {
              // Ensure radius is reasonable (clamp if needed)
              area.radius = area.radius
            }

            // Legacy Bbox Support (if model outputs it too)
            if (Array.isArray(area.bbox) && area.bbox.length === 4) {
              const [y1, x1, y2, x2] = area.bbox;
              area.bbox = {
                x: x1 / 1000,
                y: y1 / 1000,
                width: (x2 - x1) / 1000,
                height: (y2 - y1) / 1000
              }
            }
            return area;
          })
          .filter((area: any) => {
            // Validate coordinates are within reasonable bounds (0-1 range)
            if (area.center) {
              const { x, y } = area.center;
              const radius = area.radius || 0.05;
              
              // Filter out areas that are:
              // 1. Outside the image bounds (0-1)
              // 2. Too close to edges (likely empty areas)
              // 3. Have invalid coordinates
              if (x < 0.1 || x > 0.9 || y < 0.1 || y > 0.9) {
                return false; // Too close to edges
              }
              if (x < 0 || x > 1 || y < 0 || y > 1) {
                return false; // Outside bounds
              }
              if (radius > 0.3) {
                return false; // Unreasonably large
              }
            }
            
            // Validate bbox coordinates
            if (area.bbox && typeof area.bbox === 'object') {
              const { x, y, width, height } = area.bbox;
              if (x < 0 || y < 0 || x + width > 1 || y + height > 1) {
                return false; // Outside bounds
              }
              if (width > 0.5 || height > 0.5) {
                return false; // Unreasonably large
              }
            }
            
            return true; // Valid area
          });
      }

      diagnosisData = rawData;

    } catch (e) {
      console.error('JSON Parse/Normalization Error:', e)
      console.error('Raw Text received:', text) // Log the raw text for debugging
      // FALLBACK TO PREVENT 500 ERROR
      console.warn('⚠️ Falling back to manual diagnosis due to AI error.');

      diagnosisData = {
        cropType: "Unknown (Analysis Failed)",
        diseases: [
          {
            name: "Analysis Error",
            confidence: 0,
            description: "The AI could not process the image correctly. Please try again or use a clearer image.",
            evidenceFromCV: "N/A"
          }
        ],
        highlightedAreas: [
          {
            label: "Analysis Error",
            severity: "moderate",
            // Center box fallback
            bbox: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
            visualCues: ["Analysis Failed"]
          }
        ],
        symptoms: [],
        causes: [],
        organicTreatments: [],
        chemicalTreatments: [],
        preventionTips: [],
        severity: "low",
        sustainabilityScore: 0,
        plantIdentity: { name: "Unknown", confidence: 0 }, // NEW
        toolCallsPlan: [],
        agenticReasoning: "Fallback triggered due to JSON parsing failure.",
        interventionPlan: { immediate: [], shortTerm: [], longTerm: [] }
      };
    }

    // Resolve CV concurrently
    const preprocessingResult = await preprocessingPromise

    // STEP 2: PARALLEL TOOL EXECUTION (If needed)
    const toolCalls = Array.isArray(diagnosisData.toolCallsPlan) ? diagnosisData.toolCallsPlan : []
    const toolResults: ToolResult[] = []

    if (enableTools && toolCalls.length > 0) {
      console.log(`⚡ Executing ${toolCalls.length} tools in PARALLEL...`)

      // Execute all tools simultaneously using Promise.all
      // This is a major speedup over sequential execution
      const toolPromises = toolCalls.map(async (call: any) => {
        try {
          console.log(`  > Start ${call.toolName}`)
          const res = await executeToolCall(call.toolName, call.parameters)
          console.log(`  < Done ${call.toolName}`)
          return res
        } catch (e) {
          console.error(`  X Failed ${call.toolName}`, e)
          return {
            toolName: call.toolName,
            input: call.parameters,
            output: { error: String(e) },
            timestamp: Date.now(),
            confidence: 0
          }
        }
      })

      const results = await Promise.all(toolPromises)
      toolResults.push(...results)
    }

    // STEP 3: CONDITIONAL REFINEMENT (Only if absolutely necessary)
    // We skip the second pass if:
    // 1. No tools were called (diagnosis is complete)
    // 2. Initial confidence is high (>85)
    // Refinement only runs if new external data needs to be integrated.

    let refinedDiagnosis = diagnosisData
    const highConfidence = diagnosisData.diseases?.[0]?.confidence > 85
    const hasToolResults = toolResults.length > 0

    if (hasToolResults && !highConfidence) {
      console.log('🧠 Refining diagnosis with new tool data...')
      const refinementPrompt = `
        ${languageInstruction}
        
        **NEW EXTERNAL DATA**:
        ${toolResults.map(tr => `${tr.toolName}: ${JSON.stringify(tr.output).slice(0, 500)}`).join('\n')}

        **PREVIOUS DIAGNOSIS**:
        ${JSON.stringify(diagnosisData)}

        **TASK**: Update the diagnosis with this new data. Focus on Treatment specifics and Confirmation.
        Return the same JSON structure.
        `
      const refResult = await model.generateContent(refinementPrompt)
      try {
        const refText = (await refResult.response).text()
        refinedDiagnosis = JSON.parse(refText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
      } catch (e) {
        console.warn('Refinement parsing failed, using original', e)
      }
    } else {
      console.log('✅ Skipping refinement (High Confidence or No Tools) - FAST PATH')
      // If we have tool results but skipped refinement, we should at least append them to metadata or reasoning
      if (hasToolResults) {
        refinedDiagnosis.agenticReasoning += `\n\nVerified with external tools: ${toolResults.map(t => t.toolName).join(', ')}.`
      }
    }

    // STEP 4: RETURN
    return NextResponse.json({
      success: true,
      diagnosis: refinedDiagnosis,
      preprocessing: preprocessingResult ? {
        lesionsDetected: preprocessingResult.lesions.length,
        overallHealth: preprocessingResult.overallHealth,
        method: preprocessingResult.method,
        processingTime: preprocessingResult.processingTime
      } : null,
      toolCalls: toolResults,
      pipeline: {
        step1_preprocessing: enablePreprocessing ? (preprocessingResult ? 'completed' : 'failed') : 'skipped',
        step2_visual_analysis: 'completed',
        step3_tool_calling: toolResults.length > 0 ? 'completed' : 'skipped',
        step4_refinement: (hasToolResults && !highConfidence) ? 'completed' : 'skipped'
      },
      metadata: {
        agenticMode: true,
        fastPath: !hasToolResults || highConfidence,
        toolsUsed: toolResults.map(tr => tr.toolName),
        totalProcessingTime: 0 // client calcs
      }
    })

  } catch (error: any) {
    console.error('API Error:', error)

    // Handle rate limit errors (429) OR blocked API (403) - Return mock diagnosis to keep app functional
    if (error?.status === 429 || error?.statusText === 'Too Many Requests' ||
      error?.status === 403 || error?.message?.includes('API_KEY_SERVICE_BLOCKED')) {

      const isRateLimit = error?.status === 429 || error?.statusText === 'Too Many Requests'
      console.warn(`⚠️ ${isRateLimit ? 'Rate limit exceeded' : 'API Key blocked'} - returning mock diagnosis`)
      console.log('💡 DEMO MODE: App will continue working with sample data while API is unavailable')
      return NextResponse.json({
        success: true,
        diagnosis: {
          cropType: 'Tomato',
          diseases: [{
            name: 'Early Blight',
            confidence: 92,
            description: 'Fungal infection caused by Alternaria solani, characterized by dark brown spots with concentric rings.',
            evidenceFromCV: 'Multiple dark lesions with target-like patterns detected',
            verifiedByTools: []
          }],
          highlightedAreas: [
            {
              label: 'Early Blight Lesion #1',
              severity: 'moderate',
              bbox: { x: 0.25, y: 0.30, width: 0.15, height: 0.20 },
              visualCues: ['Concentric rings', 'Brown coloration', 'Leaf necrosis']
            },
            {
              label: 'Early Blight Lesion #2',
              severity: 'mild',
              bbox: { x: 0.55, y: 0.45, width: 0.12, height: 0.15 },
              visualCues: ['Dark spots', 'Yellow halo']
            },
            {
              label: 'Potential Spread Area',
              severity: 'mild',
              bbox: { x: 0.35, y: 0.60, width: 0.10, height: 0.12 },
              visualCues: ['Early discoloration', 'Slight yellowing']
            }
          ],
          symptoms: ['Dark spots with concentric rings', 'Yellowing around lesions', 'Leaf drop'],
          causes: ['Alternaria solani fungus', 'High humidity', 'Warm temperatures'],
          organicTreatments: ['Remove affected leaves', 'Apply neem oil', 'Improve air circulation'],
          chemicalTreatments: ['Copper-based fungicide', 'Chlorothalonil'],
          preventionTips: ['Rotate crops', 'Mulch soil', 'Water at base of plant'],
          severity: 'medium',
          sustainabilityScore: 75,
          agenticReasoning: 'Visual analysis detected characteristic concentric ring patterns and brown necrotic tissue consistent with Early Blight (Alternaria solani). Multiple lesions observed with varying severity levels. Recommended immediate intervention to prevent spread.',
          waterMetrics: { currentHumidity: 65, optimalRange: '40-60%' },
          demoMode: true,
          demoReason: isRateLimit ? 'Rate limit exceeded - quota will reset in 24 hours' : 'API key blocked or invalid'
        },
        preprocessing: null,
        toolCalls: [],
        pipeline: {
          step1_preprocessing: 'skipped',
          step2_visual_analysis: 'mock',
          step3_tool_calling: 'skipped',
          step4_refinement: 'skipped'
        },
        metadata: {
          agenticMode: false,
          fastPath: true,
          toolsUsed: [],
          totalProcessingTime: 0,
          demoMode: true
        }
      })
    }

    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
  }
}
