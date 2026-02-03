import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { diagnosis, treatmentPlan, duration = 14 } = await request.json()

    // Generate unique monitoring plan ID
    const monitoringPlanId = `mon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Use Gemini 3 to create initial monitoring strategy
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    })

    const prompt = `You are an autonomous Marathon Farming Agent powered by Gemini 3. Create a comprehensive monitoring strategy for ongoing crop health management.

**INITIAL DIAGNOSIS**:
- Crop: ${diagnosis.cropType}
- Primary Disease: ${diagnosis.diseases[0]?.name} (${diagnosis.diseases[0]?.confidence}% confidence)
- Severity: ${diagnosis.severity}
- Symptoms: ${diagnosis.symptoms.join(', ')}
- Estimated Yield Impact: ${diagnosis.estimatedYieldImpact || 'Unknown'}

**TREATMENT PLAN**:
${treatmentPlan.timeline.map((step: any) => `Day ${step.day}: ${step.action}`).join('\n')}

**MONITORING DURATION**: ${duration} days

**YOUR TASK**: Create a monitoring strategy with:
1. Recommended checkpoint days (when farmer should upload follow-up images)
2. Key indicators to track at each checkpoint
3. Success criteria (what improvement looks like)
4. Warning signs (when to escalate or adjust plan)
5. Adaptive insights (how you'll self-correct based on progress)

**REQUIRED JSON OUTPUT**:
{
  "checkpointSchedule": [
    {
      "day": number,
      "purpose": "string - why this checkpoint is important",
      "expectedChanges": ["string array - what should be visible"],
      "keyIndicators": ["string array - what to measure"]
    }
  ],
  "successCriteria": {
    "symptomReduction": "string - target % reduction",
    "timeframe": "string - expected timeline",
    "visualMarkers": ["string array - what healthy recovery looks like"]
  },
  "warningSigns": ["string array - red flags requiring immediate action"],
  "adaptiveStrategy": "string - how you'll adjust based on progress",
  "thoughtSignature": "string - unique context hash for continuity (use disease + crop + severity)"
}

**REASONING**: Use multi-step thinking to plan optimal monitoring intervals and success metrics.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let strategyData

    try {
      const text = response.text()
      strategyData = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // Fallback strategy
      strategyData = {
        checkpointSchedule: [
          { day: 3, purpose: 'Early treatment response', expectedChanges: ['Initial symptom changes'], keyIndicators: ['Symptom spread', 'New lesions'] },
          { day: 7, purpose: 'Mid-treatment assessment', expectedChanges: ['Visible improvement or stabilization'], keyIndicators: ['Symptom severity', 'Leaf health'] },
          { day: 14, purpose: 'Final evaluation', expectedChanges: ['Significant recovery or plan adjustment needed'], keyIndicators: ['Overall plant health', 'Yield potential'] }
        ],
        successCriteria: {
          symptomReduction: '50-70% reduction in visible symptoms',
          timeframe: '7-14 days',
          visualMarkers: ['New healthy growth', 'Reduced lesion spread', 'Improved leaf color']
        },
        warningSigns: ['Rapid symptom spread', 'New disease types', 'Plant wilting', 'Fruit/flower drop'],
        adaptiveStrategy: 'Monitor progress at each checkpoint and adjust treatment intensity, frequency, or method based on observed changes',
        thoughtSignature: `${diagnosis.cropType}_${diagnosis.diseases[0]?.name}_${diagnosis.severity}_${Date.now()}`
      }
    }

    // Create monitoring plan
    const monitoringPlan = {
      id: monitoringPlanId,
      startDate: Date.now(),
      cropType: diagnosis.cropType,
      initialDiagnosis: diagnosis,
      initialTreatmentPlan: treatmentPlan,
      checkpoints: [],
      currentStatus: 'active',
      totalDuration: duration,
      nextCheckpointDay: strategyData.checkpointSchedule[0]?.day || 3,
      adaptiveInsights: [
        `Monitoring plan initiated for ${diagnosis.cropType} with ${diagnosis.diseases[0]?.name}`,
        `Strategy: ${strategyData.adaptiveStrategy}`
      ],
      thoughtSignature: strategyData.thoughtSignature,
      strategy: strategyData
    }

    return NextResponse.json({ 
      success: true,
      monitoringPlan,
      message: `Marathon Agent activated! Next checkpoint: Day ${monitoringPlan.nextCheckpointDay}`
    })

  } catch (error) {
    console.error('Monitoring start error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize monitoring plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
