# 🚀 LeafScan AI: Implementation Roadmap
## From Demo to Killer Product - Technical Execution Plan

*Transforming vision into production-ready code*

---

## 🎯 Overview

**Goal**: Transform LeafScan AI from hackathon demo to production-grade platform following Lorikeet's philosophy

**Timeline**: 12 weeks to MVP, 24 weeks to scale

**Success Criteria**: 80% resolution rate, <2hr time-to-action, €10k MRR

---

## 📊 Current State Assessment

### **What We Have ✅**
- Gemini 3 integration (diagnosis)
- Bounding box detection
- Treatment planning (basic)
- AI chat interface
- Mobile-responsive UI
- Mock supplier data
- PDF export

### **What's Missing ❌**
- Real supplier integrations
- Reservation system
- Payment processing
- Outcome verification
- Compliance database
- Weather integration
- SMS/WhatsApp notifications
- Metrics tracking
- Value-based pricing

### **Technical Debt 🔧**
- Mock data everywhere (suppliers, maps)
- No database (localStorage only)
- No authentication (basic only)
- No API rate limiting
- No error monitoring
- No analytics
- Demo-quality code (not production)

---

## 🏗️ Architecture Transformation

### **Current Architecture (Demo)**
```
User → Next.js App → Gemini API → Mock Data → UI
```

### **Target Architecture (Production)**
```
User → Next.js App → API Gateway → Microservices
                         ↓
                    [Auth Service]
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   [AI Service]    [Supplier API]   [Payment API]
        ↓                ↓                ↓
   Gemini 3        Supplier DB      Stripe/Paystack
        ↓                ↓                ↓
   [Compliance]    [Weather API]   [Notification]
        ↓                ↓                ↓
    EU Regs DB      OpenWeather     Twilio/WhatsApp
        ↓                ↓                ↓
   [Analytics] ←── [Metrics DB] ──→ [Audit Log]
```

---

## 📅 Week-by-Week Plan

## **PHASE 1: FOUNDATION (Weeks 1-4)**

### **Week 1: Database & Auth**

#### **Goals**
- Replace localStorage with PostgreSQL
- Implement proper authentication
- Set up production infrastructure

#### **Tasks**

**1.1 Database Setup**
- [ ] Set up Supabase/PostgreSQL database
- [ ] Design schema:
  ```sql
  -- Users
  CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    name VARCHAR(255),
    farm_location JSONB,
    created_at TIMESTAMP
  );

  -- Diagnoses
  CREATE TABLE diagnoses (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    image_url TEXT,
    analysis JSONB,
    created_at TIMESTAMP,
    status VARCHAR(50) -- pending, treated, verified, resolved
  );

  -- Treatments
  CREATE TABLE treatments (
    id UUID PRIMARY KEY,
    diagnosis_id UUID REFERENCES diagnoses(id),
    supplier_id UUID,
    product_name VARCHAR(255),
    cost DECIMAL(10,2),
    reserved_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    applied_at TIMESTAMP
  );

  -- Suppliers
  CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    location GEOGRAPHY(POINT),
    products JSONB,
    certifications JSONB,
    rating DECIMAL(3,2),
    verified BOOLEAN
  );

  -- Outcomes
  CREATE TABLE outcomes (
    id UUID PRIMARY KEY,
    diagnosis_id UUID REFERENCES diagnoses(id),
    crop_saved_percentage INTEGER,
    value_saved DECIMAL(10,2),
    resolution_confirmed BOOLEAN,
    verified_at TIMESTAMP
  );
  ```
- [ ] Set up migrations
- [ ] Create seed data (verified suppliers)

**1.2 Authentication**
- [ ] Implement NextAuth.js or Supabase Auth
- [ ] Add phone verification (SMS OTP)
- [ ] Create user profile management
- [ ] Add farm profile setup

**1.3 Infrastructure**
- [ ] Set up Vercel/Railway for hosting
- [ ] Configure environment variables
- [ ] Set up staging environment
- [ ] Configure CDN for images

**Deliverable**: Production database + auth system

---

### **Week 2: Supplier Integration MVP**

#### **Goals**
- Replace mock supplier data with real database
- Build supplier verification system
- Create distance-based search

#### **Tasks**

**2.1 Supplier Database**
- [ ] Manually verify 10 suppliers in Casablanca
  - Call each supplier
  - Verify certifications (Ecocert, etc.)
  - Confirm product availability
  - Get pricing, hours, contact info
- [ ] Add to database with geolocation
- [ ] Create admin panel for supplier management

**2.2 Supplier Search API**
- [ ] Build `/api/suppliers/search` endpoint
  ```typescript
  // Input: { location: {lat, lng}, products: ['neem oil'], radius: 20km }
  // Output: Sorted list of suppliers with distance, stock, pricing
  ```
- [ ] Implement PostGIS for geospatial queries
- [ ] Add filtering (organic only, in-stock, open now)
- [ ] Cache results (Redis) for performance

**2.3 Supplier Verification**
- [ ] Create verification checklist
  - Business license
  - Organic certification
  - Product authenticity
  - Farmer reviews
- [ ] Add verification badge to UI
- [ ] Build trust indicators (rating, review count)

**Deliverable**: Real supplier search with 10 verified suppliers

---

### **Week 3: Reservation System**

#### **Goals**
- Enable users to reserve products
- Integrate with suppliers (manual first)
- Track reservation lifecycle

#### **Tasks**

**3.1 Reservation Backend**
- [ ] Create `/api/reservations/create` endpoint
- [ ] Build reservation state machine:
  ```
  created → confirmed → picked_up → expired → cancelled
  ```
- [ ] Add expiration logic (6 hours default)
- [ ] Send confirmation to user + supplier

**3.2 Supplier Communication**
- [ ] Manual process (we call/SMS supplier)
- [ ] Create supplier dashboard (simple)
  - View incoming reservations
  - Confirm/reject
  - Mark as picked up
- [ ] Build notification system (SMS to supplier)

**3.3 User Experience**
- [ ] Add "Reserve" button to supplier cards
- [ ] Show reservation status (pending, confirmed)
- [ ] Add pickup instructions (map, code, contact)
- [ ] Send reminder SMS (4 hours before expiry)

**Deliverable**: Working reservation system (manual supplier confirmation)

---

### **Week 4: Outcome Tracking**

#### **Goals**
- Measure if treatments actually work
- Build follow-up photo system
- Calculate resolution rate

#### **Tasks**

**4.1 Follow-up System**
- [ ] Create `/api/followup/request` endpoint
- [ ] Schedule follow-up prompts:
  - Day 3: "Upload photo to verify treatment working"
  - Day 7: "Second application reminder"
  - Day 14: "Final verification"
- [ ] Send SMS/push notifications

**4.2 Photo Comparison AI**
- [ ] Build before/after comparison
  ```typescript
  // Compare Day 1 vs Day 3 photos
  // Count infection sites, measure spread
  // Determine if treatment is working
  ```
- [ ] Use Gemini 3 for analysis
- [ ] Show visual diff (highlight changes)

**4.3 Resolution Verification**
- [ ] Ask farmer: "Did treatment save your crop?"
- [ ] Calculate value saved (crop value × % saved)
- [ ] Store outcome in database
- [ ] Generate resolution report

**4.4 Metrics Dashboard**
- [ ] Build admin dashboard
- [ ] Show key metrics:
  - Resolution rate (% crops saved)
  - Time to action (upload → treatment)
  - Economic impact (€ saved)
  - User satisfaction (NPS)
- [ ] Track by crop type, region, supplier

**Deliverable**: Outcome tracking system + metrics dashboard

---

## **PHASE 2: SPECIALIZATION (Weeks 5-8)**

### **Week 5: Compliance Database**

#### **Goals**
- Build EU pesticide compliance checker
- Ensure organic certification safety
- Add regulatory guardrails

#### **Tasks**

**5.1 EU Pesticide Database**
- [ ] Scrape/import EU pesticide database
  - Approved substances (Reg. 1107/2009)
  - Banned substances
  - MRL limits (Maximum Residue Levels)
  - PHI (Pre-Harvest Intervals)
- [ ] Create compliance API
  ```typescript
  // Input: { substance: 'neem oil', crop: 'tomato', country: 'Morocco', export: 'EU' }
  // Output: { approved: true, mrl: '0.1 ppm', phi: '3 days', notes: '...' }
  ```

**5.2 Organic Certification**
- [ ] Add organic certification rules
  - Ecocert standards
  - USDA Organic
  - EU Organic (Reg. 889/2008)
- [ ] Check treatment compatibility
- [ ] Flag non-compliant recommendations

**5.3 Treatment Validation**
- [ ] Add compliance check to diagnosis flow
- [ ] Filter out banned substances
- [ ] Show only certified organic options (if user is organic farmer)
- [ ] Add compliance badges to treatments

**5.4 Traceability**
- [ ] Log every treatment recommendation
- [ ] Generate compliance reports (PDF)
- [ ] Create audit trail (immutable log)
- [ ] Add export documentation

**Deliverable**: Compliance system for EU export crops

---

### **Week 6: Weather Integration**

#### **Goals**
- Optimize application timing based on weather
- Add weather-based alerts
- Improve treatment success rate

#### **Tasks**

**6.1 Weather API Integration**
- [ ] Integrate OpenWeatherMap or WeatherAPI
- [ ] Get current conditions + 7-day forecast
- [ ] Store weather data for analysis

**6.2 Application Timing**
- [ ] Calculate optimal spray windows
  ```typescript
  // Ideal: No rain, <25°C, <15km/h wind, evening
  // Good: No rain, <30°C, <20km/h wind
  // Bad: Rain expected, >30°C, >25km/h wind
  ```
- [ ] Show timing recommendations
- [ ] Send alerts: "Rain in 6 hours—apply now!"

**6.3 Weather-Adaptive Plans**
- [ ] Adjust 14-day plans based on forecast
- [ ] Reschedule if rain expected
- [ ] Add weather notes to each step

**Deliverable**: Weather-optimized treatment scheduling

---

### **Week 7: Payment Processing**

#### **Goals**
- Implement value-based pricing
- Process success fees
- Support multiple payment methods

#### **Tasks**

**7.1 Payment Integration**
- [ ] Integrate Stripe (international cards)
- [ ] Integrate Paystack (mobile money in Africa)
- [ ] Add payment methods:
  - Credit/debit cards
  - Mobile money (M-Pesa, Orange Money)
  - Bank transfer
  - Pay-at-harvest (invoice)

**7.2 Success Fee Calculation**
- [ ] Calculate value saved:
  ```typescript
  // value_saved = crop_value × (% saved - % lost without treatment)
  // fee = value_saved × 0.025 (2.5%)
  ```
- [ ] Show breakdown to user
- [ ] Allow user to confirm/dispute

**7.3 Billing Flow**
- [ ] Trigger payment after outcome verification
- [ ] Send invoice (PDF)
- [ ] Handle payment failures (retry, reminders)
- [ ] Offer subscription option (€200/month unlimited)

**7.4 Revenue Tracking**
- [ ] Track MRR (Monthly Recurring Revenue)
- [ ] Calculate LTV (Lifetime Value)
- [ ] Monitor churn rate
- [ ] Build revenue dashboard

**Deliverable**: Working payment system with success-based pricing

---

### **Week 8: Notification System**

#### **Goals**
- Send timely reminders and alerts
- Support SMS and WhatsApp
- Improve user engagement

#### **Tasks**

**8.1 SMS Integration**
- [ ] Integrate Twilio or Africa's Talking
- [ ] Send notifications:
  - Reservation confirmed
  - Pickup reminder (4 hours before expiry)
  - Application reminder (30 min before optimal time)
  - Follow-up photo request (Day 3, 7, 14)
  - Payment invoice

**8.2 WhatsApp Integration**
- [ ] Set up WhatsApp Business API
- [ ] Send rich messages (images, buttons)
- [ ] Enable two-way chat (farmer can reply)

**8.3 Push Notifications**
- [ ] Add web push notifications
- [ ] Request permission on first visit
- [ ] Send critical alerts (weather, stock)

**8.4 Notification Preferences**
- [ ] Let users choose channels (SMS, WhatsApp, push)
- [ ] Set quiet hours (no notifications 10 PM - 6 AM)
- [ ] Frequency control (urgent only, all updates)

**Deliverable**: Multi-channel notification system

---

## **PHASE 3: HIGH AGENCY (Weeks 9-12)**

### **Week 9: Proactive AI Agent**

#### **Goals**
- Upgrade from passive to active AI
- Enable AI to take actions
- Build decision-making framework

#### **Tasks**

**9.1 Agent Architecture**
- [ ] Design agent decision tree
  ```
  Diagnosis → Risk Assessment → Action Selection → User Confirmation → Execution
  ```
- [ ] Define agent capabilities:
  - Can: Reserve products, schedule reminders, send alerts
  - Cannot: Make payments without confirmation, apply treatments

**9.2 Proactive Actions**
- [ ] Auto-trigger supplier search on diagnosis
- [ ] Auto-reserve best option (with user confirmation)
- [ ] Auto-schedule application (based on weather)
- [ ] Auto-request follow-up photos

**9.3 User Preferences**
- [ ] Let users set boundaries:
  - Budget max (€50)
  - Treatment preference (organic only)
  - Auto-reserve (yes/no)
  - Communication style (concise/detailed)
- [ ] AI operates within bounds

**9.4 Explainability**
- [ ] Show reasoning for every action
  - "I reserved this because: closest, in stock, best price"
- [ ] Allow user to override
- [ ] Learn from overrides

**Deliverable**: High-agency AI that takes actions (with guardrails)

---

### **Week 10: Supplier API Integration**

#### **Goals**
- Automate supplier communication
- Real-time inventory checks
- Instant reservations

#### **Tasks**

**10.1 Supplier API Development**
- [ ] Build simple API for suppliers
  ```
  GET /inventory → List products + stock
  POST /reserve → Create reservation
  PUT /reserve/:id/confirm → Confirm pickup
  ```
- [ ] Provide supplier dashboard (web app)
- [ ] Onboard 5 suppliers to API

**10.2 Real-Time Inventory**
- [ ] Check stock before showing supplier
- [ ] Hide out-of-stock options
- [ ] Show "Low stock" warnings

**10.3 Instant Reservations**
- [ ] Auto-confirm reservations (no manual step)
- [ ] Send confirmation to both parties
- [ ] Handle conflicts (double-booking)

**10.4 Supplier Analytics**
- [ ] Track supplier performance:
  - Reservation → pickup rate
  - Average pickup time
  - Product quality (farmer ratings)
  - Stock accuracy
- [ ] Rank suppliers by performance
- [ ] Reward top suppliers (featured placement)

**Deliverable**: Automated supplier integration (5 suppliers on API)

---

### **Week 11: Advanced Features**

#### **Goals**
- Add power-user features
- Improve retention
- Increase LTV

#### **Tasks**

**11.1 Multi-Crop Tracking**
- [ ] Let farmers track multiple crops
- [ ] Show crop health dashboard
- [ ] Alert on issues across all crops

**11.2 Seasonal Planning**
- [ ] Build planting calendar
- [ ] Predict disease risks by season
- [ ] Recommend preventive treatments

**11.3 Community Features**
- [ ] Local disease alerts
  - "3 farmers in your area reported blight this week"
- [ ] Supplier reviews (farmers rate suppliers)
- [ ] Success stories (case studies)

**11.4 Export Tools**
- [ ] Generate compliance reports
- [ ] Create traceability documents
- [ ] Integrate with buyer platforms

**Deliverable**: Advanced features for power users

---

### **Week 12: Scale & Optimize**

#### **Goals**
- Achieve 80% resolution rate
- Reach €10k MRR
- Prepare for scale

#### **Tasks**

**12.1 Performance Optimization**
- [ ] Optimize API response times (<500ms)
- [ ] Add caching (Redis)
- [ ] Compress images (WebP)
- [ ] Lazy load components

**12.2 Reliability**
- [ ] Add error monitoring (Sentry)
- [ ] Set up uptime monitoring (Pingdom)
- [ ] Build retry logic for failed API calls
- [ ] Add graceful degradation (offline mode)

**12.3 Security**
- [ ] Add rate limiting (prevent abuse)
- [ ] Implement CSRF protection
- [ ] Encrypt sensitive data
- [ ] Regular security audits

**12.4 Analytics**
- [ ] Integrate Mixpanel/Amplitude
- [ ] Track user journey (funnel analysis)
- [ ] A/B test key features
- [ ] Build retention cohorts

**12.5 Customer Success**
- [ ] Create onboarding flow (first-time users)
- [ ] Build help center (FAQs, guides)
- [ ] Add in-app chat support
- [ ] Monitor NPS (Net Promoter Score)

**Deliverable**: Production-ready platform at scale

---

## 📊 Success Metrics by Phase

### **Phase 1 (Weeks 1-4): Foundation**
- [ ] 10 verified suppliers in database
- [ ] 50 users signed up
- [ ] 20 diagnoses completed
- [ ] 10 reservations made
- [ ] 5 outcomes verified
- [ ] 60% resolution rate (baseline)

### **Phase 2 (Weeks 5-8): Specialization**
- [ ] 100% EU compliance on recommendations
- [ ] 100 users
- [ ] 80 diagnoses
- [ ] 50 reservations
- [ ] 30 outcomes verified
- [ ] 70% resolution rate
- [ ] €1k MRR

### **Phase 3 (Weeks 9-12): High Agency**
- [ ] 500 users
- [ ] 300 diagnoses
- [ ] 200 reservations
- [ ] 150 outcomes verified
- [ ] 80% resolution rate ✅
- [ ] <2hr time-to-action ✅
- [ ] €10k MRR ✅
- [ ] NPS >70 ✅

---

## 🛠️ Technical Stack

### **Frontend**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- React Query (data fetching)
- Zustand (state management)

### **Backend**
- Next.js API Routes
- PostgreSQL (Supabase)
- Redis (caching)
- PostGIS (geospatial)

### **AI/ML**
- Gemini 3 Pro (diagnosis)
- Gemini 3 Flash (chat, planning)
- Custom models (outcome verification)

### **Integrations**
- Stripe (payments)
- Paystack (mobile money)
- Twilio (SMS)
- WhatsApp Business API
- OpenWeatherMap (weather)
- Google Maps (navigation)

### **Infrastructure**
- Vercel (hosting)
- Supabase (database + auth)
- Cloudflare (CDN)
- Sentry (error monitoring)
- Mixpanel (analytics)

---

## 🚨 Risk Mitigation

### **Technical Risks**

**Risk**: Supplier API adoption is slow
- **Mitigation**: Start with manual process, gradually automate

**Risk**: Gemini 3 API costs too high
- **Mitigation**: Use Flash for non-critical tasks, cache results

**Risk**: SMS costs exceed budget
- **Mitigation**: Prioritize WhatsApp (cheaper), batch notifications

### **Business Risks**

**Risk**: Farmers don't pay success fees
- **Mitigation**: Offer pay-at-harvest, build trust with free tier

**Risk**: Resolution rate <80%
- **Mitigation**: Manual intervention for struggling cases, improve AI

**Risk**: Supplier partnerships fail
- **Mitigation**: Diversify suppliers, build direct relationships

---

## 🎯 Definition of Done

**A feature is "done" when:**
1. ✅ Code is production-quality (tested, documented)
2. ✅ Metrics are tracked (how do we measure success?)
3. ✅ User can complete end-to-end flow (no manual steps)
4. ✅ Error handling is robust (graceful failures)
5. ✅ Compliance is verified (legal, safe, ethical)
6. ✅ Performance is acceptable (<2s load time)
7. ✅ Mobile works (responsive design)
8. ✅ Deployed to production (not just staging)

**No half-finished features. Ship complete solutions.**

---

## 🦜 The Lorikeet Standard

**Every week, ask:**
1. Did we increase resolution rate?
2. Did we reduce time-to-action?
3. Did we create value for farmers?
4. Did we charge for outcomes (not inputs)?
5. Did we deepen our specialization?

**If not, we're off track.**

---

## 🚀 Let's Build

**This is the roadmap from demo to killer product.**

Week by week. Feature by feature. Metric by metric.

**Start with Week 1. Ship by Week 12.**

🌿 **From code to crops saved. From vision to reality.**
