'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useAutonomy } from '@/context/AutonomyContext'
import {
  Sparkles, Send, Loader2, X, TrendingUp, FileText,
  BarChart3, Calendar, Leaf, AlertTriangle, CheckCircle2, Circle, ArrowRight
} from 'lucide-react'
import { generateNotebookContent } from '@/lib/ai/notebookGenerator'
import { Notebook } from '@/types/notebook'

// --- Types for Structured UI ---
interface TaskStep {
  id: string
  label: string
  status: 'pending' | 'loading' | 'completed'
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content?: string
  type: 'text' | 'progress' | 'result'
  steps?: TaskStep[]
  resultData?: {
    count: number
    summary: string
  }
  timestamp: number
}

// Helper: Parse Notebook
function parseNotebook(content: string): Notebook | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed.cells && Array.isArray(parsed.cells)) {
      return parsed as Notebook
    }
  } catch { }
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

  const handleSend = async (contentOverride?: string) => {
    const messageContent = contentOverride || input
    if (!messageContent.trim() || !activeNote) return

    // 1. User Message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageContent,
      type: 'text',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 2. Initial Progress State (Analysis)
      const progressMsgId = `msg_${Date.now()}_progress`
      const initialSteps: TaskStep[] = [
        { id: '1', label: 'Analyzing request context', status: 'loading' },
        { id: '2', label: 'Generating content items', status: 'pending' },
        { id: '3', label: 'Updating notebook', status: 'pending' }
      ]

      const progressMessage: Message = {
        id: progressMsgId,
        role: 'assistant',
        type: 'progress',
        steps: initialSteps,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, progressMessage])

      // Simulate Thinking
      await new Promise(resolve => setTimeout(resolve, 800))

      // 3. Update Progress (Generation)
      setMessages(prev => prev.map(msg => {
        if (msg.id === progressMsgId && msg.steps) {
          return {
            ...msg,
            steps: [
              { id: '1', label: 'Request analyzed', status: 'completed' },
              { id: '2', label: 'Generating content items', status: 'loading' },
              { id: '3', label: 'Updating notebook', status: 'pending' }
            ]
          }
        }
        return msg
      }))

      // AI Generation Logic
      const currentNotebook = parseNotebook(activeNote.content)
      const newCells = await generateNotebookContent({
        prompt: messageContent,
        currentNotebook: currentNotebook || undefined,
        farmProfile: activeProfile
      })

      // 4. Update Progress (Applying)
      setMessages(prev => prev.map(msg => {
        if (msg.id === progressMsgId && msg.steps) {
          return {
            ...msg,
            steps: [
              { id: '1', label: 'Request analyzed', status: 'completed' },
              { id: '2', label: 'Content generated', status: 'completed' },
              { id: '3', label: 'Updating notebook', status: 'loading' }
            ]
          }
        }
        return msg
      }))

      await new Promise(resolve => setTimeout(resolve, 400))

      // Apply Changes
      const lowerInput = messageContent.toLowerCase()
      const replaceKeywords = ['reshape', 'rewrite', 'replace', 'full report', 'complete report', 'entire report']
      const shouldReplace = replaceKeywords.some(keyword => lowerInput.includes(keyword))
      const addKeywords = ['write', 'add', 'create', 'generate', 'insert', 'include', 'update', 'modify']
      const shouldAdd = addKeywords.some(keyword => lowerInput.includes(keyword))

      if (shouldReplace) {
        // REPLACE
        const newNotebook: Notebook = {
          id: activeNote.id,
          title: activeNote.title,
          cells: newCells,
          metadata: { ...activeNote.metadata, modified: new Date() }
        }
        updateNote(activeNote.id, { content: JSON.stringify(newNotebook, null, 2) })
      } else if (shouldAdd || newCells.length > 0) {
        // APPEND (Default)
        const existingCells = currentNotebook?.cells || []
        const updatedNotebook: Notebook = {
          id: activeNote.id,
          title: activeNote.title,
          cells: [...existingCells, ...newCells],
          metadata: { ...activeNote.metadata, modified: new Date() }
        }
        updateNote(activeNote.id, { content: JSON.stringify(updatedNotebook, null, 2) })
      }

      // 5. Final Success State (Result Card)
      // Remove progress message and show result
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== progressMsgId)
        const successMessage: Message = {
          id: `msg_${Date.now()}_success`,
          role: 'assistant',
          type: 'result',
          resultData: {
            count: newCells.length,
            summary: `Successfully added ${newCells.length} new items to your note.`
          },
          timestamp: Date.now()
        }
        return [...filtered, successMessage]
      })

    } catch (error) {
      console.error('AI Error:', error)
      // Error handling UI could be added here
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    handleSend(action)
  }

  const quickActions = [
    { icon: TrendingUp, label: 'Growth Analysis', prompt: 'Generate growth analysis with charts' },
    { icon: BarChart3, label: 'Full Report', prompt: 'Create full report with all charts and analysis' },
    { icon: AlertTriangle, label: 'Risk Assessment', prompt: 'Generate risk assessment report' },
    { icon: Calendar, label: 'Task List', prompt: 'Create daily task list' },
    { icon: FileText, label: 'Health Status', prompt: 'Generate health status report' },
    { icon: Leaf, label: 'Recommendations', prompt: 'Generate AI recommendations' }
  ]

  if (!isAIAssistantOpen) {
    return (
      <button
        onClick={toggleAIAssistant}
        className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl hover:scale-105 hover:shadow-emerald-500/30 transition-all flex items-center justify-center z-50 group"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  return (
    <div className="w-[400px] bg-white border-l border-gray-100/50 shadow-2xl shadow-black/5 flex flex-col h-full font-sans">

      {/* Premium Header */}
      <div className="p-5 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">AI Companion</h3>
              <p className="text-xs text-gray-500 font-medium">Always ready to help</p>
            </div>
          </div>
          <button
            onClick={toggleAIAssistant}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions (only when empty or user wants context) */}
      {messages.length === 0 && (
        <div className="p-5 border-b border-gray-50 bg-gray-50/30">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Quick Start</p>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={!activeNote}
                className={`p-3.5 bg-white border border-gray-100 rounded-2xl text-left group relative overflow-hidden shadow-sm transition-all duration-300 ${!activeNote
                    ? 'opacity-60 grayscale cursor-not-allowed'
                    : 'hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5'
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <action.icon className={`w-5 h-5 transition-colors duration-300 ${activeNote ? 'text-gray-400 group-hover:text-emerald-500' : 'text-gray-300'
                    }`} />
                  {activeNote && (
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                    </div>
                  )}
                </div>
                <p className={`text-xs font-semibold transition-colors ${activeNote ? 'text-gray-600 group-hover:text-gray-900' : 'text-gray-400'
                  }`}>
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/30">

        {/* Context Card (if present) */}
        {activeProfile && messages.length === 0 && (
          <div className="mx-auto max-w-[90%] p-4 bg-white rounded-2xl border border-emerald-100/50 shadow-sm text-center">
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> {activeProfile.cropType}</span>
              <span className="w-px h-4 bg-gray-200" />
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {activeProfile.currentStage}</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {/* User Message */}
            {msg.role === 'user' && (
              <div className="max-w-[85%] bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg shadow-emerald-500/20 text-sm leading-relaxed">
                {msg.content}
              </div>
            )}

            {/* Assistant: Progress Card */}
            {msg.role === 'assistant' && msg.type === 'progress' && msg.steps && (
              <div className="w-full max-w-[90%] bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-1 overflow-hidden">
                <div className="bg-gray-50/50 p-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin relative z-10" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Processing Request</span>
                </div>
                <div className="p-4 space-y-4">
                  {msg.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-3 relative group">
                      {idx !== msg.steps!.length - 1 && (
                        <div className={`absolute left-[7px] top-6 w-px h-full -mb-2 ${step.status === 'completed' ? 'bg-emerald-200' : 'bg-gray-100'
                          }`} />
                      )}

                      <div className={`relative z-10 w-4 h-4 flex items-center justify-center transition-all duration-500 ${step.status === 'completed' ? 'scale-110' : ''
                        }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : step.status === 'loading' ? (
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 border-r-transparent animate-spin" />
                        ) : (
                          <Circle className="w-2.5 h-2.5 text-gray-300" />
                        )}
                      </div>

                      <span className={`text-xs font-medium transition-colors duration-300 ${step.status === 'completed' ? 'text-gray-900' :
                          step.status === 'loading' ? 'text-emerald-700' : 'text-gray-400'
                        }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assistant: Result Card */}
            {msg.role === 'assistant' && msg.type === 'result' && msg.resultData && (
              <div className="w-full max-w-[90%] bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/5 p-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-full shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Success!</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {msg.resultData.summary}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Updated Notebook
                  </span>
                  <span>Just now</span>
                </div>
              </div>
            )}

            {/* Assistant: Plain Text (Fallback) */}
            {msg.role === 'assistant' && msg.type === 'text' && (
              <div className="max-w-[90%] bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm text-sm leading-relaxed">
                {msg.content}
              </div>
            )}

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your companion..."
            className="flex-1 px-4 py-2 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0"
            disabled={isLoading || !activeNote}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || !activeNote}
            className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-20 disabled:hover:bg-gray-900 transition-all shadow-md shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
        {!activeNote && (
          <div className="text-center mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[10px] font-bold text-orange-600 border border-orange-100">
              <AlertTriangle className="w-3 h-3" />
              Select a note first
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
