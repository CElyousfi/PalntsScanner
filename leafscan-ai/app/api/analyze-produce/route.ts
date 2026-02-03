import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '')

const PRODUCE_GRADING_PROMPT = `ULTRA-SURGICAL FRUIT GRADER (Ellips True-AI + LEAF MASK PRECISION LEVEL): Treat this as MACRO CLOSE-UP SCAN. Detect EVERY VISIBLE DEFECT on EVERY FRUIT, ZERO OMISSIONS, >82% confidence only.

CRITICAL REQUIREMENTS - NEXT-LEVEL PRECISION:
1. MISS NOTHING - Treat as high-res macro scan, enumerate EVERY fruit separately
2. Detect ALL visible micro-defects: even <1-2mm spots, faint color shifts, texture irregularities
3. Confidence threshold: >82% (balanced for maximum recall with minimal false positives)
4. HYPER-TIGHT bounding: radius 0.004-0.012 (pinpoint dots like pixel-level leaf detection)
5. Max defects: 30 (for dense batches like apple bowls)
6. Use edge detection, contrast analysis, color variance, texture irregularities
7. Infer subtle defects from shadows, curves, skin patterns
8. Casablanca climate context (humid/warm - fungal risks, moisture damage)

VARIETY-SPECIFIC KNOWLEDGE (Royal Gala Apples):
Common defects to prioritize:
- Russeting (rough brown patches)
- Lenticel breakdown (dark pits around lenticels)
- Bruises (faint dark areas, subsurface discoloration)
- Stem punctures/cracks
- Hail marks (small indentations)
- Sunburn edges (bleached or brown areas)
- Bitter pit starts (small sunken grey/brown spots)
- Scarf skin (cloudy dull patches)
- Minor rot/discoloration
- Texture flaws

NEXT-LEVEL ANALYSIS PROTOCOL:

STEP 1 - VARIETY IDENTIFICATION (>85% confidence required):
- Identify exact variety (e.g., "Gala apple", "Bing cherry", "Yukon Gold potato", "Navel orange", "Roma tomato")
- Consider: color, shape, size, surface texture, stem characteristics
- If uncertain, use general type (e.g., "Red apple", "Sweet cherry")

STEP 2 - NEXT-LEVEL MICRO-DEFECT DETECTION (Pixel-level precision - MISS NOTHING):
SCAN EVERY FRUIT INDIVIDUALLY IN THE IMAGE. Detect ALL defects (max 30 total, list every single one):
- id: sequential number (1-30)
- fruit_id: Assign to each fruit (1, 2, 3... for each apple in bowl)
- description: HYPER-DETAILED (e.g., "Faint 1mm dark bruise on cheek", "Tiny lenticel breakdown cluster 0.8mm", "Micro russet patch 2mm with rough texture", "Subtle discoloration indicating early rot")
- defect_type: One of: "russeting", "bruise", "puncture", "stem_crack", "scald", "rot", "bitter_pit", "scab", "sunburn", "hail_damage", "wind_rub", "insect_damage", "disease_lesion", "mechanical_damage", "skin_break", "lenticel_breakdown", "physiological_disorder", "fungal_infection", "bacterial_spot", "discoloration", "texture_anomaly", "micro_spot", "scarf_skin"
- confidence: 82-100 (lower threshold for maximum recall - note if borderline)
- severity: 
  * "Critical" - active rot, deep punctures >5mm, spreading disease, internal damage visible
  * "High" - significant bruising, large cracks, scald >15%, advanced physiological disorders
  * "Medium" - moderate bruises, russeting 5-15%, shallow cracks, early disease signs
  * "Low" - minor russeting <5%, tiny punctures <2mm, superficial marks
  * "Micro" - spots <1-2mm, faint discolorations, texture irregularities, subtle color shifts (DETECT ALL!)
- center_x, center_y: 0-1 relative coordinates (EXACT CORE PLACEMENT - pixel-level accuracy)
- radius: 0.004-0.012 relative (HYPER-TIGHT pinpoint dots like leaf masks!)
- size_percent: Actual % of fruit surface area (precise calculation)
- inferred_cause: Detailed root cause (e.g., "Lenticel stress from moisture", "Early fungal from humidity", "Insect puncture", "Hail impact", "UV sunburn", "Mechanical handling", "Bitter pit calcium deficiency")
- impact_on_shelf_life: "Critical" / "High" / "Medium" / "Low" / "Minimal"
- marketability: "Premium fresh" / "Fresh market" / "Processing" / "Juice grade" / "Animal feed" / "Reject"
- depth_inference: "Surface only" / "Subsurface" / "Deep tissue" / "Inferred internal"
- detection_method: "Visual clear" / "Color variance" / "Edge detection" / "Contrast analysis" / "Texture analysis" / "Shadow inference"

STEP 3 - RIPENESS & PHYSICAL ASSESSMENT (Advanced):
- ripeness_stage: "Green/Underripe" / "Optimal" / "Overripe" / "Rotting"
- ripeness_score: 0-100 (0=green, 50=underripe, 85-95=optimal, 100=overripe)
- firmness_estimate: "Soft" / "Medium" / "Firm" / "Crisp" (infer from texture, skin tightness, surface reflectance)
- texture_analysis: Describe skin texture quality

STEP 4 - SIZE/VOLUME/WEIGHT ESTIMATION (Pixel-based with depth inference):
- estimated_diameter_mm: Use pixel ratio + variety average + spatial reasoning (simulate binocular stereo)
- estimated_volume_cm3: Calculate from shape (sphere/ellipsoid) + depth inference
- estimated_weight_g: volume × variety density (e.g., apple ~0.64 g/cm³, orange ~0.48 g/cm³)
- size_class: "Small" / "Medium" / "Large" / "Extra Large" (variety-specific standards)

STEP 5 - MULTI-STANDARD GRADING (EU + USDA):
EU Standards:
- grade_eu: "Extra Class" / "Class I" / "Class II" / "Reject"
  * Extra Class: <1% minor defects, perfect shape/color, premium
  * Class I: <5% defects, good quality, standard retail
  * Class II: <10% defects, fair quality, discount retail
  * Reject: >10% defects or critical damage

USDA Standards:
- grade_usda: "Extra Fancy" / "Fancy" / "No.1" / "No.2" / "Reject"
  * Extra Fancy: Premium quality, <2% defects
  * Fancy: High quality, <5% defects
  * No.1: Good quality, <10% defects
  * No.2: Fair quality, <15% defects

- primary_defect: Most significant defect affecting grade
- defect_coverage_percent: Total % of surface with defects
- grading_confidence: 90-100%
- color_maturity_score: 0-100 (optimal color for variety)
- uniformity_score: 0-100 (shape, size, color consistency)

STEP 6 - ADVANCED QUALITY ANALYSIS:
- overall_quality_score: 0-100 (weighted: 35% defects, 25% ripeness, 20% uniformity, 10% size, 10% marketability)
- shelf_life_estimate: Days until quality degradation (consider defects + ripeness + climate)
- sustainability_impact: "Low waste potential" / "Medium spoilage risk" / "High spoilage risk" / "Immediate use required"
- storage_recommendations: Precise temp/humidity/handling for Casablanca climate (humid/warm)
- market_destination: "Premium retail" / "Standard retail" / "Discount" / "Processing" / "Juice grade" / "Animal feed"

STEP 7 - ROOT CAUSE & EXPERT RECOMMENDATIONS (Casablanca-tuned):
- root_cause: Detailed multi-factor analysis (e.g., "Hail damage during fruit development. Russeting from moisture stress in humid climate. Fungal risk elevated due to Casablanca's warm/humid conditions. Bruising from rough post-harvest handling.")
- recommendations: 2-3 specific actionable tips (e.g., "Store at 10°C to prevent fungal rot in humid Casablanca climate", "Sell within 5 days due to high spoilage risk", "Sort to processing grade for juice/sauce production")
- prevention_tips: Agricultural best practices (e.g., "Install hail netting in exposed orchards", "Improve irrigation consistency during fruit set", "Apply fungicide in humid seasons", "Train harvest crew on gentle handling", "Use climate-controlled storage immediately post-harvest")

OUTPUT FORMAT (ONLY valid JSON, no markdown, no code blocks):
{
  "variety": {
    "name": "Royal Gala apple",
    "confidence": 96,
    "category": "Dessert apple"
  },
  "fruit_count": 8,
  "areas": [
    {
      "id": 1,
      "fruit_id": 1,
      "description": "Tiny dark puncture 0.5mm wide at stem area, possible insect entry point",
      "defect_type": "puncture",
      "confidence": 88,
      "severity": "Micro",
      "center_x": 0.382,
      "center_y": 0.418,
      "radius": 0.008,
      "size_percent": 0.3,
      "inferred_cause": "Insect puncture during growth phase",
      "impact_on_shelf_life": "Low",
      "marketability": "Fresh market",
      "depth_inference": "Surface only",
      "detection_method": "Edge detection"
    },
    {
      "id": 2,
      "fruit_id": 2,
      "description": "Faint brown discoloration 2mm on cheek, early bruise development",
      "defect_type": "bruise",
      "confidence": 86,
      "severity": "Micro",
      "center_x": 0.625,
      "center_y": 0.512,
      "radius": 0.010,
      "size_percent": 0.5,
      "inferred_cause": "Minor mechanical impact post-harvest",
      "impact_on_shelf_life": "Low",
      "marketability": "Fresh market",
      "depth_inference": "Subsurface",
      "detection_method": "Color variance"
    }
  ],
  "assessment": {
    "ripeness_stage": "Optimal",
    "ripeness_score": 90,
    "firmness_estimate": "Firm",
    "texture_analysis": "Smooth waxy skin with tight surface, excellent turgor pressure"
  },
  "estimates": {
    "diameter_mm": 75,
    "volume_cm3": 220,
    "weight_g": 175,
    "size_class": "Medium"
  },
  "grading": {
    "grade_eu": "Class I",
    "grade_usda": "US Fancy",
    "primary_defect": "Minor micro-defects",
    "defect_coverage_percent": 2.8,
    "grading_confidence": 94,
    "color_maturity_score": 92,
    "uniformity_score": 88
  },
  "overall_quality_score": 92,
  "shelf_life_estimate": 21,
  "sustainability_impact": "Low waste potential",
  "storage_recommendations": "Store at 8-10°C (Casablanca climate adjusted). 85-90% RH. Excellent ventilation. Use within 3 weeks.",
  "market_destination": "Premium retail",
  "recommendations": [
    "Sort to Class I/US Fancy for premium retail",
    "Monitor micro-defects for progression in humid climate",
    "Excellent quality for fresh consumption",
    "Price at premium tier with minor cosmetic notes"
  ],
  "root_cause": "Minor mechanical impacts during harvest/transport. Tiny insect damage during growth. Overall excellent handling practices observed. Casablanca humid climate requires vigilant storage.",
  "prevention_tips": "Continue gentle handling protocols. Consider softer bin liners. Monitor for insects during growth phase. Implement rapid cooling post-harvest in humid climate. Use climate-controlled transport."
}

CRITICAL NEXT-LEVEL ZERO MISSES PROTOCOL:
- Treat as MACRO CLOSE-UP SCAN - enumerate EVERY fruit in image
- Scan EACH fruit individually (assign fruit_id: 1, 2, 3...)
- Detect ALL visible defects, even <1-2mm micro-spots, faint color shifts
- Use contrast analysis, color variance, edge detection, texture analysis
- Infer subtle defects from shadows, curves, skin patterns
- List up to 30 defects total (dense batches like apple bowls)
- Confidence >82% for detection (maximum recall, minimal false positives)
- Hyper-tight radius 0.004-0.012 (pinpoint dots like pixel-level leaf detection)
- Better to detect 20+ real micro-defects than miss 1 subtle flaw
- Like leaf scanner: MISS NOTHING - EVERY SINGLE SPOT DETECTED
- For Royal Gala: prioritize lenticel breakdown, russeting, faint bruises, stem issues, bitter pit, scarf skin`

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY or GOOGLE_API_KEY not set, using demo data')
      return NextResponse.json({
        success: true,
        results: getDemoProduceResults(),
        demoMode: true
      })
    }

    try {
      // Use Gemini-3-Pro-Preview for maximum surgical precision produce grading
      const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

      // Convert base64 to proper format
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

      const result = await model.generateContent([
        PRODUCE_GRADING_PROMPT,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        }
      ])

      const response = await result.response
      const text = response.text()

      // Clean up response
      let jsonText = text.trim()
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      const results = JSON.parse(jsonText)

      return NextResponse.json({
        success: true,
        results,
        demoMode: false
      })
    } catch (apiError) {
      console.error('Gemini API error:', apiError)
      return NextResponse.json({
        success: true,
        results: getDemoProduceResults(),
        demoMode: true
      })
    }
  } catch (error) {
    console.error('Produce analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Analysis failed'
    }, { status: 500 })
  }
}

function getDemoProduceResults() {
  return {
    variety: { 
      name: 'Royal Gala Apple', 
      confidence: 96,
      category: 'Dessert apple'
    },
    fruit_count: 1,
    areas: [
      {
        id: 1,
        fruit_id: 1,
        description: 'Russeting patch with micro-texture roughness on shoulder (6mm diameter)',
        defect_type: 'russeting',
        confidence: 95,
        severity: 'Medium',
        center_x: 0.38,
        center_y: 0.42,
        radius: 0.009,
        size_percent: 2.8,
        inferred_cause: 'Moisture stress during early fruit development, exacerbated by humid climate',
        impact_on_shelf_life: 'Low',
        marketability: 'Fresh market',
        depth_inference: 'Surface only',
        detection_method: 'Visual clear'
      },
      {
        id: 2,
        fruit_id: 1,
        description: 'Stem bowl micro-crack (1.2mm) with slight brown discoloration',
        defect_type: 'stem_crack',
        confidence: 93,
        severity: 'Low',
        center_x: 0.52,
        center_y: 0.28,
        radius: 0.006,
        size_percent: 0.6,
        inferred_cause: 'Natural fruit expansion during growth phase',
        impact_on_shelf_life: 'Minimal',
        marketability: 'Fresh market',
        depth_inference: 'Surface only',
        detection_method: 'Edge detection'
      },
      {
        id: 3,
        fruit_id: 1,
        description: 'Minor wind rub with superficial skin abrasion on cheek (2.5mm)',
        defect_type: 'wind_rub',
        confidence: 92,
        severity: 'Low',
        center_x: 0.48,
        center_y: 0.58,
        radius: 0.008,
        size_percent: 0.9,
        inferred_cause: 'Wind exposure during growth period, common in exposed orchards',
        impact_on_shelf_life: 'Minimal',
        marketability: 'Fresh market',
        depth_inference: 'Surface only',
        detection_method: 'Texture analysis'
      },
      {
        id: 4,
        fruit_id: 1,
        description: 'Tiny dark lenticel breakdown cluster (0.7mm) near stem',
        defect_type: 'lenticel_breakdown',
        confidence: 88,
        severity: 'Micro',
        center_x: 0.50,
        center_y: 0.32,
        radius: 0.005,
        size_percent: 0.15,
        inferred_cause: 'Moisture fluctuation causing lenticel stress',
        impact_on_shelf_life: 'Minimal',
        marketability: 'Fresh market',
        depth_inference: 'Surface only',
        detection_method: 'Contrast analysis'
      },
      {
        id: 5,
        fruit_id: 1,
        description: 'Faint discoloration (1.8mm) on lower cheek, early subsurface bruise',
        defect_type: 'bruise',
        confidence: 86,
        severity: 'Micro',
        center_x: 0.45,
        center_y: 0.65,
        radius: 0.007,
        size_percent: 0.4,
        inferred_cause: 'Minor mechanical impact during handling',
        impact_on_shelf_life: 'Low',
        marketability: 'Fresh market',
        depth_inference: 'Subsurface',
        detection_method: 'Color variance'
      },
      {
        id: 6,
        fruit_id: 1,
        description: 'Micro dark spot (0.5mm) on upper shoulder, possible insect puncture',
        defect_type: 'puncture',
        confidence: 84,
        severity: 'Micro',
        center_x: 0.42,
        center_y: 0.38,
        radius: 0.004,
        size_percent: 0.08,
        inferred_cause: 'Insect puncture during growth phase',
        impact_on_shelf_life: 'Minimal',
        marketability: 'Fresh market',
        depth_inference: 'Surface only',
        detection_method: 'Edge detection'
      },
      {
        id: 7,
        fruit_id: 1,
        description: 'Subtle texture irregularity (1.5mm) on side, early scarf skin',
        defect_type: 'scarf_skin',
        confidence: 83,
        severity: 'Micro',
        center_x: 0.35,
        center_y: 0.52,
        radius: 0.006,
        size_percent: 0.3,
        inferred_cause: 'Moisture stress creating cloudy dull patch',
        impact_on_shelf_life: 'Minimal',
        marketability: 'Fresh market',
        depth_inference: 'Surface only',
        detection_method: 'Texture analysis'
      },
      {
        id: 8,
        fruit_id: 1,
        description: 'Faint color shift (1mm) near calyx, possible early bitter pit',
        defect_type: 'bitter_pit',
        confidence: 82,
        severity: 'Micro',
        center_x: 0.54,
        center_y: 0.72,
        radius: 0.005,
        size_percent: 0.12,
        inferred_cause: 'Calcium deficiency during fruit development',
        impact_on_shelf_life: 'Minimal',
        marketability: 'Fresh market',
        depth_inference: 'Subsurface',
        detection_method: 'Color variance'
      }
    ],
    assessment: {
      ripeness_stage: 'Optimal',
      ripeness_score: 88,
      firmness_estimate: 'Firm',
      texture_analysis: 'Smooth waxy skin with good turgor pressure, tight surface indicating optimal firmness'
    },
    estimates: {
      diameter_mm: 76,
      volume_cm3: 230,
      weight_g: 182,
      size_class: 'Medium'
    },
    grading: {
      grade_eu: 'Class I',
      grade_usda: 'Fancy',
      primary_defect: 'russeting',
      defect_coverage_percent: 7.8,
      grading_confidence: 94,
      color_maturity_score: 88,
      uniformity_score: 85
    },
    overall_quality_score: 86,
    shelf_life_estimate: 21,
    sustainability_impact: 'Low waste potential',
    storage_recommendations: 'Store at 8-10°C (adjusted for Casablanca humid climate), 85-90% RH. Handle gently to avoid bruising. Ensure good ventilation to prevent moisture accumulation. Sell within 3 weeks for optimal quality.',
    market_destination: 'Standard retail',
    recommendations: [
      'Sort to Class I for standard retail channels',
      'Suitable for fresh consumption with minor cosmetic defects',
      'Price 10-15% below Extra Class, ideal for bagged apples or value packs'
    ],
    root_cause: 'Russeting caused by moisture fluctuations during early fruit development (May-June), common in humid climates. Wind rub from exposure during growth period. Stem crack from natural fruit expansion. No post-harvest damage detected - good handling practices observed.',
    prevention_tips: 'Maintain consistent irrigation during fruit set (critical weeks 2-8 after bloom). Install windbreaks in exposed orchard blocks. Monitor weather forecasts for hail risk. Thin fruit clusters to reduce stem stress. In humid climates like Casablanca, ensure proper orchard ventilation and consider fungicide applications during wet periods.'
  }
}
