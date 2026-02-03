'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react'

interface ImageCellProps {
  content: string
  mode: 'edit' | 'view'
  onChange: (content: string) => void
  onRun: () => void
}

export default function ImageCell({ content, mode, onChange, onRun }: ImageCellProps) {
  const [imageUrl, setImageUrl] = useState(content)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Parse content if it contains caption
    if (content.includes('|||')) {
      const [url, cap] = content.split('|||')
      setImageUrl(url)
      setCaption(cap || '')
    } else {
      setImageUrl(content)
      setCaption('')
    }
  }, [content])

  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    setError(null)
  }

  const handleCaptionChange = (cap: string) => {
    setCaption(cap)
  }

  const handleSave = () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    const newContent = caption ? `${imageUrl}|||${caption}` : imageUrl
    onChange(newContent)
    onRun()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Create a local URL for the image
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setImageUrl(dataUrl)
      setError(null)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            setImageUrl(dataUrl)
            setError(null)
          }
          reader.readAsDataURL(file)
        }
        break
      }
    }
  }

  if (mode === 'edit') {
    return (
      <div className="image-cell-edit p-4">
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onPaste={handlePaste}
                placeholder="https://example.com/image.jpg or paste image"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                title="Upload image"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="Add a caption for your image"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={caption || 'Preview'}
                  className="max-w-full h-auto rounded-lg"
                  onError={() => setError('Failed to load image')}
                />
                {caption && (
                  <p className="text-sm text-gray-600 mt-2 text-center italic">
                    {caption}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Paste image, enter URL, or upload file
            </p>
            <button
              onClick={handleSave}
              disabled={!imageUrl.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Save Image
            </button>
          </div>
        </div>
      </div>
    )
  }

  // View mode
  if (!content) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">No image added</p>
            <p className="text-xs text-gray-400">Click edit to add an image</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse content
  const [url, cap] = content.includes('|||') ? content.split('|||') : [content, '']

  return (
    <div className="image-cell-view p-4">
      <div className="flex justify-center">
        <div className="max-w-full">
          <img
            src={url}
            alt={cap || 'Image'}
            className="max-w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E'
            }}
          />
          {cap && (
            <p className="text-sm text-gray-600 mt-3 text-center italic">
              {cap}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
