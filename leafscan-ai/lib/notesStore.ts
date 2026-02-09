import { FarmNote, NoteFolder } from '@/types/notes'

const NOTES_KEY = 'leafscan_farm_notes'
const FOLDERS_KEY = 'leafscan_note_folders'

export function getAllNotes(): FarmNote[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(NOTES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getNoteById(id: string): FarmNote | null {
  const notes = getAllNotes()
  return notes.find(note => note.id === id) || null
}

export function saveNote(note: FarmNote): void {
  const notes = getAllNotes()
  const index = notes.findIndex(n => n.id === note.id)
  
  if (index >= 0) {
    notes[index] = note
  } else {
    notes.push(note)
  }
  
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export function deleteNote(id: string): void {
  const notes = getAllNotes()
  const filtered = notes.filter(n => n.id !== id)
  localStorage.setItem(NOTES_KEY, JSON.stringify(filtered))
}

export function getAllFolders(): NoteFolder[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(FOLDERS_KEY)
  return stored ? JSON.parse(stored) : getDefaultFolders()
}

export function saveFolder(folder: NoteFolder): void {
  const folders = getAllFolders()
  const index = folders.findIndex(f => f.id === folder.id)
  
  if (index >= 0) {
    folders[index] = folder
  } else {
    folders.push(folder)
  }
  
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
}

export function deleteFolder(id: string): void {
  const folders = getAllFolders()
  const filtered = folders.filter(f => f.id !== id)
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered))
}

function getDefaultFolders(): NoteFolder[] {
  return [
    { id: 'general', name: 'General', color: '#6BBF59', noteCount: 0 },
    { id: 'reports', name: 'Farm Reports', color: '#3B82F6', noteCount: 0 },
    { id: 'research', name: 'Research', color: '#8B5CF6', noteCount: 0 },
  ]
}

export function createNewNote(userId: string, folder?: string, scanId?: string): FarmNote {
  return {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: scanId ? 'Scan Analysis Note' : 'Untitled Note',
    content: scanId ? `# Scan Analysis\n\n**Scan ID:** ${scanId}\n\nAdd your notes and analysis here...` : '# New Farm Report\n\nStart writing your report here...',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: scanId ? ['scan-linked'] : [],
    folder: folder || 'general',
    isPinned: false,
    scanId: scanId,
    metadata: {
      wordCount: 0,
      lastEditedBy: userId
    }
  }
}
