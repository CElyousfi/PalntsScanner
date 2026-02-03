// Notebook cell types and interfaces

export type CellType = 'markdown' | 'chart' | 'data' | 'image' | 'code'

export interface NotebookCell {
  id: string
  type: CellType
  content: string
  output?: any
  metadata?: {
    collapsed?: boolean
    executionCount?: number
    lastRun?: Date
  }
}

export interface Notebook {
  id: string
  title: string
  cells: NotebookCell[]
  metadata: {
    created: Date
    modified: Date
    tags: string[]
    version: string
  }
}

export interface CellProps {
  cell: NotebookCell
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<NotebookCell>) => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
  onRun: () => void
}
