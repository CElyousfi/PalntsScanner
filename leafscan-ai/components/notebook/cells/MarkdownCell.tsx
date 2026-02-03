'use client'

import { useState, useEffect, useRef } from 'react'
import MarkdownPreview from '@/components/notes/MarkdownPreview'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Code, Link, Quote } from 'lucide-react'

interface MarkdownCellProps {
  content: string
  mode: 'edit' | 'view'
  onChange: (content: string) => void
  onRun: () => void
}

export default function MarkdownCell({ content, mode, onChange, onRun }: MarkdownCellProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mode === 'edit' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [mode])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      onRun()
    }
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newText = content.substring(0, lineStart) + prefix + content.substring(lineStart)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  if (mode === 'edit') {
    return (
      <div className="markdown-cell-edit">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
          <button
            onClick={() => insertAtLineStart('# ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertAtLineStart('## ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertAtLineStart('### ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4 text-gray-700" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Code"
          >
            <Code className="w-4 h-4 text-gray-700" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <button
            onClick={() => insertAtLineStart('- ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertAtLineStart('1. ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertAtLineStart('- [ ] ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Checklist"
          >
            <span className="text-xs font-bold text-gray-700">☐</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <button
            onClick={() => insertMarkdown('[', '](url)')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Link"
          >
            <Link className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => insertAtLineStart('> ')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4 text-gray-700" />
          </button>
          
          <div className="flex-1" />
          
          <span className="text-xs text-gray-500">Shift+Enter to render</span>
        </div>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[120px] p-4 border-0 focus:outline-none focus:ring-0 font-mono text-sm resize-y"
          placeholder="Type your content here... Use the toolbar above for formatting"
        />
      </div>
    )
  }

  return (
    <div className="markdown-cell-view p-4 min-h-[60px]">
      {content ? (
        <MarkdownPreview content={content} />
      ) : (
        <p className="text-gray-400 italic">Empty cell - click edit to add content</p>
      )}
    </div>
  )
}
