'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatMessage, DiagnosisResult, ActionRescueResult } from '@/types'
import { useLanguage } from '@/context/LanguageContext' // Import hook

import { useAutonomy } from '@/hooks/useAutonomy'

interface AIChatProps {
  diagnosis?: DiagnosisResult | null
  actionResult?: ActionRescueResult | null
  monitoringPlan?: any
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  initialQuestion?: string
  sessionId?: string
}

export default function AIChat(props: AIChatProps) {
  const { t, language } = useLanguage()
  const { isChatOpen, toggleChat, chatContext } = useAutonomy()

  // Resolve State: Prop > Global
  // Resolve State: Prop > Global
  const isOpen = props.isOpen !== undefined ? props.isOpen : isChatOpen
  const onToggle = props.onToggle || toggleChat
  const initialQuestion = props.initialQuestion || chatContext?.initialQuestion

  // Resolve Data Context
  const diagnosis = props.diagnosis || chatContext?.diagnosis || null
  const actionResult = props.actionResult || chatContext?.actionResult
  const monitoringPlan = props.monitoringPlan || chatContext?.monitoringPlan

  // Resolve Session ID (Personalization Scope)
  // If prop provided, use it. Else derive from context.
  const diagId = diagnosis ? (diagnosis as any).id || 'scan' : 'scan'

  const sessionId = props.sessionId || (
    chatContext?.type === 'diagnosis' && diagnosis ? `diagnosis_${diagId}` :
      chatContext?.type === 'dashboard' ? 'dashboard_session' :
        'general_session'
  )

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  // Determine storage key
  const STORAGE_KEY = `chat_v2_${sessionId}`

  // Load chat history from localStorage on mount or session change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If we have a specific session, load it. 
      // If we are in 'general' mode (no session), the user requested a "clean" state.
      // However, we might want to keep general chat during the session.
      // For now, if logic implies "proper for each analysis", let's switch keys.

      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setMessages(JSON.parse(saved))
      } else {
        // Default welcome message if no history
        setMessages([{
          role: 'assistant',
          content: sessionId
            ? "I have analyzed your plant and I'm ready to help. You can ask me about the symptoms, treatment steps, or preventative measures."
            : "Hello! I'm your LeafScan Assistant. 🌿\n\nI'm here to help you identifying plant diseases and providing organic treatment plans.\n\n**To get started:**\n1. Upload a photo of a sick leaf\n2. I'll analyze it instantly\n3. We can discuss the best course of action\n\nOr simply ask me any gardening question right now!",
          timestamp: Date.now()
        }])
      }
      setHasInitialized(true)
    }
  }, [sessionId, STORAGE_KEY])

  // Save history
  useEffect(() => {
    if (hasInitialized && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages, hasInitialized, STORAGE_KEY])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const MAX_TURNS = 5

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (initialQuestion && messages.length === 1) {
      setInput(initialQuestion)
      // Slightly delay auto-send for effect
      setTimeout(() => {
        // Manual call to a modified sendMessage that takes a param would be cleaner, 
        // but for now we'll just set input and let user send or ... 
        // Actually, let's make it auto send if we can access the state ref or just execute logic.
        // Better: just add it to messages directly if it's the first render?
        // Or interact with sendMessage. let's modify sendMessage to take an optional content.
      }, 500)
    }
  }, [initialQuestion])

  // Robust auto-send effect
  const lastAutoSentQuestion = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (initialQuestion && initialQuestion !== lastAutoSentQuestion.current) {
      lastAutoSentQuestion.current = initialQuestion

      const performAutoSend = async () => {
        // Add user message immediately
        const userMessage: ChatMessage = { role: 'user', content: initialQuestion, timestamp: Date.now() }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)
        setTurnCount(prev => prev + 1)

        // Create empty assistant message correctly typed
        const initialAssistantMessage: ChatMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, initialAssistantMessage])

        try {
          // Use same streaming fetch as sendMessage
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ diagnosis, monitoringPlan, messages: [...messages, userMessage], language })
          })

          if (!response.ok) throw new Error('Network response was not ok')

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          if (!reader) throw new Error('No reader available')

          let fullText = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            fullText += chunk

            // Check for delimiter
            const delimiter = '__JSON_END__'
            if (fullText.includes(delimiter)) {
              const parts = fullText.split(delimiter)
              const visibleText = parts[0].trim()
              const jsonPart = parts[1]

              // Update message with final text
              setMessages(prev => {
                const newArr = [...prev]
                newArr[newArr.length - 1] = {
                  ...newArr[newArr.length - 1],
                  content: visibleText
                }
                return newArr
              })

              // Try parsing JSON if complete
              try {
                if (jsonPart.trim()) {
                  const data = JSON.parse(jsonPart)
                  if (data.suggestedQuestions) {
                    setMessages(prev => {
                      const newArr = [...prev]
                      newArr[newArr.length - 1] = {
                        ...newArr[newArr.length - 1],
                        suggestedQuestions: data.suggestedQuestions
                      }
                      return newArr
                    })
                  }
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            } else {
              // Normal streaming update
              setMessages(prev => {
                const newArr = [...prev]
                newArr[newArr.length - 1] = {
                  ...newArr[newArr.length - 1],
                  content: fullText
                }
                return newArr
              })
            }
          }
        } catch (e) {
          console.error(e)
          setMessages(prev => {
            const newArr = [...prev]
            // Remove the empty assistant message if it failed immediately, or update it
            newArr[newArr.length - 1] = {
              role: 'assistant',
              content: "I'm having trouble connecting right now. Please try again.",
              timestamp: Date.now()
            }
            return newArr
          })
        } finally {
          setIsLoading(false)
        }
      }
      performAutoSend()
    }
  }, [initialQuestion, diagnosis])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || turnCount >= MAX_TURNS) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setTurnCount(prev => prev + 1)

    try {
      // Create empty assistant message correctly typed
      const initialAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, initialAssistantMessage])

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis,
          actionResult,
          monitoringPlan,
          messages: [...messages, userMessage],
          language
        })
      })

      if (!response.ok) throw new Error('Network response was not ok')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No reader available')

      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        // Check for delimiter
        const delimiter = '__JSON_END__'
        if (fullText.includes(delimiter)) {
          const parts = fullText.split(delimiter)
          const visibleText = parts[0].trim()
          const jsonPart = parts[1] // Might be empty if split at very end

          // Update message with final text
          setMessages(prev => {
            const newArr = [...prev]
            newArr[newArr.length - 1] = {
              ...newArr[newArr.length - 1],
              content: visibleText
            }
            return newArr
          })

          // Try parsing JSON if complete
          try {
            if (jsonPart.trim()) {
              const data = JSON.parse(jsonPart)
              if (data.suggestedQuestions) {
                setMessages(prev => {
                  const newArr = [...prev]
                  newArr[newArr.length - 1] = {
                    ...newArr[newArr.length - 1],
                    suggestedQuestions: data.suggestedQuestions
                  }
                  return newArr
                })
              }
            }
          } catch (e) {
            // JSON might be incomplete in this chunk, wait for next? 
            // Actually with splitting by delim, we essentially expect it at end.
          }
        } else {
          // Normal streaming
          setMessages(prev => {
            const newArr = [...prev]
            newArr[newArr.length - 1] = {
              ...newArr[newArr.length - 1],
              content: fullText
            }
            return newArr
          })
        }
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-apeel-green text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-bounce-slow"
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[450px] md:w-[500px] max-w-[calc(100vw-2rem)] bg-apeel-cream rounded-[2rem] shadow-2xl border border-apeel-green/10 flex flex-col h-[80vh] max-h-[800px] z-50 overflow-hidden font-urbanist animate-scale-in origin-bottom-right">
      {/* Header */}
      <div className="bg-apeel-green text-white p-5 flex items-center justify-between cursor-pointer" onClick={() => onToggle(false)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-apeel-green rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">LeafScan Assistant</h3>
            <span className="text-xs text-white/60 font-medium tracking-wide">
              {monitoringPlan ? 'Monitoring Active' : diagnosis ? 'Analysis Ready' : 'Ready to Help'}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(false); }}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 scrollbar-thin scrollbar-thumb-apeel-green/20">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${message.role === 'user'
                ? 'bg-apeel-green text-white rounded-tr-none'
                : 'bg-white border border-apeel-light text-apeel-black rounded-tl-none'
                }`}
            >
              <div className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-apeel-black'}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <span className={`text-[10px] mt-1 block font-bold tracking-wider uppercase ${message.role === 'user' ? 'text-white/50' : 'text-apeel-green/50'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-apeel-light rounded-2xl p-3 flex items-center gap-2 shadow-sm rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-apeel-green" />
              <span className="text-xs font-bold text-apeel-green animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-apeel-green/5 bg-white">
        <div className="space-y-3">
          {/* Suggested Questions */}
          {messages[messages.length - 1]?.suggestedQuestions && messages[messages.length - 1].suggestedQuestions!.length > 0 && (
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-none">
              {messages[messages.length - 1].suggestedQuestions!.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q)
                  }}
                  className="text-xs bg-apeel-light text-apeel-green border border-apeel-green/10 px-3 py-2 rounded-xl hover:bg-apeel-green hover:text-white transition-all whitespace-nowrap font-bold flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your crops..."
              className="flex-1 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apeel-green shadow-inner text-apeel-black placeholder:text-gray-400 font-medium"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-apeel-green text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-apeel-dark transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed shadow-md group"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
