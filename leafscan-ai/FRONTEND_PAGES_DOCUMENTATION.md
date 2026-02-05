# LeafScan AI - Frontend Pages Documentation

## Overview
This document provides a comprehensive overview of all frontend pages, their purposes, and the components they use.

---

## 📁 Page Structure

### 1. **Root Page** (`/`)
- **File**: `middleware.ts` (redirects to `/marketing`)
- **Purpose**: Entry point that redirects users to the marketing/landing page
- **Components**: None (redirect only)

---

### 2. **Marketing/Landing Page** (`/marketing`)
- **File**: `app/marketing/page.tsx`
- **Purpose**: Main landing page for plant disease diagnosis
- **Features**:
  - Image upload for plant disease detection
  - AI-powered diagnosis with Gemini
  - Treatment planning and recommendations
  - Location-based supplier mapping
  - History of past scans
  - AI chat assistant

- **Components Used**:
  - `ImageUpload` - File upload interface
  - `DiagnosisReport` - Display diagnosis results
  - `Header` - Navigation header
  - `ImpactStats` - Statistics display
  - `LoadingScreen` - Loading animation during analysis
  - `LocationInput` - Location selection
  - `TreatmentPlanner` - Treatment recommendations
  - `AIChat` - AI assistant chat
  - `ApplicationsSlider` - Feature showcase
  - `MonitoringDashboard` - Crop monitoring
  - `HistorySidebar` - Past scan history

---

## 🔐 Authentication Pages

### 3. **Login Page** (`/auth/login`)
- **File**: `app/auth/login/page.tsx`
- **Purpose**: User authentication
- **Features**:
  - Email/password login
  - Social authentication (if configured)
  - Link to signup page
  - Password reset link

### 4. **Signup Page** (`/auth/signup`)
- **File**: `app/auth/signup/page.tsx`
- **Purpose**: New user registration
- **Features**:
  - Create new account
  - Email verification
  - Profile setup

### 5. **Forgot Password** (`/auth/forgot-password`)
- **File**: `app/auth/forgot-password/page.tsx`
- **Purpose**: Password recovery
- **Features**:
  - Email-based password reset
  - Reset link generation

### 6. **Alternative Login** (`/login`)
- **File**: `app/login/page.tsx`
- **Purpose**: Alternative login route (likely redirects to `/auth/login`)

### 7. **Alternative Signup** (`/signup`)
- **File**: `app/signup/page.tsx`
- **Purpose**: Alternative signup route (likely redirects to `/auth/signup`)

---

## 📊 Dashboard Pages

### 8. **Scan Page** (`/dashboard/scan`)
- **File**: `app/dashboard/scan/page.tsx`
- **Purpose**: Main scanning interface for authenticated users
- **Features**:
  - Upload plant images
  - Real-time AI diagnosis
  - Save scan results to history
  - Generate treatment plans

### 9. **History Page** (`/dashboard/history`)
- **File**: `app/dashboard/history/page.tsx`
- **Purpose**: View past scan results and diagnoses
- **Features**:
  - List of all previous scans
  - Filter and search functionality
  - Detailed view of past diagnoses
  - Re-analyze or update treatments

### 10. **Notes Page** (`/dashboard/notes`)
- **File**: `app/dashboard/notes/page.tsx`
- **Purpose**: Note-taking for farm management
- **Features**:
  - Create and edit notes
  - Organize by crop/field
  - Rich text editing
  - Attach to specific scans

### 11. **Notebook Page** (`/dashboard/notes-notebook`)
- **File**: `app/dashboard/notes-notebook/page.tsx`
- **Purpose**: Advanced notebook interface with AI assistance
- **Features**:
  - TipTap rich text editor
  - AI-powered writing assistance
  - Markdown support
  - Code highlighting
  - Tables and formatting

### 12. **Lab Page** (`/dashboard/lab`)
- **File**: `app/dashboard/lab/page.tsx`
- **Purpose**: Experimental features and testing
- **Features**:
  - Test new AI models
  - Experimental diagnosis tools
  - Advanced analysis options

### 13. **Vitals Page** (`/dashboard/vitals`)
- **File**: `app/dashboard/vitals/page.tsx`
- **Purpose**: Monitor crop health metrics
- **Features**:
  - Real-time health indicators
  - Growth tracking
  - Environmental data
  - Health score visualization

### 14. **Threat Map** (`/dashboard/threat-map`)
- **File**: `app/dashboard/threat-map/page.tsx`
- **Purpose**: Geographic disease threat visualization
- **Features**:
  - Interactive map (Mapbox/Leaflet)
  - Disease outbreak locations
  - Risk zones
  - Regional alerts

### 15. **Autonomy Page** (`/dashboard/autonomy`)
- **File**: `app/dashboard/autonomy/page.tsx`
- **Purpose**: Autonomous farm management system
- **Features**:
  - Automated task scheduling
  - AI-driven recommendations
  - System logs and events
  - Autonomous decision tracking

### 16. **Exchange Page** (`/dashboard/exchange`)
- **File**: `app/dashboard/exchange/page.tsx`
- **Purpose**: Community knowledge exchange
- **Features**:
  - Share experiences
  - Community discussions
  - Best practices sharing
  - Farmer network

### 17. **Explore Page** (`/dashboard/explore`)
- **File**: `app/dashboard/explore/page.tsx`
- **Purpose**: Discover new features and content
- **Features**:
  - Feature discovery
  - Educational content
  - Tips and tutorials
  - Platform updates

---

## 🚀 Other Pages

### 18. **Onboarding** (`/onboarding`)
- **File**: `app/onboarding/page.tsx`
- **Purpose**: First-time user setup
- **Features**:
  - Welcome tour
  - Profile setup
  - Farm information collection
  - Feature introduction

### 19. **Tracker** (`/tracker`)
- **File**: `app/tracker/page.tsx`
- **Purpose**: Crop lifecycle tracking
- **Features**:
  - Growth stage monitoring
  - Timeline visualization
  - Milestone tracking
  - Predictive analytics

### 20. **Test Supabase** (`/test-supabase`)
- **File**: `app/test-supabase/page.tsx`
- **Purpose**: Database connection testing (development only)
- **Features**:
  - Test Supabase connectivity
  - Verify authentication
  - Database operations testing

---

## 🔧 Common Components Used Across Pages

### Core Components
- **Header** - Navigation and user menu
- **AIChat** - AI assistant interface
- **LoadingScreen** - Loading states
- **ErrorSuppressor** - Error handling

### Dashboard Components
- **AutonomyLog** - System event logs
- **CoachingWidget** - AI coaching tips
- **DailyBriefingPlayer** - Daily updates
- **GrowthProgressWidget** - Growth tracking
- **PlantSwitcher** - Multi-plant management
- **VitalsWidget** - Health metrics display

### Map Components
- **SmartMap** - Interactive mapping (Mapbox GL)
- **ThreatMapView** - Disease threat visualization

### Notes Components
- **AIAssistant** - Writing assistance
- **TipTap Editor** - Rich text editing
- **MarkdownPreview** - Markdown rendering

### Analysis Components
- **ImageUpload** - Image upload interface
- **DiagnosisReport** - Results display
- **TreatmentPlanner** - Treatment recommendations
- **MonitoringDashboard** - Monitoring interface

---

## 🎯 Context Providers

All pages are wrapped with these context providers (in `app/layout.tsx`):

1. **LanguageProvider** - Multi-language support
2. **AuthProvider** - User authentication state
3. **AutonomyProvider** - Farm system state and automation
4. **MissionProvider** - Mission/task management

---

## 🗺️ User Flow

### First-Time User
1. `/` → Redirects to `/marketing`
2. `/marketing` → Try demo or sign up
3. `/auth/signup` → Create account
4. `/onboarding` → Setup profile
5. `/dashboard/scan` → Start scanning

### Returning User
1. `/` → Redirects to `/marketing`
2. `/auth/login` → Login
3. `/dashboard/scan` or `/dashboard/history` → Main workflow

### Typical Workflow
1. **Scan** (`/dashboard/scan`) - Upload plant image
2. **Diagnosis** - View AI analysis
3. **Treatment** - Get recommendations
4. **Notes** (`/dashboard/notes`) - Document actions
5. **Vitals** (`/dashboard/vitals`) - Monitor progress
6. **History** (`/dashboard/history`) - Review past scans

---

## 📦 Key Features by Page

| Page | Image Upload | AI Diagnosis | Maps | Notes | History |
|------|--------------|--------------|------|-------|---------|
| Marketing | ✅ | ✅ | ✅ | ❌ | ✅ |
| Scan | ✅ | ✅ | ✅ | ❌ | ❌ |
| History | ❌ | ✅ | ❌ | ❌ | ✅ |
| Notes | ❌ | ❌ | ❌ | ✅ | ❌ |
| Threat Map | ❌ | ❌ | ✅ | ❌ | ❌ |
| Vitals | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔑 Environment Variables Required

- `GEMINI_API_KEY` - Google Gemini AI API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token (for maps)

---

## 🚨 Common Issues & Solutions

### Issue: "useAutonomy must be used within an AutonomyProvider"
- **Solution**: Ensure `AutonomyProvider` is in `app/layout.tsx`

### Issue: 404 on root route
- **Solution**: Check `middleware.ts` is properly configured

### Issue: Map not loading
- **Solution**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set

### Issue: AI diagnosis failing
- **Solution**: Check `GEMINI_API_KEY` is valid and has quota

---

## 📝 Development Notes

- All pages use **Next.js 14 App Router**
- Client components marked with `'use client'`
- Server components for static content
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations

---

Last Updated: February 4, 2026
