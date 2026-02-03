'use client'

import { Play, Edit3, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react'

interface CellToolbarProps {
  mode: 'edit' | 'view'
  onRun: () => void
  onToggleMode: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export default function CellToolbar({
  mode,
  onRun,
  onToggleMode,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: CellToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      {/* Run/View Toggle */}
      <button
        onClick={onRun}
        className="p-1.5 hover:bg-green-100 rounded transition-colors text-green-600"
        title="Run cell (Shift+Enter)"
      >
        <Play className="w-4 h-4" />
      </button>

      {/* Edit/View Toggle */}
      <button
        onClick={onToggleMode}
        className="p-1.5 hover:bg-blue-100 rounded transition-colors text-blue-600"
        title={mode === 'edit' ? 'View mode' : 'Edit mode'}
      >
        {mode === 'edit' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
      </button>

      <div className="flex-1" />

      {/* Move buttons */}
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-600"
        title="Delete cell"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
