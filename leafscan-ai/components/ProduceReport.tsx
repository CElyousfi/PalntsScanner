import { useState, useEffect, useRef } from 'react'
import { Scale, Ruler, Eye, TrendingUp, AlertCircle, CheckCircle2, Apple, Info, BookOpen, Play, Maximize2, Clock, Refrigerator, ChefHat, Search, ExternalLink, FileText, Plus, Award, AlertTriangle, XCircle, ChevronDown, Shield } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { useRouter } from 'next/navigation'
import ExportMenu from '@/components/ExportMenu'

interface ProduceReportProps {
  image: string
  results: any
  onClose?: () => void
  scanId?: string
  onCreateNote?: (scanId: string) => void
}

export default function ProduceReport({ image, results, onClose, scanId, onCreateNote }: ProduceReportProps) {
  const [selectedDefect, setSelectedDefect] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, left: 0, top: 0 })
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialData, setTutorialData] = useState<any>(null)
  const [loadingTutorial, setLoadingTutorial] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const router = useRouter()

  const handleExploreAction = (query: string) => {
    const encodedQuery = encodeURIComponent(query)
    router.push(`/dashboard/explore?q=${encodedQuery}`)
  }

  useEffect(() => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight,
        left: imageRef.current.offsetLeft,
        top: imageRef.current.offsetTop
      })
    }
  }, [image])

  const getGradeColor = (grade: string) => {
    if (grade.includes('Extra') || grade.includes('Fancy')) return 'from-emerald-500 to-green-600'
    if (grade === 'Class I' || grade === 'Fancy' || grade === 'No.1') return 'from-green-500 to-emerald-600'
    if (grade === 'Class II' || grade === 'No.2') return 'from-amber-500 to-orange-600'
    return 'from-red-500 to-rose-600'
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'Critical') return 'text-red-600 bg-red-50 border-red-200'
    if (severity === 'High') return 'text-red-500 bg-red-50 border-red-100'
    if (severity === 'Medium') return 'text-orange-600 bg-orange-50 border-orange-200'
    if (severity === 'Low') return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (severity === 'Micro') return 'text-cyan-600 bg-cyan-50 border-cyan-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getGradeTextColor = (grade: string) => {
    if (!grade) return 'text-gray-700'
    if (grade.includes('Extra') || grade === 'Class I' || grade === 'Fancy' || grade === 'No.1') return 'text-green-700'
    if (grade === 'Class II' || grade === 'No.2') return 'text-orange-700'
    return 'text-red-700'
  }

  const fetchTutorial = async (topic: string) => {
    setLoadingTutorial(true)
    setShowTutorial(true)
    try {
      const response = await fetch('/api/get-produce-tutorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produceType: results.variety.name,
          topic: topic
        })
      })
      const data = await response.json()
      if (data.success) {
        setTutorialData(data.tutorial)
      }
    } catch (error) {
      console.error('Failed to fetch tutorial:', error)
    } finally {
      setLoadingTutorial(false)
    }
  }

  // Prepare export data
  const exportData = {
    scanId: scanId || `produce-${Date.now()}`,
    type: 'Produce Analysis',
    timestamp: new Date().toISOString(),
    summary: {
      qualityScore: results.overall_quality_score,
      confidence: results.grading?.grading_confidence,
      grade: results.grading?.grade_eu || results.grading?.grade_usda,
    },
    produce: {
      variety: results.variety,
      estimates: results.estimates,
      shelf_life: results.shelf_life || results.estimates?.shelf_life_days || results.shelf_life_estimate,
      grading: results.grading,
    },
    defects: results.areas?.map((area: any, idx: number) => ({
      id: `#${idx + 1}`,
      description: area.description,
      severity: area.severity,
      defect_type: area.defect_type,
      confidence: area.confidence,
      size_percent: area.size_percent,
      inferred_cause: area.inferred_cause,
      depth_inference: area.depth_inference,
      impact_on_shelf_life: area.impact_on_shelf_life,
    })) || [],
  }

  return (
    <div className="space-y-6" id="produce-report-container">
      {/* Export Menu */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
        <ExportMenu data={exportData} elementId="produce-report-container" reportType="produce" />
      </div>
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={image}
        altText={`Analyzed ${results.variety.name}`}
      >
        {results.areas?.map((area: any) => (
          <div
            key={area.id}
            className={`absolute border-4 rounded-full transition-all ${area.severity === 'Critical'
              ? 'border-red-500 bg-red-500/20'
              : 'border-orange-500 bg-orange-500/20'
              }`}
            style={{
              left: `${area.center_x * 100}%`,
              top: `${area.center_y * 100}%`,
              width: `${area.radius * 2 * 100}%`,
              aspectRatio: '1/1',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg text-sm font-bold border border-gray-200 whitespace-nowrap z-50">
              <span className={area.severity === 'Critical' ? 'text-red-600' : 'text-orange-600'}>
                #{area.id} {area.label}
              </span>
            </div>
          </div>
        ))}
      </ImageLightbox>

      {/* NEW: BATCH / SCENE CONTEXT CARD */}
      {(results.overall_scene || results.batch_summary) && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-apeel-green/5 border border-white/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100/50 pb-6">
              <div className="p-3.5 bg-gradient-to-br from-apeel-green to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <Maximize2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-900">Batch Inspection Context</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Holistic analysis of the entire scene</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Eye className="w-3 h-3" /> Scene Description
                </h4>
                <p className="text-gray-700 leading-relaxed text-base font-medium bg-white/50 p-4 rounded-2xl border border-white/50">{results.overall_scene}</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Batch Summary
                </h4>
                <p className="text-gray-700 leading-relaxed text-base font-medium bg-white/50 p-4 rounded-2xl border border-white/50">{results.batch_summary}</p>
              </div>
            </div>

            {/* Batch Stats Widget */}
            {results.batch_statistics && (
              <div className="mt-8 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl p-6 border border-white/60 shadow-inner grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-serif font-bold text-gray-900">{results.batch_statistics.total_items}</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Total Fruit</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 truncate" title={results.batch_statistics.uniformity}>{results.batch_statistics.uniformity}</div>
                  <div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Uniformity</div>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {results.batch_statistics.predominant_issues?.map((issue: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full shadow-sm">{issue}</span>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-gray-400 mt-2">Common Defects</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {onCreateNote && scanId && (
        <div className="flex justify-end animate-fade-in">
          <button
            onClick={() => onCreateNote(scanId)}
            className="group py-3 px-6 text-sm flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20"
          >
            <div className="bg-blue-100 group-hover:bg-white/20 p-1 rounded-full transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-bold">Create Note for this Scan</span>
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image with Defect Highlights */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-white/40 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-2xl flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-apeel-green/10 rounded-xl text-apeel-green">
                <Apple className="w-6 h-6" />
              </div>
              Surgical Analysis
            </h3>
            {results.demoMode && (
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-100">
                Demo Mode
              </span>
            )}
          </div>

          <div className="relative group rounded-3xl overflow-hidden shadow-inner bg-gray-50">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/20"
                title="Zoom Image"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <img
              ref={imageRef}
              src={image}
              alt="Produce"
              className="max-w-full max-h-[600px] w-auto h-auto mx-auto object-contain"
              onLoad={() => {
                if (imageRef.current) {
                  setImageSize({
                    width: imageRef.current.offsetWidth,
                    height: imageRef.current.offsetHeight,
                    left: imageRef.current.offsetLeft,
                    top: imageRef.current.offsetTop
                  })
                }
              }}
            />

            {/* Defect Overlays */}
            {results.areas?.map((area: any) => {
              // Calculate position relative to the image, then add the image's offset within the container
              const cx = (area.center_x * imageSize.width) + (imageSize.left || 0)
              const cy = (area.center_y * imageSize.height) + (imageSize.top || 0)
              const r = area.radius * imageSize.width

              return (
                <div
                  key={area.id}
                  className={`absolute border-4 rounded-full cursor-pointer transition-all duration-300 ${selectedDefect === area.id
                    ? 'border-white ring-4 ring-red-500 bg-red-500/30 w-[120%] h-[120%] z-10'
                    : area.severity === 'Critical'
                      ? 'border-red-500 bg-red-500/20 hover:bg-red-500/30 hover:border-red-400'
                      : 'border-orange-500 bg-orange-500/20 hover:bg-orange-500/30 hover:border-orange-400'
                    }`}
                  style={{
                    left: `${cx - r}px`,
                    top: `${cy - r}px`,
                    width: `${r * 2}px`,
                    height: `${r * 2}px`
                  }}
                  onClick={() => setSelectedDefect(selectedDefect === area.id ? null : area.id)}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-xl text-xs font-bold border border-gray-200 transform hover:scale-110 transition-transform">
                    #{area.id}
                  </div>
                </div>
              )
            })}

            {/* Grade Badge */}
            <div className={`absolute bottom-6 left-6 bg-gradient-to-r ${getGradeColor(results.grading.grade_eu || results.grading.grade)} pl-6 pr-8 py-4 rounded-2xl text-white shadow-2xl shadow-black/20 pointer-events-none backdrop-blur-md bg-opacity-90`}>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Grade</div>
              <div className="text-3xl font-serif font-bold">{results.grading.grade_eu || results.grading.grade}</div>
              {results.grading.grade_usda && (
                <div className="text-sm font-medium opacity-90 mt-1 border-t border-white/20 pt-1">USDA {results.grading.grade_usda}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Grading Details */}
        <div className="space-y-8">
          {/* Overall Grading */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white/40">
            <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-apeel-green/10 rounded-xl text-apeel-green">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              Overall Grading
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                <div className="text-xs text-gray-500 font-bold uppercase mb-2 tracking-wide">Quality Score</div>
                <div className="text-4xl font-serif font-bold text-apeel-green group-hover:scale-105 transition-transform origin-left">{results.overall_quality_score}<span className="text-lg text-gray-400 font-sans ml-1">/100</span></div>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                <div className="text-xs text-gray-500 font-bold uppercase mb-2 tracking-wide">Confidence</div>
                <div className="text-4xl font-serif font-bold text-gray-900 group-hover:scale-105 transition-transform origin-left">{results.grading.grading_confidence}<span className="text-lg text-gray-400 font-sans">%</span></div>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                <div className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Est. Weight
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.estimates?.weight_g || results.grading.estimated_weight_g}g
                </div>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                <div className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5" /> Diameter
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.estimates?.diameter_mm || results.grading.estimated_diameter_mm}mm
                </div>
              </div>
            </div>

            {/* Multi-Standard Grading */}
            {(results.grading.grade_eu || results.grading.grade_usda) && (
              <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Award className="w-16 h-16 text-purple-600" /></div>
                <div className="font-bold text-purple-900 mb-3 relative z-10 text-sm uppercase tracking-wide">International Standards</div>
                <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                  {results.grading.grade_eu && (
                    <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-white/50">
                      <span className="text-purple-600 font-bold text-xs block mb-1">EU STANDARD</span>
                      <span className="font-serif font-bold text-lg text-purple-900">{results.grading.grade_eu}</span>
                    </div>
                  )}
                  {results.grading.grade_usda && (
                    <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-white/50">
                      <span className="text-purple-600 font-bold text-xs block mb-1">USDA STANDARD</span>
                      <span className="font-serif font-bold text-lg text-purple-900">{results.grading.grade_usda}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Consumability Status */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white/40">
            <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-apeel-green/10 rounded-xl text-apeel-green">
                <ChefHat className="w-6 h-6" />
              </div>
              Consumability
            </h3>

            <div className="grid grid-cols-1 gap-6 mb-4">
              {(() => {
                const score = results.overall_quality_score
                let status = ''
                let icon = null
                let description = ''
                let bgClass = ''

                if (score >= 80) {
                  status = 'Safe to Eat'
                  description = 'Excellent quality - consume normally'
                  bgClass = 'bg-gradient-to-br from-apeel-green to-emerald-600 shadow-emerald-500/20'
                  icon = <CheckCircle2 className="w-8 h-8 text-emerald-100" />
                } else if (score >= 60) {
                  status = 'Consume Soon'
                  description = 'Acceptable quality - use within 1-2 days'
                  bgClass = 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/20'
                  icon = <Clock className="w-8 h-8 text-amber-100" />
                } else if (score >= 40) {
                  status = 'Poor Quality'
                  description = 'Significant defects - use immediately or discard'
                  bgClass = 'bg-gradient-to-br from-orange-500 to-red-500 shadow-red-500/20'
                  icon = <AlertTriangle className="w-8 h-8 text-orange-100" />
                } else {
                  status = 'Do Not Consume'
                  description = 'Severely degraded - discard immediately'
                  bgClass = 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-500/30'
                  icon = <XCircle className="w-8 h-8 text-red-100" />
                }

                return (
                  <div className={`rounded-3xl p-8 border border-white/20 shadow-xl ${bgClass} text-white relative overflow-hidden group`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                    <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                      <Apple className="w-48 h-48" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 border border-white/30 px-3 py-1 rounded-full bg-black/10 backdrop-blur-sm">
                          Suggestion
                        </div>
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                          {icon}
                        </div>
                      </div>

                      <h4 className="text-4xl font-serif font-bold mb-2 tracking-tight">{status}</h4>
                      <p className="text-lg opacity-90 font-medium mb-6 max-w-xs leading-relaxed">
                        {description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/20">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Condition</span>
                          <span className="text-xl font-bold">{score}/100</span>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Confidence</span>
                          <span className="text-xl font-bold">{results.grading.grading_confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Estimated Shelf Life */}
            {(results.shelf_life !== undefined || results.estimates?.shelf_life_days !== undefined || results.shelf_life_estimate !== undefined) && (() => {
              const shelfLife = results.shelf_life ?? results.estimates?.shelf_life_days ?? results.shelf_life_estimate ?? 0
              const isExpired = shelfLife === 0

              return (
                <div className={`mt-6 p-6 rounded-3xl border relative overflow-hidden group ${isExpired
                  ? 'bg-red-50/50 border-red-100'
                  : 'bg-white/60 backdrop-blur-xl border-white/40 shadow-sm'
                  }`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isExpired ? 'bg-red-200/30' : 'bg-blue-200/30'}`} />

                  <div className="relative z-10 flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shadow-sm ${isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 '}`}>
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isExpired ? 'text-red-500' : 'text-blue-500'}`}>
                        {isExpired ? 'Status' : 'Estimated Shelf Life'}
                      </div>
                      <div className={`text-3xl font-serif font-bold ${isExpired ? 'text-red-900' : 'text-gray-900'}`}>
                        {isExpired ? 'Not Suitable' : `${shelfLife} Days`}
                      </div>
                      {isExpired ? (
                        <div className="text-xs font-bold text-red-600 mt-2 bg-red-100 inline-block px-3 py-1 rounded-full">Severe Degradation</div>
                      ) : (
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full" style={{ width: `${Math.min((shelfLife / 14) * 100, 100)}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Primary Defect */}
          <div className="mt-4 p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Primary Defect</div>
                <div className="font-serif font-bold text-gray-900 text-lg leading-tight mb-1">
                  {results.grading.primary_defect}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {results.grading.defect_coverage_percent}% total coverage
                </div>
              </div>
            </div>
          </div>

          {/* Color Maturity */}
          <div className="mt-4 p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group hover:border-green-200 transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-100/50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Color Maturity</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif font-bold text-gray-900 text-lg">{results.grading.color_maturity_score}/100</span>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Optimal</span>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  Ideal for {results.variety.name}
                </div>
              </div>
            </div>
          </div>

          {/* Ripeness Assessment */}
          {results.assessment && (
            <div className="mt-4 p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Ripeness</div>
                  <div className="font-serif font-bold text-gray-900 text-lg leading-tight mb-1">
                    {results.assessment.ripeness_stage}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Score: {results.assessment.ripeness_score}/100
                  </div>
                  {results.assessment.texture_analysis && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 italic">
                      "{results.assessment.texture_analysis}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sustainability Impact */}
          {results.sustainability_impact && (
            <div className="mt-4 p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${results.sustainability_impact.includes('Low') ? 'bg-green-50 text-green-600' :
                  results.sustainability_impact.includes('Medium') ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sustainability</div>
                  <div className="font-serif font-bold text-gray-900 text-lg leading-tight">
                    {results.sustainability_impact}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div > {/* End of Main Grid */}

      {/* Action Buttons - Explore More */}
      <div className="mt-8 bg-apeel-green rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl shadow-apeel-green/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-24 -translate-y-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl -translate-x-12 translate-y-12 pointer-events-none" />

        <div className="relative z-10">
          <h3 className="font-serif font-bold text-2xl mb-3 flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Search className="w-6 h-6" />
            </div>
            Explore More
          </h3>
          <p className="text-white/90 text-sm mb-8 max-w-2xl font-medium">
            Get expert advice on storage, recipes, and everything about {results.variety.name}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleExploreAction(`How to store ${results.variety.name} to maximize shelf life and freshness`)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl transition-all text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Refrigerator className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Storage</span>
              </div>
              <p className="text-xs text-white/70 mb-2 leading-relaxed h-8 line-clamp-2">
                Optimal conditions for freshness
              </p>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                View Guide <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </button>

            <button
              onClick={() => handleExploreAction(`Best recipes and cooking ideas using ${results.variety.name}`)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl transition-all text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Recipes</span>
              </div>
              <p className="text-xs text-white/70 mb-2 leading-relaxed h-8 line-clamp-2">
                Delicious ways to use {results.variety.name}
              </p>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                Get Ideas <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </button>

            <button
              onClick={() => handleExploreAction(`Nutritional benefits and health facts about ${results.variety.name}`)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl transition-all text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Nutrition</span>
              </div>
              <p className="text-xs text-white/70 mb-2 leading-relaxed h-8 line-clamp-2">
                Health benefits & facts
              </p>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                Read More <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </button>

            <button
              onClick={() => handleExploreAction(`How to identify quality and freshness of ${results.variety.name} when buying`)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl transition-all text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Quality</span>
              </div>
              <p className="text-xs text-white/70 mb-2 leading-relaxed h-8 line-clamp-2">
                How to pick the best {results.variety.name}
              </p>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                check guide <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Detected Defects - Horizontal Scroll */}
      <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100 relative group/container">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-bold text-2xl flex items-center gap-3">
            <AlertCircle className="w-7 h-7 text-orange-600" />
            Detected Defects ({results.areas?.length || 0})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const container = document.getElementById('defects-scroll-container')
                if (container) container.scrollBy({ left: -420, behavior: 'smooth' })
              }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <button
              onClick={() => {
                const container = document.getElementById('defects-scroll-container')
                if (container) container.scrollBy({ left: 420, behavior: 'smooth' })
              }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </div>

        {/* Snap Scrolling Container */}
        <div
          id="defects-scroll-container"
          className="overflow-x-auto pb-8 -mx-8 px-8 flex gap-6 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
          onScroll={(e) => {
            const container = e.currentTarget
            const index = Math.round(container.scrollLeft / 444) // 420px card + 24px gap
            // Optional: Update active dot state here if needed
          }}
        >
          {results.areas?.map((area: any, index: number) => (
            <div
              key={area.id}
              className={`w-[420px] flex-shrink-0 snap-center rounded-2xl border-2 transition-all duration-300 ${selectedDefect === area.id
                ? 'border-apeel-green bg-green-50 shadow-xl scale-[1.02]'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
                }`}
              onClick={() => setSelectedDefect(selectedDefect === area.id ? null : area.id)}
            >
              {/* Card Header with Severity Badge */}
              <div className={`p-6 rounded-t-2xl ${area.severity === 'Critical' ? 'bg-gradient-to-br from-red-50 to-red-100' :
                area.severity === 'Severe' ? 'bg-gradient-to-br from-orange-50 to-orange-100' :
                  area.severity === 'Moderate' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' :
                    'bg-gradient-to-br from-blue-50 to-blue-100'
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">#{index + 1}</span>
                    </div>
                    <div>
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${getSeverityColor(area.severity)}`}>
                        {area.severity}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 font-medium">
                        Severity {area.severity_score || 'N/A'}/10
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 leading-snug">
                  {area.description}
                </h4>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Type</div>
                    <div className="text-sm font-bold text-gray-900 truncate" title={area.defect_type}>{area.defect_type}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Confidence</div>
                    <div className="text-sm font-bold text-emerald-600">{area.confidence}%</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Size</div>
                    <div className="text-sm font-bold text-orange-600">{area.size_percent}%</div>
                  </div>
                </div>

                {/* Cause Section (Auto height) */}
                <div className="flex-1">
                  {area.inferred_cause && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl backdrop-blur-sm relative overflow-hidden h-full">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/30 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-xs font-bold text-blue-900 uppercase opacity-70">Inferred Cause</span>
                        </div>
                        <div className="text-sm text-blue-800 leading-relaxed font-medium">{area.inferred_cause}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Depth & Impact Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {area.depth_inference && (
                    <div className={`flex-1 text-center px-3 py-2 rounded-lg font-medium text-xs ${area.depth_inference === 'Surface only' ? 'bg-green-100 text-green-800 border border-green-300' :
                      area.depth_inference === 'Subsurface' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                      <div className="font-bold uppercase text-[10px] mb-0.5 opacity-70">Depth</div>
                      {area.depth_inference}
                    </div>
                  )}
                  {area.impact_on_shelf_life && (
                    <div className="flex-1 text-center px-3 py-2 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 font-medium text-xs">
                      <div className="font-bold uppercase text-[10px] mb-0.5 opacity-70">Impact</div>
                      {area.impact_on_shelf_life}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Scroll Indicator */}
        {
          results.areas && results.areas.length > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {results.areas.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    const container = document.getElementById('defects-scroll-container')
                    if (container) container.scrollTo({ left: idx * 444, behavior: 'smooth' })
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    // Simple check for active state could be improved with state, 
                    // but for now let's make them all clickable
                    'w-2 bg-gray-300 hover:bg-apeel-green hover:w-4'
                    }`}
                  aria-label={`Go to defect ${idx + 1}`}
                />
              ))}
            </div>
          )
        }
      </div >

      {/* Full Report Panel */}
      < div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white/40" >
        <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
          <Info className="w-7 h-7 text-apeel-green" />
          Full Grading Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Detection */}
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Detection</div>
            <div className={`text-lg font-bold ${getGradeTextColor(results.grading.grade_eu || results.grading.grade)}`}>
              {results.grading.primary_defect} + {results.areas?.length - 1 || 0} minor defects
            </div>
          </div>

          {/* Grade */}
          <div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Final Grade</div>
            <div className={`text-lg font-bold ${getGradeTextColor(results.grading.grade_eu || results.grading.grade)}`}>
              {results.grading.grade_eu || results.grading.grade}
            </div>
          </div>

          {/* Market Destination */}
          {results.market_destination && (
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Market Destination</div>
              <div className="text-lg font-semibold text-gray-900">
                {results.market_destination}
              </div>
            </div>
          )}

          {/* Shelf Life */}
          {results.shelf_life_estimate && (
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Shelf Life Estimate</div>
              <div className="text-lg font-semibold text-gray-900">
                {results.shelf_life_estimate} days
              </div>
            </div>
          )}

          {/* Storage Recommendations */}
          {results.storage_recommendations && (
            <div className="md:col-span-2 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Refrigerator className="w-4 h-4" /> Storage Recommendations
                </div>
                <button
                  onClick={() => fetchTutorial('proper storage and handling best practices')}
                  className="flex items-center gap-2 px-4 py-2 bg-apeel-green/10 text-apeel-green border border-apeel-green/20 rounded-xl hover:bg-apeel-green hover:text-white transition-all text-xs font-bold shadow-sm"
                >
                  <BookOpen className="w-3 h-3" />
                  Learn Best Practices
                </button>
              </div>
              <div className="text-gray-700 leading-relaxed bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  {results.storage_recommendations}
                </div>
              </div>

              {/* Quick Tutorial Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => fetchTutorial('ethylene gas management and fruit separation')}
                  className="px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:border-apeel-green hover:text-apeel-green transition-all text-xs font-bold shadow-sm hover:shadow-md"
                >
                  🍎🍌 Don't Mix These!
                </button>
                <button
                  onClick={() => fetchTutorial('optimal temperature and humidity storage')}
                  className="px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all text-xs font-bold shadow-sm hover:shadow-md"
                >
                  🌡️ Temperature Guide
                </button>
                <button
                  onClick={() => fetchTutorial('shelf life extension techniques')}
                  className="px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all text-xs font-bold shadow-sm hover:shadow-md"
                >
                  ⏰ Extend Shelf Life
                </button>
                <button
                  onClick={() => fetchTutorial('Casablanca climate storage tips')}
                  className="px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all text-xs font-bold shadow-sm hover:shadow-md"
                >
                  ☀️ Humid Climate Tips
                </button>
              </div>
            </div>
          )}

          {/* Root Cause */}
          <div className="md:col-span-2 mt-6">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" /> Root Cause Analysis
            </div>
            <div className="text-gray-700 leading-relaxed bg-white/40 p-6 rounded-2xl border border-white/40 backdrop-blur-sm">
              {results.root_cause}
            </div>
          </div>

          {/* Recommendations */}
          <div className="md:col-span-2 mt-6">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Sorting & Handling
            </div>
            <div className="text-gray-700 leading-relaxed bg-white/40 p-6 rounded-2xl border border-white/40 backdrop-blur-sm">
              {Array.isArray(results.recommendations) ? (
                <ul className="space-y-3">
                  {results.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-apeel-green mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                results.recommendations
              )}
            </div>
          </div>

          {/* Prevention Tips */}
          {results.prevention_tips && (
            <div className="md:col-span-2 mt-6">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Prevention Tips
              </div>
              <div className="text-gray-700 leading-relaxed bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  {results.prevention_tips}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-10 pt-10 border-t border-gray-100/50">
          <div className="bg-gray-50/50 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

            <div className="relative z-10 text-center group">
              <div className="text-3xl font-serif font-bold text-apeel-green mb-1 group-hover:scale-110 transition-transform">{results.variety.confidence}%</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Variety Confidence</div>
            </div>

            <div className="relative z-10 text-center group">
              <div className="text-3xl font-serif font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform">{results.grading.grading_confidence}%</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Grade Confidence</div>
            </div>

            <div className="relative z-10 text-center group">
              <div className="text-3xl font-serif font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform">{results.areas?.length || 0}</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Defects Dectected</div>
            </div>

            <div className="relative z-10 text-center group">
              <div className="text-3xl font-serif font-bold text-apeel-green mb-1 group-hover:scale-110 transition-transform">{results.overall_quality_score}/100</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Global Quality Score</div>
            </div>
          </div>
        </div>
      </div >

      {/* Tutorial Modal */}
      {
        showTutorial && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-apeel-green to-[#1e3a29] text-white p-6 rounded-t-[2rem]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-serif font-bold">
                        {loadingTutorial ? 'Loading Tutorial...' : tutorialData?.title || 'Storage Best Practices'}
                      </h2>
                      <p className="text-white/80 text-sm">Powered by Gemini 3 Flash Preview</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowTutorial(false)
                      setTutorialData(null)
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {loadingTutorial ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-apeel-green border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating personalized tutorial...</p>
                </div>
              ) : tutorialData ? (
                <div className="p-8 space-y-6">
                  {/* Overview */}
                  {tutorialData.overview && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                      <p className="text-gray-700 leading-relaxed">{tutorialData.overview}</p>
                    </div>
                  )}

                  {/* Steps */}
                  {tutorialData.steps && tutorialData.steps.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span className="bg-apeel-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                        Step-by-Step Guide
                      </h3>
                      <div className="space-y-3">
                        {tutorialData.steps.map((step: string, idx: number) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-apeel-green/10 text-apeel-green rounded-full flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {tutorialData.tips && tutorialData.tips.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        💡 Expert Tips
                      </h3>
                      <div className="space-y-2">
                        {tutorialData.tips.map((tip: string, idx: number) => (
                          <div key={idx} className="bg-green-50 border border-green-200 p-3 rounded-xl">
                            <p className="text-gray-700 text-sm leading-relaxed">✓ {tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {tutorialData.warnings && tutorialData.warnings.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        ⚠️ Common Mistakes to Avoid
                      </h3>
                      <div className="space-y-2">
                        {tutorialData.warnings.map((warning: string, idx: number) => (
                          <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded-xl">
                            <p className="text-gray-700 text-sm leading-relaxed">✗ {warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Climate Notes */}
                  {tutorialData.climate_notes && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                      <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                        ☀️ Casablanca Climate Tip
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{tutorialData.climate_notes}</p>
                    </div>
                  )}

                  {/* YouTube Link */}
                  {tutorialData.searchQuery && (
                    <div className="pt-4 border-t border-gray-200">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tutorialData.searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg"
                      >
                        <Play className="w-5 h-5" />
                        Watch Video Tutorials on YouTube
                      </a>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )
      }
    </div >
  )
}
