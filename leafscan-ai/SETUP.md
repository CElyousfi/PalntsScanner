# 🚀 LeafScan AI - Complete Setup Guide

## Step-by-Step Installation

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (keep it secure!)

### 2. Install Dependencies

```bash
cd leafscan-ai
npm install
```

This will install all required packages:
- Next.js & React
- Gemini AI SDK
- Tailwind CSS
- Lucide Icons
- react-dropzone
- html2pdf.js

### 3. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Important:** Never commit your `.env` file to version control!

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

### 5. Test the Application

1. Open http://localhost:3000 in your browser
2. Download a sample plant disease image from [PlantVillage](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)
3. Upload the image using drag-and-drop
4. Wait for AI analysis (5-10 seconds)
5. Review the comprehensive diagnosis report

## 🔧 Troubleshooting

### Issue: "Cannot find module 'next'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "GEMINI_API_KEY is not defined"

**Solution:**
1. Ensure `.env` file exists in project root
2. Check that the API key is correctly formatted
3. Restart the development server after adding the key

### Issue: "API request failed"

**Solution:**
1. Verify your API key is valid
2. Check your internet connection
3. Ensure you haven't exceeded Gemini API rate limits
4. Try with a smaller image (< 5MB)

### Issue: "Image upload not working"

**Solution:**
1. Ensure image is in supported format (JPEG, PNG, WebP)
2. Check image size is under 10MB
3. Try a different browser
4. Clear browser cache

## 📦 Production Build

To create a production build:

```bash
npm run build
npm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Easiest)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variable in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your key

### Option 2: Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Add environment variable in Netlify dashboard

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t leafscan-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key leafscan-ai
```

## 🧪 Testing with Sample Images

Download sample plant disease images:

1. **Tomato Late Blight:**
   - Search: "tomato late blight leaf"
   - Expected: High severity, fungal disease

2. **Healthy Leaf:**
   - Search: "healthy plant leaf"
   - Expected: No disease detected

3. **Corn Rust:**
   - Search: "corn rust disease"
   - Expected: Medium severity, fungal infection

## 📊 Performance Optimization

### Reduce API Costs

- Use Gemini 1.5 Flash (faster, cheaper)
- Implement image compression before upload
- Cache common diagnoses

### Improve Speed

- Enable Next.js image optimization
- Use CDN for static assets
- Implement lazy loading

## 🔒 Security Best Practices

1. **Never expose API key in client-side code**
   - All API calls go through `/api/analyze` route
   - Key is stored server-side only

2. **Implement rate limiting**
   - Prevent abuse of your API quota
   - Use middleware for request throttling

3. **Validate uploads**
   - Check file types and sizes
   - Scan for malicious content

## 📈 Monitoring

### Track API Usage

Check your Gemini API usage:
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Dashboard
3. Monitor request counts and quotas

### Error Logging

Add error tracking (optional):

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js` for production error monitoring.

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Gemini API Guide](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Plant Disease Recognition](https://plantvillage.psu.edu/)

## 💡 Tips for Best Results

1. **Image Quality:**
   - Use well-lit, clear photos
   - Focus on affected areas
   - Avoid blurry images

2. **Crop Selection:**
   - Include full leaf in frame
   - Show symptoms clearly
   - Avoid excessive background

3. **Multiple Angles:**
   - Upload different views if first diagnosis is unclear
   - Compare results for accuracy

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Review error messages in browser console
3. Check API key validity
4. Verify all dependencies are installed
5. Try with a fresh install

---

**Ready to diagnose plant diseases with AI! 🌿**
