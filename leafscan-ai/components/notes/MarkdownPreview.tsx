'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import TurndownService from 'turndown'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

// Extract plain text from HTML and treat it as markdown
function extractMarkdownFromHTML(html: string): string {
  // Create a temporary div to parse HTML
  if (typeof window === 'undefined') return html
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Get the text content (this strips all HTML tags)
  let text = tempDiv.textContent || tempDiv.innerText || ''
  
  // Clean up the text
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ') // Non-breaking space
    .trim()
  
  // Fix chart blocks - wrap inline chart JSON in proper code fences
  text = text.replace(/chart\s*\{\s*"type":/g, (match, offset) => {
    // Find the end of the JSON object
    let braceCount = 0
    let endIndex = offset + match.length
    let inString = false
    
    for (let i = offset + match.length; i < text.length; i++) {
      const char = text[i]
      
      if (char === '"' && text[i - 1] !== '\\') {
        inString = !inString
      }
      
      if (!inString) {
        if (char === '{') braceCount++
        if (char === '}') {
          braceCount--
          if (braceCount === -1) {
            endIndex = i + 1
            break
          }
        }
      }
    }
    
    return '\n\n```chart\n{ "type":'
  })
  
  // Close chart blocks
  text = text.replace(/(\}\s*\}\s*)\s*The chart/g, '\n}\n```\n\nThe chart')
  
  return text
}

// Convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  // First, try to extract plain markdown text from HTML
  const extracted = extractMarkdownFromHTML(html)
  
  // If the extracted text looks like markdown (has # or ## or - or *), use it directly
  if (extracted.includes('#') || extracted.includes('```') || extracted.match(/^[-*]\s/m)) {
    console.log('Using extracted markdown directly')
    return extracted
  }
  
  // Otherwise, use Turndown for proper HTML conversion
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-',
    hr: '---'
  })
  
  // Preserve chart blocks - look for code blocks with chart JSON
  turndownService.addRule('chartBlock', {
    filter: (node) => {
      if (node.nodeName === 'PRE' || node.nodeName === 'CODE') {
        const text = node.textContent || ''
        return text.includes('"type"') && text.includes('"data"')
      }
      return false
    },
    replacement: (content) => {
      const cleaned = content.trim()
      return '\n\n```chart\n' + cleaned + '\n```\n\n'
    }
  })
  
  // Handle checkboxes
  turndownService.addRule('checkbox', {
    filter: (node) => {
      return node.nodeName === 'INPUT' && (node as HTMLInputElement).type === 'checkbox'
    },
    replacement: (content, node) => {
      const checked = (node as HTMLInputElement).checked
      return checked ? '[x]' : '[ ]'
    }
  })
  
  let markdown = turndownService.turndown(html)
  
  // Clean up common issues
  markdown = markdown
    .replace(/<p>/g, '\n\n')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<br>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  return markdown
}

// Chart Renderer Component
function ChartRenderer({ data }: { data: string }) {
  try {
    console.log('Chart data received:', data)
    
    // Clean up the data
    let cleanData = data.trim()
    
    // Remove any markdown code fence markers
    cleanData = cleanData.replace(/```chart\n?/g, '').replace(/```\n?/g, '')
    
    // Try to extract JSON if it's wrapped in text
    const jsonMatch = cleanData.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanData = jsonMatch[0]
    }
    
    console.log('Cleaned chart data:', cleanData)
    
    const chartConfig = JSON.parse(cleanData)
    console.log('Parsed chart config:', chartConfig)
    
    const { type, title, data: chartData } = chartConfig

    const COLORS = ['#6BBF59', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

    // Convert chart.js format to recharts format
    const datasets = chartData.datasets || []
    const labels = chartData.labels || []
    
    // Transform data for recharts
    const transformedData = labels.map((label: string, index: number) => {
      const point: any = { name: label }
      datasets.forEach((dataset: any, datasetIndex: number) => {
        point[dataset.label || `Series ${datasetIndex + 1}`] = dataset.data[index]
      })
      return point
    })

    return (
      <div className="my-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        {title && <h4 className="text-lg font-semibold mb-4 text-gray-800">{title}</h4>}
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' && (
            <LineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              {datasets.map((dataset: any, index: number) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Series ${index + 1}`}
                  stroke={dataset.borderColor || COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: dataset.borderColor || COLORS[index % COLORS.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          )}
          
          {type === 'area' && (
            <AreaChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              {datasets.map((dataset: any, index: number) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Series ${index + 1}`}
                  stroke={dataset.borderColor || COLORS[index % COLORS.length]}
                  fill={dataset.backgroundColor || COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          )}
          
          {type === 'bar' && (
            <BarChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              {datasets.map((dataset: any, index: number) => (
                <Bar
                  key={index}
                  dataKey={dataset.label || `Series ${index + 1}`}
                  fill={dataset.backgroundColor || COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          )}
          
          {type === 'donut' && (
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey={datasets[0]?.label || 'value'}
                label
              >
                {transformedData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  } catch (error) {
    console.error('Chart rendering error:', error)
    console.error('Failed data:', data)
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600 font-semibold mb-2">Failed to render chart</p>
        <p className="text-xs text-red-500 font-mono">{error instanceof Error ? error.message : 'Check JSON format'}</p>
        <details className="mt-2">
          <summary className="text-xs text-red-600 cursor-pointer">Show raw data</summary>
          <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">{data}</pre>
        </details>
      </div>
    )
  }
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Convert HTML to Markdown if needed
  const markdownContent = useMemo(() => {
    if (!content) return ''
    
    // Check if content is HTML (contains HTML tags)
    const hasHTMLTags = /<[^>]+>/.test(content)
    
    if (hasHTMLTags) {
      console.log('Converting HTML to Markdown...')
      const converted = htmlToMarkdown(content)
      console.log('Converted:', converted.substring(0, 200))
      return converted
    }
    
    return content
  }, [content])

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headers
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mb-4 mt-8 text-gray-900 border-b-2 border-gray-200 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-semibold mb-3 mt-6 text-gray-800" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-medium mb-2 mt-4 text-gray-700" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-medium mb-2 mt-3 text-gray-700" {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-base mb-4 leading-relaxed text-gray-700" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
          ),
          li: ({ node, children, ...props }) => {
            // Check if it's a task list item
            const content = String(children)
            if (content.includes('[x]') || content.includes('[ ]')) {
              const isChecked = content.includes('[x]')
              const text = content.replace(/\[x\]|\[ \]/g, '').trim()
              return (
                <li className="flex items-center gap-2 mb-2" {...props}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className={isChecked ? 'line-through text-gray-500' : ''}>{text}</span>
                </li>
              )
            }
            return <li className="mb-1" {...props}>{children}</li>
          },
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" {...props} />
          ),
          
          // Code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            // Check if it's a chart block
            if (language === 'chart') {
              return <ChartRenderer data={String(children).trim()} />
            }
            
            // Regular code block
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="rounded-lg my-4"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            }
            
            // Inline code
            return (
              <code className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-green-500 pl-4 py-2 my-4 bg-green-50 text-gray-700 italic" {...props} />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t-2 border-gray-200" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a className="text-green-600 hover:text-green-700 underline font-medium" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),
          
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700" {...props} />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  )
}
