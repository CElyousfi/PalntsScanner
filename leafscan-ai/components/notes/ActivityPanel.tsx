'use client'

import { Clock, Link2, FileText } from 'lucide-react'
import { useNotes } from '@/context/NotesContext'

export default function ActivityPanel() {
  const { activeNote, notes } = useNotes()

  if (!activeNote) return null

  // Get recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'edit',
      message: 'make sure this has all of the data since types are missing',
      time: 'Jan 10th · 2:58 PM',
    },
    {
      id: 2,
      type: 'edit',
      message: "I'd read the current note to review what's included. Included all the Moss types and...",
      time: 'Jan 10th · 2:58 PM',
    },
    {
      id: 3,
      type: 'edit',
      message: 'The note is comprehensive. After reviewing I agree this has all the Moss types and...',
      time: 'Jan 10th · 2:58 PM',
    },
  ]

  // Get backlinks (notes that reference this note)
  const backlinks = notes.filter(note => 
    note.id !== activeNote.id && 
    note.content.toLowerCase().includes(activeNote.title.toLowerCase())
  )

  // Get related notes (recent notes)
  const relatedNotes = notes.filter(note => 
    note.id !== activeNote.id
  ).slice(0, 3)

  return (
    <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-4">
        {/* Activity Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Actions</h3>
            <button className="text-xs text-apeel-green hover:underline">⌘ K</button>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{activity.message}</p>
                    <p className="text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backlinks Section */}
        {backlinks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Backlinks</h3>
            </div>
            <div className="space-y-2">
              {backlinks.map((note) => (
                <div key={note.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{note.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Notes */}
        {relatedNotes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Related</h3>
            </div>
            <div className="space-y-2">
              {relatedNotes.map((note) => (
                <div key={note.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{note.title}</p>
                    <p className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block Elements Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Present:</h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-apeel-green" />
              <span>Block elements</span>
            </div>
          </div>
        </div>

        {/* Page Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Updated {new Date(activeNote.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              <span>{activeNote.content.length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
