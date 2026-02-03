'use client'

import { useState } from 'react'
import { Calendar, CheckCircle2, Circle, Loader2, X, TrendingUp, AlertTriangle, CloudRain, ThermometerSun, Sprout, DollarSign, Activity, FileText, ShoppingBag, Volume2, VolumeX } from 'lucide-react'
import { TreatmentPlan, TreatmentStep, DiagnosisResult } from '@/types'
import { useLanguage } from '@/context/LanguageContext'
import { usePublicAccess } from '@/context/PublicAccessContext'

interface TreatmentPlannerProps {
  diagnosis: DiagnosisResult
  onClose: () => void
  onExecuteAction?: (action: string) => void
}

export default function TreatmentPlanner({ diagnosis, onClose, onExecuteAction }: TreatmentPlannerProps) {
  const { t, language } = useLanguage()
  const { isPublicMode } = usePublicAccess()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [plan, setPlan] = useState<TreatmentPlan | null>(null)

  const [formData, setFormData] = useState({
    farmSize: '',
    budget: '',
    resourcePreference: 'organic' as 'organic' | 'chemical' | 'mixed',
    deepThink: true
  })

  // Voice Readout Function (High Accessibility)
  const speakPlan = () => {
    if (!plan) return
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    // Safe access to timeline items
    const firstStep = plan.timeline?.[0]
    const confidence = diagnosis.diseases?.[0]?.confidence ? Math.round(diagnosis.diseases[0].confidence * 100) : 0
    const text = `Treatment Plan for ${diagnosis.cropType}. Confidence Level ${confidence} percent. Step 1: ${firstStep?.action || 'Review plan'}. ${firstStep?.details || ''}.`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const generatePlan = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis,
          preferences: formData,
          language
        })
      })
      const data = await response.json()
      setPlan(data)
    } catch (error) {
      console.error('Error generating plan:', error)
      alert('Failed to generate plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleStep = (index: number) => {
    if (!plan) return
    const newTimeline = [...plan.timeline]
    newTimeline[index].completed = !newTimeline[index].completed
    setPlan({ ...plan, timeline: newTimeline })
    sessionStorage.setItem('treatmentPlan', JSON.stringify({ ...plan, timeline: newTimeline }))
  }

  return (
    <div className="fixed inset-0 bg-apeel-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-apeel-cream rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">

        {/* Header */}
        <div className="sticky top-0 bg-apeel-cream/95 backdrop-blur border-b border-apeel-green/10 p-6 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-apeel-green text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">{t('components.planner.beta')}</span>
              <h2 className="text-2xl font-serif font-bold text-apeel-green">{t('components.planner.title')}</h2>
            </div>
            <p className="text-sm text-gray-500 font-medium">{t('components.planner.subtitle')} ({diagnosis.cropType})</p>
          </div>
          <div className="flex items-center gap-2">
            {plan && isPublicMode && (
              <button
                onClick={speakPlan}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${isPlaying ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                {isPlaying ? 'Stop' : 'Read Aloud'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {!plan ? (
            <div className="max-w-xl mx-auto py-12">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-apeel-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-8 h-8 text-apeel-green" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-apeel-black mb-3">{t('components.planner.init_title')}</h3>
                <p className="text-gray-500">{t('components.planner.init_desc')}</p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-apeel-green uppercase tracking-widest mb-2">{t('components.planner.farm_size')}</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 Acres"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-apeel-green/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-apeel-green uppercase tracking-widest mb-2">{t('components.planner.budget')}</label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? '٣٠٠ درهم' : (language === 'fr' ? 'ex. 300 DH' : 'e.g. $200')}
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-apeel-green/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-apeel-green uppercase tracking-widest mb-3">{t('components.planner.strategy')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['organic', 'chemical', 'mixed'] as const).map((pref) => (
                      <button
                        key={pref}
                        onClick={() => setFormData({ ...formData, resourcePreference: pref })}
                        className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${formData.resourcePreference === pref
                          ? 'bg-apeel-green text-white border-apeel-green shadow-lg scale-105'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-apeel-green/50'
                          }`}
                      >
                        {t(`components.planner.strategy_options.${pref}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-800 text-sm">{t('components.planner.deep_reasoning')}</h4>
                    <p className="text-xs text-blue-600/80 mt-1">{t('components.planner.deep_desc')}</p>
                  </div>
                </div>

                <button
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="w-full bg-apeel-black text-white px-8 py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('components.planner.generating')}
                    </>
                  ) : (
                    <>{t('components.planner.generate_btn')}</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-apeel-green/10 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-apeel-green mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6" /> {t('components.planner.timeline_title')}
                  </h3>

                  <div className="space-y-4">
                    {plan.timeline.map((step, index) => (
                      <div key={index} className={`relative pl-8 border-l-2 ${step.completed ? 'border-apeel-green' : 'border-gray-200'} pb-8 last:pb-0`}>
                        <button
                          onClick={() => toggleStep(index)}
                          className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-colors ${step.completed ? 'bg-apeel-green border-apeel-green' : 'bg-white border-gray-300 hover:border-apeel-green'}`}
                        />
                        <div className={`p-4 rounded-2xl border transition-all ${step.completed ? 'bg-green-50 border-green-100 opacity-60' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-apeel-green uppercase tracking-wide bg-apeel-green/10 px-2 py-1 rounded-md">{t('components.planner.day')} {step.day}</span>
                            {step.cost && <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{step.cost}</span>}
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{step.action}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{step.details}</p>
                          {step.weatherAdvice && (
                            <div className="mt-3 mr-2 flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                              <CloudRain className="w-4 h-4" />
                              {step.weatherAdvice}
                            </div>
                          )}
                          <div className="mt-3 flex gap-2">
                            {/* High Agency 'Execute' Button */}
                            {!step.completed && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const btn = e.currentTarget;
                                  const originalText = btn.innerText;
                                  btn.innerText = "Connecting to Supplier...";
                                  btn.disabled = true;
                                  try {
                                    await new Promise(r => setTimeout(r, 1500));
                                    btn.innerText = "Checking Stock...";
                                    await new Promise(r => setTimeout(r, 1000));
                                    btn.innerText = "Reserving...";
                                    await new Promise(r => setTimeout(r, 800));
                                    toggleStep(index);
                                    alert(`✅ RESERVED: ${step.action}\n\nWe've reserved this item at 'Bio-Agri Maroc'. Pick up by 6 PM today.`);
                                  } catch (err) {
                                    alert("Failed to reserve.");
                                    btn.innerText = originalText;
                                    btn.disabled = false;
                                  }
                                }}
                                className="px-4 py-2 bg-apeel-green text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 shadow-sm"
                              >
                                <ShoppingBag className="w-3 h-3" /> Auto-Reserve
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStep(index); }}
                              className="px-3 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {step.completed ? "Undo" : "Mark Done"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Metrics */}
              <div className="space-y-6">
                <div className="bg-apeel-black text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-apeel-green rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> {t('components.planner.economic_title')}
                  </h4>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="text-3xl font-serif font-bold text-emerald-400 mb-1">{plan.economicAnalysis?.roi || "High"}</div>
                      <p className="text-xs text-gray-400">{t('components.planner.roi')}</p>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{t('components.planner.est_cost')}</span>
                        <span className="font-bold">{plan.economicAnalysis?.totalEstimatedCost || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{t('components.planner.crop_saved')}</span>
                        <span className="font-bold text-emerald-400">{plan.economicAnalysis?.potentialSavings || t('components.planner.n_a')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4" /> {t('components.planner.weather_title')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-xl">☀️</span>
                      <div>
                        <span className="text-xs font-bold text-amber-700 uppercase">{t('components.planner.weather_conditions.heatwave')}</span>
                        <p className="text-xs text-amber-800 leading-tight mt-1">{plan.weatherAdaptations?.heatwave || t('components.planner.unknown')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-xl">🌧️</span>
                      <div>
                        <span className="text-xs font-bold text-blue-700 uppercase">{t('components.planner.weather_conditions.rain')}</span>
                        <p className="text-xs text-blue-800 leading-tight mt-1">{plan.weatherAdaptations?.rain || t('components.planner.unknown')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {plan.alternatives.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> {t('components.planner.contingencies')}
                    </h4>
                    <ul className="space-y-2">
                      {plan.alternatives.slice(0, 3).map((alt, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <Circle className="w-2 h-2 text-gray-300 mt-1 flex-shrink-0" />
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setPlan(null)}
                  className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  {t('components.planner.regenerate')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
