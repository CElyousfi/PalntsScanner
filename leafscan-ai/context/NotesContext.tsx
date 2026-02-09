'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { FarmNote, NoteFolder } from '@/types/notes'
import { getAllNotes, getNoteById, saveNote, deleteNote, getAllFolders, saveFolder, deleteFolder, createNewNote } from '@/lib/notesStore'
import { initializeSampleNotes } from '@/lib/sampleNotes'
import { useAuth } from './AuthContext'

interface NotesContextType {
  notes: FarmNote[]
  folders: NoteFolder[]
  activeNote: FarmNote | null
  isAIAssistantOpen: boolean
  
  // Note operations
  createNote: (folder?: string, scanId?: string) => FarmNote
  updateNote: (id: string, updates: Partial<FarmNote>) => void
  removeNote: (id: string) => void
  setActiveNote: (note: FarmNote | null) => void
  
  // Folder operations
  createFolder: (name: string, color: string) => void
  updateFolder: (id: string, updates: Partial<NoteFolder>) => void
  removeFolder: (id: string) => void
  
  // AI Assistant
  toggleAIAssistant: () => void
  
  // Search and filter
  searchNotes: (query: string) => FarmNote[]
  getNotesByFolder: (folderId: string) => FarmNote[]
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<FarmNote[]>([])
  const [folders, setFolders] = useState<NoteFolder[]>([])
  const [activeNote, setActiveNote] = useState<FarmNote | null>(null)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(true)

  // Load notes and folders
  useEffect(() => {
    initializeSampleNotes()
    setNotes(getAllNotes())
    setFolders(getAllFolders())
  }, [])

  const createNote = useCallback((folder?: string, scanId?: string) => {
    const newNote = createNewNote(user?.id || 'guest', folder, scanId)
    saveNote(newNote)
    setNotes(prev => [newNote, ...prev])
    setActiveNote(newNote)
    return newNote
  }, [user])

  const updateNote = useCallback((id: string, updates: Partial<FarmNote>) => {
    const note = getNoteById(id)
    if (!note) return

    const updatedNote = {
      ...note,
      ...updates,
      updatedAt: Date.now(),
      metadata: {
        ...note.metadata,
        wordCount: updates.content ? updates.content.split(/\s+/).length : note.metadata.wordCount
      }
    }

    saveNote(updatedNote)
    setNotes(prev => prev.map(n => n.id === id ? updatedNote : n))
    if (activeNote?.id === id) {
      setActiveNote(updatedNote)
    }
  }, [activeNote])

  const removeNote = useCallback((id: string) => {
    deleteNote(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeNote?.id === id) {
      setActiveNote(null)
    }
  }, [activeNote])

  const createFolder = useCallback((name: string, color: string) => {
    const newFolder: NoteFolder = {
      id: `folder_${Date.now()}`,
      name,
      color,
      noteCount: 0
    }
    saveFolder(newFolder)
    setFolders(prev => [...prev, newFolder])
  }, [])

  const updateFolder = useCallback((id: string, updates: Partial<NoteFolder>) => {
    const folder = folders.find(f => f.id === id)
    if (!folder) return

    const updatedFolder = { ...folder, ...updates }
    saveFolder(updatedFolder)
    setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f))
  }, [folders])

  const removeFolder = useCallback((id: string) => {
    deleteFolder(id)
    setFolders(prev => prev.filter(f => f.id !== id))
  }, [])

  const toggleAIAssistant = useCallback(() => {
    setIsAIAssistantOpen(prev => !prev)
  }, [])

  const searchNotes = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [notes])

  const getNotesByFolder = useCallback((folderId: string) => {
    return notes.filter(note => note.folder === folderId)
  }, [notes])

  const contextValue = useMemo(() => ({
    notes,
    folders,
    activeNote,
    isAIAssistantOpen,
    createNote,
    updateNote,
    removeNote,
    setActiveNote,
    createFolder,
    updateFolder,
    removeFolder,
    toggleAIAssistant,
    searchNotes,
    getNotesByFolder
  }), [notes, folders, activeNote, isAIAssistantOpen, createNote, updateNote, removeNote, createFolder, updateFolder, removeFolder, toggleAIAssistant, searchNotes, getNotesByFolder])

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}
