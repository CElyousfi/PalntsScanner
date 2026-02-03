'use client'

import { useState } from 'react'
import { Plus, FileText, BarChart3, Table, Image as ImageIcon } from 'lucide-react'
import { CellType } from '@/types/notebook'

interface AddCellMenuProps {
  onAdd: (type: CellType) => void
}

export default function AddCellMenu({ onAdd }: AddCellMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const cellTypes = [
    { type: 'markdown' as CellType, icon: FileText, label: 'Markdown', color: 'text-blue-600' },
    { type: 'chart' as CellType, icon: BarChart3, label: 'Chart', color: 'text-green-600' },
    { type: 'data' as CellType, icon: Table, label: 'Table', color: 'text-purple-600' },
    { type: 'image' as CellType, icon: ImageIcon, label: 'Image', color: 'text-orange-600' },
  ]

  const handleAdd = (type: CellType) => {
    onAdd(type)
    setIsOpen(false)
  }

  return (
    <div className="relative flex justify-center my-2">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          title="Add cell"
        >
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {cellTypes.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => handleAdd(type)}
              className={`flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors ${color}`}
              title={`Add ${label} cell`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
