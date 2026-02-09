'use client'

import React, { useState, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import NotesSidebar from '@/components/notes/NotesSidebar'
import NotebookEditor from '@/components/notebook/NotebookEditor'
import AIAssistant from '@/components/notes/AIAssistant'
import OnboardingTour from '@/components/notes/OnboardingTour'
import { FileText, Calendar, Tag, MoreVertical, Star, BookOpen } from 'lucide-react'
import { Notebook, NotebookCell } from '@/types/notebook'

// Convert old note content to notebook format
function contentToNotebook(content: string, noteId: string, noteTitle: string): Notebook {
  try {
    const parsed = JSON.parse(content)
    if (parsed.cells && Array.isArray(parsed.cells)) {
      return parsed as Notebook
    }
  } catch { }

  const cells: NotebookCell[] = [{
    id: `cell_${Date.now()}_0`,
    type: 'markdown',
    content: content || '',
    metadata: {}
  }]

  return {
    id: noteId,
    title: noteTitle,
    cells,
    metadata: {
      created: new Date(),
      modified: new Date(),
      tags: [],
      version: '1.0'
    }
  }
}

function notebookToContent(notebook: Notebook): string {
  return JSON.stringify(notebook, null, 2)
}

export default function NotesPage() {
  const { activeNote, updateNote } = useNotes()
  const [showTitleEdit, setShowTitleEdit] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [notebook, setNotebook] = useState<Notebook | null>(null)

  useEffect(() => {
    if (activeNote) {
      const nb = contentToNotebook(activeNote.content, activeNote.id, activeNote.title)
      setNotebook(nb)
    } else {
      setNotebook(null)
    }
  }, [activeNote?.id, activeNote?.updatedAt])

  const handleTitleSave = () => {
    if (activeNote && titleInput.trim()) {
      updateNote(activeNote.id, { title: titleInput.trim() })
      if (notebook) {
        setNotebook({ ...notebook, title: titleInput.trim() })
      }
    }
    setShowTitleEdit(false)
  }

  const handleNotebookChange = (updatedNotebook: Notebook) => {
    setNotebook(updatedNotebook)
    if (activeNote) {
      updateNote(activeNote.id, { content: notebookToContent(updatedNotebook) })
    }
  }

  return (
    <>
      <OnboardingTour />
      <div className="flex h-screen overflow-hidden">
        {/* Notes List Sidebar */}
        <NotesSidebar />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Note Header */}
          {activeNote && (
            <div className="border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {showTitleEdit ? (
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                      className="text-2xl font-bold border-b-2 border-apeel-green focus:outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    <h1
                      onClick={() => {
                        setTitleInput(activeNote.title)
                        setShowTitleEdit(true)
                      }}
                      className="text-2xl font-bold text-apeel-black cursor-pointer hover:text-apeel-green transition-colors"
                    >
                      {activeNote.title}
                    </h1>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Updated {new Date(activeNote.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{activeNote.metadata.wordCount} words</span>
                    </div>
                    {activeNote.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <div className="flex gap-1">
                          {activeNote.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateNote(activeNote.id, { isPinned: !activeNote.isPinned })}
                    className={`p-2 rounded-lg transition-colors ${activeNote.isPinned
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'hover:bg-gray-100 text-gray-400'
                      }`}
                  >
                    <Star className="w-5 h-5" fill={activeNote.isPinned ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notebook Editor */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {notebook ? (
              <NotebookEditor
                notebook={notebook}
                onChange={handleNotebookChange}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a note to start editing</p>
                  <p className="text-sm mt-2">Or create a new notebook</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <AIAssistant />
      </div>
    </>
  )
}
