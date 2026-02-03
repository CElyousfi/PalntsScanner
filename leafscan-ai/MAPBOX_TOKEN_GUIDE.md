# 🗺️ MAPBOX TOKEN SETUP GUIDE - FIX INFINITE LOADING

## ⚠️ **PROBLEM: Map Stuck on "Loading..."**

The map is stuck in an infinite loading loop because the Mapbox token is invalid or expired.

---

## ✅ **SOLUTION: Get a FREE Mapbox Token**

### **Step 1: Create Mapbox Account (FREE)**

1. Go to: **https://account.mapbox.com/auth/signup/**
2. Sign up with email (100% free, no credit card required)
3. Verify your email

### **Step 2: Get Your Token**

1. After login, you'll see your **Default public token**
2. Or go to: **https://account.mapbox.com/access-tokens/**
3. Copy the token (starts with `pk.`)

### **Step 3: Add Token to Project**

```bash
# Navigate to project
cd /home/kali/code/NoSignLeftBehind/leafscan-ai

# Edit .env.local
nano .env.local
```

**Replace the token:**
```env
# OLD (invalid):
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw

# NEW (your actual token):
NEXT_PUBLIC_MAPBOX_TOKEN=pk.YOUR_ACTUAL_TOKEN_HERE
```

**Save and exit:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

### **Step 4: Restart Server**

The server should auto-reload, but if not:

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### **Step 5: Refresh Browser**

```
Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

---

## 🎯 **VERIFICATION**

### **Check Console (F12):**

**Before fix:**
```
❌ Map stuck on "Loading..."
❌ No "Map loaded successfully" message
❌ Possible 401 Unauthorized errors
```

**After fix:**
```
✅ "🗺️ Starting map initialization..."
✅ "✅ Map loaded successfully!"
✅ Map appears with satellite imagery
```

---

## 🔍 **TROUBLESHOOTING**

### **Still Not Working?**

**1. Verify Token Format**
```bash
cat .env.local | grep MAPBOX

# Should show:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...  (long string)

# Must start with "pk."
# Must be on one line
# No quotes needed
```

**2. Check Token is Public**
```
Token MUST start with: pk.
NOT: sk. (that's a secret token)
```

**3. Verify Server Reloaded**
```bash
# Look for in terminal:
"Reload env: .env.local"

# If not seen, restart manually:
# Ctrl+C then npm run dev
```

**4. Clear Browser Cache**
```
Ctrl+Shift+R (hard refresh)
Or clear all cache in browser settings
```

**5. Check Browser Console**
```
F12 → Console tab
Look for:
- "Token present" or "No token"
- "Container size: XXX x XXX"
- Any red error messages
```

---

## 📊 **MAPBOX FREE TIER**

**What you get for FREE:**
- ✅ 50,000 map loads/month
- ✅ Satellite imagery
- ✅ Street maps
- ✅ Navigation controls
- ✅ No credit card required
- ✅ Perfect for development

**More than enough for testing and small projects!**

---

## 🚀 **QUICK FIX CHECKLIST**

- [ ] Created Mapbox account
- [ ] Got public token (starts with `pk.`)
- [ ] Added to `.env.local`
- [ ] Saved file
- [ ] Server reloaded (check terminal)
- [ ] Hard refreshed browser (`Ctrl+Shift+R`)
- [ ] Checked console for "Map loaded successfully"
- [ ] Map appears with imagery

**If all checked, map should work!** ✅

---

## 💡 **ALTERNATIVE: Use Demo Token**

If you can't get a token right now, the SimpleMap component will show a helpful error with instructions.

---

## 🎉 **SUCCESS INDICATORS**

**You'll know it's working when:**
- ✅ Loading spinner disappears
- ✅ Satellite imagery appears
- ✅ Green marker visible
- ✅ Can pan and zoom
- ✅ Console shows "Map loaded successfully"
- ✅ No errors in console

---

## 📝 **EXAMPLE .env.local FILE**

```env
# Gemini API Key (optional for now)
GEMINI_API_KEY=your_gemini_key_here

# Mapbox Token (REQUIRED for map)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNscXh5ejEyMzQ1Njc4OXBxcnN0dXZ3eHl6In0.AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Important:**
- No quotes around the token
- Must be on one line
- Must start with `pk.`
- Must have `NEXT_PUBLIC_` prefix

---

## 🔗 **USEFUL LINKS**

- **Sign Up:** https://account.mapbox.com/auth/signup/
- **Get Token:** https://account.mapbox.com/access-tokens/
- **Docs:** https://docs.mapbox.com/help/getting-started/access-tokens/
- **Pricing:** https://www.mapbox.com/pricing (Free tier is generous!)

---

## ⚡ **FASTEST FIX**

```bash
# 1. Get token from Mapbox
open https://account.mapbox.com/access-tokens/

# 2. Update .env.local
echo "NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_TOKEN_HERE" >> .env.local

# 3. Restart
npm run dev

# 4. Refresh browser
# Ctrl+Shift+R
```

**Done in 2 minutes!** 🎊

---

## 🎯 **FINAL NOTE**

The infinite loading loop happens because:
1. Map tries to load with invalid token
2. Mapbox API rejects the request
3. Map never fires the "load" event
4. Loading spinner never disappears

**Solution:** Valid token = Map loads = Success! ✅

**Get your free token now and the map will work immediately!** 🗺️✨
