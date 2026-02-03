#!/usr/bin/env node

/**
 * Page Warmup Script
 * Hits all pages to force compilation on startup
 */

const http = require('http')

const BASE_URL = 'http://localhost:3000'

const pages = [
  '/',
  '/dashboard',
  '/dashboard/scan',
  '/dashboard/notes',
  '/dashboard/vitals',
  '/dashboard/threat-map',
  '/dashboard/explore',
  '/dashboard/history',
  '/auth/login',
  '/auth/signup',
]

console.log('🚀 Starting page warmup...\n')

let completed = 0
const total = pages.length

pages.forEach((page, index) => {
  setTimeout(() => {
    const url = `${BASE_URL}${page}`
    
    http.get(url, (res) => {
      completed++
      const percent = Math.round((completed / total) * 100)
      console.log(`✅ [${percent}%] Warmed up: ${page}`)
      
      if (completed === total) {
        console.log('\n🔥 All pages warmed up and ready!')
        console.log('⚡ Your app is now BLAZING FAST!\n')
      }
    }).on('error', (err) => {
      console.log(`⚠️  Failed to warm up ${page}:`, err.message)
    })
  }, index * 200) // 200ms between each request
})
