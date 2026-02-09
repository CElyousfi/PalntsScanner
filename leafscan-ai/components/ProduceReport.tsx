import { useState, useEffect, useRef } from 'react'
import { Scale, Ruler, Eye, TrendingUp, AlertCircle, CheckCircle2, Apple, Info, BookOpen, Play, Maximize2, Clock, Refrigerator, ChefHat, Search, ExternalLink, FileText, Plus } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { useRouter } from 'next/navigation'

interface ProduceReportProps {
  image: string
  results: any
  onClose?: () => void
  scanId?: string
  onCreateNote?: (scanId: string) => void
}

export default function ProduceReport({ image, results, onClose, scanId, onCreateNote }: ProduceReportProps) {
  const [selectedDefect, setSelectedDefect] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
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
        height: imageRef.current.offsetHeight
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

  return (
    <div className="space-y-6">
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
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-apeel-green/5 border border-apeel-green/10 relative overflow-hidden">

          <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
            <div className="p-3 bg-apeel-green text-white rounded-xl shadow-md">
              <Maximize2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-gray-900">Batch Inspection Context</h3>
              <p className="text-sm text-gray-500 font-medium">Holistic analysis of the entire scene</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Scene Description</h4>
              <p className="text-gray-700 leading-relaxed text-sm font-medium">{results.overall_scene}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Batch Summary</h4>
              <p className="text-gray-700 leading-relaxed text-sm font-medium">{results.batch_summary}</p>
            </div>
          </div>

          {/* Batch Stats Widget */}
          {results.batch_statistics && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{results.batch_statistics.total_items}</div>
                <div className="text-[10px] font-bold uppercase text-gray-400">Total Fruit</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 truncate" title={results.batch_statistics.uniformity}>{results.batch_statistics.uniformity}</div>
                <div className="text-[10px] font-bold uppercase text-gray-400">Uniformity</div>
              </div>
              <div className="col-span-2">
                <div className="flex flex-wrap gap-2">
                  {results.batch_statistics.predominant_issues?.map((issue: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg shadow-sm">{issue}</span>
                  ))}
                </div>
                <div className="text-[10px] font-bold uppercase text-gray-400 mt-2">Common Defects</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {onCreateNote && scanId && (
        <div className="flex justify-end">
          <button 
            onClick={() => onCreateNote(scanId)} 
            className="btn-secondary py-3 px-6 text-sm flex items-center gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <FileText className="w-4 h-4" />
            <span>Create Note for this Scan</span>
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image with Defect Highlights */}
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-xl flex items-center gap-2">
              <Apple className="w-6 h-6 text-apeel-green" />
              Surgical Analysis
            </h3>
            {results.demoMode && (
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                Demo Mode
              </span>
            )}
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                title="Zoom Image"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <img
              ref={imageRef}
              src={image}
              alt="Produce"
              className="max-w-full max-h-[600px] w-auto h-auto mx-auto rounded-2xl object-contain"
              onLoad={() => {
                if (imageRef.current) {
                  setImageSize({
                    width: imageRef.current.offsetWidth,
                    height: imageRef.current.offsetHeight
                  })
                }
              }}
            />

            {/* Defect Overlays */}
            {results.areas?.map((area: any) => {
              const cx = area.center_x * imageSize.width
              const cy = area.center_y * imageSize.height
              const r = area.radius * imageSize.width

              return (
                <div
                  key={area.id}
                  className={`absolute border-4 rounded-full cursor-pointer transition-all ${selectedDefect === area.id
                    ? 'border-red-500 bg-red-500/30 scale-110'
                    : area.severity === 'Critical'
                      ? 'border-red-500 bg-red-500/20 hover:bg-red-500/30'
                      : 'border-orange-500 bg-orange-500/20 hover:bg-orange-500/30'
                    }`}
                  style={{
                    left: `${cx - r}px`,
                    top: `${cy - r}px`,
                    width: `${r * 2}px`,
                    height: `${r * 2}px`
                  }}
                  onClick={() => setSelectedDefect(selectedDefect === area.id ? null : area.id)}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg text-xs font-bold border border-gray-200">
                    #{area.id}
                  </div>
                </div>
              )
            })}

            {/* Grade Badge */}
            <div className={`absolute bottom-4 left-4 bg-gradient-to-r ${getGradeColor(results.grading.grade_eu || results.grading.grade)} px-6 py-3 rounded-2xl text-white shadow-xl pointer-events-none`}>
              <div className="text-xs font-bold uppercase tracking-wider opacity-90">Grade</div>
              <div className="text-2xl font-bold">{results.grading.grade_eu || results.grading.grade}</div>
              {results.grading.grade_usda && (
                <div className="text-sm opacity-90">USDA: {results.grading.grade_usda}</div>
              )}
              <div className="text-xs opacity-90">{results.variety.name}</div>
            </div>
          </div>
        </div>

        {/* Right: Grading Details */}
        <div className="space-y-6">
          {/* Consumability Status */}
          <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
            <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-apeel-green" />
              Consumability Assessment
            </h3>

            <div className="grid grid-cols-1 gap-4 mb-4">
              {(() => {
                const score = results.overall_quality_score
                let status = ''
                let icon = null
                let description = ''
                let bgClass = ''
                
                if (score >= 80) {
                  status = '✓ Safe to Eat'
                  description = 'Excellent quality - consume normally'
                  bgClass = 'bg-gradient-to-br from-apeel-green to-green-600 border-green-200'
                } else if (score >= 60) {
                  status = '⚠ Consume Soon'
                  description = 'Acceptable quality - use within 1-2 days'
                  bgClass = 'bg-gradient-to-br from-amber-500 to-orange-600 border-orange-200'
                } else if (score >= 40) {
                  status = '⚠ Poor Quality'
                  description = 'Significant defects - use immediately or discard'
                  bgClass = 'bg-gradient-to-br from-orange-600 to-red-500 border-orange-300'
                } else {
                  status = '✗ Do Not Consume'
                  description = 'Severely degraded - discard immediately'
                  bgClass = 'bg-gradient-to-br from-red-600 to-rose-700 border-red-300'
                }
                
                return (
                  <div className={`rounded-2xl p-6 border shadow-md ${bgClass}`}>
                    <div className="text-xs text-white/80 font-bold uppercase mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Consumability Status
                    </div>
                    <div className="text-4xl font-bold text-white mb-3">
                      {status}
                    </div>
                    <div className="text-sm text-white/90 mb-3">
                      {description}
                    </div>
                    <div className="text-xs text-white/70 border-t border-white/20 pt-3 flex items-center justify-between">
                      <span>Condition Score: {score}/100</span>
                      <span>Confidence: {results.grading.grading_confidence}%</span>
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
                <div className={`mt-4 p-4 rounded-2xl border ${
                  isExpired 
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' 
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <Clock className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold uppercase mb-0.5 ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                        {isExpired ? 'Shelf Life Status' : 'Estimated Shelf Life'}
                      </div>
                      <div className={`text-2xl font-bold ${isExpired ? 'text-red-900' : 'text-blue-900'}`}>
                        {isExpired ? 'Not Suitable for Consumption' : `${shelfLife} days`}
                      </div>
                      <div className={`text-xs mt-1 ${isExpired ? 'text-red-700' : 'text-blue-700'}`}>
                        {isExpired ? 'Discard immediately - severely degraded' : 'Based on current condition and grade'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Primary Defect */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-blue-900 mb-1">Primary Defect</div>
                  <div className="text-sm text-blue-700">
                    {results.grading.primary_defect} • {results.grading.defect_coverage_percent}% coverage
                  </div>
                </div>
              </div>
            </div>

            {/* Color Maturity */}
            <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-green-900 mb-1">Color Maturity</div>
                  <div className="text-sm text-green-700">
                    Score: {results.grading.color_maturity_score}/100 • Optimal for {results.variety.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Ripeness Assessment */}
            {results.assessment && (
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-amber-900 mb-1">Ripeness Assessment</div>
                    <div className="text-sm text-amber-700">
                      {results.assessment.ripeness_stage} • Score: {results.assessment.ripeness_score}/100
                    </div>
                    {results.assessment.texture_analysis && (
                      <div className="text-xs text-amber-600 mt-1 italic">
                        {results.assessment.texture_analysis}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sustainability Impact */}
            {results.sustainability_impact && (
              <div className={`mt-6 p-4 rounded-2xl border ${results.sustainability_impact.includes('Low') ? 'bg-green-50 border-green-100' :
                results.sustainability_impact.includes('Medium') ? 'bg-yellow-50 border-yellow-100' :
                  'bg-red-50 border-red-100'
                }`}>
                <div className="font-bold text-gray-900 mb-1">Sustainability Impact</div>
                <div className="text-sm text-gray-700">{results.sustainability_impact}</div>
              </div>
            )}
          </div>

          {/* Action Buttons - Explore More */}
          <div className="bg-gradient-to-br from-apeel-green to-green-600 rounded-[2rem] p-6 shadow-lg text-white">
            <h3 className="font-serif font-bold text-xl mb-3 flex items-center gap-2">
              <Search className="w-6 h-6" />
              Explore More
            </h3>
            <p className="text-white/90 text-sm mb-4">
              Get expert advice on storage, recipes, and everything about {results.variety.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleExploreAction(`How to store ${results.variety.name} to maximize shelf life and freshness`)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 p-4 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Refrigerator className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">Storage Tips</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-white/80">
                  Optimal storage conditions and preservation methods
                </p>
              </button>

              <button
                onClick={() => handleExploreAction(`Best recipes and cooking ideas using ${results.variety.name}`)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 p-4 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ChefHat className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">Recipe Ideas</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-white/80">
                  Delicious ways to use your {results.variety.name}
                </p>
              </button>

              <button
                onClick={() => handleExploreAction(`Nutritional benefits and health facts about ${results.variety.name}`)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 p-4 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Apple className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">Nutrition Info</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-white/80">
                  Health benefits and nutritional value
                </p>
              </button>

              <button
                onClick={() => handleExploreAction(`How to identify quality and freshness of ${results.variety.name} when buying`)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 p-4 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">Quality Guide</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-white/80">
                  Expert tips for selecting the best produce
                </p>
              </button>
            </div>
          </div>

          {/* Detected Defects - Horizontal Scroll */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif font-bold text-2xl flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-orange-600" />
                Detected Defects ({results.areas?.length || 0})
              </h3>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>Scroll →</span>
              </div>
            </div>

            {/* Horizontal Scrolling Container */}
            <div className="overflow-x-auto pb-4 -mx-8 px-8">
              <div className="flex gap-6 min-w-max">
                {results.areas?.map((area: any, index: number) => (
                  <div
                    key={area.id}
                    className={`w-[420px] flex-shrink-0 rounded-2xl border-2 transition-all ${selectedDefect === area.id
                      ? 'border-apeel-green bg-green-50 shadow-xl'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
                      }`}
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
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">
                        {area.description}
                      </h4>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Type</div>
                          <div className="text-sm font-bold text-gray-900">{area.defect_type}</div>
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

                      {/* Cause Section */}
                      {area.inferred_cause && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                          <div className="text-xs font-bold text-blue-900 uppercase mb-1.5">Inferred Cause</div>
                          <div className="text-sm text-blue-800 leading-relaxed">{area.inferred_cause}</div>
                        </div>
                      )}

                      {/* Depth & Impact Tags */}
                      <div className="flex flex-wrap gap-2">
                        {area.depth_inference && (
                          <div className={`flex-1 text-center px-3 py-2 rounded-lg font-medium text-xs ${area.depth_inference === 'Surface only' ? 'bg-green-100 text-green-800 border border-green-300' :
                            area.depth_inference === 'Subsurface' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                            <div className="font-bold uppercase text-[10px] mb-0.5">Depth</div>
                            {area.depth_inference}
                          </div>
                        )}
                        {area.impact_on_shelf_life && (
                          <div className="flex-1 text-center px-3 py-2 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 font-medium text-xs">
                            <div className="font-bold uppercase text-[10px] mb-0.5">Impact</div>
                            {area.impact_on_shelf_life}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Indicator */}
            {results.areas && results.areas.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {results.areas.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-2 h-2 rounded-full bg-gray-300"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Report Panel */}
      <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100">
        <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
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
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Storage Recommendations</div>
                <button
                  onClick={() => fetchTutorial('proper storage and handling best practices')}
                  className="flex items-center gap-2 px-4 py-2 bg-apeel-green text-white rounded-xl hover:bg-apeel-green/90 transition-all text-sm font-bold shadow-md"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn Best Practices
                </button>
              </div>
              <div className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">
                {results.storage_recommendations}
              </div>

              {/* Quick Tutorial Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => fetchTutorial('ethylene gas management and fruit separation')}
                  className="px-3 py-1.5 bg-white border-2 border-apeel-green text-apeel-green rounded-lg hover:bg-apeel-green hover:text-white transition-all text-xs font-bold"
                >
                  🍎🍌 Don't Mix These!
                </button>
                <button
                  onClick={() => fetchTutorial('optimal temperature and humidity storage')}
                  className="px-3 py-1.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all text-xs font-bold"
                >
                  🌡️ Temperature Guide
                </button>
                <button
                  onClick={() => fetchTutorial('shelf life extension techniques')}
                  className="px-3 py-1.5 bg-white border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition-all text-xs font-bold"
                >
                  ⏰ Extend Shelf Life
                </button>
                <button
                  onClick={() => fetchTutorial('Casablanca climate storage tips')}
                  className="px-3 py-1.5 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-all text-xs font-bold"
                >
                  ☀️ Humid Climate Tips
                </button>
              </div>
            </div>
          )}

          {/* Root Cause */}
          <div className="md:col-span-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Root Cause Analysis</div>
            <div className="text-gray-700 leading-relaxed">
              {results.root_cause}
            </div>
          </div>

          {/* Recommendations */}
          <div className="md:col-span-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Sorting & Handling Recommendations</div>
            <div className="text-gray-700 leading-relaxed">
              {Array.isArray(results.recommendations) ? (
                <ul className="list-disc list-inside space-y-1">
                  {results.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                results.recommendations
              )}
            </div>
          </div>

          {/* Prevention Tips */}
          {results.prevention_tips && (
            <div className="md:col-span-2">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Prevention Tips for Future Crops</div>
              <div className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-xl border border-green-100">
                {results.prevention_tips}
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-apeel-green">{results.variety.confidence}%</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Variety ID</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{results.grading.grading_confidence}%</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Grade Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{results.areas?.length || 0}</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Defects Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-apeel-green">{results.overall_quality_score}/100</div>
            <div className="text-xs text-gray-500 uppercase font-bold">Quality Score</div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
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
      )}
    </div>
  )
}
