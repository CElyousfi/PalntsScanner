import { supabase } from './supabase'
import { FarmSystemState } from './store'

// ============================================
// SIMPLIFIED DATABASE OPERATIONS
// Store entire system state as JSONB in a single table
// This avoids complex type mapping and makes everything simpler
// ============================================

/**
 * Save the entire system state to Supabase
 * Uses upsert to create or update
 */
export async function saveSystemStateToDatabase(userId: string, state: FarmSystemState): Promise<void> {
  console.log('[Database] 💾 Saving system state to Supabase for user:', userId)
  console.log('[Database] State contains:', state.history?.length || 0, 'analyses,', state.profiles?.length || 0, 'profiles')
  
  const { error } = await supabase
    .from('user_system_state')
    .upsert({
      user_id: userId, // UUID from auth.users
      state: state as any // Store entire state as JSONB
    }, {
      onConflict: 'user_id'
    })
  
  if (error) {
    console.error('[Database] ❌ Error saving system state:', error)
    console.error('[Database] Error details:', JSON.stringify(error, null, 2))
    throw error
  }
  
  console.log('[Database] ✅ System state saved successfully to database')
}

/**
 * Load the entire system state from Supabase
 * Returns null if no state exists
 */
export async function getSystemStateFromDatabase(userId: string): Promise<FarmSystemState | null> {
  console.log('[Database] 📥 Loading system state from Supabase for user:', userId)
  
  const { data, error } = await supabase
    .from('user_system_state')
    .select('state')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - this is normal for new users
      console.log('[Database] ℹ️ No existing state found in database (new user)')
      return null
    }
    console.error('[Database] ❌ Error loading system state:', error)
    throw error
  }
  
  if (!data || !data.state) {
    console.log('[Database] ℹ️ No state data found')
    return null
  }
  
  const state = data.state as FarmSystemState
  console.log('[Database] ✅ Loaded system state:', state.history?.length || 0, 'analyses,', state.profiles?.length || 0, 'profiles')
  
  return state
}

/**
 * Delete all user data from the database
 */
export async function deleteUserData(userId: string): Promise<void> {
  console.log('[Database] 🗑️ Deleting all data for user:', userId)
  
  const { error } = await supabase
    .from('user_system_state')
    .delete()
    .eq('user_id', userId)
  
  if (error) {
    console.error('[Database] ❌ Error deleting user data:', error)
    throw error
  }
  
  console.log('[Database] ✅ User data deleted successfully')
}

/**
 * Migrate data from localStorage to Supabase
 * This is a one-time operation per user
 */
export async function migrateFromLocalStorage(userId: string): Promise<boolean> {
  console.log('[Database] 🔄 Starting migration from localStorage to Supabase...')
  
  try {
    // Check if data already exists in Supabase
    const existingState = await getSystemStateFromDatabase(userId)
    if (existingState && existingState.history && existingState.history.length > 0) {
      console.log('[Database] ℹ️ Data already exists in Supabase, skipping migration')
      return false
    }
    
    // Get data from localStorage
    const raw = localStorage.getItem('leafscan_v2_system')
    if (!raw) {
      console.log('[Database] ℹ️ No localStorage data to migrate')
      return false
    }
    
    const localData = JSON.parse(raw) as FarmSystemState
    
    // Validate it's for the correct user
    if (localData.userId !== userId) {
      console.warn('[Database] ⚠️ localStorage data is for a different user, skipping migration')
      return false
    }
    
    console.log('[Database] 📦 Migrating data:', localData.history?.length || 0, 'analyses,', localData.profiles?.length || 0, 'profiles')
    
    // Save to Supabase
    await saveSystemStateToDatabase(userId, localData)
    
    // Backup localStorage data
    localStorage.setItem('leafscan_v2_system_backup', raw)
    console.log('[Database] 💾 localStorage data backed up to leafscan_v2_system_backup')
    
    console.log('[Database] 🎉 Migration completed successfully!')
    return true
    
  } catch (error) {
    console.error('[Database] ❌ Migration failed:', error)
    throw error
  }
}
