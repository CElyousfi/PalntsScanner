'use client'

import React, { useState, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import NotesSidebar from '@/components/notes/NotesSidebar'
import NotebookEditor from '@/components/notebook/NotebookEditor'
import AIAssistant from '@/components/notes/AIAssistant'
import ExportMenu from '@/components/ExportMenu'
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
      <div className="flex h-screen overflow-hidden">
        {/* Notes List Sidebar */}
        <NotesSidebar />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Note Header */}
          {activeNote && (
            <div className="border-b border-gray-100/50 bg-white/80 backdrop-blur-md px-8 py-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {showTitleEdit ? (
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                      className="text-3xl font-serif font-bold text-apeel-green border-b-2 border-apeel-green/30 focus:outline-none w-full bg-transparent placeholder-apeel-green/30"
                      autoFocus
                      placeholder="Untitled Note"
                    />
                  ) : (
                    <h1
                      onClick={() => {
                        setTitleInput(activeNote.title)
                        setShowTitleEdit(true)
                      }}
                      className="text-3xl font-serif font-bold text-apeel-green cursor-pointer hover:text-green-700 transition-colors"
                    >
                      {activeNote.title}
                    </h1>
                  )}

                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                      <Calendar className="w-4 h-4 text-apeel-green/60" />
                      <span>
                        Updated {new Date(activeNote.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                      <FileText className="w-4 h-4 text-apeel-green/60" />
                      <span>{activeNote.metadata.wordCount} words</span>
                    </div>
                    {activeNote.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-apeel-green/60" />
                        <div className="flex gap-2">
                          {activeNote.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-apeel-green/5 text-apeel-green rounded-full text-xs font-bold border border-apeel-green/10"
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
                  {/* Export Button */}
                  {notebook && (
                    <ExportMenu
                      data={{
                        scanId: activeNote.scanId || activeNote.id,
                        type: 'Note Export',
                        timestamp: new Date(activeNote.updatedAt).toISOString(),
                        summary: {
                          title: activeNote.title,
                          wordCount: activeNote.metadata.wordCount,
                          tags: activeNote.tags,
                        },
                        content: notebook.cells.filter(c => c.type === 'markdown').map(c => ({
                          content: c.content
                        })),
                        notebook: notebook
                      }}
                      elementId="note-content"
                      reportType="leaf"
                    />
                  )}

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
          <div id="note-content" className="flex-1 overflow-y-auto bg-[#f8f9fa]">
            {notebook ? (
              <NotebookEditor
                notebook={notebook}
                onChange={handleNotebookChange}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center max-w-sm mx-auto p-8 rounded-3xl border-2 border-dashed border-gray-100 bg-white/50">
                  <div className="w-20 h-20 bg-apeel-green/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-apeel-green/40" />
                  </div>
                  <p className="text-xl font-serif font-bold text-apeel-green/80 mb-2">Select a Note</p>
                  <p className="text-sm text-gray-500">Choose a note from the sidebar or creates a new one to start documenting your findings.</p>
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
