import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { diagnosis, preferences, deepThink, language } = await request.json()

    const langInstruction = language === 'fr'
      ? 'IMPORTANT: Respond ONLY in FRENCH.'
      : language === 'ar'
        ? 'IMPORTANT: Respond ONLY in ARABIC.'
        : 'IMPORTANT: Respond ONLY in ENGLISH.'

    // Use deep reasoning mode for complex treatment planning
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      generationConfig: {
        temperature: deepThink ? 0.6 : 0.5, // Higher temp for creative problem-solving in deep mode
        topK: 40,
        topP: 0.95,
        maxOutputTokens: deepThink ? 3072 : 2048, // More tokens for detailed reasoning
      }
    })

    const deepThinkPrompt = deepThink ? `
**DEEP REASONING MODE ACTIVATED**
Use advanced multi-step reasoning to:
1. Analyze disease progression patterns over 14 days
2. Consider environmental factors (weather, soil, neighboring crops)
3. Optimize treatment timing for maximum efficacy
4. Calculate cost-benefit ratios for each intervention
5. Provide contingency plans for common complications
` : ''

    const prompt = `You are an expert agricultural consultant using Gemini 3 Pro's advanced reasoning capabilities to create a personalized, evidence-based treatment plan.
${langInstruction}
${deepThinkPrompt}
**DIAGNOSIS SUMMARY**:
- Crop: ${diagnosis.cropType}
- Primary Disease: ${diagnosis.diseases[0]?.name} (${diagnosis.diseases[0]?.confidence}% confidence)
- Severity: ${diagnosis.severity}
- Climate Context: ${diagnosis.climateContext || 'Not specified'}
- Estimated Yield Impact: ${diagnosis.estimatedYieldImpact || 'Unknown'}
- Sustainability Score: ${diagnosis.sustainabilityScore || 'N/A'}/100

**AVAILABLE TREATMENTS**:
Organic: ${diagnosis.organicTreatments.join(', ')}
Chemical: ${diagnosis.chemicalTreatments.join(', ')}

**USER CONSTRAINTS**:
- Farm Size: ${preferences.farmSize || 'Not specified'}
- Budget: ${preferences.budget || 'Not specified'}
- Treatment Preference: ${preferences.resourcePreference}

**REQUIRED JSON SCHEMA** (respond ONLY with this structure):
{
  "timeline": [
    {
      "day": number (1-14),
      "action": "string - concise action title",
      "details": "string - step-by-step instructions with quantities, timing, safety notes",
      "cost": "string - estimated cost range (e.g., '$5-10' or 'Free')",
      "weatherNote": "string - adaptation if rain/drought (optional)"
    }
  ],
  "alternatives": ["string - alternative approaches for different scenarios"],
  "economicAnalysis": {
    "totalEstimatedCost": "string - e.g., '$50-80'",
    "potentialSavings": "string - e.g., 'Prevents $200-400 in crop loss'",
    "roi": "string - return on investment estimate"
  },
  "weatherAdaptations": {
    "rain": "string - what to do if heavy rain occurs",
    "drought": "string - what to do if drought continues",
    "heatwave": "string - adaptations for extreme heat"
  }
}

**PLANNING INSTRUCTIONS**:
1. **Day 1-2 (Immediate Response)**: 
   - Remove infected material
   - Apply first treatment (prioritize ${preferences.resourcePreference})
   - Isolate affected plants if needed

2. **Day 3-5 (Monitoring & Adjustment)**:
   - Document symptom changes
   - Adjust treatment if no improvement
   - Check for spread to neighboring plants

3. **Day 6-10 (Follow-up Treatment)**:
   - Second application if needed
   - Implement preventive measures
   - Soil/water management adjustments

4. **Day 11-14 (Recovery & Prevention)**:
   - Final assessment
   - Long-term prevention strategies
   - Crop rotation planning

5. **Budget Optimization**:
   ${preferences.budget ? `Stay within ${preferences.budget} budget. Prioritize cost-effective methods.` : 'Provide cost estimates for each step.'}

6. **Economic Impact**:
   - Calculate total treatment cost
   - Estimate prevented crop loss (use ${diagnosis.estimatedYieldImpact || '20-40% loss'} as baseline)
   - Show ROI to justify investment

7. **Weather Contingencies**:
   - If rain: Adjust spray schedules, improve drainage
   - If drought: Modify watering, stress management
   - If heat: Timing adjustments, shade considerations

**GENERATE COMPREHENSIVE PLAN NOW**:`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })
    const response = await result.response
    const text = response.text()

    let plan
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      plan = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Failed to parse plan:', text)
      // Fallback plan
      plan = {
        timeline: [
          {
            day: 1,
            action: 'Initial Assessment',
            details: 'Inspect all affected plants and remove severely damaged leaves.',
            cost: 'Free',
            weatherNote: 'Can be done in any weather'
          },
          {
            day: 2,
            action: 'Apply First Treatment',
            details: preferences.resourcePreference === 'organic'
              ? 'Apply neem oil spray in the early morning or late evening.'
              : 'Apply recommended fungicide according to label instructions.',
            cost: '$10-20',
            weatherNote: 'Avoid if rain expected within 24 hours'
          },
          {
            day: 5,
            action: 'Monitor Progress',
            details: 'Check for new symptoms or spread. Document any changes.',
            cost: 'Free',
            weatherNote: 'N/A'
          },
          {
            day: 7,
            action: 'Second Treatment',
            details: 'Repeat treatment if symptoms persist. Adjust approach if needed.',
            cost: '$10-20',
            weatherNote: 'Delay if heavy rain forecast'
          },
          {
            day: 10,
            action: 'Preventive Measures',
            details: 'Improve drainage, spacing, or ventilation to prevent recurrence.',
            cost: '$5-15',
            weatherNote: 'N/A'
          },
          {
            day: 14,
            action: 'Final Assessment',
            details: 'Evaluate overall improvement. Plan long-term prevention strategy.',
            cost: 'Free',
            weatherNote: 'N/A'
          }
        ],
        alternatives: [
          'If organic methods are insufficient, consider targeted chemical treatment',
          'For budget constraints, try homemade remedies like garlic or baking soda spray',
          'Consult local agricultural extension for region-specific advice'
        ],
        economicAnalysis: {
          totalEstimatedCost: '$25-55',
          potentialSavings: 'Prevents $150-300 in crop loss',
          roi: '3-6x return on investment'
        },
        weatherAdaptations: {
          rain: 'Delay sprays, improve drainage, increase monitoring',
          drought: 'Adjust watering schedule, mulch to retain moisture',
          heatwave: 'Apply treatments in early morning/evening, provide shade if possible'
        }
      }
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate treatment plan' },
      { status: 500 }
    )
  }
}
