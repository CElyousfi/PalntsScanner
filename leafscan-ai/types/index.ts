export interface Disease {
  name: string
  confidence: number
  description: string
  evidenceFromCV?: string
  verifiedByTools?: string[]
}

export interface Session {
  id: string
  timestamp: number
  diagnosis: DiagnosisResult
  image: string // base64 or url
  location?: LocationData | null
  cropType?: string
  monitoringPlan?: MonitoringPlan // Linked Marathon Mode plan
}

export interface SymptomLocation {
  area: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right'
  label: string
  severity: 'mild' | 'moderate' | 'severe'
  coordinates?: {
    x: number  // 0-100 percentage from left
    y: number  // 0-100 percentage from top
  }
  bbox?: NormalizedBoundingBox  // Precise bounding box (0-1 normalized)
}

// Normalized Bounding Box (0-1 scale for resolution-independent positioning)
export interface NormalizedBoundingBox {
  x: number       // Left edge (0-1, where 0=left, 1=right)
  y: number       // Top edge (0-1, where 0=top, 1=bottom)
  width: number   // Box width (0-1)
  height: number  // Box height (0-1)
  confidence?: number  // Detection confidence (0-1)
}

export interface HighlightedArea {
  label: string
  bbox?: NormalizedBoundingBox // Optional now if using center/radius
  center?: { x: number, y: number } // NEW: Surgical precision center
  radius?: number // NEW: Surgical precision radius
  severity?: 'mild' | 'moderate' | 'severe'
  description?: string
  visualCues?: string[]  // e.g., ["brown discoloration", "concentric rings"]
}

export interface DiagnosisResult {
  id?: string // Unique Scan ID for session isolation
  cropType: string
  diseases: Disease[]
  symptoms: string[]
  symptomLocations?: SymptomLocation[]
  causes: string[]
  organicTreatments: string[]
  chemicalTreatments: string[]
  preventionTips: string[]
  additionalInfo: string
  severity: 'low' | 'medium' | 'high'
  sustainabilityScore?: number
  isPlant?: boolean
  location?: string
  climateContext?: string
  estimatedYieldImpact?: string
  pesticideReduction?: string
  toolCallsPlan?: ToolCallPlan[]
  agenticReasoning?: string
  interventionPlan?: InterventionPlan
  thoughtSignature?: string
  highlightedAreas?: HighlightedArea[]
  visualGuides?: Record<string, string>
  pests?: Pest[]
  waterMetrics?: WaterMetrics
}

export interface ToolCallPlan {
  toolName: string
  parameters: any
  reasoning: string
}

export interface InterventionPlan {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
  weatherOptimized?: string
  researchBacked?: string
}

export interface HybridAnalysisResponse {
  success: boolean
  diagnosis: DiagnosisResult
  preprocessing?: PreprocessingResult
  toolCalls: ToolExecutionResult[]
  pipeline: PipelineStatus
  metadata?: any
}

export interface PreprocessingResult {
  lesionsDetected: number
  overallHealth: number
  method: string
  processingTime?: number
}

export interface ToolExecutionResult {
  tool: string
  confidence: number
  timestamp: number
}

export interface PipelineStatus {
  step1_preprocessing: string
  step2_visual_analysis: string
  step3_tool_calling: string
  step4_refinement: string
}

export interface TreatmentPlan {
  farmSize?: string
  budget?: string
  resourcePreference: 'organic' | 'chemical' | 'mixed'
  timeline: TreatmentStep[]
  alternatives: string[]
  economicAnalysis?: {
    roi: string
    totalEstimatedCost: string
    potentialSavings: string
  }
  weatherAdaptations?: {
    heatwave: string
    rain: string
    drought: string
  }
}

export interface TreatmentStep {
  day: number
  action: string
  details: string
  cost?: string
  weatherAdvice?: string
  completed?: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  suggestedQuestions?: string[]
}

export interface LocationData {
  name?: string
  city?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
  latitude?: number
  longitude?: number
  climate?: string
}

// Marathon Agent Types
export interface MonitoringCheckpoint {
  id: string
  day: number
  timestamp: number
  imageUrl: string
  analysis: {
    overallProgress: 'improving' | 'stable' | 'worsening' | 'new_issues'
    symptomChanges: string[]
    newSymptoms: string[]
    resolvedSymptoms: string[]
    severityChange: number // -2 to +2 (negative = improvement)
    yieldImpactChange: string
    confidence: number
  }
  agentReasoning: string
  planAdjustments: string[]
  nextSteps: string[]
  weatherContext?: string
  thoughtSignature?: string
}

export interface MonitoringPlan {
  id: string
  startDate: number
  cropType: string
  initialDiagnosis: DiagnosisResult
  initialTreatmentPlan: TreatmentPlan
  checkpoints: MonitoringCheckpoint[]
  currentStatus: 'active' | 'completed' | 'critical' | 'paused'
  totalDuration: number // days
  nextCheckpointDay: number
  adaptiveInsights: string[]
  visualGuides?: Record<string, string> // Cache for banana-generated visuals
  thoughtSignature?: string // For continuity across sessions
}

export interface FollowUpAnalysisRequest {
  monitoringPlanId: string
  dayNumber: number
  imageBase64: string
  userNotes?: string
  weatherConditions?: string
  previousThoughtSignature?: string
}

export interface AgentDecision {
  action: 'continue_plan' | 'adjust_treatment' | 'escalate' | 'add_intervention' | 'declare_success'
  reasoning: string
  confidence: number
  suggestedActions: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface Supplier {
  name: string
  address: string
  type: string
  description: string
  price_range: string
  rating: number
  distance_km?: number
  location?: { lat: number; lng: number } | null
  contact?: string
  hours?: string
}

export interface ActionRescueResult {
  success: boolean
  query: string
  summary: string
  suppliers: Supplier[]
  mapEmbed: string
  satelliteContext: string
  classificationSummary?: string
  actionableInsight?: string
  geminiToolsUsed?: string[]
  timestamp?: number
}

export interface Pest {
  name: string
  confidence: number
  description: string
  symptoms: string[]
  organicControl: string[]
}

export interface WaterMetrics {
  currentHumidity: number
  optimumHumidityMin: number
  optimumHumidityMax: number
  irrigateLiters?: number
  savedLiters?: number
  advice: string
}

export interface ProductRecommendation {
  name: string
  category: 'fungicide' | 'pesticide' | 'fertilizer' | 'soil_amendment' | 'organic_treatment' | 'equipment' | 'other'
  type: 'organic' | 'chemical' | 'biological'
  purpose: string
  dosage?: string
  applicationMethod?: string
  estimatedCost?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  alternatives?: string[]
  safetyNotes?: string
  whereToFind?: string
}

export type GrowthStage = 'Seeding' | 'Early Vigor' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Pre-Winter' | 'Post-Winter' | 'Harvest'

export interface GrowthEntry {
  date: string // ISO
  stage: GrowthStage
  healthMetrics: {
    vigor: number
    humidityOptimum: string
    currentHumidity: number
    waterSavedLiters: number
    yieldEstimateKg: number
  }
  diagnosis?: {
    diseases: string[]
    pests: string[]
    severity: string
  }
  userNotes?: string
  photoUrl?: string
}

export interface FarmProfile {
  id: string   // UUID
  name: string // "Tomato 1", "Backyard Basil"
  userId: string
  location: {
    city: string
    region: string
    country: string
    lat: number
    lon: number
    climate?: string
  }
  cropType: string
  variety: string // e.g. "Cherry (humid-adapted)"
  varietySpecs?: {
    humidityMin: number
    humidityMax: number
    yieldPerHectare: number
    pestResistance: string[]
  }
  startDate: string // ISO
  currentStage: GrowthStage
  growthHistory: GrowthEntry[]
  preferences: {
    organicOnly: boolean
    language: string
    waterSavingFocus: boolean
  }
  seasonalAlerts: {
    preWinter?: string
    postWinter?: string
    general?: string
  }
}

// Update DiagnosisResult to include pests and water
export interface DiagnosisResult {
  cropType: string
  diseases: Disease[]
  pests?: Pest[] // NEW
  waterMetrics?: WaterMetrics // NEW
  symptoms: string[]
  symptomLocations?: SymptomLocation[]
  causes: string[]
  organicTreatments: string[]
  chemicalTreatments: string[]
  preventionTips: string[]
  additionalInfo: string
  severity: 'low' | 'medium' | 'high'
  sustainabilityScore?: number
  isPlant?: boolean
  location?: string
  climateContext?: string
  estimatedYieldImpact?: string
  pesticideReduction?: string
  toolCallsPlan?: ToolCallPlan[]
  agenticReasoning?: string
  interventionPlan?: InterventionPlan
  thoughtSignature?: string
  highlightedAreas?: HighlightedArea[]
  visualGuides?: Record<string, string>
  plantIdentity?: { // NEW: Explicit Visual ID
    name: string
    confidence: number
  }
  productRecommendations?: ProductRecommendation[] // NEW: Product recommendations for treatment
}

// End of types definitions
