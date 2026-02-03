# 🚀 Quick Start Guide - Supabase Integration

## ✅ What's Been Done

The LeafScan AI application has been upgraded with **Supabase database integration**! Here's what changed:

### 📦 Installed Packages
- `@supabase/supabase-js` - Supabase JavaScript client

### 🗄️ Database Architecture
- **Simplified Schema**: Single `user_system_state` table stores entire app state as JSONB
- **Automatic Migration**: localStorage data automatically migrates to Supabase on first load
- **Dual Storage**: Saves to both localStorage (fast backup) and Supabase (persistent cloud)

### 📁 New Files Created

1. **`/lib/supabase.ts`** - Supabase client configuration
2. **`/lib/database.ts`** - Database operations (save, load, migrate)
3. **`/supabase/migrations/001_initial_schema.sql`** - Initial complex schema (not used)
4. **`/supabase/migrations/002_simplified_schema.sql`** - **Active schema** (use this one!)
5. **`SUPABASE_SETUP.md`** - Complete setup instructions
6. **`.env.example`** - Updated with Supabase credentials template

### 🔧 Modified Files

1. **`/lib/store.tsx`**
   - Added `saveAnalysisToHistoryAsync()` - New async function that saves to Supabase
   - Kept `saveAnalysisToHistory()` - Legacy sync function for backward compatibility

2. **`/context/AutonomyContext.tsx`**
   - Updated `loadSystem()` to be async
   - Loads from Supabase first, falls back to localStorage
   - Automatic migration on first load

3. **`/app/dashboard/scan/page.tsx`**
   - Uses `saveAnalysisToHistoryAsync()` to save scans to database
   - Fallback to localStorage if Supabase fails

---

## 🎯 Next Steps (YOU NEED TO DO THIS)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - Name: `leafscan-ai`
   - Database Password: (create a strong password - **SAVE THIS!**)
   - Region: Choose closest to you
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get API Credentials

1. In Supabase dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (long string under "Project API keys")

### Step 3: Configure Environment

1. Open `.env.local` in your project root
2. Add these lines (replace with your actual values):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

### Step 4: Run Database Migration

1. In Supabase dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/002_simplified_schema.sql`
4. Paste into SQL editor
5. Click **"Run"** ▶️

### Step 5: Verify Setup

1. In Supabase → **Table Editor**
2. You should see table: `user_system_state`
3. Columns should be:
   - `user_id` (text, primary key)
   - `state` (jsonb)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### Step 6: Test It!

1. **Restart dev server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

2. **Open browser console** (F12)

3. **Navigate to** `/dashboard/scan`

4. **Perform a scan** and watch for these logs:
```
[AutonomyContext] 🔄 Loading system state...
[AutonomyContext] Checking Supabase database...
[Database] 📦 Migrating data: X analyses...
[Database] 🎉 Migration completed successfully!
[Store] 🚀 saveAnalysisToHistoryAsync called with: xxx
[Database] 💾 Saving system state to Supabase
[Database] ✅ System state saved successfully to database
[Store] 🎉 Analysis saved successfully to both localStorage and Supabase!
```

5. **Check Supabase Table Editor** - you should see your data!

---

## 🎊 What You Get

### ✅ Benefits

- **No More localStorage Quota Errors** - Cloud storage has no size limits
- **Persistent Data** - Never lose your scans again
- **Automatic Backup** - Data saved to both localStorage and cloud
- **Multi-Device Ready** - Access data from any device (future feature)
- **Automatic Migration** - Existing data moved to cloud automatically

### 📊 What Gets Saved

- ✅ All scan analyses (images, diagnoses, treatments)
- ✅ Farm profiles
- ✅ System logs
- ✅ User preferences
- ✅ Growth history
- ✅ Everything in your app state!

---

## 🔍 Troubleshooting

### "Module not found: Can't resolve './database'"

**Fix:** Restart the dev server
```bash
# Ctrl+C to stop
npm run dev
```

### "Cannot connect to Supabase"

**Check:**
1. `.env.local` has correct credentials
2. Supabase project is active (not paused)
3. Browser console for specific errors

### "Data not showing in history"

**Try:**
1. Hard refresh: `Ctrl+Shift+R`
2. Check Supabase Table Editor
3. Check browser console for errors

### "Migration failed"

**Solution:**
1. Check browser console for details
2. Verify database table exists in Supabase
3. Check RLS policies are enabled

---

## 📝 Console Commands for Debugging

Open browser console (F12) and try:

```javascript
// Check localStorage
const local = localStorage.getItem('leafscan_v2_system')
console.log('localStorage:', JSON.parse(local))

// Check backup
const backup = localStorage.getItem('leafscan_v2_system_backup')
console.log('Backup:', backup ? JSON.parse(backup) : 'None')

// Force migration (replace 'user-id' with actual user ID)
import { migrateFromLocalStorage } from './lib/database'
await migrateFromLocalStorage('your-user-id')
```

---

## 🎉 Success Indicators

You'll know it's working when you see:

1. ✅ Console logs showing Supabase saves
2. ✅ Data appearing in Supabase Table Editor
3. ✅ History page showing all scans
4. ✅ No localStorage quota errors
5. ✅ Migration backup created in localStorage

---

## 📚 Documentation

- **Full Setup Guide**: `SUPABASE_SETUP.md`
- **Database Schema**: `supabase/migrations/002_simplified_schema.sql`
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## 🆘 Need Help?

1. Check browser console logs (F12)
2. Check Supabase dashboard for errors
3. Review `SUPABASE_SETUP.md` for detailed instructions
4. All database operations log to console with emoji prefixes:
   - 💾 = Saving
   - 📥 = Loading
   - ✅ = Success
   - ❌ = Error
   - 🔄 = Migration

---

**Ready to go!** Just complete Steps 1-6 above and you'll have a fully cloud-backed LeafScan AI! 🚀
