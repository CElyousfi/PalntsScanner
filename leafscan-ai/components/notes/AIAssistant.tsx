'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useAutonomy } from '@/context/AutonomyContext'
import { 
  Sparkles, Send, Loader2, X, Plus, TrendingUp, FileText,
  BarChart3, Calendar, Leaf, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react'
import { generateNotebookContent } from '@/lib/ai/notebookGenerator'
import { Notebook, NotebookCell } from '@/types/notebook'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Helper to parse notebook from content
function parseNotebook(content: string): Notebook | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed.cells && Array.isArray(parsed.cells)) {
      return parsed as Notebook
    }
  } catch {}
  return null
}

export default function AIAssistant() {
  const { activeNote, updateNote, isAIAssistantOpen, toggleAIAssistant } = useNotes()
  const { activeProfile } = useAutonomy()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !activeNote) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Show task list first
      const taskMessage: Message = {
        id: `msg_${Date.now()}_tasks`,
        role: 'assistant',
        content: '📋 **Agent Tasks:**\n\n- [ ] Analyzing request\n- [ ] Generating notebook cells\n- [ ] Applying changes to note',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, taskMessage])

      // Wait a bit for visual effect
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update to show progress
      const progressMessage: Message = {
        id: `msg_${Date.now()}_progress`,
        role: 'assistant',
        content: '📋 **Agent Tasks:**\n\n- [x] Analyzing request\n- [x] Generating notebook cells\n- [ ] Applying changes to note',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev.slice(0, -1), progressMessage])

      // Parse current notebook
      const currentNotebook = parseNotebook(activeNote.content)

      // Generate notebook cells
      const newCells = await generateNotebookContent({
        prompt: userInput,
        currentNotebook: currentNotebook || undefined,
        farmProfile: activeProfile
      })
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: `✅ Generated ${newCells.length} cells:\n${newCells.map((c, i) => `- Cell ${i + 1}: ${c.type}`).join('\n')}`,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])

      // AUTO-INSERT: Automatically add cells to the note
      const lowerInput = userInput.toLowerCase()
      
      // Check if request is to replace/reshape entire content
      const replaceKeywords = ['reshape', 'rewrite', 'replace', 'full report', 'complete report', 'entire report']
      const shouldReplace = replaceKeywords.some(keyword => lowerInput.includes(keyword))
      
      // Check if request is to add/append content
      const addKeywords = ['write', 'add', 'create', 'generate', 'insert', 'include', 'update', 'modify']
      const shouldAdd = addKeywords.some(keyword => lowerInput.includes(keyword))

      if (shouldReplace) {
        // REPLACE entire notebook
        const newNotebook: Notebook = {
          id: activeNote.id,
          title: activeNote.title,
          cells: newCells,
          metadata: {
            created: new Date(),
            modified: new Date(),
            tags: [],
            version: '1.0'
          }
        }
        updateNote(activeNote.id, { content: JSON.stringify(newNotebook, null, 2) })
        
        const successMessage: Message = {
          id: `msg_${Date.now()}_success`,
          role: 'assistant',
          content: `📋 **Agent Tasks:**\n\n- [x] Analyzing request\n- [x] Generating notebook cells\n- [x] Applying changes to note\n\n✅ **All tasks completed!** Created ${newCells.length} new cells.`,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev.slice(0, -2), successMessage])
      } else if (shouldAdd) {
        // APPEND cells to existing notebook
        const existingCells = currentNotebook?.cells || []
        const updatedNotebook: Notebook = {
          id: activeNote.id,
          title: activeNote.title,
          cells: [...existingCells, ...newCells],
          metadata: {
            created: currentNotebook?.metadata.created || new Date(),
            modified: new Date(),
            tags: currentNotebook?.metadata.tags || [],
            version: '1.0'
          }
        }
        updateNote(activeNote.id, { content: JSON.stringify(updatedNotebook, null, 2) })
        
        const successMessage: Message = {
          id: `msg_${Date.now()}_success`,
          role: 'assistant',
          content: '📋 **Agent Tasks:**\n\n- [x] Analyzing request\n- [x] Generating content\n- [x] Applying changes to note\n\n✅ **All tasks completed!** Content has been added.',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev.slice(0, -2), successMessage])
      }
    } catch (error) {
      console.error('AI Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    setInput(action)
    handleSend()
  }

  const quickActions = [
    {
      icon: TrendingUp,
      label: 'Growth Analysis',
      prompt: 'Generate growth analysis with charts'
    },
    {
      icon: BarChart3,
      label: 'Full Report',
      prompt: 'Create full report with all charts and analysis'
    },
    {
      icon: AlertTriangle,
      label: 'Risk Assessment',
      prompt: 'Generate risk assessment report'
    },
    {
      icon: Calendar,
      label: 'Task List',
      prompt: 'Create daily task list'
    },
    {
      icon: FileText,
      label: 'Health Status',
      prompt: 'Generate health status report'
    },
    {
      icon: Leaf,
      label: 'Recommendations',
      prompt: 'Generate AI recommendations'
    }
  ]

  if (!isAIAssistantOpen) {
    return (
      <button
        onClick={toggleAIAssistant}
        className="fixed right-4 bottom-4 w-14 h-14 bg-apeel-green text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-apeel-green to-emerald-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">AI Assistant</h3>
          </div>
          <button
            onClick={toggleAIAssistant}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-white/90">
          Ask me to add content, charts, or insights to your report
        </p>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action.prompt)}
                className="p-3 border border-gray-200 rounded-lg hover:border-apeel-green hover:bg-green-50 transition-all text-left group"
              >
                <action.icon className="w-4 h-4 text-apeel-green mb-2" />
                <p className="text-xs font-medium text-gray-700 group-hover:text-apeel-green">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Farm Context */}
      {activeProfile && (
        <div className="p-4 bg-green-50 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Current Farm Context</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Leaf className="w-3 h-3 text-apeel-green" />
              <span>Crop: {activeProfile.cropType}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-apeel-green" />
              <span>Stage: {activeProfile.currentStage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-apeel-green text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap space-y-1">
                {message.content.split('\n').map((line, i) => {
                  // Render checkboxes
                  if (line.includes('- [x]')) {
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-apeel-green" />
                        <span className="text-gray-700">{line.replace('- [x]', '').trim()}</span>
                      </div>
                    )
                  } else if (line.includes('- [ ]')) {
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                        <span className="text-gray-500">{line.replace('- [ ]', '').trim()}</span>
                      </div>
                    )
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold">{line.replace(/\*\*/g, '')}</p>
                  } else if (line.includes('✅') || line.includes('📋') || line.includes('🔄')) {
                    return <p key={i} className="font-medium">{line}</p>
                  } else {
                    return <p key={i}>{line}</p>
                  }
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-apeel-green" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI to add something..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-apeel-green/30"
            disabled={isLoading || !activeNote}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !activeNote}
            className="px-4 py-2 bg-apeel-green text-white rounded-lg hover:bg-apeel-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!activeNote && (
          <p className="text-xs text-gray-500 mt-2">Select a note to use AI assistant</p>
        )}
      </div>
    </div>
  )
}
