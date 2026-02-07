# 🧪 Advanced Map Features - Testing Guide

## Pre-Testing Checklist

### ✅ Environment Setup
```bash
# Verify API keys are set
cat .env.local | grep -E "GEMINI_API_KEY|GOOGLE_MAPS_KEY"

# Expected output:
# GEMINI_API_KEY=AIzaSy...
# NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...

# Verify server is running
curl http://localhost:3000/api/map-query -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"test","location":{"lat":33.5731,"lng":-7.5898}}'
```

---

## 🎯 Test Scenarios

### 1. Natural Language Query Processing

#### Test 1.1: Equipment Search
**Query:** "Where can I buy tractor parts?"

**Expected Results:**
- ✅ AI insight appears: "🧠 AI analyzing your request globally..."
- ✅ Results panel slides in from left
- ✅ Shows 5-10 equipment dealers
- ✅ Markers are numbered and color-coded
- ✅ Priority badges visible (High/Medium)
- ✅ Distance calculated from your location

**What to Check:**
- [ ] Search completes in <3 seconds
- [ ] At least 3 results returned
- [ ] Results sorted by priority then distance
- [ ] Click marker opens info window
- [ ] Click result in panel zooms to location

---

#### Test 1.2: Emergency Query
**Query:** "Emergency vet for cattle"

**Expected Results:**
- ✅ Critical priority markers (RED, bouncing)
- ✅ "CRITICAL" badges in results
- ✅ Open/closed status shown
- ✅ Phone numbers clickable
- ✅ Larger search radius (up to 100km)

**What to Check:**
- [ ] Critical results appear first
- [ ] Red markers with animation
- [ ] AI insight explains urgency
- [ ] Suggestions include "Call ahead"

---

#### Test 1.3: Multi-Category Query
**Query:** "Find fungicide and irrigation equipment"

**Expected Results:**
- ✅ Mixed categories in results
- ✅ Each place categorized correctly
- ✅ AI insight explains both needs
- ✅ Suggestions panel appears

**What to Check:**
- [ ] Both product types represented
- [ ] Categories labeled accurately
- [ ] AI reasoning makes sense

---

### 2. Voice Input Testing

#### Test 2.1: Basic Voice Command
**Steps:**
1. Click microphone icon
2. Wait for red pulse animation
3. Say: "Nearest agricultural supply store"
4. Wait for transcription

**Expected Results:**
- ✅ Mic icon turns red and pulses
- ✅ AI insight shows "🎤 Listening..."
- ✅ Transcribed text appears in search bar
- ✅ Search executes automatically
- ✅ Voice indicator turns off

**What to Check:**
- [ ] Browser asks for microphone permission (first time)
- [ ] Clear visual feedback while listening
- [ ] Accurate transcription
- [ ] Graceful error if unsupported browser

---

#### Test 2.2: Complex Voice Query
**Say:** "I need fertilizer and seeds within twenty kilometers"

**Expected Results:**
- ✅ Correctly interprets "twenty kilometers" as 20km
- ✅ Understands compound request (fertilizer + seeds)
- ✅ Restricts search radius appropriately

---

### 3. Quick Category Filters

#### Test 3.1: Equipment Category
**Steps:**
1. Click orange "Equipment" button
2. Observe results

**Expected Results:**
- ✅ Button highlights in orange
- ✅ Search executes: "tractor repair parts dealers"
- ✅ Equipment-related results only
- ✅ Category remains selected

**Test all 6 categories:**
- [ ] 🚜 Equipment (orange)
- [ ] 🌱 Inputs (green)
- [ ] ❤️ Livestock (red)
- [ ] 🏪 Markets (blue)
- [ ] 🔧 Services (purple)
- [ ] ⚡ Emergency (dark red)

---

### 4. Results Panel Interaction

#### Test 4.1: Result Selection
**Steps:**
1. Perform any search
2. Click result #2 in left panel
3. Observe map behavior

**Expected Results:**
- ✅ Result highlights in green
- ✅ Map pans to location
- ✅ Map zooms to 15
- ✅ Info window opens on marker
- ✅ Scroll position maintained in results

---

#### Test 4.2: Close Results Panel
**Steps:**
1. Search for something
2. Click X in results panel header
3. Panel should slide out

**Expected Results:**
- ✅ Smooth slide-out animation
- ✅ Legend returns to bottom-left
- ✅ Markers remain on map
- ✅ Can re-open by searching again

---

### 5. Priority-Based Markers

#### Test 5.1: Visual Hierarchy
**Query:** "Emergency repair service"

**Visual Checks:**
- [ ] Critical markers: RED, bouncing, white number
- [ ] High markers: ORANGE, static, white number
- [ ] Medium markers: GREEN, static, white number
- [ ] Low markers: BLUE, static, white number
- [ ] All markers numbered sequentially
- [ ] User location: BLUE circle, no number

---

### 6. Route Visualization

#### Test 6.1: Route Request
**Query:** "Route to grain silo then fuel station"

**Expected Results:**
- ✅ AI detects route intent
- ✅ Green polyline connects waypoints
- ✅ Direction arrows on path
- ✅ Route panel appears (if implemented)
- ✅ Total distance/duration shown

---

### 7. AI Suggestions Panel

#### Test 7.1: Suggestions Appear
**Query:** "Organic fertilizer"

**Expected Results:**
- ✅ Panel slides up from bottom-right
- ✅ Brain icon visible
- ✅ 2-3 actionable suggestions
- ✅ Examples:
  - "Try certified organic stores"
  - "Check product certifications"
  - "Expand radius to 50km"

**What to Check:**
- [ ] Suggestions relevant to query
- [ ] Maximum 3-4 suggestions
- [ ] Clear, actionable language

---

### 8. Info Window Details

#### Test 8.1: Complete Information
**Steps:**
1. Search and click any marker
2. Review info window

**Required Fields:**
- [ ] Name (bold, prominent)
- [ ] Open/Closed status badge
- [ ] Address (full, readable)
- [ ] Category tag (colored)
- [ ] Rating & review count (if available)
- [ ] AI description (italic, with brain icon)
- [ ] Phone number (clickable)
- [ ] Website link (opens new tab)
- [ ] Stock level indicator
- [ ] "Reserve Item" button

---

#### Test 8.2: Reserve Functionality
**Steps:**
1. Click "Reserve Item"
2. Wait for animation
3. Observe success state

**Expected Behavior:**
- ✅ Button shows loading spinner
- ✅ Text: "Contacting Supplier..."
- ✅ After 1.5s: Green background
- ✅ Text: "Reservation Sent!"
- ✅ Check icon appears
- ✅ Auto-closes after 2s

---

### 9. Map Controls & Overlays

#### Test 9.1: View Mode Toggle
**Steps:**
1. Click "Satellite" button
2. Click "Map" button
3. Toggle back

**Expected Results:**
- ✅ Satellite view: Aerial imagery
- ✅ Map view: Road map with simplified POIs
- ✅ Smooth transition between modes
- ✅ Active button highlighted

---

#### Test 9.2: Weather Layers
**Steps:**
1. Click weather overlay buttons
2. Test all 4 layers

**Note:** Overlays are placeholders - just verify UI works
- [ ] Radar button toggles
- [ ] Wind button toggles
- [ ] Temp button toggles
- [ ] Humidity button toggles
- [ ] Selected layer highlighted in green

---

### 10. Global Location Support

#### Test 10.1: Different Regions
**Test Queries in Different Locations:**

**Morocco (Casablanca):**
- Query: "Magasin d'équipement agricole"
- Expected: Local results in French/Arabic

**USA (Iowa):**
- Center: `41.8780, -93.0977`
- Query: "John Deere dealer"
- Expected: Midwest dealerships

**Vietnam (Hanoi):**
- Center: `21.0285, 105.8542`
- Query: "rice seed supplier"
- Expected: Asian agricultural stores

---

### 11. Error Handling

#### Test 11.1: No Results
**Query:** "Quantum tractor repair spaceship"

**Expected Results:**
- ✅ AI insight: "No suppliers found..."
- ✅ Suggestions appear:
  - "Try alternative search terms"
  - "Expand search radius"
  - "Check nearby towns"
- ✅ No markers on map
- ✅ Empty state in results panel

---

#### Test 11.2: API Failure
**Steps:**
1. Stop backend server temporarily
2. Try search
3. Observe fallback

**Expected Results:**
- ✅ Graceful error message
- ✅ No crash
- ✅ Retry suggestion
- ✅ Previous results remain (if any)

---

#### Test 11.3: Invalid Voice Input
**Steps:**
1. Click mic
2. Mumble or make no sound
3. Wait for timeout

**Expected Results:**
- ✅ "Voice input failed" message
- ✅ Prompt to type instead
- ✅ Mic icon returns to normal

---

### 12. Performance Testing

#### Test 12.1: Response Time
**Metrics to Track:**
- [ ] Voice transcription: <1s
- [ ] AI query processing: <2s
- [ ] Place search: <1s
- [ ] Map rendering: <500ms
- [ ] Total end-to-end: <3s

**Tools:**
```bash
# Use browser DevTools Network tab
# Check timing for /api/map-query
```

---

#### Test 12.2: Load Testing
**Steps:**
1. Perform 10 searches rapidly
2. Check for memory leaks
3. Verify smooth performance

**Checks:**
- [ ] No lag after multiple searches
- [ ] Markers clear properly
- [ ] Memory usage stable
- [ ] No console errors

---

### 13. Mobile Responsiveness

#### Test 13.1: Mobile View
**Steps:**
1. Open DevTools
2. Switch to mobile viewport (375x667)
3. Test core features

**Mobile-Specific Checks:**
- [ ] Search bar fills width
- [ ] Voice button accessible
- [ ] Category pills horizontally scrollable
- [ ] Results panel slides over map (not beside)
- [ ] Info windows sized appropriately
- [ ] Touch targets >44px

---

### 14. Accessibility

#### Test 14.1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Test Enter on buttons
3. Verify focus indicators

**Checks:**
- [ ] All buttons focusable
- [ ] Clear focus rings visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals

---

#### Test 14.2: Screen Reader
**Use NVDA/JAWS:**
- [ ] Search input labeled
- [ ] Buttons have aria-labels
- [ ] Results announced
- [ ] Status updates vocalized

---

## 🐛 Known Issues & Workarounds

### Issue 1: Voice Not Working
**Cause:** Browser doesn't support Web Speech API  
**Workaround:** Use Chrome/Edge, type instead  
**Fix:** Show alert explaining limitation

---

### Issue 2: Slow First Load
**Cause:** Google Maps & Gemini initialization  
**Workaround:** Patient for 2-3s  
**Fix:** Optimize imports, add preconnect

---

### Issue 3: API Rate Limit
**Cause:** Too many requests to Gemini  
**Workaround:** Wait 60s, retry  
**Fix:** Implement request caching

---

## ✅ Final Acceptance Criteria

### Critical Features (Must Work):
- [x] Natural language queries processed correctly
- [x] Voice input functional (Chrome/Edge)
- [x] Category quick filters execute
- [x] Results display with priorities
- [x] Markers color-coded by priority
- [x] Info windows show complete data
- [x] Map pans/zooms to selections
- [x] Suggestions panel appears
- [x] Mobile responsive

### Nice-to-Have (Should Work):
- [ ] Route polylines rendered
- [ ] Multi-language queries
- [ ] Offline fallback
- [ ] Export results to PDF
- [ ] Share link to search

---

## 📊 Test Results Template

```
Date: _________
Tester: _________
Browser: Chrome/Firefox/Safari/Edge
Device: Desktop/Mobile/Tablet

| Test ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| 1.1 | Equipment Search | ✅/❌ | |
| 2.1 | Voice Input | ✅/❌ | |
| 3.1 | Category Filter | ✅/❌ | |
| ... | ... | ... | |

Overall Score: __/50 tests passed
```

---

## 🚀 Ready for Production?

### Checklist Before Deploy:
- [ ] All critical tests pass
- [ ] No console errors
- [ ] Mobile tested on real device
- [ ] API keys secured (not in git)
- [ ] Performance under 3s
- [ ] Accessibility score >90
- [ ] Error handling graceful
- [ ] Documentation complete

**If all checked → DEPLOY! 🎉**
