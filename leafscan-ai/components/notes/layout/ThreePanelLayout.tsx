'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ThreePanelLayoutProps {
  leftSidebar: ReactNode
  mainContent: ReactNode
  rightSidebar: ReactNode
  onCloseRight?: () => void
  showRightSidebar?: boolean
}

export default function ThreePanelLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
  onCloseRight,
  showRightSidebar = true
}: ThreePanelLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Notes List */}
      <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="h-full">
          {leftSidebar}
        </div>
      </aside>

      {/* Main Content - Editor */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto">
          {mainContent}
        </div>
      </main>

      {/* Right Sidebar - AI Assistant & Actions */}
      {showRightSidebar && (
        <aside className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 overflow-y-auto relative">
          {onCloseRight && (
            <button
              onClick={onCloseRight}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-200 transition-colors z-10"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <div className="h-full p-6">
            {rightSidebar}
          </div>
        </aside>
      )}
    </div>
  )
}
