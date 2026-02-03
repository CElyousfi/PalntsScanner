import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { 
      monitoringPlan, 
      dayNumber, 
      imageBase64, 
      userNotes = '',
      weatherConditions = ''
    } = await request.json()

    // Marathon Agent with HIGH thinking level for deep reasoning
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      generationConfig: {
        temperature: 0.6, // Higher for adaptive reasoning
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3072, // More tokens for deep analysis
        responseMimeType: 'application/json',
        // Note: thinking_level would be set here if available in SDK
        // For now, we emphasize deep reasoning in the prompt
      }
    })

    // Build comprehensive context from monitoring history
    const previousCheckpoints = monitoringPlan.checkpoints || []
    const initialDiagnosis = monitoringPlan.initialDiagnosis
    const treatmentPlan = monitoringPlan.initialTreatmentPlan

    const prompt = `You are a MARATHON FARMING AGENT powered by Gemini 3 with DEEP REASONING capabilities. You maintain continuity across multiple sessions using thought signatures and self-correct based on observed progress.

**THOUGHT SIGNATURE (for continuity)**: ${monitoringPlan.thoughtSignature}

**INITIAL STATE (Day 0)**:
- Crop: ${initialDiagnosis.cropType}
- Primary Disease: ${initialDiagnosis.diseases[0]?.name} (${initialDiagnosis.diseases[0]?.confidence}% confidence)
- Initial Severity: ${initialDiagnosis.severity}
- Initial Symptoms: ${initialDiagnosis.symptoms.join(', ')}
- Symptom Locations: ${initialDiagnosis.symptomLocations?.map((s: any) => `${s.label} (${s.severity})`).join(', ') || 'Not specified'}
- Estimated Yield Impact: ${initialDiagnosis.estimatedYieldImpact || 'Unknown'}
- Sustainability Score: ${initialDiagnosis.sustainabilityScore}/100

**TREATMENT PLAN APPLIED**:
${treatmentPlan.timeline.map((step: any) => `Day ${step.day}: ${step.action} (Cost: ${step.cost || 'N/A'})`).join('\n')}

**MONITORING HISTORY**:
${previousCheckpoints.length > 0 ? previousCheckpoints.map((cp: any) => `
Day ${cp.day}:
- Progress: ${cp.analysis.overallProgress}
- Severity Change: ${cp.analysis.severityChange > 0 ? '+' : ''}${cp.analysis.severityChange}
- Changes: ${cp.analysis.symptomChanges.join(', ')}
- Agent Reasoning: ${cp.agentReasoning}
- Adjustments Made: ${cp.planAdjustments.join(', ')}
`).join('\n') : 'No previous checkpoints'}

**CURRENT CHECKPOINT: Day ${dayNumber}**
- User Notes: ${userNotes || 'None provided'}
- Weather Conditions: ${weatherConditions || 'Unknown'}
- Expected Changes: ${monitoringPlan.strategy?.checkpointSchedule?.find((s: any) => s.day === dayNumber)?.expectedChanges?.join(', ') || 'General progress assessment'}

**YOUR TASK - DEEP MULTI-STEP REASONING**:

**STEP 1: ANALYZE CURRENT IMAGE**
- Compare to Day 0 baseline symptoms
- Identify changes: improvements, stability, worsening, new issues
- Measure symptom spread, severity, new lesions
- Assess overall plant health

**STEP 2: EVALUATE TREATMENT EFFECTIVENESS**
- Did applied treatments work as expected?
- Are we on track with success criteria?
- What's working? What's not?

**STEP 3: CONTEXTUAL REASONING**
- Factor in weather conditions (rain delays treatment, heat accelerates disease)
- Consider treatment timeline (some effects take 5-7 days)
- Account for disease lifecycle

**STEP 4: SELF-CORRECTION & ADAPTATION**
- If progress is slower than expected, why? (weather, treatment timing, resistance)
- If new symptoms appeared, what does this indicate? (secondary infection, stress, different disease)
- Should we adjust treatment intensity, frequency, or method?

**STEP 5: AUTONOMOUS DECISION**
- Continue current plan OR adjust treatment OR escalate OR declare success
- Provide specific next steps
- Set expectations for next checkpoint

**REQUIRED JSON OUTPUT**:
{
  "analysis": {
    "overallProgress": "improving|stable|worsening|new_issues",
    "symptomChanges": ["string array - specific changes observed"],
    "newSymptoms": ["string array - any new symptoms"],
    "resolvedSymptoms": ["string array - symptoms that disappeared"],
    "severityChange": number (-2 to +2, negative = improvement),
    "yieldImpactChange": "string - how yield outlook changed",
    "confidence": number (0-100)
  },
  "agentReasoning": "string - your detailed multi-step reasoning (200-300 words)",
  "planAdjustments": ["string array - specific changes to treatment plan"],
  "nextSteps": ["string array - what farmer should do before next checkpoint"],
  "decision": {
    "action": "continue_plan|adjust_treatment|escalate|add_intervention|declare_success",
    "reasoning": "string - why this decision",
    "confidence": number (0-100),
    "suggestedActions": ["string array - immediate actions"],
    "urgency": "low|medium|high|critical"
  },
  "weatherImpact": "string - how weather affected progress",
  "nextCheckpointDay": number,
  "thoughtSignature": "string - updated context hash for next session"
}

**CRITICAL**: Use your deep reasoning to self-correct. If previous predictions were wrong, acknowledge it and explain why. Be autonomous - make decisions without waiting for user input.

Now analyze the follow-up image and provide your autonomous assessment:`

    // Prepare image for analysis
    const imagePart = {
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: 'image/jpeg'
      }
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    let analysisData

    try {
      const text = response.text()
      analysisData = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // Fallback analysis
      analysisData = {
        analysis: {
          overallProgress: 'stable',
          symptomChanges: ['Unable to parse detailed analysis'],
          newSymptoms: [],
          resolvedSymptoms: [],
          severityChange: 0,
          yieldImpactChange: 'Requires manual review',
          confidence: 50
        },
        agentReasoning: 'Analysis completed but detailed reasoning unavailable. Manual review recommended.',
        planAdjustments: ['Continue current treatment plan'],
        nextSteps: ['Monitor closely', 'Upload next checkpoint image as scheduled'],
        decision: {
          action: 'continue_plan',
          reasoning: 'Insufficient data for major changes',
          confidence: 50,
          suggestedActions: ['Continue current treatment'],
          urgency: 'medium'
        },
        weatherImpact: weatherConditions || 'Unknown',
        nextCheckpointDay: dayNumber + 3,
        thoughtSignature: monitoringPlan.thoughtSignature
      }
    }

    // Create checkpoint record
    const checkpoint = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      day: dayNumber,
      timestamp: Date.now(),
      imageUrl: imageBase64, // In production, upload to storage
      analysis: analysisData.analysis,
      agentReasoning: analysisData.agentReasoning,
      planAdjustments: analysisData.planAdjustments,
      nextSteps: analysisData.nextSteps,
      weatherContext: analysisData.weatherImpact,
      thoughtSignature: analysisData.thoughtSignature,
      decision: analysisData.decision
    }

    // Update monitoring plan status based on decision
    let newStatus = monitoringPlan.currentStatus
    if (analysisData.decision.action === 'declare_success') {
      newStatus = 'completed'
    } else if (analysisData.decision.urgency === 'critical') {
      newStatus = 'critical'
    }

    // Add adaptive insight
    const newInsight = `Day ${dayNumber}: ${analysisData.analysis.overallProgress.toUpperCase()} - ${analysisData.decision.reasoning}`

    return NextResponse.json({ 
      success: true,
      checkpoint,
      updatedPlan: {
        ...monitoringPlan,
        checkpoints: [...previousCheckpoints, checkpoint],
        currentStatus: newStatus,
        nextCheckpointDay: analysisData.nextCheckpointDay,
        adaptiveInsights: [...monitoringPlan.adaptiveInsights, newInsight],
        thoughtSignature: analysisData.thoughtSignature
      },
      agentDecision: analysisData.decision,
      message: `Day ${dayNumber} analysis complete. Status: ${analysisData.analysis.overallProgress}`
    })

  } catch (error) {
    console.error('Follow-up analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze follow-up',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
