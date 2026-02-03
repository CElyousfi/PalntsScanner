'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { saveSystemStateToDatabase, getSystemStateFromDatabase } from '@/lib/database'
import { initializeSystem } from '@/lib/store'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Ready to test')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setStatus('Testing connection...')
    addLog('🔍 Testing Supabase connection...')
    
    try {
      // Test 1: Check if Supabase client is configured
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      addLog('✅ Supabase client initialized')

      // Test 2: Try to query the table
      const { data, error } = await supabase
        .from('user_system_state')
        .select('user_id')
        .limit(1)

      if (error) {
        if (error.message.includes('relation "user_system_state" does not exist')) {
          addLog('❌ Table does not exist! Please run the SQL migration.')
          setStatus('❌ Table not found - Run SQL migration first')
          return
        }
        throw error
      }

      addLog('✅ Successfully queried database')
      addLog(`📊 Found ${data?.length || 0} records`)
      setStatus('✅ Connection successful!')

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      setStatus(`❌ Connection failed: ${error.message}`)
    }
  }

  const testSave = async () => {
    setStatus('Testing save...')
    addLog('💾 Testing save operation...')
    
    try {
      const testUserId = 'test-user-' + Date.now()
      const testState = initializeSystem(testUserId)
      
      addLog(`📝 Creating test state for user: ${testUserId}`)
      
      await saveSystemStateToDatabase(testUserId, testState)
      addLog('✅ Save successful!')

      // Verify by reading back
      const retrieved = await getSystemStateFromDatabase(testUserId)
      if (retrieved && retrieved.userId === testUserId) {
        addLog('✅ Read back successful!')
        addLog(`📊 Retrieved state has ${retrieved.history?.length || 0} analyses`)
        setStatus('✅ Save and read test passed!')
      } else {
        addLog('⚠️ Read back failed or data mismatch')
        setStatus('⚠️ Save succeeded but read failed')
      }

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      setStatus(`❌ Save failed: ${error.message}`)
    }
  }

  const checkEnvVars = () => {
    addLog('🔍 Checking environment variables...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl) {
      addLog(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
    } else {
      addLog('❌ NEXT_PUBLIC_SUPABASE_URL not set')
    }

    if (supabaseKey) {
      addLog(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`)
    } else {
      addLog('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set')
    }

    if (supabaseUrl && supabaseKey) {
      setStatus('✅ Environment variables configured')
    } else {
      setStatus('❌ Missing environment variables')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🧪 Supabase Connection Test</h1>
        <p className="text-gray-600 mb-8">Test your Supabase database integration</p>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkEnvVars}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              1. Check Environment Variables
            </button>
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              2. Test Connection
            </button>
            <button
              onClick={testSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              3. Test Save & Read
            </button>
            <button
              onClick={() => {
                setLogs([])
                setStatus('Ready to test')
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click a test button above.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click "Check Environment Variables" to verify credentials are loaded</li>
            <li>Click "Test Connection" to verify database table exists</li>
            <li>Click "Test Save & Read" to verify data can be saved and retrieved</li>
            <li>If any test fails, check the logs for details</li>
          </ol>
        </div>

        {/* Common Issues */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Common Issues</h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-800">
            <li><strong>Table not found:</strong> Run the SQL migration in Supabase SQL Editor</li>
            <li><strong>Missing env vars:</strong> Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li><strong>Connection refused:</strong> Verify Supabase project is active (not paused)</li>
            <li><strong>Permission denied:</strong> Check RLS policies in Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
