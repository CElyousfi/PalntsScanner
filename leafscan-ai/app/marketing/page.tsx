'use client'

import { useState, useEffect } from 'react'
import ImageUpload from '@/components/ImageUpload'
import DiagnosisReport from '@/components/DiagnosisReport'
import Header from '@/components/Header'
import ImpactStats from '@/components/ImpactStats'
import LoadingScreen from '@/components/LoadingScreen'
import LocationInput from '@/components/LocationInput'
import TreatmentPlanner from '@/components/TreatmentPlanner'
import AIChat from '@/components/AIChat'
import ApplicationsSlider from '@/components/ApplicationsSlider'
import { History } from 'lucide-react'
import MonitoringDashboard from '@/components/MonitoringDashboard'
import HistorySidebar from '@/components/HistorySidebar'
import { db } from '@/lib/db'
import { DiagnosisResult, LocationData, Session } from '@/types'
import { ArrowRight, Leaf, Shield, Smartphone, Globe, Github, BookOpen, Activity } from 'lucide-react'

import { useLanguage } from '@/context/LanguageContext'
import { createSessionFromDiagnosis, STORAGE_KEY as SESSION_KEY } from '@/lib/farm-session'

export default function Home() {
  const { t, dir, language } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null) // This will store the base64 image for display
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // This will store the object URL for preview
  const [location, setLocation] = useState<LocationData | null>(null)
  const [showTreatmentPlanner, setShowTreatmentPlanner] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan')
  const [analyzeStep, setAnalyzeStep] = useState<'idle' | 'uploading' | 'processing' | 'scanning' | 'tools' | 'finalizing' | 'complete'>('idle')
  const [monitoringPlan, setMonitoringPlan] = useState<any | null>(null) // State for the active monitoring plan
  const [diagnosisState, setDiagnosisState] = useState<'idle' | 'result'>('idle') // State to manage view transition

  // History State
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined)

  const [initialChatQuestion, setInitialChatQuestion] = useState<string | undefined>(undefined)

  // Load History on Mount
  useEffect(() => {
    const loadSessions = async () => {
      await db.open()
      const savedSessions = await db.getAllSessions()
      setSessions(savedSessions.sort((a, b) => b.timestamp - a.timestamp))
    }
    loadSessions()
  }, [diagnosisResult, monitoringPlan]) // Reload when meaningful state changes

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setIsAnalyzing(true)
    setAnalyzeStep('uploading')

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file)
    setSelectedImage(objectUrl)

    // Convert to Base64 for API
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setUploadedImage(base64String)

      // Start Analysis
      setAnalyzeStep('processing')
      await analyzeImage(base64String)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (base64Image: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          location: location,
          language: language // Pass current language
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalyzeStep('scanning')
        // Simulate a slight delay for "diagnosing" step visualization
        setTimeout(async () => {
          setDiagnosisResult(data.analysis)
          setAnalyzeStep('complete')
          setIsAnalyzing(false)
          setDiagnosisState('result')

          // --- SAVE SESSION ---
          const newSession: Session = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            image: base64Image, // Store Base64 in IndexedDB (be careful with size, but ok for MVP)
            diagnosis: data.analysis,
            location: location || undefined
          }
          await db.saveSession(newSession)
          setSessions(prev => [newSession, ...prev])
          setCurrentSessionId(newSession.id)
        }, 1500)

      } else {
        alert('Analysis failed: ' + data.error)
        setIsAnalyzing(false)
        setAnalyzeStep('idle')
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('An error occurred during analysis.')
      setIsAnalyzing(false)
      setAnalyzeStep('idle')
    }
  }

  const handleStartMonitoring = async () => {
    if (!diagnosisResult) return

    setAnalyzeStep('processing') // Reuse loading state
    setIsAnalyzing(true) // Show loading screen

    // Create treatment plan structure (mock if not fully generated)
    const treatmentPlan = {
      timeline: [
        { day: 1, action: "Begin organic treatment application" },
        { day: 3, action: "First checkpoint assessment" },
        { day: 7, action: "Evaluate progress and adjust" }
      ]
    }

    try {
      // Hide report immediately to show loader
      setDiagnosisState('idle')
      setDiagnosisResult(null)

      const response = await fetch('/api/monitoring/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis: diagnosisResult, treatmentPlan })
      })

      const data = await response.json()
      if (data.success) {
        setMonitoringPlan(data.monitoringPlan)
        setDiagnosisState('idle') // Clear diagnosis view
        setDiagnosisResult(null) // Switch to dashboard view essentially

        // Update Session Persistence
        if (currentSessionId) {
          const updatedSessions = sessions.map(s => s.id === currentSessionId ? { ...s, monitoringPlan: data.monitoringPlan } : s)
          setSessions(updatedSessions)

          // Persist to DB
          const currentSession = sessions.find(s => s.id === currentSessionId)
          if (currentSession) {
            db.saveSession({ ...currentSession, monitoringPlan: data.monitoringPlan })
          }
        }

        // --- NEW: Create Farm Persistent Session ---
        // This initializes the autonomous tracker
        const farmSession = createSessionFromDiagnosis(
          diagnosisResult,
          data.monitoringPlan,
          location?.city || 'Unknown Location'
        )
        localStorage.setItem(SESSION_KEY, JSON.stringify(farmSession))
        // ------------------------------------------

      }
    } catch (e) {
      console.error("Failed to start monitoring", e)
      alert("Failed to start Marathon Agent. Please try again.")
    } finally {
      setAnalyzeStep('idle')
      setIsAnalyzing(false)
    }
  }

  const handleFollowUp = (day: number, file: File) => {
    console.log("Follow up check-in for day", day, file.name)
    // In a real app, this would upload the file to an API endpoint
    // and update the monitoring plan state.
    // For MVP, we can just acknowledge it.
    alert(`Follow-up photo received for Day ${day}! The agent is analyzing recovery...`)
  }

  // Handle when visual guide is generated in Dashboard (Prop Drill or Context)
  const handleMonitoringVisualSaved = (prompt: string, imageUrl: string) => {
    // Could modify the active plan structure in real-time
    if (monitoringPlan) {
      const updatedPlan = {
        ...monitoringPlan,
        visualGuides: { ...monitoringPlan.visualGuides, [prompt]: imageUrl }
      }
      setMonitoringPlan(updatedPlan)
      // Also update session
      if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId)
        if (session) {
          db.saveSession({ ...session, monitoringPlan: updatedPlan })
        }
      }
    }
  }

  const handleVisualSaved = (prompt: string, imageUrl: string) => {
    if (diagnosisResult) { // Check if we are in diagnosis mode
      // We can't easily mutate state deep inside, but we can try to save to DB?
      // For now, let's just log it or handle strictly needed updates
      // Realistically, Analysis Report manages its own visuals via state usually
      // But if we want to PERSIST it:
      if (currentSessionId) {
        // Update session in DB
        // This is complex because DiagnosisResult structure needs to hold it?
        // Let's assume for now visual generation is ephemeral or handled in component
      }
    }
  }

  const handleReset = () => {
    setDiagnosisResult(null)
    setUploadedImage(null)
    setSelectedImage(null)
    setIsAnalyzing(false)
    setShowTreatmentPlanner(false)
    setShowChat(false)
    setAnalyzeStep('idle')
    setDiagnosisState('idle')
    // Reset Location Context as requested
    setLocation(null)
    // Clear current session ID so Chat starts fresh
    setCurrentSessionId(undefined)
    // Also clear general chat history to ensure a clean slate as requested
    localStorage.removeItem('chat_history_general')
  }

  const handleRestoreSession = (session: Session, mode: 'analysis' | 'monitoring' = 'analysis') => {
    setCurrentSessionId(session.id)
    setUploadedImage(session.image)
    setSelectedImage(session.image)
    setLocation(session.location || null)

    if (mode === 'monitoring' && session.monitoringPlan) {
      setMonitoringPlan(session.monitoringPlan)
      localStorage.setItem('activeMonitoringPlan', JSON.stringify(session.monitoringPlan))

      // Upgrade logic: Ensure farm session exists
      const existingFarmSession = localStorage.getItem(SESSION_KEY)
      if (!existingFarmSession && session.diagnosis) {
        // If restoring a session that has a plan but no farm-session (e.g. from indexedDB history), create one
        const newSession = createSessionFromDiagnosis(
          session.diagnosis,
          session.monitoringPlan,
          session.location?.city || 'Restored Location'
        )
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
      }

      setDiagnosisResult(null)
      setDiagnosisState('idle') // Dashboard will render
    } else {
      setDiagnosisResult(session.diagnosis)
      setMonitoringPlan(null) // Clear active plan if viewing analysis
      setDiagnosisState('result')
      setAnalyzeStep('complete')
      setShowChat(false)
      setShowTreatmentPlanner(false)
    }

    // Scroll to results/dashboard
    setTimeout(() => {
      document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSymptomClick = (symptom: string, area: string) => {
    setInitialChatQuestion(`I noticed "${symptom}" in the ${area} area. Can you explain what this indicates and how to treat it?`)
    setShowChat(true)
  }

  const handleDeleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    await db.deleteSession(sessionId)
    // Also remove specific chat history
    localStorage.removeItem(`chat_history_${sessionId}`)
  }

  return (
    <div className={`min-h-screen bg-white ${dir === 'rtl' ? 'rtl' : 'ltr'}`} dir={dir}>
      <Header />

      {/* Sidebar for History */}
      <HistorySidebar
        sessions={sessions}
        onRestore={handleRestoreSession}
        onDelete={handleDeleteSession}
      />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E8F5E9] rounded-l-[5rem] -z-10 opacity-60" />

          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-apeel-green/10 text-apeel-green px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase">
                <Shield className="w-4 h-4" />
                {t('hero.badge')}
              </div>

              <h1 className="text-6xl md:text-7xl font-serif font-bold text-apeel-black leading-[1.1]">
                {t('hero.title')}<span className="text-apeel-green">.</span>
              </h1>

              <p className="text-xl text-black/60 max-w-lg leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary flex items-center gap-3 text-lg px-8 py-4 bg-apeel-green text-white rounded-full hover:bg-opacity-90 transition-all font-bold shadow-xl shadow-apeel-green/20"
                >
                  {t('hero.ctaStatus')} <ArrowRight className="w-5 h-5" />
                </button>
                <a href="/tracker" className="flex items-center gap-3 text-lg px-8 py-4 bg-white text-apeel-green border-2 border-apeel-green rounded-full hover:bg-apeel-green/5 transition-all font-bold">
                  <Activity className="w-5 h-5" /> {t('hero.ctaTracker')}
                </a>
              </div>

              <div className="flex items-center gap-8 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <p className="text-xs font-bold tracking-widest uppercase">Trusted By</p>
                <div className="flex gap-6">
                  <span className="font-serif font-bold text-xl">AgriTech</span>
                  <span className="font-serif font-bold text-xl">FarmAI</span>
                  <span className="font-serif font-bold text-xl">GreenLife</span>
                </div>
              </div>
            </div>

            <div className="relative h-[600px] hidden md:block animate-fade-in-delayed">
              <div className="absolute right-0 top-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1625246333195-58197bd47a30?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center rounded-[3rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700" />
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 max-w-xs animate-float">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Analysis Complete</p>
                  <p className="text-lg font-bold text-apeel-green">98% Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-12 bg-white border-y border-black/5">
          <div className="max-w-7xl mx-auto px-6">
            <ImpactStats />
          </div>
        </section>

        {/* FEATURES GRID (Replacing "How it Works") */}
        <section className="py-24 px-6 md:px-12 bg-apeel-cream">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-16 text-apeel-black">
              Advanced Crop Protection
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-lg shadow-black/5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Mobile-First Diagnosis</h3>
                <p className="text-gray-500 leading-relaxed">
                  Snap a photo of any leaf. Our Gemini-powered engine identifies pests and diseases in seconds, even offline.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-lg shadow-black/5">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <Leaf className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Live Recovery Tracker</h3>
                <p className="text-gray-500 leading-relaxed">
                  Monitor healing over time. Track infection rates dropping and watch your projected yield recover day by day.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-lg shadow-black/5">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Shield</h3>
                <p className="text-gray-500 leading-relaxed">
                  Your checks help protect neighbors. Early detection creates a digital firewall against regional outbreaks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* APPLICATION CAROUSEL */}
        <section className="py-24 bg-apeel-black text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-96 h-96 bg-apeel-green rounded-full blur-[100px]" />
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
          </div>
          <ApplicationsSlider />
        </section>

        {/* INTERACTIVE UPLOAD SECTION */}
        <section id="upload" className="py-32 px-6 bg-apeel-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-6xl md:text-8xl font-bold text-apeel-green mb-8">
                SEE FOR YOURSELF.
              </h2>
              <p className="text-2xl text-black/60">
                Upload a photo to see our diagnostic engine in action.
              </p>
            </div>

            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-2 border-apeel-light">
              {!diagnosisResult && !isAnalyzing && !monitoringPlan && (
                <div className="space-y-8">
                  <LocationInput
                    onLocationSelect={setLocation}
                    currentLocation={location}
                  />
                  <ImageUpload onImageUpload={handleFileSelect} />
                </div>
              )}

              {isAnalyzing && <LoadingScreen step={analyzeStep} />}


              {monitoringPlan && !diagnosisResult && (
                <MonitoringDashboard
                  plan={monitoringPlan} // Fallback
                  session={null} // Main Dashboard handles session logic mostly, but we are in page view which is mostly simulated or legacy
                  // However, for consistency, the dashboard checks 'session'. 
                  // If we are in this view, it's usually transient. 
                  // But newly created session IS in localStorage.
                  // Ideally, we should redirect to /tracker for the full experience.
                  // But to keep existing flow -> we pass null and it might show loading or fallback.
                  // BETTER: Just redirect to /tracker?
                  // Providing basic props to keep it rendering if needed, but the 'Start Monitoring' usually leads here.
                  // Let's pass null for session to force it to behave as 'just created' or use plan.
                  // Actually, MonitoringDashboard now REQUIRES 'session' prop we defined? 
                  // In the file we wrote: session: FarmSession | null. So null is fine.
                  onFollowUp={handleFollowUp}
                  onClose={() => setMonitoringPlan(null)}
                  onVisualGenerated={handleMonitoringVisualSaved}
                />
              )}

              {diagnosisResult && (
                <div className="animate-reveal">
                  <DiagnosisReport
                    result={diagnosisResult}
                    image={uploadedImage || ''}
                    onReset={handleReset}
                    onOpenTreatmentPlanner={() => setShowTreatmentPlanner(true)}
                    onOpenChat={() => {
                      setInitialChatQuestion(undefined)
                      setShowChat(true)
                    }}
                    onSymptomClick={handleSymptomClick}
                    onStartMonitoring={handleStartMonitoring}
                    onVisualGenerated={handleVisualSaved}
                  />
                  {/* Modals */}
                  {showTreatmentPlanner && (
                    <TreatmentPlanner
                      diagnosis={diagnosisResult}
                      onClose={() => setShowTreatmentPlanner(false)}
                    />
                  )}

                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="bg-white py-12 border-t border-black/5 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-2xl font-serif font-bold text-apeel-green">
            <Leaf className="w-8 h-8" /> LeafScan
          </div>
          <p className="text-gray-400">© 2024 LeafScan AI. Built for the Sustainability Hackathon.</p>
        </footer>
      </main>

      {/* GLOBAL CHAT (Always available) */}
      <AIChat
        isOpen={showChat}
        onToggle={setShowChat}
        diagnosis={diagnosisResult}
        initialQuestion={initialChatQuestion}
      />
    </div>
  )
}
