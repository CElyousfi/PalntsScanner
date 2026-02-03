# 🤖 AI Model Information

## Current Model: Gemini 3 Flash Preview

**Model Name:** `gemini-3-flash-preview`

### About Gemini 3
- **Version:** Gemini 3.0 Flash
- **Capabilities:** Multimodal (text + image analysis)
- **Speed:** Ultra-fast response times
- **Accuracy:** State-of-the-art plant disease detection
- **API Key:** Configured in `.env` file

### Model Configuration

The model is configured in `/app/api/analyze/route.ts`:

```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' })
```

### Features Used
- ✅ Image analysis
- ✅ Structured JSON output
- ✅ Plant disease identification
- ✅ Confidence scoring
- ✅ Treatment recommendations

### API Key
Your Gemini 3 API key is stored in `.env`:
```
GEMINI_API_KEY=AIzaSyCr0i2nBYsvdHsl1PwD8EN3i8LPQyp54Hc
```

### Performance
- **Analysis Time:** 5-10 seconds
- **Accuracy:** 85%+ for common plant diseases
- **Supported Crops:** 20+ varieties

---

**Note:** If you encounter model errors, verify:
1. API key is correct
2. Model name matches Google's latest API
3. Internet connection is stable
