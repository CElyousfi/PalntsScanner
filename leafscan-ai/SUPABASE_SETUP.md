# 🚀 Supabase Database Setup Guide

This guide will help you set up Supabase as the database backend for LeafScan AI, replacing localStorage with a persistent cloud database.

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- The LeafScan AI project

## 🔧 Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `leafscan-ai` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

## 🔑 Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## 📝 Step 3: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Add the following lines:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2
4. Save the file

## 🗄️ Step 4: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/migrations/002_simplified_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## ✅ Step 5: Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see a table called `user_system_state`
3. The table should have columns:
   - `user_id` (text, primary key)
   - `state` (jsonb)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

## 🚀 Step 6: Test the Integration

1. Restart your development server:
```bash
npm run dev
```

2. Open the browser console (F12)
3. Navigate to `/dashboard/scan`
4. Perform a scan
5. Check the console logs for:
   - `[Database] 💾 Saving system state to Supabase`
   - `[Database] ✅ System state saved successfully to database`

## 🔄 Data Migration

The app will **automatically migrate** your existing localStorage data to Supabase on first load!

### What Happens:
1. App checks Supabase for existing data
2. If none found, checks localStorage
3. If localStorage data exists, migrates it to Supabase
4. Creates a backup in `leafscan_v2_system_backup`

### Manual Migration Check:

Open browser console and run:
```javascript
// Check localStorage data
const localData = localStorage.getItem('leafscan_v2_system')
console.log('localStorage data:', JSON.parse(localData))

// Check backup
const backup = localStorage.getItem('leafscan_v2_system_backup')
console.log('Backup data:', backup ? JSON.parse(backup) : 'No backup')
```

## 🎯 Features

### ✅ What Works Now:

- **Persistent Storage**: Data saved to cloud database
- **No Size Limits**: No more localStorage quota errors
- **Automatic Sync**: Saves to both localStorage (fast) and Supabase (persistent)
- **Automatic Migration**: Existing data automatically moved to Supabase
- **Fallback Support**: If Supabase fails, localStorage still works
- **Multi-Device**: Access your data from any device (future feature)

### 📊 Data Stored:

- All scan analyses (images, diagnoses, treatments)
- Farm profiles
- System logs
- User preferences
- Growth history

## 🔍 Troubleshooting

### Issue: "Cannot connect to Supabase"

**Solution:**
1. Check your `.env.local` file has correct credentials
2. Verify the Supabase project is active (not paused)
3. Check browser console for specific error messages

### Issue: "Migration failed"

**Solution:**
1. Check browser console for error details
2. Verify the database table exists in Supabase
3. Try manual migration:
```javascript
// In browser console
import { migrateFromLocalStorage } from './lib/database'
await migrateFromLocalStorage('your-user-id')
```

### Issue: "Data not appearing in history"

**Solution:**
1. Hard refresh the page (Ctrl+Shift+R)
2. Check Supabase Table Editor to verify data is there
3. Check browser console for errors
4. Verify RLS policies are set correctly

## 🔐 Security Notes

- The `anon` key is safe to expose in client-side code
- Row Level Security (RLS) is enabled to protect user data
- Each user can only access their own data
- Never commit `.env.local` to version control

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Success!

You're now using Supabase as your database backend! All scans will be saved to the cloud and accessible from any device.

---

**Need Help?** Check the browser console logs for detailed debugging information.
