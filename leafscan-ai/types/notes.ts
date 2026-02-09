export interface FarmNote {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  tags: string[]
  folder?: string
  isPinned: boolean
  scanId?: string // Link to specific scan from history
  metadata: {
    wordCount: number
    lastEditedBy: string
  }
}

export interface NoteFolder {
  id: string
  name: string
  color: string
  noteCount: number
}

export interface ChartData {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any[]
  config: any
}
