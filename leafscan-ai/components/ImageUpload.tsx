'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FileImage, Leaf } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  variant?: 'default' | 'minimal'
}

import { useLowDataMode } from '@/hooks/useLowDataMode'

export default function ImageUpload({ onImageUpload, variant = 'default' }: ImageUploadProps) {
  const isLowData = useLowDataMode()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Validate file size (max 5MB in low data mode, else 10MB)
      const maxSize = isLowData ? 5 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`File size must be less than ${isLowData ? '5MB (Low Data Mode)' : '10MB'}`)
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      onImageUpload(file)
    }
  }, [onImageUpload, isLowData])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  // LOW DATA MODE VARIANT
  if (isLowData) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-4 font-bold flex items-center gap-2">
          <Leaf className="w-4 h-4" /> Low Data Mode Active: Simplified Interface
        </div>

        <div
          {...getRootProps()}
          className="card cursor-pointer border-2 border-dashed border-apeel-green/50 p-8 flex flex-col items-center justify-center bg-white text-center"
        >
          <input {...getInputProps()} />
          <Camera className="w-12 h-12 text-apeel-green mb-4" />
          <p className="font-bold text-lg">Tap to Take Photo / Upload</p>
          <p className="text-sm text-gray-500 mt-2">Max 5MB</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {variant === 'default' && (
        <div className="mb-6">
          <div className="inline-block px-3 py-1 mb-3 border border-apeel-green/20 rounded-full">
            <span className="text-xs font-bold tracking-widest uppercase text-apeel-green">Step 01: Analysis</span>
          </div>
          <h3 className="text-2xl font-bold text-apeel-green mb-2">Upload Sample</h3>
          <p className="text-apeel-green/60 text-sm">Upload a clear photo of the affected leaf for instant AI diagnosis.</p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`card cursor-pointer border-2 border-dashed min-h-[300px] flex flex-col items-center justify-center transition-all duration-500 group relative overflow-hidden ${isDragActive
          ? 'border-apeel-green bg-apeel-green/5'
          : 'border-apeel-green/30 hover:border-apeel-green hover:bg-white/50'
          }`}
      >
        <input {...getInputProps()} />

        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-24 h-24 bg-apeel-accent/20 blur-2xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-apeel-green/10 blur-3xl rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          {isDragActive ? (
            <>
              <div className="w-20 h-20 rounded-full bg-apeel-green/20 flex items-center justify-center animate-bounce">
                <FileImage className="w-10 h-10 text-apeel-green" />
              </div>
              <p className="text-xl font-bold text-apeel-green">Drop it here</p>
              <p className="text-sm text-apeel-green/60 mt-1">Ready to analyze</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-apeel-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-apeel-green group-hover:text-apeel-green transition-colors" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-bold text-apeel-green">
                  Drag & Drop <br /><span className="font-normal text-base">or click to browse</span>
                </p>
              </div>

              <div className="flex gap-4 items-center justify-center">
                <div className="px-4 py-2 bg-white/80 rounded-lg text-xs font-mono text-apeel-green/50 border border-apeel-green/5">JPG</div>
                <div className="px-4 py-2 bg-white/80 rounded-lg text-xs font-mono text-apeel-green/50 border border-apeel-green/5">PNG</div>
                <div className="px-4 py-2 bg-white/80 rounded-lg text-xs font-mono text-apeel-green/50 border border-apeel-green/5">WEBP</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
