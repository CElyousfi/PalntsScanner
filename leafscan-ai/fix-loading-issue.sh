#!/bin/bash

# Fix for infinite loading screen
echo "🔧 Fixing LeafScan AI loading issue..."

# 1. Stop all Next.js processes
echo "Stopping Next.js processes..."
pkill -f "next dev" || true

# 2. Clear build cache
echo "Clearing build cache..."
rm -rf .next

# 3. Clear node_modules cache (if needed)
# echo "Clearing node modules cache..."
# rm -rf node_modules/.cache

# 4. Restart dev server
echo "Starting dev server..."
npm run dev
