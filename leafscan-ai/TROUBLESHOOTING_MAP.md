# 🔧 Map Search Troubleshooting Guide

## ❌ Problem: "No suppliers found within 50km"

### Root Cause
The Google Places API (New) is returning 0 results. This is most likely because:
1. **Places API (New) is not enabled** in Google Cloud Console
2. OR billing is not set up for the API
3. OR the API has quota restrictions

---

## ✅ Solution: Enable Google Places API (New)

### Step 1: Go to Google Cloud Console
```
https://console.cloud.google.com/
```

### Step 2: Select Your Project
- Click the project dropdown at the top
- Select the project that has your API key

### Step 3: Enable Places API (New)
1. Go to **APIs & Services** > **Library**
2. Search for: **"Places API (New)"**
3. Click on it
4. Click **"ENABLE"** button
5. Wait for it to activate (~30 seconds)

### Step 4: Verify Billing is Set Up
1. Go to **Billing** in left sidebar
2. Make sure a billing account is linked
3. Google requires billing even for free tier

### Step 5: Check API Restrictions (Optional)
1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **API restrictions**:
   - Either select **"Don't restrict key"** (for testing)
   - OR add **"Places API (New)"** to allowed APIs

---

## 🧪 Test API Configuration

### Test 1: Check Diagnostic Endpoint
Visit this URL in your browser:
```
http://localhost:3000/api/map-query/test
```

**Expected Output:**
```json
{
  "timestamp": "2026-02-06...",
  "environment": "development",
  "apiKeys": {
    "gemini": "✅ Set (AIzaSyCCNf-02lT3ZC...)",
    "googleMaps": "✅ Set (AIzaSyDVBSGhI_Awxwa...)"
  },
  "envVars": {
    "GEMINI_API_KEY": true,
    "NEXT_PUBLIC_GOOGLE_MAPS_KEY": true
  }
}
```

**If any key shows ❌ Missing**: Check `.env.local` file

---

### Test 2: Check Terminal Logs
After clicking a category button, you should see:
```
============================================
🗺️ MAP QUERY API CALLED
============================================
📦 Request body: { query: "...", location: {...} }
🔍 Processing Map Query: farmers market wholesale buyers
🤖 Step 1: Interpreting query with AI...
✅ Interpretation complete
🔎 Step 2: Executing search...
🔍 Searching Google Places for: "farmers market"
📍 Center: 33.5731, -7.5898
📏 Radius: 30km
✅ API Key present: AIzaSyDVBSGhI_Awxwa...
📦 Request body: { textQuery: "...", ... }
📥 Places API Response status: 200
✅ Places API returned X results
```

**If you see:**
- `📥 Places API Response status: 403` → API not enabled or billing issue
- `📥 Places API Response status: 400` → Request format error
- `❌ Places API Error: ...` → Copy the full error and check it

---

### Test 3: Browser Console
Open DevTools (F12) and look for:
```
🔍 Search initiated: farmers market wholesale buyers
📍 Center location: {lat: 33.5731, lng: -7.5898}
📡 Calling /api/map-query...
📥 Response status: 200
📊 API Response: {places: [], aiInsight: "..."}
✅ Found 0 results
```

**If "Found 0 results"**: Places API issue (enable it in Google Cloud)

---

## 🔑 Verify API Keys

### Check .env.local File
```bash
cat .env.local | grep -E "GEMINI|GOOGLE_MAPS"
```

**Should output:**
```
GEMINI_API_KEY=AIzaSyCCNf-02lT3ZC_BAMv6aGpjl4jLo0LsLF0
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyDVBSGhI_Awxwa9EBvhI26zVQsak40QgNU
```

**If missing**: Add them to `.env.local`

**IMPORTANT**: After changing .env.local, **RESTART** the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 📊 Common Errors & Fixes

### Error 1: "PERMISSION_DENIED"
```json
{
  "error": {
    "code": 403,
    "message": "Google Places API (New) has not been used..."
  }
}
```

**Fix**: Enable "Places API (New)" in Google Cloud Console (see Step 3 above)

---

### Error 2: "API_KEY_INVALID"
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid..."
  }
}
```

**Fix**: 
1. Generate a new API key in Google Cloud Console
2. Update `NEXT_PUBLIC_GOOGLE_MAPS_KEY` in `.env.local`
3. Restart server

---

### Error 3: "BILLING_NOT_ENABLED"
```json
{
  "error": {
    "code": 403,
    "message": "Cloud billing account required..."
  }
}
```

**Fix**: 
1. Go to Billing in Google Cloud Console
2. Link a billing account (credit card required)
3. Google offers $300 free credits for new users

---

### Error 4: Zero Results in Morocco
**If the API works but returns 0 results for Casablanca:**

The Places API (New) might have limited data for some regions. Try these searches:
- More generic: "store" instead of "farmers market"
- Try larger radius: 100km instead of 30km
- Try different locations: Paris, New York, etc.

**Morocco-specific tip:**
Use French or Arabic terms:
- "marché agricole" instead of "farmers market"
- "magasin d'équipement" instead of "equipment store"

---

## 🌍 Alternative: Use Text Search API

If Places API (New) doesn't work, you can enable the legacy **"Places API"** instead:

1. In Google Cloud Console > APIs & Services > Library
2. Search for: **"Places API"** (without "New")
3. Enable it
4. Update the code to use legacy endpoint (I can help with this)

---

## 🚀 Quick Fix: Test with Different Location

To verify the API is working, test with a well-covered area like New York City:

1. Open browser DevTools Console
2. Paste this and press Enter:
```javascript
fetch('/api/map-query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'tractor repair',
    location: { lat: 40.7128, lng: -74.0060 },  // New York City
    language: 'en'
  })
}).then(r => r.json()).then(console.log)
```

3. Check the response - if it returns results, the API works!
4. If it returns 0 results even for NYC, the API is not enabled.

---

## ✅ Verification Checklist

Once you've enabled the API, verify everything works:

- [ ] Test endpoint returns API keys as ✅ Set
- [ ] Terminal shows "Places API Response status: 200"
- [ ] Terminal shows "Places API returned X results" (X > 0)
- [ ] Browser console shows "Found X results" (X > 0)
- [ ] Results panel appears on left side of map
- [ ] Markers appear on the map
- [ ] AI suggestions panel appears at bottom

---

## 🆘 Still Not Working?

### Check These:
1. **Server restarted** after changing .env.local?
2. **Billing enabled** in Google Cloud Console?
3. **Correct project** selected in Google Cloud?
4. **API key restrictions** too strict?
5. **Quota limits** reached? (Check API metrics)

### Get Detailed Error:
1. Refresh page
2. Open DevTools Console (F12)
3. Click "🏪 Markets" button
4. Copy ALL console output
5. Copy ALL terminal output
6. Send both to me for debugging

---

## 📞 Need Help?

If you're still stuck, provide:
1. Screenshot of Google Cloud Console > Enabled APIs
2. Terminal logs (after clicking search)
3. Browser console logs (F12)
4. Output of diagnostic endpoint: `http://localhost:3000/api/map-query/test`

---

**Most likely fix: Enable "Places API (New)" in Google Cloud Console! 🔑**
