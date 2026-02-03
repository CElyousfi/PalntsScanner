# 🌿 LeafScan AI Operating Principles
## Our North Star for Every Decision

*Inspired by Stripe, Bridgewater Associates, and Lorikeet's philosophy of user-obsessed excellence*

---

## 🎯 Core Philosophy

**We exist to save crops, not to showcase AI.**

Every feature, every line of code, every decision must pass this test: **Does this actually help a farmer save their harvest?** If not, we don't build it.

---

## 📜 The Principles

### 1. **Farmers First, Always**

**What it means:**
- The farmer's success is our success. Their failure is our failure.
- We charge only when we create value (crop saved, yield increased).
- Farmers have veto power: they decide what counts as "resolved."

**In practice:**
- ✅ "This diagnosis saved my crop" → We succeeded
- ❌ "The diagnosis was accurate but I couldn't find treatment" → We failed
- ✅ Feature prioritization: "Will this help Maria save her tomatoes?" not "Is this technically impressive?"

**Decision framework:**
```
Before building anything, ask:
1. Does this reduce crop loss?
2. Does this increase farmer income?
3. Would a farmer pay for this outcome?

If all three aren't "yes," don't build it.
```

---

### 2. **Resolution Over Deflection**

**What it means:**
- Success = problem actually solved, not "information provided"
- We measure outcomes (crop saved), not outputs (diagnoses delivered)
- If the farmer still has a problem after using our product, we haven't succeeded

**In practice:**
- ❌ Bad metric: "85% diagnostic accuracy"
- ✅ Good metric: "80% of farmers successfully treated and saved crops"
- ❌ Bad feature: "AI chatbot answers questions"
- ✅ Good feature: "AI reserves treatment at nearest supplier and schedules application"

**Anti-patterns to avoid:**
- Deflection tactics: "We told them what to do, not our fault they didn't do it"
- Vanity metrics: Downloads, page views, time-on-site
- Accuracy theater: "Our AI is 95% accurate!" (but crops still die)

---

### 3. **High Agency, High Value**

**What it means:**
- Don't just recommend—execute
- Take actions on behalf of farmers (with permission)
- If we can't take action to solve the problem, the feature isn't done

**In practice:**
- ❌ Low agency: "You should buy neem oil"
- ✅ High agency: "I've reserved neem oil at Bio-Agri Maroc (4km away, €15). Pick it up today by 6 PM or I'll cancel the reservation."

**Action hierarchy:**
```
Level 1 (Passive): Provide information
Level 2 (Guidance): Recommend specific actions
Level 3 (Facilitation): Connect to resources
Level 4 (Execution): Take action on behalf of user ← WE AIM HERE
Level 5 (Autonomous): Proactively solve problems before user asks
```

**The ceiling principle:**
> "If you can't take actions and solve people's problems, it's like a very low ceiling on how much value you can create." — Lorikeet founders

We aim for Level 4-5 agency.

---

### 4. **Specialization = Defensibility**

**What it means:**
- We don't try to serve everyone
- We focus on regulated, high-stakes crops where generic AI fails
- Deep expertise in compliance, certification, and complex workflows

**In practice:**
- ✅ Target: Export-grade tomatoes in Morocco (EU compliance required)
- ❌ Avoid: "Works for any crop, any location" (no defensibility)
- ✅ Moat: EU pesticide database, organic certification integration, traceability systems
- ❌ Commodity: Generic disease identification (easily copied)

**Specialization strategy:**
```
Phase 1: Master ONE crop in ONE region (export tomatoes, Morocco)
Phase 2: Expand to adjacent crops (peppers, cucumbers)
Phase 3: Expand to adjacent regions (Tunisia, Spain)
Phase 4: Become the global standard for regulated crop management

Don't skip phases. Depth before breadth.
```

---

### 5. **Radical Transparency**

**What it means:**
- Show our reasoning for every recommendation
- Admit uncertainty and limitations
- No black boxes in high-stakes decisions

**In practice:**
- ✅ "I'm 92% confident this is Early Blight because I see concentric rings (visual cue) and yellowing margins (symptom). Here's the bounding box showing where I detected it."
- ❌ "This is Early Blight. Trust me."
- ✅ "I'm only 65% confident—this is unusual. I recommend consulting an agronomist. Here are 3 local experts."
- ❌ "Probably Early Blight. Try neem oil."

**Transparency checklist:**
- [ ] Show confidence scores
- [ ] Explain visual cues detected
- [ ] Cite sources (research papers, expert guidelines)
- [ ] Admit when uncertain
- [ ] Provide alternative options
- [ ] Log every decision (audit trail)

---

### 6. **The Front-Page Test**

**What it means:**
- Every decision should be defensible if it appeared on the front page of a newspaper
- Safety and compliance are non-negotiable
- One mistake can destroy trust forever

**In practice:**
- ✅ "LeafScan AI helped farmer save €5,000 crop with EU-certified organic treatment"
- ❌ "LeafScan AI recommended banned pesticide, farmer fined €10,000"

**Before recommending anything, ask:**
1. Is this legal in the user's jurisdiction?
2. Is this safe for the farmer, crop, and environment?
3. Would I be proud to defend this decision publicly?
4. Could this harm someone if they follow our advice?

**Zero tolerance for:**
- Banned substances
- Unsafe application methods
- Misleading claims
- Regulatory violations

---

### 7. **Excellence Without Toxicity**

**What it means:**
- High standards, humble execution
- Direct feedback, no ego
- Being effective ≠ being a jerk

**In practice:**
- ✅ "This feature doesn't meet our resolution rate standard. Here's how we can improve it."
- ❌ "This feature is garbage. Who approved this?"
- ✅ "I disagree with this approach. Here's my reasoning. What am I missing?"
- ❌ "That's a stupid idea. We're doing it my way."

**Bridgewater-inspired radical candor:**
- Say what you think (don't sugarcoat)
- Focus on ideas, not people
- Assume good intent
- Seek truth, not validation

**No correlation between effectiveness and being a jerk.**

---

### 8. **Backwards Reasoning**

**What it means:**
- Start with the ideal outcome
- Work backwards to required technology
- Don't let current capabilities limit our vision

**In practice:**

**Step 1: Define ideal outcome**
> "Farmer uploads photo at 6 AM. By 6:05 AM, treatment is reserved, application is scheduled, and follow-up is automated. By harvest, crop is saved."

**Step 2: Work backwards**
- Need: Supplier API integration → Partner with suppliers
- Need: Weather-based scheduling → Integrate weather API
- Need: Automated follow-up → Build reminder system
- Need: Outcome verification → Create photo comparison AI

**Step 3: Build the required tech**
- Don't say "We can't do that with current tech"
- Say "What tech do we need to make this possible?"

**Anti-pattern:**
- ❌ "We have Gemini 3, what can we build with it?"
- ✅ "We need to save crops in 7 days, what tech enables that?"

---

### 9. **Charge for Outcomes, Not Inputs**

**What it means:**
- We get paid when farmers succeed
- If the crop dies, we don't charge
- Align our incentives with user success

**In practice:**
- ✅ Farmer saves €800 crop → We charge €20 (2.5% of value saved)
- ✅ Farmer's crop dies → We charge €0 (we failed)
- ❌ Charge per diagnosis (misaligned incentives)
- ❌ Charge per API call (we want fewer, better calls)

**Pricing philosophy:**
```
Free tier: Diagnosis + recommendations (prove value)
Success fee: 2-5% of crop value saved (aligned incentives)
Subscription: Unlimited for large farms (predictable revenue)
Enterprise: Custom for cooperatives (scale)
```

---

### 10. **Measure What Matters**

**What it means:**
- Track outcomes, not vanity metrics
- Obsess over resolution rate
- Every feature must move core metrics

**Core metrics:**
1. **Resolution Rate**: % of cases where crop was actually saved
2. **Time to Action**: Upload → treatment purchased
3. **Economic Impact**: € saved per € spent (ROI)
4. **User Satisfaction**: NPS, would recommend

**Anti-metrics (what we DON'T optimize):**
- ❌ Number of diagnoses (vanity)
- ❌ Time on site (we want farmers farming, not using our app)
- ❌ Feature count (more ≠ better)

**Measurement discipline:**
- Every feature has a metric
- Every metric has a target
- Every week, review: Are we moving the needle?

---

## 🚀 Applying the Principles

### **Decision-Making Framework**

When evaluating any decision (feature, hire, partnership, etc.):

```
1. Farmers First: Does this help farmers save crops?
2. Resolution: Does this increase our resolution rate?
3. Agency: Does this enable us to take action, not just advise?
4. Specialization: Does this deepen our moat in regulated crops?
5. Transparency: Can we explain and defend this decision?
6. Front-Page Test: Would we be proud if this was public?
7. Excellence: Does this meet our quality standard?
8. Backwards: Did we start with the ideal outcome?
9. Outcomes: Are we charging for value created?
10. Metrics: Will this move our core metrics?

If 8+ are "yes," proceed.
If 5-7 are "yes," reconsider.
If <5 are "yes," reject.
```

---

### **Cultural Norms**

**In meetings:**
- Start with user impact: "How does this help farmers?"
- End with metrics: "How will we measure success?"
- Challenge ideas, not people
- Seek truth, not consensus

**In code reviews:**
- Does this improve resolution rate?
- Is this production-quality (not demo-quality)?
- Can we explain this to a farmer?
- Is this safe and compliant?

**In hiring:**
- User-obsessed (not tech-obsessed)
- High agency (takes ownership)
- Humble (no ego)
- Specialized (deep expertise)

---

## 🎯 Success Stories (What Good Looks Like)

### **Example 1: The Reservation Feature**

**Before (Passive):**
- AI: "I recommend buying neem oil from Bio-Agri Maroc"
- Farmer: *Has to call, check stock, drive there, might be sold out*
- Outcome: 40% actually buy treatment (60% give up)

**After (High Agency):**
- AI: "I've reserved neem oil at Bio-Agri Maroc (€15, in stock). Pick up by 6 PM or I'll cancel."
- Farmer: *Gets SMS with directions, picks up, applies*
- Outcome: 85% actually buy treatment (15% cancel)

**Principles applied:**
- ✅ Farmers First (removed friction)
- ✅ High Agency (took action)
- ✅ Resolution (increased treatment rate)
- ✅ Metrics (measured pickup rate)

---

### **Example 2: The Compliance Check**

**Before (Generic):**
- AI: "Use chlorpyrifos for aphid control"
- Farmer: *Uses it, crop rejected at EU border (banned substance)*
- Outcome: €10,000 loss, trust destroyed

**After (Specialized):**
- AI: "Chlorpyrifos is banned in EU. For export crops, use neem oil (EU-approved, 3-day PHI)"
- Farmer: *Uses compliant treatment, crop accepted*
- Outcome: €10,000 saved, trust built

**Principles applied:**
- ✅ Specialization (EU compliance database)
- ✅ Front-Page Test (avoided disaster)
- ✅ Transparency (explained why)
- ✅ Safety (compliance first)

---

## 🚨 Failure Modes (What to Avoid)

### **Anti-Pattern 1: Feature Creep**
- ❌ "Let's add a social feed where farmers can share photos!"
- ✅ "Does this increase resolution rate? No? Then no."

### **Anti-Pattern 2: Tech for Tech's Sake**
- ❌ "Gemini 3 has code execution—let's use it everywhere!"
- ✅ "Does code execution help farmers save crops? Only for supplier sorting. Use it there only."

### **Anti-Pattern 3: Vanity Metrics**
- ❌ "We hit 10,000 diagnoses this month!"
- ✅ "How many crops were actually saved? 8,000? That's 80% resolution—good."

### **Anti-Pattern 4: Generic Positioning**
- ❌ "We're the AI for all agriculture!"
- ✅ "We're the compliance platform for export-grade tomatoes."

---

## 📊 Quarterly Principle Review

Every quarter, we review:
1. Are we living these principles?
2. Which principles need more emphasis?
3. Do we need new principles?
4. Are any principles outdated?

**Accountability:**
- Every team member can call out principle violations
- No one is above the principles (including founders)
- Principles evolve with the company

---

## 🦜 The Lorikeet Standard

**Lorikeet's principles (that we've adapted):**
1. ✅ Users first (Stripe)
2. ✅ Front-page test (Stripe)
3. ✅ Radical transparency (Bridgewater)
4. ✅ Excellence without toxicity (Google)
5. ✅ High agency culture (Lorikeet)
6. ✅ Specialization = defensibility (Lorikeet)
7. ✅ Backwards reasoning (Lorikeet)

**Our additions:**
8. ✅ Resolution over deflection
9. ✅ Charge for outcomes
10. ✅ Measure what matters

---

## 🌿 Living the Principles

**These aren't just words on a page.**

Every decision, every feature, every hire, every partnership must align with these principles. When in doubt, refer back to:

> **"Does this actually help a farmer save their harvest?"**

If yes, do it.
If no, don't.

**Simple. Uncompromising. User-obsessed.**

---

**Let's build a company that farmers trust, competitors respect, and we're proud of.**

🌿 **From principles to practice. From demo to market leader.**
