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
    <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-apeel-green">Farm Notes</h2>
          <button
            onClick={() => createNote()}
            className="p-2.5 bg-apeel-green text-white rounded-xl shadow-lg shadow-apeel-green/20 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            title="New Note"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-apeel-green transition-colors" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-apeel-green/10 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Folders and Notes List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {folders.map(folder => {
          const folderNotes = getNotesByFolder(folder.id)
          const isExpanded = expandedFolders.has(folder.id)

          return (
            <div key={folder.id}>
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full px-2 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-all group mb-2"
              >
                <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-600 transition-colors">{folder.name}</span>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{folderNotes.length}</span>
              </button>

              {/* Notes in Folder */}
              {isExpanded && (
                <div className="space-y-2 ml-2">
                  {folderNotes.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400 italic bg-gray-50/50 rounded-2xl mx-2 border border-dashed border-gray-100">
                      Empty folder
                    </div>
                  ) : (
                    folderNotes.map(note => (
                      <div
                        key={note.id}
                        className={`relative group rounded-2xl transition-all duration-300 border ${activeNote?.id === note.id
                            ? 'bg-apeel-green/[0.03] border-apeel-green/20 shadow-sm'
                            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                          }`}
                      >
                        <button
                          onClick={() => setActiveNote(note)}
                          className="w-full p-4 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${activeNote?.id === note.id ? 'bg-apeel-green/10 text-apeel-green' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm'
                              }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className={`font-serif font-bold text-sm truncate ${activeNote?.id === note.id ? 'text-apeel-green' : 'text-gray-700'
                                  }`}>
                                  {note.title}
                                </h3>
                                {note.isPinned && (
                                  <Pin className="w-3 h-3 text-orange-400 flex-shrink-0 fill-orange-400" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed font-medium">
                                {note.content.substring(0, 80) || 'No content...'}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-300 uppercase tracking-wide">
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
