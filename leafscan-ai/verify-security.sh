#!/bin/bash

# 🔒 Security Verification Script
# Run this before pushing to GitHub

echo "🔍 Checking API Key Security..."
echo ""

# Check 1: .gitignore
echo "✓ Check 1: Verifying .gitignore..."
if grep -q ".env" .gitignore; then
    echo "  ✅ .gitignore properly configured"
else
    echo "  ❌ WARNING: .gitignore missing env file patterns!"
    exit 1
fi

# Check 2: Git status
echo ""
echo "✓ Check 2: Checking git status..."
if git status | grep -q ".env"; then
    echo "  ❌ WARNING: .env files are staged for commit!"
    echo "  Run: git reset HEAD .env*"
    exit 1
else
    echo "  ✅ No .env files staged"
fi

# Check 3: Hardcoded API keys
echo ""
echo "✓ Check 3: Scanning for hardcoded API keys..."
if grep -r "AIzaSy" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v ".next"; then
    echo "  ❌ WARNING: Found hardcoded API keys in source code!"
    exit 1
else
    echo "  ✅ No hardcoded API keys found"
fi

# Check 4: Git history
echo ""
echo "✓ Check 4: Checking git history..."
if git log --all --full-history -- .env .env.local 2>/dev/null | grep -q "commit"; then
    echo "  ❌ WARNING: .env files found in git history!"
    echo "  You may need to remove them from history"
    exit 1
else
    echo "  ✅ No .env files in git history"
fi

# Check 5: .env.example
echo ""
echo "✓ Check 5: Verifying .env.example..."
if grep -q "your_.*_here" .env.example; then
    echo "  ✅ .env.example contains placeholder values"
else
    echo "  ⚠️  WARNING: .env.example may contain real API keys!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL SECURITY CHECKS PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Safe to push to GitHub!"
echo ""
echo "Current changes ready to commit:"
git status --short
