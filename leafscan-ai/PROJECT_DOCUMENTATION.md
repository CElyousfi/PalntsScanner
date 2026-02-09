# LeafScan AI - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [UI Components](#ui-components)
8. [State Management](#state-management)
9. [Authentication & Security](#authentication--security)
10. [AI Integration](#ai-integration)
11. [Storage & Database](#storage--database)
12. [Mobile Port Considerations](#mobile-port-considerations)

---

## Project Overview

**LeafScan AI** is an advanced agricultural diagnostic platform that combines computer vision, AI analysis, and real-time monitoring to help farmers and agricultural professionals diagnose plant diseases, assess produce quality, and manage farm operations.

### Core Purpose
- **Plant Disease Diagnosis**: Analyze leaf images to detect diseases, pests, and nutrient deficiencies
- **Produce Quality Assessment**: Evaluate fruits and vegetables for quality, defects, and consumability
- **Farm Management**: Track scan history, create notes, and monitor crop health over time
- **Knowledge Base**: Access agricultural resources and best practices

### Target Users
- Farmers and agricultural workers
- Agricultural consultants
- Food quality inspectors
- Agricultural researchers
- Farm managers

---

## Technical Stack

### Frontend Framework
- **Next.js 14** (App Router)
  - Server-side rendering (SSR)
  - Client-side rendering (CSR)
  - API routes
  - File-based routing
  - React Server Components

### UI & Styling
- **React 18** - Component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Custom CSS** - Advanced animations and effects

### AI & Machine Learning
- **Google Gemini AI** (gemini-1.5-pro-002, gemini-2.0-flash-exp)
  - Vision analysis
  - Natural language processing
  - Structured output generation
- **OpenAI GPT-4** (fallback)
- **Custom AI prompts** for agricultural domain

### Maps & Geolocation
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings
- **OpenStreetMap** - Map tiles
- **Geolocation API** - Device location

### Authentication
- **Supabase Auth**
  - Email/password authentication
  - Session management
  - User profiles
  - Row-level security (RLS)

### Database & Storage
- **Supabase PostgreSQL**
  - User data
  - Scan history
  - Notes and reports
- **LocalStorage**
  - Offline caching
  - Quick access data
  - User preferences
- **IndexedDB** (potential)
  - Large image storage
  - Offline-first capabilities

### State Management
- **React Context API**
  - AuthContext - User authentication
  - AutonomyContext - System state
  - NotesContext - Notes management
  - ThemeContext - UI theming
  - KnowledgeContext - Knowledge base
  - IncidentContext - Incident tracking
  - PublicAccessContext - Public mode
  - ExchangeContext - Data exchange

### Build Tools
- **Next.js** - Build system
- **PostCSS** - CSS processing
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

### Deployment
- **Vercel** (recommended)
- **Docker** support
- **Environment variables** for configuration

---

## Architecture

### Application Structure

```
leafscan-ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── analyze/              # Leaf diagnosis API
│   │   ├── analyze-hybrid/       # Hybrid analysis (CV + AI)
│   │   ├── analyze-precision/    # Precision analysis
│   │   ├── analyze-produce/      # Produce quality API
│   │   ├── analyze-surgical/     # Surgical precision API
│   │   ├── knowledge-search/     # Knowledge base search
│   │   └── map/                  # Map-related APIs
│   ├── dashboard/                # Main dashboard pages
│   │   ├── explore/              # Knowledge base
│   │   ├── history/              # Scan history
│   │   ├── notes/                # Notes & reports
│   │   ├── scan/                 # Scan interface
│   │   └── threat-map/           # Disease outbreak map
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   ├── notes/                    # Notes components
│   ├── notebook/                 # Notebook editor
│   ├── ui/                       # UI primitives
│   └── [feature components]      # Feature-specific
├── context/                      # React contexts
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── ai/                       # AI utilities
│   ├── store.ts                  # LocalStorage management
│   └── supabase.ts               # Supabase client
├── types/                        # TypeScript definitions
├── public/                       # Static assets
└── styles/                       # Global styles
```

### Data Flow

```
User Input → Component → Context → API Route → AI Service → Response → Context → Component → UI Update
```

### Key Patterns

1. **Server-Client Separation**
   - API routes handle AI calls (server-side)
   - Components handle UI (client-side)
   - Contexts bridge the gap

2. **Offline-First**
   - LocalStorage for immediate access
   - Supabase for cloud sync
   - Graceful degradation

3. **Progressive Enhancement**
   - Works without AI (fallback data)
   - Works offline (cached data)
   - Enhanced with AI when available

---

## Features

### 1. Plant Disease Diagnosis

#### Leaf Scanning
- **Image Upload**: Camera or file upload
- **AI Analysis**: Disease detection, severity assessment
- **Visual Highlighting**: Affected areas marked on image
- **Detailed Report**:
  - Disease identification
  - Severity level (Low/Medium/High)
  - Symptoms list
  - Causes analysis
  - Treatment recommendations (organic & chemical)
  - Prevention tips
  - Estimated yield impact

#### Advanced Features
- **Batch Analysis**: Multiple leaves in one image
- **Surgical Precision**: Pinpoint affected areas
- **Confidence Scoring**: AI confidence levels
- **Historical Comparison**: Track disease progression

### 2. Produce Quality Assessment

#### Crop Scanning
- **Quality Scoring**: 0-100 quality score
- **Defect Detection**: Identify and classify defects
- **Consumability Status**: Safe to eat, consume soon, do not consume
- **Grading**: A, B, C, D, F grades
- **Shelf Life Estimation**: Days until spoilage
- **Storage Recommendations**: Optimal storage conditions

#### Defect Analysis
- **Horizontal Scrolling Cards**: Easy-to-read defect display
- **Severity Levels**: Critical, Severe, Moderate, Minor
- **Defect Types**: Bruising, decay, discoloration, etc.
- **Size Percentage**: Area affected
- **Inferred Causes**: Why defects occurred
- **Depth & Impact**: Surface vs deep, cosmetic vs structural

### 3. Scan History

#### History Management
- **Chronological List**: All past scans
- **Filter by Severity**: Low, Medium, High risk
- **Sort Options**: Newest, Oldest, Severity
- **Search**: Find specific scans
- **Statistics Dashboard**:
  - Total scans
  - Active monitoring (high-risk items)
  - Health score (based on recent scans)

#### History Details
- **Full Report View**: Complete analysis
- **Notes Section**: Add observations
- **Create Note**: Link scan to notes system
- **Re-analyze**: Run analysis again
- **Share**: Export or share results

### 4. Notes & Knowledge Management

#### Notebook System
- **Markdown Cells**: Rich text editing
- **Code Cells**: (Future) Data analysis
- **Chart Cells**: (Future) Visualizations
- **Scan-Linked Notes**: Notes tied to specific scans
- **Folders**: Organize by category
- **Tags**: Categorize and search
- **Pin Notes**: Quick access to important notes

#### AI Assistant
- **Context-Aware**: Understands scan data
- **Suggested Questions**: Click-to-ask interface
- **For Crop Scans**:
  - What produce is this?
  - List all defects
  - Is it safe to eat?
  - Quality assessment
  - Storage tips
  - Shelf life estimate
- **For Leaf Scans**:
  - What disease is this?
  - Treatment options
  - Symptoms explained
  - Prevention tips
  - Severity analysis
  - Action timeline
- **Automatic Content Generation**: Creates structured reports

### 5. Knowledge Base (Explore)

#### Resource Discovery
- **Web Search Integration**: Wikipedia, WHO, FAO
- **Agricultural Guides**: Pest management, disease prevention
- **Best Practices**: Farming techniques
- **Seasonal Advice**: Crop-specific guidance
- **Interactive Articles**: Rich formatting, images, links

#### Categories
- Crop Management
- Disease Prevention
- Pest Control
- Soil Health
- Water Management
- Harvest Optimization

### 6. Threat Map

#### Disease Outbreak Tracking
- **Interactive Map**: Leaflet-based visualization
- **Outbreak Markers**: Disease locations
- **Severity Indicators**: Color-coded markers
- **Cluster Analysis**: Outbreak hotspots
- **Geolocation**: User's current location
- **Search**: Find specific locations
- **Filters**: By disease type, severity, date

### 7. Dashboard Home

#### Quick Access
- **New Scan**: Start analysis immediately
- **History**: View past scans
- **Notes**: Access knowledge base
- **Threat Map**: Check outbreaks
- **Explore**: Browse resources

#### Statistics
- **Total Scans**: Lifetime count
- **Active Monitoring**: High-risk items
- **Health Score**: Overall farm health (0-100)

---

## API Endpoints

### 1. `/api/analyze` (Leaf Diagnosis)
**Method**: POST  
**Purpose**: Analyze leaf images for diseases

**Request**:
```typescript
{
  image: string (base64)
}
```

**Response**:
```typescript
{
  cropType: string
  diseases: string[]
  severity: 'low' | 'medium' | 'high'
  symptoms: string[]
  causes: string[]
  organicTreatments: string[]
  chemicalTreatments: string[]
  preventionTips: string[]
  highlightedAreas: HighlightedArea[]
  confidence: number
  estimatedYieldImpact: string
  interventionPlan: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}
```

### 2. `/api/analyze-hybrid` (Advanced Leaf Analysis)
**Method**: POST  
**Purpose**: Hybrid CV + AI analysis with surgical precision

**Request**:
```typescript
{
  image: string (base64)
}
```

**Response**: Enhanced DiagnosisResult with:
- Plant identification
- Surgical precision highlighting
- Agentic reasoning
- Weather optimization
- Visual guides

### 3. `/api/analyze-produce` (Produce Quality)
**Method**: POST  
**Purpose**: Assess produce quality and defects

**Request**:
```typescript
{
  image: string (base64)
}
```

**Response**:
```typescript
{
  produceType: string
  variety: {
    name: string
    confidence: number
  }
  overall_quality_score: number (0-100)
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  consumability_status: string
  shelf_life_estimate: string
  areas: DefectArea[]
  batch_summary: string
  overall_scene: string
  storage_recommendations: string[]
}
```

### 4. `/api/knowledge-search`
**Method**: POST  
**Purpose**: Search agricultural knowledge base

**Request**:
```typescript
{
  query: string
}
```

**Response**:
```typescript
{
  results: KnowledgeArticle[]
}
```

### 5. `/api/map/analyze`
**Method**: POST  
**Purpose**: Analyze map regions for crop health

**Request**:
```typescript
{
  query: string
  bounds: LatLngBounds
  location: string
}
```

**Response**:
```typescript
{
  insight: string
  geojson: GeoJSON
  sidebar: {
    cropType: string
    confidence: string
    size: string
    sownDate: string
    harvestDate: string
  }
}
```

---

## Data Models

### DiagnosisResult (Leaf Scan)
```typescript
interface DiagnosisResult {
  cropType: string
  diseases: string[]
  severity: 'low' | 'medium' | 'high'
  symptoms: string[]
  causes: string[]
  organicTreatments: string[]
  chemicalTreatments: string[]
  preventionTips: string[]
  highlightedAreas?: HighlightedArea[]
  confidence: number
  estimatedYieldImpact?: string
  interventionPlan?: InterventionPlan
  plantIdentity?: PlantIdentity
  agenticReasoning?: string
  thoughtSignature?: string
  visualGuides?: Record<string, string>
  pests?: Pest[]
  waterMetrics?: WaterMetrics
  sustainabilityScore?: number
  overall_scene?: string
  batch_summary?: string
  batch_statistics?: BatchStatistics
  individual_items?: IndividualItem[]
}
```

### ProduceResults (Crop Scan)
```typescript
interface ProduceResults {
  produceType: string
  variety: {
    name: string
    confidence: number
  }
  overall_quality_score: number
  grade: string
  consumability_status: string
  shelf_life_estimate: string
  areas: DefectArea[]
  batch_summary?: string
  overall_scene?: string
  batch_statistics?: {
    total_items: number
    uniformity: string
    predominant_issues: string[]
  }
  storage_recommendations?: string[]
}
```

### HighlightedArea
```typescript
interface HighlightedArea {
  label: string
  description?: string
  severity: 'mild' | 'moderate' | 'severe'
  bbox?: BoundingBox | number[]
  center?: { x: number; y: number }
  radius?: number
  confidence?: number
}
```

### DefectArea
```typescript
interface DefectArea {
  id: number
  label: string
  defect_type: string
  description: string
  severity: 'Critical' | 'Severe' | 'Moderate' | 'Minor'
  size_percent: number
  confidence: number
  inferred_cause?: string
  depth?: string
  impact?: string
  center_x: number
  center_y: number
  radius: number
}
```

### FarmNote
```typescript
interface FarmNote {
  id: string
  title: string
  content: string (JSON stringified Notebook)
  createdAt: number
  updatedAt: number
  tags: string[]
  folder?: string
  isPinned: boolean
  scanId?: string
  metadata: {
    wordCount: number
    lastEditedBy: string
  }
}
```

### Notebook
```typescript
interface Notebook {
  id: string
  title: string
  cells: NotebookCell[]
  metadata: {
    created: Date
    modified: Date
    tags: string[]
    version: string
  }
}

interface NotebookCell {
  id: string
  type: 'markdown' | 'code'
  content: string
  metadata: Record<string, any>
}
```

### HistoricalAnalysis
```typescript
interface HistoricalAnalysis {
  id: string
  timestamp: number
  image: string
  diagnosis: DiagnosisResult
  actionResult?: ActionRescueResult
  notes?: string
  scanType: 'leaf' | 'crop'
  produceResults?: ProduceResults
}
```

---

## UI Components

### Core Components

#### 1. DiagnosisReport
**Purpose**: Display leaf scan analysis results  
**Location**: `/components/DiagnosisReport.tsx`

**Features**:
- Image with highlighted areas
- Disease information
- Treatment protocol (3-column layout)
- Symptoms & causes
- Prevention tips
- Sustainability metrics
- Interactive tooltips
- Visual guide generation
- Batch analysis support

**Props**:
```typescript
{
  result: DiagnosisResult
  actionResult?: ActionRescueResult
  image: string
  onReset: () => void
  scanId?: string
  onCreateNote?: (scanId: string) => void
  onOpenTreatmentPlanner?: () => void
  onOpenChat?: () => void
  onSymptomClick?: (symptom: string, area: string) => void
  onStartMonitoring?: () => void
  onVisualGenerated?: (prompt: string, imageUrl: string) => void
  onExploreAction?: (context: string) => void
}
```

#### 2. ProduceReport
**Purpose**: Display produce quality assessment  
**Location**: `/components/ProduceReport.tsx`

**Features**:
- Quality score visualization
- Defect cards (horizontal scroll)
- Consumability status
- Storage recommendations
- Batch statistics
- Image with defect markers
- Grade display

**Props**:
```typescript
{
  image: string
  results: ProduceResults
  onClose?: () => void
  scanId?: string
  onCreateNote?: (scanId: string) => void
}
```

#### 3. NotebookEditor
**Purpose**: Rich text editor for notes  
**Location**: `/components/notebook/NotebookEditor.tsx`

**Features**:
- Markdown rendering
- Cell-based editing
- Add/remove cells
- Drag & drop reordering
- Auto-save
- Export functionality

#### 4. AIAssistant
**Purpose**: Context-aware AI helper  
**Location**: `/components/notes/AIAssistant.tsx`

**Features**:
- Suggested questions (no text input)
- Scan-context awareness
- Progress indicators
- Message history
- Auto-scroll
- Loading states

#### 5. ImageUpload
**Purpose**: Image capture and upload  
**Location**: `/components/ImageUpload.tsx`

**Features**:
- Camera capture
- File upload
- Drag & drop
- Image preview
- Validation
- Compression

#### 6. PageShell
**Purpose**: Dashboard layout wrapper  
**Location**: `/components/dashboard/PageShell.tsx`

**Features**:
- Consistent header
- Navigation
- Action buttons
- Responsive layout

#### 7. AppShell
**Purpose**: Main application shell  
**Location**: `/components/dashboard/AppShell.tsx`

**Features**:
- Sidebar navigation
- Mobile menu
- User profile
- Logout
- Route highlighting

---

## State Management

### Context Providers

#### 1. AuthContext
**Purpose**: User authentication state  
**Location**: `/context/AuthContext.tsx`

**State**:
```typescript
{
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

#### 2. AutonomyContext
**Purpose**: System state and scan history  
**Location**: `/context/AutonomyContext.tsx`

**State**:
```typescript
{
  system: SystemState
  activeProfile: FarmProfile
  refresh: () => void
  toggleChat: (open: boolean) => void
  setChatContext: (context: ChatContext) => void
}
```

**SystemState**:
```typescript
{
  history: HistoricalAnalysis[]
  profiles: FarmProfile[]
  settings: Settings
}
```

#### 3. NotesContext
**Purpose**: Notes and notebook management  
**Location**: `/context/NotesContext.tsx`

**State**:
```typescript
{
  notes: FarmNote[]
  folders: NoteFolder[]
  activeNote: FarmNote | null
  isAIAssistantOpen: boolean
  createNote: (folder?: string, scanId?: string) => FarmNote
  updateNote: (id: string, updates: Partial<FarmNote>) => void
  removeNote: (id: string) => void
  setActiveNote: (note: FarmNote | null) => void
  createFolder: (name: string, color: string) => void
  updateFolder: (id: string, updates: Partial<NoteFolder>) => void
  removeFolder: (id: string) => void
  toggleAIAssistant: () => void
  searchNotes: (query: string) => FarmNote[]
  getNotesByFolder: (folderId: string) => FarmNote[]
}
```

#### 4. ThemeContext
**Purpose**: UI theming  
**Location**: `/context/ThemeContext.tsx`

**State**:
```typescript
{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}
```

#### 5. KnowledgeContext
**Purpose**: Knowledge base state  
**Location**: `/context/KnowledgeContext.tsx`

**State**:
```typescript
{
  articles: KnowledgeArticle[]
  loading: boolean
  search: (query: string) => Promise<void>
}
```

---

## Authentication & Security

### Supabase Authentication

#### Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Auth Flow
1. User signs up/signs in
2. Supabase creates session
3. Session stored in cookies
4. AuthContext provides user state
5. Protected routes check authentication

#### Protected Routes
- `/dashboard/*` - Requires authentication
- Middleware redirects to `/` if not authenticated

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Services
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key (optional)

# Search
BRAVE_SEARCH_API_KEY=your_brave_key (optional)
```

### Security Features
- Row-level security (RLS) in Supabase
- API key validation
- Rate limiting (recommended)
- Input sanitization
- XSS protection
- CSRF protection

---

## AI Integration

### Google Gemini AI

#### Models Used
1. **gemini-1.5-pro-002** - Main analysis model
2. **gemini-2.0-flash-exp** - Fast responses
3. **gemini-1.5-flash** - Fallback

#### Vision Analysis
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-002',
  generationConfig: {
    temperature: 0.4,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
    responseSchema: DiagnosisSchema
  }
})

const result = await model.generateContent([
  prompt,
  { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
])
```

#### Structured Output
- JSON schema validation
- Type-safe responses
- Fallback handling
- Error recovery

#### Prompt Engineering

**Leaf Diagnosis Prompt**:
```
You are an expert plant pathologist AI. Analyze this leaf image for:
1. Plant species identification
2. Disease detection (if any)
3. Severity assessment (low/medium/high)
4. Symptoms and causes
5. Treatment recommendations (organic & chemical)
6. Prevention strategies
7. Highlighted affected areas (coordinates)

Return structured JSON with confidence scores.
```

**Produce Quality Prompt**:
```
You are a produce quality expert. Analyze this image for:
1. Produce type and variety
2. Quality score (0-100)
3. Defect detection and classification
4. Consumability status
5. Shelf life estimation
6. Storage recommendations
7. Defect coordinates and severity

Return structured JSON with detailed defect analysis.
```

### AI Features

#### 1. Disease Detection
- Multi-disease recognition
- Confidence scoring
- Severity assessment
- Symptom correlation

#### 2. Quality Assessment
- Defect classification
- Size estimation
- Cause inference
- Impact analysis

#### 3. Treatment Planning
- Immediate actions
- Short-term strategies
- Long-term prevention
- Weather-optimized timing

#### 4. Knowledge Generation
- Automatic report creation
- Context-aware suggestions
- Educational content
- Best practices

---

## Storage & Database

### LocalStorage Schema

#### System State
**Key**: `leafscan_v2_system`
```typescript
{
  history: HistoricalAnalysis[]
  profiles: FarmProfile[]
  settings: Settings
  lastSync: number
}
```

#### Notes
**Key**: `leafscan_notes`
```typescript
{
  notes: FarmNote[]
  folders: NoteFolder[]
  lastModified: number
}
```

#### User Preferences
**Key**: `leafscan_preferences`
```typescript
{
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
  autoSave: boolean
}
```

### Supabase Database

#### Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**scan_history**
```sql
CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  scan_type TEXT NOT NULL, -- 'leaf' or 'crop'
  image_url TEXT,
  diagnosis JSONB,
  produce_results JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**farm_notes**
```sql
CREATE TABLE farm_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  tags TEXT[],
  folder TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  scan_id UUID REFERENCES scan_history(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Data Synchronization

#### Offline-First Strategy
1. Write to LocalStorage immediately
2. Queue for Supabase sync
3. Sync when online
4. Conflict resolution (last-write-wins)

#### Sync Flow
```typescript
// Save locally
localStorage.setItem('leafscan_v2_system', JSON.stringify(data))

// Queue for sync
syncQueue.push({ type: 'scan', data })

// Sync when online
if (navigator.onLine) {
  await supabase.from('scan_history').insert(data)
}
```

---

## Mobile Port Considerations

### Platform Options

#### 1. React Native (Recommended)
**Pros**:
- Reuse React components
- TypeScript support
- Large ecosystem
- Native performance
- Camera access
- Offline storage

**Cons**:
- Some web components need adaptation
- Platform-specific code needed

**Shared Code**: ~70-80%

#### 2. Flutter
**Pros**:
- Excellent performance
- Beautiful UI
- Single codebase
- Strong camera support

**Cons**:
- Complete rewrite
- Different language (Dart)
- No code reuse

**Shared Code**: ~0%

#### 3. Capacitor/Ionic
**Pros**:
- Wrap existing web app
- Minimal changes
- Fast development

**Cons**:
- WebView performance
- Limited native features
- Camera quality issues

**Shared Code**: ~90-95%

### Recommended Approach: React Native

#### Architecture
```
mobile-app/
├── src/
│   ├── components/     # Shared UI components
│   ├── screens/        # Mobile screens
│   ├── navigation/     # React Navigation
│   ├── services/       # API services (reused)
│   ├── hooks/          # Custom hooks (reused)
│   ├── contexts/       # State management (reused)
│   ├── types/          # TypeScript types (reused)
│   └── utils/          # Utilities (reused)
├── android/            # Android native code
├── ios/                # iOS native code
└── package.json
```

### Key Adaptations Needed

#### 1. Camera Integration
**Web**: `<input type="file" capture="camera">`  
**Mobile**: `react-native-camera` or `expo-camera`

```typescript
import { Camera } from 'expo-camera'

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null)
  const cameraRef = useRef(null)

  const takePicture = async () => {
    const photo = await cameraRef.current.takePictureAsync()
    // Process photo
  }

  return <Camera ref={cameraRef} />
}
```

#### 2. Image Handling
**Web**: Base64 strings  
**Mobile**: File URIs + compression

```typescript
import ImageResizer from 'react-native-image-resizer'

const compressImage = async (uri: string) => {
  const resized = await ImageResizer.createResizedImage(
    uri,
    1024,
    1024,
    'JPEG',
    80
  )
  return resized.uri
}
```

#### 3. Storage
**Web**: LocalStorage  
**Mobile**: AsyncStorage + SQLite

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

const saveData = async (key: string, value: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

const getData = async (key: string) => {
  const value = await AsyncStorage.getItem(key)
  return value ? JSON.parse(value) : null
}
```

#### 4. Maps
**Web**: Leaflet  
**Mobile**: `react-native-maps`

```typescript
import MapView, { Marker } from 'react-native-maps'

<MapView
  initialRegion={{
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
</MapView>
```

#### 5. Navigation
**Web**: Next.js routing  
**Mobile**: React Navigation

```typescript
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Scan" component={ScanScreen} />
    <Stack.Screen name="Results" component={ResultsScreen} />
  </Stack.Navigator>
</NavigationContainer>
```

#### 6. Styling
**Web**: Tailwind CSS  
**Mobile**: StyleSheet + NativeWind (Tailwind for RN)

```typescript
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6BBF59',
  },
})
```

### Reusable Code

#### ✅ Can Reuse (70-80%)
- **API Services**: All API calls
- **State Management**: All contexts
- **Business Logic**: Analysis logic, data processing
- **TypeScript Types**: All interfaces and types
- **Utilities**: Helper functions
- **AI Integration**: Gemini API calls
- **Data Models**: All data structures

#### ⚠️ Needs Adaptation (15-20%)
- **UI Components**: Convert to React Native components
- **Styling**: Convert Tailwind to StyleSheet
- **Navigation**: Use React Navigation
- **Forms**: Use React Native inputs
- **Modals**: Use React Native modals

#### ❌ Cannot Reuse (5-10%)
- **Next.js specific**: API routes, SSR
- **Web-only libraries**: Leaflet, some UI libs
- **HTML elements**: div, img, etc.
- **CSS**: Tailwind classes

### Mobile-Specific Features

#### 1. Push Notifications
```typescript
import * as Notifications from 'expo-notifications'

// Disease outbreak alerts
// Scan completion notifications
// Treatment reminders
```

#### 2. Offline Mode
```typescript
import NetInfo from '@react-native-community/netinfo'

// Detect connectivity
// Queue API calls
// Sync when online
```

#### 3. Background Sync
```typescript
import BackgroundFetch from 'react-native-background-fetch'

// Sync scan history
// Update knowledge base
// Check for outbreaks
```

#### 4. Geolocation
```typescript
import * as Location from 'expo-location'

// Get current location
// Track farm locations
// Nearby outbreak alerts
```

#### 5. File System
```typescript
import * as FileSystem from 'expo-file-system'

// Store images locally
// Cache analysis results
// Export reports
```

### Performance Optimizations

#### 1. Image Optimization
- Compress before upload
- Lazy load thumbnails
- Cache processed images
- Use native image libraries

#### 2. List Performance
- FlatList for long lists
- Virtualization
- Pagination
- Memoization

#### 3. State Management
- Use React.memo
- useMemo for expensive calculations
- useCallback for functions
- Avoid unnecessary re-renders

#### 4. Network
- Request batching
- Response caching
- Retry logic
- Timeout handling

### Testing Strategy

#### Unit Tests
```typescript
import { render, fireEvent } from '@testing-library/react-native'

test('scan button triggers camera', () => {
  const { getByText } = render(<ScanScreen />)
  const button = getByText('Scan')
  fireEvent.press(button)
  // Assert camera opened
})
```

#### Integration Tests
- API integration
- State management
- Navigation flows
- Offline scenarios

#### E2E Tests
- Detox for React Native
- Complete user flows
- Camera capture
- Analysis workflow

### Deployment

#### iOS
1. Apple Developer Account ($99/year)
2. Xcode setup
3. Code signing
4. TestFlight beta
5. App Store submission

#### Android
1. Google Play Console ($25 one-time)
2. Android Studio setup
3. Keystore generation
4. Internal testing
5. Play Store submission

### Estimated Timeline

**Phase 1: Setup & Core (4-6 weeks)**
- React Native project setup
- Navigation structure
- Camera integration
- Basic UI components

**Phase 2: Features (6-8 weeks)**
- Scan functionality
- Analysis display
- History management
- Notes system

**Phase 3: Polish (3-4 weeks)**
- Offline mode
- Push notifications
- Performance optimization
- Bug fixes

**Phase 4: Testing & Deploy (2-3 weeks)**
- Beta testing
- App store submission
- Documentation

**Total**: 15-21 weeks (3.5-5 months)

### Budget Estimate

**Development**:
- Developer time: $50-150/hour
- 500-800 hours total
- **Cost**: $25,000 - $120,000

**Services**:
- Apple Developer: $99/year
- Google Play: $25 one-time
- Supabase: $25-100/month
- Gemini API: Pay-per-use
- **Cost**: ~$500-2000/year

**Total First Year**: $25,500 - $122,000

---

## Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)

### Libraries to Consider
- `react-native-camera` - Camera access
- `react-native-maps` - Maps integration
- `@react-native-async-storage/async-storage` - Storage
- `react-navigation` - Navigation
- `react-native-image-resizer` - Image compression
- `expo` - Development framework (optional)
- `nativewind` - Tailwind for React Native

### Code Sharing Strategy
1. Create shared package for business logic
2. Platform-specific UI implementations
3. Shared TypeScript types
4. Shared API services
5. Shared state management

---

## Conclusion

LeafScan AI is a comprehensive agricultural diagnostic platform with strong potential for mobile adaptation. The React Native approach offers the best balance of code reuse, performance, and native features.

**Key Strengths for Mobile**:
- ✅ Well-structured codebase
- ✅ TypeScript for type safety
- ✅ Modular architecture
- ✅ Offline-first design
- ✅ API-driven architecture
- ✅ Reusable business logic

**Mobile Port Viability**: **High** (8/10)

The project is well-suited for mobile adaptation with 70-80% code reuse potential using React Native.
