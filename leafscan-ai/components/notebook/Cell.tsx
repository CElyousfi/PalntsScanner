'use client'

import { useState } from 'react'
import { NotebookCell } from '@/types/notebook'
import CellToolbar from './CellToolbar'
import MarkdownCell from './cells/MarkdownCell'
import ChartCell from './cells/ChartCell'
import ImageCell from './cells/ImageCell'

interface CellProps {
  cell: NotebookCell
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<NotebookCell>) => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export default function Cell({
  cell,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown
}: CellProps) {
  const [mode, setMode] = useState<'edit' | 'view'>('view')

  const handleRun = () => {
    setMode('view')
    onUpdate({ metadata: { ...cell.metadata, lastRun: new Date() } })
  }

  const handleToggleMode = () => {
    setMode(mode === 'edit' ? 'view' : 'edit')
  }

  const renderCellContent = () => {
    const commonProps = {
      content: cell.content,
      mode,
      onChange: (content: string) => onUpdate({ content }),
      onRun: handleRun
    }

    switch (cell.type) {
      case 'markdown':
        return <MarkdownCell {...commonProps} />
      case 'chart':
        return <ChartCell {...commonProps} />
      case 'image':
        return <ImageCell {...commonProps} />
      default:
        return (
          <div className="p-4 text-gray-400 italic">
            Cell type "{cell.type}" not yet implemented
          </div>
        )
    }
  }

  return (
    <div
      className={`cell mb-3 bg-white border-2 rounded-lg transition-all overflow-hidden ${
        isSelected
          ? 'border-green-500 shadow-lg ring-2 ring-green-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <CellToolbar
          mode={mode}
          onRun={handleRun}
          onToggleMode={handleToggleMode}
          onDelete={onDelete}
          onMoveUp={() => onMove('up')}
          onMoveDown={() => onMove('down')}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}
      <div className="cell-content">
        {renderCellContent()}
      </div>
      {/* Cell type indicator */}
      <div className="px-3 py-1 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
        <span className="font-medium capitalize">{cell.type} Cell</span>
        {cell.metadata?.lastRun && (
          <span className="text-gray-400">
            Last run: {new Date(cell.metadata.lastRun).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
