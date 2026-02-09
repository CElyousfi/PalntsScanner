import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || ''

interface SearchResult {
  title: string
  snippet: string
  url: string
  source: string
}

interface ImageResult {
  url: string
  title: string
  contextLink?: string
}

export async function POST(req: NextRequest) {
  let query = ''
  
  try {
    const body = await req.json()
    query = body.query
    const context = body.context

    if (!query) {
      return NextResponse.json({ success: false, error: 'No query provided' }, { status: 400 })
    }

    console.log('🔍 AI-Powered Knowledge Search for:', query)
    if (context) console.log('📋 Context:', context)

    // Step 1: Fetch web search results
    const searchResults = await performWebSearch(query)
    console.log(`📚 Found ${searchResults.length} search results`)
    
    // Step 2: Fetch relevant images
    console.log('🖼️ Fetching images...')
    const images = await fetchImages(query)
    console.log(`🖼️ Fetched ${images.length} images:`, images.map(img => img.url))
    
    // Step 3: Generate comprehensive AI guide with Gemini 3
    const aiGuide = await generateAIGuide(query, searchResults, images, context)

    // Step 4: Generate smart recommendations
    const recommendations = await generateRecommendations(query, context)

    const finalGuide = {
      ...aiGuide,
      images: images.slice(0, 6), // Top 6 images
      sources: searchResults,
      recommendations
    }

    console.log('✅ Final guide images count:', finalGuide.images.length)
    console.log('✅ Final guide images:', finalGuide.images)

    return NextResponse.json({
      success: true,
      guide: finalGuide
    })

  } catch (error: any) {
    console.error('❌ Knowledge search error:', error)
    
    // Fallback guide
    return NextResponse.json({
      success: true,
      guide: {
        title: query || 'Agricultural Information',
        category: 'Agricultural Information',
        iconType: 'sparkles',
        readTime: '5 min',
        description: `Comprehensive guide about ${query || 'agriculture'} for agricultural purposes.`,
        tags: ['agriculture', 'guide'],
        createdAt: new Date().toISOString(),
        fullContent: generateFallbackContent(query || 'agriculture'),
        images: [],
        sources: [],
        recommendations: []
      }
    })
  }
}

/**
 * Perform web search using multiple sources
 */
async function performWebSearch(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    // Source 1: Wikipedia
    const wikiResults = await searchWikipedia(query)
    results.push(...wikiResults)

    // Source 2: Google Custom Search (if API key available)
    if (GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      const googleResults = await searchGoogle(query)
      results.push(...googleResults)
    }

    // Source 3: Agricultural databases (FAO, USDA)
    const agResults = await searchAgriculturalSources(query)
    results.push(...agResults)

  } catch (error) {
    console.error('Web search error:', error)
  }

  return results.slice(0, 5) // Top 5 results
}

/**
 * Search Wikipedia API
 */
async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`
    )
    const searchData = await searchResponse.json()

    if (!searchData.query?.search?.length) return []

    const results: SearchResult[] = []

    for (const item of searchData.query.search.slice(0, 2)) {
      const pageTitle = item.title

      // Get full content
      const contentResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`
      )
      const contentData = await contentResponse.json()
      const pages = contentData.query?.pages
      const pageId = Object.keys(pages)[0]
      const extract = pages[pageId]?.extract || item.snippet

      results.push({
        title: pageTitle,
        snippet: extract,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
        source: 'Wikipedia'
      })
    }

    return results
  } catch (error) {
    console.error('Wikipedia search failed:', error)
    return []
  }
}

/**
 * Search Google Custom Search API
 */
async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query + ' agriculture farming')}&num=3`
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return (data.items || []).map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      url: item.link,
      source: 'Web'
    }))
  } catch (error) {
    console.error('Google search failed:', error)
    return []
  }
}

/**
 * Search agricultural databases
 */
async function searchAgriculturalSources(query: string): Promise<SearchResult[]> {
  // Provide curated agricultural resources
  const keywords = query.toLowerCase()
  const results: SearchResult[] = []

  if (keywords.includes('pest') || keywords.includes('disease') || keywords.includes('fungus')) {
    results.push({
      title: 'Plant Disease Management - FAO',
      snippet: 'Integrated Pest Management (IPM) strategies for sustainable agriculture. Learn about biological control, cultural practices, and safe pesticide use.',
      url: 'http://www.fao.org/agriculture/crops/thematic-sitemap/theme/pests/ipm/en/',
      source: 'FAO'
    })
  }

  if (keywords.includes('nutrition') || keywords.includes('fertilizer') || keywords.includes('soil')) {
    results.push({
      title: 'Soil Health and Nutrition - USDA',
      snippet: 'Understanding soil composition, pH levels, nutrient management, and sustainable fertilization practices for optimal crop yields.',
      url: 'https://www.nrcs.usda.gov/wps/portal/nrcs/main/soils/health/',
      source: 'USDA'
    })
  }

  if (keywords.includes('water') || keywords.includes('irrigation')) {
    results.push({
      title: 'Water Management in Agriculture - FAO',
      snippet: 'Efficient irrigation techniques, water conservation strategies, and drought management for sustainable agriculture.',
      url: 'http://www.fao.org/land-water/water/en/',
      source: 'FAO'
    })
  }

  return results
}

/**
 * Fetch relevant images - prioritize Unsplash for guaranteed real photos
 */
async function fetchImages(query: string): Promise<ImageResult[]> {
  const images: ImageResult[] = []
  
  // Strategy 1: Try Unsplash API (always real photos)
  try {
    const unsplashImages = await fetchUnsplashImages(query)
    if (unsplashImages.length > 0) {
      images.push(...unsplashImages)
      console.log(`✅ Got ${unsplashImages.length} real photos from Unsplash`)
    }
  } catch (error) {
    console.error('Unsplash fetch failed:', error)
  }

  // Strategy 2: Try Google Custom Search if we need more
  if (images.length < 6 && GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
    try {
      const googleImages = await fetchGoogleImages(query)
      images.push(...googleImages)
      console.log(`✅ Got ${googleImages.length} photos from Google`)
    } catch (error) {
      console.error('Google images fetch failed:', error)
    }
  }

  return images.slice(0, 6)
}

/**
 * Fetch agricultural photos using Pixabay (free, good agricultural content)
 */
async function fetchUnsplashImages(query: string): Promise<ImageResult[]> {
  try {
    console.log('🔍 Searching Pixabay for:', query)
    
    // Extract key agricultural terms
    const searchTerms = extractKeyTerms(query)
    const searchQuery = searchTerms.join(' ')
    console.log('🎯 Search query:', searchQuery)
    
    try {
      // Pixabay API (free, no rate limits for reasonable use)
      const pixabayResponse = await fetch(
        `https://pixabay.com/api/?key=47580991-7c81e4c72bf7e7af1dde28e62&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&per_page=6&safesearch=true&category=nature`
      )
      
      if (pixabayResponse.ok) {
        const data = await pixabayResponse.json()
        if (data.hits && data.hits.length > 0) {
          console.log(`✅ Found ${data.hits.length} photos from Pixabay`)
          return data.hits.map((hit: any) => ({
            url: hit.largeImageURL || hit.webformatURL,
            title: hit.tags || searchQuery,
            contextLink: hit.pageURL
          }))
        }
      }
    } catch (err) {
      console.log('Pixabay unavailable')
    }
    
    // Fallback: Use verified agricultural photo URLs (all tested and relevant)
    console.log('Using curated agricultural images as fallback')
    const fallbackImages = [
      { url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80', title: 'Fresh vegetables and produce', contextLink: 'https://unsplash.com' },
      { url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&q=80', title: 'Agricultural crop field', contextLink: 'https://unsplash.com' },
      { url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop&q=80', title: 'Wheat field agriculture', contextLink: 'https://unsplash.com' },
      { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop&q=80', title: 'Farm field landscape', contextLink: 'https://unsplash.com' },
      { url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&h=600&fit=crop&q=80', title: 'Tomatoes vegetables', contextLink: 'https://unsplash.com' },
      { url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&h=600&fit=crop&q=80', title: 'Agricultural farming', contextLink: 'https://unsplash.com' }
    ]
    
    return fallbackImages
    
  } catch (error) {
    console.error('❌ Image fetch error:', error)
    return []
  }
}

/**
 * Extract key agricultural terms from query
 */
function extractKeyTerms(query: string): string[] {
  const terms: string[] = []
  const lower = query.toLowerCase()
  
  // Agricultural keywords to focus on
  const keywords = [
    'disease', 'pest', 'fungus', 'blight', 'rot', 'mold', 'insect',
    'tomato', 'potato', 'corn', 'wheat', 'rice', 'vegetable', 'fruit',
    'leaf', 'plant', 'crop', 'seed', 'root', 'stem',
    'soil', 'fertilizer', 'compost', 'irrigation', 'water',
    'harvest', 'planting', 'growing', 'farming',
    'storage', 'produce', 'injury', 'damage', 'quality'
  ]
  
  // Find matching keywords in query
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      terms.push(keyword)
    }
  }
  
  // If no specific keywords, use query words directly
  if (terms.length === 0) {
    terms.push(...query.split(' ').filter(w => w.length > 3))
  }
  
  // Add agriculture context if not present
  if (terms.length > 0 && !terms.some(t => ['crop', 'plant', 'farm', 'agricultural'].includes(t))) {
    terms.push('agriculture')
  }
  
  return terms.slice(0, 5)
}

/**
 * Fetch from Google Custom Search with strict filters
 */
async function fetchGoogleImages(query: string): Promise<ImageResult[]> {
  try {
    // Very specific search to avoid AI art
    const imageQuery = `${query} real photograph agriculture farming -illustration -drawing -vector -art -abstract -digital -render -cgi`

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(imageQuery)}&searchType=image&num=6&imgSize=large&safe=active&imgType=photo&fileType=jpg`
    )

    if (!response.ok) return []

    const data = await response.json()

    // Strict filtering
    const realPhotos = (data.items || [])
      .filter((item: any) => {
        const title = (item.title || '').toLowerCase()
        const snippet = (item.snippet || '').toLowerCase()
        const combined = title + ' ' + snippet
        
        // Exclude AI/digital art keywords
        const excluded = [
          'illustration', 'vector', 'drawing', 'cartoon', 'abstract', 
          'graphic', 'animation', 'ai generated', 'digital art', 'artwork',
          'render', 'cgi', '3d', 'synthetic', 'computer generated'
        ]
        
        return !excluded.some(term => combined.includes(term))
      })
      .map((item: any) => ({
        url: item.link,
        title: item.title,
        contextLink: item.image?.contextLink
      }))

    return realPhotos
  } catch (error) {
    console.error('Google images error:', error)
    return []
  }
}

/**
 * Generate comprehensive AI guide using Gemini 3 Flash
 */
async function generateAIGuide(
  query: string,
  searchResults: SearchResult[],
  images: ImageResult[],
  context?: string
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const sourcesText = searchResults.map((r, i) => 
      `Source ${i + 1} (${r.source}):\nTitle: ${r.title}\nContent: ${r.snippet}\nURL: ${r.url}`
    ).join('\n\n')

    const contextText = context ? `\n\nUser Context: ${context}` : ''

    const prompt = `You are an expert agricultural knowledge assistant. Create a comprehensive, practical guide about "${query}" for farmers and agricultural professionals.

${contextText}

Research Sources:
${sourcesText}

Create a detailed guide with:

1. **Title**: Clear, descriptive title
2. **Description**: 2-sentence engaging summary (max 200 chars)
3. **Read Time**: Estimated time (e.g., "5 min", "10 min")
4. **Tags**: 4-5 relevant keywords
5. **Category**: One of: "Disease Management", "Pest Control", "Soil Health", "Crop Care", "Harvesting", "Storage", "Nutrition", "General Farming"

6. **Full Content**: Well-formatted markdown guide with:
   - Use ## for main sections, ### for subsections
   - Use **bold** for important terms and key concepts
   - Use bullet lists (- item) for steps, features, or lists
   - Use numbered lists (1. item) for sequential steps
   - Write clear, concise paragraphs (2-4 sentences each)
   - Add spacing between sections with blank lines
   - Be practical and actionable
   - Include scientific accuracy from sources
   - Add warnings or important notes where needed
   - Mention when to consult experts

7. **Key Takeaways**: 3-5 most important points (clear, actionable statements)

IMPORTANT FORMATTING RULES:
- Always add blank lines between paragraphs
- Use **bold** for emphasis on key terms
- Keep paragraphs short and scannable
- Use lists for multiple points
- Make content easy to read and professional

Format as JSON:
{
  "title": "string",
  "description": "string",
  "readTime": "string",
  "tags": ["string"],
  "category": "string",
  "fullContent": "markdown string with proper formatting",
  "keyTakeaways": ["string"]
}

Make it practical, scientifically accurate, farmer-friendly, and well-formatted for readability.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(text)

    return {
      ...parsed,
      iconType: 'sparkles',
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('AI guide generation failed:', error)
    
    // Fallback guide
    return {
      title: query,
      category: 'Agricultural Information',
      iconType: 'sparkles',
      readTime: '5 min',
      description: `Comprehensive guide about ${query} based on research.`,
      tags: ['agriculture', 'farming', query.split(' ')[0]],
      createdAt: new Date().toISOString(),
      fullContent: generateFallbackContent(query),
      keyTakeaways: [
        `Understanding ${query} is important for agricultural success`,
        'Consult local agricultural extension services for specific advice',
        'Monitor conditions regularly and take preventive measures'
      ]
    }
  }
}

/**
 * Generate smart recommendations
 */
async function generateRecommendations(query: string, context?: string): Promise<string[]> {
  const recommendations: string[] = []
  const keywords = query.toLowerCase()

  // Context-aware recommendations
  if (keywords.includes('disease') || keywords.includes('blight') || keywords.includes('fungus')) {
    recommendations.push(
      'Find nearby fungicide suppliers',
      'Learn about organic disease prevention',
      'Explore integrated pest management',
      'Identify common plant diseases'
    )
  } else if (keywords.includes('pest') || keywords.includes('insect')) {
    recommendations.push(
      'Search for pesticide suppliers',
      'Learn about beneficial insects',
      'Explore natural pest control',
      'Identify pest life cycles'
    )
  } else if (keywords.includes('soil') || keywords.includes('fertilizer') || keywords.includes('nutrition')) {
    recommendations.push(
      'Find fertilizer suppliers nearby',
      'Learn about soil testing',
      'Explore composting techniques',
      'Understand NPK ratios'
    )
  } else if (keywords.includes('irrigation') || keywords.includes('water')) {
    recommendations.push(
      'Find irrigation equipment suppliers',
      'Learn about drip irrigation',
      'Explore water conservation',
      'Calculate water requirements'
    )
  } else {
    recommendations.push(
      'Explore related agricultural topics',
      'Find nearby agricultural suppliers',
      'Learn about seasonal farming tips',
      'Discover best practices for your crop'
    )
  }

  return recommendations.slice(0, 4)
}

/**
 * Fallback content when AI fails
 */
function generateFallbackContent(query: string): string {
  return `# ${query}

## Overview

This guide provides essential information about ${query} for agricultural applications.

## Key Concepts

Understanding ${query} is crucial for successful farming operations. This topic encompasses various aspects of agricultural practice and requires attention to detail.

## Best Practices

1. **Research Thoroughly**: Consult multiple reliable sources before implementation
2. **Local Conditions**: Consider your specific climate and soil conditions
3. **Expert Consultation**: Work with agricultural extension services
4. **Regular Monitoring**: Keep track of results and adjust practices accordingly

## Important Considerations

- Always follow safety guidelines and regulations
- Consider environmental impact
- Maintain detailed records
- Stay updated with latest research

## Additional Resources

For the most accurate and region-specific information:

- Contact your local agricultural extension office
- Visit [USDA Resources](https://www.usda.gov)
- Explore [FAO Agricultural Portal](http://www.fao.org)
- Consult university agricultural programs

## Need More Help?

Use the search feature to explore related topics, or consult with local agricultural experts for personalized guidance.`
}
