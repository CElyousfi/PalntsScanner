'use client'

import React from 'react'
import { useNotes } from '@/context/NotesContext'
import { Download, Upload } from 'lucide-react'

export default function ExportImport() {
  const { notes, folders } = useNotes()

  const handleExport = () => {
    const data = {
      notes,
      folders,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `farm-notes-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        // Import notes
        if (data.notes) {
          data.notes.forEach((note: any) => {
            localStorage.setItem(`leafscan_farm_notes`, JSON.stringify([
              ...notes,
              ...data.notes
            ]))
          })
        }

        alert('Notes imported successfully! Please refresh the page.')
      } catch (error) {
        alert('Error importing notes. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
      >
        <Download className="w-4 h-4" />
        Export All
      </button>
      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm cursor-pointer">
        <Upload className="w-4 h-4" />
        Import
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  )
}
