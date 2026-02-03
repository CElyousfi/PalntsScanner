'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import { 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, 
  Code, Quote, Heading1, Heading2, Heading3, Table, CheckSquare,
  Upload, BarChart3, Eye, EyeOff
} from 'lucide-react'

export default function MarkdownEditor() {
  const { activeNote, updateNote } = useNotes()
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content)
    }
  }, [activeNote?.id])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    if (activeNote) {
      updateNote(activeNote.id, { content: newContent })
    }
  }, [activeNote, updateNote])

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || placeholder
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    setContent(newContent)
    handleContentChange(newContent)
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }, [content, handleContentChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      insertMarkdown('**', '**', 'bold text')
    }
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      insertMarkdown('*', '*', 'italic text')
    }
    // Ctrl/Cmd + K for link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      insertMarkdown('[', '](url)', 'link text')
    }
    // Ctrl/Cmd + Shift + P for preview toggle
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault()
      setShowPreview(!showPreview)
    }
  }, [insertMarkdown, showPreview])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          insertMarkdown(`![${file.name}](`, ')', imageUrl)
        }
        reader.readAsDataURL(file)
      }
    })
  }, [insertMarkdown])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            insertMarkdown(`![Pasted Image](`, ')', imageUrl)
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }, [insertMarkdown])

  const insertChart = useCallback(() => {
    const chartMarkdown = `
\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "datasets": [{
      "label": "Crop Growth",
      "data": [10, 25, 45, 70]
    }]
  }
}
\`\`\`
`
    insertMarkdown(chartMarkdown, '')
  }, [insertMarkdown])

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No note selected</p>
          <p className="text-sm">Create or select a note to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 flex items-center gap-2 flex-wrap">
        <button onClick={() => insertMarkdown('# ', '', 'Heading 1')} className="p-2 hover:bg-gray-100 rounded" title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('## ', '', 'Heading 2')} className="p-2 hover:bg-gray-100 rounded" title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('### ', '', 'Heading 3')} className="p-2 hover:bg-gray-100 rounded" title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300" />
        
        <button onClick={() => insertMarkdown('**', '**', 'bold text')} className="p-2 hover:bg-gray-100 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('*', '*', 'italic text')} className="p-2 hover:bg-gray-100 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('`', '`', 'code')} className="p-2 hover:bg-gray-100 rounded" title="Code">
          <Code className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300" />
        
        <button onClick={() => insertMarkdown('- ', '', 'List item')} className="p-2 hover:bg-gray-100 rounded" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('1. ', '', 'List item')} className="p-2 hover:bg-gray-100 rounded" title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('- [ ] ', '', 'Task')} className="p-2 hover:bg-gray-100 rounded" title="Checklist">
          <CheckSquare className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300" />
        
        <button onClick={() => insertMarkdown('> ', '', 'Quote')} className="p-2 hover:bg-gray-100 rounded" title="Quote">
          <Quote className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('[', '](url)', 'link text')} className="p-2 hover:bg-gray-100 rounded" title="Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <button onClick={() => insertMarkdown('![', '](url)', 'alt text')} className="p-2 hover:bg-gray-100 rounded" title="Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300" />
        
        <button onClick={insertChart} className="p-2 hover:bg-gray-100 rounded" title="Insert Chart">
          <BarChart3 className="w-4 h-4" />
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded" title="Upload File">
          <Upload className="w-4 h-4" />
        </button>
        
        <div className="flex-1" />
        
        <button 
          onClick={() => setShowPreview(!showPreview)} 
          className={`p-2 rounded ${showPreview ? 'bg-apeel-green text-white' : 'hover:bg-gray-100'}`}
          title={showPreview ? 'Hide Preview' : 'Show Preview'}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
            className="flex-1 p-6 font-mono text-sm resize-none focus:outline-none"
            placeholder="Start writing your farm report in Markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto p-8">
              <div className="bg-white rounded-lg shadow-sm p-8 min-h-full">
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const imageUrl = event.target?.result as string
              insertMarkdown(`![${file.name}](`, ')', imageUrl)
            }
            reader.readAsDataURL(file)
          }
        }}
      />
    </div>
  )
}

// Simple Markdown Preview Component
function MarkdownPreview({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    // Extract and render charts
    const chartRegex = /```chart\n([\s\S]*?)```/g
    const parts: JSX.Element[] = []
    let lastIndex = 0
    let match

    while ((match = chartRegex.exec(text)) !== null) {
      // Add text before chart
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index)
        parts.push(
          <div key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(textBefore) }} />
        )
      }

      // Add chart
      try {
        const chartConfig = JSON.parse(match[1])
        parts.push(
          <div key={`chart-${match.index}`} className="my-4">
            <ChartRenderer config={chartConfig} />
          </div>
        )
      } catch (e) {
        parts.push(
          <div key={`chart-error-${match.index}`} className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Invalid chart configuration
          </div>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex)
      parts.push(
        <div key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(textAfter) }} />
      )
    }

    return <>{parts}</>
  }

  const renderBasicMarkdown = (text: string) => {
    // Split into lines for better processing
    const lines = text.split('\n')
    let html = ''
    let inList = false
    let inOrderedList = false
    let listItems: string[] = []

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      // Skip empty lines in lists
      if (line.trim() === '' && (inList || inOrderedList)) {
        if (listItems.length > 0) {
          if (inList) {
            html += '<ul class="list-disc list-inside space-y-1 my-3 ml-4">' + listItems.join('') + '</ul>'
          } else {
            html += '<ol class="list-decimal list-inside space-y-1 my-3 ml-4">' + listItems.join('') + '</ol>'
          }
          listItems = []
        }
        inList = false
        inOrderedList = false
        html += '<br />'
        continue
      }

      // Headers
      if (line.startsWith('### ')) {
        html += `<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">${line.substring(4)}</h3>`
      } else if (line.startsWith('## ')) {
        html += `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${line.substring(3)}</h2>`
      } else if (line.startsWith('# ')) {
        html += `<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-5">${line.substring(2)}</h1>`
      }
      // Checkboxes
      else if (line.match(/^- \[ \] /)) {
        const content = line.substring(6)
        html += `<div class="flex items-center gap-2 my-2"><input type="checkbox" disabled class="w-4 h-4 rounded border-gray-300" /> <span class="text-gray-700">${processInlineMarkdown(content)}</span></div>`
      } else if (line.match(/^- \[x\] /)) {
        const content = line.substring(6)
        html += `<div class="flex items-center gap-2 my-2"><input type="checkbox" checked disabled class="w-4 h-4 rounded border-gray-300" /> <span class="text-gray-500 line-through">${processInlineMarkdown(content)}</span></div>`
      }
      // Unordered lists
      else if (line.match(/^- /)) {
        if (!inList) {
          inList = true
          listItems = []
        }
        const content = line.substring(2)
        listItems.push(`<li class="text-gray-700">${processInlineMarkdown(content)}</li>`)
      }
      // Ordered lists
      else if (line.match(/^\d+\. /)) {
        if (!inOrderedList) {
          inOrderedList = true
          listItems = []
        }
        const content = line.substring(line.indexOf('. ') + 2)
        listItems.push(`<li class="text-gray-700">${processInlineMarkdown(content)}</li>`)
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        html += `<blockquote class="border-l-4 border-apeel-green bg-green-50 pl-4 py-2 italic text-gray-700 my-3 rounded-r">${processInlineMarkdown(line.substring(2))}</blockquote>`
      }
      // Horizontal rule
      else if (line.match(/^---+$/)) {
        html += '<hr class="my-6 border-gray-300" />'
      }
      // Regular paragraph
      else if (line.trim() !== '') {
        // Close any open lists
        if (inList || inOrderedList) {
          if (listItems.length > 0) {
            if (inList) {
              html += '<ul class="list-disc list-inside space-y-1 my-3 ml-4">' + listItems.join('') + '</ul>'
            } else {
              html += '<ol class="list-decimal list-inside space-y-1 my-3 ml-4">' + listItems.join('') + '</ol>'
            }
            listItems = []
          }
          inList = false
          inOrderedList = false
        }
        html += `<p class="text-gray-700 leading-relaxed my-2">${processInlineMarkdown(line)}</p>`
      } else {
        html += '<br />'
      }
    }

    // Close any remaining lists
    if (listItems.length > 0) {
      if (inList) {
        html += '<ul class="list-disc list-inside space-y-1 my-3 ml-4">' + listItems.join('') + '</ul>'
      } else {
        html += '<ol class="list-decimal list-inside space-y-1 my-3 ml-4">' + listItems.join('') + '</ol>'
      }
    }

    return html
  }

  // Process inline markdown (bold, italic, code, links, images)
  const processInlineMarkdown = (text: string) => {
    return text
      // Images (must come before links)
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-md my-4 inline-block" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-apeel-green hover:underline font-medium">$1</a>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Inline code
      .replace(/`(.*?)`/g, '<code class="px-2 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">$1</code>')
  }

  return <div className="prose prose-sm max-w-none">{renderMarkdown(content)}</div>
}

// Import ChartRenderer
import ChartRenderer from './ChartRenderer'
