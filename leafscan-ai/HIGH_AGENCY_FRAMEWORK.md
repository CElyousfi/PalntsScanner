# 🚀 High-Agency Execution Framework
## From Passive Recommendations to Active Problem-Solving

---

## 🎯 What is High Agency?

**Low Agency:** "You should buy neem oil."
**High Agency:** "I've reserved neem oil at Bio-Agri Maroc (4km, €15). Pick up by 6 PM or I'll cancel."

**The difference:** Taking action vs. giving advice.

---

## 🦜 The Lorikeet Insight

> "If you can't take actions and solve people's problems, it's like a very low ceiling on how much value you can create." — Lorikeet founders

**Lorikeet's AI agents:**
- Make decisions
- Take actions
- Solve problems end-to-end
- Operate within guardrails

**We apply this to agriculture.**

---

## 📊 The Agency Hierarchy

### **Level 1: Information Provider** ❌
**What it does:**
- Provides diagnosis
- Lists treatment options
- Shows supplier information

**User experience:**
- "You have Early Blight"
- "Treatment options: neem oil, copper spray"
- "Suppliers: Bio-Agri Maroc, Eco-Ferme..."

**Problem:** User still has to do all the work

---

### **Level 2: Recommendation Engine** ❌
**What it does:**
- Recommends specific treatment
- Suggests best supplier
- Provides application instructions

**User experience:**
- "I recommend neem oil (most effective)"
- "Buy from Bio-Agri Maroc (closest, best price)"
- "Apply tonight at 7 PM"

**Problem:** User still has to execute everything

---

### **Level 3: Resource Connector** ⚠️
**What it does:**
- Provides supplier contact info
- Generates directions
- Creates shopping list

**User experience:**
- "Here's Bio-Agri Maroc's phone: +212 522-345-678"
- "Here's the map link: [Google Maps]"
- "Here's what to buy: Neem oil 5L, Copper spray 2L"

**Problem:** User still has to call, drive, buy, apply

---

### **Level 4: Action Executor** ✅ ← WE AIM HERE
**What it does:**
- Reserves products automatically
- Schedules reminders
- Tracks progress
- Adapts plans

**User experience:**
- "I've reserved neem oil for you. Pick up by 6 PM."
- "I'll remind you at 6:30 PM to apply treatment."
- "Upload photo on Day 3 and I'll verify it's working."

**Value:** User just has to pick up and apply

---

### **Level 5: Autonomous Agent** ✅ (Future)
**What it does:**
- Proactively detects issues
- Takes actions before user asks
- Optimizes continuously
- Learns from outcomes

**User experience:**
- "I noticed your crop health declining. I've scheduled a preventive treatment."
- "Weather forecast shows rain tomorrow. I've rescheduled your application."
- "Based on your last 3 crops, I've adjusted your planting calendar."

**Value:** User barely has to think about it

---

## 🎯 High-Agency Features

### **Feature 1: Auto-Reserve Treatment**

**How it works:**
1. User uploads photo → Diagnosis complete
2. AI analyzes severity: HIGH
3. AI searches suppliers → Finds 3 options
4. AI ranks by: distance, price, stock, rating
5. AI selects best option: Bio-Agri Maroc
6. AI asks user: "Shall I reserve neem oil (€45) at Bio-Agri Maroc?"
7. User clicks "Yes"
8. AI creates reservation → Sends confirmation to supplier
9. AI sends SMS to user: "Reserved! Pickup by 6 PM. Code: BA-3847"

**User saves:** 30 minutes (no calling, no searching)

**Implementation:**
```typescript
// Auto-reserve flow
async function autoReserveFlow(diagnosis: Diagnosis, user: User) {
  // 1. Assess urgency
  const urgency = assessUrgency(diagnosis);
  if (urgency !== 'high') return; // Only auto-trigger for urgent cases
  
  // 2. Search suppliers
  const suppliers = await searchSuppliers({
    location: user.location,
    products: diagnosis.organicTreatments,
    radius: 20 // km
  });
  
  // 3. Rank suppliers
  const ranked = rankSuppliers(suppliers, {
    weights: {
      distance: 0.4,
      price: 0.3,
      rating: 0.2,
      stock: 0.1
    }
  });
  
  // 4. Get best option
  const best = ranked[0];
  
  // 5. Ask user for confirmation
  const confirmation = await askUser({
    message: `Shall I reserve ${best.product.name} (€${best.product.price}) at ${best.name}?`,
    options: ['Yes, reserve it', 'Show me other options', 'I'll do it myself'],
    reasoning: `Recommended because: closest (${best.distance_km}km), in stock, highly rated (${best.rating}/5)`
  });
  
  // 6. Execute if confirmed
  if (confirmation === 'Yes, reserve it') {
    const reservation = await createReservation({
      user_id: user.id,
      supplier_id: best.id,
      products: [best.product],
      diagnosis_id: diagnosis.id
    });
    
    // 7. Notify both parties
    await sendSMS(user.phone, `Reserved! Pickup by ${reservation.expires_at}. Code: ${reservation.code}`);
    await sendSMS(best.phone, `New reservation: ${user.name}, Code: ${reservation.code}`);
    
    // 8. Schedule reminders
    await scheduleReminder({
      user_id: user.id,
      time: reservation.expires_at - 4 * 3600, // 4 hours before expiry
      message: `Reminder: Pick up treatment by ${reservation.expires_at}. Code: ${reservation.code}`
    });
  }
}
```

---

### **Feature 2: Weather-Optimized Scheduling**

**How it works:**
1. User picks up treatment
2. AI checks weather forecast (next 7 days)
3. AI calculates optimal application windows
4. AI schedules reminder for best time
5. AI monitors weather changes
6. AI reschedules if rain expected

**User saves:** Guesswork (no failed applications due to rain)

**Implementation:**
```typescript
// Weather-optimized scheduling
async function scheduleApplication(treatment: Treatment, user: User) {
  // 1. Get weather forecast
  const forecast = await getWeatherForecast({
    lat: user.location.lat,
    lng: user.location.lng,
    days: 7
  });
  
  // 2. Calculate optimal windows
  const windows = calculateOptimalWindows(forecast, {
    treatment_type: 'spray',
    constraints: {
      max_temp: 30, // °C
      max_wind: 20, // km/h
      no_rain: true,
      preferred_time: 'evening' // cooler, less evaporation
    }
  });
  
  // 3. Select best window
  const best = windows[0]; // highest score
  
  // 4. Schedule reminder
  await scheduleReminder({
    user_id: user.id,
    time: best.start - 30 * 60, // 30 min before
    message: `⏰ Apply treatment in 30 min. Weather optimal: ${best.temp}°C, ${best.wind_speed}km/h wind, no rain.`,
    metadata: {
      window: best,
      treatment_id: treatment.id
    }
  });
  
  // 5. Monitor weather changes (check every 6 hours)
  await scheduleWeatherCheck({
    treatment_id: treatment.id,
    check_interval: 6 * 3600,
    callback: async (updated_forecast) => {
      const new_windows = calculateOptimalWindows(updated_forecast);
      if (new_windows[0].start !== best.start) {
        // Weather changed, reschedule
        await sendAlert({
          user_id: user.id,
          message: `⚠️ Weather changed. New optimal time: ${new_windows[0].start}. I've rescheduled your reminder.`
        });
        await updateReminder(reminder.id, { time: new_windows[0].start - 30 * 60 });
      }
    }
  });
}
```

---

### **Feature 3: Proactive Follow-Up Requests**

**How it works:**
1. User applies treatment (Day 1)
2. AI schedules follow-up for Day 3
3. Day 3, 7 AM: AI sends SMS: "📸 Day 3 check: Upload photo to verify treatment working"
4. User uploads photo
5. AI compares to Day 1 photo
6. AI determines: "Treatment working ✅" or "Not improving ⚠️"
7. If not improving: AI suggests backup plan

**User saves:** Remembering to check (automated accountability)

**Implementation:**
```typescript
// Proactive follow-up system
async function scheduleFollowUps(treatment: Treatment, user: User) {
  const followUpDays = [3, 7, 14];
  
  for (const day of followUpDays) {
    await scheduleFollowUp({
      user_id: user.id,
      treatment_id: treatment.id,
      day: day,
      time: '07:00', // 7 AM (morning light for photos)
      message: `📸 Day ${day} check: Upload photo to verify treatment working. Link: ${getFollowUpLink(treatment.id, day)}`,
      callback: async (photo) => {
        // AI compares photos
        const comparison = await comparePhotos({
          initial: treatment.diagnosis.image_url,
          current: photo,
          day: day
        });
        
        // Determine verdict
        if (comparison.improving) {
          await sendSMS(user.phone, `✅ Treatment working! Infection sites: ${comparison.initial_sites} → ${comparison.current_sites}. Keep going!`);
        } else {
          await sendAlert({
            user_id: user.id,
            severity: 'high',
            message: `⚠️ Treatment not improving. Infection sites: ${comparison.initial_sites} → ${comparison.current_sites}. Shall I suggest a backup plan?`
          });
        }
      }
    });
  }
}
```

---

### **Feature 4: Adaptive Treatment Plans**

**How it works:**
1. AI generates 14-day plan
2. User uploads Day 3 photo
3. AI detects: Treatment not working as expected
4. AI adapts plan: "Add copper spray to Day 7 application"
5. AI updates plan automatically
6. AI notifies user of changes

**User saves:** Crop loss (early intervention)

**Implementation:**
```typescript
// Adaptive plan system
async function adaptPlan(outcome: Outcome, plan: TreatmentPlan) {
  // 1. Analyze progress
  const progress = analyzeProgress(outcome);
  
  // 2. Determine if adaptation needed
  if (progress.status === 'on_track') {
    return; // No changes needed
  }
  
  // 3. Generate adaptations
  const adaptations = await generateAdaptations({
    original_plan: plan,
    progress: progress,
    diagnosis: outcome.diagnosis,
    constraints: {
      budget: plan.budget,
      organic_only: plan.organic_only,
      harvest_date: plan.harvest_date
    }
  });
  
  // 4. Apply best adaptation
  const best = adaptations[0];
  await updatePlan(plan.id, best.changes);
  
  // 5. Notify user
  await sendNotification({
    user_id: plan.user_id,
    message: `📋 Plan updated: ${best.reasoning}. New action: ${best.changes[0].action}`,
    changes: best.changes
  });
}
```

---

### **Feature 5: Intelligent Reminders**

**How it works:**
1. AI knows user's schedule (learned from past behavior)
2. AI sends reminders at optimal times
3. AI adjusts reminder frequency based on urgency
4. AI stops reminding once action completed

**User saves:** Annoyance (smart reminders, not spam)

**Implementation:**
```typescript
// Intelligent reminder system
async function sendIntelligentReminder(reminder: Reminder, user: User) {
  // 1. Check if action already completed
  const completed = await checkActionCompleted(reminder.action_id);
  if (completed) {
    await cancelReminder(reminder.id);
    return;
  }
  
  // 2. Determine urgency
  const urgency = calculateUrgency(reminder);
  
  // 3. Adjust frequency based on urgency
  const frequency = {
    low: 24 * 3600, // 1 day
    medium: 6 * 3600, // 6 hours
    high: 1 * 3600, // 1 hour
    critical: 15 * 60 // 15 minutes
  }[urgency];
  
  // 4. Learn optimal time from past behavior
  const optimalTime = await learnOptimalTime(user.id, reminder.type);
  
  // 5. Send reminder
  await sendSMS(user.phone, reminder.message);
  
  // 6. Schedule next reminder if not completed
  if (urgency !== 'low') {
    await scheduleReminder({
      ...reminder,
      time: Date.now() + frequency
    });
  }
}
```

---

## 🎯 User Preference System

### **Controllability & Guardrails**

**Users set boundaries:**
```typescript
interface UserPreferences {
  // Budget
  max_budget: number; // €50
  
  // Treatment preferences
  organic_only: boolean; // true
  avoid_chemicals: string[]; // ['copper', 'sulfur']
  
  // Automation level
  auto_reserve: boolean; // true = AI can reserve without asking
  auto_schedule: boolean; // true = AI can schedule reminders
  auto_adapt: boolean; // false = ask before changing plan
  
  // Communication
  notification_channels: ('sms' | 'whatsapp' | 'push')[]; // ['sms', 'whatsapp']
  quiet_hours: { start: string; end: string }; // { start: '22:00', end: '06:00' }
  language: 'en' | 'fr' | 'ar'; // 'fr'
  
  // Schedule
  available_days: string[]; // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  preferred_application_time: 'morning' | 'evening'; // 'evening'
}
```

**AI operates within bounds:**
```typescript
async function makeDecision(action: AgentAction, user: User) {
  const prefs = user.preferences;
  
  // Check budget constraint
  if (action.cost > prefs.max_budget) {
    return {
      approved: false,
      reason: `Cost (€${action.cost}) exceeds budget (€${prefs.max_budget})`,
      alternative: await findCheaperOption(action)
    };
  }
  
  // Check organic constraint
  if (prefs.organic_only && !action.organic) {
    return {
      approved: false,
      reason: 'User requires organic treatments only',
      alternative: await findOrganicOption(action)
    };
  }
  
  // Check automation level
  if (action.requires_confirmation && !prefs.auto_reserve) {
    return {
      approved: false,
      reason: 'User requires confirmation for reservations',
      action: 'ask_user'
    };
  }
  
  // All checks passed
  return {
    approved: true,
    reason: 'Within user preferences'
  };
}
```

---

## 🔒 Safety Mechanisms

### **1. Compliance Checks**

**Before any recommendation:**
```typescript
async function checkCompliance(treatment: Treatment, user: User) {
  // Check EU regulations
  const euCheck = await checkEUCompliance({
    substance: treatment.substance,
    crop: user.crop_type,
    export_destination: 'EU'
  });
  
  if (!euCheck.compliant) {
    throw new Error(`${treatment.substance} is banned for EU export: ${euCheck.reason}`);
  }
  
  // Check organic certification
  if (user.organic_certified) {
    const organicCheck = await checkOrganicCompliance({
      substance: treatment.substance,
      certifier: user.certifier
    });
    
    if (!organicCheck.compliant) {
      throw new Error(`${treatment.substance} not allowed for organic: ${organicCheck.reason}`);
    }
  }
  
  // Check pre-harvest interval
  const daysToHarvest = calculateDaysToHarvest(user.harvest_date);
  if (daysToHarvest < treatment.phi_days) {
    throw new Error(`PHI violation: ${treatment.phi_days} days required, only ${daysToHarvest} days until harvest`);
  }
  
  return { compliant: true };
}
```

---

### **2. Uncertainty Thresholds**

**When confidence is low:**
```typescript
async function handleUncertainty(diagnosis: Diagnosis) {
  const confidence = diagnosis.diseases[0].confidence;
  
  if (confidence < 0.70) {
    // Low confidence - recommend expert consultation
    return {
      action: 'consult_expert',
      message: `I'm only ${confidence * 100}% confident. This is unusual. I recommend consulting an agronomist.`,
      experts: await findNearbyExperts(diagnosis.user.location)
    };
  } else if (confidence < 0.85) {
    // Medium confidence - proceed with caution
    return {
      action: 'proceed_with_caution',
      message: `I'm ${confidence * 100}% confident. Treatment should work, but monitor closely.`,
      backup_plan: await generateBackupPlan(diagnosis)
    };
  } else {
    // High confidence - proceed normally
    return {
      action: 'proceed',
      message: `I'm ${confidence * 100}% confident. Treatment plan generated.`
    };
  }
}
```

---

### **3. Audit Trail**

**Every decision logged:**
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  user_id: string;
  agent_action: string;
  reasoning: string;
  user_preferences: UserPreferences;
  compliance_checks: ComplianceCheck[];
  outcome: 'approved' | 'rejected' | 'user_override';
  metadata: Record<string, any>;
}

// Log every decision
await logDecision({
  user_id: user.id,
  agent_action: 'reserve_treatment',
  reasoning: 'High severity, best supplier available, within budget',
  user_preferences: user.preferences,
  compliance_checks: [euCheck, organicCheck],
  outcome: 'approved',
  metadata: {
    supplier_id: supplier.id,
    product: product.name,
    cost: product.price
  }
});
```

---

## 🎯 The High-Agency Mindset

### **For Every Feature, Ask:**

1. **Can we take action?**
   - ❌ "Show user supplier info"
   - ✅ "Reserve treatment for user"

2. **Can we automate?**
   - ❌ "User schedules reminder"
   - ✅ "AI schedules optimal reminder"

3. **Can we adapt?**
   - ❌ "Static 14-day plan"
   - ✅ "Adaptive plan based on progress"

4. **Can we predict?**
   - ❌ "React to problems"
   - ✅ "Prevent problems proactively"

5. **Can we learn?**
   - ❌ "Same approach for everyone"
   - ✅ "Personalized based on history"

---

## 📊 Measuring High Agency

### **Agency Score**

```
Agency Score = (Actions Taken / Actions Possible) × 100

Where:
- Actions Taken = Reservations made, reminders sent, plans adapted, etc.
- Actions Possible = All opportunities to take action
```

**Target:** >80% agency score

**Example:**
- Diagnoses: 100
- Auto-reserved: 75 (75%)
- Auto-scheduled: 90 (90%)
- Auto-adapted: 20 (20% needed adaptation)
- **Average agency score: 82%** ✅

---

### **User Effort Score**

```
Effort Score = (User Actions Required / Total Actions) × 100

Lower is better
```

**Target:** <30% effort score (AI does 70%+ of work)

**Example:**
- Total actions: 10 (diagnose, search, reserve, pickup, apply, follow-up 3x, verify, pay)
- User actions: 3 (pickup, apply, pay)
- **Effort score: 30%** ✅

---

## 🦜 The Lorikeet Standard

**Lorikeet's agents:**
- Make decisions autonomously
- Take actions within guardrails
- Learn from outcomes
- Adapt continuously

**Our agents:**
- Reserve treatments autonomously
- Schedule applications within preferences
- Learn optimal times from behavior
- Adapt plans based on progress

**Same philosophy. Same high agency. Same value creation.**

---

🌿 **From passive advice to active problem-solving. From low agency to high impact.**
