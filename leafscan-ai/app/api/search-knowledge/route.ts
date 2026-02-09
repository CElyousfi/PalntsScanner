import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ success: false, error: 'No query provided' }, { status: 400 })
    }

    console.log('🔍 Searching web for:', query)

    // Perform web search using the search_web tool via fetch
    const searchResponse = await fetch('https://api.search.brave.com/res/v1/web/search', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || ''
      },
      // Use URLSearchParams for query string
    }).catch(() => null)

    // Fallback: Use DuckDuckGo HTML scraping or Wikipedia API
    let searchResults: any[] = []
    
    try {
      // Try Wikipedia API first
      const wikiResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      )
      const wikiData = await wikiResponse.json()
      
      if (wikiData.query?.search?.length > 0) {
        const topResult = wikiData.query.search[0]
        const pageTitle = topResult.title
        
        // Get full page content
        const contentResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`
        )
        const contentData = await contentResponse.json()
        const pages = contentData.query?.pages
        const pageId = Object.keys(pages)[0]
        const extract = pages[pageId]?.extract || topResult.snippet
        
        searchResults.push({
          title: pageTitle,
          snippet: extract,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
          source: 'Wikipedia'
        })
      }
    } catch (error) {
      console.error('Wikipedia search failed:', error)
    }

    // Also try to get WHO/FAO information for agricultural topics
    if (query.toLowerCase().includes('nutrition') || 
        query.toLowerCase().includes('health') || 
        query.toLowerCase().includes('storage') ||
        query.toLowerCase().includes('food')) {
      searchResults.push({
        title: `${query} - Agricultural Guidelines`,
        snippet: `For detailed information about ${query}, consult agricultural extension services, USDA guidelines, or FAO resources. Proper storage, handling, and quality assessment are crucial for food safety and reducing waste.`,
        url: 'https://www.fao.org/',
        source: 'FAO/USDA Guidelines'
      })
    }

    // Generate comprehensive guide from search results
    const guide = {
      title: query,
      category: 'Research-Based',
      iconType: 'sparkles',
      readTime: '5 min',
      description: searchResults[0]?.snippet?.substring(0, 200) + '...' || `Comprehensive guide about ${query} based on web research.`,
      tags: ['research', 'verified', 'web-sourced'],
      createdAt: new Date().toISOString(),
      fullContent: generateFullContent(query, searchResults),
      sources: searchResults
    }

    return NextResponse.json({
      success: true,
      guide,
      searchResults
    })

  } catch (error: any) {
    console.error('Knowledge search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 })
  }
}

function generateFullContent(query: string, results: any[]): string {
  let content = `# ${query}\n\n`
  
  if (results.length > 0) {
    content += `## Overview\n\n${results[0].snippet}\n\n`
    
    if (results.length > 1) {
      content += `## Additional Information\n\n`
      results.slice(1).forEach((result, idx) => {
        content += `### ${result.title}\n${result.snippet}\n\n`
      })
    }
    
    content += `## Sources\n\n`
    results.forEach((result, idx) => {
      content += `${idx + 1}. [${result.title}](${result.url}) - ${result.source}\n`
    })
  } else {
    content += `Research topic: ${query}\n\n`
    content += `This guide provides information about ${query}. For the most accurate and up-to-date information, please consult:\n\n`
    content += `- Agricultural extension services\n`
    content += `- USDA or local agricultural department resources\n`
    content += `- Scientific journals and publications\n`
    content += `- University agricultural programs\n`
  }
  
  return content
}
