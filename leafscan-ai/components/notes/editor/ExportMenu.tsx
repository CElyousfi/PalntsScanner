'use client'

import { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import { Editor } from '@tiptap/react'

interface ExportMenuProps {
  editor: Editor | null
  noteTitle: string
}

export default function ExportMenu({ editor, noteTitle }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const exportAsMarkdown = () => {
    if (!editor) return
    
    // Simple HTML to Markdown conversion
    const html = editor.getHTML()
    let markdown = html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${noteTitle || 'note'}.md`
    a.click()
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  const exportAsHTML = () => {
    if (!editor) return
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${noteTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
    code { background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    blockquote { border-left: 4px solid #6BBF59; padding-left: 1rem; color: #6b7280; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    td, th { border: 1px solid #d1d5db; padding: 0.5rem; }
    th { background: #f3f4f6; font-weight: 700; }
  </style>
</head>
<body>
  <h1>${noteTitle}</h1>
  ${editor.getHTML()}
</body>
</html>
    `
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${noteTitle || 'note'}.html`
    a.click()
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  const exportAsText = () => {
    if (!editor) return
    
    const text = editor.getText()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${noteTitle || 'note'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  if (!editor) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Export note"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={exportAsMarkdown}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Markdown (.md)
            </button>
            <button
              onClick={exportAsHTML}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <File className="w-4 h-4" />
              HTML (.html)
            </button>
            <button
              onClick={exportAsText}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Plain Text (.txt)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
