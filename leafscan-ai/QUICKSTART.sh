#!/bin/bash

# LeafScan AI - Quick Start Script
# This script helps you set up and run the application quickly

echo "🌿 LeafScan AI - Quick Start Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Setting up environment file..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You need to add your Gemini API key!"
    echo ""
    echo "   1. Get your API key from: https://makersuite.google.com/app/apikey"
    echo "   2. Open the .env file"
    echo "   3. Replace 'your_gemini_api_key_here' with your actual API key"
    echo ""
    read -p "Press Enter after you've added your API key to continue..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "   The app will be available at: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
