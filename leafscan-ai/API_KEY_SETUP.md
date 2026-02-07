# 🔑 API Key Setup Guide

## Quick Start

### 1. Copy the Environment Template
```bash
cp .env.example .env.local
```

### 2. Get Your API Keys

#### Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

#### Supabase Credentials
1. Visit: https://app.supabase.com
2. Go to your project settings → API
3. Copy the Project URL and anon/public key

### 3. Update `.env.local`

Open `.env.local` and replace the placeholder values:

```env
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 4. Verify Security

Run the security check before committing:

```bash
./verify-security.sh
```

You should see:
```
✅ ALL SECURITY CHECKS PASSED!
🚀 Safe to push to GitHub!
```

---

## 🚨 Important Security Notes

### ✅ DO:
- Keep API keys in `.env.local` (gitignored)
- Use environment variables in code: `process.env.GEMINI_API_KEY`
- Run `./verify-security.sh` before pushing to GitHub
- Rotate API keys every 3-6 months

### ❌ DON'T:
- Never commit `.env` or `.env.local` files
- Never hardcode API keys in source code
- Never share API keys in chat/email
- Never push API keys to GitHub

---

## 🔍 Verify Your Setup

### Check 1: Environment File Exists
```bash
ls -la .env.local
# Should show the file
```

### Check 2: API Key is Set
```bash
grep GEMINI_API_KEY .env.local
# Should show: GEMINI_API_KEY=AIzaSy...
```

### Check 3: File is Gitignored
```bash
git status
# .env.local should NOT appear in the list
```

---

## 🐛 Troubleshooting

### "API key not found" Error

**Problem:** The app can't find your API key

**Solution:**
1. Verify `.env.local` exists in the project root
2. Check the key name is exactly `GEMINI_API_KEY`
3. Restart the development server:
   ```bash
   npm run dev
   ```

### "Invalid API key" Error

**Problem:** The API key is incorrect or expired

**Solution:**
1. Generate a new key at https://makersuite.google.com/app/apikey
2. Update `.env.local` with the new key
3. Restart the dev server

### "Rate limit exceeded" Error

**Problem:** Too many API requests

**Solution:**
1. Wait a few minutes
2. Check your quota at https://console.cloud.google.com
3. Consider upgrading your plan if needed

---

## 📦 Deployment

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `GEMINI_API_KEY` = your key
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your key
4. Redeploy

### Netlify
1. Go to Site settings → Build & deploy → Environment
2. Add the same variables as above
3. Trigger a new deploy

---

## 🔐 Security Checklist

Before every push to GitHub:

- [ ] Run `./verify-security.sh`
- [ ] Verify no `.env*` files in `git status`
- [ ] Check no hardcoded keys in code
- [ ] Ensure `.env.example` has placeholders only

---

## 📞 Need Help?

- **Gemini API Issues:** https://ai.google.dev/docs
- **Supabase Issues:** https://supabase.com/docs
- **Security Guide:** See `SECURITY_GUIDE.md`

---

## ✅ You're All Set!

Your API keys are now:
- ✅ Secure (not in git)
- ✅ Private (in `.env.local`)
- ✅ Protected (by `.gitignore`)
- ✅ Ready to use!

Happy coding! 🚀
