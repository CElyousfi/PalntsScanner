# 🗺️ Map Troubleshooting Guide

## ✅ **FIXES APPLIED**

### **Issue: Map Not Visible**

**Root Causes Fixed:**
1. ✅ Added Mapbox CSS to global styles
2. ✅ Made map container full-screen with `fixed inset-0`
3. ✅ Added z-index to ensure map is on top
4. ✅ Removed dashboard layout constraints

**Changes Made:**

1. **`app/globals.css`**
   - Added: `@import 'mapbox-gl/dist/mapbox-gl.css';`

2. **`app/dashboard/threat-map/page.tsx`**
   - Changed container to: `<div className="fixed inset-0 z-50">`

---

## 🚀 **VERIFICATION STEPS**

### **1. Check Server is Running**
```bash
# Server should show:
✓ Compiled /dashboard/threat-map in XXXXms
```

### **2. Refresh Browser**
```
Hard refresh: Ctrl+Shift+R (Linux/Windows) or Cmd+Shift+R (Mac)
```

### **3. Check Console**
```
Open DevTools (F12)
Look for:
- No Mapbox errors
- Map should initialize
- "Mapbox GL JS" in console
```

### **4. Verify Map Loads**
You should see:
- ✅ Satellite imagery
- ✅ Chat panel (top-right)
- ✅ Map info panel (bottom-left)
- ✅ Navigation controls (top-left)

---

## 🔧 **IF MAP STILL NOT VISIBLE**

### **Check 1: Mapbox Token**
```bash
# Verify token is set
cat .env.local | grep MAPBOX

# Should show:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx
```

**Fix if missing:**
```bash
# Add to .env.local
echo "NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw" >> .env.local

# Restart server
npm run dev
```

### **Check 2: Browser Console Errors**

**Open DevTools (F12) → Console**

**Common Errors:**

1. **"Mapbox access token required"**
   ```
   Fix: Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
   ```

2. **"Failed to load CSS"**
   ```
   Fix: Clear cache and hard refresh
   ```

3. **"Cannot read property 'addControl'"**
   ```
   Fix: Map not initialized - check token
   ```

### **Check 3: CSS Loading**

**Verify in DevTools → Network tab:**
- Look for `mapbox-gl.css` loading
- Should return 200 status

**If 404:**
```bash
# Reinstall mapbox
npm install mapbox-gl --force
npm run dev
```

### **Check 4: Container Dimensions**

**In DevTools → Elements:**
- Find `<div ref={mapContainer}>`
- Should have width and height > 0
- Should have `position: absolute; inset: 0;`

**If dimensions are 0:**
```
Parent container issue - already fixed with `fixed inset-0`
```

---

## 🎯 **QUICK FIXES**

### **Fix 1: Hard Refresh**
```
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### **Fix 2: Clear Cache**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### **Fix 3: Reinstall Dependencies**
```bash
npm install mapbox-gl @types/mapbox-gl --force
npm run dev
```

### **Fix 4: Check Environment**
```bash
# Verify .env.local exists
ls -la .env.local

# Should show file with both keys:
cat .env.local
```

---

## 📊 **EXPECTED BEHAVIOR**

### **On Page Load:**
1. Satellite map appears immediately
2. Default location: Casablanca, Morocco
3. Chat panel visible (top-right)
4. Map info panel visible (bottom-left)
5. Can pan and zoom

### **In Console:**
```
Mapbox GL JS initialized
Map loaded successfully
```

### **No Errors:**
- No 401 (unauthorized)
- No 404 (not found)
- No CSS errors

---

## 🔍 **DEBUGGING CHECKLIST**

- [ ] Server running (`npm run dev`)
- [ ] Page compiled successfully
- [ ] Browser refreshed (hard refresh)
- [ ] `.env.local` exists with both tokens
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` starts with `pk.`
- [ ] No console errors
- [ ] Mapbox CSS loaded (check Network tab)
- [ ] Map container has dimensions
- [ ] Page at `/dashboard/threat-map`

---

## 💡 **CURRENT STATUS**

### **✅ All Fixes Applied**

The map should now be:
- ✅ Full screen
- ✅ Properly styled
- ✅ Visible on load
- ✅ Interactive

### **🎯 Next Steps**

1. **Refresh browser** (Ctrl+Shift+R)
2. **Navigate to** `/dashboard/threat-map`
3. **Verify map loads**
4. **Test chat** by typing a query

---

## 🆘 **STILL NOT WORKING?**

### **Check These:**

1. **Is the server running?**
   ```bash
   # Should see:
   ▲ Next.js 14.x.x
   - Local: http://localhost:3000
   ```

2. **Are you on the right page?**
   ```
   URL should be: http://localhost:3000/dashboard/threat-map
   ```

3. **Is JavaScript enabled?**
   ```
   Map requires JavaScript - check browser settings
   ```

4. **Try different browser**
   ```
   Test in Chrome, Firefox, or Edge
   ```

---

## 📝 **MANUAL VERIFICATION**

### **Test 1: Map Container**
```javascript
// In browser console:
document.querySelector('[class*="mapboxgl-map"]')
// Should return: <div class="mapboxgl-map">
```

### **Test 2: Mapbox Token**
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
// Should show: pk.xxxxx
```

### **Test 3: Map Instance**
```javascript
// Check if map initialized
// Should see map controls and satellite imagery
```

---

## ✅ **SUCCESS INDICATORS**

**You'll know it's working when:**
- ✅ Satellite imagery visible
- ✅ Can pan and zoom
- ✅ Chat panel interactive
- ✅ Map info shows coordinates
- ✅ No console errors

**If you see all of these, the map is working perfectly!** 🎉

---

## 🌟 **FINAL CHECK**

**Navigate to:** `http://localhost:3000/dashboard/threat-map`

**Expected Result:**
- Full-screen satellite map
- AI chat assistant (top-right)
- Map info panel (bottom-left)
- Smooth navigation

**If you see this, everything is working!** 🗺️✨
