# 🌿 LeafScan AI: Product Philosophy
## Building a Killer Product, Not Just a Demo

---

## 🎯 Our Mission

**Save crops, save livelihoods, save lives.**

We don't build AI to showcase technology. We build AI to solve real problems for real farmers. Every line of code, every feature, every decision exists for one purpose: **to help farmers save their harvest.**

---

## 🦜 The Lorikeet Inspiration

Lorikeet, a $200M Australian AI startup, beat Silicon Valley giants (Sierra, Decagon, OpenAI) not with better AI, but with better philosophy:

1. **Users first** - Charge only for successful resolutions
2. **Backwards reasoning** - Start with ideal outcome, work backwards to tech
3. **High agency** - AI that takes actions, not just recommends
4. **Specialization** - Deep focus on regulated, complex workflows
5. **Explicit principles** - Written culture guides every decision
6. **Excellence without toxicity** - High standards, humble execution
7. **Geography doesn't matter** - Execution beats location

**We apply this to agriculture.**

---

## 📜 Our 10 Operating Principles

### **1. Farmers First, Always**

**The farmer's success is our success. Their failure is our failure.**

- We charge only when we create value (crop saved, yield increased)
- Farmers have veto power on what counts as "resolved"
- Every feature must answer: "Does this help farmers save crops?"

**In practice:**
- ✅ Feature prioritization: "Will this save Maria's tomatoes?" not "Is this technically cool?"
- ✅ Pricing: Pay only when crop is saved (2.5% of value)
- ❌ Vanity metrics: Downloads, page views, time-on-site

---

### **2. Resolution Over Deflection**

**Success = problem actually solved, not information provided.**

We don't measure "diagnostic accuracy" or "user engagement." We measure: **Did the crop get saved?**

**Metrics that matter:**
- ✅ Resolution rate: % of farmers who successfully treated and saved crops
- ✅ Economic impact: € saved per € spent
- ❌ Deflection rate: "We told them what to do" (not our job done)

---

### **3. High Agency, High Value**

**Don't just recommend—execute.**

If we can't take action to solve the problem, the feature isn't done.

**Action hierarchy:**
```
Level 1: Provide information ❌
Level 2: Recommend actions ❌
Level 3: Connect to resources ⚠️
Level 4: Execute on behalf of user ✅ ← WE AIM HERE
Level 5: Proactively solve before user asks ✅
```

**Example:**
- ❌ Low agency: "You should buy neem oil"
- ✅ High agency: "I've reserved neem oil at Bio-Agri Maroc (4km, €15). Pick up by 6 PM."

---

### **4. Specialization = Defensibility**

**We don't serve everyone. We serve export farmers exceptionally well.**

**Our niche:** Export-grade tomatoes in Morocco (EU compliance required)

**Why defensible:**
- Regulatory complexity (EU pesticide limits, organic certification)
- High stakes (€5k-€20k per hectare)
- Generic AI can't compete (lacks compliance database)

**Expansion path:**
1. Master ONE crop in ONE region
2. Adjacent crops (peppers, cucumbers)
3. Adjacent regions (Tunisia, Spain)
4. Global standard for regulated crops

**Depth before breadth.**

---

### **5. Radical Transparency**

**Show our reasoning. Admit uncertainty. No black boxes.**

Every recommendation must be explainable:
- Why this treatment? (visual cues detected)
- Why this supplier? (closest, in stock, certified)
- How confident? (92% - here's why)

**When uncertain:**
- ✅ "I'm only 65% confident—this is unusual. Consult an agronomist."
- ❌ "Probably Early Blight. Try neem oil."

---

### **6. The Front-Page Test**

**Every decision should be defensible if it appeared in a newspaper.**

**Before recommending anything:**
1. Is this legal in the user's jurisdiction?
2. Is this safe for farmer, crop, environment?
3. Would I be proud to defend this publicly?
4. Could this harm someone?

**Zero tolerance for:**
- Banned substances
- Unsafe application methods
- Misleading claims
- Regulatory violations

---

### **7. Excellence Without Toxicity**

**High standards, humble execution. Direct feedback, no ego.**

Being effective ≠ being a jerk.

**In practice:**
- ✅ "This doesn't meet our resolution rate standard. Here's how to improve."
- ❌ "This is garbage. Who approved this?"
- ✅ "I disagree. Here's my reasoning. What am I missing?"
- ❌ "That's stupid. We're doing it my way."

**Bridgewater-inspired radical candor:**
- Say what you think (don't sugarcoat)
- Focus on ideas, not people
- Assume good intent
- Seek truth, not validation

---

### **8. Backwards Reasoning**

**Start with the ideal outcome. Work backwards to required tech.**

**Process:**
1. Define ideal outcome: "Farmer saves crop in 7 days"
2. Work backwards: What's needed? (Supplier API, weather integration, SMS)
3. Build the required tech

**Anti-pattern:**
- ❌ "We have Gemini 3, what can we build?"
- ✅ "We need to save crops in 7 days, what tech enables that?"

---

### **9. Charge for Outcomes, Not Inputs**

**We get paid when farmers succeed. If crop dies, we don't charge.**

**Pricing philosophy:**
- Free: Diagnosis + recommendations (prove value)
- Success fee: 2-5% of crop value saved (aligned incentives)
- Subscription: €200/month unlimited (large farms)
- Enterprise: Custom (cooperatives)

**Example:**
- Farmer saves €5,000 crop → We charge €125 (2.5%)
- Farmer's crop dies → We charge €0 (we failed)

---

### **10. Measure What Matters**

**Track outcomes, not vanity metrics.**

**Core metrics:**
1. **Resolution Rate**: % crops actually saved
2. **Time to Action**: Upload → treatment purchased
3. **Economic Impact**: € saved per € spent
4. **User Satisfaction**: NPS, would recommend

**Anti-metrics:**
- ❌ Number of diagnoses
- ❌ Time on site
- ❌ Feature count

**Every feature has a metric. Every metric has a target.**

---

## 🎯 Decision-Making Framework

**When evaluating any decision (feature, hire, partnership):**

```
1. Farmers First: Does this help save crops? (Y/N)
2. Resolution: Does this increase resolution rate? (Y/N)
3. Agency: Does this enable action? (Y/N)
4. Specialization: Does this deepen our moat? (Y/N)
5. Transparency: Can we explain this? (Y/N)
6. Front-Page Test: Would we be proud if public? (Y/N)
7. Excellence: Does this meet quality standard? (Y/N)
8. Backwards: Did we start with ideal outcome? (Y/N)
9. Outcomes: Are we charging for value? (Y/N)
10. Metrics: Will this move core metrics? (Y/N)

Score:
- 8+ "Yes" → Proceed
- 5-7 "Yes" → Reconsider
- <5 "Yes" → Reject
```

---

## 🚀 Product Strategy

### **Phase 1: Prove Value (Weeks 1-4)**
**Goal:** Demonstrate we can actually save crops

**Focus:**
- Build outcome tracking (follow-up photos)
- Verify 10 real suppliers
- Achieve 60% resolution rate (baseline)
- Onboard 50 farmers

**Success criteria:**
- 30 crops saved (documented)
- 5 farmer testimonials
- €1k in success fees collected

---

### **Phase 2: Build Moats (Weeks 5-8)**
**Goal:** Create defensibility through specialization

**Focus:**
- EU compliance database (pesticide limits)
- Organic certification integration
- Weather-optimized scheduling
- Payment processing (success fees)

**Success criteria:**
- 100% EU compliance on recommendations
- 70% resolution rate
- €5k MRR

---

### **Phase 3: Scale Agency (Weeks 9-12)**
**Goal:** High-agency AI that takes actions

**Focus:**
- Proactive AI agent (auto-reserves, schedules)
- Supplier API integration (real-time inventory)
- Multi-channel notifications (SMS, WhatsApp)
- Advanced analytics

**Success criteria:**
- 80% resolution rate ✅
- <2hr time-to-action ✅
- €10k MRR ✅
- NPS >70 ✅

---

## 🎯 Target User Persona

### **Maria - Export Tomato Farmer**

**Demographics:**
- Age: 30-45
- Location: Casablanca, Morocco
- Farm size: 2-5 hectares
- Crop: Export-grade tomatoes (EU market)

**Pain points:**
- Diseases spread fast (24-48 hours critical)
- Can't afford agronomist ($100+ per visit)
- EU compliance is complex (banned substances)
- Suppliers are scattered (hard to find organic products)
- Crop loss = family income loss

**Goals:**
- Save crop when disease detected
- Maintain organic certification
- Meet EU export requirements
- Maximize yield and income

**Success looks like:**
- Upload photo → treatment reserved → crop saved
- All in <24 hours
- Organic certification maintained
- €5,000+ crop value preserved

---

## 💰 Business Model

### **Revenue Streams**

**1. Success Fees (Primary - 70% of revenue)**
- 2-5% of crop value saved
- Only charged when crop is actually saved
- Average: €100-€200 per case

**2. Supplier Commissions (20% of revenue)**
- 5-10% from suppliers for verified referrals
- Incentivizes supplier quality
- Average: €15-€30 per transaction

**3. Subscriptions (5% of revenue)**
- €200/month unlimited for large farms
- Predictable revenue
- Higher LTV

**4. Data & Services (5% of revenue)**
- Anonymized disease patterns to research
- Certification fast-track services
- Insurance partnerships

### **Unit Economics**

**Per successful case:**
- Crop value saved: €5,000
- Success fee (2.5%): €125
- Supplier commission (10% of €150): €15
- **Total revenue**: €140
- **Cost**: ~€5 (AI API, SMS, hosting)
- **Gross margin**: 96%
- **Net profit**: €135

**At scale (500 farmers, 80% resolution rate):**
- Cases per month: 500 × 0.8 = 400
- Revenue per month: 400 × €140 = €56,000
- Costs: 400 × €5 = €2,000
- **Net profit**: €54,000/month

---

## 🔒 Competitive Moats

### **1. Regulatory Compliance**
- EU pesticide database (updated weekly)
- Organic certification rules (Ecocert, USDA)
- MRL limits (Maximum Residue Levels)
- PHI calculator (Pre-Harvest Intervals)

**Defensibility:** Generic AI can't compete (lacks regulatory knowledge)

### **2. Supplier Network**
- 50+ verified suppliers (by Year 1)
- Real-time inventory integration
- Quality ratings from farmers
- Exclusive partnerships

**Defensibility:** Takes years to build, hard to replicate

### **3. Outcome Data**
- 10,000+ before/after photo pairs
- Resolution rate by treatment type
- Economic impact data
- Predictive models

**Defensibility:** Proprietary dataset, improves with scale

### **4. Certification Integration**
- Direct integration with Ecocert, USDA
- Automated compliance reports
- Traceability blockchain
- Export documentation

**Defensibility:** Requires partnerships, regulatory approval

---

## 📊 Success Metrics Dashboard

### **Primary Metric: Resolution Rate**
```
Target: 80% by Week 12
Current: --% (not yet measured)

Calculation:
Resolution Rate = (Crops Saved / Total Diagnoses) × 100

Where "Saved" = Farmer confirms crop recovered after treatment
```

### **Secondary Metrics**

**Time to Action**
- Target: <2 hours (upload → treatment purchased)
- Current: --

**Economic Impact**
- Target: 15:1 ROI (€15 saved per €1 spent)
- Current: --

**User Satisfaction**
- Target: NPS >70
- Current: --

**Revenue**
- Target: €10k MRR by Week 12
- Current: €0

---

## 🚨 Red Lines (Never Cross)

### **1. Safety First**
- Never recommend banned substances
- Never compromise on compliance
- Never rush diagnosis (accuracy > speed)

### **2. Transparency Always**
- Never hide uncertainty
- Never make unsubstantiated claims
- Never obscure pricing

### **3. Outcomes Over Vanity**
- Never optimize for downloads over crops saved
- Never celebrate "users" without measuring outcomes
- Never ship features that don't move resolution rate

### **4. Farmers First**
- Never charge if crop dies
- Never prioritize revenue over farmer success
- Never compromise on quality for scale

---

## 🌍 Impact Vision

### **Year 1**
- 5,000 farmers
- €2.5M in crop value saved
- 10,000 tons of food preserved
- 500 families' livelihoods protected

### **Year 3**
- 50,000 farmers
- €25M in crop value saved
- 5 countries (North Africa + Southern Europe)
- 10 crop types
- Industry standard for regulated agriculture

### **Year 5**
- 500,000 farmers globally
- €250M in crop value saved
- 50 countries
- 50 crop types
- Reduced global crop loss by 1%

---

## 🦜 Living the Philosophy

**These aren't just words. This is how we operate.**

**In meetings:**
- Start with: "How does this help farmers?"
- End with: "How will we measure success?"

**In code reviews:**
- Ask: "Does this improve resolution rate?"
- Ask: "Is this production-quality?"
- Ask: "Can we explain this to a farmer?"

**In hiring:**
- Look for: User-obsessed (not tech-obsessed)
- Look for: High agency (takes ownership)
- Look for: Humble (no ego)
- Look for: Specialized (deep expertise)

**Every quarter, review:**
1. Are we living these principles?
2. Which principles need more emphasis?
3. Do we need new principles?
4. Are any principles outdated?

---

## 🎯 The North Star

**When in doubt, ask:**

> **"Does this actually help a farmer save their harvest?"**

If yes, do it.
If no, don't.

**Simple. Uncompromising. User-obsessed.**

---

**Built with ❤️ to save crops, livelihoods, and lives.**

🌿 **From philosophy to practice. From demo to market leader.**
