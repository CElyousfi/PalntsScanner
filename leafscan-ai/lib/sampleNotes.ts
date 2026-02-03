import { FarmNote } from '@/types/notes'

export const sampleNotes: FarmNote[] = [
  {
    id: 'sample_1',
    title: 'Weekly Farm Report - January 2024',
    content: `# Weekly Farm Report
**Week of January 22-28, 2024**

## Summary
This week showed excellent progress across all tomato crops. Weather conditions were optimal with moderate temperatures and adequate rainfall.

## Crop Status
- **Health**: 88%
- **Growth Stage**: Vegetative
- **Days Since Planting**: 45

## Key Activities
- [x] Completed weekly pest inspection
- [x] Applied organic fertilizer
- [x] Adjusted irrigation schedule
- [ ] Plan nutrient testing for next week

## Observations
The plants are responding well to the new irrigation schedule. Leaf color is vibrant green, indicating good nitrogen levels.

### Growth Chart

\`\`\`chart
{
  "type": "line",
  "title": "Weekly Health Trend",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "datasets": [{
      "label": "Health %",
      "data": [82, 84, 85, 86, 87, 88, 88]
    }]
  }
}
\`\`\`

## Next Week's Plan
1. Monitor for early flowering signs
2. Increase potassium levels
3. Continue pest monitoring
4. Document growth progress

---
*Report generated with LeafScan AI*`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    tags: ['weekly', 'report', 'tomatoes'],
    folder: 'reports',
    isPinned: true,
    metadata: {
      wordCount: 145,
      lastEditedBy: 'user'
    }
  },
  {
    id: 'sample_2',
    title: 'Pest Management Strategy',
    content: `# Integrated Pest Management Plan

## Current Situation
Minor aphid activity detected on lower leaves. Early intervention recommended.

## Treatment Approach
**Organic-First Strategy**

### Phase 1: Natural Predators
- Introduce ladybugs (500 count)
- Monitor for 7 days
- Expected reduction: 60-70%

### Phase 2: Organic Spray (if needed)
- Neem oil solution (2%)
- Apply every 5 days
- Maximum 3 applications

## Monitoring Schedule
| Day | Activity | Status |
|-----|----------|--------|
| 1 | Release ladybugs | ✓ |
| 3 | First inspection | Pending |
| 7 | Evaluate effectiveness | Pending |

## Cost Analysis

\`\`\`chart
{
  "type": "bar",
  "title": "Treatment Costs",
  "data": {
    "labels": ["Ladybugs", "Neem Oil", "Labor"],
    "datasets": [{
      "label": "Cost ($)",
      "data": [45, 25, 30]
    }]
  }
}
\`\`\`

> **Note**: Organic methods may take longer but are safer for beneficial insects and soil health.

## Expected Outcomes
- Pest reduction: 80%+
- Timeline: 10-14 days
- No chemical residue`,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 3,
    tags: ['pest', 'organic', 'management'],
    folder: 'research',
    isPinned: false,
    metadata: {
      wordCount: 132,
      lastEditedBy: 'user'
    }
  },
  {
    id: 'sample_3',
    title: 'Daily Log - January 28',
    content: `# Daily Farm Log
*January 28, 2024*

## Morning Tasks (6:00 AM - 10:00 AM)
- ✓ Checked irrigation system
- ✓ Inspected for pest activity
- ✓ Recorded temperature: 22°C
- ✓ Humidity: 65%

## Observations
Plants looking healthy. New growth visible on main stems. No signs of disease or stress.

## Afternoon Tasks (2:00 PM - 5:00 PM)
- ✓ Applied compost tea
- ✓ Pruned lower leaves
- ✓ Took growth photos

## Weather
☀️ Sunny, light breeze
- High: 24°C
- Low: 18°C
- Rainfall: 0mm

## Notes for Tomorrow
- Check soil moisture levels
- Prepare for nutrient testing
- Order more organic fertilizer

---
*Total time: 5.5 hours*`,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    tags: ['daily', 'log'],
    folder: 'general',
    isPinned: false,
    metadata: {
      wordCount: 98,
      lastEditedBy: 'user'
    }
  }
]

export function initializeSampleNotes() {
  const existing = localStorage.getItem('leafscan_farm_notes')
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem('leafscan_farm_notes', JSON.stringify(sampleNotes))
  }
}
