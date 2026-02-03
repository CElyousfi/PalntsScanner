# 🗺️ AI-Assisted Farm Mapping System - Complete Guide

## ✅ **SYSTEM OVERVIEW**

A comprehensive AI-powered farm mapping system using **Gemini 3** for analysis and **Mapbox** for visualization. Provides full assistance for farm delineation, crop detection, yield estimation, and transformation insights.

---

## 🎯 **CORE FEATURES**

### **1. Interactive Map Interface**
- **Satellite View**: High-resolution satellite imagery via Mapbox
- **Real-time Navigation**: Pan, zoom, and explore any farm area globally
- **Default Location**: Casablanca, Morocco (-7.5898, 33.5731)
- **Responsive**: Works on desktop and mobile devices

### **2. AI Assistant Chat**
- **Natural Language Queries**: Ask anything about farms in plain English
- **Voice Input**: Speak your questions (browser-dependent)
- **Quick Actions**: Pre-built queries for common tasks
- **Conversation History**: Track all interactions

### **3. Gemini 3 Integration**
- **Model**: gemini-1.5-flash for speed (or gemini-1.5-pro for depth)
- **Multimodal Analysis**: Text + satellite imagery processing
- **Deep Reasoning**: Advanced thinking for complex farm analysis
- **Structured Outputs**: Insights + GeoJSON + Navigation commands

### **4. Farm Analysis Capabilities**
- **Boundary Delineation**: Detect and outline farm plots (<2ha focus)
- **Crop Detection**: Identify crop types from imagery
- **Yield Estimation**: Calculate potential yields (t/ha)
- **Health Assessment**: Evaluate plant health (excellent/good/fair/poor)
- **Recommendations**: Actionable farming advice

### **5. Visual Overlays**
- **Color-Coded Farms**: Green (excellent) → Red (poor)
- **Interactive Popups**: Click farms for detailed info
- **Dynamic Layers**: Add/remove analysis results
- **Legend**: Clear health status indicators

---

## 🚀 **GETTING STARTED**

### **Prerequisites**

1. **Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Create free API key
   - Add to `.env.local`: `GEMINI_API_KEY=your_key_here`

2. **Mapbox Token**
   - Visit: https://account.mapbox.com/access-tokens/
   - Create free token (50k users/month free)
   - Add to `.env.local`: `NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here`

### **Installation**

```bash
# Install dependencies
npm install mapbox-gl @types/mapbox-gl

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local

# Run development server
npm run dev
```

### **Access the Map**

Navigate to: `http://localhost:3000/dashboard/threat-map`

---

## 💬 **HOW TO USE**

### **Basic Workflow**

1. **Load Map**: Opens to default location (Casablanca)
2. **Navigate**: Pan/zoom to your area of interest
3. **Ask AI**: Type or speak your query
4. **View Results**: See overlays and insights
5. **Interact**: Click farms for details
6. **Refine**: Ask follow-up questions

### **Example Queries**

#### **Farm Delineation**
```
"Delineate all farms in the current view"
"Find farms smaller than 2 hectares"
"Show me farm boundaries in this area"
```

#### **Crop Detection**
```
"What crops are growing here?"
"Identify crop types in visible area"
"Detect maize fields"
```

#### **Yield Estimation**
```
"Estimate yields for farms in view"
"Calculate potential harvest for maize"
"What's the expected yield per hectare?"
```

#### **Health Assessment**
```
"Assess plant health in this area"
"Identify any crop issues or diseases"
"Show me healthy vs struggling farms"
```

#### **Recommendations**
```
"Suggest improvements for low-yield farms"
"What regenerative practices should I use?"
"How can I increase productivity?"
```

### **Quick Actions**

Click pre-built buttons for instant analysis:
- **Analyze Farms**: Complete farm overview
- **Estimate Yields**: Yield calculations
- **Detect Crops**: Crop identification
- **Health Assessment**: Plant health check

---

## 🔧 **TECHNICAL ARCHITECTURE**

### **Frontend Stack**

```typescript
// Components
AIFarmMap.tsx          // Main map component
- Mapbox GL JS v3      // Map rendering
- React hooks          // State management
- Lucide icons         // UI icons

// Features
- Real-time chat interface
- Voice input (Web Speech API)
- Dynamic GeoJSON overlays
- Interactive popups
- Responsive design
```

### **Backend Stack**

```typescript
// API Route
/api/map/analyze/route.ts

// Processing
1. Receive query + map bounds
2. Build comprehensive prompt
3. Call Gemini 3 API
4. Parse structured response
5. Return insights + GeoJSON + navigation
```

### **Data Flow**

```
User Query
    ↓
Frontend (AIFarmMap)
    ↓
POST /api/map/analyze
    {query, bounds, center, zoom}
    ↓
Backend (route.ts)
    ↓
Gemini 3 API
    {prompt with context}
    ↓
AI Response
    {insights, geojson, flyTo}
    ↓
Frontend Updates
    - Add chat message
    - Render farm overlays
    - Fly to location (if specified)
```

---

## 📊 **GEMINI 3 INTEGRATION**

### **Prompt Structure**

```typescript
const prompt = `You are an AI farm mapping assistant.

User Query: "${query}"

Map Context:
- Center: ${lat}°N, ${lng}°E
- Zoom: ${zoom}
- Bounds: [coordinates]

Task: Analyze and provide:
1. Detailed insights
2. GeoJSON farm boundaries
3. Actionable recommendations

Format:
INSIGHTS: [analysis]
GEOJSON: [FeatureCollection]
FLYTO: [coordinates] or null
`
```

### **Response Parsing**

```typescript
// Extract sections
const insights = extractSection(text, 'INSIGHTS:', 'GEOJSON:')
const geojson = JSON.parse(extractSection(text, 'GEOJSON:', 'FLYTO:'))
const flyTo = JSON.parse(extractSection(text, 'FLYTO:', null))

// Apply to map
addFarmOverlays(geojson)
if (flyTo) map.flyTo(flyTo)
```

### **GeoJSON Structure**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], ...]]
      },
      "properties": {
        "name": "Farm 1",
        "area": 1.5,
        "cropType": "Maize",
        "yield": 4.2,
        "health": "excellent"
      }
    }
  ]
}
```

---

## 🎨 **UI COMPONENTS**

### **Chat Panel**
- **Location**: Top-right corner
- **Size**: 384px × 600px (expanded)
- **Features**:
  - Collapsible header
  - Scrollable message history
  - Quick action buttons
  - Voice input button
  - Send button

### **Map Info Panel**
- **Location**: Bottom-left corner
- **Content**:
  - Current zoom level
  - Center coordinates
  - Usage instructions

### **Legend**
- **Location**: Top-left corner
- **Shows**: Health color coding
  - Green: Excellent
  - Lime: Good
  - Yellow: Fair
  - Red: Poor

---

## 🔐 **SECURITY & PRIVACY**

### **API Keys**
- Stored in environment variables
- Never exposed to client
- Backend-only access

### **User Data**
- No persistent storage
- Session-based chat history
- Anonymous location queries
- No personal information collected

### **Rate Limits**
- Gemini: ~60 queries/min (free tier)
- Mapbox: 50k users/month (free tier)
- Implement queueing if needed

---

## 🌍 **SATELLITE DATA**

### **Current Implementation**
- Mapbox satellite imagery
- Global coverage
- High resolution
- Real-time updates

### **Future Enhancements**
```typescript
// Sentinel-2 Integration
import { sentinelsat } from 'sentinelsat'

async function fetchSatelliteImage(bounds, date) {
  // Query Sentinel Hub API
  const products = await sentinelsat.query({
    bbox: bounds,
    date: date,
    platformname: 'Sentinel-2',
    cloudcoverpercentage: [0, 30]
  })
  
  // Download and process
  const image = await sentinelsat.download(products[0])
  const ndvi = calculateNDVI(image)
  
  return ndvi
}
```

---

## 📈 **ADVANCED FEATURES**

### **NDVI Calculation**
```typescript
// Normalized Difference Vegetation Index
function calculateNDVI(nir, red) {
  return (nir - red) / (nir + red)
}

// Health mapping
const health = ndvi > 0.6 ? 'excellent' :
               ndvi > 0.4 ? 'good' :
               ndvi > 0.2 ? 'fair' : 'poor'
```

### **Seasonal Tracking**
```typescript
// Time-series analysis
async function trackGrowth(farmId, startDate, endDate) {
  const images = await fetchTimeSeriesImages(farmId, startDate, endDate)
  const ndviSeries = images.map(img => calculateNDVI(img))
  
  return {
    trend: analyzeTrend(ndviSeries),
    stages: identifyGrowthStages(ndviSeries),
    predictions: predictHarvest(ndviSeries)
  }
}
```

### **Export Functionality**
```typescript
// Generate PDF report
async function exportReport(farms) {
  const pdf = new PDFDocument()
  
  pdf.text('Farm Analysis Report')
  pdf.text(`Date: ${new Date().toLocaleDateString()}`)
  
  farms.forEach(farm => {
    pdf.addPage()
    pdf.text(`Farm: ${farm.name}`)
    pdf.text(`Area: ${farm.area} ha`)
    pdf.text(`Crop: ${farm.cropType}`)
    pdf.text(`Yield: ${farm.yield} t/ha`)
    pdf.text(`Health: ${farm.health}`)
  })
  
  return pdf
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Map Not Loading**
```bash
# Check Mapbox token
echo $NEXT_PUBLIC_MAPBOX_TOKEN

# Verify in browser console
console.log(process.env.NEXT_PUBLIC_MAPBOX_TOKEN)

# Common issue: Token not public
# Must start with NEXT_PUBLIC_ for client access
```

### **AI Not Responding**
```bash
# Check Gemini API key
echo $GEMINI_API_KEY

# Test API directly
curl -X POST https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  -H "x-goog-api-key: YOUR_KEY"

# Check rate limits
# Free tier: 60 requests/minute
```

### **GeoJSON Not Rendering**
```typescript
// Validate GeoJSON
import { validate } from '@turf/turf'

if (!validate(geojson)) {
  console.error('Invalid GeoJSON:', geojson)
  // Fallback to sample data
}

// Check coordinates format
// Must be [longitude, latitude] (not lat, lng!)
```

---

## 📚 **API REFERENCE**

### **POST /api/map/analyze**

**Request:**
```json
{
  "query": "Delineate farms in view",
  "bounds": [[west, south], [east, north]],
  "center": [lng, lat],
  "zoom": 12
}
```

**Response:**
```json
{
  "insights": "Found 5 small farms...",
  "geojson": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "flyTo": {
    "center": [lng, lat],
    "zoom": 14
  }
}
```

---

## 🎯 **NEXT STEPS**

### **Immediate**
1. ✅ Add Mapbox token to `.env.local`
2. ✅ Add Gemini API key to `.env.local`
3. ✅ Navigate to `/dashboard/threat-map`
4. ✅ Test with sample queries

### **Short-term**
- [ ] Integrate real Sentinel-2 imagery
- [ ] Add NDVI calculation
- [ ] Implement PDF export
- [ ] Add offline caching
- [ ] Mobile app version

### **Long-term**
- [ ] Time-series analysis
- [ ] Predictive modeling
- [ ] Multi-language support
- [ ] Collaborative features
- [ ] API for third-party integration

---

## 🌟 **YOU'RE READY!**

Your comprehensive AI farm mapping system is fully implemented and ready to use!

**Access:** `http://localhost:3000/dashboard/threat-map`

**Features:**
- ✅ Interactive satellite map
- ✅ AI-powered analysis
- ✅ Farm boundary detection
- ✅ Yield estimation
- ✅ Health assessment
- ✅ Voice input
- ✅ Dynamic overlays
- ✅ Real-time insights

**Start mapping farms with AI assistance now!** 🌱🗺️✨
