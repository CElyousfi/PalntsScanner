# Batch-Aware Analysis Testing Guide

## 🧪 **Quick Start Testing**

### **1. Start the Development Server**
```bash
cd /home/kali/code/NoSignLeftBehind/leafscan-ai
npm run dev
```
Server will run at: http://localhost:3000

### **2. Navigate to Scan Page**
- Go to Dashboard → Scan
- Choose between "Leaf Scan" or "Crop Scan"

### **3. Test Scenarios**

#### **Scenario A: Numbered Fruit Batch**
**Goal**: Test batch detection with numbered items

1. Upload image with numbered fruits (#1, #2, #3...)
2. Wait for analysis
3. **Expected Results**:
   - ✅ Batch summary card appears
   - ✅ Individual item cards show (one per numbered fruit)
   - ✅ Image overlay shows numbered badges
   - ✅ Clicking card highlights corresponding number on image
   - ✅ Colors match severity (red/orange/green)

**Success Criteria**:
- All numbered items detected
- Batch statistics show total count
- Each card has detailed description
- Highlight sync works

---

#### **Scenario B: Leaf Batch Analysis**
**Goal**: Test leaf scan with multiple lesions

1. Upload leaf image with visible defects
2. Select "Leaf Scan" mode
3. **Expected Results**:
   - ✅ Scene description mentions environment
   - ✅ Individual lesion cards appear
   - ✅ Each defect has % surface affected
   - ✅ Predominant issues listed
   - ✅ Treatment recommendations provided

**Success Criteria**:
- Lesions accurately located
- Quantitative data (percentages)
- Evidence-based descriptions
- No hallucinated details

---

#### **Scenario C: High-Quality Batch**
**Goal**: Test healthy/high-grade analysis

1. Upload image of premium quality produce
2. **Expected Results**:
   - ✅ Batch grade: "USDA Fancy" or "Class I"
   - ✅ Individual items show green cards
   - ✅ Minimal or no defects listed
   - ✅ High uniformity score
   - ✅ Positive overall assessment

**Success Criteria**:
- Grade accurately reflects quality
- No false positive defects
- Batch summary is positive

---

#### **Scenario D: Mixed Quality Batch**
**Goal**: Test varied severity detection

1. Upload batch with mix of good/bad items
2. **Expected Results**:
   - ✅ Color-coded cards (mix of red/orange/green)
   - ✅ Defect distribution shows variety
   - ✅ Uniformity scored as "Mixed" or "Variable"
   - ✅ Predominant issues correctly identified
   - ✅ Each item graded independently

**Success Criteria**:
- Accurate per-item grading
- Realistic batch statistics
- Useful recommendations

---

## 🔍 **Visual Testing Checklist**

### **Batch Summary Card**
- [ ] Card renders at top of results
- [ ] Scene description is detailed
- [ ] Batch summary is concise
- [ ] Health score / grade shown
- [ ] Total items count is correct
- [ ] Uniformity assessment makes sense
- [ ] Predominant issues are relevant

### **Individual Item Cards**
- [ ] Cards display in responsive grid
- [ ] Numbered badges match image
- [ ] Colors correctly represent severity
- [ ] Expand/collapse works smoothly
- [ ] Defects list is detailed
- [ ] Click triggers image highlight
- [ ] Hover effects work
- [ ] Position metadata (if available) shown

### **Image Overlays**
- [ ] Numbered badges appear on image
- [ ] Colors match card colors
- [ ] Badges centered correctly
- [ ] Highlight pulse animation works
- [ ] Lightbox preserves overlays
- [ ] Zoom functionality intact
- [ ] No flickering or layout shifts

### **Interactive Features**
- [ ] Click card → Image badge pulses
- [ ] Auto-dismiss after 3 seconds
- [ ] Lightbox opens/closes smoothly
- [ ] Responsive on mobile/tablet
- [ ] No console errors

---

## 🐛 **Debugging Tips**

### **If No Batch Summary Appears**
1. Check browser console for errors
2. Verify API response contains `overall_scene` and `batch_summary`
3. Check Network tab: Look at `/api/analyze-surgical` response
4. Ensure model is `gemini-3-pro-preview` not demo mode

**Fix**: Check if API key is valid in `.env.local`

---

### **If Individual Items Missing**
1. Check if API response has `individual_items` array
2. Verify `individual_items` is not empty
3. Check component conditional: `result.individual_items && result.individual_items.length > 0`

**Fix**: Ensure Gemini is returning structured JSON with `individual_items`

---

### **If Overlays Not Showing**
1. Check if items have `center_point` or `bbox`
2. Verify coordinates are normalized (0-1 range)
3. Check SVG rendering in browser DevTools

**Fix**: Add fallback center calculation from bbox

---

### **If Colors Are Wrong**
1. Check `item.grade_or_severity` value
2. Verify color logic in `getSeverityColor()` function
3. Test with different grade strings

**Fix**: Update color mapping in `IndividualItemCard.tsx` line 27-52

---

## 📱 **Device Testing**

### **Desktop (1920x1080)**
- [ ] 3-column grid for items
- [ ] Batch summary fills width
- [ ] Image overlays precise
- [ ] No horizontal scroll

### **Tablet (768x1024)**
- [ ] 2-column grid for items
- [ ] Batch summary stacks nicely
- [ ] Touch interactions work
- [ ] Overlays still visible

### **Mobile (375x667)**
- [ ] 1-column grid for items
- [ ] Batch summary readable
- [ ] Tap highlights work
- [ ] Image fits screen
- [ ] No tiny text

---

## ⚡ **Performance Testing**

### **Large Batches (20+ items)**
- [ ] Page loads in <3 seconds
- [ ] Scroll is smooth
- [ ] No lag on highlight
- [ ] Cards render progressively

**Optimization**: If >50 items, consider virtual scrolling

---

### **Multiple Images**
- [ ] Unified batch analysis
- [ ] All images processed
- [ ] Combined results coherent
- [ ] No duplicate items

---

## 🔧 **API Testing**

### **Direct API Call (Postman/curl)**

**Endpoint**: `POST http://localhost:3000/api/analyze-surgical`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "location": {
    "city": "Casablanca",
    "country": "Morocco"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "diagnosis": {
    "overall_scene": "...",
    "batch_summary": "...",
    "batch_grade_or_health_score": "...",
    "individual_items": [
      {
        "label": "#1",
        "description": "...",
        "defects": ["..."],
        "grade_or_severity": "...",
        "center_point": { "x": 0.5, "y": 0.3 },
        "radius": 0.05
      }
    ],
    "batch_statistics": {
      "total_items": 5,
      "uniformity": "High",
      "predominant_issues": ["..."]
    }
  },
  "processingTime": 3456
}
```

---

## ✅ **Acceptance Criteria**

### **Must Have**
- ✅ Batch summary renders
- ✅ Individual items detected
- ✅ Image overlays work
- ✅ Interactive highlighting
- ✅ No errors in console
- ✅ Responsive design
- ✅ Backward compatible

### **Should Have**
- ✅ Smooth animations
- ✅ Color-coded severity
- ✅ Detailed defects
- ✅ Quantitative data
- ✅ Lightbox support

### **Nice to Have**
- ⭐ Export batch report
- ⭐ Compare batches
- ⭐ Defect charts

---

## 📊 **Test Results Template**

### **Test Run: [DATE]**

**Environment**:
- Browser: [Chrome/Firefox/Safari]
- Screen: [Desktop/Tablet/Mobile]
- API Key: [Valid/Demo]

**Results**:
| Scenario | Status | Notes |
|----------|--------|-------|
| Numbered Fruits | ✅ / ❌ | |
| Leaf Batch | ✅ / ❌ | |
| High Quality | ✅ / ❌ | |
| Mixed Quality | ✅ / ❌ | |
| Large Batch (20+) | ✅ / ❌ | |
| Mobile View | ✅ / ❌ | |

**Issues Found**: [List any bugs]

**Overall Grade**: ⭐⭐⭐⭐⭐

---

## 🚀 **Ready for Production?**

**Checklist**:
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] API key configured
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Documentation complete

**Sign-Off**: _______________ (Date: ______)

🎉 **Happy Testing!**
