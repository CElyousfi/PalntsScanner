# ✅ AI Farm Mapping - Quick Setup Checklist

## 🚀 **GET STARTED IN 5 MINUTES**

### **Step 1: Get API Keys** (2 minutes)

#### **Gemini API Key**
- [ ] Visit: https://makersuite.google.com/app/apikey
- [ ] Click "Create API Key"
- [ ] Copy the key

#### **Mapbox Token**
- [ ] Visit: https://account.mapbox.com/access-tokens/
- [ ] Sign up (free)
- [ ] Copy default public token

### **Step 2: Configure** (1 minute)

```bash
# Navigate to project
cd /home/kali/code/NoSignLeftBehind/leafscan-ai

# Copy environment template
cp .env.example .env.local

# Edit file
nano .env.local
```

**Add your keys:**
```env
GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### **Step 3: Install** (1 minute)

```bash
# Dependencies already installed!
# If needed: npm install mapbox-gl @types/mapbox-gl
```

### **Step 4: Run** (30 seconds)

```bash
npm run dev
```

### **Step 5: Test** (30 seconds)

- [ ] Open: http://localhost:3000/dashboard/threat-map
- [ ] See satellite map load
- [ ] Type in chat: "Analyze farms in view"
- [ ] See AI response and overlays

---

## ✅ **VERIFICATION**

### **Map Loads?**
- ✅ Satellite imagery visible
- ✅ Navigation controls present
- ✅ Can pan and zoom

### **Chat Works?**
- ✅ Chat panel visible (top-right)
- ✅ Can type messages
- ✅ AI responds

### **Overlays Render?**
- ✅ Farm boundaries appear
- ✅ Colors show health status
- ✅ Popups on click

---

## 🎯 **QUICK TEST QUERIES**

Try these to verify everything works:

1. **"Delineate farms in view"**
   - Should show farm boundaries

2. **"Estimate yields"**
   - Should provide yield estimates

3. **"What crops are here?"**
   - Should identify crop types

4. **"Assess plant health"**
   - Should show health colors

---

## 🐛 **TROUBLESHOOTING**

### **Map Not Loading?**
```bash
# Check Mapbox token
echo $NEXT_PUBLIC_MAPBOX_TOKEN

# Must start with NEXT_PUBLIC_
```

### **AI Not Responding?**
```bash
# Check Gemini key
echo $GEMINI_API_KEY

# Check .env.local exists
ls -la .env.local
```

### **Still Issues?**
- Restart dev server: `npm run dev`
- Clear browser cache
- Check browser console for errors

---

## 📚 **DOCUMENTATION**

- **Complete Guide**: `AI_FARM_MAPPING_GUIDE.md`
- **Implementation**: `FARM_MAPPING_COMPLETE.md`
- **This Checklist**: `SETUP_CHECKLIST.md`

---

## 🎉 **DONE!**

**If all checkboxes are ticked, you're ready to map farms with AI!**

**URL:** http://localhost:3000/dashboard/threat-map

**Start exploring!** 🌱🗺️✨
