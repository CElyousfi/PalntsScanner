'use client'

import React, { useState } from 'react'
import { useNotes } from '@/context/NotesContext'
import { 
  Plus, Search, Folder, FileText, Pin, Trash2, MoreVertical,
  Calendar, Tag, ChevronRight, ChevronDown
} from 'lucide-react'
import ExportImport from './ExportImport'

export default function NotesSidebar() {
  const { 
    notes, 
    folders, 
    activeNote, 
    createNote, 
    removeNote, 
    setActiveNote,
    updateNote,
    searchNotes,
    getNotesByFolder
  } = useNotes()

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['general', 'reports']))
  const [showMenu, setShowMenu] = useState<string | null>(null)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const displayedNotes = searchQuery ? searchNotes(searchQuery) : notes

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-apeel-black">Farm Notes</h2>
          <button
            onClick={() => createNote()}
            className="p-2 bg-apeel-green text-white rounded-lg hover:bg-apeel-green/90 transition-all"
            title="New Note"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-apeel-green/30"
          />
        </div>
      </div>

      {/* Folders and Notes List */}
      <div className="flex-1 overflow-y-auto">
        {folders.map(folder => {
          const folderNotes = getNotesByFolder(folder.id)
          const isExpanded = expandedFolders.has(folder.id)

          return (
            <div key={folder.id} className="border-b border-gray-100">
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <Folder className="w-4 h-4" style={{ color: folder.color }} />
                <span className="flex-1 text-left font-medium text-sm">{folder.name}</span>
                <span className="text-xs text-gray-400">{folderNotes.length}</span>
              </button>

              {/* Notes in Folder */}
              {isExpanded && (
                <div className="bg-gray-50/50">
                  {folderNotes.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      No notes in this folder
                    </div>
                  ) : (
                    folderNotes.map(note => (
                      <div
                        key={note.id}
                        className={`relative group ${
                          activeNote?.id === note.id ? 'bg-apeel-green/10' : ''
                        }`}
                      >
                        <button
                          onClick={() => setActiveNote(note)}
                          className="w-full px-4 py-3 text-left hover:bg-white/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm truncate">
                                  {note.title}
                                </h3>
                                {note.isPinned && (
                                  <Pin className="w-3 h-3 text-apeel-green flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                                {note.content.substring(0, 100)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(note.updatedAt)}</span>
                                {note.tags.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <Tag className="w-3 h-3" />
                                    <span>{note.tags.length}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Note Actions */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMenu(showMenu === note.id ? null : note.id)
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showMenu === note.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateNote(note.id, { isPinned: !note.isPinned })
                                  setShowMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Pin className="w-4 h-4" />
                                {note.isPinned ? 'Unpin' : 'Pin'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm('Delete this note?')) {
                                    removeNote(note.id)
                                  }
                                  setShowMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        <div className="text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Total Notes</span>
            <span className="font-medium text-gray-700">{notes.length}</span>
          </div>
          {activeNote && (
            <div className="flex justify-between">
              <span>Words</span>
              <span className="font-medium text-gray-700">{activeNote.metadata.wordCount}</span>
            </div>
          )}
        </div>
        <ExportImport />
      </div>
    </div>
  )
}
