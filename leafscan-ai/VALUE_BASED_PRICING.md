# 💰 Value-Based Pricing Model
## Charge for Outcomes, Not Inputs

---

## 🎯 Core Philosophy

**"We get paid when farmers succeed. If the crop dies, we don't charge."**

This aligns our incentives perfectly with farmer success.

---

## 🦜 The Lorikeet Model

**Lorikeet charges only for successful resolutions:**
- Customer problem solved → Charge
- Customer problem unsolved → Don't charge
- No per-API-call pricing
- No per-seat pricing
- **Pure outcome-based pricing**

**Result:** Customers trust them. They win deals against competitors.

**We apply the same model to agriculture.**

---

## 💰 Our Pricing Tiers

### **Tier 1: Free (Prove Value)**

**What's included:**
- Unlimited diagnoses
- Treatment recommendations
- Supplier information
- Basic support

**What's NOT included:**
- Reservations
- Automated reminders
- Follow-up verification
- Compliance reports

**Purpose:**
- Prove value
- Build trust
- Convert to paid

**Target users:**
- First-time users
- Skeptical farmers
- Trial period

---

### **Tier 2: Success Fee (Primary Revenue)**

**How it works:**
1. User uploads photo → Diagnosis
2. We help find treatment → Reservation
3. User applies treatment → Follow-up
4. Crop is saved → We charge 2.5% of value saved
5. Crop dies → We charge €0

**Pricing:**
```
Success Fee = Crop Value Saved × 2.5%

Where:
- Crop Value Saved = Crop Value × (% Saved - % Lost Without Treatment)
- Typical range: €50-€500 per case
```

**Example 1: High-value crop saved**
- Crop value: €20,000 (1 hectare export tomatoes)
- Without treatment: 40% loss = €8,000 lost
- With treatment: 5% loss = €1,000 lost
- Value saved: €7,000
- **Our fee: €175 (2.5% of €7,000)**
- **Farmer ROI: 40:1 (€175 to save €7,000)**

**Example 2: Medium-value crop saved**
- Crop value: €10,000
- Without treatment: 30% loss = €3,000 lost
- With treatment: 5% loss = €500 lost
- Value saved: €2,500
- **Our fee: €62.50 (2.5% of €2,500)**
- **Farmer ROI: 40:1**

**Example 3: Crop not saved (we failed)**
- Crop value: €10,000
- Without treatment: 40% loss = €4,000 lost
- With treatment: 35% loss = €3,500 lost (treatment didn't work)
- Value saved: €500 (minimal)
- **Our fee: €0 (below minimum threshold of €1,000 saved)**
- **Farmer pays: €0**

**Payment terms:**
- Pay at harvest (after value confirmed)
- Pay now (5% discount)
- Pay in installments (3 months, no interest)

**What's included:**
- Everything in Free tier
- Reservations
- Automated reminders
- Follow-up verification
- Compliance reports
- Priority support

---

### **Tier 3: Subscription (Predictable Revenue)**

**How it works:**
- €200/month for unlimited cases
- Best for large farms (>10 hectares)
- Predictable cost

**Pricing:**
```
Subscription = €200/month

Break-even: 2-3 successful cases per month
(vs. €62-€175 per case on success fee)
```

**When it makes sense:**
- Large farms (frequent issues)
- Multiple crop types
- Year-round growing
- Predictable budgeting

**Example:**
- Farm: 20 hectares tomatoes
- Cases per month: 5-8
- Success fee cost: €300-€600/month
- Subscription cost: €200/month
- **Savings: €100-€400/month**

**What's included:**
- Everything in Success Fee tier
- Unlimited cases
- Dedicated account manager
- Custom compliance reports
- API access (for large operations)

---

### **Tier 4: Enterprise (Custom Pricing)**

**Who it's for:**
- Cooperatives (100+ farmers)
- Exporters (managing multiple farms)
- Agribusinesses
- Government programs

**Pricing:**
- Custom (based on volume, needs)
- Typical range: €2,000-€20,000/month

**What's included:**
- Everything in Subscription tier
- White-label option
- Custom integrations
- Training programs
- On-site support
- SLA guarantees

**Example:**
- Cooperative: 500 farmers
- Cases per month: 200
- Standard pricing: €12,000-€35,000/month (success fees)
- Enterprise pricing: €5,000/month (volume discount)
- **Savings: 60-85%**

---

## 💰 Additional Revenue Streams

### **1. Supplier Commissions (20% of revenue)**

**How it works:**
- We refer farmers to suppliers
- Suppliers pay us 5-10% commission
- Farmers pay normal price (no markup)

**Example:**
- Farmer buys €150 of treatment
- Supplier pays us €15 (10% commission)
- Farmer pays €150 (same price as direct)
- **Win-win-win**

**Why suppliers pay:**
- We drive qualified leads
- Higher conversion (reserved = committed)
- Better customer experience
- Data insights (what farmers need)

---

### **2. Data Licensing (5% of revenue)**

**What we sell:**
- Anonymized disease patterns
- Treatment effectiveness data
- Regional risk maps
- Seasonal trends

**Who buys:**
- Research institutions (€10k-€50k/year)
- Agribusinesses (€50k-€200k/year)
- Government agencies (€20k-€100k/year)
- Insurance companies (€100k-€500k/year)

**Example:**
- Dataset: 10,000 tomato cases (Morocco, 2024)
- Includes: Disease type, treatment, outcome, weather, location
- Price: €50,000/year
- Buyer: Agricultural research institute

---

### **3. Certification Services (5% of revenue)**

**What we offer:**
- Fast-track organic certification
- Compliance audit preparation
- Export documentation
- Traceability reports

**Pricing:**
- Organic certification support: €500-€2,000
- Export documentation: €100-€500 per shipment
- Annual compliance package: €1,000-€5,000

**Example:**
- Farmer needs organic certification
- Normal process: 6-12 months, €2,000-€5,000
- With our support: 3-6 months, €1,500 (we handle paperwork)
- **Value: Time saved + lower cost**

---

### **4. Insurance Partnerships (5% of revenue)**

**How it works:**
- We provide risk assessment data to insurers
- Insurers offer lower premiums to our users
- We get revenue share (10-20% of premium savings)

**Example:**
- Farmer's normal premium: €1,000/year
- With our risk data: €700/year (30% discount)
- Premium savings: €300
- Our share (15%): €45
- **Farmer saves €255, we earn €45**

---

## 📊 Pricing Calculator

### **For Farmers:**

```typescript
function calculateSuccessFee(input: {
  cropValue: number;
  percentSavedWithTreatment: number;
  percentLostWithoutTreatment: number;
  feePercentage: number; // default: 2.5
}) {
  // Calculate value saved
  const lossWithoutTreatment = input.cropValue * (input.percentLostWithoutTreatment / 100);
  const lossWithTreatment = input.cropValue * ((100 - input.percentSavedWithTreatment) / 100);
  const valueSaved = lossWithoutTreatment - lossWithTreatment;
  
  // Calculate fee
  const fee = valueSaved * (input.feePercentage / 100);
  
  // Minimum threshold (don't charge if value saved < €1,000)
  if (valueSaved < 1000) {
    return {
      valueSaved: valueSaved,
      fee: 0,
      reason: 'Below minimum threshold (€1,000)'
    };
  }
  
  return {
    valueSaved: valueSaved,
    fee: Math.round(fee),
    roi: Math.round(valueSaved / fee),
    breakdown: {
      cropValue: input.cropValue,
      lossWithoutTreatment: Math.round(lossWithoutTreatment),
      lossWithTreatment: Math.round(lossWithTreatment),
      valueSaved: Math.round(valueSaved),
      feePercentage: input.feePercentage,
      fee: Math.round(fee)
    }
  };
}

// Example usage
const result = calculateSuccessFee({
  cropValue: 10000,
  percentSavedWithTreatment: 95,
  percentLostWithoutTreatment: 40,
  feePercentage: 2.5
});

console.log(result);
// {
//   valueSaved: 3500,
//   fee: 88,
//   roi: 40,
//   breakdown: {...}
// }
```

---

### **Subscription Break-Even Calculator:**

```typescript
function shouldSubscribe(input: {
  casesPerMonth: number;
  avgCropValue: number;
  avgPercentSaved: number;
  subscriptionPrice: number; // €200
}) {
  // Calculate monthly success fee cost
  const avgSuccessFee = calculateSuccessFee({
    cropValue: input.avgCropValue,
    percentSavedWithTreatment: input.avgPercentSaved,
    percentLostWithoutTreatment: 40, // assume 40% loss without treatment
    feePercentage: 2.5
  }).fee;
  
  const monthlySuccessFees = avgSuccessFee * input.casesPerMonth;
  
  // Compare to subscription
  const savings = monthlySuccessFees - input.subscriptionPrice;
  const breakEvenCases = Math.ceil(input.subscriptionPrice / avgSuccessFee);
  
  return {
    recommend: savings > 0,
    monthlySuccessFees: monthlySuccessFees,
    subscriptionPrice: input.subscriptionPrice,
    savings: savings,
    breakEvenCases: breakEvenCases,
    message: savings > 0 
      ? `Save €${savings}/month with subscription` 
      : `Stick with success fees (cheaper for ${input.casesPerMonth} cases/month)`
  };
}
```

---

## 🎯 Pricing Strategy by Segment

### **Segment 1: Small Farmers (1-5 hectares)**

**Profile:**
- Crop value: €2,000-€10,000
- Cases per year: 2-5
- Budget: Limited

**Recommended tier:** Success Fee
- Pay only when crop saved
- No upfront cost
- Low risk

**Expected revenue:**
- €50-€150 per case
- €100-€750 per year
- LTV: €300-€2,000 (3 years)

---

### **Segment 2: Medium Farmers (5-20 hectares)**

**Profile:**
- Crop value: €10,000-€50,000
- Cases per year: 5-15
- Budget: Moderate

**Recommended tier:** Success Fee or Subscription
- Success fee if <8 cases/year
- Subscription if >8 cases/year

**Expected revenue:**
- €100-€300 per case (success fee)
- €2,400/year (subscription)
- LTV: €7,000-€15,000 (3 years)

---

### **Segment 3: Large Farmers (20+ hectares)**

**Profile:**
- Crop value: €50,000-€200,000
- Cases per year: 15-50
- Budget: High

**Recommended tier:** Subscription
- Predictable cost
- Unlimited cases
- Dedicated support

**Expected revenue:**
- €2,400/year (subscription)
- LTV: €10,000-€20,000 (3 years)

---

### **Segment 4: Cooperatives/Enterprises**

**Profile:**
- Crop value: €500,000-€5,000,000 (aggregate)
- Cases per year: 100-1,000
- Budget: Very high

**Recommended tier:** Enterprise
- Custom pricing
- Volume discounts
- White-label option

**Expected revenue:**
- €24,000-€240,000/year
- LTV: €100,000-€1,000,000 (5 years)

---

## 💳 Payment Processing

### **Payment Methods**

**1. Mobile Money (Primary in Africa)**
- M-Pesa (Kenya)
- Orange Money (Morocco, West Africa)
- MTN Mobile Money (Ghana, Uganda)
- **Fees: 1-3%**

**2. Credit/Debit Cards**
- Visa, Mastercard
- Via Stripe
- **Fees: 2.9% + €0.30**

**3. Bank Transfer**
- Direct deposit
- Lower fees (€1-€2 flat)
- Slower (2-3 days)

**4. Cash (Supplier Pickup)**
- Pay at supplier when picking up treatment
- Supplier remits to us (minus commission)
- **Fees: 5-10% (supplier commission)**

**5. Pay-at-Harvest**
- Invoice sent after harvest
- Payment due within 30 days
- **Fees: 0% (but risk of non-payment)**

---

### **Payment Terms**

**Option 1: Pay Now (5% discount)**
- Immediate payment after outcome verification
- Example: €100 fee → €95 with discount

**Option 2: Pay at Harvest (standard)**
- Payment due at harvest (typically 30-60 days)
- No discount, no interest

**Option 3: Installments (3 months)**
- Split into 3 equal payments
- No interest
- Example: €150 fee → €50/month for 3 months

---

### **Non-Payment Handling**

**If farmer doesn't pay:**
1. **Week 1:** Friendly reminder (SMS, email)
2. **Week 2:** Phone call (understand situation)
3. **Week 3:** Payment plan offer (extend terms)
4. **Week 4:** Suspend account (no new diagnoses)
5. **Week 8:** Collections agency (last resort)

**Write-off policy:**
- If farmer's crop failed despite treatment: Forgive debt
- If farmer refuses to pay despite success: Collections
- If farmer can't afford: Payment plan or partial forgiveness

**Target:** <5% non-payment rate

---

## 📊 Revenue Projections

### **Year 1 (500 farmers)**

**Assumptions:**
- 500 farmers
- 80% resolution rate
- 2 cases per farmer per year
- Average success fee: €100

**Revenue breakdown:**
```
Success Fees:
- Cases: 500 farmers × 2 cases × 0.8 resolution = 800 successful cases
- Revenue: 800 × €100 = €80,000

Supplier Commissions:
- Transactions: 800 × €150 avg treatment = €120,000 GMV
- Commission: €120,000 × 10% = €12,000

Subscriptions:
- Subscribers: 50 large farmers × €200/month = €10,000/month
- Revenue: €10,000 × 12 = €120,000

Data Licensing:
- Contracts: 2 research institutions × €25,000 = €50,000

Total Revenue: €262,000
```

**Costs:**
```
AI API (Gemini): €20,000
SMS/WhatsApp: €10,000
Hosting: €5,000
Payment processing (3%): €7,860
Team (5 people): €150,000
Marketing: €30,000
Other: €20,000

Total Costs: €242,860

Net Profit: €19,140 (7% margin)
```

---

### **Year 2 (2,000 farmers)**

**Revenue: €1,048,000**
- Success fees: €320,000
- Supplier commissions: €48,000
- Subscriptions: €480,000
- Data licensing: €100,000
- Certification services: €100,000

**Costs: €620,000**
- Net profit: €428,000 (41% margin)

---

### **Year 3 (10,000 farmers)**

**Revenue: €5,240,000**
- Success fees: €1,600,000
- Supplier commissions: €240,000
- Subscriptions: €2,400,000
- Data licensing: €500,000
- Certification services: €300,000
- Insurance partnerships: €200,000

**Costs: €2,100,000**
- Net profit: €3,140,000 (60% margin)

---

## 🎯 Pricing Experiments

### **Experiment 1: Fee Percentage**

**Test:** 2.5% vs. 3% vs. 2%
- **Hypothesis:** 2.5% is optimal (high enough for us, low enough for farmers)
- **Metric:** Conversion rate, NPS, revenue
- **Duration:** 3 months
- **Sample:** 300 farmers (100 per group)

---

### **Experiment 2: Minimum Threshold**

**Test:** €500 vs. €1,000 vs. €1,500 minimum value saved
- **Hypothesis:** €1,000 balances volume and quality
- **Metric:** Cases charged, farmer satisfaction, profitability
- **Duration:** 3 months

---

### **Experiment 3: Payment Terms**

**Test:** Pay now (5% discount) vs. Pay at harvest vs. Installments
- **Hypothesis:** Most farmers prefer pay at harvest
- **Metric:** Payment method selection, non-payment rate, cash flow
- **Duration:** 6 months

---

## 🦜 The Lorikeet Standard

**Lorikeet's pricing:**
- Charge only for resolutions
- Align incentives with customer success
- Transparent, simple pricing
- No hidden fees

**Our pricing:**
- Charge only when crops saved
- Align incentives with farmer success
- Transparent, simple pricing (2.5% of value saved)
- No hidden fees

**Same philosophy. Same trust. Same results.**

---

## 🎯 Pricing Principles

### **1. Outcomes Over Inputs**
- ❌ Charge per diagnosis
- ✅ Charge per crop saved

### **2. Aligned Incentives**
- ❌ We profit when farmers use more (misaligned)
- ✅ We profit when farmers succeed (aligned)

### **3. Transparent & Simple**
- ❌ Complex pricing tiers, hidden fees
- ✅ Simple: 2.5% of value saved

### **4. Low Risk for Farmers**
- ❌ Upfront payment (risk if doesn't work)
- ✅ Pay only if crop saved (no risk)

### **5. Fair Value Exchange**
- ❌ Charge €100 to save €200 (50% value capture)
- ✅ Charge €50 to save €2,000 (2.5% value capture)

---

🌿 **Charge for outcomes. Align incentives. Create trust. Win customers.**
