# 🏃‍♂️ Marathon Agent - Quick Start Guide

## **What Is It?**
Autonomous crop monitoring system that tracks plant health over days/weeks, self-corrects, and makes proactive decisions.

---

## **API Endpoints**

### **1. Start Monitoring**
```bash
POST /api/monitoring/start

Body:
{
  "diagnosis": { /* DiagnosisResult from /api/analyze */ },
  "treatmentPlan": { /* TreatmentPlan from /api/generate-plan */ },
  "duration": 14
}

Response:
{
  "success": true,
  "monitoringPlan": {
    "id": "mon_...",
    "thoughtSignature": "Tomato_EarlyBlight_high_...",
    "nextCheckpointDay": 3,
    "strategy": { /* checkpoint schedule, success criteria */ }
  }
}
```

### **2. Submit Follow-Up**
```bash
POST /api/monitoring/followup

Body:
{
  "monitoringPlan": { /* Full plan from localStorage */ },
  "dayNumber": 3,
  "imageBase64": "data:image/jpeg;base64,...",
  "userNotes": "Applied copper fungicide",
  "weatherConditions": "Rainy past 2 days"
}

Response:
{
  "success": true,
  "checkpoint": {
    "analysis": {
      "overallProgress": "improving",
      "severityChange": -1,
      "symptomChanges": [...]
    },
    "agentReasoning": "Multi-step analysis shows...",
    "planAdjustments": [...],
    "decision": {
      "action": "continue_plan",
      "urgency": "low"
    }
  },
  "updatedPlan": { /* Save this to localStorage */ }
}
```

### **3. Get Agent Decision (Optional)**
```bash
POST /api/monitoring/agent-decision

Body:
{
  "monitoringPlan": { /* Full plan */ },
  "checkpoint": { /* Latest checkpoint */ },
  "enableToolCalling": true
}

Response:
{
  "agentDecision": {
    "autonomousDecision": { /* Main decision */ },
    "weatherAdaptation": { /* Weather-based adjustments */ },
    "researchInsights": { /* Disease research */ },
    "yieldOptimization": { /* Economic analysis */ },
    "nextActions": [ /* Prioritized action list */ ]
  },
  "toolsUsed": ["weather_forecast", "disease_research", "yield_analysis"]
}
```

---

## **Client-Side Storage**

```typescript
// Save monitoring plan
localStorage.setItem(
  `monitoring_plan_${plan.id}`, 
  JSON.stringify(plan)
)

// Load monitoring plan
const plan = JSON.parse(
  localStorage.getItem(`monitoring_plan_${planId}`)
)

// Update with checkpoint
plan.checkpoints.push(checkpoint)
plan.thoughtSignature = checkpoint.thoughtSignature
localStorage.setItem(`monitoring_plan_${plan.id}`, JSON.stringify(plan))
```

---

## **Key Features**

### **Thought Signatures**
```
"Tomato_EarlyBlight_high_1737201234567"
```
Maintains context across sessions for continuity.

### **Self-Correction**
```
"Initial prediction: 40% reduction. Actual: 30%. 
Reason: Rain delayed treatment. Adjusting Day 7 expectation."
```

### **Multi-Tool Reasoning**
- Weather forecast (7 days)
- Disease research (patterns, timelines)
- Yield analysis (economic impact)

### **Autonomous Decisions**
- `continue_plan` - Stay the course
- `adjust_treatment` - Modify approach
- `escalate` - Consult expert
- `add_intervention` - New treatment
- `declare_success` - Recovery complete

---

## **Demo Flow**

```
Day 0: Upload image → Diagnose → Generate plan → START MONITORING
         ↓
Day 3: Upload follow-up → Agent analyzes → Self-corrects → Adjusts plan
         ↓
Day 7: Upload follow-up → Agent compares to Day 0 & 3 → Final decision
```

---

## **Hackathon Talking Points**

1. **"Autonomous monitoring over weeks, not just one diagnosis"**
2. **"Self-corrects when predictions are wrong"**
3. **"Multi-tool reasoning: weather + research + yield"**
4. **"Proactive decisions without user prompting"**
5. **"Thought signatures maintain context across sessions"**
6. **"Economic optimization: $5 treatment prevents $50 loss"**

---

## **Why This Wins**

✅ **Unique**: No competitor has autonomous multi-week monitoring  
✅ **Gemini 3**: Uses deep reasoning, thought signatures, tool calling  
✅ **Real Problem**: Farmers need ongoing guidance, not one-shot  
✅ **Autonomous**: Agent decides, doesn't just suggest  
✅ **Economic**: Quantified ROI, cost-benefit analysis  

---

## **Quick Test**

```bash
# 1. Start monitoring
curl -X POST http://localhost:3000/api/monitoring/start \
  -H "Content-Type: application/json" \
  -d '{"diagnosis":{...},"treatmentPlan":{...},"duration":14}'

# 2. Submit follow-up (Day 3)
curl -X POST http://localhost:3000/api/monitoring/followup \
  -H "Content-Type: application/json" \
  -d '{"monitoringPlan":{...},"dayNumber":3,"imageBase64":"..."}'

# 3. Get agent decision
curl -X POST http://localhost:3000/api/monitoring/agent-decision \
  -H "Content-Type: application/json" \
  -d '{"monitoringPlan":{...},"checkpoint":{...},"enableToolCalling":true}'
```

---

## **Documentation**

- **Full Guide**: `MARATHON_AGENT.md`
- **Implementation Summary**: `MARATHON_AGENT_COMPLETE.md`
- **This Quick Start**: `MARATHON_AGENT_QUICK_START.md`

---

**Ready to revolutionize agricultural AI! 🏃‍♂️🌱🏆**
