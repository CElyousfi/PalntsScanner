'use client'

import { useState, useEffect } from 'react'
import { Notebook, NotebookCell, CellType } from '@/types/notebook'
import Cell from './Cell'
import AddCellMenu from './AddCellMenu'

interface NotebookEditorProps {
  notebook: Notebook
  onChange: (notebook: Notebook) => void
}

export default function NotebookEditor({ notebook, onChange }: NotebookEditorProps) {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCellId) return

      // Shift+Enter: Run cell
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        // Cell handles its own run
      }

      // Delete cell (DD in vim style, or just Delete key)
      if (e.key === 'Delete' && !e.shiftKey && !e.ctrlKey) {
        const activeElement = document.activeElement
        if (activeElement?.tagName !== 'TEXTAREA' && activeElement?.tagName !== 'INPUT') {
          e.preventDefault()
          deleteCell(selectedCellId)
        }
      }

      // Arrow keys to navigate cells
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault()
        const index = notebook.cells.findIndex(c => c.id === selectedCellId)
        if (index > 0) {
          setSelectedCellId(notebook.cells[index - 1].id)
        }
      }

      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault()
        const index = notebook.cells.findIndex(c => c.id === selectedCellId)
        if (index < notebook.cells.length - 1) {
          setSelectedCellId(notebook.cells[index + 1].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCellId, notebook.cells])

  const addCell = (type: CellType, index: number) => {
    const newCell: NotebookCell = {
      id: `cell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: '',
      metadata: {}
    }

    const newCells = [...notebook.cells]
    newCells.splice(index + 1, 0, newCell)

    onChange({
      ...notebook,
      cells: newCells,
      metadata: {
        ...notebook.metadata,
        modified: new Date()
      }
    })

    // Select the new cell
    setSelectedCellId(newCell.id)
  }

  const updateCell = (cellId: string, updates: Partial<NotebookCell>) => {
    const newCells = notebook.cells.map(cell =>
      cell.id === cellId ? { ...cell, ...updates } : cell
    )

    onChange({
      ...notebook,
      cells: newCells,
      metadata: {
        ...notebook.metadata,
        modified: new Date()
      }
    })
  }

  const deleteCell = (cellId: string) => {
    if (notebook.cells.length === 1) {
      // Don't delete the last cell, just clear it
      updateCell(cellId, { content: '' })
      return
    }

    const index = notebook.cells.findIndex(c => c.id === cellId)
    const newCells = notebook.cells.filter(cell => cell.id !== cellId)

    onChange({
      ...notebook,
      cells: newCells,
      metadata: {
        ...notebook.metadata,
        modified: new Date()
      }
    })

    // Select the next or previous cell
    if (index < newCells.length) {
      setSelectedCellId(newCells[index].id)
    } else if (index > 0) {
      setSelectedCellId(newCells[index - 1].id)
    } else {
      setSelectedCellId(null)
    }
  }

  const moveCell = (cellId: string, direction: 'up' | 'down') => {
    const index = notebook.cells.findIndex(cell => cell.id === cellId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= notebook.cells.length) return

    const newCells = [...notebook.cells]
    const [cell] = newCells.splice(index, 1)
    newCells.splice(newIndex, 0, cell)

    onChange({
      ...notebook,
      cells: newCells,
      metadata: {
        ...notebook.metadata,
        modified: new Date()
      }
    })
  }

  // Initialize with one cell if empty
  useEffect(() => {
    if (notebook.cells.length === 0) {
      addCell('markdown', -1)
    }
  }, [])

  return (
    <div className="notebook-editor max-w-4xl mx-auto py-6 px-4">
      {/* Notebook header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {notebook.cells.length} cell{notebook.cells.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Modified: {new Date(notebook.metadata.modified).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="cells-container group">
        {notebook.cells.map((cell, index) => (
          <div key={cell.id} className="cell-wrapper">
            <Cell
              cell={cell}
              isSelected={selectedCellId === cell.id}
              onSelect={() => setSelectedCellId(cell.id)}
              onUpdate={(updates) => updateCell(cell.id, updates)}
              onDelete={() => deleteCell(cell.id)}
              onMove={(direction) => moveCell(cell.id, direction)}
              canMoveUp={index > 0}
              canMoveDown={index < notebook.cells.length - 1}
            />
            <AddCellMenu onAdd={(type) => addCell(type, index)} />
          </div>
        ))}
      </div>

      {/* Help text */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div><kbd className="px-2 py-1 bg-white border rounded">Shift+Enter</kbd> Run cell</div>
          <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+↑/↓</kbd> Navigate cells</div>
          <div><kbd className="px-2 py-1 bg-white border rounded">Delete</kbd> Delete cell</div>
          <div><kbd className="px-2 py-1 bg-white border rounded">Click +</kbd> Add cell</div>
        </div>
      </div>
    </div>
  )
}
