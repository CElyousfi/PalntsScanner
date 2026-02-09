'use client'

import React, { useState } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useAutonomy } from '@/context/AutonomyContext'
import {
  Sparkles, Loader2, X, TrendingUp, FileText,
  BarChart3, Calendar, Leaf, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react'
import { generateNotebookContent } from '@/lib/ai/notebookGenerator'
import { Notebook } from '@/types/notebook'

// Helper: Parse Notebook
function parseNotebook(content: string): Notebook | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed.cells && Array.isArray(parsed.cells)) {
      return parsed as Notebook
    }
  } catch { }
  return null
}

export default function AIAssistant() {
  const { activeNote, updateNote, isAIAssistantOpen, toggleAIAssistant } = useNotes()
  const { activeProfile, system } = useAutonomy()
  const [isLoading, setIsLoading] = useState(false)
  const [lastAdded, setLastAdded] = useState<number>(0)

  // Get scan data if note is linked to a scan
  const scanData = activeNote?.scanId
    ? system?.history?.find(h => h.id === activeNote.scanId)
    : null

  const handleAddCells = async (prompt: string) => {
    if (!activeNote || isLoading) return

    setIsLoading(true)

    try {
      // Parse current notebook
      const currentNotebook = parseNotebook(activeNote.content)

      // Generate new cells
      const newCells = await generateNotebookContent({
        prompt,
        currentNotebook: currentNotebook || undefined,
        farmProfile: activeProfile,
        scanData: scanData || undefined
      })

      if (newCells.length === 0) {
        setIsLoading(false)
        return
      }

      // Append cells to notebook
      const existingCells = currentNotebook?.cells || []
      const updatedNotebook: Notebook = {
        id: activeNote.id,
        title: activeNote.title,
        cells: [...existingCells, ...newCells],
        metadata: {
          created: currentNotebook?.metadata?.created || new Date(),
          modified: new Date(),
          tags: currentNotebook?.metadata?.tags || activeNote.tags || [],
          version: currentNotebook?.metadata?.version || '1.0',
          scanId: currentNotebook?.metadata?.scanId,
          scanType: currentNotebook?.metadata?.scanType,
          image: currentNotebook?.metadata?.image,
          scanData: currentNotebook?.metadata?.scanData
        }
      }

      updateNote(activeNote.id, { content: JSON.stringify(updatedNotebook, null, 2) })
      setLastAdded(newCells.length)

      // Clear success message after 3s
      setTimeout(() => setLastAdded(0), 3000)

    } catch (error) {
      console.error('AI Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Dynamic questions based on scan type
  const quickActions = scanData
    ? (scanData.scanType === 'crop'
      ? [
        { icon: FileText, label: 'What produce is this?', prompt: 'what type of vegetable is present in the picture' },
        { icon: AlertTriangle, label: 'List all defects', prompt: 'what are all the defects and issues found' },
        { icon: CheckCircle2, label: 'Is it safe to eat?', prompt: 'is this produce safe to consume' },
        { icon: TrendingUp, label: 'Quality assessment', prompt: 'provide detailed quality assessment' },
        { icon: Leaf, label: 'Storage tips', prompt: 'how should I store this produce' },
        { icon: Calendar, label: 'Shelf life estimate', prompt: 'how long will this last' }
      ]
      : [
        { icon: AlertTriangle, label: 'What disease is this?', prompt: 'what disease or problem was detected' },
        { icon: FileText, label: 'Treatment options', prompt: 'what are the treatment options' },
        { icon: Leaf, label: 'Symptoms explained', prompt: 'explain all the symptoms observed' },
        { icon: CheckCircle2, label: 'Prevention tips', prompt: 'how can I prevent this in the future' },
        { icon: TrendingUp, label: 'Severity analysis', prompt: 'how severe is this problem' },
        { icon: Calendar, label: 'Action timeline', prompt: 'what should I do and when' }
      ])
    : [
      { icon: TrendingUp, label: 'Growth Analysis', prompt: 'Generate growth analysis with charts' },
      { icon: BarChart3, label: 'Full Report', prompt: 'Create full report with all charts and analysis' },
      { icon: AlertTriangle, label: 'Risk Assessment', prompt: 'Generate risk assessment report' },
      { icon: Calendar, label: 'Task List', prompt: 'Create daily task list' },
      { icon: FileText, label: 'Health Status', prompt: 'Generate health status report' },
      { icon: Leaf, label: 'Recommendations', prompt: 'Generate AI recommendations' }
    ]

  if (!isAIAssistantOpen) {
    return (
      <button
        onClick={toggleAIAssistant}
        className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl hover:scale-105 hover:shadow-emerald-500/30 transition-all flex items-center justify-center z-50 group"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-gray-100/50 shadow-2xl shadow-black/5 flex flex-col h-full font-sans">

      {/* Header */}
      <div className="p-6 border-b border-gray-100/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-apeel-green/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-apeel-green" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-apeel-green text-xl leading-tight">Add Cells</h3>
              <p className="text-xs text-gray-400 font-medium">AI-Powered Content</p>
            </div>
          </div>
          <button
            onClick={toggleAIAssistant}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {lastAdded > 0 && (
        <div className="mx-4 mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-1 bg-emerald-100 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <span className="text-sm text-emerald-800 font-bold">
            Added {lastAdded} cell{lastAdded !== 1 ? 's' : ''} to notebook
          </span>
        </div>
      )}

      {/* Context Info */}
      {scanData && (
        <div className="mx-4 mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-blue-800 uppercase tracking-wider font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>
              {scanData.scanType === 'crop' ? 'Crop Scan' : 'Leaf Scan'} Linked
            </span>
          </div>
        </div>
      )}

      {/* Add Cells Panel */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          <p className="px-1 text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">
            {scanData ? 'Smart Templates' : 'Quick Actions'}
          </p>

          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleAddCells(action.prompt)}
              disabled={isLoading || !activeNote}
              className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100/80 hover:border-apeel-green/30 rounded-2xl text-left transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-apeel-green/5 transition-colors">
                <action.icon className="w-5 h-5 text-gray-400 group-hover:text-apeel-green flex-shrink-0 transition-colors" />
              </div>
              <span className="text-sm font-bold text-gray-600 group-hover:text-apeel-green flex-1 transition-colors">
                {action.label}
              </span>
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-apeel-green animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-apeel-green opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {!activeNote ? (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-orange-50 text-xs font-bold text-orange-600 border border-orange-100">
              <AlertTriangle className="w-3.5 h-3.5" />
              Select a note first
            </span>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500">
            Click any template to add cells to your notebook
          </div>
        )}
      </div>
    </div>
  )
}
