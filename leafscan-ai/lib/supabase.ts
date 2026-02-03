import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface HistoricalAnalysisDB {
  id: string
  user_id: string
  timestamp: string
  image_data_url: string
  diagnosis: string
  confidence: number
  treatment: string
  prevention: string
  severity: string
  affected_area: number
  location?: {
    lat: number
    lng: number
    address?: string
  }
  weather?: {
    temp: number
    humidity: number
    conditions: string
  }
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface FarmProfileDB {
  id: string
  user_id: string
  name: string
  location: {
    lat: number
    lng: number
    address?: string
  }
  size: number
  crops: string[]
  soil_type?: string
  irrigation?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface SystemLogDB {
  id: string
  user_id: string
  timestamp: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: any
  created_at?: string
}
