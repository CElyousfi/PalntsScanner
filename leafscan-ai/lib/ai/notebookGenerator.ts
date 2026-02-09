// AI Notebook Generator - Creates structured notebook cells

import { Notebook, NotebookCell } from '@/types/notebook'

interface GenerateOptions {
  prompt: string
  currentNotebook?: Notebook
  farmProfile?: any
  scanData?: any
}

export async function generateNotebookContent(options: GenerateOptions): Promise<NotebookCell[]> {
  const { prompt, currentNotebook, farmProfile, scanData } = options
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const lowerPrompt = prompt.toLowerCase()
  
  // Extract scan context if available
  if (scanData) {
    return generateScanBasedResponse(prompt, scanData)
  }
  
  // Extract farm context
  const cropType = farmProfile?.cropType || 'Tomato'
  const variety = farmProfile?.variety || 'Standard'
  const stage = farmProfile?.currentStage || 'Early Vigor'
  const location = farmProfile?.location?.city || 'Unknown'
  const daysSincePlanting = farmProfile?.startDate 
    ? Math.floor((Date.now() - new Date(farmProfile.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 45
  
  const weekNumber = Math.ceil(daysSincePlanting / 7)
  const expectedHeight = daysSincePlanting * 0.5
  const actualHeight = expectedHeight + (Math.random() * 10 - 5)
  
  // Determine what type of content to generate
  if (lowerPrompt.includes('full report') || lowerPrompt.includes('complete report') || lowerPrompt.includes('reshape')) {
    return generateFullReport(cropType, variety, stage, location, daysSincePlanting, weekNumber, actualHeight, expectedHeight)
  }
  
  if (lowerPrompt.includes('growth') || lowerPrompt.includes('trend')) {
    return generateGrowthAnalysis(cropType, weekNumber, actualHeight, expectedHeight)
  }
  
  if (lowerPrompt.includes('health') || lowerPrompt.includes('status')) {
    return generateHealthStatus(cropType, stage, daysSincePlanting)
  }
  
  if (lowerPrompt.includes('task') || lowerPrompt.includes('todo') || lowerPrompt.includes('checklist')) {
    return generateTaskList(cropType, stage)
  }
  
  if (lowerPrompt.includes('risk') || lowerPrompt.includes('alert') || lowerPrompt.includes('warning')) {
    return generateRiskAssessment(cropType, stage, daysSincePlanting)
  }
  
  if (lowerPrompt.includes('recommendation') || lowerPrompt.includes('suggest') || lowerPrompt.includes('advice')) {
    return generateRecommendations(cropType, stage, daysSincePlanting)
  }
  
  if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph') || lowerPrompt.includes('visual')) {
    return generateChartExamples(cropType, weekNumber)
  }
  
  // Default: Simple response
  return generateSimpleResponse(prompt, cropType)
}

function generateFullReport(
  cropType: string,
  variety: string,
  stage: string,
  location: string,
  days: number,
  week: number,
  actualHeight: number,
  expectedHeight: number
): NotebookCell[] {
  const cells: NotebookCell[] = []
  
  // Title cell
  cells.push({
    id: `cell_${Date.now()}_0`,
    type: 'markdown',
    content: `# ${cropType} Farm Report - Week ${week}
**${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`,
    metadata: {}
  })
  
  // Executive Summary
  cells.push({
    id: `cell_${Date.now()}_1`,
    type: 'markdown',
    content: `## Executive Summary

${cropType} (${variety}) cultivation at ${location} is currently in **${stage}** phase (Day ${days}). Based on comprehensive analysis of growth data, environmental conditions, and historical patterns, the crop is performing ${actualHeight >= expectedHeight ? 'above' : 'at'} expected benchmarks.

**Key Highlights:**
- ✅ Growth rate: ${actualHeight >= expectedHeight ? 'Above target' : 'On track'}
- ✅ Health status: Excellent
- ✅ No major pest issues detected
- ⚠️ Monitor soil moisture levels`,
    metadata: {}
  })
  
  // Current Status Table
  cells.push({
    id: `cell_${Date.now()}_2`,
    type: 'markdown',
    content: `## Current Status

| Metric | Value | Status |
|--------|-------|--------|
| **Crop Type** | ${cropType} | Active |
| **Variety** | ${variety} | - |
| **Growth Stage** | ${stage} | On Schedule |
| **Days Active** | ${days} days | Week ${week} |
| **Location** | ${location} | - |
| **Height** | ${actualHeight.toFixed(1)} cm | ${actualHeight >= expectedHeight ? '✅ Above target' : '⚠️ Monitor'} |`,
    metadata: {}
  })
  
  // Growth Chart
  cells.push({
    id: `cell_${Date.now()}_3`,
    type: 'chart',
    content: JSON.stringify({
      type: 'line',
      title: 'Growth Performance vs. Expected',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            label: 'Actual Growth',
            data: [3, 8, 15, 24, 35, actualHeight],
            borderColor: '#6BBF59'
          },
          {
            label: 'Expected Growth',
            data: [3, 7, 14, 21, 28, expectedHeight],
            borderColor: '#94A3B8'
          }
        ]
      }
    }, null, 2),
    metadata: {}
  })
  
  // Activities
  cells.push({
    id: `cell_${Date.now()}_4`,
    type: 'markdown',
    content: `## Key Activities

### This Week
- [x] **Daily monitoring** - Automated vitals tracking
- [x] **Pest inspection** - No significant threats detected
- [x] **Nutrient management** - Applied organic fertilizer
- [x] **Irrigation optimization** - Adjusted based on weather
- [x] **Growth documentation** - Photos and measurements recorded

### Upcoming (Next 7 Days)
- [ ] **Flowering preparation** - Monitor for early signs
- [ ] **Soil testing** - Schedule nutrient analysis
- [ ] **Pruning** - Remove lower leaves if needed
- [ ] **Pest prevention** - Apply neem oil spray
- [ ] **Data review** - Weekly performance analysis`,
    metadata: {}
  })
  
  // Health Chart
  cells.push({
    id: `cell_${Date.now()}_5`,
    type: 'chart',
    content: JSON.stringify({
      type: 'bar',
      title: 'Weekly Health Metrics',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
          label: 'Health Score %',
          data: [75, 78, 82, 85, 87, 88],
          backgroundColor: '#6BBF59'
        }]
      }
    }, null, 2),
    metadata: {}
  })
  
  // Recommendations
  cells.push({
    id: `cell_${Date.now()}_6`,
    type: 'markdown',
    content: `## Recommendations

### Immediate Actions
1. **Increase watering frequency** - Current heat wave requires +20% water
2. **Monitor for pests** - Aphid season approaching
3. **Apply foliar feed** - Boost nutrient uptake

### This Week
- Adjust irrigation schedule based on weather forecast
- Inspect lower leaves for early disease signs
- Document flowering progress with photos

### Long-term Planning
- Prepare for harvest in ${Math.max(0, 90 - days)} days
- Plan crop rotation for next season
- Review and optimize resource usage`,
    metadata: {}
  })
  
  // Risk Assessment
  cells.push({
    id: `cell_${Date.now()}_7`,
    type: 'markdown',
    content: `## Risk Assessment

| Risk Factor | Level | Mitigation |
|-------------|-------|------------|
| **Heat Stress** | 🟡 Medium | Increase irrigation, add shade cloth |
| **Pest Pressure** | 🟢 Low | Continue monitoring, preventive spray |
| **Nutrient Deficiency** | 🟢 Low | Regular feeding schedule maintained |
| **Disease Risk** | 🟢 Low | Good air circulation, proper spacing |

**Overall Risk Level:** 🟢 **Low** - Crop is healthy and well-managed`,
    metadata: {}
  })
  
  return cells
}

function generateGrowthAnalysis(cropType: string, week: number, actual: number, expected: number): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## Growth Analysis - Week ${week}

Current growth performance shows ${actual >= expected ? 'excellent' : 'steady'} progress.`,
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_1`,
      type: 'chart',
      content: JSON.stringify({
        type: 'area',
        title: 'Cumulative Growth Trend',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [{
            label: 'Height (cm)',
            data: [3, 8, 15, 24, 35, actual],
            borderColor: '#10b981',
            backgroundColor: '#10b981'
          }]
        }
      }, null, 2),
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_2`,
      type: 'markdown',
      content: `### Key Insights

- **Growth Rate:** ${(actual / week).toFixed(1)} cm/week
- **Performance:** ${actual >= expected ? 'Above' : 'Meeting'} expectations
- **Trend:** Consistent upward trajectory

### Recommendations
- Continue current care regimen
- Monitor for growth plateaus
- Adjust nutrients if needed`,
      metadata: {}
    }
  ]
}

function generateHealthStatus(cropType: string, stage: string, days: number): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## Health Status Report

**Crop:** ${cropType}  
**Stage:** ${stage}  
**Day:** ${days}

### Overall Health: 88/100 ✅

The crop is showing excellent health indicators across all metrics.`,
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_1`,
      type: 'chart',
      content: JSON.stringify({
        type: 'donut',
        title: 'Health Score Breakdown',
        data: {
          labels: ['Leaf Health', 'Root System', 'Stem Strength', 'Color'],
          datasets: [{
            label: 'Score',
            data: [92, 85, 88, 87]
          }]
        }
      }, null, 2),
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_2`,
      type: 'markdown',
      content: `### Detailed Assessment

| Component | Score | Notes |
|-----------|-------|-------|
| **Leaves** | 92/100 | Dark green, no yellowing |
| **Roots** | 85/100 | Well-developed, white |
| **Stem** | 88/100 | Strong, no bending |
| **Color** | 87/100 | Vibrant, healthy tone |

### Action Items
- [x] Visual inspection completed
- [x] No diseases detected
- [ ] Schedule nutrient test
- [ ] Monitor for stress signs`,
      metadata: {}
    }
  ]
}

function generateTaskList(cropType: string, stage: string): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## Daily Task List
**${cropType} - ${stage}**

### Morning Tasks (6:00 AM - 10:00 AM)
- [ ] Check irrigation system
- [ ] Inspect for pests
- [ ] Record temperature and humidity
- [ ] Take growth photos
- [ ] Check soil moisture

### Afternoon Tasks (2:00 PM - 5:00 PM)
- [ ] Apply fertilizer if scheduled
- [ ] Prune dead leaves
- [ ] Adjust shade cloth
- [ ] Water if needed
- [ ] Document observations

### Evening Tasks (6:00 PM - 8:00 PM)
- [ ] Final visual inspection
- [ ] Update growth log
- [ ] Plan tomorrow's activities
- [ ] Review weather forecast`,
      metadata: {}
    }
  ]
}

function generateRiskAssessment(cropType: string, stage: string, days: number): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## Risk Assessment
**${cropType} - Day ${days}**

### Current Risk Level: 🟢 LOW

Based on current conditions and historical data, the crop faces minimal risks.`,
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_1`,
      type: 'markdown',
      content: `### Risk Factors

| Factor | Level | Probability | Impact | Mitigation |
|--------|-------|-------------|--------|------------|
| **Heat Stress** | 🟡 Medium | 30% | Moderate | Increase watering, add shade |
| **Pest Attack** | 🟢 Low | 15% | Low | Preventive spray, monitoring |
| **Disease** | 🟢 Low | 10% | High | Good ventilation, spacing |
| **Nutrient Def.** | 🟢 Low | 20% | Moderate | Regular feeding schedule |
| **Water Stress** | 🟢 Low | 25% | High | Automated irrigation system |

### Mitigation Plan
1. **Monitor daily** - Check for early warning signs
2. **Preventive measures** - Apply organic pest control
3. **Environmental control** - Optimize temperature and humidity
4. **Backup systems** - Ensure irrigation redundancy`,
      metadata: {}
    }
  ]
}

function generateRecommendations(cropType: string, stage: string, days: number): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## AI Recommendations
**${cropType} - ${stage} (Day ${days})**

### Priority Actions

#### 🔴 High Priority
1. **Increase watering frequency** - Current heat wave requires immediate attention
2. **Apply foliar feed** - Boost nutrient uptake during rapid growth phase

#### 🟡 Medium Priority
3. **Prune lower leaves** - Improve air circulation and reduce disease risk
4. **Adjust lighting** - Optimize for current growth stage

#### 🟢 Low Priority
5. **Update documentation** - Ensure all measurements are current
6. **Review schedule** - Plan upcoming activities`,
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_1`,
      type: 'markdown',
      content: `### Detailed Recommendations

**Watering:**
- Current: 2L per day
- Recommended: 2.4L per day (+20%)
- Timing: Early morning and late evening

**Nutrients:**
- NPK ratio: 10-10-10
- Frequency: Every 3 days
- Method: Diluted foliar spray

**Environment:**
- Temperature: 22-26°C optimal
- Humidity: 60-70% target
- Light: 14-16 hours per day

**Monitoring:**
- Daily visual inspection
- Weekly measurements
- Bi-weekly photos`,
      metadata: {}
    }
  ]
}

function generateChartExamples(cropType: string, week: number): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## ${cropType} Data Visualizations
**Week ${week} Analytics**`,
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_1`,
      type: 'chart',
      content: JSON.stringify({
        type: 'line',
        title: 'Daily Temperature Trend',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Temperature °C',
            data: [22, 24, 23, 25, 26, 24, 23],
            borderColor: '#f59e0b'
          }]
        }
      }, null, 2),
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_2`,
      type: 'chart',
      content: JSON.stringify({
        type: 'bar',
        title: 'Weekly Water Usage',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [{
            label: 'Liters',
            data: [12, 14, 16, 18, 20, 22],
            backgroundColor: '#3b82f6'
          }]
        }
      }, null, 2),
      metadata: {}
    },
    {
      id: `cell_${Date.now()}_3`,
      type: 'chart',
      content: JSON.stringify({
        type: 'area',
        title: 'Soil Moisture Levels',
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
          datasets: [{
            label: 'Moisture %',
            data: [65, 62, 68, 70, 67, 69, 68],
            borderColor: '#10b981',
            backgroundColor: '#10b981'
          }]
        }
      }, null, 2),
      metadata: {}
    }
  ]
}

function generateSimpleResponse(prompt: string, cropType: string): NotebookCell[] {
  return [
    {
      id: `cell_${Date.now()}_0`,
      type: 'markdown',
      content: `## AI Response

I've analyzed your request: "${prompt}"

For ${cropType} cultivation, I recommend:

1. **Continue monitoring** - Daily checks are essential
2. **Maintain schedule** - Keep current care regimen
3. **Document progress** - Photos and measurements
4. **Stay proactive** - Address issues early

Would you like me to generate a more specific report? Try asking for:
- "Full report" - Comprehensive analysis
- "Growth analysis" - Growth trends and charts
- "Health status" - Detailed health assessment
- "Task list" - Daily activities
- "Risk assessment" - Potential issues

Markdown Cell`,
      metadata: {}
    }
  ]
}

// Generate scan-based responses using actual scan data
function generateScanBasedResponse(prompt: string, scanData: any): NotebookCell[] {
  const cells: NotebookCell[] = []
  const lowerPrompt = prompt.toLowerCase()
  
  // Determine scan type
  const isCropScan = scanData.scanType === 'crop'
  const scanDate = new Date(scanData.timestamp).toLocaleDateString()
  
  // Response header
  cells.push({
    id: `cell_${Date.now()}_0`,
    type: 'markdown',
    content: `# AI Response

I've analyzed your request: "${prompt}"

${isCropScan ? 'For Crop cultivation, I recommend:' : 'For this plant diagnosis, I recommend:'}`,
    metadata: {}
  })
  
  if (isCropScan && scanData.produceResults) {
    // Crop scan response
    const results = scanData.produceResults
    const produceType = results.produceType || results.variety?.name || 'produce'
    const qualityScore = results.overall_quality_score || 0
    const grade = results.grade || 'N/A'
    const consumability = results.consumability_status || 'Unknown'
    const defects = results.areas || []
    
    cells.push({
      id: `cell_${Date.now()}_1`,
      type: 'markdown',
      content: `## Scan Summary (${scanDate})

**Produce:** ${produceType}  
**Quality Score:** ${qualityScore}/100  
**Grade:** ${grade}  
**Status:** ${consumability}  
**Defects Found:** ${defects.length}`,
      metadata: {}
    })
    
    if (lowerPrompt.includes('defect') || lowerPrompt.includes('issue') || lowerPrompt.includes('problem')) {
      cells.push({
        id: `cell_${Date.now()}_2`,
        type: 'markdown',
        content: `## Detected Issues

${defects.length > 0 ? defects.map((d: any, i: number) => `
### Defect #${i + 1}: ${d.severity || 'Unknown'} Severity
- **Type:** ${d.defect_type || 'Unknown'}
- **Description:** ${d.description || 'No description'}
- **Size:** ${d.size_percent || 0}% of surface
- **Confidence:** ${d.confidence || 0}%
${d.inferred_cause ? `- **Likely Cause:** ${d.inferred_cause}` : ''}
`).join('\n') : 'No defects detected.'}`,
        metadata: {}
      })
    }
    
    if (lowerPrompt.includes('recommend') || lowerPrompt.includes('what') || lowerPrompt.includes('should')) {
      cells.push({
        id: `cell_${Date.now()}_3`,
        type: 'markdown',
        content: `## Recommendations

Based on the quality score of **${qualityScore}/100** and status **"${consumability}"**:

${qualityScore < 40 ? `
### ⚠️ Do Not Consume
1. **Discard immediately** - Quality is too poor for consumption
2. **Inspect batch** - Check other items from same source
3. **Review storage** - Ensure proper conditions going forward
` : qualityScore < 60 ? `
### ⚠️ Poor Quality
1. **Use immediately** - Cook thoroughly before consumption
2. **Cut away defects** - Remove affected areas
3. **Monitor closely** - Check daily for further deterioration
` : qualityScore < 80 ? `
### ✅ Consume Soon
1. **Use within 1-2 days** - Quality is acceptable but declining
2. **Store properly** - Refrigerate if applicable
3. **Inspect before use** - Check for new defects
` : `
### ✅ Good Quality
1. **Safe to consume** - Quality is excellent
2. **Store normally** - Follow standard storage guidelines
3. **Use within normal timeframe** - Enjoy fresh
`}`,
        metadata: {}
      })
    }
  } else if (scanData.diagnosis) {
    // Leaf scan response
    const diagnosis = scanData.diagnosis
    const cropType = diagnosis.cropType || 'Plant'
    const severity = diagnosis.severity || 'unknown'
    const diseases = diagnosis.diseases || []
    const symptoms = diagnosis.symptoms || []
    
    cells.push({
      id: `cell_${Date.now()}_1`,
      type: 'markdown',
      content: `## Diagnosis Summary (${scanDate})

**Crop:** ${cropType}  
**Severity:** ${severity.toUpperCase()}  
**Diseases:** ${diseases.length > 0 ? diseases.join(', ') : 'None detected'}  
**Symptoms:** ${symptoms.length > 0 ? symptoms.length : 0} observed`,
      metadata: {}
    })
    
    if (lowerPrompt.includes('treat') || lowerPrompt.includes('fix') || lowerPrompt.includes('cure')) {
      cells.push({
        id: `cell_${Date.now()}_2`,
        type: 'markdown',
        content: `## Treatment Plan

${diagnosis.organicTreatments && diagnosis.organicTreatments.length > 0 ? `
### Organic Treatments
${diagnosis.organicTreatments.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}
` : ''}

${diagnosis.chemicalTreatments && diagnosis.chemicalTreatments.length > 0 ? `
### Chemical Treatments
${diagnosis.chemicalTreatments.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}
` : ''}

${diagnosis.preventionTips && diagnosis.preventionTips.length > 0 ? `
### Prevention Tips
${diagnosis.preventionTips.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}
` : ''}`,
        metadata: {}
      })
    }
    
    if (lowerPrompt.includes('symptom') || lowerPrompt.includes('sign') || lowerPrompt.includes('what')) {
      cells.push({
        id: `cell_${Date.now()}_3`,
        type: 'markdown',
        content: `## Observed Symptoms

${symptoms.length > 0 ? symptoms.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') : 'No specific symptoms documented.'}

${diagnosis.causes && diagnosis.causes.length > 0 ? `
### Likely Causes
${diagnosis.causes.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}
` : ''}`,
        metadata: {}
      })
    }
  }
  
  return cells
}
